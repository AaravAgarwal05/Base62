import { NextRequest, NextResponse } from "next/server";
import { decodeBase62 } from "../../../../lib/encoding/base62";
import { deobfuscate } from "../../../../lib/encoding/obfuscation";
import { db } from "../../../../lib/db";
import { urls, analytics } from "../../../../lib/db/schema";
import { eq, desc, and, gt } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  let databaseId: bigint;
  try {
    const obfuscatedId = decodeBase62(code);
    databaseId = deobfuscate(obfuscatedId);
    console.log(`[Analytics API] fetch for code=${code}, dbId=${databaseId}`);
  } catch (error) {
    console.error("[Analytics API] Decode error:", error);
    return NextResponse.json(
      { error: "Invalid code format." },
      { status: 400 }
    );
  }

  try {
    // 1. Get totals
    const urlData = await db
      .select({
        longUrl: urls.longUrl,
        totalClicks: urls.totalClicks,
        totalScans: urls.totalScans,
        createdAt: urls.createdAt,
      })
      .from(urls)
      .where(eq(urls.id, databaseId));

    if (urlData.length === 0) {
      console.log(`[Analytics API] URL not found for id=${databaseId}`);
      return NextResponse.json({ error: "URL not found." }, { status: 404 });
    }

    // 2. Get history (Fetch all, filter in client/memory to avoid timezone mismatch)
    const history = await db
      .select({
        type: analytics.type,
        timestamp: analytics.timestamp,
      })
      .from(analytics)
      .where(eq(analytics.urlId, databaseId))
      .orderBy(desc(analytics.timestamp));

    console.log(`[Analytics API] Success. History count=${history.length}`);

    return NextResponse.json({
      ...urlData[0],
      history,
    });
  } catch (error: any) {
    console.error("[Analytics API] Database error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
