import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function fixRoleEnum() {
  console.log('🔧 Correction du type de la colonne role...\n');
  
  try {
    // Étape 1: Vérifier si role est un ENUM
    console.log('1. Vérification du type actuel de la colonne role...');
    const typeCheck = await sql`
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'role';
    `;
    
    console.log('   Type actuel:', typeCheck[0]);
    
    if (typeCheck[0]?.udt_name === 'role' || typeCheck[0]?.data_type === 'USER-DEFINED') {
      console.log('\n2. La colonne role est un ENUM, conversion en VARCHAR...');
      
      // Convertir l'ENUM en VARCHAR
      await sql`
        ALTER TABLE users 
        ALTER COLUMN role TYPE varchar 
        USING role::varchar;
      `;
      
      console.log('   ✅ Colonne convertie en VARCHAR');
      
      // Supprimer l'enum si il existe
      try {
        console.log('\n3. Suppression du type ENUM role...');
        await sql`DROP TYPE IF EXISTS role CASCADE;`;
        console.log('   ✅ Type ENUM supprimé');
      } catch (error) {
        console.log('   ⚠️  Impossible de supprimer l\'ENUM (peut-être déjà supprimé)');
      }
      
    } else {
      console.log('\n✅ La colonne role est déjà en VARCHAR, pas de conversion nécessaire');
    }
    
    // Étape 4: Vérifier les valeurs actuelles
    console.log('\n4. Vérification des valeurs de role dans la table...');
    const roles = await sql`
      SELECT DISTINCT role FROM users ORDER BY role;
    `;
    console.log('   Valeurs de role trouvées:', roles.map(r => r.role).join(', '));
    
    // Étape 5: S'assurer que la valeur par défaut est correcte
    console.log('\n5. Configuration de la valeur par défaut...');
    await sql`
      ALTER TABLE users 
      ALTER COLUMN role SET DEFAULT 'patient';
    `;
    console.log('   ✅ Valeur par défaut définie sur \'patient\'');
    
    console.log('\n✅ Correction terminée avec succès!\n');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    throw error;
  }
}

// Exécuter la correction
fixRoleEnum()
  .then(() => {
    console.log('🎉 Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec du script:', error);
    process.exit(1);
  });
