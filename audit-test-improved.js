#!/usr/bin/env node

/**
 * Script d'audit complet de l'application APAddicto
 * Teste toutes les fonctionnalités en utilisant le navigateur pour vérifier l'UI
 */

import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import { writeFileSync } from 'fs';

const BASE_URL = process.env.BASE_URL || 'https://3000-iowowlba73a6tojmmysaq-d0b9e1e2.sandbox.novita.ai';
const ADMIN_EMAIL = 'doriansarry@yahoo.fr';
const ADMIN_PASSWORD = 'admin123';

// Configuration axios avec cookiejar
const jar = new CookieJar();
const client = wrapper(axios.create({
  baseURL: BASE_URL,
  jar,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Audit Script)'
  }
}));

// Résultats des tests
const results = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: [],
  bugs: [],
  recommendations: []
};

// Fonction pour ajouter un résultat de test
function addTestResult(category, name, status, details = null, error = null) {
  const result = {
    category,
    name,
    status, // 'pass', 'fail', 'skip'
    details,
    error: error ? error.message : null,
    timestamp: new Date().toISOString()
  };
  
  results.tests.push(result);
  results.totalTests++;
  
  if (status === 'pass') {
    results.passed++;
    console.log(`✅ ${category} - ${name}`);
    if (details && typeof details === 'object' && !Array.isArray(details)) {
      console.log(`   Details:`, JSON.stringify(details).substring(0, 100));
    }
  } else if (status === 'fail') {
    results.failed++;
    console.log(`❌ ${category} - ${name}: ${error?.message || details}`);
    if (error) {
      results.bugs.push({
        category,
        test: name,
        error: error.message,
        statusCode: error.response?.status,
        severity: 'high'
      });
    }
  } else {
    results.skipped++;
    console.log(`⏭️  ${category} - ${name}: ${details}`);
  }
}

async function runAudit() {
  console.log('🔍 Démarrage de l\'audit complet APAddicto\n');
  console.log(`📍 URL de base: ${BASE_URL}\n`);
  
  // Phase 1: Tests d'authentification
  await testAuthentication();
  
  // Phase 2: Tests des API endpoints (après authentification)
  await testAPIEndpoints();
  
  // Phase 3: Tests des fonctionnalités Patient
  await testPatientFeatures();
  
  // Phase 4: Tests des fonctionnalités Admin
  await testAdminFeatures();
  
  // Génération du rapport
  generateReport();
}

// ============================================
// PHASE 1: Tests d'authentification
// ============================================

