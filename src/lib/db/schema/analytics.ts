import { pgTable, serial, bigint, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { urls } from "@/lib/db/schema/urls";

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  urlId: bigint("url_id", { mode: "bigint" })
    .references(() => urls.id)
    .notNull(),
  type: varchar("type", { length: 10 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),

  /* ─── Request context ─── */
  ip: varchar("ip", { length: 45 }),
  userAgent: text("user_agent"),
  referrer: text("referrer"),

  /* ─── Geo data (Vercel edge) ─── */
  country: varchar("country", { length: 4 }),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),

  /* ─── Parsed UA ─── */
  browser: varchar("browser", { length: 50 }),
  os: varchar("os", { length: 50 }),
  device: varchar("device", { length: 50 }),
});
