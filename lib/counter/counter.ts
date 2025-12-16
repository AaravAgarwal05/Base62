import { db } from "../db";
import { counters } from "../db/schema";
import { eq, sql } from "drizzle-orm";

const END = BigInt(process.env.COUNTER_END!);

export async function getNextID(): Promise<bigint> {
  const serverId = process.env.SERVER_ID || "default-server";

  const res = await db
    .update(counters)
    .set({ value: sql`${counters.value} + 1` })
    .where(eq(counters.serverId, serverId))
    .returning({ value: counters.value });

  if (res.length === 0) {
    throw new Error("Counter not initialized for this server");
  }

  const newValue = res[0].value;
  const allocatedId = newValue - 1n;

  if (allocatedId > END) {
    throw new Error("Counter has exceeded the maximum value");
  }

  return allocatedId;
}
