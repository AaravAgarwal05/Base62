import { describe, it, expect, beforeAll } from "vitest";

// getEnv reads from process.env; setup.ts sets required vars
// We test it in isolation because the module singleton caches after first call.

describe("env config", () => {
  let getEnv: () => Record<string, string>;

  beforeAll(async () => {
    // Dynamic import so we get a fresh module reference each time.
    // The singleton caches; this test runs first among env tests.
    const mod = await import("@/lib/config/env");
    getEnv = mod.getEnv;
  });

  it("parses valid env vars successfully", () => {
    const env = getEnv();
    expect(env.NEXT_PUBLIC_URL).toBe("http://localhost:3000");
    expect(env.SERVER_ID).toBe("test-server");
    expect(env.COUNTER_START).toBe("100000");
    expect(env.COUNTER_END).toBe("999999");
  });

  it("has DATABASE_URL as required string", () => {
    const env = getEnv();
    expect(env.DATABASE_URL).toContain("postgresql://");
  });

  it("optional fields are undefined or set", () => {
    // In test setup, optional env vars like REDIS_URL are not set
    const env = getEnv();
    // These should be undefined (setup.ts doesn't set them)
    expect(env.REDIS_URL).toBeUndefined();
    expect(env.QSTASH_TOKEN).toBeUndefined();
  });
});
