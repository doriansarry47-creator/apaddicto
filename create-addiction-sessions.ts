import { getDB } from './server/db.js';
import { customSessions, sessionElements, exercises, users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function createAddictionSessions() {
  console.log('Création des séances thérapeutiques spécifiques aux addictions...');

  // Récupérer ou créer un utilisateur admin pour être le créateur des séances
  const adminUsers = await getDB().select().from(users).where(eq(users.role, 'admin'));
  let adminId = '';
  
  if (adminUsers.length > 0) {
    adminId = adminUsers[0].id;
  } else {
    // Créer un utilisateur admin système temporaire pour les séances par défaut
    console.log('Création d\'un utilisateur admin pour les séances par défaut...');
    const newAdmin = await getDB().insert(users).values({
      email: 'system.admin@apaddicto.app',
      password: '$2a$10$placeholder.hash.for.system.admin', 
      firstName: 'Système',
      lastName: 'Admin',
      role: 'admin'
    }).returning();
    adminId = newAdmin[0].id;
    console.log('✓ Administrateur système créé pour les séances par défaut');
  }

  // Récupérer les exercices existants pour créer les séances
  const exercisesList = await getDB().select().from(exercises).where(eq(exercises.isActive, true));
  const exerciseMap = {};
  exercisesList.forEach(ex => {
    exerciseMap[ex.title.toLowerCase()] = ex.id;
  });

  const sessionsData = [
    {
      session: {
        title: "Séance Anti-Craving Urgence",
        description: `Séance d'urgence de 15 minutes pour gérer une envie intense de consommer. Exercices à haute intensité pour libérer rapidement des endorphines et détourner l'attention du craving.

**Objectifs :**
- Réduction immédiate du craving
- Libération d'endorphines naturelles  
- Évacuation du stress et des tensions
- Reprise de contrôle sur son corps et ses émotions

**Quand l'utiliser :**
- Envie intense et soudaine de consommer
- Stress important ou anxiété
- Moments de vulnérabilité émotionnelle
- Besoin urgent de décompresser`,
        category: "crisis",
        totalDuration: 15,
        difficulty: "intermediate", 
        isTemplate: true,
        isPublic: true,
        tags: ["craving", "urgence", "stress", "endorphines"],
        isActive: true
      },
      elements: [
        { exerciseName: "jumping jacks", duration: 2, repetitions: null, order: 1, restTime: 30, notes: "Échauffement énergique pour activer la circulation" },
        { exerciseName: "burpees", duration: 3, repetitions: null, order: 2, restTime: 60, notes: "Intensité maximale - évacuation totale du stress" },
        { exerciseName: "mountain climbers", duration: 2, repetitions: null, order: 3, restTime: 45, notes: "Maintien de l'intensité cardio" },
        { exerciseName: "squats (air squats)", duration: 2, repetitions: null, order: 4, restTime: 30, notes: "Force mentale - 'je me relève toujours'" },
        { exerciseName: "gainage (planche)", duration: 1, repetitions: null, order: 5, restTime: 60, notes: "Renforcement de la stabilité intérieure" },
        { exerciseName: "pompes", duration: 2, repetitions: null, order: 6, restTime: 30, notes: "Dernière poussée - affirmation de sa force" },
        { exerciseName: "jumping jacks", duration: 2, repetitions: null, order: 7, restTime: 0, notes: "Retour au calme progressif - célébration de la victoire" }
      ]
    },
    {
      session: {
        title: "Séance Reconstruction Matinale",
        description: `Routine matinale de 25 minutes pour bien commencer la journée avec une énergie positive. Combinaison d'exercices de réveil, de renforcement et de mise en confiance.

**Objectifs :**
- Démarrer la journée avec énergie et positivité
- Renforcer la discipline personnelle
- Créer un rituel sain et structurant
- Préparer mentalement aux défis du jour

**Bénéfices :**
- Amélioration de l'humeur pour toute la journée
- Renforcement de l'estime de soi
- Création d'une habitude positive
- Meilleure gestion du stress quotidien`,
        category: "morning",
        totalDuration: 25,
        difficulty: "beginner",
        isTemplate: true, 
        isPublic: true,
        tags: ["matin", "énergie", "discipline", "rituel"],
        isActive: true
      },
      elements: [
        { exerciseName: "jumping jacks", duration: 3, repetitions: null, order: 1, restTime: 30, notes: "Réveil en douceur du système cardio" },
        { exerciseName: "squats (air squats)", duration: 4, repetitions: null, order: 2, restTime: 60, notes: "Activation des grandes masses musculaires" },
        { exerciseName: "pompes", duration: 4, repetitions: null, order: 3, restTime: 90, notes: "Renforcement du haut du corps - confiance en soi" },
        { exerciseName: "fentes", duration: 4, repetitions: null, order: 4, restTime: 60, notes: "Équilibre et coordination - stabilité mentale" },
        { exerciseName: "gainage (planche)", duration: 2, repetitions: null, order: 5, restTime: 90, notes: "Force du core - solidité intérieure" },
        { exerciseName: "mountain climbers", duration: 3, repetitions: null, order: 6, restTime: 60, notes: "Cardio final énergisant" },
        { exerciseName: "jumping jacks", duration: 2, repetitions: null, order: 7, restTime: 0, notes: "Célébration - prêt(e) pour la journée!" }
      ]
    },
    {
      session: {
        title: "Séance Gestion du Stress Quotidien",
        description: `Séance de 20 minutes spécialement conçue pour évacuer le stress accumulé dans la journée et prévenir les envies de consommer liées aux tensions.

**Contexte d'utilisation :**
- Après une journée de travail difficile
- Lors de conflits ou situations stressantes
- Avant un événement anxiogène
- Quand on sent monter les tensions

**Approche :**
Alternance entre exercices d'évacuation du stress (intensité élevée) et exercices de recentrage (intensité modérée) pour un équilibre optimal.`,
        category: "evening",
        totalDuration: 20,
        difficulty: "beginner",
        isTemplate: true,
        isPublic: true, 
        tags: ["stress", "détente", "équilibre", "prévention"],
        isActive: true
      },
      elements: [
        { exerciseName: "jumping jacks", duration: 2, repetitions: null, order: 1, restTime: 30, notes: "Évacuation des premières tensions" },
        { exerciseName: "squats (air squats)", duration: 4, repetitions: null, order: 2, restTime: 60, notes: "Ancrage - connexion avec son corps" },
        { exerciseName: "pompes", duration: 3, repetitions: null, order: 3, restTime: 90, notes: "Évacuation de l'agressivité et frustration" },
        { exerciseName: "gainage (planche)", duration: 2, repetitions: null, order: 4, restTime: 60, notes: "Recentrage - stabilité émotionnelle" },
        { exerciseName: "fentes", duration: 3, repetitions: null, order: 5, restTime: 60, notes: "Équilibre retrouvé - confiance" },
        { exerciseName: "mountain climbers", duration: 2, repetitions: null, order: 6, restTime: 90, notes: "Dernière évacuation des tensions" },
        { exerciseName: "gainage (planche)", duration: 2, repetitions: null, order: 7, restTime: 0, notes: "Retour au calme - sérénité retrouvée" }
      ]
    },
    {
      session: {
        title: "Programme Rechute - Reconstruction",
        description: `Séance de 30 minutes pour accompagner une reprise après rechute. Exercices progressifs pour retrouver confiance sans jugement, avec focus sur la bienveillance envers soi-même.

**Philosophie :**
Pas de performance, juste de la présence à soi. Chaque mouvement est une affirmation : "Je recommence, je me relève, je me donne une nouvelle chance."

**Adaptations spéciales :**
- Rythme très personnalisable
- Possibilité de réduire chaque durée de moitié
- Focus sur l'encouragement et la remise en confiance
- Aucune pression de performance`,
        category: "maintenance", 
        totalDuration: 30,
        difficulty: "beginner",
        isTemplate: true,
        isPublic: true,
        tags: ["rechute", "bienveillance", "reconstruction", "confiance"],
        isActive: true
      },
      elements: [
        { exerciseName: "jumping jacks", duration: 3, repetitions: null, order: 1, restTime: 90, notes: "Réveil en douceur - pas de pression" },
        { exerciseName: "squats (air squats)", duration: 4, repetitions: null, order: 2, restTime: 120, notes: "Je me relève, toujours - symbolique forte" },
        { exerciseName: "gainage (planche)", duration: 2, repetitions: null, order: 3, restTime: 90, notes: "Retrouver sa stabilité intérieure" },
        { exerciseName: "pompes", duration: 3, repetitions: null, order: 4, restTime: 120, notes: "Ma force revient progressivement" },
        { exerciseName: "fentes", duration: 4, repetitions: null, order: 5, restTime: 90, notes: "Pas à pas vers l'avant - patience et bienveillance" },
        { exerciseName: "mountain climbers", duration: 3, repetitions: null, order: 6, restTime: 120, notes: "L'ascension reprend - à mon rythme" },
        { exerciseName: "gainage (planche)", duration: 2, repetitions: null, order: 7, restTime: 90, notes: "Ma fondation se renforce" },
        { exerciseName: "jumping jacks", duration: 3, repetitions: null, order: 8, restTime: 0, notes: "Célébration douce - fierté de ce petit pas" }
      ]
    },
    {
      session: {
        title: "Séance Maintenance Hebdomadaire",
        description: `Séance complète de 35 minutes pour maintenir une condition physique et mentale stable. Equilibre parfait entre cardio, renforcement et bien-être mental.

**Objectifs de maintenance :**
- Maintenir les bénéfices acquis
- Prévenir les rechutes par l'activité régulière
- Renforcer l'identité "sportive" positive
- Création d'un rendez-vous plaisir avec soi-même

**Programmation recommandée :**
2-3 fois par semaine, jours fixes pour créer un rituel structurant et prévisible.`,
        category: "maintenance",
        totalDuration: 35,
        difficulty: "intermediate", 
        isTemplate: true,
        isPublic: true,
        tags: ["maintenance", "équilibre", "régularité", "plaisir"],
        isActive: true
      },
      elements: [
        { exerciseName: "jumping jacks", duration: 4, repetitions: null, order: 1, restTime: 60, notes: "Échauffement progressif" },
        { exerciseName: "squats (air squats)", duration: 5, repetitions: null, order: 2, restTime: 90, notes: "Renforcement des jambes - base solide" },
        { exerciseName: "pompes", duration: 4, repetitions: null, order: 3, restTime: 90, notes: "Force du haut du corps" },
        { exerciseName: "mountain climbers", duration: 4, repetitions: null, order: 4, restTime: 90, notes: "Intensité cardio - évacuation" },
        { exerciseName: "fentes", duration: 5, repetitions: null, order: 5, restTime: 90, notes: "Équilibre et coordination" },
        { exerciseName: "burpees", duration: 3, repetitions: null, order: 6, restTime: 120, notes: "Défi mental - dépassement de soi" },
        { exerciseName: "gainage (planche)", duration: 3, repetitions: null, order: 7, restTime: 90, notes: "Stabilité core - force mentale" },
        { exerciseName: "pompes", duration: 3, repetitions: null, order: 8, restTime: 90, notes: "Renforcement final" },
        { exerciseName: "jumping jacks", duration: 3, repetitions: null, order: 9, restTime: 0, notes: "Retour au calme - satisfaction du devoir accompli" }
      ]
    },
    {
      session: {
        title: "Micro-Séance Énergie (10min)",
        description: `Séance ultra-courte de 10 minutes pour les journées chargées ou moments de baisse d'énergie. Aucune excuse possible - accessible partout, tout le temps.

**Principe :**
Mieux vaut 10 minutes que rien. Cette séance maintient le lien avec l'activité physique même dans les périodes difficiles.

**Utilisation :**
- Journées très chargées
- Manque de motivation
- Voyage ou déplacement
- Rappel quotidien minimum

**Promesse :**
En 10 minutes, retrouver de l'énergie et l'impression d'avoir pris soin de soi.`,
        category: "maintenance",
        totalDuration: 10,
        difficulty: "beginner",
        isTemplate: true,
        isPublic: true,
        tags: ["court", "énergie", "accessible", "quotidien"],
        isActive: true
      },
      elements: [
        { exerciseName: "jumping jacks", duration: 2, repetitions: null, order: 1, restTime: 30, notes: "Réveil immédiat du système" },
        { exerciseName: "squats (air squats)", duration: 2, repetitions: null, order: 2, restTime: 30, notes: "Activation musculaire rapide" },
        { exerciseName: "pompes", duration: 2, repetitions: null, order: 3, restTime: 30, notes: "Renforcement express" },
        { exerciseName: "mountain climbers", duration: 2, repetitions: null, order: 4, restTime: 30, notes: "Boost cardio" },
        { exerciseName: "gainage (planche)", duration: 1, repetitions: null, order: 5, restTime: 0, notes: "Finition en force - mission accomplie!" }
      ]
    }
  ];

  // Insertion des séances et de leurs éléments
  for (const { session, elements } of sessionsData) {
    try {
      // Insérer la séance
      const [insertedSession] = await getDB().insert(customSessions).values({
        ...session,
        creatorId: adminId // L'admin sera le créateur par défaut
      }).returning();
      
      console.log(`✓ Séance créée: ${session.title}`);

      // Insérer les éléments de la séance
      for (const element of elements) {
        const exerciseId = exerciseMap[element.exerciseName];
        if (!exerciseId) {
          console.log(`⚠️  Exercice non trouvé: ${element.exerciseName}`);
          continue;
        }

        const elementData = {
          sessionId: insertedSession.id,
          exerciseId: exerciseId,
          order: element.order,
          duration: element.duration,
          repetitions: element.repetitions,
          restTime: element.restTime,
          notes: element.notes,
          isOptional: false
        };
        
        await getDB().insert(sessionElements).values(elementData);
      }
      
      console.log(`  ↳ ${elements.length} éléments ajoutés`);

    } catch (error) {
      console.error(`✗ Erreur pour la séance "${session.title}":`, error.message);
    }
  }

  console.log('\n🎉 Création des séances thérapeutiques terminée !');
  console.log('📋 Séances créées :');
  console.log('  • Anti-Craving Urgence (15min) - pour les moments de crise');
  console.log('  • Reconstruction Matinale (25min) - routine positive du matin');
  console.log('  • Gestion du Stress Quotidien (20min) - évacuation des tensions');
  console.log('  • Programme Rechute (30min) - accompagnement bienveillant');
  console.log('  • Maintenance Hebdomadaire (35min) - entretien régulier');
  console.log('  • Micro-Séance Énergie (10min) - accessible en toute circonstance');
}

// Exécution si le script est lancé directement
// Fonction exportée pour utilisation dans le script principal

export { createAddictionSessions };