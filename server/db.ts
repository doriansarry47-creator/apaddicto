// server/db.ts - Database connection
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { users, exercises, psychoEducationContent, cravingEntries, exerciseSessions } from './schema.ts';

// Configure Neon
neonConfig.webSocketConstructor = ws;

let db: any;

export function getDB() {
  if (!db) {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL must be set');
    }
    
    const pool = new Pool({ connectionString: DATABASE_URL });
    db = drizzle({ 
      client: pool, 
      schema: { 
        users, 
        exercises, 
        psychoEducationContent, 
        cravingEntries, 
        exerciseSessions 
      } 
    });
  }
  return db;
}