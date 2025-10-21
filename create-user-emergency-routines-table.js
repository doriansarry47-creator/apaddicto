/**
 * Script pour créer la table user_emergency_routines
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTable() {
  const client = await pool.connect();
  
  try {
    console.log('📝 Création de la table user_emergency_routines...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_emergency_routines (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        description TEXT,
        total_duration INTEGER NOT NULL,
        exercises JSONB NOT NULL,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Table user_emergency_routines créée avec succès');

    // Créer un index sur user_id pour améliorer les performances
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_emergency_routines_user_id 
      ON user_emergency_routines(user_id);
    `);

    console.log('✅ Index créé sur user_id');

    // Vérifier la table
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_emergency_routines'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Structure de la table:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });

    console.log('\n✅ Table user_emergency_routines configurée avec succès!');
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
