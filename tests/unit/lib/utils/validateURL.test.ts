import { describe, it, expect } from "vitest";
import { validateURL } from "@/lib/utils/validateURL";

describe("validateURL", () => {
  it("returns true for valid HTTPS URL", () => {
    expect(validateURL("https://example.com")).toBe(true);
  });

  it("returns true for valid HTTP URL", () => {
    expect(validateURL("http://example.com/path")).toBe(true);
  });

  it("returns true for URL with query params", () => {
    expect(validateURL("https://example.com/path?q=1&r=2")).toBe(true);
  });

  it("returns false for non-HTTP protocols", () => {
    expect(validateURL("ftp://example.com")).toBe(false);
    expect(validateURL("javascript:alert(1)")).toBe(false);
    expect(validateURL("file:///etc/passwd")).toBe(false);
  });

  it("returns false for bare strings", () => {
    expect(validateURL("not-a-url")).toBe(false);
    expect(validateURL("")).toBe(false);
  });
});
