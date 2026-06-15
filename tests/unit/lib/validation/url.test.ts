import { describe, it, expect } from "vitest";
import { createUrlSchema } from "@/lib/validation/url";

describe("URL validation schema", () => {
  it("accepts valid HTTPS URL", () => {
    const result = createUrlSchema.safeParse({ longUrl: "https://example.com" });
    expect(result.success).toBe(true);
  });

  it("accepts valid HTTP URL", () => {
    const result = createUrlSchema.safeParse({ longUrl: "http://example.com/path?q=1" });
    expect(result.success).toBe(true);
  });

  it("rejects empty string", () => {
    const result = createUrlSchema.safeParse({ longUrl: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid URL format", () => {
    const result = createUrlSchema.safeParse({ longUrl: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("rejects FTP protocol", () => {
    const result = createUrlSchema.safeParse({ longUrl: "ftp://example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects javascript: URLs", () => {
    const result = createUrlSchema.safeParse({ longUrl: "javascript:alert(1)" });
    expect(result.success).toBe(false);
  });

  it("trims whitespace", () => {
    const result = createUrlSchema.safeParse({ longUrl: "  https://example.com  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.longUrl).toBe("https://example.com");
    }
  });
});
