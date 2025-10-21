var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// server/auth.ts
import bcrypt from "bcryptjs";

// server/storage.ts
import { eq, desc, count, avg, and, sql as sql2, or } from "drizzle-orm";

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  antiCravingStrategies: () => antiCravingStrategies,
  audioContent: () => audioContent,
  beckAnalyses: () => beckAnalyses,
  contentCategories: () => contentCategories,
  contentInteractions: () => contentInteractions,
  contentTags: () => contentTags,
  cravingEntries: () => cravingEntries,
  customSessions: () => customSessions,
  educationalContents: () => educationalContents,
  emergencyRoutines: () => emergencyRoutines,
  exerciseEnhancements: () => exerciseEnhancements,
  exerciseLibrary: () => exerciseLibrary,
  exerciseRatings: () => exerciseRatings,
  exerciseSessions: () => exerciseSessions,
  exerciseVariations: () => exerciseVariations,
  exercises: () => exercises,
  favoriteSessions: () => favoriteSessions,
  insertAntiCravingStrategySchema: () => insertAntiCravingStrategySchema,
  insertAudioContentSchema: () => insertAudioContentSchema,
  insertBeckAnalysisSchema: () => insertBeckAnalysisSchema,
  insertContentCategorySchema: () => insertContentCategorySchema,
  insertContentInteractionSchema: () => insertContentInteractionSchema,
  insertContentTagSchema: () => insertContentTagSchema,
  insertCravingEntrySchema: () => insertCravingEntrySchema,
  insertCustomSessionSchema: () => insertCustomSessionSchema,
  insertEducationalContentSchema: () => insertEducationalContentSchema,
  insertEmergencyRoutineSchema: () => insertEmergencyRoutineSchema,
  insertExerciseEnhancementSchema: () => insertExerciseEnhancementSchema,
  insertExerciseLibrarySchema: () => insertExerciseLibrarySchema,
  insertExerciseRatingSchema: () => insertExerciseRatingSchema,
  insertExerciseSchema: () => insertExerciseSchema,
  insertExerciseSessionSchema: () => insertExerciseSessionSchema,
  insertExerciseVariationSchema: () => insertExerciseVariationSchema,
  insertFavoriteSessionSchema: () => insertFavoriteSessionSchema,
  insertPatientSessionSchema: () => insertPatientSessionSchema,
  insertProfessionalReportSchema: () => insertProfessionalReportSchema,
  insertPsychoEducationContentSchema: () => insertPsychoEducationContentSchema,
  insertQuickResourceSchema: () => insertQuickResourceSchema,
  insertSessionElementSchema: () => insertSessionElementSchema,
  insertSessionInstanceSchema: () => insertSessionInstanceSchema,
  insertTimerSessionSchema: () => insertTimerSessionSchema,
  insertUserBadgeSchema: () => insertUserBadgeSchema,
  insertUserEmergencyRoutineSchema: () => insertUserEmergencyRoutineSchema,
  insertUserSchema: () => insertUserSchema,
  insertVisualizationContentSchema: () => insertVisualizationContentSchema,
  patientSessions: () => patientSessions,
  professionalReports: () => professionalReports,
  psychoEducationContent: () => psychoEducationContent,
  quickResources: () => quickResources,
  sessionElements: () => sessionElements,
  sessionInstances: () => sessionInstances,
  timerSessions: () => timerSessions,
  userBadges: () => userBadges,
  userEmergencyRoutines: () => userEmergencyRoutines,
  userStats: () => userStats,
  users: () => users,
  visualizationContent: () => visualizationContent
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("patient"),
  // 'patient' or 'admin'
  level: integer("level").default(1),
  points: integer("points").default(0),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  inactivityThreshold: integer("inactivity_threshold").default(30),
  // jours avant considéré inactif
  notes: text("notes"),
  // notes du thérapeute sur le patient
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  // 'cardio', 'strength', 'flexibility', 'mindfulness'
  difficulty: varchar("difficulty").default("beginner"),
  // 'beginner', 'intermediate', 'advanced'
  duration: integer("duration"),
  // in minutes
  instructions: text("instructions"),
  benefits: text("benefits"),
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  mediaUrl: varchar("media_url"),
  // URL pour média associé (image/vidéo supplémentaire)
  tags: jsonb("tags").$type().default([]),
  // tags pour catégorisation
  variable1: text("variable_1"),
  // variable dynamique 1
  variable2: text("variable_2"),
  // variable dynamique 2  
  variable3: text("variable_3"),
  // variable dynamique 3
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var psychoEducationContent = pgTable("psycho_education_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(),
  // 'addiction', 'motivation', 'coping', 'relapse_prevention'
  type: varchar("type").default("article"),
  // 'article', 'video', 'audio', 'interactive'
  difficulty: varchar("difficulty").default("beginner"),
  estimatedReadTime: integer("estimated_read_time"),
  // in minutes
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  audioUrl: varchar("audio_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var cravingEntries = pgTable("craving_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  intensity: integer("intensity").notNull(),
  // 0-10 scale
  triggers: jsonb("triggers").$type().default([]),
  emotions: jsonb("emotions").$type().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var exerciseSessions = pgTable("exercise_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseId: varchar("exercise_id").references(() => exercises.id, { onDelete: "cascade" }),
  duration: integer("duration"),
  // in seconds
  completed: boolean("completed").default(false),
  cravingBefore: integer("craving_before"),
  // 0-10 scale
  cravingAfter: integer("craving_after"),
  // 0-10 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var beckAnalyses = pgTable("beck_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  situation: text("situation"),
  automaticThoughts: text("automatic_thoughts"),
  emotions: text("emotions"),
  emotionIntensity: integer("emotion_intensity"),
  rationalResponse: text("rational_response"),
  newFeeling: text("new_feeling"),
  newIntensity: integer("new_intensity"),
  createdAt: timestamp("created_at").defaultNow()
});
var userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeType: varchar("badge_type").notNull(),
  // '7_days', '50_exercises', 'craving_reduction'
  earnedAt: timestamp("earned_at").defaultNow()
});
var userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  exercisesCompleted: integer("exercises_completed").default(0),
  totalDuration: integer("total_duration").default(0),
  // in seconds
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  averageCraving: integer("average_craving"),
  // calculated average
  beckAnalysesCompleted: integer("beck_analyses_completed").default(0),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPsychoEducationContentSchema = createInsertSchema(psychoEducationContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCravingEntrySchema = createInsertSchema(cravingEntries).omit({
  id: true,
  createdAt: true
});
var insertExerciseSessionSchema = createInsertSchema(exerciseSessions).omit({
  id: true,
  createdAt: true
});
var insertBeckAnalysisSchema = createInsertSchema(beckAnalyses).omit({
  id: true,
  createdAt: true
});
var insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true
});
var emergencyRoutines = pgTable("emergency_routines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  steps: jsonb("steps").notNull(),
  // Array of steps for the routine
  duration: integer("duration"),
  // in minutes
  category: varchar("category").default("general"),
  // 'breathing', 'grounding', 'distraction', 'general'
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  // One routine can be marked as default
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertEmergencyRoutineSchema = createInsertSchema(emergencyRoutines).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var quickResources = pgTable("quick_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  category: varchar("category").notNull(),
  // 'coping', 'motivation', 'emergency', 'relaxation'
  type: varchar("type").default("tip"),
  // 'tip', 'technique', 'reminder', 'affirmation'
  icon: varchar("icon"),
  // Icon name for UI
  color: varchar("color").default("blue"),
  // Color theme
  isActive: boolean("is_active").default(true),
  isPinned: boolean("is_pinned").default(false),
  // Pinned resources appear first
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertQuickResourceSchema = createInsertSchema(quickResources).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var antiCravingStrategies = pgTable("anti_craving_strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  context: varchar("context").notNull(),
  // 'leisure', 'home', 'work'
  exercise: text("exercise").notNull(),
  effort: varchar("effort").notNull(),
  // 'faible', 'modéré', 'intense'
  duration: integer("duration").notNull(),
  // in minutes
  cravingBefore: integer("craving_before").notNull(),
  // 0-10 scale
  cravingAfter: integer("craving_after").notNull(),
  // 0-10 scale
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertAntiCravingStrategySchema = createInsertSchema(antiCravingStrategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var timerSessions = pgTable("timer_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(),
  // 'interval', 'continuous', 'breathing'
  duration: integer("duration").notNull(),
  // in seconds
  intervals: jsonb("intervals"),
  // for interval timers
  audioUrl: varchar("audio_url"),
  // background audio/music
  completed: boolean("completed").default(false),
  heartRateBefore: integer("heart_rate_before"),
  heartRateAfter: integer("heart_rate_after"),
  stressLevelBefore: integer("stress_level_before"),
  // 1-10 scale
  stressLevelAfter: integer("stress_level_after"),
  // 1-10 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var professionalReports = pgTable("professional_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  therapistId: varchar("therapist_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportType: varchar("report_type").notNull(),
  // 'weekly', 'monthly', 'session', 'progress'
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  data: jsonb("data"),
  // structured data (charts, stats, etc.)
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isPrivate: boolean("is_private").default(true),
  tags: jsonb("tags").$type().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var visualizationContent = pgTable("visualization_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(),
  // 'guided_imagery', 'meditation', 'breathing', 'visualization'
  category: varchar("category").notNull(),
  // 'relaxation', 'stress_reduction', 'pain_management', 'emotional_regulation'
  difficulty: varchar("difficulty").default("beginner"),
  duration: integer("duration"),
  // in minutes
  audioUrl: varchar("audio_url"),
  videoUrl: varchar("video_url"),
  imageUrl: varchar("image_url"),
  script: text("script"),
  // text script for the visualization
  instructions: text("instructions"),
  benefits: text("benefits"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var audioContent = pgTable("audio_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(),
  // 'relaxation', 'nature_sounds', 'meditation', 'breathing_guide', 'asmr'
  category: varchar("category").notNull(),
  duration: integer("duration"),
  // in seconds
  audioUrl: varchar("audio_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  isLoopable: boolean("is_loopable").default(false),
  volumeRecommendation: varchar("volume_recommendation").default("medium"),
  tags: jsonb("tags").$type().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var exerciseEnhancements = pgTable("exercise_enhancements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  audioUrls: jsonb("audio_urls").$type().default([]),
  // multiple audio tracks
  videoUrls: jsonb("video_urls").$type().default([]),
  imageUrls: jsonb("image_urls").$type().default([]),
  timerSettings: jsonb("timer_settings"),
  // interval timer configuration
  breathingPattern: jsonb("breathing_pattern"),
  // for breathing exercises
  visualizationScript: text("visualization_script"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertTimerSessionSchema = createInsertSchema(timerSessions).omit({
  id: true,
  createdAt: true
});
var insertProfessionalReportSchema = createInsertSchema(professionalReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertVisualizationContentSchema = createInsertSchema(visualizationContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAudioContentSchema = createInsertSchema(audioContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertExerciseEnhancementSchema = createInsertSchema(exerciseEnhancements).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var exerciseVariations = pgTable("exercise_variations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(),
  // 'simplification' or 'complexification'
  title: varchar("title").notNull(),
  description: text("description"),
  instructions: text("instructions"),
  duration: integer("duration"),
  // in minutes
  difficultyModifier: integer("difficulty_modifier").default(0),
  // -1 pour simplification, +1 pour complexification
  benefits: text("benefits"),
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var customSessions = pgTable("custom_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // admin qui crée
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  // 'morning', 'evening', 'crisis', 'maintenance'
  protocol: varchar("protocol").default("standard"),
  // 'standard', 'hiit', 'tabata', 'hict', 'emom', 'e2mom', 'amrap'
  protocolConfig: jsonb("protocol_config"),
  // Configuration spécifique du protocole
  totalDuration: integer("total_duration"),
  // durée totale calculée en minutes
  difficulty: varchar("difficulty").default("beginner"),
  status: varchar("status").default("draft"),
  // 'draft', 'published', 'archived'
  isTemplate: boolean("is_template").default(true),
  // template ou séance personnelle
  isPublic: boolean("is_public").default(false),
  // visible pour tous les patients
  tags: jsonb("tags").$type().default([]),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var sessionElements = pgTable("session_elements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => customSessions.id, { onDelete: "cascade" }),
  exerciseId: varchar("exercise_id").references(() => exercises.id, { onDelete: "cascade" }),
  variationId: varchar("variation_id").references(() => exerciseVariations.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  // ordre dans la séance
  duration: integer("duration"),
  // durée spécifique pour cette séance (peut override l'exercice)
  repetitions: integer("repetitions").default(0),
  // nombre de répétitions (obligatoire pour HICT, EMOM, AMRAP)
  sets: integer("sets").default(1),
  // nombre de séries
  restTime: integer("rest_time").default(0),
  // temps de repos après en secondes
  workTime: integer("work_time"),
  // durée d'effort pour protocoles intervalles (en secondes)
  restInterval: integer("rest_interval"),
  // durée de repos dans l'intervalle (en secondes)
  timerSettings: jsonb("timer_settings"),
  // configuration timer spécifique
  notes: text("notes"),
  // notes spécifiques pour cet élément
  isOptional: boolean("is_optional").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var sessionInstances = pgTable("session_instances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id").notNull().references(() => customSessions.id, { onDelete: "cascade" }),
  status: varchar("status").default("started"),
  // 'started', 'paused', 'completed', 'abandoned'
  currentElementIndex: integer("current_element_index").default(0),
  totalDuration: integer("total_duration"),
  // durée réelle en secondes
  cravingBefore: integer("craving_before"),
  // 0-10 scale
  cravingAfter: integer("craving_after"),
  // 0-10 scale
  moodBefore: varchar("mood_before"),
  moodAfter: varchar("mood_after"),
  notes: text("notes"),
  completedElements: jsonb("completed_elements").$type().default([]),
  // IDs des éléments terminés
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var patientSessions = pgTable("patient_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id").notNull().references(() => customSessions.id, { onDelete: "cascade" }),
  status: varchar("status").default("assigned"),
  // 'assigned', 'done', 'skipped'
  feedback: text("feedback"),
  // feedback du patient après la séance
  effort: integer("effort"),
  // effort ressenti 1-10
  duration: integer("duration"),
  // durée réelle en minutes
  assignedAt: timestamp("assigned_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var exerciseLibrary = pgTable("exercise_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").references(() => users.id),
  // thérapeute auteur
  cardImageUrl: varchar("card_image_url"),
  // image pour la carte d'identité
  thumbnailUrl: varchar("thumbnail_url"),
  galleryImages: jsonb("gallery_images").$type().default([]),
  videos: jsonb("videos").$type().default([]),
  prerequisites: jsonb("prerequisites").$type().default([]),
  // exercices requis avant
  contraindications: text("contraindications"),
  equipment: jsonb("equipment").$type().default([]),
  // matériel nécessaire
  targetAudience: jsonb("target_audience").$type().default([]),
  // 'beginners', 'athletes', 'seniors'
  muscleGroups: jsonb("muscle_groups").$type().default([]),
  tags: jsonb("tags").$type().default([]),
  averageRating: integer("average_rating"),
  // moyenne des notes /5
  ratingCount: integer("rating_count").default(0),
  usageCount: integer("usage_count").default(0),
  // nombre d'utilisations
  lastUsed: timestamp("last_used"),
  isVerified: boolean("is_verified").default(false),
  // vérifié par un professionnel
  isFeatured: boolean("is_featured").default(false),
  // mis en avant
  optionVariable1: text("option_variable_1"),
  // champ personnalisable 1
  optionVariable2: text("option_variable_2"),
  // champ personnalisable 2
  optionVariable3: text("option_variable_3"),
  // champ personnalisable 3
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var exerciseRatings = pgTable("exercise_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  // 1-5 stars
  comment: text("comment"),
  difficulty: varchar("difficulty"),
  // ressenti de difficulté par l'utilisateur
  effectiveness: integer("effectiveness"),
  // efficacité ressentie 1-5
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertExerciseVariationSchema = createInsertSchema(exerciseVariations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCustomSessionSchema = createInsertSchema(customSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSessionElementSchema = createInsertSchema(sessionElements).omit({
  id: true,
  createdAt: true
});
var insertSessionInstanceSchema = createInsertSchema(sessionInstances).omit({
  id: true,
  createdAt: true
});
var insertPatientSessionSchema = createInsertSchema(patientSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertExerciseLibrarySchema = createInsertSchema(exerciseLibrary).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertExerciseRatingSchema = createInsertSchema(exerciseRatings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var educationalContents = pgTable("educational_contents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(),
  // 'text', 'video', 'audio', 'pdf', 'image'
  categoryId: varchar("category_id").references(() => contentCategories.id, { onDelete: "set null" }),
  tags: jsonb("tags").$type().default([]),
  mediaUrl: varchar("media_url"),
  // URL for uploaded or external media
  mediaType: varchar("media_type"),
  // 'upload', 'youtube', 'vimeo', 'external_link'
  content: text("content"),
  // Rich text or markdown content
  difficulty: varchar("difficulty").default("easy"),
  // 'easy', 'intermediate', 'advanced'
  estimatedReadTime: integer("estimated_read_time"),
  // in minutes
  status: varchar("status").default("draft"),
  // 'draft', 'published', 'archived'
  isRecommended: boolean("is_recommended").default(false),
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  thumbnailUrl: varchar("thumbnail_url"),
  authorId: varchar("author_id").references(() => users.id, { onDelete: "set null" }),
  publishedAt: timestamp("published_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var contentCategories = pgTable("content_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  color: varchar("color").default("blue"),
  // For UI theming
  icon: varchar("icon"),
  // Icon name for UI
  order: integer("order").default(0),
  // For custom sorting
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var contentTags = pgTable("content_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  color: varchar("color").default("gray"),
  usageCount: integer("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var contentInteractions = pgTable("content_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contentId: varchar("content_id").notNull().references(() => educationalContents.id, { onDelete: "cascade" }),
  interactionType: varchar("interaction_type").notNull(),
  // 'view', 'like', 'bookmark', 'complete'
  duration: integer("duration"),
  // Time spent viewing in seconds
  progress: integer("progress").default(0),
  // Percentage of completion (0-100)
  createdAt: timestamp("created_at").defaultNow()
});
var insertEducationalContentSchema = createInsertSchema(educationalContents).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertContentCategorySchema = createInsertSchema(contentCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertContentTagSchema = createInsertSchema(contentTags).omit({
  id: true,
  createdAt: true
});
var insertContentInteractionSchema = createInsertSchema(contentInteractions).omit({
  id: true,
  createdAt: true
});
var userEmergencyRoutines = pgTable("user_emergency_routines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  totalDuration: integer("total_duration").notNull(),
  // in seconds
  exercises: jsonb("exercises").$type().notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserEmergencyRoutineSchema = createInsertSchema(userEmergencyRoutines).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var favoriteSessions = pgTable("favorite_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sourceSessionId: varchar("source_session_id").references(() => customSessions.id, { onDelete: "set null" }),
  // séance originale si basée sur une existante
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  protocol: varchar("protocol").default("standard"),
  protocolConfig: jsonb("protocol_config"),
  totalDuration: integer("total_duration"),
  difficulty: varchar("difficulty").default("beginner"),
  exercises: jsonb("exercises").$type().notNull(),
  tags: jsonb("tags").$type().default([]),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertFavoriteSessionSchema = createInsertSchema(favoriteSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/db.ts
var { Pool } = pkg;
var pool = null;
var db = null;
function getDB() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    db = drizzle(pool, { schema: schema_exports });
  }
  return db;
}

// server/storage.ts
var Storage = class {
  db = getDB();
  // === USERS ===
  async getUserByEmail(email) {
    console.log("[STORAGE] Looking for user with email:", email);
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    console.log("[STORAGE] Found:", result.length > 0 ? result[0].email : "none");
    return result[0] || null;
  }
  async createUser(userData) {
    const result = await this.db.insert(users).values(userData).returning();
    return result[0];
  }
  async getUser(id) {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }
  // Alias pour la compatibilité
  async getUserById(id) {
    return this.getUser(id);
  }
  async updateUser(id, data) {
    const result = await this.db.update(users).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return result[0];
  }
  async updateUserLastLogin(id) {
    await this.db.update(users).set({ lastLoginAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
  }
  async updatePassword(id, hashedPassword) {
    await this.db.update(users).set({ password: hashedPassword, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
  }
  async getAllUsers() {
    const result = await this.db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      isActive: users.isActive,
      level: users.level,
      points: users.points,
      profileImageUrl: users.profileImageUrl,
      lastLoginAt: users.lastLoginAt,
      inactivityThreshold: users.inactivityThreshold,
      notes: users.notes,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users);
    return result;
  }
  async getAllUsersWithStats() {
    return this.getAllUsers();
  }
  async deleteUser(id) {
    try {
      const result = await this.db.delete(users).where(eq(users.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
  // === EXERCISES ===
  async getAllExercises() {
    const result = await this.db.select().from(exercises).where(eq(exercises.isActive, true)).orderBy(desc(exercises.createdAt));
    return result;
  }
  async createExercise(exerciseData) {
    try {
      console.log("\u{1F4BE} Creating exercise in storage with data:", exerciseData);
      if (!exerciseData.title || !exerciseData.description) {
        throw new Error("Titre et description requis pour cr\xE9er un exercice");
      }
      const insertData = {
        ...exerciseData,
        tags: exerciseData.tags ? Array.from(exerciseData.tags) : []
      };
      const result = await this.db.insert(exercises).values(insertData).returning();
      if (!result || result.length === 0) {
        throw new Error("Aucune donn\xE9e retourn\xE9e apr\xE8s insertion de l'exercice");
      }
      console.log("\u2705 Exercise created in storage successfully:", result[0].id);
      return result[0];
    } catch (error) {
      console.error("\u274C Error in storage createExercise:", error);
      throw new Error(`Erreur lors de la cr\xE9ation de l'exercice: ${error.message}`);
    }
  }
  async getExercise(id) {
    const result = await this.db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
    return result[0] || null;
  }
  // Alias pour la compatibilité
  async getExerciseById(id) {
    return this.getExercise(id);
  }
  async getRelaxationExercises() {
    const result = await this.db.select().from(exercises).where(and(
      eq(exercises.isActive, true),
      eq(exercises.category, "relaxation")
    )).orderBy(desc(exercises.createdAt));
    return result;
  }
  // === PSYCHO EDUCATION CONTENT ===
  async getAllPsychoEducationContent() {
    const result = await this.db.select().from(psychoEducationContent).where(eq(psychoEducationContent.isActive, true)).orderBy(desc(psychoEducationContent.createdAt));
    return result;
  }
  async createPsychoEducationContent(contentData) {
    const result = await this.db.insert(psychoEducationContent).values(contentData).returning();
    return result[0];
  }
  async updatePsychoEducationContent(id, updateData) {
    try {
      const result = await this.db.update(psychoEducationContent).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(psychoEducationContent.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Error updating psycho-education content:", error);
      throw error;
    }
  }
  async deletePsychoEducationContent(id) {
    try {
      const result = await this.db.delete(psychoEducationContent).where(eq(psychoEducationContent.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting psycho-education content:", error);
      throw error;
    }
  }
  // === CRAVING ENTRIES ===
  async createCravingEntry(cravingData) {
    try {
      console.log("\u{1F4BE} Creating craving entry:", cravingData);
      const insertData = {
        userId: cravingData.userId,
        intensity: cravingData.intensity,
        triggers: Array.isArray(cravingData.triggers) ? cravingData.triggers : [],
        emotions: Array.isArray(cravingData.emotions) ? cravingData.emotions : [],
        notes: cravingData.notes
      };
      console.log("\u{1F4BE} Processed insert data:", insertData);
      const result = await this.db.insert(cravingEntries).values(insertData).returning();
      if (!result || result.length === 0) {
        throw new Error("Aucune donn\xE9e retourn\xE9e apr\xE8s insertion du craving");
      }
      console.log("\u2705 Craving entry created in database:", result[0]);
      return result[0];
    } catch (error) {
      console.error("\u274C Database error creating craving entry:", error);
      throw new Error(`Erreur de base de donn\xE9es lors de la cr\xE9ation du craving: ${error.message}`);
    }
  }
  async getCravingEntriesByUser(userId, limit) {
    const baseQuery = this.db.select().from(cravingEntries).where(eq(cravingEntries.userId, userId)).orderBy(desc(cravingEntries.createdAt));
    if (limit) {
      return await baseQuery.limit(limit);
    }
    return await baseQuery;
  }
  // === EXERCISE SESSIONS ===
  async createExerciseSession(sessionData) {
    const result = await this.db.insert(exerciseSessions).values(sessionData).returning();
    return result[0];
  }
  async getExerciseSessionsByUser(userId, limit) {
    try {
      const baseQuery = this.db.select({
        id: exerciseSessions.id,
        userId: exerciseSessions.userId,
        exerciseId: exerciseSessions.exerciseId,
        duration: exerciseSessions.duration,
        completed: exerciseSessions.completed,
        cravingBefore: exerciseSessions.cravingBefore,
        cravingAfter: exerciseSessions.cravingAfter,
        notes: exerciseSessions.notes,
        createdAt: exerciseSessions.createdAt,
        updatedAt: exerciseSessions.updatedAt,
        // Ajout des informations de l'exercice (peut être null)
        exerciseTitle: exercises.title,
        exerciseCategory: exercises.category
      }).from(exerciseSessions).leftJoin(exercises, eq(exerciseSessions.exerciseId, exercises.id)).where(eq(exerciseSessions.userId, userId)).orderBy(desc(exerciseSessions.createdAt));
      const result = limit ? await baseQuery.limit(limit) : await baseQuery;
      return result.map((session2) => ({
        ...session2,
        exerciseTitle: session2.exerciseTitle || session2.exerciseId || "Exercice",
        exerciseCategory: session2.exerciseCategory || "general"
      }));
    } catch (error) {
      console.error("Error in getExerciseSessionsByUser:", error);
      const fallbackQuery = this.db.select().from(exerciseSessions).where(eq(exerciseSessions.userId, userId)).orderBy(desc(exerciseSessions.createdAt));
      return limit ? await fallbackQuery.limit(limit) : await fallbackQuery;
    }
  }
  // === BECK ANALYSES ===
  async createBeckAnalysis(analysisData) {
    try {
      console.log("\u{1F4BE} Creating Beck analysis:", analysisData);
      const result = await this.db.insert(beckAnalyses).values(analysisData).returning();
      if (!result || result.length === 0) {
        throw new Error("Aucune donn\xE9e retourn\xE9e apr\xE8s insertion de l'analyse Beck");
      }
      console.log("\u2705 Beck analysis created in database:", result[0]);
      return result[0];
    } catch (error) {
      console.error("\u274C Database error creating Beck analysis:", error);
      throw new Error(`Erreur de base de donn\xE9es lors de la cr\xE9ation de l'analyse Beck: ${error.message}`);
    }
  }
  async getBeckAnalysesByUser(userId, limit) {
    const baseQuery = this.db.select().from(beckAnalyses).where(eq(beckAnalyses.userId, userId)).orderBy(desc(beckAnalyses.createdAt));
    if (limit) {
      return await baseQuery.limit(limit);
    }
    return await baseQuery;
  }
  // === ANTI-CRAVING STRATEGIES ===
  async createStrategy(strategyData) {
    try {
      console.log("\u{1F4BE} Creating anti-craving strategy:", strategyData);
      const result = await this.db.insert(antiCravingStrategies).values(strategyData).returning();
      if (!result || result.length === 0) {
        throw new Error("Aucune donn\xE9e retourn\xE9e apr\xE8s insertion de la strat\xE9gie");
      }
      console.log("\u2705 Strategy created in database:", result[0]);
      return result[0];
    } catch (error) {
      console.error("\u274C Database error creating strategy:", error);
      throw new Error(`Erreur de base de donn\xE9es lors de la cr\xE9ation de la strat\xE9gie: ${error.message}`);
    }
  }
  async getStrategiesByUser(userId) {
    const result = await this.db.select().from(antiCravingStrategies).where(eq(antiCravingStrategies.userId, userId)).orderBy(desc(antiCravingStrategies.createdAt));
    return result;
  }
  async updateStrategy(id, userId, data) {
    const result = await this.db.update(antiCravingStrategies).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(and(
      eq(antiCravingStrategies.id, id),
      eq(antiCravingStrategies.userId, userId)
    )).returning();
    return result[0] || null;
  }
  async deleteStrategy(id, userId) {
    const result = await this.db.delete(antiCravingStrategies).where(and(
      eq(antiCravingStrategies.id, id),
      eq(antiCravingStrategies.userId, userId)
    )).returning();
    return result.length > 0;
  }
  // === USER STATS ===
  async getUserStats(userId) {
    try {
      const userStatsResult = await this.db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
      const now = /* @__PURE__ */ new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 7);
      const [
        totalCravings,
        totalExerciseSessions,
        totalBeckAnalyses,
        totalStrategies,
        avgCravingIntensity,
        todaysCravings,
        yesterdaysCravings,
        weeklyExercises,
        weeklyBeckAnalyses,
        weeklyStrategies,
        recentCravings,
        recentSessions,
        recentAnalyses,
        recentStrategies
      ] = await Promise.all([
        // Total de cravings
        this.db.select({ count: count() }).from(cravingEntries).where(eq(cravingEntries.userId, userId)),
        // Total de sessions d'exercices
        this.db.select({ count: count() }).from(exerciseSessions).where(eq(exerciseSessions.userId, userId)),
        // Total d'analyses Beck
        this.db.select({ count: count() }).from(beckAnalyses).where(eq(beckAnalyses.userId, userId)),
        // Total de stratégies
        this.db.select({ count: count() }).from(antiCravingStrategies).where(eq(antiCravingStrategies.userId, userId)),
        // Intensité moyenne des cravings (tous)
        this.db.select({ avg: avg(cravingEntries.intensity) }).from(cravingEntries).where(eq(cravingEntries.userId, userId)),
        // Cravings d'aujourd'hui (moyenne d'intensité)
        this.db.select({ avg: avg(cravingEntries.intensity), count: count() }).from(cravingEntries).where(
          and(
            eq(cravingEntries.userId, userId),
            sql2`${cravingEntries.createdAt} >= ${todayStart}`
          )
        ),
        // Cravings d'hier (moyenne d'intensité pour comparaison)
        this.db.select({ avg: avg(cravingEntries.intensity) }).from(cravingEntries).where(
          and(
            eq(cravingEntries.userId, userId),
            sql2`${cravingEntries.createdAt} >= ${yesterdayStart}`,
            sql2`${cravingEntries.createdAt} < ${todayStart}`
          )
        ),
        // Exercices de la semaine
        this.db.select({ count: count() }).from(exerciseSessions).where(
          and(
            eq(exerciseSessions.userId, userId),
            sql2`${exerciseSessions.createdAt} >= ${weekStart}`
          )
        ),
        // Analyses Beck de la semaine
        this.db.select({ count: count() }).from(beckAnalyses).where(
          and(
            eq(beckAnalyses.userId, userId),
            sql2`${beckAnalyses.createdAt} >= ${weekStart}`
          )
        ),
        // Stratégies de la semaine
        this.db.select({ count: count() }).from(antiCravingStrategies).where(
          and(
            eq(antiCravingStrategies.userId, userId),
            sql2`${antiCravingStrategies.createdAt} >= ${weekStart}`
          )
        ),
        // Cravings récents (7 derniers jours)
        this.db.select().from(cravingEntries).where(eq(cravingEntries.userId, userId)).orderBy(desc(cravingEntries.createdAt)).limit(10),
        // Sessions récentes
        this.db.select().from(exerciseSessions).where(eq(exerciseSessions.userId, userId)).orderBy(desc(exerciseSessions.createdAt)).limit(10),
        // Analyses Beck récentes
        this.db.select().from(beckAnalyses).where(eq(beckAnalyses.userId, userId)).orderBy(desc(beckAnalyses.createdAt)).limit(5),
        // Stratégies récentes
        this.db.select().from(antiCravingStrategies).where(eq(antiCravingStrategies.userId, userId)).orderBy(desc(antiCravingStrategies.createdAt)).limit(5)
      ]);
      const stats = userStatsResult[0] || {
        exercisesCompleted: 0,
        totalDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageCraving: 0,
        beckAnalysesCompleted: 0
      };
      const todayAvgCraving = Number(todaysCravings[0]?.avg || 0);
      const yesterdayAvgCraving = Number(yesterdaysCravings[0]?.avg || 0);
      const todaysCravingCount = Number(todaysCravings[0]?.count || 0);
      let cravingTrend = 0;
      if (yesterdayAvgCraving > 0) {
        cravingTrend = (todayAvgCraving - yesterdayAvgCraving) / yesterdayAvgCraving * 100;
      }
      const weeklyProgress = {
        exercisesCompleted: weeklyExercises[0]?.count || 0,
        beckAnalysesCompleted: weeklyBeckAnalyses[0]?.count || 0,
        strategiesUsed: weeklyStrategies[0]?.count || 0,
        totalActivities: (weeklyExercises[0]?.count || 0) + (weeklyBeckAnalyses[0]?.count || 0) + (weeklyStrategies[0]?.count || 0)
      };
      return {
        ...stats,
        // Totaux généraux
        totalCravings: totalCravings[0]?.count || 0,
        totalExerciseSessions: totalExerciseSessions[0]?.count || 0,
        totalBeckAnalyses: totalBeckAnalyses[0]?.count || 0,
        totalStrategies: totalStrategies[0]?.count || 0,
        avgCravingIntensity: avgCravingIntensity[0]?.avg || 0,
        // Statistiques temporelles corrigées
        todayCravingLevel: Number(todayAvgCraving) || 0,
        todayCravingCount: todaysCravingCount,
        cravingTrend: Number(cravingTrend) || 0,
        // Progrès hebdomadaire détaillé
        weeklyProgress,
        // Données récentes
        recentData: {
          cravings: recentCravings,
          sessions: recentSessions,
          beckAnalyses: recentAnalyses,
          strategies: recentStrategies
        }
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return {
        exercisesCompleted: 0,
        totalDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageCraving: 0,
        beckAnalysesCompleted: 0,
        totalCravings: 0,
        totalExerciseSessions: 0,
        totalBeckAnalyses: 0,
        totalStrategies: 0,
        avgCravingIntensity: 0,
        todayCravingLevel: 0,
        todayCravingCount: 0,
        cravingTrend: 0,
        weeklyProgress: {
          exercisesCompleted: 0,
          beckAnalysesCompleted: 0,
          strategiesUsed: 0,
          totalActivities: 0
        },
        recentData: {
          cravings: [],
          sessions: [],
          beckAnalyses: [],
          strategies: []
        }
      };
    }
  }
  // === UTILITY METHODS ===
  async initializeUserStats(userId) {
    const result = await this.db.insert(userStats).values({
      userId,
      exercisesCompleted: 0,
      totalDuration: 0,
      currentStreak: 0,
      longestStreak: 0,
      beckAnalysesCompleted: 0
    }).onConflictDoNothing().returning();
    if (result.length === 0) {
      const existing = await this.db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
      return existing[0];
    }
    return result[0];
  }
  async updateUserStats(userId, updates) {
    await this.db.update(userStats).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(userStats.userId, userId));
  }
  // === DEBUGGING HELPERS ===
  async debugGetAllTables() {
    try {
      const [
        allUsers,
        allExercises,
        allCravings,
        allSessions,
        allBeckAnalyses,
        allStrategies,
        allStats
      ] = await Promise.all([
        this.getAllUsers(),
        this.getAllExercises(),
        this.db.select().from(cravingEntries),
        this.db.select().from(exerciseSessions),
        this.db.select().from(beckAnalyses),
        this.db.select().from(antiCravingStrategies),
        this.db.select().from(userStats)
      ]);
      return {
        users: allUsers,
        exercises: allExercises,
        cravingEntries: allCravings,
        exerciseSessions: allSessions,
        beckAnalyses: allBeckAnalyses,
        strategies: allStrategies,
        userStats: allStats
      };
    } catch (error) {
      console.error("Error in debugGetAllTables:", error);
      return {};
    }
  }
  // === USER EMERGENCY ROUTINES ===
  async getEmergencyRoutines(userId) {
    try {
      const result = await this.db.select().from(emergencyRoutines).where(eq(emergencyRoutines.isActive, true)).orderBy(desc(emergencyRoutines.updatedAt));
      return result;
    } catch (error) {
      console.error("Error fetching emergency routines:", error);
      return [];
    }
  }
  async getEmergencyRoutineById(routineId) {
    try {
      const result = await this.db.select().from(emergencyRoutines).where(eq(emergencyRoutines.id, routineId)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error fetching emergency routine by ID:", error);
      return null;
    }
  }
  async createEmergencyRoutine(routineData) {
    try {
      const result = await this.db.insert(emergencyRoutines).values({
        ...routineData,
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating emergency routine:", error);
      throw new Error("Failed to create emergency routine");
    }
  }
  async updateEmergencyRoutine(routineId, updateData) {
    try {
      const result = await this.db.update(emergencyRoutines).set({
        ...updateData,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(emergencyRoutines.id, routineId)).returning();
      return result[0];
    } catch (error) {
      console.error("Error updating emergency routine:", error);
      throw new Error("Failed to update emergency routine");
    }
  }
  async deleteEmergencyRoutine(routineId) {
    try {
      const result = await this.db.delete(emergencyRoutines).where(eq(emergencyRoutines.id, routineId)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting emergency routine:", error);
      return false;
    }
  }
  // === NOUVELLES MÉTHODES POUR LES FONCTIONNALITÉS AVANCÉES ===
  // === GESTION DES SÉANCES ===
  async getSessions(filters) {
    try {
      const conditions = [];
      if (filters.userRole === "patient") {
        conditions.push(eq(customSessions.status, "published"));
      } else if (filters.userRole === "admin" || filters.userRole === "superadmin") {
      } else {
        conditions.push(
          or(
            eq(customSessions.status, "published"),
            eq(customSessions.creatorId, filters.userId)
          )
        );
      }
      if (filters.status) {
        conditions.push(eq(customSessions.status, filters.status));
      }
      if (filters.category) {
        conditions.push(eq(customSessions.category, filters.category));
      }
      const query = this.db.select().from(customSessions).where(and(...conditions.filter((c) => !!c)));
      const sessions = await query.orderBy(desc(customSessions.createdAt));
      const sessionsWithExercises = await Promise.all(
        sessions.map(async (session2) => {
          const elements = await this.db.select().from(sessionElements).where(eq(sessionElements.sessionId, session2.id)).orderBy(sessionElements.order);
          return {
            ...session2,
            exercises: elements,
            exerciseCount: elements.length
          };
        })
      );
      return sessionsWithExercises;
    } catch (error) {
      console.error("Error fetching sessions:", error);
      throw error;
    }
  }
  async createSession(sessionData) {
    try {
      console.log("[DEBUG] Creating session with data:", JSON.stringify(sessionData, null, 2));
      const { exercises: exercises2, blocks, ...sessionInfo } = sessionData;
      const insertData = {
        title: sessionInfo.title || "Sans titre",
        description: sessionInfo.description || "",
        category: sessionInfo.category || "maintenance",
        difficulty: sessionInfo.difficulty || "beginner",
        protocol: sessionInfo.protocol || "standard",
        totalDuration: sessionInfo.totalDuration || 0,
        creatorId: sessionInfo.creatorId,
        status: sessionInfo.status || "draft",
        tags: sessionInfo.tags ? sessionInfo.tags : [],
        protocolConfig: sessionInfo.protocolConfig || null,
        isPublic: sessionInfo.isPublic !== void 0 ? sessionInfo.isPublic : false,
        imageUrl: sessionInfo.imageUrl || null,
        warmupVideo: sessionInfo.warmupVideo || null,
        cooldownNotes: sessionInfo.cooldownNotes || null
      };
      console.log("[DEBUG] Insert data prepared:", insertData);
      const result = await this.db.insert(customSessions).values(insertData).returning();
      const createdSession = result[0];
      console.log("[DEBUG] Session created with ID:", createdSession.id);
      if (exercises2 && Array.isArray(exercises2) && exercises2.length > 0) {
        console.log("[DEBUG] Processing", exercises2.length, "exercises");
        const sessionExercises = exercises2.map((exercise, index) => ({
          sessionId: createdSession.id,
          exerciseId: exercise.exerciseId,
          variationId: exercise.variationId || null,
          order: exercise.order ?? index,
          duration: exercise.duration || 0,
          repetitions: exercise.repetitions || exercise.repetitionCount || 0,
          sets: exercise.sets || 1,
          restTime: exercise.restTime || 0,
          workTime: exercise.intervals?.work || exercise.workTime || null,
          restInterval: exercise.intervals?.rest || exercise.restInterval || null,
          timerSettings: exercise.intervals ? JSON.stringify(exercise.intervals) : null,
          notes: exercise.notes || null,
          isOptional: exercise.isOptional || false
        }));
        console.log("[DEBUG] Inserting session exercises:", sessionExercises);
        await this.db.insert(sessionElements).values(sessionExercises);
        console.log("[DEBUG] Session exercises inserted successfully");
      }
      if (blocks && Array.isArray(blocks) && blocks.length > 0) {
        console.log("[DEBUG] Processing", blocks.length, "blocks");
        let globalOrder = 0;
        for (const block of blocks) {
          if (block.exercises && Array.isArray(block.exercises)) {
            const blockExercises = block.exercises.map((exercise, index) => ({
              sessionId: createdSession.id,
              exerciseId: exercise.exerciseId,
              variationId: exercise.variationId || null,
              order: globalOrder++,
              duration: block.protocol?.workDuration || exercise.duration || 0,
              repetitions: block.protocol?.repsPerExercise || block.protocol?.repsPerMinute || 0,
              sets: block.protocol?.rounds || block.protocol?.cycles || 1,
              restTime: block.protocol?.restDuration || 0,
              workTime: block.protocol?.workDuration || null,
              restInterval: block.protocol?.restDuration || null,
              timerSettings: block.protocol ? JSON.stringify(block.protocol) : null,
              notes: block.notes || exercise.notes || null,
              isOptional: false
            }));
            console.log("[DEBUG] Inserting block exercises:", blockExercises);
            await this.db.insert(sessionElements).values(blockExercises);
          }
        }
        console.log("[DEBUG] All blocks processed successfully");
      }
      console.log("[DEBUG] Session creation completed:", createdSession.id);
      return createdSession;
    } catch (error) {
      console.error("[ERROR] Error creating session:", error);
      if (error instanceof Error) {
        console.error("[ERROR] Error message:", error.message);
        console.error("[ERROR] Error stack:", error.stack);
      }
      throw error;
    }
  }
  async updateSession(sessionId, updates) {
    try {
      const result = await this.db.update(customSessions).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(customSessions.id, sessionId)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Error updating session:", error);
      throw error;
    }
  }
  async publishSession(sessionId, patientIds) {
    try {
      const session2 = await this.updateSession(sessionId, { status: "published" });
      if (!session2) return null;
      if (patientIds && patientIds.length > 0) {
        const assignments = patientIds.map((patientId) => ({
          patientId,
          sessionId,
          status: "assigned"
        }));
        await this.db.insert(patientSessions).values(assignments);
      }
      return session2;
    } catch (error) {
      console.error("Error publishing session:", error);
      throw error;
    }
  }
  // === GESTION DES ASSIGNATIONS DE SÉANCES ===
  async getPatientSessions(patientId) {
    try {
      const sessions = await this.db.select({
        id: patientSessions.id,
        sessionId: patientSessions.sessionId,
        status: patientSessions.status,
        feedback: patientSessions.feedback,
        effort: patientSessions.effort,
        duration: patientSessions.duration,
        assignedAt: patientSessions.assignedAt,
        completedAt: patientSessions.completedAt,
        session: customSessions
      }).from(patientSessions).leftJoin(customSessions, eq(patientSessions.sessionId, customSessions.id)).where(eq(patientSessions.patientId, patientId)).orderBy(desc(patientSessions.assignedAt));
      const sessionsWithElements = await Promise.all(
        sessions.map(async (session2) => {
          if (session2.sessionId) {
            const elements = await this.db.select().from(sessionElements).where(eq(sessionElements.sessionId, session2.sessionId)).orderBy(sessionElements.order);
            return {
              ...session2,
              session: session2.session ? {
                ...session2.session,
                elements
              } : null
            };
          }
          return session2;
        })
      );
      return sessionsWithElements;
    } catch (error) {
      console.error("Error fetching patient sessions:", error);
      throw error;
    }
  }
  async completePatientSession(patientSessionId, data) {
    try {
      const existing = await this.db.select().from(patientSessions).where(eq(patientSessions.id, patientSessionId)).limit(1);
      if (!existing[0] || existing[0].patientId !== data.userId) {
        return null;
      }
      const result = await this.db.update(patientSessions).set({
        status: "done",
        feedback: data.feedback,
        effort: data.effort,
        duration: data.duration,
        completedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(patientSessions.id, patientSessionId)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Error completing patient session:", error);
      throw error;
    }
  }
  async getAllPatientSessions() {
    try {
      const sessions = await this.db.select({
        id: patientSessions.id,
        patientId: patientSessions.patientId,
        sessionId: patientSessions.sessionId,
        status: patientSessions.status,
        feedback: patientSessions.feedback,
        effort: patientSessions.effort,
        duration: patientSessions.duration,
        assignedAt: patientSessions.assignedAt,
        completedAt: patientSessions.completedAt,
        session: customSessions,
        // Informations du patient
        patient: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email
        }
      }).from(patientSessions).leftJoin(customSessions, eq(patientSessions.sessionId, customSessions.id)).leftJoin(users, eq(patientSessions.patientId, users.id)).orderBy(desc(patientSessions.assignedAt));
      return sessions;
    } catch (error) {
      console.error("Error fetching all patient sessions:", error);
      throw error;
    }
  }
  async deleteExercise(exerciseId) {
    try {
      const result = await this.db.delete(exercises).where(eq(exercises.id, exerciseId)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting exercise:", error);
      return false;
    }
  }
  async updateExercise(exerciseId, updates) {
    try {
      const result = await this.db.update(exercises).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(exercises.id, exerciseId)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Error updating exercise:", error);
      throw error;
    }
  }
  // === GESTION DES SÉANCES FAVORITES ===
  async getFavoriteSessions(userId) {
    try {
      const favorites = await this.db.select({
        id: favoriteSessions.id,
        userId: favoriteSessions.userId,
        sessionId: favoriteSessions.sessionId,
        customName: favoriteSessions.customName,
        customizedData: favoriteSessions.customizedData,
        createdAt: favoriteSessions.createdAt,
        session: customSessions
      }).from(favoriteSessions).leftJoin(customSessions, eq(favoriteSessions.sessionId, customSessions.id)).where(eq(favoriteSessions.userId, userId)).orderBy(desc(favoriteSessions.createdAt));
      return favorites.map((fav) => {
        if (fav.customizedData) {
          return {
            ...fav.customizedData,
            id: fav.id,
            title: fav.customName || fav.customizedData.title || fav.session?.title,
            isFavorite: true,
            customizedFrom: fav.sessionId
          };
        }
        return {
          ...fav.session,
          id: fav.id,
          title: fav.customName || fav.session?.title,
          isFavorite: true,
          customizedFrom: fav.sessionId
        };
      });
    } catch (error) {
      console.error("Error fetching favorite sessions:", error);
      throw error;
    }
  }
  async addFavoriteSession(data) {
    try {
      const result = await this.db.insert(favoriteSessions).values({
        id: crypto.randomUUID(),
        userId: data.userId,
        sessionId: data.sessionId,
        customName: data.customName,
        customizedData: data.customizedData,
        createdAt: /* @__PURE__ */ new Date()
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Error adding favorite session:", error);
      throw error;
    }
  }
  async deleteFavoriteSession(favoriteId, userId) {
    try {
      const existing = await this.db.select().from(favoriteSessions).where(eq(favoriteSessions.id, favoriteId)).limit(1);
      if (!existing[0] || existing[0].userId !== userId) {
        return false;
      }
      const result = await this.db.delete(favoriteSessions).where(eq(favoriteSessions.id, favoriteId)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting favorite session:", error);
      return false;
    }
  }
  // === DASHBOARD ADMINISTRATEUR ===
  async getAdminDashboardData() {
    try {
      const totalPatients = await this.db.select({ count: count() }).from(users).where(eq(users.role, "patient"));
      const totalSessions = await this.db.select({ count: count() }).from(customSessions);
      const totalExercises = await this.db.select({ count: count() }).from(exercises).where(eq(exercises.isActive, true));
      const completedSessions = await this.db.select({ count: count() }).from(patientSessions).where(eq(patientSessions.status, "done"));
      return {
        totalPatients: totalPatients[0]?.count || 0,
        totalSessions: totalSessions[0]?.count || 0,
        totalExercises: totalExercises[0]?.count || 0,
        completedSessions: completedSessions[0]?.count || 0
      };
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      throw error;
    }
  }
  async getPatientsWithSessions() {
    try {
      const patients = await this.db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        createdAt: users.createdAt
      }).from(users).where(eq(users.role, "patient")).orderBy(desc(users.createdAt));
      const patientsWithSessions = await Promise.all(
        patients.map(async (patient) => {
          const sessions = await this.getPatientSessions(patient.id);
          return {
            ...patient,
            sessions
          };
        })
      );
      return patientsWithSessions;
    } catch (error) {
      console.error("Error fetching patients with sessions:", error);
      throw error;
    }
  }
  // Les méthodes getAllUsersWithStats, getUserById et deleteUser sont déjà définies plus haut
  // === CONTENUS ÉDUCATIFS ===
  async getEducationalContents(filters = {}) {
    try {
      let query = this.db.select().from(educationalContents);
      const conditions = [eq(educationalContents.isActive, true)];
      if (filters.categoryId) {
        conditions.push(eq(educationalContents.categoryId, filters.categoryId));
      }
      if (filters.type) {
        conditions.push(eq(educationalContents.type, filters.type));
      }
      if (filters.difficulty) {
        conditions.push(eq(educationalContents.difficulty, filters.difficulty));
      }
      if (filters.status) {
        conditions.push(eq(educationalContents.status, filters.status));
      }
      if (filters.isRecommended !== void 0) {
        conditions.push(eq(educationalContents.isRecommended, filters.isRecommended));
      }
      if (filters.search) {
        conditions.push(
          sql2`(${educationalContents.title} ILIKE ${`%${filters.search}%`} OR ${educationalContents.description} ILIKE ${`%${filters.search}%`})`
        );
      }
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      query = query.orderBy(desc(educationalContents.createdAt));
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.offset(filters.offset);
      }
      return await query;
    } catch (error) {
      console.error("Error fetching educational contents:", error);
      throw error;
    }
  }
  async getEducationalContentById(id) {
    try {
      const result = await this.db.select().from(educationalContents).where(and(eq(educationalContents.id, id), eq(educationalContents.isActive, true))).limit(1);
      if (result.length > 0) {
        await this.db.update(educationalContents).set({
          viewCount: sql2`${educationalContents.viewCount} + 1`
        }).where(eq(educationalContents.id, id));
      }
      return result[0] || null;
    } catch (error) {
      console.error("Error fetching educational content by id:", error);
      throw error;
    }
  }
  async createEducationalContent(data) {
    try {
      const result = await this.db.insert(educationalContents).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating educational content:", error);
      throw error;
    }
  }
  async updateEducationalContent(id, data) {
    try {
      const existingContent = await this.db.select().from(educationalContents).where(eq(educationalContents.id, id)).limit(1);
      if (!existingContent || existingContent.length === 0) {
        console.error("Educational content not found for update:", id);
        return null;
      }
      const updateData = {
        ...data,
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (updateData.tags && Array.isArray(updateData.tags)) {
        updateData.tags = updateData.tags.filter((tag) => tag && tag.trim().length > 0);
      }
      const result = await this.db.update(educationalContents).set(updateData).where(eq(educationalContents.id, id)).returning();
      console.log("\u2705 Educational content updated successfully:", id);
      return result[0] || null;
    } catch (error) {
      console.error("\u274C Error updating educational content:", error);
      throw error;
    }
  }
  async deleteEducationalContent(id) {
    try {
      const result = await this.db.update(educationalContents).set({ isActive: false }).where(eq(educationalContents.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting educational content:", error);
      throw error;
    }
  }
  // === CATÉGORIES DE CONTENU ===
  async getContentCategories() {
    try {
      return await this.db.select().from(contentCategories).where(eq(contentCategories.isActive, true)).orderBy(contentCategories.order, contentCategories.name);
    } catch (error) {
      console.error("Error fetching content categories:", error);
      throw error;
    }
  }
  async createContentCategory(data) {
    try {
      const result = await this.db.insert(contentCategories).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating content category:", error);
      throw error;
    }
  }
  async updateContentCategory(id, data) {
    try {
      const result = await this.db.update(contentCategories).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(contentCategories.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Error updating content category:", error);
      throw error;
    }
  }
  async deleteContentCategory(id) {
    try {
      const result = await this.db.update(contentCategories).set({ isActive: false }).where(eq(contentCategories.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting content category:", error);
      throw error;
    }
  }
  // === TAGS DE CONTENU ===
  async getContentTags() {
    try {
      return await this.db.select().from(contentTags).where(eq(contentTags.isActive, true)).orderBy(desc(contentTags.usageCount), contentTags.name);
    } catch (error) {
      console.error("Error fetching content tags:", error);
      throw error;
    }
  }
  async createContentTag(data) {
    try {
      const result = await this.db.insert(contentTags).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating content tag:", error);
      throw error;
    }
  }
  // === INTERACTIONS UTILISATEUR ===
  async recordContentInteraction(data) {
    try {
      const result = await this.db.insert(contentInteractions).values(data).returning();
      if (data.interactionType === "like") {
        await this.db.update(educationalContents).set({
          likeCount: sql2`${educationalContents.likeCount} + 1`
        }).where(eq(educationalContents.id, data.contentId));
      }
      return result[0];
    } catch (error) {
      console.error("Error recording content interaction:", error);
      throw error;
    }
  }
  async getUserContentInteractions(userId, interactionType) {
    try {
      let query = this.db.select().from(contentInteractions).where(eq(contentInteractions.userId, userId));
      if (interactionType) {
        query = query.where(
          and(
            eq(contentInteractions.userId, userId),
            eq(contentInteractions.interactionType, interactionType)
          )
        );
      }
      return await query.orderBy(desc(contentInteractions.createdAt));
    } catch (error) {
      console.error("Error fetching user content interactions:", error);
      throw error;
    }
  }
  // === STATISTIQUES ADMINISTRATEUR ===
  async getAdminStats() {
    try {
      const [totalPatientsResult] = await this.db.select({ count: count() }).from(users).where(eq(users.role, "patient"));
      const [activePatientsResult] = await this.db.select({ count: count() }).from(users).where(
        and(
          eq(users.role, "patient"),
          eq(users.isActive, true)
        )
      );
      const [totalExercisesResult] = await this.db.select({ count: count() }).from(exercises);
      const [totalSessionsResult] = await this.db.select({ count: count() }).from(exerciseSessions);
      const [totalCravingsResult] = await this.db.select({ count: count() }).from(cravingEntries);
      const [totalContentResult] = await this.db.select({ count: count() }).from(educationalContents).where(eq(educationalContents.isActive, true));
      const oneWeekAgo = /* @__PURE__ */ new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const [newUsersResult] = await this.db.select({ count: count() }).from(users).where(
        and(
          eq(users.role, "patient"),
          sql2`${users.createdAt} >= ${oneWeekAgo.toISOString()}`
        )
      );
      const [recentSessionsResult] = await this.db.select({ count: count() }).from(exerciseSessions).where(sql2`${exerciseSessions.completedAt} >= ${oneWeekAgo.toISOString()}`);
      const [recentCravingsResult] = await this.db.select({ count: count() }).from(cravingEntries).where(sql2`${cravingEntries.timestamp} >= ${oneWeekAgo.toISOString()}`);
      return {
        totalPatients: totalPatientsResult?.count || 0,
        activePatients: activePatientsResult?.count || 0,
        totalExercises: totalExercisesResult?.count || 0,
        totalSessions: totalSessionsResult?.count || 0,
        totalCravings: totalCravingsResult?.count || 0,
        totalContent: totalContentResult?.count || 0,
        recentActivity: {
          newUsers: newUsersResult?.count || 0,
          completedSessions: recentSessionsResult?.count || 0,
          cravingEntries: recentCravingsResult?.count || 0
        }
      };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      throw error;
    }
  }
};
var storage = new Storage();

// server/auth.ts
var AuthService = class {
  static async hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
  static async register(userData) {
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("Un utilisateur avec cet email existe d\xE9j\xE0");
    }
    const authorizedAdminEmail = "doriansarry@yahoo.fr";
    const requestedRole = userData.role || "patient";
    if (requestedRole === "admin" && userData.email.toLowerCase() !== authorizedAdminEmail.toLowerCase()) {
      throw new Error("Acc\xE8s administrateur non autoris\xE9 pour cet email");
    }
    const hashedPassword = await this.hashPassword(userData.password);
    const newUser = {
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      role: requestedRole
    };
    const user = await storage.createUser(newUser);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
  }
  static async login(email, password) {
    console.log("[AUTH] Login attempt for:", email);
    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log("[AUTH] User not found:", email);
      throw new Error("Email ou mot de passe incorrect");
    }
    console.log("[AUTH] User found:", user.email, "Role:", user.role);
    console.log("[AUTH] Verifying password...");
    const isValidPassword = await this.verifyPassword(password, user.password);
    console.log("[AUTH] Password valid:", isValidPassword);
    if (!isValidPassword) {
      throw new Error("Email ou mot de passe incorrect");
    }
    if (!user.isActive) {
      console.log("[AUTH] User inactive:", email);
      throw new Error("Compte d\xE9sactiv\xE9");
    }
    console.log("[AUTH] Login successful for:", email);
    await storage.updateUserLastLogin(user.id);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
  }
  static async getUserById(id) {
    const user = await storage.getUser(id);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
  }
  static async updateUser(userId, data) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("Utilisateur non trouv\xE9");
    }
    if (data.email && data.email !== user.email) {
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        throw new Error("Cet email est d\xE9j\xE0 utilis\xE9 par un autre compte.");
      }
    }
    const updatedUser = await storage.updateUser(userId, {
      firstName: data.firstName ?? user.firstName,
      lastName: data.lastName ?? user.lastName,
      email: data.email ?? user.email
    });
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role
    };
  }
  static async updatePassword(userId, oldPassword, newPassword) {
    if (!oldPassword || !newPassword) {
      throw new Error("L'ancien et le nouveau mot de passe sont requis.");
    }
    if (newPassword.length < 6) {
      throw new Error("Le nouveau mot de passe doit contenir au moins 6 caract\xE8res.");
    }
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("Utilisateur non trouv\xE9.");
    }
    const isMatch = await this.verifyPassword(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("L'ancien mot de passe est incorrect.");
    }
    const hashedNewPassword = await this.hashPassword(newPassword);
    await storage.updatePassword(userId, hashedNewPassword);
  }
};
function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Authentification requise" });
  }
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Authentification requise" });
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Acc\xE8s administrateur requis" });
  }
  next();
}

// server/routes.ts
function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      console.log("\u{1F4DD} Registration attempt for:", email);
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caract\xE8res" });
      }
      const user = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        role: role || "patient"
      });
      req.session.user = user;
      console.log("\u2705 User registered successfully:", email);
      res.json({
        user: req.session.user,
        message: "Inscription r\xE9ussie"
      });
    } catch (error) {
      console.error("\u274C Registration error:", error);
      res.status(500).json({
        message: error.message || "Erreur lors de l'inscription"
      });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("\u{1F510} Login attempt for:", email);
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }
      const user = await AuthService.login(email, password);
      req.session.user = user;
      console.log("\u2705 User logged in successfully:", email);
      res.json({
        user: req.session.user,
        message: "Connexion r\xE9ussie"
      });
    } catch (error) {
      console.error("\u274C Login error:", error);
      res.status(401).json({
        message: error.message || "Erreur lors de la connexion"
      });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    const userEmail = req.session?.user?.email;
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Erreur lors de la d\xE9connexion" });
      }
      console.log("\u{1F44B} User logged out:", userEmail);
      res.json({ message: "D\xE9connexion r\xE9ussie" });
    });
  });
  app2.get("/api/auth/me", requireAuth, (req, res) => {
    res.json({ user: req.session.user });
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email requis" });
      }
      console.log("\u{1F511} Forgot password request for:", email);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "Si cet email existe, le mot de passe sera envoy\xE9 par email." });
      }
      console.log("\u{1F4E7} Simulated email sent to:", email);
      console.log("\u{1F4E7} Password would be sent to user email:", user.email);
      res.json({
        message: "Un email contenant votre mot de passe a \xE9t\xE9 envoy\xE9 \xE0 votre adresse email.",
        // En production, ne jamais renvoyer le mot de passe dans la réponse
        demo_note: "Dans cette d\xE9mo, votre mot de passe a \xE9t\xE9 envoy\xE9 par email."
      });
    } catch (error) {
      console.error("\u274C Forgot password error:", error);
      res.status(500).json({
        message: "Erreur lors de l'envoi de l'email"
      });
    }
  });
  app2.put("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const { firstName, lastName, email } = req.body;
      const updatedUser = await AuthService.updateUser(req.session.user.id, {
        firstName,
        lastName,
        email
      });
      req.session.user = updatedUser;
      res.json({
        user: updatedUser,
        message: "Profil mis \xE0 jour avec succ\xE8s"
      });
    } catch (error) {
      console.error("\u274C Profile update error:", error);
      res.status(400).json({
        message: error.message || "Erreur lors de la mise \xE0 jour"
      });
    }
  });
  app2.put("/api/auth/password", requireAuth, async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      await AuthService.updatePassword(req.session.user.id, oldPassword, newPassword);
      res.json({ message: "Mot de passe mis \xE0 jour avec succ\xE8s" });
    } catch (error) {
      console.error("\u274C Password update error:", error);
      res.status(400).json({
        message: error.message || "Erreur lors du changement de mot de passe"
      });
    }
  });
  app2.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des utilisateurs" });
    }
  });
  app2.get("/api/exercises", requireAuth, async (req, res) => {
    try {
      const exercises2 = await storage.getAllExercises();
      res.json(exercises2);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des exercices" });
    }
  });
  app2.get("/api/exercises/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const exercise = await storage.getExerciseById(id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercice non trouv\xE9" });
      }
      res.json(exercise);
    } catch (error) {
      console.error("Error fetching exercise:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration de l'exercice" });
    }
  });
  app2.post("/api/exercises", requireAdmin, async (req, res) => {
    try {
      const {
        title,
        description,
        duration,
        difficulty,
        category,
        instructions,
        benefits,
        imageUrl,
        videoUrl,
        mediaUrl,
        tags,
        variable1,
        variable2,
        variable3,
        isActive
      } = req.body;
      console.log("\u{1F4DD} Creating exercise with data:", req.body);
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        console.error("\u274C Invalid title:", title);
        return res.status(400).json({ message: "Titre requis et non vide" });
      }
      if (!description || typeof description !== "string" || description.trim().length === 0) {
        console.error("\u274C Invalid description:", description);
        return res.status(400).json({ message: "Description requise et non vide" });
      }
      const validCategories = ["craving_reduction", "relaxation", "energy_boost", "emotion_management", "general"];
      const validDifficulties = ["beginner", "intermediate", "advanced"];
      const finalCategory = validCategories.includes(category) ? category : "craving_reduction";
      const finalDifficulty = validDifficulties.includes(difficulty) ? difficulty : "beginner";
      let finalDuration = 15;
      if (duration !== void 0 && duration !== null) {
        const durationNum = Number(duration);
        if (!isNaN(durationNum) && durationNum > 0 && durationNum <= 180) {
          finalDuration = durationNum;
        }
      }
      const exerciseData = {
        title: title.trim(),
        description: description.trim(),
        duration: finalDuration,
        difficulty: finalDifficulty,
        category: finalCategory,
        instructions: instructions && typeof instructions === "string" ? instructions.trim() : null,
        benefits: benefits && typeof benefits === "string" ? benefits.trim() : null,
        imageUrl: imageUrl && typeof imageUrl === "string" ? imageUrl.trim() : null,
        videoUrl: videoUrl && typeof videoUrl === "string" ? videoUrl.trim() : null,
        mediaUrl: mediaUrl && typeof mediaUrl === "string" ? mediaUrl.trim() : null,
        tags: Array.isArray(tags) ? [...tags] : [],
        variable1: variable1 && typeof variable1 === "string" ? variable1.trim() : null,
        variable2: variable2 && typeof variable2 === "string" ? variable2.trim() : null,
        variable3: variable3 && typeof variable3 === "string" ? variable3.trim() : null,
        isActive: typeof isActive === "boolean" ? isActive : true
      };
      console.log("\u{1F50D} Processed exercise data:", exerciseData);
      const exercise = await storage.createExercise(exerciseData);
      console.log("\u2705 Exercise created successfully:", exercise.id);
      res.json(exercise);
    } catch (error) {
      console.error("\u274C Error creating exercise:", error);
      res.status(500).json({
        message: error.message || "Erreur lors de la cr\xE9ation de l'exercice",
        details: error.stack
      });
    }
  });
  app2.post("/api/cravings", requireAuth, async (req, res) => {
    try {
      const { intensity, triggers, emotions, notes } = req.body;
      console.log("\u{1F4DD} Craving entry request for user:", req.session.user.id);
      console.log("\u{1F4DD} Craving data:", { intensity, triggers, emotions, notes });
      const intensityNum = Number(intensity);
      if (isNaN(intensityNum) || intensityNum < 0 || intensityNum > 10) {
        console.error("\u274C Invalid intensity:", intensity);
        return res.status(400).json({ message: "Intensit\xE9 invalide (0-10 requis)" });
      }
      const cravingData = {
        userId: req.session.user.id,
        intensity: intensityNum,
        triggers: Array.isArray(triggers) ? triggers : [],
        emotions: Array.isArray(emotions) ? emotions : [],
        notes: notes && typeof notes === "string" ? notes.trim() : null
      };
      console.log("\u{1F50D} Processed craving data:", cravingData);
      const craving = await storage.createCravingEntry(cravingData);
      console.log("\u2705 Craving entry created successfully:", craving.id);
      res.json(craving);
    } catch (error) {
      console.error("\u274C Error creating craving entry:", error);
      res.status(500).json({
        message: "Erreur lors de l'enregistrement",
        error: error.message
      });
    }
  });
  app2.get("/api/cravings", requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const cravings = await storage.getCravingEntriesByUser(req.session.user.id, limit);
      res.json(cravings);
    } catch (error) {
      console.error("Error fetching cravings:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration" });
    }
  });
  app2.post("/api/exercise-sessions", requireAuth, async (req, res) => {
    try {
      const { exerciseId, duration, completed, notes, cravingBefore, cravingAfter } = req.body;
      let validExerciseId = exerciseId;
      if (exerciseId) {
        const exercise = await storage.getExerciseById(exerciseId);
        if (!exercise) {
          const exercises2 = await storage.getAllExercises();
          if (exercises2.length > 0) {
            validExerciseId = exercises2[0].id;
          } else {
            return res.status(400).json({ message: "Aucun exercice disponible dans la base de donn\xE9es" });
          }
        }
      } else {
        const exercises2 = await storage.getAllExercises();
        if (exercises2.length > 0) {
          validExerciseId = exercises2[0].id;
        } else {
          return res.status(400).json({ message: "Aucun exercice disponible dans la base de donn\xE9es" });
        }
      }
      const session2 = await storage.createExerciseSession({
        userId: req.session.user.id,
        exerciseId: validExerciseId,
        duration: duration || 0,
        completed: completed || false,
        cravingBefore: cravingBefore || null,
        cravingAfter: cravingAfter || null,
        notes: notes || null
      });
      res.json(session2);
    } catch (error) {
      console.error("Error creating exercise session:", error);
      res.status(500).json({ message: "Erreur lors de l'enregistrement" });
    }
  });
  app2.get("/api/exercise-sessions", requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const sessions = await storage.getExerciseSessionsByUser(req.session.user.id, limit);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching exercise sessions:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration" });
    }
  });
  app2.get("/api/psycho-education", requireAuth, async (req, res) => {
    try {
      const content = await storage.getAllPsychoEducationContent();
      res.json(content);
    } catch (error) {
      console.error("Error fetching psycho-education content:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration du contenu" });
    }
  });
  app2.post("/api/psycho-education", requireAdmin, async (req, res) => {
    try {
      const {
        title,
        content,
        category,
        type,
        difficulty,
        estimatedReadTime,
        imageUrl,
        videoUrl,
        audioUrl
      } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: "Titre et contenu requis" });
      }
      const newContent = await storage.createPsychoEducationContent({
        title,
        content,
        category: category || "addiction",
        type: type || "article",
        difficulty: difficulty || "beginner",
        estimatedReadTime: estimatedReadTime ? parseInt(estimatedReadTime) : null,
        imageUrl,
        videoUrl,
        audioUrl
      });
      res.json(newContent);
    } catch (error) {
      console.error("Error creating psycho-education content:", error);
      res.status(500).json({ message: "Erreur lors de la cr\xE9ation du contenu" });
    }
  });
  app2.put("/api/psycho-education/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const content = await storage.updatePsychoEducationContent(id, updateData);
      if (!content) {
        return res.status(404).json({ message: "Contenu non trouv\xE9" });
      }
      res.json(content);
    } catch (error) {
      console.error("Error updating psycho-education content:", error);
      res.status(500).json({ message: "Erreur lors de la mise \xE0 jour du contenu" });
    }
  });
  app2.delete("/api/psycho-education/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePsychoEducationContent(id);
      if (!success) {
        return res.status(404).json({ message: "Contenu non trouv\xE9" });
      }
      res.json({ message: "Contenu supprim\xE9 avec succ\xE8s" });
    } catch (error) {
      console.error("Error deleting psycho-education content:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du contenu" });
    }
  });
  app2.post("/api/beck-analyses", requireAuth, async (req, res) => {
    try {
      const { situation, automaticThoughts, emotions, emotionIntensity, rationalResponse, newFeeling, newIntensity } = req.body;
      console.log("\u{1F4DD} Beck analysis request for user:", req.session.user.id);
      console.log("\u{1F4DD} Beck analysis data:", { situation, automaticThoughts, emotions, emotionIntensity, rationalResponse, newFeeling, newIntensity });
      if (!situation || typeof situation !== "string" || situation.trim().length === 0) {
        console.error("\u274C Invalid situation:", situation);
        return res.status(400).json({ message: "Situation requise et non vide" });
      }
      if (!automaticThoughts || typeof automaticThoughts !== "string" || automaticThoughts.trim().length === 0) {
        console.error("\u274C Invalid automaticThoughts:", automaticThoughts);
        return res.status(400).json({ message: "Pens\xE9es automatiques requises et non vides" });
      }
      if (!emotions || typeof emotions !== "string" || emotions.trim().length === 0) {
        console.error("\u274C Invalid emotions:", emotions);
        return res.status(400).json({ message: "\xC9motions requises et non vides" });
      }
      let emotionIntensityNum = null;
      if (emotionIntensity !== null && emotionIntensity !== void 0) {
        emotionIntensityNum = Number(emotionIntensity);
        if (isNaN(emotionIntensityNum) || emotionIntensityNum < 1 || emotionIntensityNum > 10) {
          console.error("\u274C Invalid emotionIntensity:", emotionIntensity);
          return res.status(400).json({ message: "Intensit\xE9 \xE9motionnelle invalide (1-10 requis)" });
        }
      }
      let newIntensityNum = null;
      if (newIntensity !== null && newIntensity !== void 0) {
        newIntensityNum = Number(newIntensity);
        if (isNaN(newIntensityNum) || newIntensityNum < 1 || newIntensityNum > 10) {
          console.error("\u274C Invalid newIntensity:", newIntensity);
          return res.status(400).json({ message: "Nouvelle intensit\xE9 invalide (1-10 requis)" });
        }
      }
      const analysisData = {
        userId: req.session.user.id,
        situation: situation.trim(),
        automaticThoughts: automaticThoughts.trim(),
        emotions: emotions.trim(),
        emotionIntensity: emotionIntensityNum,
        rationalResponse: rationalResponse && typeof rationalResponse === "string" ? rationalResponse.trim() : null,
        newFeeling: newFeeling && typeof newFeeling === "string" ? newFeeling.trim() : null,
        newIntensity: newIntensityNum
      };
      console.log("\u{1F50D} Processed Beck analysis data:", analysisData);
      const analysis = await storage.createBeckAnalysis(analysisData);
      console.log("\u2705 Beck analysis created successfully:", analysis.id);
      res.json(analysis);
    } catch (error) {
      console.error("\u274C Error creating Beck analysis:", error);
      res.status(500).json({
        message: "Erreur lors de la cr\xE9ation de l'analyse",
        error: error.message
      });
    }
  });
  app2.get("/api/beck-analyses", requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const analyses = await storage.getBeckAnalysesByUser(req.session.user.id, limit);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching Beck analyses:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des analyses" });
    }
  });
  app2.post("/api/strategies", requireAuth, async (req, res) => {
    try {
      const { strategies } = req.body;
      console.log("\u{1F4DD} Strategies save request for user:", req.session.user.id);
      console.log("\u{1F4DD} Received strategies data:", strategies);
      if (!strategies || !Array.isArray(strategies) || strategies.length === 0) {
        console.warn("\u274C No strategies provided or invalid format");
        return res.status(400).json({ message: "Au moins une strat\xE9gie requise" });
      }
      const savedStrategies = [];
      for (let i = 0; i < strategies.length; i++) {
        const strategyData = strategies[i];
        const { context, exercise, effort, duration, cravingBefore, cravingAfter } = strategyData;
        console.log(`\u{1F50D} Validating strategy ${i + 1}:`, strategyData);
        if (!context || typeof context !== "string") {
          console.error(`\u274C Invalid context for strategy ${i + 1}:`, context);
          return res.status(400).json({ message: `Contexte invalide pour la strat\xE9gie ${i + 1}` });
        }
        if (!exercise || typeof exercise !== "string" || exercise.trim().length === 0) {
          console.error(`\u274C Invalid exercise for strategy ${i + 1}:`, exercise);
          return res.status(400).json({ message: `Description d'exercice requise pour la strat\xE9gie ${i + 1}` });
        }
        if (!effort || typeof effort !== "string") {
          console.error(`\u274C Invalid effort for strategy ${i + 1}:`, effort);
          return res.status(400).json({ message: `Niveau d'effort invalide pour la strat\xE9gie ${i + 1}` });
        }
        const durationNum = Number(duration);
        if (isNaN(durationNum) || durationNum < 1 || durationNum > 180) {
          console.error(`\u274C Invalid duration for strategy ${i + 1}:`, duration);
          return res.status(400).json({ message: `Dur\xE9e invalide pour la strat\xE9gie ${i + 1} (1-180 min requis)` });
        }
        const cravingBeforeNum = Number(cravingBefore);
        if (isNaN(cravingBeforeNum) || cravingBeforeNum < 0 || cravingBeforeNum > 10) {
          console.error(`\u274C Invalid cravingBefore for strategy ${i + 1}:`, cravingBefore);
          return res.status(400).json({ message: `Craving avant invalide pour la strat\xE9gie ${i + 1} (0-10 requis)` });
        }
        const cravingAfterNum = Number(cravingAfter);
        if (isNaN(cravingAfterNum) || cravingAfterNum < 0 || cravingAfterNum > 10) {
          console.error(`\u274C Invalid cravingAfter for strategy ${i + 1}:`, cravingAfter);
          return res.status(400).json({ message: `Craving apr\xE8s invalide pour la strat\xE9gie ${i + 1} (0-10 requis)` });
        }
        try {
          const strategy = await storage.createStrategy({
            userId: req.session.user.id,
            context: context.trim(),
            exercise: exercise.trim(),
            effort: effort.trim(),
            duration: durationNum,
            cravingBefore: cravingBeforeNum,
            cravingAfter: cravingAfterNum
          });
          console.log(`\u2705 Strategy ${i + 1} created successfully:`, strategy.id);
          savedStrategies.push(strategy);
        } catch (dbError) {
          console.error(`\u274C Database error for strategy ${i + 1}:`, dbError);
          return res.status(500).json({ message: `Erreur de base de donn\xE9es pour la strat\xE9gie ${i + 1}: ${dbError.message}` });
        }
      }
      console.log(`\u2705 All ${savedStrategies.length} strategies saved successfully`);
      res.json({ strategies: savedStrategies, message: `${savedStrategies.length} strat\xE9gies sauvegard\xE9es avec succ\xE8s` });
    } catch (error) {
      console.error("\u274C Unexpected error creating strategies:", error);
      res.status(500).json({
        message: "Erreur lors de la cr\xE9ation des strat\xE9gies",
        error: error.message
      });
    }
  });
  app2.get("/api/strategies", requireAuth, async (req, res) => {
    try {
      const strategies = await storage.getStrategiesByUser(req.session.user.id);
      res.json(strategies);
    } catch (error) {
      console.error("Error fetching strategies:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des strat\xE9gies" });
    }
  });
  app2.put("/api/strategies/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { context, exercise, effort, duration, cravingBefore, cravingAfter } = req.body;
      const strategy = await storage.updateStrategy(id, req.session.user.id, {
        context,
        exercise,
        effort,
        duration,
        cravingBefore,
        cravingAfter
      });
      if (!strategy) {
        return res.status(404).json({ message: "Strat\xE9gie non trouv\xE9e" });
      }
      res.json(strategy);
    } catch (error) {
      console.error("Error updating strategy:", error);
      res.status(500).json({ message: "Erreur lors de la mise \xE0 jour de la strat\xE9gie" });
    }
  });
  app2.delete("/api/strategies/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteStrategy(id, req.session.user.id);
      if (!success) {
        return res.status(404).json({ message: "Strat\xE9gie non trouv\xE9e" });
      }
      res.json({ message: "Strat\xE9gie supprim\xE9e avec succ\xE8s" });
    } catch (error) {
      console.error("Error deleting strategy:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de la strat\xE9gie" });
    }
  });
  app2.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.session.user.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des statistiques" });
    }
  });
  app2.get("/api/relaxation-exercises", requireAuth, async (req, res) => {
    try {
      const exercises2 = await storage.getRelaxationExercises();
      res.json(exercises2);
    } catch (error) {
      console.error("Error fetching relaxation exercises:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des exercices de relaxation" });
    }
  });
  app2.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des statistiques" });
    }
  });
  app2.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsersWithStats();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des utilisateurs" });
    }
  });
  app2.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userToDelete = await storage.getUserById(id);
      if (userToDelete?.role === "admin") {
        return res.status(403).json({ message: "Impossible de supprimer un administrateur" });
      }
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "Utilisateur non trouv\xE9" });
      }
      res.json({ message: "Utilisateur supprim\xE9 avec succ\xE8s" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
    }
  });
  app2.get("/api/emergency-routines", requireAuth, async (req, res) => {
    try {
      const routines = await storage.getEmergencyRoutines(req.session.user.id);
      res.json(routines);
    } catch (error) {
      console.error("Error fetching emergency routines:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des routines d'urgence" });
    }
  });
  app2.post("/api/emergency-routines", requireAuth, async (req, res) => {
    try {
      if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Seuls les admins peuvent cr\xE9er des routines d'urgence" });
      }
      const routine = await storage.createEmergencyRoutine(req.body);
      res.json(routine);
    } catch (error) {
      console.error("Error creating emergency routine:", error);
      res.status(500).json({ message: "Erreur lors de la cr\xE9ation de la routine d'urgence" });
    }
  });
  app2.put("/api/emergency-routines/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Seuls les admins peuvent modifier les routines d'urgence" });
      }
      const existingRoutine = await storage.getEmergencyRoutineById(id);
      if (!existingRoutine) {
        return res.status(404).json({ message: "Routine non trouv\xE9e" });
      }
      const routine = await storage.updateEmergencyRoutine(id, req.body);
      res.json(routine);
    } catch (error) {
      console.error("Error updating emergency routine:", error);
      res.status(500).json({ message: "Erreur lors de la mise \xE0 jour de la routine d'urgence" });
    }
  });
  app2.delete("/api/emergency-routines/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Seuls les admins peuvent supprimer les routines d'urgence" });
      }
      const existingRoutine = await storage.getEmergencyRoutineById(id);
      if (!existingRoutine) {
        return res.status(404).json({ message: "Routine non trouv\xE9e" });
      }
      const success = await storage.deleteEmergencyRoutine(id);
      if (success) {
        res.json({ message: "Routine d'urgence supprim\xE9e avec succ\xE8s" });
      } else {
        res.status(500).json({ message: "Erreur lors de la suppression" });
      }
    } catch (error) {
      console.error("Error deleting emergency routine:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de la routine d'urgence" });
    }
  });
  app2.get("/api/sessions", requireAuth, async (req, res) => {
    try {
      const { status, tags, category } = req.query;
      const sessions = await storage.getSessions({
        status,
        tags: tags ? tags.split(",") : void 0,
        category: category ? category : void 0,
        userId: req.session.user.id,
        userRole: req.session.user.role || "user"
      });
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des s\xE9ances" });
    }
  });
  app2.post("/api/sessions", requireAdmin, async (req, res) => {
    try {
      console.log("[POST /api/sessions] Received session data:", JSON.stringify(req.body, null, 2));
      const sessionData = {
        ...req.body,
        creatorId: req.session.user.id,
        status: req.body.status || "draft"
      };
      console.log("[POST /api/sessions] Prepared session data with creatorId:", sessionData.creatorId);
      const session2 = await storage.createSession(sessionData);
      console.log("[POST /api/sessions] Session created successfully:", session2.id);
      res.json(session2);
    } catch (error) {
      console.error("[POST /api/sessions] Error creating session:", error);
      console.error("[POST /api/sessions] Error details:", error.message, error.stack);
      res.status(500).json({
        message: "Erreur lors de la cr\xE9ation de la s\xE9ance",
        error: error.message || "Unknown error"
      });
    }
  });
  app2.put("/api/sessions/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const session2 = await storage.updateSession(id, req.body);
      if (!session2) {
        return res.status(404).json({ message: "S\xE9ance non trouv\xE9e" });
      }
      res.json(session2);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Erreur lors de la mise \xE0 jour de la s\xE9ance" });
    }
  });
  app2.post("/api/sessions/:id/publish", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { patientIds } = req.body;
      const session2 = await storage.publishSession(id, patientIds);
      if (!session2) {
        return res.status(404).json({ message: "S\xE9ance non trouv\xE9e" });
      }
      res.json({
        message: "S\xE9ance publi\xE9e avec succ\xE8s",
        session: session2,
        assignedPatients: patientIds?.length || 0
      });
    } catch (error) {
      console.error("Error publishing session:", error);
      res.status(500).json({ message: "Erreur lors de la publication de la s\xE9ance" });
    }
  });
  app2.get("/api/patient-sessions", requireAuth, async (req, res) => {
    try {
      const patientSessions2 = await storage.getPatientSessions(req.session.user.id);
      res.json(patientSessions2);
    } catch (error) {
      console.error("Error fetching patient sessions:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des s\xE9ances" });
    }
  });
  app2.post("/api/patient-sessions/:id/complete", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { feedback, effort, duration } = req.body;
      const patientSession = await storage.completePatientSession(id, {
        feedback,
        effort: effort ? parseInt(effort) : void 0,
        duration: duration ? parseInt(duration) : void 0,
        userId: req.session.user.id
      });
      if (!patientSession) {
        return res.status(404).json({ message: "S\xE9ance non trouv\xE9e ou acc\xE8s refus\xE9" });
      }
      res.json(patientSession);
    } catch (error) {
      console.error("Error completing patient session:", error);
      res.status(500).json({ message: "Erreur lors de la finalisation de la s\xE9ance" });
    }
  });
  app2.get("/api/patient-sessions/favorites", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const favoriteSessions2 = await storage.getFavoriteSessions(userId);
      res.json(favoriteSessions2);
    } catch (error) {
      console.error("Error fetching favorite sessions:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des s\xE9ances favorites" });
    }
  });
  app2.post("/api/patient-sessions/favorites", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { sessionId, customName, customizedData } = req.body;
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID requis" });
      }
      const favoriteSession = await storage.addFavoriteSession({
        userId,
        sessionId,
        customName,
        customizedData
      });
      res.json(favoriteSession);
    } catch (error) {
      console.error("Error adding favorite session:", error);
      res.status(500).json({ message: "Erreur lors de l'ajout de la s\xE9ance favorite" });
    }
  });
  app2.delete("/api/patient-sessions/favorites/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.user.id;
      const success = await storage.deleteFavoriteSession(id, userId);
      if (!success) {
        return res.status(404).json({ message: "S\xE9ance favorite non trouv\xE9e ou acc\xE8s refus\xE9" });
      }
      res.json({ message: "S\xE9ance favorite supprim\xE9e avec succ\xE8s" });
    } catch (error) {
      console.error("Error deleting favorite session:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de la s\xE9ance favorite" });
    }
  });
  app2.put("/api/exercises/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const exerciseData = {
        ...req.body,
        tags: Array.isArray(req.body.tags) ? req.body.tags : []
      };
      const exercise = await storage.updateExercise(id, exerciseData);
      if (!exercise) {
        return res.status(404).json({ message: "Exercice non trouv\xE9" });
      }
      res.json(exercise);
    } catch (error) {
      console.error("Error updating exercise:", error);
      res.status(500).json({ message: "Erreur lors de la mise \xE0 jour de l'exercice" });
    }
  });
  app2.get("/api/admin/dashboard", requireAdmin, async (req, res) => {
    try {
      const dashboardData = await storage.getAdminDashboardData();
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des donn\xE9es du dashboard" });
    }
  });
  app2.get("/api/admin/patients", requireAdmin, async (req, res) => {
    try {
      const patients = await storage.getPatientsWithSessions();
      res.json(patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des patients" });
    }
  });
  app2.get("/api/admin/patient-sessions", requireAdmin, async (req, res) => {
    try {
      const patientSessions2 = await storage.getAllPatientSessions();
      res.json(patientSessions2);
    } catch (error) {
      console.error("Error fetching admin patient sessions:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des s\xE9ances patients" });
    }
  });
  app2.delete("/api/exercises/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteExercise(id);
      if (!success) {
        return res.status(404).json({ message: "Exercice non trouv\xE9" });
      }
      res.json({ message: "Exercice supprim\xE9 avec succ\xE8s" });
    } catch (error) {
      console.error("Error deleting exercise:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de l'exercice" });
    }
  });
  app2.get("/api/educational-contents", requireAuth, async (req, res) => {
    try {
      const {
        category,
        categoryId,
        type,
        difficulty,
        status,
        search,
        tags,
        recommended,
        limit = 50,
        offset = 0
      } = req.query;
      const filters = {
        categoryId: categoryId || category,
        type,
        difficulty,
        status,
        search,
        tags: tags ? tags.split(",") : void 0,
        isRecommended: recommended === "true",
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
      const contents = await storage.getEducationalContents(filters);
      res.json(contents);
    } catch (error) {
      console.error("Error fetching educational contents:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des contenus \xE9ducatifs" });
    }
  });
  app2.get("/api/educational-contents/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const content = await storage.getEducationalContentById(id);
      if (!content) {
        return res.status(404).json({ message: "Contenu non trouv\xE9" });
      }
      if (req.session.user.role !== "admin") {
        await storage.recordContentInteraction({
          userId: req.session.user.id,
          contentId: id,
          interactionType: "view"
        });
      }
      res.json(content);
    } catch (error) {
      console.error("Error fetching educational content:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration du contenu" });
    }
  });
  app2.post("/api/educational-contents", requireAdmin, async (req, res) => {
    try {
      const {
        title,
        description,
        type,
        categoryId,
        tags,
        mediaUrl,
        mediaType,
        content,
        difficulty,
        estimatedReadTime,
        status,
        isRecommended,
        thumbnailUrl
      } = req.body;
      console.log("\u{1F4DD} Creating educational content:", { title, type, category: categoryId });
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ message: "Titre requis et non vide" });
      }
      if (!type || !["text", "video", "audio", "pdf", "image"].includes(type)) {
        return res.status(400).json({ message: "Type de contenu invalide" });
      }
      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ message: "Contenu requis et non vide" });
      }
      const contentData = {
        title: title.trim(),
        description: description?.trim() || null,
        type,
        categoryId: categoryId?.trim() || null,
        tags: Array.isArray(tags) ? [...tags] : [],
        mediaUrl: mediaUrl?.trim() || null,
        mediaType: mediaType || null,
        content: content.trim(),
        difficulty: difficulty || "easy",
        estimatedReadTime: estimatedReadTime ? parseInt(estimatedReadTime) : null,
        status: status || "draft",
        isRecommended: Boolean(isRecommended),
        thumbnailUrl: thumbnailUrl?.trim() || null,
        authorId: req.session.user.id,
        publishedAt: status === "published" ? /* @__PURE__ */ new Date() : null
      };
      const newContent = await storage.createEducationalContent(contentData);
      console.log("\u2705 Educational content created:", newContent.id);
      res.json(newContent);
    } catch (error) {
      console.error("\u274C Error creating educational content:", error);
      res.status(500).json({
        message: error.message || "Erreur lors de la cr\xE9ation du contenu"
      });
    }
  });
  app2.put("/api/educational-contents/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      if (updateData.status === "published" && req.body.status !== "published") {
        updateData.publishedAt = /* @__PURE__ */ new Date();
      }
      const content = await storage.updateEducationalContent(id, updateData);
      if (!content) {
        return res.status(404).json({ message: "Contenu non trouv\xE9" });
      }
      res.json(content);
    } catch (error) {
      console.error("Error updating educational content:", error);
      res.status(500).json({ message: "Erreur lors de la mise \xE0 jour du contenu" });
    }
  });
  app2.delete("/api/educational-contents/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteEducationalContent(id);
      if (!success) {
        return res.status(404).json({ message: "Contenu non trouv\xE9" });
      }
      res.json({ message: "Contenu supprim\xE9 avec succ\xE8s" });
    } catch (error) {
      console.error("Error deleting educational content:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du contenu" });
    }
  });
  app2.get("/api/content-categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getContentCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching content categories:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des cat\xE9gories" });
    }
  });
  app2.post("/api/content-categories", requireAdmin, async (req, res) => {
    try {
      const { name, description, color, icon, order } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ message: "Nom de cat\xE9gorie requis" });
      }
      const categoryData = {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || "blue",
        icon: icon || null,
        order: order ? parseInt(order) : 0
      };
      const category = await storage.createContentCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating content category:", error);
      res.status(500).json({ message: "Erreur lors de la cr\xE9ation de la cat\xE9gorie" });
    }
  });
  app2.put("/api/content-categories/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.updateContentCategory(id, req.body);
      if (!category) {
        return res.status(404).json({ message: "Cat\xE9gorie non trouv\xE9e" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating content category:", error);
      res.status(500).json({ message: "Erreur lors de la mise \xE0 jour de la cat\xE9gorie" });
    }
  });
  app2.delete("/api/content-categories/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteContentCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Cat\xE9gorie non trouv\xE9e" });
      }
      res.json({ message: "Cat\xE9gorie supprim\xE9e avec succ\xE8s" });
    } catch (error) {
      console.error("Error deleting content category:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de la cat\xE9gorie" });
    }
  });
  app2.get("/api/content-tags", requireAuth, async (req, res) => {
    try {
      const tags = await storage.getContentTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching content tags:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des tags" });
    }
  });
  app2.post("/api/content-tags", requireAdmin, async (req, res) => {
    try {
      const { name, description, color } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ message: "Nom de tag requis" });
      }
      const tagData = {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || "gray"
      };
      const tag = await storage.createContentTag(tagData);
      res.json(tag);
    } catch (error) {
      console.error("Error creating content tag:", error);
      res.status(500).json({ message: "Erreur lors de la cr\xE9ation du tag" });
    }
  });
  app2.post("/api/educational-contents/:id/like", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.recordContentInteraction({
        userId: req.session.user.id,
        contentId: id,
        interactionType: "like"
      });
      res.json({ message: "Contenu lik\xE9 avec succ\xE8s" });
    } catch (error) {
      console.error("Error liking content:", error);
      res.status(500).json({ message: "Erreur lors du like" });
    }
  });
  app2.post("/api/educational-contents/:id/bookmark", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.recordContentInteraction({
        userId: req.session.user.id,
        contentId: id,
        interactionType: "bookmark"
      });
      res.json({ message: "Contenu ajout\xE9 aux favoris" });
    } catch (error) {
      console.error("Error bookmarking content:", error);
      res.status(500).json({ message: "Erreur lors de l'ajout aux favoris" });
    }
  });
  app2.post("/api/educational-contents/:id/complete", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { duration, progress } = req.body;
      await storage.recordContentInteraction({
        userId: req.session.user.id,
        contentId: id,
        interactionType: "complete",
        duration: duration ? parseInt(duration) : void 0,
        progress: progress ? parseInt(progress) : 100
      });
      res.json({ message: "Contenu marqu\xE9 comme termin\xE9" });
    } catch (error) {
      console.error("Error completing content:", error);
      res.status(500).json({ message: "Erreur lors de la completion" });
    }
  });
  app2.get("/api/user-content-interactions", requireAuth, async (req, res) => {
    try {
      const { type } = req.query;
      const interactions = await storage.getUserContentInteractions(
        req.session.user.id,
        type
      );
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching user interactions:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des interactions" });
    }
  });
  console.log("\u2705 All routes registered successfully");
}

