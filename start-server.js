#!/usr/bin/env node

/**
 * Script de démarrage amélioré pour Apaddicto
 * Gère le démarrage en développement et en production avec tous les contrôles nécessaires
 */

import 'dotenv/config';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;

console.log('🚀 Démarrage d\'Apaddicto');
console.log('📍 Environnement:', NODE_ENV);
console.log('🔌 Port:', PORT);

function checkRequiredFiles() {
  const requiredFiles = [
    'package.json',
    'server/index.ts',
    'api/index.js',
    '.env'
  ];

  console.log('\n📋 Vérification des fichiers requis...');
  
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Fichier manquant: ${file}`);
      return false;
    }
    console.log(`✅ ${file}`);
  }
  
  return true;
}

function checkEnvironmentVariables() {
  const requiredVars = ['DATABASE_URL', 'SESSION_SECRET'];
  
  console.log('\n🔧 Vérification des variables d\'environnement...');
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`❌ Variable manquante: ${varName}`);
      return false;
    }
    console.log(`✅ ${varName}`);
  }
  
  return true;
}

function buildProject() {
  return new Promise((resolve, reject) => {
    console.log('\n🔨 Construction du projet...');
    
    const buildProcess = spawn('npm', ['run', 'build'], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Construction réussie');
        resolve();
      } else {
        console.error('❌ Échec de la construction');
        reject(new Error(`Build failed with code ${code}`));
      }
    });
  });
}

function startDevelopmentServer() {
  console.log('\n🛠️ Démarrage du serveur de développement...');
  
  const devProcess = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  devProcess.on('close', (code) => {
    console.log(`Serveur de développement arrêté avec le code: ${code}`);
  });
  
  return devProcess;
}

function startProductionServer() {
  console.log('\n🏭 Démarrage du serveur de production...');
  
  const prodProcess = spawn('npm', ['start'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  prodProcess.on('close', (code) => {
    console.log(`Serveur de production arrêté avec le code: ${code}`);
  });
  
  return prodProcess;
}

function installDependencies() {
  return new Promise((resolve, reject) => {
    console.log('\n📦 Installation des dépendances...');
    
    const installProcess = spawn('npm', ['install'], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Dépendances installées');
        resolve();
      } else {
        console.error('❌ Échec de l\'installation des dépendances');
        reject(new Error(`Install failed with code ${code}`));
      }
    });
  });
}

async function main() {
  try {
    // Vérifications préliminaires
    if (!checkRequiredFiles()) {
      process.exit(1);
    }
    
    if (!checkEnvironmentVariables()) {
      process.exit(1);
    }
    
    // Installation des dépendances si nécessaire
    if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
      await installDependencies();
    }
    
    // Construction pour la production
    if (NODE_ENV === 'production') {
      await buildProject();
    }
    
    // Démarrage du serveur approprié
    let serverProcess;
    if (NODE_ENV === 'development') {
      serverProcess = startDevelopmentServer();
    } else {
      serverProcess = startProductionServer();
    }
    
    // Gestion de l'arrêt gracieux
    process.on('SIGINT', () => {
      console.log('\n🛑 Arrêt du serveur...');
      serverProcess.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Arrêt du serveur (SIGTERM)...');
      serverProcess.kill('SIGTERM');
      process.exit(0);
    });
    
    console.log('\n✅ Serveur démarré avec succès !');
    console.log(`🌐 Accédez à l'application: http://localhost:${PORT}`);
    
  } catch (error) {
    console.error('💥 Erreur lors du démarrage:', error.message);
    process.exit(1);
  }
}

// Lancement du script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}