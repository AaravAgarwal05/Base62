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
  timestamp?: string
): Promise<void> {
  const ts = timestamp ?? new Date().toISOString();
  const client = getClient();

  if (client) {
    // Production: publish to QStash — redirect critical path stays fast
    await client.publishJSON({
      url: `${process.env.NEXT_PUBLIC_URL}/api/v1/analytics/consume`,
      body: { urlId: Number(urlId), type, timestamp: ts },
    });
  } else {
    // Dev: process synchronously
    await processEvent({ urlId: Number(urlId), type, timestamp: ts });
  }
}

/* ─── Types ─── */
export interface AnalyticsEvent {
  urlId: number;
  type: "click" | "scan";
  timestamp: string;
}

/* ─── Batch processor (used by both consumer and dev fallback) ─── */
export async function processEvent(event: AnalyticsEvent) {
  try {
    // 1. Insert analytics row
    await db.insert(analytics).values({
      urlId: BigInt(event.urlId),
      type: event.type,
      timestamp: new Date(event.timestamp),
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

