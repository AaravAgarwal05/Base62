import { describe, it, expect } from "vitest";
import { obfuscate, deobfuscate } from "@/lib/encoding/obfuscation";

describe("obfuscation", () => {
  it("roundtrips small IDs", () => {
    const cases = [1n, 10n, 100n, 1000n];
    for (const id of cases) {
      expect(deobfuscate(obfuscate(id))).toBe(id);
    }
  });

  it("roundtrips large IDs (within MOD range)", () => {
    // MOD = 62^6 = 56800235584, so IDs must be in [0, MOD)
    const cases = [2n ** 30n, 50000000000n, 56800235583n];
    for (const id of cases) {
      expect(deobfuscate(obfuscate(id))).toBe(id);
    }
  });

  it("produces different output for sequential inputs", () => {
    const a = obfuscate(100n);
    const b = obfuscate(101n);
    expect(a).not.toBe(b);
  });

  it("scrambles values (output ≠ input)", () => {
    const id = 42n;
    expect(obfuscate(id)).not.toBe(id);
  });
});
