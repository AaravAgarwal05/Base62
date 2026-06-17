import { NextRequest, NextResponse } from "next/server";
import { decodeBase62 } from "@/lib/encoding/base62";
import { deobfuscate } from "@/lib/encoding/obfuscation";
import { db } from "@/lib/db";
import { urls, analytics } from "@/lib/db/schema";
import { eq, desc, sql, and, isNotNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  // Try slug lookup first
  const slugMatch = await db
    .select({ id: urls.id })
    .from(urls)
    .where(eq(urls.slug, code))
    .limit(1);

  let databaseId: bigint;

  if (slugMatch.length > 0) {
    databaseId = slugMatch[0].id;
  } else {
    // Fallback to legacy ID-based decode
    try {
      const obfuscatedId = decodeBase62(code);
      databaseId = deobfuscate(obfuscatedId);
    } catch {
      return NextResponse.json(
        { error: "Invalid code format." },
        { status: 400 },
      );
    }
  }

  try {
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
      return NextResponse.json({ error: "URL not found." }, { status: 404 });
    }

    /* ─── History (time-series) ─── */
    const history = await db
      .select({
        type: analytics.type,
        timestamp: analytics.timestamp,
      })
      .from(analytics)
      .where(eq(analytics.urlId, databaseId))
      .orderBy(desc(analytics.timestamp))
      .limit(5000);

    /* ─── Grouped stats ─── */
    const baseFilter = eq(analytics.urlId, databaseId);

    const [countries, cities, referrers, browsers, oss, devices] =
      await Promise.all([
        db
          .select({
            country: analytics.country,
            count: sql<number>`count(*)::int`,
          })
          .from(analytics)
          .where(and(baseFilter, isNotNull(analytics.country)))
          .groupBy(analytics.country)
          .orderBy(desc(sql`count(*)`))
          .limit(50),
        db
          .select({
            city: analytics.city,
            count: sql<number>`count(*)::int`,
          })
          .from(analytics)
          .where(and(baseFilter, isNotNull(analytics.city)))
          .groupBy(analytics.city)
          .orderBy(desc(sql`count(*)`))
          .limit(50),
        db
          .select({
            referrer: analytics.referrer,
            count: sql<number>`count(*)::int`,
          })
          .from(analytics)
          .where(and(baseFilter, isNotNull(analytics.referrer)))
          .groupBy(analytics.referrer)
          .orderBy(desc(sql`count(*)`))
          .limit(50),
        db
          .select({
            browser: analytics.browser,
            count: sql<number>`count(*)::int`,
          })
          .from(analytics)
          .where(and(baseFilter, isNotNull(analytics.browser)))
          .groupBy(analytics.browser)
          .orderBy(desc(sql`count(*)`))
          .limit(50),
        db
          .select({
            os: analytics.os,
            count: sql<number>`count(*)::int`,
          })
          .from(analytics)
          .where(and(baseFilter, isNotNull(analytics.os)))
          .groupBy(analytics.os)
          .orderBy(desc(sql`count(*)`))
          .limit(50),
        db
          .select({
            device: analytics.device,
            count: sql<number>`count(*)::int`,
          })
          .from(analytics)
          .where(and(baseFilter, isNotNull(analytics.device)))
          .groupBy(analytics.device)
          .orderBy(desc(sql`count(*)`))
          .limit(50),
      ]);

    /* ─── IPs (with geo context) ─── */
    const ips = await db
      .select({
        ip: analytics.ip,
        count: sql<number>`count(*)::int`,
        country: analytics.country,
        city: analytics.city,
        region: analytics.region,
      })
      .from(analytics)
      .where(and(baseFilter, isNotNull(analytics.ip)))
      .groupBy(analytics.ip, analytics.country, analytics.city, analytics.region)
      .orderBy(desc(sql`count(*)`))
      .limit(100);

    /* ─── Recent events feed (last 50) ─── */
    const recentEvents = await db
      .select({
        type: analytics.type,
        timestamp: analytics.timestamp,
        ip: analytics.ip,
        country: analytics.country,
        city: analytics.city,
        referrer: analytics.referrer,
        browser: analytics.browser,
        os: analytics.os,
        device: analytics.device,
      })
      .from(analytics)
      .where(baseFilter)
      .orderBy(desc(analytics.timestamp))
      .limit(50);

    return NextResponse.json({
      ...urlData[0],
      history,
      stats: { countries, cities, referrers, browsers, oss, devices, ips },
      recentEvents,
    });
  } catch (error: any) {
    console.error("[Analytics API] Database error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
