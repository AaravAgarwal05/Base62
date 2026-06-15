import { describe, it, expect } from "vitest";
import { analyticsEventSchema } from "@/lib/validation/analytics";

describe("analytics validation schema", () => {
  it("accepts valid click event with timestamp", () => {
    const result = analyticsEventSchema.safeParse({
      urlId: 1,
      type: "click",
      timestamp: "2025-06-15T10:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid scan event without timestamp", () => {
    const result = analyticsEventSchema.safeParse({
      urlId: 5,
      type: "scan",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative urlId", () => {
    const result = analyticsEventSchema.safeParse({
      urlId: -1,
      type: "click",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero urlId", () => {
    const result = analyticsEventSchema.safeParse({
      urlId: 0,
      type: "click",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = analyticsEventSchema.safeParse({
      urlId: 1,
      type: "hover",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string timestamp", () => {
    const result = analyticsEventSchema.safeParse({
      urlId: 1,
      type: "click",
      timestamp: 12345,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid datetime format", () => {
    const result = analyticsEventSchema.safeParse({
      urlId: 1,
      type: "click",
      timestamp: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("string timestamp without datetime format fails validation", () => {
    const result = analyticsEventSchema.safeParse({
      urlId: 1,
      type: "click",
      timestamp: "hello",
    });
    expect(result.success).toBe(false);
  });
});
