import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("patient"), // patient, therapist, admin
  therapistId: varchar("therapist_id"), // for patients
  createdAt: timestamp("created_at").defaultNow(),
});

export const cravings = pgTable("cravings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  intensity: integer("intensity").notNull(), // 1-10 scale
  situation: text("situation"), // triggering situation
  emotions: jsonb("emotions"), // array of emotions
  automaticThoughts: text("automatic_thoughts"), // automatic thoughts
  behavior: text("behavior"), // resulting behavior
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // breathing, physical, meditation, stretching
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  duration: integer("duration").notNull(), // in minutes
  instructions: jsonb("instructions").notNull(), // array of step objects
  isEmergency: boolean("is_emergency").default(false),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const exerciseSessions = pgTable("exercise_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  exerciseId: varchar("exercise_id").notNull(),
  duration: integer("duration").notNull(), // actual duration completed
  completed: boolean("completed").default(false),
  rating: integer("rating"), // 1-5 how helpful was it
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  mood: integer("mood"), // 1-10 scale
  tags: jsonb("tags"), // array of tags
  timestamp: timestamp("timestamp").defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  reminderEnabled: boolean("reminder_enabled").default(true),
  reminderTimes: jsonb("reminder_times"), // array of time strings
  language: text("language").default("fr"),
  theme: text("theme").default("light"),
});

// Relations for user-therapist connections
export const therapistPatients = pgTable("therapist_patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  therapistId: varchar("therapist_id").notNull(),
  patientId: varchar("patient_id").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCravingSchema = createInsertSchema(cravings).omit({
  id: true,
  timestamp: true,
}).extend({
  emotions: z.array(z.string()).optional(),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertExerciseSessionSchema = createInsertSchema(exerciseSessions).omit({
  id: true,
  timestamp: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  timestamp: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
});

export const insertTherapistPatientSchema = createInsertSchema(therapistPatients).omit({
  id: true,
  assignedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Craving = typeof cravings.$inferSelect;
export type InsertCraving = z.infer<typeof insertCravingSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type ExerciseSession = typeof exerciseSessions.$inferSelect;
export type InsertExerciseSession = z.infer<typeof insertExerciseSessionSchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;

export type TherapistPatient = typeof therapistPatients.$inferSelect;
export type InsertTherapistPatient = z.infer<typeof insertTherapistPatientSchema>;
