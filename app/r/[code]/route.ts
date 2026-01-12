import { NextRequest, NextResponse } from "next/server";
import { decodeBase62 } from "../../../lib/encoding/base62";
import { deobfuscate } from "../../../lib/encoding/obfuscation";
import { db } from "../../../lib/db";
import { urls, analytics } from "../../../lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { redisClient } from "../../../lib/cache/redis";

async function trackAnalytics(databaseId: bigint, type: "click" | "scan") {
  try {
    console.log(`[Tracking] Start tracking for id=${databaseId}, type=${type}`);
    // 1. Increment generic counter
    if (type === "click") {
      await db
        .update(urls)
        .set({ totalClicks: sql`${urls.totalClicks} + 1` })
        .where(eq(urls.id, databaseId));
    } else {
      await db
        .update(urls)
        .set({ totalScans: sql`${urls.totalScans} + 1` })
        .where(eq(urls.id, databaseId));
    }

    // 2. Add time-series entry
    await db.insert(analytics).values({
      urlId: databaseId,
      type: type,
    });
    console.log(`[Tracking] Success for id=${databaseId}`);
  } catch (e) {
    console.error("[Tracking] Analytics error:", e);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const searchParams = request.nextUrl.searchParams;
  const source = searchParams.get("source");
  const type = source === "qr" ? "scan" : "click";

  // Decode ID first to use for analytics (fast, no DB)
  let databaseId: bigint;
  try {
    const obfuscatedId = decodeBase62(code);
    databaseId = deobfuscate(obfuscatedId);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid code format." },
      { status: 400 }
    );
  }

  // Fire and forget analytics (or await if reliability is critical)
  // In Vercel serverless, we should ideally use context.waitUntil, but that's for edge.
  // For Node runtime, unawaited promises *might* complete, but awaiting ensures it.
  // To keep it fast, we could assume Redis is the primary path and await analytics there.
  const trackPromise = trackAnalytics(databaseId, type);

  try {
    const cached = await redisClient.get(`url:${code}`);
    if (cached) {
      await trackPromise; // Ensure tracking completes
      return NextResponse.redirect(cached);
    }
  } catch (err) {
    console.error("Redis cache error:", err);
  }

  const result = await db
    .select({ longUrl: urls.longUrl })
    .from(urls)
    .where(eq(urls.id, databaseId));

  if (result.length === 0) {
    return NextResponse.json({ error: "URL not found." }, { status: 404 });
  }

  const longUrl = result[0].longUrl;

  redisClient
    .set(`url:${code}`, longUrl, {
      EX: 60 * 60 * 24,
    })
    .catch((err) => console.error("Redis set error:", err));

  // If we didn't hit cache, we still need to wait for tracking
  // (actually we started it earlier)
  await trackPromise;

  return NextResponse.redirect(longUrl);
}
