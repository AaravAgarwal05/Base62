import { pgTable, bigint, text, integer, timestamp } from "drizzle-orm/pg-core";

export const urls = pgTable("urls", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  longUrl: text("long_url").notNull(),
  slug: text("slug").unique(),
  totalClicks: integer("total_clicks").default(0).notNull(),
  totalScans: integer("total_scans").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
