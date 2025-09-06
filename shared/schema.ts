import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bots = pgTable("bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  language: text("language").notNull(), // "nodejs" or "python"
  template: text("template").notNull(), // "basic", "music", "moderation", "economy"
  status: text("status").notNull().default("offline"), // "online", "offline", "starting", "stopping", "error"
  token: text("token"), // Discord bot token
  mainFile: text("main_file").notNull().default("index.js"), // Main entry file
  pid: integer("pid"), // Process ID when running
  port: integer("port"), // Assigned port
  memoryUsage: integer("memory_usage").default(0), // Memory usage in MB
  cpuUsage: integer("cpu_usage").default(0), // CPU usage percentage
  uptime: integer("uptime").default(0), // Uptime in seconds
  lastStarted: timestamp("last_started"),
  lastStopped: timestamp("last_stopped"),
  autoRestart: boolean("auto_restart").default(true),
  environment: json("environment").$type<Record<string, string>>().default({}), // Environment variables
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const botFiles = pgTable("bot_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").notNull().references(() => bots.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  content: text("content"),
  size: integer("size").default(0),
  isDirectory: boolean("is_directory").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const botLogs = pgTable("bot_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").notNull().references(() => bots.id, { onDelete: "cascade" }),
  level: text("level").notNull(), // "info", "warn", "error", "debug"
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const systemStats = pgTable("system_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cpuUsage: integer("cpu_usage").notNull(),
  memoryUsage: integer("memory_usage").notNull(), // Used memory in MB
  memoryTotal: integer("memory_total").notNull(), // Total memory in MB
  diskUsage: integer("disk_usage").notNull(), // Used disk in MB
  diskTotal: integer("disk_total").notNull(), // Total disk in MB
  networkIn: integer("network_in").default(0), // Network in KB/s
  networkOut: integer("network_out").default(0), // Network out KB/s
  timestamp: timestamp("timestamp").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // "bot_start", "bot_stop", "bot_restart", "bot_crash", "file_upload", "config_update"
  botId: varchar("bot_id").references(() => bots.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertBotSchema = createInsertSchema(bots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBotFileSchema = createInsertSchema(botFiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBotLogSchema = createInsertSchema(botLogs).omit({
  id: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

// Types
export type Bot = typeof bots.$inferSelect;
export type InsertBot = z.infer<typeof insertBotSchema>;
export type BotFile = typeof botFiles.$inferSelect;
export type InsertBotFile = z.infer<typeof insertBotFileSchema>;
export type BotLog = typeof botLogs.$inferSelect;
export type InsertBotLog = z.infer<typeof insertBotLogSchema>;
export type SystemStats = typeof systemStats.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
