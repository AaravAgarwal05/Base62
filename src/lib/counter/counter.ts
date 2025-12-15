import { sqlite } from "./sqlite";

const END = BigInt(process.env.COUNTER_END!);

const selectStmt = sqlite.prepare("SELECT value FROM counter WHERE id = 1");
const updateStmt = sqlite.prepare("UPDATE counter SET value = ? WHERE id = 1");

export function getNextID(): bigint {
  const tx = sqlite.transaction(() => {
    const row = selectStmt.get() as { value: number };

    if (!row) {
      throw new Error("Counter not initialized");
    }

    const current = BigInt(row.value);

    if (current > END) {
      throw new Error("Counter has exceeded the maximum value");
    }

    const next = current + 1n;

    updateStmt.run(Number(next));

    return current;
  });

  return tx();
}
