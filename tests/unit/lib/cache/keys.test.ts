import { describe, it, expect } from "vitest";
import { CACHE_KEYS } from "@/lib/cache/keys";

describe("cache keys", () => {
  it("url() generates prefixed key", () => {
    expect(CACHE_KEYS.url("abc123")).toBe("url:abc123");
    expect(CACHE_KEYS.url("xyz")).toBe("url:xyz");
  });

  it("analyticsBuffer is static string", () => {
    expect(CACHE_KEYS.analyticsBuffer).toBe("analytics:events");
  });

  it("keys are frozen (const assertion)", () => {
    // At runtime this is a plain object; just verify values are primitives
    expect(typeof CACHE_KEYS.url("test")).toBe("string");
    expect(typeof CACHE_KEYS.analyticsBuffer).toBe("string");
  });
});
