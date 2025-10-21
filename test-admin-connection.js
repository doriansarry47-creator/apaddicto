#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function testAdminConnection() {
  console.log('🔍 Test de connexion administrateur\n');
  console.log('═══════════════════════════════════════════════\n');
  
  const email = 'doriansarry@yahoo.fr';
  const password = 'admin123';
  
  try {
    // 1. Vérifier si l'utilisateur existe
    console.log('📧 Recherche de l\'utilisateur:', email);
    const users = await sql`
      SELECT id, email, password, first_name, last_name, role, is_active
      FROM users
      WHERE LOWER(email) = LOWER(${email})
    `;
    
    if (users.length === 0) {
      console.log('❌ Utilisateur non trouvé dans la base de données\n');
      console.log('🔧 Création du compte administrateur...\n');
      
      // Créer l'utilisateur admin
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUsers = await sql`
        INSERT INTO users (email, password, "firstName", "lastName", role, "isActive")
        VALUES (
          ${email},
          ${hashedPassword},
          'Admin',
          'Dorian',
          'admin',
          true
        )
        RETURNING id, email, "firstName", "lastName", role, "isActive"
      `;
      
      console.log('✅ Compte administrateur créé avec succès!');
      console.log('ID:', newUsers[0].id);
      console.log('Email:', newUsers[0].email);
      console.log('Nom:', newUsers[0].firstName, newUsers[0].lastName);
      console.log('Rôle:', newUsers[0].role);
      console.log('Actif:', newUsers[0].isActive);
      console.log('\n📝 Vous pouvez maintenant vous connecter avec:');
      console.log('   Email:', email);
      console.log('   Mot de passe:', password);
      return;
    }
    
    const user = users[0];
    console.log('✅ Utilisateur trouvé!');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Nom:', user.firstName, user.lastName);
    console.log('Rôle:', user.role);
    console.log('Actif:', user.isActive);
    console.log('\n');
    
    // 2. Vérifier le mot de passe
    console.log('🔐 Vérification du mot de passe...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Mot de passe incorrect!\n');
      console.log('🔧 Réinitialisation du mot de passe...\n');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      await sql`
        UPDATE users
        SET password = ${hashedPassword}
        WHERE id = ${user.id}
      `;
      
      console.log('✅ Mot de passe réinitialisé avec succès!');
      console.log('   Nouveau mot de passe:', password);
    } else {
      console.log('✅ Mot de passe valide!');
    }
    
    // 3. Vérifier le rôle
    console.log('\n👤 Vérification du rôle...');
    if (user.role !== 'admin') {
      console.log('⚠️  Rôle actuel:', user.role);
      console.log('🔧 Mise à jour du rôle vers admin...\n');
      
      await sql`
        UPDATE users
        SET role = 'admin'
        WHERE id = ${user.id}
      `;
      
      console.log('✅ Rôle mis à jour vers admin!');
    } else {
      console.log('✅ Rôle admin confirmé!');
    }
    
    // 4. Vérifier si le compte est actif
    console.log('\n🟢 Vérification de l\'état du compte...');
    if (!user.is_active) {
      console.log('⚠️  Compte désactivé');
      console.log('🔧 Activation du compte...\n');
      
      await sql`
        UPDATE users
        SET is_active = true
        WHERE id = ${user.id}
      `;
      
      console.log('✅ Compte activé!');
    } else {
      console.log('✅ Compte actif!');
    }
    
    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ RÉSUMÉ: Tout est configuré correctement!');
    console.log('═══════════════════════════════════════════════\n');
    console.log('📝 Identifiants de connexion:');
    console.log('   Email:', email);
    console.log('   Mot de passe:', password);
    console.log('   Rôle: admin');
    console.log('\n🚀 Vous pouvez maintenant vous connecter à l\'application');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  }
}

testAdminConnection();
