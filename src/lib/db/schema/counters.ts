import { pgTable, text, bigint } from "drizzle-orm/pg-core";

export const counters = pgTable("counters", {
  serverId: text("server_id").primaryKey(),
  value: bigint("value", { mode: "bigint" }).notNull(),
});
