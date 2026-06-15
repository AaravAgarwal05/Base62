import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AnalyticsEvent } from "@/lib/queue/analytics-buffer";

// Mock Redis before importing buffer module
const mockRedisClient = {
  lPush: vi.fn(),
  lRange: vi.fn(),
  del: vi.fn(),
};

vi.mock("@/lib/cache/redis", () => ({
  redisClient: mockRedisClient,
}));

vi.mock("@/lib/cache/keys", () => ({
  CACHE_KEYS: {
    analyticsBuffer: "analytics:events",
    url: (code: string) => `url:${code}`,
  },
}));

describe("analytics-buffer", () => {
  let bufferEvent: (event: AnalyticsEvent) => Promise<void>;
  let peekBuffer: () => Promise<AnalyticsEvent[]>;
  let clearBuffer: () => Promise<void>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/lib/queue/analytics-buffer");
    bufferEvent = mod.bufferEvent;
    peekBuffer = mod.peekBuffer;
    clearBuffer = mod.clearBuffer;
  });

  const event: AnalyticsEvent = {
    urlId: 42,
    type: "click",
    timestamp: "2025-06-15T10:00:00.000Z",
  };

  describe("bufferEvent", () => {
    it("pushes JSON stringified event to Redis", async () => {
      mockRedisClient.lPush.mockResolvedValue(1);

      await bufferEvent(event);

      expect(mockRedisClient.lPush).toHaveBeenCalledWith(
        "analytics:events",
        JSON.stringify(event),
      );
    });

    it("throws when Redis push fails", async () => {
      mockRedisClient.lPush.mockRejectedValue(new Error("Redis down"));

      await expect(bufferEvent(event)).rejects.toThrow("Redis down");
    });

    it("can buffer multiple events", async () => {
      mockRedisClient.lPush.mockResolvedValue(2);
      const e2: AnalyticsEvent = { urlId: 7, type: "scan", timestamp: "2025-06-15T11:00:00.000Z" };

      await bufferEvent(event);
      await bufferEvent(e2);

      expect(mockRedisClient.lPush).toHaveBeenCalledTimes(2);
    });
  });

  describe("peekBuffer", () => {
    it("returns empty array when no events", async () => {
      mockRedisClient.lRange.mockResolvedValue([]);

      const result = await peekBuffer();
      expect(result).toEqual([]);
    });

    it("returns events oldest-first", async () => {
      const newer = { ...event, urlId: 99 };
      // Redis lRange returns newest-first (list head = newest)
      mockRedisClient.lRange.mockResolvedValue([
        JSON.stringify(newer),
        JSON.stringify(event),
      ]);

      const result = await peekBuffer();
      // Should be reversed to oldest-first
      expect(result[0].urlId).toBe(42);
      expect(result[1].urlId).toBe(99);
    });

    it("throws on Redis failure", async () => {
      mockRedisClient.lRange.mockRejectedValue(new Error("Connection lost"));

      await expect(peekBuffer()).rejects.toThrow("Connection lost");
    });
  });

  describe("clearBuffer", () => {
    it("deletes the buffer key", async () => {
      mockRedisClient.del.mockResolvedValue(1);

      await clearBuffer();

      expect(mockRedisClient.del).toHaveBeenCalledWith("analytics:events");
    });

    it("throws on Redis failure", async () => {
      mockRedisClient.del.mockRejectedValue(new Error("Delete failed"));

      await expect(clearBuffer()).rejects.toThrow("Delete failed");
    });
  });
});
