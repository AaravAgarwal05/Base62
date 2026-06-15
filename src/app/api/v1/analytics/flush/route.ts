import { NextRequest, NextResponse } from "next/server";
import { peekBuffer, clearBuffer } from "@/lib/queue/analytics-buffer";
import { db } from "@/lib/db";
import { urls, analytics } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(_request: NextRequest) {
  try {
    /* ─── Read buffer (oldest first) ─── */
    const events = await peekBuffer();
    if (events.length === 0) {
      return NextResponse.json({ processed: 0 });
    }

    console.log(`[Analytics Flush] Processing ${events.length} events`);

    /* ─── Batch insert analytics rows ─── */
    await db.insert(analytics).values(
      events.map((e) => ({
        urlId: BigInt(e.urlId),
        type: e.type,
        timestamp: new Date(e.timestamp),
      }))
    );

    /* ─── Batch update counters per urlId ─── */
    const clickCounts = new Map<bigint, number>();
    const scanCounts = new Map<bigint, number>();

    for (const e of events) {
      const id = BigInt(e.urlId);
      if (e.type === "click") {
        clickCounts.set(id, (clickCounts.get(id) ?? 0) + 1);
      } else {
        scanCounts.set(id, (scanCounts.get(id) ?? 0) + 1);
      }
    }

    for (const [id, count] of clickCounts) {
      await db
        .update(urls)
        .set({ totalClicks: sql`${urls.totalClicks} + ${count}` })
        .where(eq(urls.id, id));
    }
    for (const [id, count] of scanCounts) {
      await db
        .update(urls)
        .set({ totalScans: sql`${urls.totalScans} + ${count}` })
        .where(eq(urls.id, id));
    }

    /* ─── Clear buffer only after successful DB flush ─── */
    await clearBuffer();

    console.log(
      `[Analytics Flush] Done — ${events.length} events, ${clickCounts.size} click, ${scanCounts.size} scan`
    );

    return NextResponse.json({
      processed: events.length,
      clickUpdates: clickCounts.size,
      scanUpdates: scanCounts.size,
    });
  } catch (error) {
    // Buffer NOT cleared — events remain for next retry
    console.error("[Analytics Flush] Error:", error);
    return NextResponse.json(
      { error: "Flush failed — events remain in Redis" },
      { status: 500 }
    );
  }
}