// server/migrate.ts
import "dotenv/config";
import { drizzle as drizzle2 } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg2 from "pg";
import fs from "fs";
var { Pool: Pool2, Client } = pkg2;
async function ensureAntiCravingTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  try {
    await client.connect();
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'anti_craving_strategies'
      );
    `);
    if (tableExists.rows[0].exists) {
      console.log("\u2705 Table anti_craving_strategies existe");
    } else {
      console.log("\u26A0\uFE0F Cr\xE9ation de la table anti_craving_strategies...");
      await client.query(`
        CREATE TABLE IF NOT EXISTS "anti_craving_strategies" (
          "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "user_id" varchar NOT NULL,
          "context" varchar NOT NULL,
          "exercise" text NOT NULL,
          "effort" varchar NOT NULL,
          "duration" integer NOT NULL,
          "craving_before" integer NOT NULL,
          "craving_after" integer NOT NULL,
          "created_at" timestamp DEFAULT now(),
          "updated_at" timestamp DEFAULT now()
        );
      `);
      await client.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'anti_craving_strategies_user_id_users_id_fk'
          ) THEN
            ALTER TABLE "anti_craving_strategies" 
            ADD CONSTRAINT "anti_craving_strategies_user_id_users_id_fk" 
            FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
            ON DELETE cascade ON UPDATE no action;
          END IF;
        END $$;
      `);
      console.log("\u2705 Table anti_craving_strategies cr\xE9\xE9e");
    }
  } catch (error) {
    console.error("\u274C Erreur lors de la v\xE9rification de la table anti_craving_strategies:", error);
  } finally {
    await client.end();
  }
}
async function ensureExerciseSessionsUpdates() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  try {
    await client.connect();
    console.log("\u{1F527} Application des mises \xE0 jour pour exercise_sessions...");
    await client.query(`
      ALTER TABLE exercise_sessions ALTER COLUMN exercise_id DROP NOT NULL;
    `);
    await client.query(`
      DO $$ 
      BEGIN
          -- Ajouter la colonne notes si elle n'existe pas
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'exercise_sessions' AND column_name = 'notes') THEN
              ALTER TABLE exercise_sessions ADD COLUMN notes TEXT;
          END IF;
          
          -- Ajouter la colonne updated_at si elle n'existe pas  
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'exercise_sessions' AND column_name = 'updated_at') THEN
              ALTER TABLE exercise_sessions ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
          END IF;
      END $$;
    `);
    console.log("\u2705 Mises \xE0 jour exercise_sessions appliqu\xE9es");
  } catch (error) {
    console.error("\u274C Erreur lors des mises \xE0 jour exercise_sessions:", error);
  } finally {
    await client.end();
  }
}
async function ensureUsersUpdates() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  try {
    await client.connect();
    console.log("\u{1F527} Application des mises \xE0 jour pour users...");
    await client.query(`
      DO $$ 
      BEGIN
          -- Ajouter la colonne last_login_at si elle n'existe pas
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'users' AND column_name = 'last_login_at') THEN
              ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
          END IF;
          
          -- Ajouter la colonne inactivity_threshold si elle n'existe pas  
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'users' AND column_name = 'inactivity_threshold') THEN
              ALTER TABLE users ADD COLUMN inactivity_threshold INTEGER DEFAULT 30;
          END IF;
          
          -- Ajouter la colonne notes si elle n'existe pas  
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'users' AND column_name = 'notes') THEN
              ALTER TABLE users ADD COLUMN notes TEXT;
          END IF;
      END $$;
    `);
    console.log("\u2705 Mises \xE0 jour users appliqu\xE9es");
  } catch (error) {
    console.error("\u274C Erreur lors des mises \xE0 jour users:", error);
  } finally {
    await client.end();
  }
}
async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("\u274C DATABASE_URL manquant");
    return;
  }
  if (!fs.existsSync("migrations")) {
    console.log("\u2139\uFE0F Dossier migrations/ absent, ex\xE9cution ignor\xE9e.");
    return;
  }
  console.log("\u{1F527} Migration runner: d\xE9marrage");
  const pool2 = new Pool2({ connectionString: process.env.DATABASE_URL });
  const db2 = drizzle2(pool2);
  try {
    await migrate(db2, { migrationsFolder: "migrations" });
    console.log("\u2705 Migrations Drizzle appliqu\xE9es (ou d\xE9j\xE0 \xE0 jour)");
    await ensureAntiCravingTable();
    await ensureExerciseSessionsUpdates();
    await ensureUsersUpdates();
  } catch (e) {
    console.error("\u274C Erreur migrations:", e);
  } finally {
    await pool2.end();
  }
}
run();

