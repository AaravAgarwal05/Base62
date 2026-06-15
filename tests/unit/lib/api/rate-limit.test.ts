import { describe, it, expect, vi, beforeEach } from "vitest";
import { RateLimitError } from "@/lib/api/errors";

// Mock Redis
const mockRedisClient = {
  incr: vi.fn(),
  expire: vi.fn(),
};

vi.mock("@/lib/cache/redis", () => ({
  redisClient: mockRedisClient,
}));

describe("rate-limit", () => {
  let checkRateLimit: any;
  let applyRateLimit: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/lib/api/rate-limit");
    checkRateLimit = mod.checkRateLimit;
    applyRateLimit = mod.applyRateLimit;
  });

  describe("checkRateLimit", () => {
    it("returns remaining on first request", async () => {
      mockRedisClient.incr.mockResolvedValue(1);
      mockRedisClient.expire.mockResolvedValue(true);

      const result = await checkRateLimit("shorten", "1.2.3.4");
      expect(result).not.toBeNull();
      expect(result!.remaining).toBe(9);
      expect(result!.reset).toBeGreaterThan(0);
    });

    it("decrements remaining on each request", async () => {
      mockRedisClient.incr.mockResolvedValue(5);
      mockRedisClient.expire.mockResolvedValue(true);

      const result = await checkRateLimit("shorten", "1.2.3.4");
      expect(result!.remaining).toBe(5);
    });

    it("sets expire on first request (count=1)", async () => {
      mockRedisClient.incr.mockResolvedValue(1);
      mockRedisClient.expire.mockResolvedValue(true);

      await checkRateLimit("shorten", "1.2.3.4");

      expect(mockRedisClient.expire).toHaveBeenCalledWith(
        expect.stringContaining("ratelimit:shorten:"),
        60, // windowMs / 1000
      );
    });

    it("does not set expire on subsequent requests", async () => {
      mockRedisClient.incr.mockResolvedValue(3);
      mockRedisClient.expire.mockResolvedValue(true);

      await checkRateLimit("shorten", "1.2.3.4");

      expect(mockRedisClient.expire).not.toHaveBeenCalled();
    });

    it("throws RateLimitError when exceeded", async () => {
      mockRedisClient.incr.mockResolvedValue(11); // max=10

      await expect(
        checkRateLimit("shorten", "1.2.3.4"),
      ).rejects.toThrow(RateLimitError);
    });

    it("returns null when Redis is down (fail open)", async () => {
      mockRedisClient.incr.mockRejectedValue(new Error("Connection refused"));

      const result = await checkRateLimit("shorten", "1.2.3.4");
      expect(result).toBeNull();
    });

    it("uses different keys for different scopes", async () => {
      mockRedisClient.incr.mockResolvedValue(1);
      mockRedisClient.expire.mockResolvedValue(true);

      await checkRateLimit("shorten", "1.2.3.4");

      expect(mockRedisClient.incr).toHaveBeenCalledWith(
        expect.stringContaining("ratelimit:shorten:"),
      );
    });

    it("uses different keys for different identifiers", async () => {
      mockRedisClient.incr.mockResolvedValue(1);
      mockRedisClient.expire.mockResolvedValue(true);

      await checkRateLimit("shorten", "user-a");
      await checkRateLimit("shorten", "user-b");

      const keyA = mockRedisClient.incr.mock.calls[0][0];
      const keyB = mockRedisClient.incr.mock.calls[1][0];
      expect(keyA).not.toBe(keyB);
    });
  });

  describe("applyRateLimit", () => {
    it("returns rate limit headers on success", async () => {
      mockRedisClient.incr.mockResolvedValue(1);
      mockRedisClient.expire.mockResolvedValue(true);

      const headers = await applyRateLimit("shorten", "1.2.3.4");

      expect(headers["X-RateLimit-Limit"]).toBe("10");
      expect(headers["X-RateLimit-Remaining"]).toBe("9");
      expect(headers["X-RateLimit-Reset"]).toBeDefined();
    });

    it("returns empty object when Redis unavailable", async () => {
      mockRedisClient.incr.mockRejectedValue(new Error("Timeout"));

      const headers = await applyRateLimit("shorten", "1.2.3.4");
      expect(headers).toEqual({});
    });
  });
});
