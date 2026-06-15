import { describe, it, expect } from "vitest";
import { formatBucketLabel, timeAgo } from "@/lib/utils/time";

describe("formatBucketLabel", () => {
  it("formats minute label as HH:MM", () => {
    const d = new Date(2025, 5, 15, 14, 30, 0);
    expect(formatBucketLabel(d, "minute")).toBe("14:30");
  });

  it("pads single-digit hours and minutes", () => {
    const d = new Date(2025, 0, 1, 9, 5, 0);
    expect(formatBucketLabel(d, "minute")).toBe("09:05");
  });

  it("formats hour label as HH:00", () => {
    const d = new Date(2025, 5, 15, 8, 45, 0);
    expect(formatBucketLabel(d, "hour")).toBe("08:00");
  });

  it("formats day label as Mon D", () => {
    const d = new Date(2025, 0, 15); // Jan 15
    expect(formatBucketLabel(d, "day")).toBe("Jan 15");
  });

  it("handles month boundaries correctly", () => {
    const d = new Date(2025, 11, 31); // Dec 31
    expect(formatBucketLabel(d, "day")).toBe("Dec 31");
  });
});

describe("timeAgo", () => {
  it('returns "just now" for < 5 seconds', () => {
    const d = new Date(Date.now() - 3000);
    expect(timeAgo(d)).toBe("just now");
  });

  it('returns seconds format for < 60s', () => {
    const d = new Date(Date.now() - 30000);
    expect(timeAgo(d)).toBe("30s ago");
  });

  it('returns minutes format for < 60m', () => {
    const d = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeAgo(d)).toBe("5m ago");
  });

  it('returns hours format for < 24h', () => {
    const d = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(timeAgo(d)).toBe("3h ago");
  });

  it('returns days format for >= 24h', () => {
    const d = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(timeAgo(d)).toBe("2d ago");
  });
});
