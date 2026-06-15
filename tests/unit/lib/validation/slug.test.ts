import { describe, it, expect } from "vitest";
import { slugSchema } from "@/lib/validation/slug";

describe("slug validation", () => {
  it("accepts valid alphanumeric slug", () => {
    const result = slugSchema.safeParse("my-link");
    expect(result.success).toBe(true);
  });

  it("accepts slug with numbers", () => {
    const result = slugSchema.safeParse("project2025");
    expect(result.success).toBe(true);
  });

  it("accepts slug with hyphens", () => {
    const result = slugSchema.safeParse("hello-world-42");
    expect(result.success).toBe(true);
  });

  it("accepts exactly 6 character slug", () => {
    const result = slugSchema.safeParse("my-link");
    expect(result.success).toBe(true);
  });

  it("trims whitespace", () => {
    const result = slugSchema.safeParse("  my-slug  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("my-slug");
    }
  });

  it("rejects slug shorter than 6 chars", () => {
    const result = slugSchema.safeParse("abcde");
    expect(result.success).toBe(false);
  });

  it("rejects slug longer than 32 chars", () => {
    const result = slugSchema.safeParse("a".repeat(33));
    expect(result.success).toBe(false);
  });

  it("rejects slug starting with hyphen", () => {
    const result = slugSchema.safeParse("-my-link");
    expect(result.success).toBe(false);
  });

  it("rejects slug ending with hyphen", () => {
    const result = slugSchema.safeParse("my-link-");
    expect(result.success).toBe(false);
  });

  it("rejects slug with special characters", () => {
    const result = slugSchema.safeParse("my_link!");
    expect(result.success).toBe(false);
  });

  it("rejects reserved slugs case-insensitively", () => {
    const result = slugSchema.safeParse("Admin");
    expect(result.success).toBe(false);
  });

  it("rejects reserved slugs lowercase", () => {
    const result = slugSchema.safeParse("api");
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = slugSchema.safeParse("");
    expect(result.success).toBe(false);
  });
});
