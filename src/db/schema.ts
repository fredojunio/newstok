import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

export const generatedContents = pgTable("generated_contents", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  modelUsed: text("model_used").notNull(),
  selectedVersion: integer("selected_version"),
  hook: text("hook"),
  bridge: text("bridge"),
  value: text("value"),
  cta: text("cta"),
  fullContent: text("full_content"),
  style: text("style"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});
