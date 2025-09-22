#!/usr/bin/env node

/**
 * Test de connexion et de fonctionnalité pour Apaddicto
 * Vérifie que toutes les corrections apportées fonctionnent correctement
 */

import axios from 'axios';
import { fileURLToPath } from 'url';
import path from 'path';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des tests
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_USER = {
  email: `test.${Date.now()}@apaddicto.com`,
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User'
};

console.log('🧪 Début des tests de connexion pour Apaddicto');
console.log('📍 URL de test:', BASE_URL);

// Configuration d'Axios avec support des cookies
const jar = new CookieJar();
const client = wrapper(axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  jar,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}));

// Intercepteur pour gérer les erreurs
client.interceptors.response.use(
  response => response,
  error => {
    console.error('❌ Erreur de requête:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    return Promise.reject(error);
  }
);

async function testHealthEndpoint() {
  console.log('\n📋 Test 1: Endpoint de santé');
  try {
    const response = await client.get('/api/health');
    console.log('✅ Health check réussi:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check échoué');
    return false;
  }
}

async function testCORSConfiguration() {
  console.log('\n📋 Test 2: Configuration CORS');
  try {
    // Test OPTIONS request
    const response = await client.options('/api/health');
    console.log('✅ CORS préflight réussi');
    return true;
  } catch (error) {
    if (error.response?.status === 204 || error.response?.status === 200) {
      console.log('✅ CORS configuré correctement');
      return true;
    }
    console.error('❌ Problème CORS détecté');
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('\n📋 Test 3: Connexion à la base de données');
  try {
    const response = await client.get('/api/tables');
    console.log('✅ Base de données accessible, tables trouvées:', response.data.length);
    return true;
  } catch (error) {
    console.error('❌ Connexion base de données échouée');
    return false;
  }
}

async function testUserRegistration() {
  console.log('\n📋 Test 4: Inscription utilisateur');
  try {
    const response = await client.post('/api/auth/register', TEST_USER);
    console.log('✅ Inscription réussie pour:', TEST_USER.email);
    return response.data.user;
  } catch (error) {
    if (error.response?.data?.message?.includes('existe déjà')) {
      console.log('ℹ️ Utilisateur existe déjà, tentative de connexion...');
      return await testUserLogin();
    }
    console.error('❌ Inscription échouée');
    return null;
  }
}

async function testUserLogin() {
  console.log('\n📋 Test 5: Connexion utilisateur');
  try {
    const response = await client.post('/api/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    console.log('✅ Connexion réussie pour:', TEST_USER.email);
    return response.data.user;
  } catch (error) {
    console.error('❌ Connexion échouée');
    return null;
  }
}

async function testUserSession() {
  console.log('\n📋 Test 6: Vérification session utilisateur');
  try {
    const response = await client.get('/api/auth/me');
    console.log('✅ Session utilisateur valide:', response.data.email);
    return true;
  } catch (error) {
    console.error('❌ Session invalide');
    return false;
  }
}

async function testExercisesEndpoint() {
  console.log('\n📋 Test 7: Endpoint exercices');
  try {
    const response = await client.get('/api/exercises');
    console.log('✅ Exercices récupérés:', response.data.length, 'exercice(s)');
    return true;
  } catch (error) {
    console.error('❌ Récupération exercices échouée');
    return false;
  }
}

async function testPsychoEducationEndpoint() {
  console.log('\n📋 Test 8: Endpoint contenu psychoéducatif');
  try {
    const response = await client.get('/api/psycho-education');
    console.log('✅ Contenu psychoéducatif récupéré:', response.data.length, 'contenu(s)');
    return true;
  } catch (error) {
    console.error('❌ Récupération contenu psychoéducatif échouée');
    return false;
  }
}

async function runAllTests() {
  const testResults = [];
  
  console.log('🚀 Lancement de la suite de tests...\n');
  
  testResults.push(await testHealthEndpoint());
  testResults.push(await testCORSConfiguration());
  testResults.push(await testDatabaseConnection());
  
  const user = await testUserRegistration();
  if (user) {
    testResults.push(true);
    testResults.push(await testUserSession());
    testResults.push(await testExercisesEndpoint());
    testResults.push(await testPsychoEducationEndpoint());
  } else {
    testResults.push(false, false, false, false);
  }
  
  // Résumé des tests
  const passed = testResults.filter(result => result).length;
  const total = testResults.length;
  
  console.log('\n📊 RÉSUMÉ DES TESTS');
  console.log('═'.repeat(50));
  console.log(`✅ Tests réussis: ${passed}/${total}`);
  console.log(`❌ Tests échoués: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 TOUS LES TESTS ONT RÉUSSI !');
    console.log('✅ L\'application fonctionne correctement');
  } else {
    console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('🔧 Vérifiez les logs d\'erreur ci-dessus');
  }
  
  return passed === total;
}

// Lancement des tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Erreur critique lors des tests:', error);
      process.exit(1);
    });
}

export { runAllTests };