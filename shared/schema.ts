import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("patient"), // 'patient' or 'admin'
  level: integer("level").default(1),
  points: integer("points").default(0),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  inactivityThreshold: integer("inactivity_threshold").default(30), // jours avant considéré inactif
  notes: text("notes"), // notes du thérapeute sur le patient
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Exercises table
export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // 'cardio', 'strength', 'flexibility', 'mindfulness'
  difficulty: varchar("difficulty").default("beginner"), // 'beginner', 'intermediate', 'advanced'
  duration: integer("duration"), // in minutes
  instructions: text("instructions"),
  benefits: text("benefits"),
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Psychoeducation content table
export const psychoEducationContent = pgTable("psycho_education_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(), // 'addiction', 'motivation', 'coping', 'relapse_prevention'
  type: varchar("type").default("article"), // 'article', 'video', 'audio', 'interactive'
  difficulty: varchar("difficulty").default("beginner"),
  estimatedReadTime: integer("estimated_read_time"), // in minutes
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  audioUrl: varchar("audio_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Craving entries
export const cravingEntries = pgTable("craving_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  intensity: integer("intensity").notNull(), // 0-10 scale
  triggers: jsonb("triggers").$type<string[]>().default([]),
  emotions: jsonb("emotions").$type<string[]>().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exercise sessions
export const exerciseSessions = pgTable("exercise_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  exerciseId: varchar("exercise_id").references(() => exercises.id, { onDelete: 'cascade' }),
  duration: integer("duration"), // in seconds
  completed: boolean("completed").default(false),
  cravingBefore: integer("craving_before"), // 0-10 scale
  cravingAfter: integer("craving_after"), // 0-10 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Beck column analyses
export const beckAnalyses = pgTable("beck_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  situation: text("situation"),
  automaticThoughts: text("automatic_thoughts"),
  emotions: text("emotions"),
  emotionIntensity: integer("emotion_intensity"),
  rationalResponse: text("rational_response"),
  newFeeling: text("new_feeling"),
  newIntensity: integer("new_intensity"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User badges
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  badgeType: varchar("badge_type").notNull(), // '7_days', '50_exercises', 'craving_reduction'
  earnedAt: timestamp("earned_at").defaultNow(),
});

// User progress/stats
export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  exercisesCompleted: integer("exercises_completed").default(0),
  totalDuration: integer("total_duration").default(0), // in seconds
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  averageCraving: integer("average_craving"), // calculated average
  beckAnalysesCompleted: integer("beck_analyses_completed").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPsychoEducationContentSchema = createInsertSchema(psychoEducationContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCravingEntrySchema = createInsertSchema(cravingEntries).omit({
  id: true,
  createdAt: true,
});

export const insertExerciseSessionSchema = createInsertSchema(exerciseSessions).omit({
  id: true,
  createdAt: true,
});

export const insertBeckAnalysisSchema = createInsertSchema(beckAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

// Emergency routines table
export const emergencyRoutines = pgTable("emergency_routines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  steps: jsonb("steps").notNull(), // Array of steps for the routine
  duration: integer("duration"), // in minutes
  category: varchar("category").default("general"), // 'breathing', 'grounding', 'distraction', 'general'
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false), // One routine can be marked as default
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmergencyRoutineSchema = createInsertSchema(emergencyRoutines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Quick resources table (for psycho-education)
export const quickResources = pgTable("quick_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  category: varchar("category").notNull(), // 'coping', 'motivation', 'emergency', 'relaxation'
  type: varchar("type").default("tip"), // 'tip', 'technique', 'reminder', 'affirmation'
  icon: varchar("icon"), // Icon name for UI
  color: varchar("color").default("blue"), // Color theme
  isActive: boolean("is_active").default(true),
  isPinned: boolean("is_pinned").default(false), // Pinned resources appear first
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertQuickResourceSchema = createInsertSchema(quickResources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Anti-craving strategies table
export const antiCravingStrategies = pgTable("anti_craving_strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  context: varchar("context").notNull(), // 'leisure', 'home', 'work'
  exercise: text("exercise").notNull(),
  effort: varchar("effort").notNull(), // 'faible', 'modéré', 'intense'
  duration: integer("duration").notNull(), // in minutes
  cravingBefore: integer("craving_before").notNull(), // 0-10 scale
  cravingAfter: integer("craving_after").notNull(), // 0-10 scale
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAntiCravingStrategySchema = createInsertSchema(antiCravingStrategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Timer sessions for exercises with audio/video
export const timerSessions = pgTable("timer_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  type: varchar("type").notNull(), // 'interval', 'continuous', 'breathing'
  duration: integer("duration").notNull(), // in seconds
  intervals: jsonb("intervals"), // for interval timers
  audioUrl: varchar("audio_url"), // background audio/music
  completed: boolean("completed").default(false),
  heartRateBefore: integer("heart_rate_before"),
  heartRateAfter: integer("heart_rate_after"),
  stressLevelBefore: integer("stress_level_before"), // 1-10 scale
  stressLevelAfter: integer("stress_level_after"), // 1-10 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Professional reports for therapist
export const professionalReports = pgTable("professional_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  therapistId: varchar("therapist_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  reportType: varchar("report_type").notNull(), // 'weekly', 'monthly', 'session', 'progress'
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  data: jsonb("data"), // structured data (charts, stats, etc.)
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isPrivate: boolean("is_private").default(true),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Visualization content (guided imagery, meditation videos)
export const visualizationContent = pgTable("visualization_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // 'guided_imagery', 'meditation', 'breathing', 'visualization'
  category: varchar("category").notNull(), // 'relaxation', 'stress_reduction', 'pain_management', 'emotional_regulation'
  difficulty: varchar("difficulty").default("beginner"),
  duration: integer("duration"), // in minutes
  audioUrl: varchar("audio_url"),
  videoUrl: varchar("video_url"),
  imageUrl: varchar("image_url"),
  script: text("script"), // text script for the visualization
  instructions: text("instructions"),
  benefits: text("benefits"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audio content for therapy (relaxation, ASMR, nature sounds)
export const audioContent = pgTable("audio_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // 'relaxation', 'nature_sounds', 'meditation', 'breathing_guide', 'asmr'
  category: varchar("category").notNull(),
  duration: integer("duration"), // in seconds
  audioUrl: varchar("audio_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  isLoopable: boolean("is_loopable").default(false),
  volumeRecommendation: varchar("volume_recommendation").default("medium"),
  tags: jsonb("tags").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Exercise enhancement with multimedia
export const exerciseEnhancements = pgTable("exercise_enhancements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  audioUrls: jsonb("audio_urls").$type<string[]>().default([]), // multiple audio tracks
  videoUrls: jsonb("video_urls").$type<string[]>().default([]),
  imageUrls: jsonb("image_urls").$type<string[]>().default([]),
  timerSettings: jsonb("timer_settings"), // interval timer configuration
  breathingPattern: jsonb("breathing_pattern"), // for breathing exercises
  visualizationScript: text("visualization_script"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas for new tables
export const insertTimerSessionSchema = createInsertSchema(timerSessions).omit({
  id: true,
  createdAt: true,
});

export const insertProfessionalReportSchema = createInsertSchema(professionalReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVisualizationContentSchema = createInsertSchema(visualizationContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAudioContentSchema = createInsertSchema(audioContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExerciseEnhancementSchema = createInsertSchema(exerciseEnhancements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Exercise variations (simplifications et complexifications)
export const exerciseVariations = pgTable("exercise_variations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  type: varchar("type").notNull(), // 'simplification' or 'complexification'
  title: varchar("title").notNull(),
  description: text("description"),
  instructions: text("instructions"),
  duration: integer("duration"), // in minutes
  difficultyModifier: integer("difficulty_modifier").default(0), // -1 pour simplification, +1 pour complexification
  benefits: text("benefits"),
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Séances personnalisées (collections d'exercices avec configuration)
export const customSessions = pgTable("custom_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: 'cascade' }), // admin qui crée
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // 'morning', 'evening', 'crisis', 'maintenance'
  totalDuration: integer("total_duration"), // durée totale calculée en minutes
  difficulty: varchar("difficulty").default("beginner"),
  isTemplate: boolean("is_template").default(true), // template ou séance personnelle
  isPublic: boolean("is_public").default(false), // visible pour tous les patients
  tags: jsonb("tags").$type<string[]>().default([]),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Éléments de séance (exercices dans une séance avec configuration)
export const sessionElements = pgTable("session_elements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => customSessions.id, { onDelete: 'cascade' }),
  exerciseId: varchar("exercise_id").references(() => exercises.id, { onDelete: 'cascade' }),
  variationId: varchar("variation_id").references(() => exerciseVariations.id, { onDelete: 'cascade' }),
  order: integer("order").notNull(), // ordre dans la séance
  duration: integer("duration"), // durée spécifique pour cette séance (peut override l'exercice)
  repetitions: integer("repetitions").default(1),
  restTime: integer("rest_time").default(0), // temps de repos après en secondes
  timerSettings: jsonb("timer_settings"), // configuration timer spécifique
  notes: text("notes"), // notes spécifiques pour cet élément
  isOptional: boolean("is_optional").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Instances de séances (quand un utilisateur fait une séance)
export const sessionInstances = pgTable("session_instances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: varchar("session_id").notNull().references(() => customSessions.id, { onDelete: 'cascade' }),
  status: varchar("status").default("started"), // 'started', 'paused', 'completed', 'abandoned'
  currentElementIndex: integer("current_element_index").default(0),
  totalDuration: integer("total_duration"), // durée réelle en secondes
  cravingBefore: integer("craving_before"), // 0-10 scale
  cravingAfter: integer("craving_after"), // 0-10 scale
  moodBefore: varchar("mood_before"),
  moodAfter: varchar("mood_after"),
  notes: text("notes"),
  completedElements: jsonb("completed_elements").$type<string[]>().default([]), // IDs des éléments terminés
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bibliothèque d'exercices (métadonnées enrichies)
export const exerciseLibrary = pgTable("exercise_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  authorId: varchar("author_id").references(() => users.id), // thérapeute auteur
  cardImageUrl: varchar("card_image_url"), // image pour la carte d'identité
  thumbnailUrl: varchar("thumbnail_url"),
  galleryImages: jsonb("gallery_images").$type<string[]>().default([]),
  videos: jsonb("videos").$type<{url: string, title: string, description?: string}[]>().default([]),
  prerequisites: jsonb("prerequisites").$type<string[]>().default([]), // exercices requis avant
  contraindications: text("contraindications"),
  equipment: jsonb("equipment").$type<string[]>().default([]), // matériel nécessaire
  targetAudience: jsonb("target_audience").$type<string[]>().default([]), // 'beginners', 'athletes', 'seniors'
  muscleGroups: jsonb("muscle_groups").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  averageRating: integer("average_rating"), // moyenne des notes /5
  ratingCount: integer("rating_count").default(0),
  usageCount: integer("usage_count").default(0), // nombre d'utilisations
  lastUsed: timestamp("last_used"),
  isVerified: boolean("is_verified").default(false), // vérifié par un professionnel
  isFeatured: boolean("is_featured").default(false), // mis en avant
  optionVariable1: text("option_variable_1"), // champ personnalisable 1
  optionVariable2: text("option_variable_2"), // champ personnalisable 2
  optionVariable3: text("option_variable_3"), // champ personnalisable 3
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Évaluations d'exercices par les utilisateurs
export const exerciseRatings = pgTable("exercise_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  difficulty: varchar("difficulty"), // ressenti de difficulté par l'utilisateur
  effectiveness: integer("effectiveness"), // efficacité ressentie 1-5
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas for new tables
export const insertExerciseVariationSchema = createInsertSchema(exerciseVariations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomSessionSchema = createInsertSchema(customSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSessionElementSchema = createInsertSchema(sessionElements).omit({
  id: true,
  createdAt: true,
});

export const insertSessionInstanceSchema = createInsertSchema(sessionInstances).omit({
  id: true,
  createdAt: true,
});

export const insertExerciseLibrarySchema = createInsertSchema(exerciseLibrary).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExerciseRatingSchema = createInsertSchema(exerciseRatings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type PsychoEducationContent = typeof psychoEducationContent.$inferSelect;
export type InsertPsychoEducationContent = z.infer<typeof insertPsychoEducationContentSchema>;
export type CravingEntry = typeof cravingEntries.$inferSelect;
export type InsertCravingEntry = z.infer<typeof insertCravingEntrySchema>;
export type ExerciseSession = typeof exerciseSessions.$inferSelect;
export type InsertExerciseSession = z.infer<typeof insertExerciseSessionSchema>;
export type BeckAnalysis = typeof beckAnalyses.$inferSelect;
export type InsertBeckAnalysis = z.infer<typeof insertBeckAnalysisSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type EmergencyRoutine = typeof emergencyRoutines.$inferSelect;
export type InsertEmergencyRoutine = z.infer<typeof insertEmergencyRoutineSchema>;
export type QuickResource = typeof quickResources.$inferSelect;
export type InsertQuickResource = z.infer<typeof insertQuickResourceSchema>;
export type AntiCravingStrategy = typeof antiCravingStrategies.$inferSelect;
export type InsertAntiCravingStrategy = z.infer<typeof insertAntiCravingStrategySchema>;
export type TimerSession = typeof timerSessions.$inferSelect;
export type InsertTimerSession = z.infer<typeof insertTimerSessionSchema>;
export type ProfessionalReport = typeof professionalReports.$inferSelect;
export type InsertProfessionalReport = z.infer<typeof insertProfessionalReportSchema>;
export type VisualizationContent = typeof visualizationContent.$inferSelect;
export type InsertVisualizationContent = z.infer<typeof insertVisualizationContentSchema>;
export type AudioContent = typeof audioContent.$inferSelect;
export type InsertAudioContent = z.infer<typeof insertAudioContentSchema>;
export type ExerciseEnhancement = typeof exerciseEnhancements.$inferSelect;
export type InsertExerciseEnhancement = z.infer<typeof insertExerciseEnhancementSchema>;
export type ExerciseVariation = typeof exerciseVariations.$inferSelect;
export type InsertExerciseVariation = z.infer<typeof insertExerciseVariationSchema>;
export type CustomSession = typeof customSessions.$inferSelect;
export type InsertCustomSession = z.infer<typeof insertCustomSessionSchema>;
export type SessionElement = typeof sessionElements.$inferSelect;
export type InsertSessionElement = z.infer<typeof insertSessionElementSchema>;
export type SessionInstance = typeof sessionInstances.$inferSelect;
export type InsertSessionInstance = z.infer<typeof insertSessionInstanceSchema>;
export type ExerciseLibrary = typeof exerciseLibrary.$inferSelect;
export type InsertExerciseLibrary = z.infer<typeof insertExerciseLibrarySchema>;
export type ExerciseRating = typeof exerciseRatings.$inferSelect;
export type InsertExerciseRating = z.infer<typeof insertExerciseRatingSchema>;

// User emergency routines (personalised routines by users)
export const userEmergencyRoutines = pgTable("user_emergency_routines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  description: text("description"),
  totalDuration: integer("total_duration").notNull(), // in seconds
  exercises: jsonb("exercises").$type<{
    id: string;
    exerciseId: string;
    title: string;
    duration: number;
    repetitions?: number;
    restTime?: number;
    intensity?: 'low' | 'medium' | 'high';
    notes?: string;
    order: number;
  }[]>().notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserEmergencyRoutineSchema = createInsertSchema(userEmergencyRoutines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserEmergencyRoutine = typeof userEmergencyRoutines.$inferSelect;
export type InsertUserEmergencyRoutine = z.infer<typeof insertUserEmergencyRoutineSchema>;
