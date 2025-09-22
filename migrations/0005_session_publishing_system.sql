-- Migration pour le système de publication et d'assignation des séances
-- Ajout des nouveaux champs à custom_sessions
ALTER TABLE "custom_sessions" ADD COLUMN "status" varchar DEFAULT 'draft';
ALTER TABLE "custom_sessions" ADD COLUMN "published_at" timestamp;
ALTER TABLE "custom_sessions" ADD COLUMN "scheduled_for" timestamp;
ALTER TABLE "custom_sessions" ADD COLUMN "target_audience" varchar DEFAULT 'all';

-- Ajout des nouveaux champs à session_elements
ALTER TABLE "session_elements" ADD COLUMN "sets" integer DEFAULT 1;
ALTER TABLE "session_elements" ADD COLUMN "intensity" integer DEFAULT 5;
ALTER TABLE "session_elements" ADD COLUMN "dynamic_variables" jsonb DEFAULT '{}'::jsonb;

-- Création de la table session_assignments
CREATE TABLE "session_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"patient_id" varchar NOT NULL,
	"assigned_by" varchar NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"due_date" timestamp,
	"priority" varchar DEFAULT 'normal',
	"instructions" text,
	"is_recurring" boolean DEFAULT false,
	"recurring_pattern" jsonb,
	"status" varchar DEFAULT 'assigned',
	"completed_at" timestamp,
	"feedback" text,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Ajout des contraintes de clés étrangères
ALTER TABLE "session_assignments" ADD CONSTRAINT "session_assignments_session_id_custom_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."custom_sessions"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "session_assignments" ADD CONSTRAINT "session_assignments_patient_id_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "session_assignments" ADD CONSTRAINT "session_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;