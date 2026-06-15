import { describe, it, expect } from "vitest";
import { encodeBase62, decodeBase62 } from "@/lib/encoding/base62";

describe("base62", () => {
  it("encodes 0 as '0'", () => {
    expect(encodeBase62(0n)).toBe("0");
  });

  it("roundtrips small numbers", () => {
    const cases = [1n, 10n, 61n, 100n, 999n, 10000n];
    for (const n of cases) {
      expect(decodeBase62(encodeBase62(n))).toBe(n);
    }
  });

  it("roundtrips large numbers", () => {
    const cases = [123456789n, 2n ** 40n, 2n ** 52n - 1n];
    for (const n of cases) {
      expect(decodeBase62(encodeBase62(n))).toBe(n);
    }
  });

  it("encodes BigInt values correct length", () => {
    const encoded = encodeBase62(999999999999n);
    expect(encoded.length).toBeGreaterThanOrEqual(5);
  });

  it("decodes back from known string", () => {
    // "1" in base62 is still 1
    expect(decodeBase62("1")).toBe(1n);
    // Alphabet is 0-9A-Za-z → "Z" is 10+25 = 35, "z" is 10+26+25 = 61
    expect(decodeBase62("Z")).toBe(35n);
    expect(decodeBase62("z")).toBe(61n);
  });

  it("throws on invalid characters", () => {
    expect(() => decodeBase62("hello!")).toThrow();
    expect(() => decodeBase62("hello world")).toThrow();
  });

  it("handles leading zeros (value 0)", () => {
    // Only 0 should encode to "0"; encoded strings may have leading zeros
    // from the algorithm — verify roundtrip holds
    const encoded = encodeBase62(0n);
    const decoded = decodeBase62(encoded);
    expect(decoded).toBe(0n);
  });
});
