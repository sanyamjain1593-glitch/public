import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  status: varchar("status", { enum: ["backlog", "in-progress", "done"] }).notNull().default("backlog"),
  priority: varchar("priority", { enum: ["low", "medium", "high"] }).notNull().default("medium"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  progress: integer("progress").default(0),
  assigneeInitials: varchar("assignee_initials", { length: 3 }),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isArchived: boolean("is_archived").default(false),
  sharepointId: text("sharepoint_id"),
  lastSynced: timestamp("last_synced"),
});

export const taskHistory = pgTable("task_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => tasks.id).notNull(),
  action: varchar("action", { enum: ["created", "updated", "completed", "archived"] }).notNull(),
  previousData: jsonb("previous_data"),
  newData: jsonb("new_data"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const boards = pgTable("boards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  columns: jsonb("columns").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  theme: varchar("theme").default("nebula-purple"),
  dailyRolloverTime: varchar("daily_rollover_time").default("00:00"),
  enableNotifications: boolean("enable_notifications").default(true),
  enableOfflineSync: boolean("enable_offline_sync").default(true),
  lastRollover: timestamp("last_rollover"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  lastSynced: true,
});

export const insertTaskHistorySchema = createInsertSchema(taskHistory).omit({
  id: true,
  timestamp: true,
});

export const insertBoardSchema = createInsertSchema(boards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update schemas
export const updateTaskSchema = insertTaskSchema.partial().extend({
  lastSynced: z.date().optional(),
  completedAt: z.date().optional(),
});
export const updateUserSettingsSchema = insertUserSettingsSchema.partial();

// Types
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;

export type TaskHistory = typeof taskHistory.$inferSelect;
export type InsertTaskHistory = z.infer<typeof insertTaskHistorySchema>;

export type Board = typeof boards.$inferSelect;
export type InsertBoard = z.infer<typeof insertBoardSchema>;

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;

// Additional types for frontend
export type TaskWithHistory = Task & {
  history?: TaskHistory[];
};

export type KanbanColumn = {
  id: string;
  title: string;
  status: string;
  color: string;
  tasks: Task[];
};

export type ThemeConfig = {
  id: string;
  name: string;
  description: string;
  gradient: string;
  primary: string;
  secondary: string;
  accent: string;
};