// server/debugTables.ts
import { Router } from "express";
import pkg3 from "pg";
var { Pool: Pool3 } = pkg3;
var debugTablesRouter = Router();
function ensureDbUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant");
  return url;
}
function makePool() {
  return new Pool3({ connectionString: ensureDbUrl() });
}
debugTablesRouter.get("/debug/tables", async (_req, res) => {
  const pool2 = makePool();
  try {
    const tables = await pool2.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    res.json({ tables: tables.rows.map((r) => r.table_name) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await pool2.end();
  }
});
debugTablesRouter.get("/debug/tables/counts", async (_req, res) => {
  const pool2 = makePool();
  try {
    const tables = await pool2.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    const out = {};
    for (const row of tables.rows) {
      const tableName = row.table_name;
      const count2 = await pool2.query(`SELECT COUNT(*)::int AS c FROM "${tableName}";`);
      out[tableName] = count2.rows[0].c;
    }
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await pool2.end();
  }
});
debugTablesRouter.delete("/debug/tables/purge", async (_req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Purge interdite en production" });
  }
  const pool2 = makePool();
  try {
    const tables = await pool2.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type='BASE TABLE'
      ORDER BY table_name;
    `);
    for (const row of tables.rows) {
      const tableName = row.table_name;
      await pool2.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await pool2.end();
  }
});

// server/index.ts
import { Pool as Pool4 } from "pg";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
app.set("trust proxy", 1);
var pgPool = new Pool4({
  connectionString: process.env.DATABASE_URL
});
var PgSession = connectPgSimple(session);
app.use(session({
  store: new PgSession({
    pool: pgPool,
    tableName: "session",
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1e3 * 60 * 60 * 24 * 7,
    // 7 jours
    httpOnly: true
  }
}));
var CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
app.use(cors({
  origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(","),
  credentials: true
}));
app.use(express.json());
var distPath = path.join(__dirname, "..", "dist");
console.log("\u{1F4C1} Serving static files from:", distPath);
app.use(express.static(distPath));
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    env: process.env.NODE_ENV
  });
});
registerRoutes(app);
app.use("/api", debugTablesRouter);
app.get("/api/tables", async (_req, res) => {
  try {
    const result = await pgPool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    res.json(result.rows.map((r) => r.table_name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
app.get("/api/data", async (_req, res) => {
  try {
    const tables = [
      "beck_analyses",
      "craving_entries",
      "exercise_sessions",
      "exercises",
      "psycho_education_content",
      "user_badges",
      "user_stats",
      "users"
    ];
    const data = {};
    for (const table of tables) {
      const result = await pgPool.query(`SELECT * FROM ${table};`);
      data[table] = result.rows;
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
app.use((err, _req, res, _next) => {
  console.error("\u274C Erreur serveur:", err);
  res.status(500).json({ message: "Erreur interne" });
});
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});
console.log("Routes disponibles :");
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(r.route.path);
  }
});
var port = process.env.PORT || 3e3;
app.listen(port, "0.0.0.0", () => {
  console.log(`\u{1F680} Server running at http://localhost:${port}`);
});
