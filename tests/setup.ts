/* ─── Global test setup ─── */
import { beforeAll, vi } from "vitest";

// Set test environment variables before any imports
process.env.NEXT_PUBLIC_URL = "http://localhost:3000";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.SERVER_ID = "test-server";
process.env.COUNTER_START = "100000";
process.env.COUNTER_END = "999999";

beforeAll(() => {
  // Silence console noise during tests unless a test explicitly asserts on it
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
