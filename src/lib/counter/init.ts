import { dbPool } from "../db/postgres";

export async function initCounterTable() {
  const client = await dbPool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS counters (
        server_id INT PRIMARY KEY,
        value BIGINT NOT NULL
      );
    `);

    const serverId = Number(process.env.SERVER_ID);
    const start = BigInt(process.env.COUNTER_START!);

    await client.query(
      `
      INSERT INTO counters (server_id, value)
      VALUES ($1, $2)
      ON CONFLICT (server_id) DO NOTHING;
    `,
      [serverId, start.toString()]
    );
  } finally {
    client.release();
  }
}
