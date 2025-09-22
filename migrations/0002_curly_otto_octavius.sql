CREATE TABLE "anti_craving_strategies" (
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
--> statement-breakpoint
CREATE TABLE "audio_content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"type" varchar NOT NULL,
	"category" varchar NOT NULL,
	"duration" integer,
	"audio_url" varchar NOT NULL,
	"thumbnail_url" varchar,
	"is_loopable" boolean DEFAULT false,
	"volume_recommendation" varchar DEFAULT 'medium',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"total_duration" integer,
	"difficulty" varchar DEFAULT 'beginner',
	"is_template" boolean DEFAULT true,
	"is_public" boolean DEFAULT false,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"image_url" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "emergency_routines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"steps" jsonb NOT NULL,
	"duration" integer,
	"category" varchar DEFAULT 'general',
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exercise_enhancements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_id" varchar NOT NULL,
	"audio_urls" jsonb DEFAULT '[]'::jsonb,
	"video_urls" jsonb DEFAULT '[]'::jsonb,
	"image_urls" jsonb DEFAULT '[]'::jsonb,
	"timer_settings" jsonb,
	"breathing_pattern" jsonb,
	"visualization_script" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exercise_library" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_id" varchar NOT NULL,
	"author_id" varchar,
	"card_image_url" varchar,
	"thumbnail_url" varchar,
	"gallery_images" jsonb DEFAULT '[]'::jsonb,
	"videos" jsonb DEFAULT '[]'::jsonb,
	"prerequisites" jsonb DEFAULT '[]'::jsonb,
	"contraindications" text,
	"equipment" jsonb DEFAULT '[]'::jsonb,
	"target_audience" jsonb DEFAULT '[]'::jsonb,
	"muscle_groups" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"average_rating" integer,
	"rating_count" integer DEFAULT 0,
	"usage_count" integer DEFAULT 0,
	"last_used" timestamp,
	"is_verified" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exercise_ratings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"exercise_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"difficulty" varchar,
	"effectiveness" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exercise_variations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"instructions" text,
	"duration" integer,
	"difficulty_modifier" integer DEFAULT 0,
	"benefits" text,
	"image_url" varchar,
	"video_url" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "professional_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" varchar NOT NULL,
	"therapist_id" varchar NOT NULL,
	"report_type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"data" jsonb,
	"start_date" timestamp,
	"end_date" timestamp,
	"is_private" boolean DEFAULT true,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quick_resources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"category" varchar NOT NULL,
	"type" varchar DEFAULT 'tip',
	"icon" varchar,
	"color" varchar DEFAULT 'blue',
	"is_active" boolean DEFAULT true,
	"is_pinned" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_elements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"exercise_id" varchar,
	"variation_id" varchar,
	"order" integer NOT NULL,
	"duration" integer,
	"repetitions" integer DEFAULT 1,
	"rest_time" integer DEFAULT 0,
	"timer_settings" jsonb,
	"notes" text,
	"is_optional" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_instances" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"session_id" varchar NOT NULL,
	"status" varchar DEFAULT 'started',
	"current_element_index" integer DEFAULT 0,
	"total_duration" integer,
	"craving_before" integer,
	"craving_after" integer,
	"mood_before" varchar,
	"mood_after" varchar,
	"notes" text,
	"completed_elements" jsonb DEFAULT '[]'::jsonb,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timer_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"exercise_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"duration" integer NOT NULL,
	"intervals" jsonb,
	"audio_url" varchar,
	"completed" boolean DEFAULT false,
	"heart_rate_before" integer,
	"heart_rate_after" integer,
	"stress_level_before" integer,
	"stress_level_after" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_emergency_routines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"total_duration" integer NOT NULL,
	"exercises" jsonb NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "visualization_content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"type" varchar NOT NULL,
	"category" varchar NOT NULL,
	"difficulty" varchar DEFAULT 'beginner',
	"duration" integer,
	"audio_url" varchar,
	"video_url" varchar,
	"image_url" varchar,
	"script" text,
	"instructions" text,
	"benefits" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "exercise_sessions" ALTER COLUMN "exercise_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "exercise_sessions" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "exercise_sessions" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "user_stats" ADD COLUMN "beck_analyses_completed" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "inactivity_threshold" integer DEFAULT 30;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "anti_craving_strategies" ADD CONSTRAINT "anti_craving_strategies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_sessions" ADD CONSTRAINT "custom_sessions_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_enhancements" ADD CONSTRAINT "exercise_enhancements_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_library" ADD CONSTRAINT "exercise_library_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_library" ADD CONSTRAINT "exercise_library_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_ratings" ADD CONSTRAINT "exercise_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_ratings" ADD CONSTRAINT "exercise_ratings_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_variations" ADD CONSTRAINT "exercise_variations_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_reports" ADD CONSTRAINT "professional_reports_patient_id_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_reports" ADD CONSTRAINT "professional_reports_therapist_id_users_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_elements" ADD CONSTRAINT "session_elements_session_id_custom_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."custom_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_elements" ADD CONSTRAINT "session_elements_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_elements" ADD CONSTRAINT "session_elements_variation_id_exercise_variations_id_fk" FOREIGN KEY ("variation_id") REFERENCES "public"."exercise_variations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_instances" ADD CONSTRAINT "session_instances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_instances" ADD CONSTRAINT "session_instances_session_id_custom_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."custom_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_sessions" ADD CONSTRAINT "timer_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_sessions" ADD CONSTRAINT "timer_sessions_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_emergency_routines" ADD CONSTRAINT "user_emergency_routines_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;