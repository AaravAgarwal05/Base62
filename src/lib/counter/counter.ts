import { dbPool } from "../db/postgres";

const END = BigInt(process.env.COUNTER_END!);

export async function getNextID(): Promise<bigint> {
  const serverId = process.env.SERVER_ID || "default-server";

  const client = await dbPool.connect();
  try {
    const res = await client.query(
      `
      UPDATE counters
      SET value = value + 1
      WHERE server_id = $1
      RETURNING value
    `,
      [serverId]
    );

    if (res.rowCount === 0) {
      throw new Error("Counter not initialized for this server");
    }

    const newValue = BigInt(res.rows[0].value);
    const allocatedId = newValue - 1n;

    if (allocatedId > END) {
      throw new Error("Counter has exceeded the maximum value");
    }

    return allocatedId;
  } finally {
    client.release();
  }
}
