import { pgTable, serial, bigint, varchar, timestamp } from "drizzle-orm/pg-core";
import { urls } from "@/lib/db/schema/urls";

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  urlId: bigint("url_id", { mode: "bigint" })
    .references(() => urls.id)
    .notNull(),
  type: varchar("type", { length: 10 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
