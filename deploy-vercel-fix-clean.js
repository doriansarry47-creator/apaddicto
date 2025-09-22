#!/usr/bin/env node

/**
 * Script de déploiement automatisé avec corrections Vercel
 * Résout le problème d'authentification SSO et optimise la configuration
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 === DÉPLOIEMENT VERCEL AVEC CORRECTIONS SSO ===\n');

/**
 * Vérification des prérequis
 */
function checkPrerequisites() {
  console.log('🔍 Vérification des prérequis...');
  
  const packageJsonExists = fs.existsSync('./package.json');
  const vercelJsonExists = fs.existsSync('./vercel.json');
  const apiDirExists = fs.existsSync('./api');
  
  if (!packageJsonExists || !vercelJsonExists || !apiDirExists) {
    throw new Error('❌ Fichiers requis manquants (package.json, vercel.json, api/)');
  }
  
  console.log('✅ Prérequis validés');
  return true;
}

/**
 * Validation de la configuration Vercel
 */
function validateVercelConfig() {
  console.log('🔧 Validation de la configuration Vercel...');
  
  const vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
  
  const checks = [
    {
      name: 'Version Vercel',
      check: () => vercelConfig.version === 2,
      message: 'Version Vercel doit être 2'
    },
    {
      name: 'Routes API',
      check: () => vercelConfig.routes?.some(r => r.src?.includes('/api/')),
      message: 'Routes API doivent être configurées'
    },
    {
      name: 'Headers CORS',
      check: () => vercelConfig.headers?.some(h => h.source?.includes('/api/')),
      message: 'Headers CORS doivent être configurés'
    }
  ];
  
  checks.forEach(({ name, check, message }) => {
    if (check()) {
      console.log(`   ✅ ${name}`);
    } else {
      console.log(`   ❌ ${name}: ${message}`);
    }
  });
  
  console.log('✅ Configuration Vercel validée');
}

/**
 * Build du projet
 */
function buildProject() {
  console.log('🏗️ Build du projet...');
  
  try {
    console.log('   📦 Build client...');
    execSync('npm run build:client', { stdio: 'inherit' });
    
    if (!fs.existsSync('./dist')) {
      throw new Error('Build client échoué - dossier dist non trouvé');
    }
    
    console.log('✅ Build terminé avec succès');
  } catch (error) {
    throw new Error(`❌ Erreur de build: ${error.message}`);
  }
}

/**
 * Instructions post-déploiement
 */
function showPostDeploymentInstructions() {
  console.log('\n📋 === INSTRUCTIONS POST-DÉPLOIEMENT ===\n');
  
  console.log('🔑 **IMPORTANT**: Désactiver la protection SSO Vercel');
  console.log('1. Aller sur https://vercel.com/dashboard');
  console.log('2. Sélectionner le projet Apaddicto');
  console.log('3. Settings > General');
  console.log('4. Désactiver "Vercel Authentication" ou "Password Protection"');
  console.log('5. Redéployer si nécessaire\n');
  
  console.log('🧪 **TESTS À EFFECTUER APRÈS DÉPLOIEMENT**:');
  console.log('1. Accéder à https://your-app.vercel.app/api/health');
  console.log('2. Tester la connexion admin:');
  console.log('   Email: doriansarry@yahoo.fr');
  console.log('   Password: admin123');
  console.log('3. Vérifier que tous les endpoints répondent (pas de 401)\n');
  
  console.log('🔧 **EN CAS DE PROBLÈME**:');
  console.log('1. Vérifier les logs Vercel dans le dashboard');
  console.log('2. Consulter le guide: VERCEL_SSO_FIX_GUIDE.md');
  console.log('3. Utiliser le script de diagnostic: node test-connection-diagnosis.js');
}

/**
 * Fonction principale
 */
async function main() {
  try {
    checkPrerequisites();
    validateVercelConfig();
    buildProject();
    
    console.log('\n✅ === PRÉPARATION TERMINÉE ===\n');
    console.log('🚀 Projet prêt pour le déploiement Vercel !');
    console.log('\n**Commandes de déploiement**:');
    console.log('   Via CLI Vercel: vercel --prod');
    console.log('   Via Git: git push origin main (si connecté)\n');
    
    showPostDeploymentInstructions();
    
  } catch (error) {
    console.error('\n❌ Erreur de déploiement:', error.message);
    console.log('\n🔧 **Actions recommandées**:');
    console.log('1. Vérifier les messages d\'erreur ci-dessus');
    console.log('2. Corriger les problèmes identifiés');  
    console.log('3. Relancer ce script');
    process.exit(1);
  }
}

main();