import { boolean } from "drizzle-orm/gel-core";
import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const shortUrls = pgTable("short_urls", {
    id: serial("id").primaryKey(),
    originalUrl: text("original_url").notNull(),
    shortCode: varchar("short_code", { length: 10 }).notNull(),
    password: text("password"),
    note: text("note"),
    enabled: boolean("enabled").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});