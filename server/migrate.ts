import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg';
import fs from 'fs';

const { Pool, Client } = pkg;

async function ensureAntiCravingTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    
    // Vérifier si la table existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'anti_craving_strategies'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('✅ Table anti_craving_strategies existe');
    } else {
      console.log('⚠️ Création de la table anti_craving_strategies...');
      
      // Créer la table
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
      
      // Ajouter la clé étrangère si elle n'existe pas
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
      
      console.log('✅ Table anti_craving_strategies créée');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la table anti_craving_strategies:', error);
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
    
    console.log('🔧 Application des mises à jour pour exercise_sessions...');
    
    // Supprimer la contrainte NOT NULL sur exercise_id
    await client.query(`
      ALTER TABLE exercise_sessions ALTER COLUMN exercise_id DROP NOT NULL;
    `);
    
    // Ajouter les colonnes manquantes si nécessaire
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
    
    console.log('✅ Mises à jour exercise_sessions appliquées');
    
  } catch (error) {
    console.error('❌ Erreur lors des mises à jour exercise_sessions:', error);
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
    
    console.log('🔧 Application des mises à jour pour users...');
    
    // Ajouter les colonnes manquantes si nécessaire
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
    
    console.log('✅ Mises à jour users appliquées');
    
  } catch (error) {
    console.error('❌ Erreur lors des mises à jour users:', error);
  } finally {
    await client.end();
  }
}

async function ensureSessionTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('🔧 Vérification de la table session pour express-session...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      ) WITH (OIDS=FALSE);
      
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    
    console.log('✅ Table session vérifiée/créée');
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table session:', error);
  } finally {
    await client.end();
  }
}

async function ensureGoogleAuthColumn() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('🔧 Vérification colonne google_id pour OAuth Google...');
    
    await client.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'users' AND column_name = 'google_id') THEN
              ALTER TABLE users ADD COLUMN google_id VARCHAR UNIQUE;
          END IF;
          
          IF EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'users' AND column_name = 'password'
                     AND is_nullable = 'NO') THEN
              ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
              ALTER TABLE users ALTER COLUMN password SET DEFAULT '';
          END IF;
      END $$;
    `);
    
    console.log('✅ Colonne google_id vérifiée/ajoutée');
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de google_id:', error);
  } finally {
    await client.end();
  }
}

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL manquant');
    return;
  }
  if (!fs.existsSync('migrations')) {
    console.log('ℹ️ Dossier migrations/ absent, exécution ignorée.');
    return;
  }
  console.log('🔧 Migration runner: démarrage');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  try {
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log('✅ Migrations Drizzle appliquées (ou déjà à jour)');
    
    // Vérifier et créer la table anti_craving_strategies si nécessaire
    await ensureAntiCravingTable();
    
    // Appliquer les mises à jour pour exercise_sessions
    await ensureExerciseSessionsUpdates();
    
    // Appliquer les mises à jour pour users
    await ensureUsersUpdates();
    
    // Ajouter le support Google OAuth
    await ensureGoogleAuthColumn();

    // S'assurer que la table session existe pour express-session
    await ensureSessionTable();
    
  } catch (e) {
    console.error('❌ Erreur migrations:', e);
  } finally {
    await pool.end();
  }
}

run();