import { describe, it, expect } from "vitest";
import { RATE_LIMITS } from "@/constants/rate-limit";

describe("rate-limit constants", () => {
  it("has shorten scope", () => {
    expect(RATE_LIMITS.shorten).toBeDefined();
    expect(RATE_LIMITS.shorten.max).toBe(10);
    expect(RATE_LIMITS.shorten.windowMs).toBe(60_000);
  });

  it("has analytics scope", () => {
    expect(RATE_LIMITS.analytics).toBeDefined();
    expect(RATE_LIMITS.analytics.max).toBe(30);
    expect(RATE_LIMITS.analytics.windowMs).toBe(60_000);
  });

  it("all scopes have required fields", () => {
    for (const [, cfg] of Object.entries(RATE_LIMITS)) {
      expect(cfg).toHaveProperty("windowMs");
      expect(cfg).toHaveProperty("max");
      expect(typeof cfg.windowMs).toBe("number");
      expect(typeof cfg.max).toBe("number");
    }
  });
});
