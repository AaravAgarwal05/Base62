import {
  pgTable,
  text,
  bigint,
  integer,
  timestamp,
  serial,
  varchar,
} from "drizzle-orm/pg-core";

export const urls = pgTable("urls", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  longUrl: text("long_url").notNull(),
  totalClicks: integer("total_clicks").default(0).notNull(),
  totalScans: integer("total_scans").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  urlId: bigint("url_id", { mode: "bigint" })
    .references(() => urls.id)
    .notNull(),
  type: varchar("type", { length: 10 }).notNull(), // 'click' or 'scan'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const counters = pgTable("counters", {
  serverId: text("server_id").primaryKey(),
  value: bigint("value", { mode: "bigint" }).notNull(),
});
