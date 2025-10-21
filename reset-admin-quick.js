#!/usr/bin/env node

import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'doriansarry@yahoo.fr';
const NEW_PASSWORD = 'admin123';

async function resetAdminPassword() {
  console.log('🔧 Réinitialisation du mot de passe admin...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connecté à la base de données');

    // Vérifier si l'utilisateur existe
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (result.rows.length === 0) {
      console.log('❌ Aucun utilisateur trouvé avec cet email:', ADMIN_EMAIL);
      
      // Créer l'utilisateur admin
      console.log('📝 Création de l\'utilisateur admin...');
      const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
      
      await client.query(
        'INSERT INTO users (email, password, first_name, last_name, role, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
        [ADMIN_EMAIL, hashedPassword, 'Dorian', 'Sarry', 'admin', true]
      );
      
      console.log('✅ Utilisateur admin créé avec succès');
    } else {
      const user = result.rows[0];
      console.log('👤 Utilisateur trouvé:', user.email, 'Role:', user.role);
      
      // Hacher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
      
      // Mettre à jour le mot de passe
      await client.query(
        'UPDATE users SET password = $1, role = $2, is_active = $3 WHERE email = $4',
        [hashedPassword, 'admin', true, ADMIN_EMAIL]
      );
      
      console.log('✅ Mot de passe réinitialisé avec succès pour:', ADMIN_EMAIL);
    }
    
    console.log('🔑 Email:', ADMIN_EMAIL);
    console.log('🔑 Mot de passe:', NEW_PASSWORD);
    
    // Vérifier la mise à jour
    const verification = await client.query(
      'SELECT email, role, is_active FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );
    
    if (verification.rows.length > 0) {
      const updated = verification.rows[0];
      console.log('✅ Vérification - Role:', updated.role, 'Active:', updated.is_active);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

resetAdminPassword().catch(console.error);
