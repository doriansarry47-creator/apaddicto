#!/usr/bin/env node

/**
 * Test local de l'API serverless pour vérifier le fonctionnement
 * avant le déploiement Vercel
 */

import express from 'express';
import serverlessApp from './api/serverless.js';

const PORT = process.env.PORT || 3001;

console.log('🧪 === TEST LOCAL DE L\'API SERVERLESS ===\n');

// Créer un serveur Express local pour tester l'app serverless
const testServer = express();

// Utiliser l'app serverless comme middleware
testServer.use('/', serverlessApp);

// Démarrer le serveur de test
const server = testServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur de test local démarré sur http://localhost:${PORT}`);
  runTests();
});

/**
 * Suite de tests automatisés
 */
async function runTests() {
  const baseUrl = `http://localhost:${PORT}`;
  
  console.log('\n📋 Tests automatisés en cours...\n');
  
  const tests = [
    {
      name: 'Health Check',
      method: 'GET',
      url: '/api/health',
      expectedStatus: 200
    },
    {
      name: 'Root Endpoint',
      method: 'GET', 
      url: '/',
      expectedStatus: 200
    },
    {
      name: 'Login Admin',
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'doriansarry@yahoo.fr',
        password: 'admin123'
      },
      expectedStatus: 200
    },
    {
      name: 'Get User Profile (without auth)',
      method: 'GET',
      url: '/api/auth/me',
      expectedStatus: 401
    },
    {
      name: 'Get Exercises',
      method: 'GET',
      url: '/api/exercises',
      expectedStatus: 200
    },
    {
      name: 'Get Tables',
      method: 'GET',
      url: '/api/tables',
      expectedStatus: 200
    },
    {
      name: '404 Handler',
      method: 'GET',
      url: '/api/nonexistent',
      expectedStatus: 404
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      if (test.name === 'Get User Profile (without auth)') {
        // Ne pas ajouter d'en-tête d'autorisation pour ce test
      } else if (test.name.includes('auth') && test.method === 'GET') {
        options.headers.Authorization = 'Bearer mock-token';
      }
      
      const response = await fetch(`${baseUrl}${test.url}`, options);
      const body = await response.text();
      
      const success = response.status === test.expectedStatus;
      const result = {
        name: test.name,
        success,
        status: response.status,
        expected: test.expectedStatus,
        body: body.substring(0, 200)
      };
      
      results.push(result);
      
      console.log(`${success ? '✅' : '❌'} ${test.name}: ${response.status} ${success ? '' : `(attendu ${test.expectedStatus})`}`);
      
    } catch (error) {
      results.push({
        name: test.name,
        success: false,
        error: error.message
      });
      console.log(`❌ ${test.name}: Erreur - ${error.message}`);
    }
  }
  
  // Résumé des tests
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`\n📊 Résultats: ${passed}/${total} tests réussis`);
  
  if (passed === total) {
    console.log('✅ Tous les tests sont passés ! L\'API est prête pour le déploiement.');
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez la configuration avant le déploiement.');
  }
  
  // Arrêter le serveur de test
  server.close(() => {
    console.log('\n👋 Serveur de test fermé.');
    process.exit(0);
  });
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur fatale:', error.message);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du serveur de test...');
  server.close(() => {
    process.exit(0);
  });
});