import { NextRequest, NextResponse } from "next/server";
import { decodeBase62 } from "@/lib/encoding/base62";
import { deobfuscate } from "@/lib/encoding/obfuscation";
import { db } from "@/lib/db";
import { urls } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redisClient } from "@/lib/cache/redis";
import { CACHE_KEYS } from "@/lib/cache/keys";
import { publishAnalyticsEvent } from "@/lib/queue/analytics-publisher";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const searchParams = request.nextUrl.searchParams;
  const source = searchParams.get("source");
  const type = source === "qr" ? "scan" : "click";

  /* ─── Extract request context for analytics ─── */
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;
  const userAgent = request.headers.get("user-agent") ?? null;
  const referrer = request.headers.get("referer") ?? null;
  const geo = (request as any).geo ?? {};
  const analyticsCtx = {
    ip,
    userAgent,
    referrer,
    country: geo?.country ?? null,
    city: geo?.city ?? null,
    region: geo?.region ?? null,
  };

  // Try slug lookup first (with cache)
  try {
    const slugCacheKey = `slug:${code}`;
    const slugCached = await redisClient.get(slugCacheKey);
    if (slugCached) {
      publishAnalyticsEvent(BigInt(slugCached.split("|")[0]), type, undefined, analyticsCtx).catch(
        () => {},
      );
      return NextResponse.redirect(slugCached.split("|")[1]);
    }
  } catch {
    // cache miss — continue
  }

  const slugResult = await db
    .select({ id: urls.id, longUrl: urls.longUrl })
    .from(urls)
    .where(eq(urls.slug, code))
    .limit(1);

  if (slugResult.length > 0) {
    const { id, longUrl } = slugResult[0];

    // Warm slug cache
    redisClient
      .set(`slug:${code}`, `${id}|${longUrl}`, { EX: 60 * 60 * 24 })
      .catch(() => {});

    // Fire-and-forget analytics
    publishAnalyticsEvent(id, type, undefined, analyticsCtx).catch(() => {});

    return NextResponse.redirect(longUrl);
  }

  // Fallback to ID-based lookup (legacy codes)
  let databaseId: bigint;
  try {
    const obfuscatedId = decodeBase62(code);
    databaseId = deobfuscate(obfuscatedId);
  } catch {
    return NextResponse.json(
      { error: "Invalid code format." },
      { status: 400 },
    );
  }

  const trackPromise = publishAnalyticsEvent(databaseId, type, undefined, analyticsCtx);

  try {
    const cached = await redisClient.get(CACHE_KEYS.url(code));
    if (cached) {
      await trackPromise;
      return NextResponse.redirect(cached);
    }
  } catch {
    // cache miss
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
    .set(CACHE_KEYS.url(code), longUrl, { EX: 60 * 60 * 24 })
    .catch(() => {});

  await trackPromise;
  return NextResponse.redirect(longUrl);
}