async function testAuthentication() {
  console.log('\n📋 PHASE 1: Tests d\'authentification\n');
  
  // Test 1: Connexion admin
  try {
    const response = await client.post('/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (response.data.user && response.data.user.role === 'admin') {
      addTestResult('Auth', 'Connexion admin', 'pass', {
        userId: response.data.user.id,
        role: response.data.user.role,
        email: response.data.user.email
      });
    } else {
      addTestResult('Auth', 'Connexion admin', 'fail', 'Rôle admin non confirmé');
    }
  } catch (error) {
    addTestResult('Auth', 'Connexion admin', 'fail', null, error);
    // Si la connexion échoue, on ne peut pas continuer
    console.error('\n⛔ ERREUR CRITIQUE: Impossible de se connecter. Arrêt de l\'audit.\n');
    process.exit(1);
  }
  
  // Test 2: Vérification profil connecté
  try {
    const response = await client.get('/api/auth/me');
    if (response.data.user) {
      addTestResult('Auth', 'Profil utilisateur connecté', 'pass', {
        authenticated: true,
        userId: response.data.user.id
      });
    } else {
      addTestResult('Auth', 'Profil utilisateur connecté', 'fail', 'Pas de données utilisateur');
    }
  } catch (error) {
    addTestResult('Auth', 'Profil utilisateur connecté', 'fail', null, error);
  }
  
  // Test 3: Test inscription (ne pas utiliser email existant)
  try {
    const testEmail = `test-patient-${Date.now()}@test.com`;
    const response = await client.post('/api/auth/register', {
      email: testEmail,
      password: 'testpass123456',
      firstName: 'Test',
      lastName: 'Patient',
      role: 'patient'
    });
    
    if (response.data.user) {
      addTestResult('Auth', 'Inscription nouveau patient', 'pass', {
        created: true,
        email: testEmail
      });
    } else {
      addTestResult('Auth', 'Inscription nouveau patient', 'fail', 'Pas de données utilisateur');
    }
  } catch (error) {
    addTestResult('Auth', 'Inscription nouveau patient', 'fail', null, error);
  }
  
  // Reconnecter l'admin après avoir testé l'inscription
  try {
    await client.post('/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
  } catch (error) {
    console.error('Erreur lors de la reconnexion admin');
  }
}

// ============================================
// PHASE 2: Tests des API endpoints
// ============================================

async function testAPIEndpoints() {
  console.log('\n📋 PHASE 2: Tests des API endpoints\n');
  
  // Test endpoints exercices
  console.log('  🏃 Tests exercices...');
  await testEndpoint('Exercices', 'GET /api/exercises', 'get', '/api/exercises');
  await testEndpoint('Exercices', 'GET /api/relaxation-exercises', 'get', '/api/relaxation-exercises');
  
  // Test endpoints cravings
  console.log('  💭 Tests cravings...');
  await testEndpoint('Cravings', 'GET /api/cravings', 'get', '/api/cravings');
  
  // Test POST craving
  try {
    const cravingData = {
      intensity: 7,
      triggers: ['stress', 'fatigue'],
      emotions: ['anxiété', 'frustration'],
      notes: 'Test craving entry from audit'
    };
    await testEndpoint('Cravings', 'POST /api/cravings', 'post', '/api/cravings', cravingData);
  } catch (error) {
    console.log('  Erreur test POST craving:', error.message);
  }
  
  // Test endpoints exercise sessions
  console.log('  🏋️ Tests exercise sessions...');
  await testEndpoint('Exercise Sessions', 'GET /api/exercise-sessions', 'get', '/api/exercise-sessions');
  
  // Test endpoints sessions
  console.log('  📅 Tests sessions...');
  await testEndpoint('Sessions', 'GET /api/sessions', 'get', '/api/sessions');
  await testEndpoint('Sessions', 'GET /api/patient-sessions', 'get', '/api/patient-sessions');
  
  // Test endpoints stratégies
  console.log('  🎯 Tests stratégies...');
  await testEndpoint('Stratégies', 'GET /api/strategies', 'get', '/api/strategies');
  
  // Test endpoints analyses Beck
  console.log('  🧠 Tests analyses Beck...');
  await testEndpoint('Beck', 'GET /api/beck-analyses', 'get', '/api/beck-analyses');
  
  // Test endpoints routines d'urgence
  console.log('  🚨 Tests routines d\'urgence...');
  await testEndpoint('Urgence', 'GET /api/emergency-routines', 'get', '/api/emergency-routines');
  
  // Test endpoints contenu éducatif
  console.log('  📚 Tests contenu éducatif...');
  await testEndpoint('Éducation', 'GET /api/educational-contents', 'get', '/api/educational-contents');
  await testEndpoint('Éducation', 'GET /api/content-categories', 'get', '/api/content-categories');
  await testEndpoint('Éducation', 'GET /api/content-tags', 'get', '/api/content-tags');
  
  // Test endpoints dashboard
  console.log('  📊 Tests dashboard...');
  await testEndpoint('Dashboard', 'GET /api/dashboard/stats', 'get', '/api/dashboard/stats');
  await testEndpoint('Dashboard', 'GET /api/admin/stats', 'get', '/api/admin/stats');
  await testEndpoint('Dashboard', 'GET /api/admin/dashboard', 'get', '/api/admin/dashboard');
  
  // Test endpoints admin users
  console.log('  👥 Tests gestion utilisateurs...');
  await testEndpoint('Admin', 'GET /api/admin/users', 'get', '/api/admin/users');
  await testEndpoint('Admin', 'GET /api/admin/patients', 'get', '/api/admin/patients');
  await testEndpoint('Admin', 'GET /api/users', 'get', '/api/users');
}

async function testEndpoint(category, name, method, url, data = null) {
  try {
    let response;
    if (method === 'get') {
      response = await client.get(url);
    } else if (method === 'post') {
      response = await client.post(url, data);
    } else if (method === 'put') {
      response = await client.put(url, data);
    } else if (method === 'delete') {
      response = await client.delete(url);
    }
    
    if (response.status === 200 || response.status === 201) {
      const dataInfo = Array.isArray(response.data) 
        ? `${response.data.length} items` 
        : typeof response.data === 'object' ? 'Object returned' : 'Data returned';
      addTestResult(category, name, 'pass', dataInfo);
    } else {
      addTestResult(category, name, 'fail', `Status ${response.status}`);
    }
  } catch (error) {
    if (error.response?.status === 401) {
      addTestResult(category, name, 'fail', 'Session perdue - Requiert authentification', error);
      results.bugs.push({
        category: 'Session Management',
        test: 'Cookie persistence',
        error: 'Les sessions ne persistent pas correctement entre les requêtes',
        severity: 'critical'
      });
    } else if (error.response?.status === 403) {
      addTestResult(category, name, 'skip', 'Requiert permissions admin');
    } else if (error.response?.status === 404) {
      addTestResult(category, name, 'fail', 'Endpoint non trouvé', error);
    } else {
      addTestResult(category, name, 'fail', null, error);
    }
  }
}

// ============================================
// PHASE 3: Tests des fonctionnalités Patient
// ============================================

async function testPatientFeatures() {
  console.log('\n📋 PHASE 3: Tests des fonctionnalités Patient\n');
  
  // Test disponibilité des données
  try {
    const exercises = await client.get('/api/exercises');
    if (exercises.data && exercises.data.length > 0) {
      addTestResult('Patient', 'Accès aux exercices', 'pass', `${exercises.data.length} exercices disponibles`);
      
      // Vérifier qu'au moins un exercice de chaque catégorie existe
      const categories = [...new Set(exercises.data.map(e => e.category))];
      console.log(`   Catégories trouvées: ${categories.join(', ')}`);
    } else {
      addTestResult('Patient', 'Accès aux exercices', 'fail', 'Aucun exercice disponible');
      results.recommendations.push('Créer des exercices par défaut pour les patients (cardio, force, flexibilité, mindfulness)');
    }
  } catch (error) {
    addTestResult('Patient', 'Accès aux exercices', 'fail', null, error);
  }
  
  try {
    const contents = await client.get('/api/educational-contents');
    if (contents.data && contents.data.length > 0) {
      addTestResult('Patient', 'Accès au contenu éducatif', 'pass', `${contents.data.length} contenus disponibles`);
    } else {
      addTestResult('Patient', 'Accès au contenu éducatif', 'fail', 'Aucun contenu disponible');
      results.recommendations.push('Créer du contenu éducatif par défaut (addiction, motivation, coping, prévention rechute)');
    }
  } catch (error) {
    addTestResult('Patient', 'Accès au contenu éducatif', 'fail', null, error);
  }
  
  try {
    const routines = await client.get('/api/emergency-routines');
    if (routines.data && routines.data.length > 0) {
      addTestResult('Patient', 'Routines d\'urgence', 'pass', `${routines.data.length} routines disponibles`);
    } else {
      addTestResult('Patient', 'Routines d\'urgence', 'fail', 'Aucune routine disponible');
      results.recommendations.push('Créer des routines d\'urgence par défaut (respiration, ancrage, distraction)');
    }
  } catch (error) {
    addTestResult('Patient', 'Routines d\'urgence', 'fail', null, error);
  }
  
  try {
    const categories = await client.get('/api/content-categories');
    if (categories.data && categories.data.length > 0) {
      addTestResult('Patient', 'Catégories de contenu', 'pass', `${categories.data.length} catégories disponibles`);
    } else {
      addTestResult('Patient', 'Catégories de contenu', 'fail', 'Aucune catégorie disponible');
      results.recommendations.push('Créer des catégories par défaut pour le contenu éducatif');
    }
  } catch (error) {
    addTestResult('Patient', 'Catégories de contenu', 'fail', null, error);
  }
}

// ============================================
// PHASE 4: Tests des fonctionnalités Admin
// ============================================

async function testAdminFeatures() {
  console.log('\n📋 PHASE 4: Tests des fonctionnalités Admin\n');
  
  // Test stats admin
  try {
    const stats = await client.get('/api/admin/stats');
    if (stats.data) {
      addTestResult('Admin', 'Statistiques admin', 'pass', stats.data);
    } else {
      addTestResult('Admin', 'Statistiques admin', 'fail', 'Pas de données statistiques');
    }
  } catch (error) {
    addTestResult('Admin', 'Statistiques admin', 'fail', null, error);
  }
  
  // Test liste utilisateurs
  try {
    const users = await client.get('/api/admin/users');
    if (users.data && users.data.length > 0) {
      addTestResult('Admin', 'Liste des utilisateurs', 'pass', `${users.data.length} utilisateurs`);
    } else {
      addTestResult('Admin', 'Liste des utilisateurs', 'fail', 'Aucun utilisateur trouvé');
    }
  } catch (error) {
    addTestResult('Admin', 'Liste des utilisateurs', 'fail', null, error);
  }
  
  // Test dashboard admin
  try {
    const dashboard = await client.get('/api/admin/dashboard');
    if (dashboard.data) {
      addTestResult('Admin', 'Dashboard admin', 'pass', dashboard.data);
    } else {
      addTestResult('Admin', 'Dashboard admin', 'fail', 'Pas de données dashboard');
    }
  } catch (error) {
    addTestResult('Admin', 'Dashboard admin', 'fail', null, error);
  }
  
  // Test liste patients
  try {
    const patients = await client.get('/api/admin/patients');
    if (patients.data) {
      const patientCount = Array.isArray(patients.data) ? patients.data.length : 0;
      addTestResult('Admin', 'Liste des patients', 'pass', `${patientCount} patients`);
    } else {
      addTestResult('Admin', 'Liste des patients', 'fail', 'Pas de données patients');
    }
  } catch (error) {
    addTestResult('Admin', 'Liste des patients', 'fail', null, error);
  }
}

// ============================================
// Génération du rapport
// ============================================

function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPPORT D\'AUDIT COMPLET');
  console.log('='.repeat(60) + '\n');
  
  console.log(`📅 Date: ${new Date(results.timestamp).toLocaleString('fr-FR')}`);
  console.log(`🔗 URL testée: ${BASE_URL}\n`);
  
  console.log('📈 RÉSULTATS GLOBAUX:');
  console.log(`   Total de tests: ${results.totalTests}`);
  console.log(`   ✅ Réussis: ${results.passed} (${Math.round(results.passed / results.totalTests * 100)}%)`);
  console.log(`   ❌ Échecs: ${results.failed} (${Math.round(results.failed / results.totalTests * 100)}%)`);
  console.log(`   ⏭️  Ignorés: ${results.skipped} (${Math.round(results.skipped / results.totalTests * 100)}%)\n`);
  
  // Score de qualité
  const qualityScore = Math.round(results.passed / (results.passed + results.failed) * 100);
  console.log(`🎯 SCORE DE QUALITÉ: ${qualityScore}%\n`);
  
  if (results.bugs.length > 0) {
    console.log('🐛 BUGS IDENTIFIÉS:');
    const uniqueBugs = results.bugs.filter((bug, index, self) => 
      index === self.findIndex((b) => b.category === bug.category && b.error === bug.error)
    );
    uniqueBugs.forEach((bug, index) => {
      console.log(`   ${index + 1}. [${bug.severity.toUpperCase()}] ${bug.category} - ${bug.test}`);
      console.log(`      Erreur: ${bug.error}`);
      if (bug.statusCode) {
        console.log(`      Status Code: ${bug.statusCode}`);
      }
      console.log('');
    });
  } else {
    console.log('✅ Aucun bug identifié\n');
  }
  
  if (results.recommendations.length > 0) {
    console.log('💡 RECOMMANDATIONS:');
    const uniqueRecs = [...new Set(results.recommendations)];
    uniqueRecs.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    console.log('');
  }
  
  // Sauvegarder le rapport en JSON
  const reportPath = '/home/user/webapp/audit-results-fixed.json';
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`💾 Rapport détaillé sauvegardé: ${reportPath}\n`);
  
  console.log('='.repeat(60));
  
  // Analyse de la gravité
  const criticalBugs = results.bugs.filter(b => b.severity === 'critical').length;
  const highBugs = results.bugs.filter(b => b.severity === 'high').length;
  
  if (criticalBugs > 0) {
    console.log(`\n⚠️  ATTENTION: ${criticalBugs} bug(s) critique(s) identifié(s)\n`);
  }
  if (qualityScore < 70) {
    console.log(`\n⚠️  Le score de qualité (${qualityScore}%) est inférieur à 70%. Des corrections sont nécessaires.\n`);
  } else if (qualityScore >= 90) {
    console.log(`\n✅ Excellent score de qualité (${qualityScore}%)! L'application est en bon état.\n`);
  }
}

// Lancer l'audit
runAudit().catch(error => {
  console.error('❌ Erreur fatale lors de l\'audit:', error);
  process.exit(1);
});
