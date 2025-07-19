import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const shortUrls = pgTable("short_urls", {
    id: serial("id").primaryKey(),
    originalUrl: text("original_url").notNull(),
    shortCode: varchar("short_code", { length: 10 }).notNull(),
    password: text("password"),
    title: text("title"),           
    description: text("description"), 
    summary: text("summary"),       
    createdAt: timestamp("created_at").defaultNow(),
});