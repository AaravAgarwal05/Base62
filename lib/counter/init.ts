import { db } from "../db";
import { counters } from "../db/schema";

export async function initCounterTable() {
  const serverId = process.env.SERVER_ID || "default-server";
  const start = BigInt(process.env.COUNTER_START!);

  await db
    .insert(counters)
    .values({ serverId, value: start })
    .onConflictDoNothing();
}
