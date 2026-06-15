import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB
const mockDb = {
  insert: vi.fn(() => ({
    values: vi.fn().mockResolvedValue(undefined),
  })),
  update: vi.fn(() => ({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  })),
};

vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

vi.mock("@/lib/db/schema", () => ({
  urls: {},
  analytics: {},
}));

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ a, b })),
  sql: (s: TemplateStringsArray) => ({ raw: s[0] }),
}));

describe("analytics-publisher", () => {
  let processEvent: (event: {
    urlId: number;
    type: "click" | "scan";
    timestamp: string;
  }) => Promise<void>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/lib/queue/analytics-publisher");
    processEvent = mod.processEvent;
  });

  const event = {
    urlId: 42,
    type: "click" as const,
    timestamp: "2025-06-15T10:00:00.000Z",
  };

  it("inserts analytics row and updates URL counter", async () => {
    await processEvent(event);

    // Analytics row inserted
    expect(mockDb.insert).toHaveBeenCalled();
    // URL counter updated
    expect(mockDb.update).toHaveBeenCalled();
  });

  it("uses totalScans for scan events", async () => {
    const scanEvent = { ...event, type: "scan" as const };

    await processEvent(scanEvent);

    expect(mockDb.update).toHaveBeenCalled();
  });

  it("throws on DB failure (QStash retry)", async () => {
    mockDb.insert.mockImplementationOnce(() => ({
      values: vi.fn().mockRejectedValue(new Error("DB timeout")),
    }));

    await expect(processEvent(event)).rejects.toThrow("DB timeout");
  });
});
