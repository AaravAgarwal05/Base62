import { sqlite } from "./sqlite";

export function initCounterTable() {
  sqlite
    .prepare(
      "CREATE TABLE IF NOT EXISTS counter (id INTEGER PRIMARY KEY CHECK (id = 1), value INTEGER NOT NULL)"
    )
    .run();

  const row = sqlite.prepare("SELECT value FROM counter WHERE id = 1").get();

  if (!row) {
    const start = Number(process.env.COUNTER_START);
    if (Number.isNaN(start)) {
      throw new Error("Invalid COUNTER_START");
    }

    sqlite.prepare("INSERT INTO counter (id, value) VALUES (1, ?)").run(start);
  }
}
