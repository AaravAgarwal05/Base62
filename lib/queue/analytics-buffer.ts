import { redisClient } from "../cache/redis";

const BUFFER_KEY = "analytics:events";

export interface AnalyticsEvent {
  urlId: number;
  type: "click" | "scan";
  timestamp: string;
}

/* ─── Buffer event in Redis ─── */
export async function bufferEvent(event: AnalyticsEvent): Promise<void> {
  try {
    await redisClient.lPush(BUFFER_KEY, JSON.stringify(event));
  } catch (e) {
    console.error("[Analytics Buffer] Redis push failed:", e);
    throw e;
  }
}

/* ─── Read all buffered events (oldest first) without deleting ─── */
export async function peekBuffer(): Promise<AnalyticsEvent[]> {
  try {
    const raw = await redisClient.lRange(BUFFER_KEY, 0, -1);
    if (!raw || raw.length === 0) return [];
    // Reverse so oldest events come first
    return raw
      .reverse()
      .map((s) => JSON.parse(s) as AnalyticsEvent);
  } catch (e) {
    console.error("[Analytics Buffer] Peek failed:", e);
    throw e;
  }
}

/* ─── Clear entire buffer (call only after successful DB flush) ─── */
export async function clearBuffer(): Promise<void> {
  try {
    await redisClient.del(BUFFER_KEY);
  } catch (e) {
    console.error("[Analytics Buffer] Clear failed:", e);
    throw e;
  }
}
