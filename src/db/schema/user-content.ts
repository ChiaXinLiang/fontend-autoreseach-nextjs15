import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

export type ContentMetadata = {
  lastEditedSection?: string;
  wordCount?: number;
  isPublic?: boolean;
  customFields?: Record<string, unknown>;
} | null;

export const userContent = pgTable("user_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  contentType: text("content_type").notNull(),
  filename: text("filename").notNull(),
  s3Key: text("s3_key").notNull(),
  title: text("title"),
  description: text("description"),
  tags: text("tags").array(),
  metadata: jsonb("metadata").$type<ContentMetadata>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type UserContent = typeof userContent.$inferSelect;
export type NewUserContent = typeof userContent.$inferInsert;
