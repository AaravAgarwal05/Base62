import { redisClient } from "@/lib/cache/redis";
import { CACHE_KEYS } from "@/lib/cache/keys";

const BUFFER_KEY = CACHE_KEYS.analyticsBuffer;

export interface AnalyticsEvent {
  urlId: number;
  type: "click" | "scan";
  timestamp: string;

  /* ─── Optional request context ─── */
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
    return raw.reverse().map((s) => JSON.parse(s) as AnalyticsEvent);
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
