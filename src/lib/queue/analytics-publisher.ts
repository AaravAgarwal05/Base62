import { Client } from "@upstash/qstash";
import { db } from "@/lib/db";
import { urls, analytics } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

const QSTASH_TOKEN = process.env.QSTASH_TOKEN;

/* ─── QStash client (null in dev) ─── */
function getClient(): Client | null {
  if (!QSTASH_TOKEN) return null;
  return new Client({ token: QSTASH_TOKEN });
}

/* ─── Public API ─── */
export async function publishAnalyticsEvent(
  urlId: bigint,
  type: "click" | "scan",
  timestamp?: string,
  context?: {
    ip?: string | null;
    userAgent?: string | null;
    referrer?: string | null;
    country?: string | null;
    city?: string | null;
    region?: string | null;
  }
): Promise<void> {
  const ts = timestamp ?? new Date().toISOString();
  const client = getClient();

  // Parse UA server-side if available
  let browser: string | null = null;
  let os: string | null = null;
  let device: string | null = null;
  if (context?.userAgent) {
    try {
      const uaModule = await import("ua-parser-js");
      const UAParser = (uaModule.default ?? uaModule) as any;
      const parser = new UAParser(context.userAgent);
      browser = parser.getBrowser().name ?? null;
      os = parser.getOS().name ?? null;
      device = parser.getDevice().type ?? null;
    } catch {
      // silent
    }
  }

  const event = {
    urlId: Number(urlId),
    type,
    timestamp: ts,
    ip: context?.ip ?? null,
    userAgent: context?.userAgent ?? null,
    referrer: context?.referrer ?? null,
    country: context?.country ?? null,
    city: context?.city ?? null,
    region: context?.region ?? null,
    browser,
    os,
    device,
  };

  if (client) {
    // Production: publish to QStash
    await client.publishJSON({
      url: `${process.env.NEXT_PUBLIC_URL}/api/v1/analytics/consume`,
      body: event,
    });
  } else {
    // Dev: process synchronously
    await processEvent(event);
  }
}

/* ─── Types ─── */
export interface AnalyticsEvent {
  urlId: number;
  type: "click" | "scan";
  timestamp: string;
  ip?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  country?: string | null;
  city?: string | null;
  region?: string | null;
  browser?: string | null;
  os?: string | null;
  device?: string | null;
}

/* ─── Batch processor (used by both consumer and dev fallback) ─── */
export async function processEvent(event: AnalyticsEvent) {
  try {
    // 1. Insert analytics row
    await db.insert(analytics).values({
      urlId: BigInt(event.urlId),
      type: event.type,
      timestamp: new Date(event.timestamp),
      ip: event.ip ?? null,
      userAgent: event.userAgent ?? null,
      referrer: event.referrer ?? null,
      country: event.country ?? null,
      city: event.city ?? null,
      region: event.region ?? null,
      browser: event.browser ?? null,
      os: event.os ?? null,
      device: event.device ?? null,
    });

    // 2. Update counter
    const col =
      event.type === "click"
        ? { totalClicks: sql`${urls.totalClicks} + 1` }
        : { totalScans: sql`${urls.totalScans} + 1` };

    await db.update(urls).set(col).where(eq(urls.id, BigInt(event.urlId)));
  } catch (e) {
    console.error("[Analytics Consumer] Failed:", e);
    throw e; // QStash will retry
  }
}
