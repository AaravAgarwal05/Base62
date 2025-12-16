import { pgTable, text, bigint } from "drizzle-orm/pg-core";

export const urls = pgTable("urls", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  longUrl: text("long_url").notNull(),
});

export const counters = pgTable("counters", {
  serverId: text("server_id").primaryKey(),
  value: bigint("value", { mode: "bigint" }).notNull(),
});
