import { describe, it, expect } from "vitest";
import { RANGES } from "@/constants/analytics";

describe("analytics constants", () => {
  it("has all 7 range keys", () => {
    const keys = Object.keys(RANGES);
    expect(keys.sort()).toEqual(["15m", "1h", "24h", "30d", "3h", "7d", "90d"]);
  });

  it("each range has required fields", () => {
    for (const [, cfg] of Object.entries(RANGES)) {
      expect(cfg).toHaveProperty("label");
      expect(cfg).toHaveProperty("humanLabel");
      expect(cfg).toHaveProperty("windowMs");
      expect(cfg).toHaveProperty("bucketMs");
      expect(cfg).toHaveProperty("labelFormat");
    }
  });

  it("windowMs decreases for shorter ranges", () => {
    expect(RANGES["15m"].windowMs).toBeLessThan(RANGES["1h"].windowMs);
    expect(RANGES["1h"].windowMs).toBeLessThan(RANGES["24h"].windowMs);
    expect(RANGES["24h"].windowMs).toBeLessThan(RANGES["7d"].windowMs);
  });

  it("bucket sizes are consistent with window sizes", () => {
    // 15m range should have exactly 15 minute buckets
    expect(RANGES["15m"].windowMs / RANGES["15m"].bucketMs).toBe(15);
    // 24h with 1h buckets = 24 buckets
    expect(RANGES["24h"].windowMs / RANGES["24h"].bucketMs).toBe(24);
    // 7d with 1d buckets = 7 buckets
    expect(RANGES["7d"].windowMs / RANGES["7d"].bucketMs).toBe(7);
  });
});
