#!/usr/bin/env node
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);

const ADMIN_EMAIL = 'doriansarry@yahoo.fr';
const ADMIN_PASSWORD = 'admin123';

async function ensureAdminUser() {
  console.log('🔍 Vérification de l\'utilisateur admin...');
  
  try {
    // Vérifier si l'utilisateur existe
    const existingUsers = await sql`
      SELECT id, email, role, is_active 
      FROM users 
      WHERE LOWER(email) = LOWER(${ADMIN_EMAIL})
    `;
    
    if (existingUsers.length > 0) {
      const user = existingUsers[0];
      console.log('✅ L\'utilisateur admin existe déjà:', user.email);
      console.log('   Role:', user.role);
      console.log('   Actif:', user.is_active);
      
      // Mettre à jour le mot de passe et s'assurer qu'il est admin et actif
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      
      await sql`
        UPDATE users 
        SET password = ${hashedPassword},
            role = 'admin',
            is_active = true
        WHERE id = ${user.id}
      `;
      
      console.log('✅ Mot de passe et rôle admin mis à jour');
      return;
    }
    
    // Créer l'utilisateur admin
    console.log('📝 Création de l\'utilisateur admin...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    const newUsers = await sql`
      INSERT INTO users (email, password, first_name, last_name, role, is_active)
      VALUES (
        ${ADMIN_EMAIL},
        ${hashedPassword},
        'Dorian',
        'Sarry',
        'admin',
        true
      )
      RETURNING id, email, role
    `;
    
    const newUser = newUsers[0];
    console.log('✅ Utilisateur admin créé avec succès!');
    console.log('   Email:', newUser.email);
    console.log('   Role:', newUser.role);
    console.log('   ID:', newUser.id);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  }
}

ensureAdminUser()
  .then(() => {
    console.log('\n✅ Configuration terminée!');
    console.log(`\n📋 Identifiants admin:`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Mot de passe: ${ADMIN_PASSWORD}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
