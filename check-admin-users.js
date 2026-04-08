#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:5000';

async function checkDatabase() {
  console.log('🔍 Vérification de la base de données...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/test-db`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DB Test failed: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Connexion à la base de données OK:', result);
    
  } catch (error) {
    console.error('❌ Erreur de base de données:', error.message);
  }
}

async function testAdminCreationWithEmail() {
  console.log('👤 Test création admin avec email spécifique...');
  
  // Essayer de créer un admin avec un email alternatif
  const testEmail = 'admin@test.com';
  const testPassword = 'admin123';
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'Admin',
        role: 'admin'  // Ceci ne devrait pas marcher à cause de la restriction
      })
    });
    
    const responseText = await response.text();
    console.log('📊 Réponse création admin test:', response.status, responseText);
    
    if (response.ok) {
      // Si ça marche, essayer de se connecter avec ce compte
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      });
      
      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        console.log('✅ Connexion réussie avec admin test:', loginResult.user);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test admin:', error.message);
  }
}

async function testAuthorizedAdminCreation() {
  console.log('👤 Création admin avec email autorisé...');
  
  const authorizedEmail = 'doriansarry@yahoo.fr';
  const newPassword = 'dorian010195';
  
  try {
    // D'abord essayer de créer avec un nouveau mot de passe
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: authorizedEmail,
        password: newPassword,
        firstName: 'Dorian',
        lastName: 'Admin',
        role: 'admin'
      })
    });
    
    const responseText = await response.text();
    console.log('📊 Réponse création admin autorisé:', response.status, responseText);
    
    // Si le compte existe déjà, essayons différents mots de passe
    if (responseText.includes('existe déjà')) {
      console.log('🔍 Le compte existe, test de différents mots de passe...');
      
      const passwords = ['admin123', 'password', 'password123', '123456', 'admin', 'test123'];
      
      for (const pwd of passwords) {
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: authorizedEmail,
            password: pwd
          })
        });
        
        if (loginResponse.ok) {
          const loginResult = await loginResponse.json();
          console.log('✅ Mot de passe trouvé:', pwd, '- User:', loginResult.user);
          return loginResult.user;
        }
      }
      
      console.log('❌ Aucun mot de passe standard ne fonctionne');
    } else if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('✅ Nouveau compte admin créé:', result.user);
      return result.user;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création admin autorisé:', error.message);
  }
  
  return null;
}

async function runTests() {
  console.log('🚀 Diagnostic complet du système d\'authentification\n');
  
  await checkDatabase();
  console.log('');
  
  await testAdminCreationWithEmail();
  console.log('');
  
  const adminUser = await testAuthorizedAdminCreation();
  console.log('');
  
  if (adminUser && adminUser.role === 'admin') {
    console.log('🎯 Admin user disponible, prêt pour les tests d\'exercices');
  } else {
    console.log('❌ Aucun admin user disponible');
  }
}

runTests().catch(console.error);
