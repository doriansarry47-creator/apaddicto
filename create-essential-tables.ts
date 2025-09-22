#!/usr/bin/env node

import 'dotenv/config';
import { getDB } from './server/db.js';
import { sql } from 'drizzle-orm';

async function createEssentialTables() {
  const db = getDB();
  
  console.log('🔧 Création des tables essentielles...');

  try {
    // Table exercise_variations
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "exercise_variations" (
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
      )
    `);
    console.log('✅ Table exercise_variations créée');

    // Foreign key pour exercise_variations
    try {
      await db.execute(sql`
        ALTER TABLE "exercise_variations" 
        ADD CONSTRAINT "exercise_variations_exercise_id_exercises_id_fk" 
        FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action
      `);
    } catch (e) {
      // Contrainte peut déjà exister
    }

    // Table custom_sessions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "custom_sessions" (
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
      )
    `);
    console.log('✅ Table custom_sessions créée');

    // Foreign key pour custom_sessions
    try {
      await db.execute(sql`
        ALTER TABLE "custom_sessions" 
        ADD CONSTRAINT "custom_sessions_creator_id_users_id_fk" 
        FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
      `);
    } catch (e) {
      // Contrainte peut déjà exister
    }

    // Table session_elements
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "session_elements" (
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
      )
    `);
    console.log('✅ Table session_elements créée');

    // Foreign keys pour session_elements
    try {
      await db.execute(sql`
        ALTER TABLE "session_elements" 
        ADD CONSTRAINT "session_elements_session_id_custom_sessions_id_fk" 
        FOREIGN KEY ("session_id") REFERENCES "public"."custom_sessions"("id") ON DELETE cascade ON UPDATE no action
      `);
    } catch (e) {
      // Contrainte peut déjà exister
    }

    try {
      await db.execute(sql`
        ALTER TABLE "session_elements" 
        ADD CONSTRAINT "session_elements_exercise_id_exercises_id_fk" 
        FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action
      `);
    } catch (e) {
      // Contrainte peut déjà exister
    }

    try {
      await db.execute(sql`
        ALTER TABLE "session_elements" 
        ADD CONSTRAINT "session_elements_variation_id_exercise_variations_id_fk" 
        FOREIGN KEY ("variation_id") REFERENCES "public"."exercise_variations"("id") ON DELETE cascade ON UPDATE no action
      `);
    } catch (e) {
      // Contrainte peut déjà exister
    }

    // Table session_instances
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "session_instances" (
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
      )
    `);
    console.log('✅ Table session_instances créée');

    // Foreign keys pour session_instances
    try {
      await db.execute(sql`
        ALTER TABLE "session_instances" 
        ADD CONSTRAINT "session_instances_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
      `);
    } catch (e) {
      // Contrainte peut déjà exister
    }

    try {
      await db.execute(sql`
        ALTER TABLE "session_instances" 
        ADD CONSTRAINT "session_instances_session_id_custom_sessions_id_fk" 
        FOREIGN KEY ("session_id") REFERENCES "public"."custom_sessions"("id") ON DELETE cascade ON UPDATE no action
      `);
    } catch (e) {
      // Contrainte peut déjà exister
    }

    console.log('🎉 Toutes les tables essentielles ont été créées !');

  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    throw error;
  }
}

// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
  createEssentialTables()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export { createEssentialTables };