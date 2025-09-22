#!/usr/bin/env node

import 'dotenv/config';
import { createPsychoEducationContent } from './create-psycho-education-content.js';
import { createExercisesWithVariations } from './create-exercises-with-variations.js';
import { createAddictionSessions } from './create-addiction-sessions.js';

async function populateAllContent() {
  console.log('🚀 Initialisation complète de la base de données pour Apaddicto...\n');

  try {
    console.log('📚 1/3 - Création du contenu psychoéducatif...');
    await createPsychoEducationContent();
    console.log('✅ Contenu psychoéducatif créé\n');

    console.log('💪 2/3 - Création des exercices avec variations...');  
    await createExercisesWithVariations();
    console.log('✅ Exercices et variations créés\n');

    console.log('🎯 3/3 - Création des séances thérapeutiques...');
    await createAddictionSessions();
    console.log('✅ Séances thérapeutiques créées\n');

    console.log('🎉 INITIALISATION TERMINÉE AVEC SUCCÈS !');
    console.log('\n📋 Récapitulatif du contenu ajouté :');
    console.log('  • 6 articles psychoéducatifs sur l\'addiction et l\'activité physique');
    console.log('  • 7 exercices de base avec 3 variations chacun (21 variations au total)');
    console.log('  • 6 séances thérapeutiques adaptées aux différentes situations :');
    console.log('    - Anti-Craving Urgence (15min)');
    console.log('    - Reconstruction Matinale (25min)');
    console.log('    - Gestion du Stress Quotidien (20min)');
    console.log('    - Programme Rechute - Reconstruction (30min)');
    console.log('    - Séance Maintenance Hebdomadaire (35min)');
    console.log('    - Micro-Séance Énergie (10min)');

    console.log('\n🔧 Fonctionnalités disponibles :');
    console.log('  • Patients peuvent modifier leurs séances (durées, repos, exercices)');
    console.log('  • Variations d\'exercices (simplifications et complexifications)');
    console.log('  • Création d\'exercices personnels par les patients');
    console.log('  • Contenu éducatif basé sur des sources scientifiques fiables');
    console.log('  • Interface admin améliorée pour la gestion du contenu');

    console.log('\n🎯 L\'application Apaddicto est maintenant prête pour accompagner');
    console.log('   les patients dans leur parcours de rétablissement par l\'activité physique !');

  } catch (error) {
    console.error('\n❌ ERREUR lors de l\'initialisation:', error);
    console.log('\n🔧 Solutions possibles :');
    console.log('  1. Vérifiez que la base de données est accessible');
    console.log('  2. Relancez le script après avoir résolu les erreurs');
    console.log('  3. Contactez l\'équipe technique si le problème persiste');
    process.exit(1);
  }
}

// Exécution du script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  populateAllContent()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur fatale:', error);
      process.exit(1);
    });
}

export { populateAllContent };