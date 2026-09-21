import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const households = sqliteTable("households", {
  id: text("id").primaryKey(),
  primaryName: text("primary_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  householdSize: integer("household_size").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const visits = sqliteTable("visits", {
  id: text("id").primaryKey(),
  householdId: text("household_id")
    .notNull()
    .references(() => households.id),
  visitedAt: text("visited_at").notNull(),
  served: integer("served", { mode: "boolean" }).notNull().default(true),
  isEmergency: integer("is_emergency", { mode: "boolean" }).notNull().default(false),
  emergencyReason: text("emergency_reason"),
  note: text("note"),
  recordedBy: text("recorded_by"),
  undoneAt: text("undone_at"),
});

export type Household = typeof households.$inferSelect;
export type NewHousehold = typeof households.$inferInsert;
export type Visit = typeof visits.$inferSelect;
export type NewVisit = typeof visits.$inferInsert;
