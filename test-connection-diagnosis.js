#!/usr/bin/env node

/**
 * Script de diagnostic complet pour identifier et résoudre l'erreur de connexion
 * sur l'application Apaddicto déployée sur Vercel
 */

import fetch from 'node-fetch';

const DEPLOYMENT_URL = 'https://apaddicto-je3i-5bwz2yzds-ikips-projects.vercel.app';
const ADMIN_CREDENTIALS = {
  email: 'doriansarry@yahoo.fr',
  password: 'admin123'
};

console.log('🔍 === DIAGNOSTIC COMPLET DE L\'APPLICATION APADDICTO ===\n');

/**
 * Test de connexion basique au serveur
 */
async function testServerConnection() {
  console.log('📡 1. Test de connexion au serveur...');
  
  try {
    const response = await fetch(DEPLOYMENT_URL, {
      method: 'GET',
      timeout: 10000
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers: ${JSON.stringify([...response.headers.entries()], null, 2)}`);
    
    if (response.ok) {
      console.log('   ✅ Serveur accessible');
      return true;
    } else {
      console.log('   ❌ Serveur inaccessible');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erreur de connexion: ${error.message}`);
    return false;
  }
}

/**
 * Test des endpoints API critiques
 */
async function testApiEndpoints() {
  console.log('\n🔌 2. Test des endpoints API...');
  
  const endpoints = [
    '/api/health',
    '/api/auth/me',
    '/api/auth/login',
    '/api/exercises',
    '/api/tables',
    '/api/data'
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    const url = `${DEPLOYMENT_URL}${endpoint}`;
    
    try {
      console.log(`   Testing: ${endpoint}`);
      
      const response = await fetch(url, {
        method: 'GET',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const status = response.status;
      let body = '';
      
      try {
        body = await response.text();
      } catch (e) {
        body = 'Could not read response body';
      }
      
      results[endpoint] = {
        status,
        accessible: status !== 404,
        body: body.substring(0, 200) + (body.length > 200 ? '...' : '')
      };
      
      console.log(`     Status: ${status} ${status === 404 ? '❌ NOT FOUND' : status < 400 ? '✅ OK' : '⚠️ ERROR'}`);
      
    } catch (error) {
      results[endpoint] = {
        status: 'ERROR',
        accessible: false,
        error: error.message
      };
      console.log(`     ❌ Error: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Test d'authentification avec les credentials admin
 */
async function testAuthentication() {
  console.log('\n🔐 3. Test d\'authentification admin...');
  
  try {
    console.log(`   Tentative de connexion: ${ADMIN_CREDENTIALS.email}`);
    
    const response = await fetch(`${DEPLOYMENT_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(ADMIN_CREDENTIALS),
      timeout: 15000
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`   Response: ${responseText.substring(0, 300)}`);
    
    if (response.ok) {
      console.log('   ✅ Authentification réussie');
      
      // Test du endpoint /me avec les cookies de session
      const cookies = response.headers.get('set-cookie');
      if (cookies) {
        console.log('   📋 Cookies reçus, test du profil utilisateur...');
        
        const meResponse = await fetch(`${DEPLOYMENT_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Cookie': cookies,
            'Accept': 'application/json'
          }
        });
        
        console.log(`   Profile Status: ${meResponse.status}`);
        const profileText = await meResponse.text();
        console.log(`   Profile Response: ${profileText.substring(0, 200)}`);
      }
      
      return true;
    } else {
      console.log('   ❌ Authentification échouée');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erreur d'authentification: ${error.message}`);
    return false;
  }
}

/**
 * Test de la configuration CORS
 */
async function testCorsConfiguration() {
  console.log('\n🌐 4. Test de la configuration CORS...');
  
  try {
    // Test de preflight OPTIONS request
    const optionsResponse = await fetch(`${DEPLOYMENT_URL}/api/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://apaddicto-je3i-5bwz2yzds-ikips-projects.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log(`   OPTIONS Status: ${optionsResponse.status}`);
    console.log('   CORS Headers:');
    
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
      'access-control-allow-credentials'
    ];
    
    corsHeaders.forEach(header => {
      const value = optionsResponse.headers.get(header);
      console.log(`     ${header}: ${value || 'Not set'}`);
    });
    
    return optionsResponse.status === 200 || optionsResponse.status === 204;
  } catch (error) {
    console.log(`   ❌ Erreur CORS: ${error.message}`);
    return false;
  }
}

/**
 * Analyse des erreurs et recommandations
 */
function analyzeResults(serverOk, apiResults, authOk, corsOk) {
  console.log('\n📊 === ANALYSE DES RÉSULTATS ===\n');
  
  const issues = [];
  const recommendations = [];
  
  if (!serverOk) {
    issues.push('Serveur principal inaccessible');
    recommendations.push('Vérifier la configuration Vercel et les variables d\'environnement');
  }
  
  const criticalEndpoints = ['/api/health', '/api/auth/login', '/api/auth/me'];
  const failedEndpoints = criticalEndpoints.filter(ep => 
    !apiResults[ep]?.accessible || apiResults[ep]?.status === 404
  );
  
  if (failedEndpoints.length > 0) {
    issues.push(`Endpoints critiques inaccessibles: ${failedEndpoints.join(', ')}`);
    recommendations.push('Vérifier la configuration des routes dans vercel.json');
    recommendations.push('Vérifier que server-dist/index.js est correctement généré');
  }
  
  if (!authOk) {
    issues.push('Authentification défaillante');
    recommendations.push('Vérifier la connexion à la base de données PostgreSQL');
    recommendations.push('Vérifier les credentials admin en base');
  }
  
  if (!corsOk) {
    issues.push('Configuration CORS défaillante');
    recommendations.push('Mettre à jour la configuration CORS dans server/index.ts');
  }
  
  // Affichage des résultats
  console.log('🔍 PROBLÈMES IDENTIFIÉS:');
  if (issues.length === 0) {
    console.log('   ✅ Aucun problème majeur détecté');
  } else {
    issues.forEach((issue, i) => console.log(`   ${i + 1}. ❌ ${issue}`));
  }
  
  console.log('\n💡 RECOMMANDATIONS:');
  if (recommendations.length === 0) {
    console.log('   ✅ Application semble fonctionnelle');
  } else {
    recommendations.forEach((rec, i) => console.log(`   ${i + 1}. 🔧 ${rec}`));
  }
  
  return { issues, recommendations };
}

/**
 * Fonction principale
 */
async function main() {
  try {
    const serverOk = await testServerConnection();
    const apiResults = await testApiEndpoints();
    const authOk = await testAuthentication();
    const corsOk = await testCorsConfiguration();
    
    const analysis = analyzeResults(serverOk, apiResults, authOk, corsOk);
    
    console.log('\n🎯 === PROCHAINES ÉTAPES ===\n');
    
    if (analysis.issues.length > 0) {
      console.log('1. 🔧 Appliquer les corrections recommandées');
      console.log('2. 🏗️ Rebuild et redéployer sur Vercel');
      console.log('3. 🧪 Re-tester avec ce script');
    } else {
      console.log('✅ Application fonctionnelle - procéder aux tests utilisateur');
    }
    
    console.log('\n📋 Résumé des endpoints:');
    Object.entries(apiResults).forEach(([endpoint, result]) => {
      const status = result.accessible ? '✅' : '❌';
      console.log(`   ${status} ${endpoint} - Status: ${result.status}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur fatale du diagnostic:', error.message);
    process.exit(1);
  }
}

// Exécution du script
main();