import { describe, it, expect } from "vitest";
import { RESERVED_SLUGS } from "@/constants/reserved-slugs";

describe("reserved slugs", () => {
  it("is a Set", () => {
    expect(RESERVED_SLUGS).toBeInstanceOf(Set);
  });

  it("contains common reserved words", () => {
    expect(RESERVED_SLUGS.has("api")).toBe(true);
    expect(RESERVED_SLUGS.has("admin")).toBe(true);
    expect(RESERVED_SLUGS.has("login")).toBe(true);
    expect(RESERVED_SLUGS.has("r")).toBe(true);
    expect(RESERVED_SLUGS.has("v1")).toBe(true);
  });

  it("does not contain typical user slugs", () => {
    expect(RESERVED_SLUGS.has("my-cool-link")).toBe(false);
    expect(RESERVED_SLUGS.has("hello-world")).toBe(false);
    expect(RESERVED_SLUGS.has("project2025")).toBe(false);
  });

  it("has all lowercase entries", () => {
    for (const slug of RESERVED_SLUGS) {
      expect(slug).toBe(slug.toLowerCase());
    }
  });
});
