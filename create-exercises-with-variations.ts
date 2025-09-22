import { getDB } from './server/db.js';
import { exercises, exerciseVariations } from './shared/schema.js';

async function createExercisesWithVariations() {
  console.log('Création des exercices avec variations pour la thérapie par l\'activité physique...');

  // Exercices de base avec leurs variations (simplifications et complexifications)
  const exercisesData = [
    {
      exercise: {
        title: "Pompes",
        description: "Exercice fondamental de renforcement du haut du corps, excellent pour développer la force mentale et physique.",
        category: "strength",
        difficulty: "beginner",
        duration: 5,
        instructions: `
**Position de départ :**
- Placez-vous en position de planche, mains à plat sur le sol
- Écartement des mains légèrement plus large que les épaules
- Corps aligné de la tête aux pieds
- Gainage abdominal actif

**Exécution :**
1. Descendez en fléchissant les bras jusqu'à frôler le sol avec la poitrine
2. Poussez pour revenir à la position initiale
3. Gardez le corps rigide tout au long du mouvement
4. Respirez en descendant, expirez en poussant

**Points clés :**
- Gardez les coudes près du corps
- Ne creusez pas le dos
- Mouvement contrôlé, pas de précipitation
        `,
        benefits: "Renforce les pectoraux, triceps, épaules et gainage. Développe la persévérance et confiance en soi. Idéal pour gérer le stress et les tensions.",
        isActive: true
      },
      variations: [
        {
          type: "simplification",
          title: "Pompes sur les genoux",
          description: "Version adaptée pour débuter en toute sécurité",
          instructions: `
- Positionnez-vous à genoux, mains au sol
- Gardez le buste droit des genoux à la tête
- Même mouvement que les pompes classiques
- Permet de travailler la technique sans la charge complète du poids corporel
          `,
          difficultyModifier: -1,
          benefits: "Apprentissage de la technique en douceur, adaptation progressive à l'effort"
        },
        {
          type: "simplification", 
          title: "Pompes contre un mur",
          description: "Version très accessible pour les grands débutants",
          instructions: `
- Placez-vous debout face à un mur, à une longueur de bras
- Mains à plat contre le mur, écartement des épaules
- Penchez-vous vers le mur puis repoussez
- Augmentez progressivement la distance pour plus de difficulté
          `,
          difficultyModifier: -2,
          benefits: "Version ultra-accessible, permet de commencer même avec une condition physique limitée"
        },
        {
          type: "complexification",
          title: "Pompes pieds surélevés",
          description: "Variation intensive pour progresser",
          instructions: `
- Position de pompes classiques mais pieds surélevés (chaise, marche)
- Plus l'élévation est importante, plus l'exercice est difficile
- Technique identique, charge supplémentaire sur les bras
- Excellent pour développer la force et l'endurance mentale
          `,
          difficultyModifier: 1,
          benefits: "Renforcement musculaire intensifié, développement de la détermination"
        }
      ]
    },
    {
      exercise: {
        title: "Squats (Air Squats)",
        description: "Exercice roi pour les membres inférieurs, symbolise la capacité à se relever face aux difficultés.",
        category: "strength",
        difficulty: "beginner", 
        duration: 5,
        instructions: `
**Position de départ :**
- Pieds écartés largeur des épaules
- Pointes légèrement tournées vers l'extérieur
- Regard droit devant, buste fier

**Exécution :**
1. Asseyez-vous comme sur une chaise invisible
2. Descendez jusqu'à ce que les cuisses soient parallèles au sol
3. Remontez en poussant sur les talons
4. Gardez les genoux dans l'axe des pieds

**Respiration :**
- Inspirez en descendant
- Expirez en remontant avec force

**Visualisation :**
Chaque squat représente votre capacité à vous relever face aux défis de la vie.
        `,
        benefits: "Renforce cuisses, fessiers, mollets. Améliore l'équilibre et la stabilité. Métaphore puissante de résilience.",
        isActive: true
      },
      variations: [
        {
          type: "simplification",
          title: "Squats avec chaise",
          description: "Version assistée pour débuter en confiance",
          instructions: `
- Placez une chaise derrière vous
- Effectuez le squat en touchant légèrement l'assise
- La chaise guide la profondeur du mouvement
- Progressivement, réduisez l'appui sur la chaise
          `,
          difficultyModifier: -1,
          benefits: "Apprentissage sécurisé du mouvement, confiance progressive"
        },
        {
          type: "simplification",
          title: "Demi-squats",
          description: "Amplitude réduite pour commencer en douceur", 
          instructions: `
- Même position que le squat classique
- Descendez seulement à mi-parcours
- Concentrez-vous sur la technique parfaite
- Augmentez l'amplitude progressivement
          `,
          difficultyModifier: -1,
          benefits: "Renforcement progressif, maîtrise technique, confiance en soi"
        },
        {
          type: "complexification", 
          title: "Jump Squats",
          description: "Version explosive pour l'intensité et la libération d'endorphines",
          instructions: `
- Squat classique suivi d'un saut vertical
- Réception en position squat pour enchaîner
- Mouvement explosif vers le haut
- Amortissement souple à la réception
- Excellent pour évacuer stress et frustrations
          `,
          difficultyModifier: 1,
          benefits: "Développement de la puissance, libération d'endorphines, évacuation du stress"
        }
      ]
    },
    {
      exercise: {
        title: "Burpees",
        description: "Exercice complet alliant cardio et renforcement, véritable défi mental représentant la persévérance.",
        category: "cardio",
        difficulty: "intermediate",
        duration: 8,
        instructions: `
**Mouvement complet en 6 étapes :**

1. **Position debout**, bras le long du corps
2. **Accroupissez-vous**, mains au sol
3. **Jetez les pieds** vers l'arrière en position de planche
4. **Effectuez une pompe** (optionnel)
5. **Ramenez les pieds** sous la poitrine
6. **Sautez** bras vers le ciel

**Rythme :**
- Commencez lentement pour maîtriser le mouvement
- Accélérez progressivement selon vos capacités
- La fluidité prime sur la vitesse

**Mental :**
Chaque burpee terminé est une victoire sur vous-même. C'est l'exercice qui forge la détermination.
        `,
        benefits: "Cardio intense, renforcement complet du corps. Développe la ténacité, la persévérance. Excellent pour gérer les pulsions et évacuer les tensions.",
        isActive: true
      },
      variations: [
        {
          type: "simplification",
          title: "Burpees sans pompe",
          description: "Version allégée pour débuter sans découragement",
          instructions: `
- Suivez toutes les étapes sauf la pompe
- Planche simple puis retour des pieds
- Permet de travailler la coordination sans épuisement
- Progression vers la version complète
          `,
          difficultyModifier: -1,
          benefits: "Apprentissage du mouvement, développement de la coordination"
        },
        {
          type: "simplification",
          title: "Burpees sans saut",
          description: "Adaptation pour préserver les articulations",
          instructions: `
- Mouvement complet mais remplacez le saut par une élévation sur pointes
- Idéal si problèmes articulaires ou fatigue importante
- Gardez l'intensité sur les autres phases du mouvement
          `,
          difficultyModifier: -1,
          benefits: "Version articulaire-friendly, maintien de l'intensité cardio"
        },
        {
          type: "complexification",
          title: "Burpees avec pompe + double saut",
          description: "Version intensive pour les plus aguerris",
          instructions: `
- Burpee complet avec pompe obligatoire
- Double saut à la fin (saut avec genoux à la poitrine)
- Défi ultime de résistance mentale
- Symbole de dépassement total de soi
          `,
          difficultyModifier: 2,
          benefits: "Développement de la puissance et de la résistance mentale extrême"
        }
      ]
    },
    {
      exercise: {
        title: "Mountain Climbers",
        description: "Exercice dynamique excellent pour le cardio et le renforcement core, métaphore de l'escalade vers le mieux-être.",
        category: "cardio", 
        difficulty: "beginner",
        duration: 3,
        instructions: `
**Position de départ :**
- Position de planche, mains sous les épaules
- Corps bien aligné, gainage actif
- Une jambe fléchie sous la poitrine, l'autre tendue

**Exécution :**
1. Alternez rapidement les jambes
2. Ramenez alternativement chaque genou vers la poitrine
3. Gardez les hanches stables
4. Respirez de façon rythmée

**Rythme :**
- Commencez lentement pour la technique
- Accélérez selon vos capacités cardio
- Maintenez le gainage en permanence

**Visualisation :**
Comme un alpiniste, chaque mouvement vous élève vers votre objectif de rétablissement.
        `,
        benefits: "Cardio intense, renforcement des abdominaux et stabilisateurs. Améliore la coordination. Excellent pour canaliser l'énergie négative.",
        isActive: true
      },
      variations: [
        {
          type: "simplification", 
          title: "Mountain Climbers lents",
          description: "Version contrôlée pour maîtriser la technique",
          instructions: `
- Même mouvement mais tempo ralenti
- Concentrez-vous sur la qualité du gainage
- 1 seconde pour chaque changement de jambe
- Parfait pour débuter et renforcer les bases
          `,
          difficultyModifier: -1,
          benefits: "Maîtrise technique, renforcement progressif du gainage"
        },
        {
          type: "simplification",
          title: "Mountain Climbers avec pause",
          description: "Version avec repos intégrés",
          instructions: `
- 10 mouvements puis pause de 5 secondes en planche
- Permet de récupérer tout en maintenant l'effort
- Progression vers la version continue
- Idéal si condition cardio limitée
          `,
          difficultyModifier: -1,
          benefits: "Développement cardio progressif, maintien de la motivation"
        },
        {
          type: "complexification",
          title: "Mountain Climbers avec rotation",
          description: "Version avancée avec engagement des obliques",
          instructions: `
- Mountain climbers classiques
- Ajout d'une rotation du genou vers le coude opposé
- Alternez mouvement droit et croisé
- Défi coordination et renforcement latéral
          `,
          difficultyModifier: 1,
          benefits: "Renforcement complet du core, amélioration de la coordination"
        }
      ]
    },
    {
      exercise: {
        title: "Gainage (Planche)",
        description: "Exercice isométrique fondamental développant la stabilité et la force mentale, symbolise la solidité intérieure.",
        category: "strength",
        difficulty: "beginner",
        duration: 10,
        instructions: `
**Position :**
- Appui sur les avant-bras et pointes des pieds
- Coudes sous les épaules
- Corps parfaitement aligné (planche rigide)
- Regard vers le sol, nuque neutre

**Engagement musculaire :**
- Contractez les abdominaux
- Serrez les fessiers
- Maintenez l'alignement tête-pieds
- Respirez calmement et régulièrement

**Progression :**
- Débutant : 15-30 secondes
- Intermédiaire : 30-60 secondes
- Avancé : 1-2 minutes

**Mental :**
Le gainage vous apprend à tenir face à l'inconfort, qualité essentielle dans le rétablissement.
        `,
        benefits: "Renforcement profond des muscles stabilisateurs. Développe la concentration, la résistance mentale à l'inconfort. Améliore la posture.",
        isActive: true
      },
      variations: [
        {
          type: "simplification",
          title: "Gainage sur les genoux",
          description: "Version accessible pour débuter le renforcement du core",
          instructions: `
- Appui sur avant-bras et genoux au lieu des pieds
- Maintien de l'alignement genoux-tête
- Même engagement abdominal
- Progression vers la version complète
          `,
          difficultyModifier: -1,
          benefits: "Apprentissage de l'engagement musculaire, progression douce"
        },
        {
          type: "simplification",
          title: "Gainage contre le mur",
          description: "Version debout pour grands débutants",
          instructions: `
- Placez-vous en position inclinée contre un mur
- Appui sur les avant-bras contre le mur
- Corps incliné mais aligné
- Moins d'intensité, plus de durée possible
          `,
          difficultyModifier: -2,
          benefits: "Introduction au concept de gainage, très accessible"
        },
        {
          type: "complexification",
          title: "Gainage avec élévations",
          description: "Version dynamique pour progresser",
          instructions: `
- Position de gainage classique
- Alternez élévations d'une jambe (5 sec chacune)
- Puis élévations d'un bras (5 sec chacune)
- Défie l'équilibre et la stabilisation
          `,
          difficultyModifier: 1,
          benefits: "Renforcement asymétrique, amélioration de l'équilibre et coordination"
        }
      ]
    },
    {
      exercise: {
        title: "Fentes",
        description: "Exercice unilatéral développant force et équilibre, métaphore de l'avancée progressive vers ses objectifs.",
        category: "strength",
        difficulty: "beginner",
        duration: 6,
        instructions: `
**Position de départ :**
- Debout, pieds écartés largeur de hanches
- Buste droit, regard devant
- Mains sur les hanches ou bras le long du corps

**Exécution :**
1. Grand pas en avant avec une jambe
2. Descendez le bassin jusqu'à angle de 90° aux deux genoux
3. Le genou arrière frôle le sol
4. Poussez sur le talon avant pour revenir
5. Alternez les jambes ou travaillez série par série

**Points clés :**
- Gardez le buste vertical
- Le genou avant reste au-dessus de la cheville
- Mouvement contrôlé vers le bas et vers le haut

**Symbolique :**
Chaque fente représente un pas vers votre nouvelle vie, un équilibre retrouvé.
        `,
        benefits: "Renforce quadriceps, fessiers, mollets. Améliore l'équilibre et la proprioception. Développe la coordination et la confiance dans le mouvement.",
        isActive: true
      },
      variations: [
        {
          type: "simplification",
          title: "Fentes statiques",
          description: "Version fixe pour maîtriser la technique",
          instructions: `
- Gardez la position de fente, pas de changement de jambe
- Montées-descentes sur place
- Maîtrise parfaite avant de passer aux fentes alternées
- Utilisez un support si besoin pour l'équilibre
          `,
          difficultyModifier: -1,
          benefits: "Apprentissage technique, développement de l'équilibre"
        },
        {
          type: "simplification", 
          title: "Fentes avec support",
          description: "Version assistée pour débuter en confiance",
          instructions: `
- Tenez-vous près d'un mur ou d'une chaise
- Utilisez le support pour maintenir l'équilibre
- Réduisez progressivement l'appui sur le support
- Focus sur la technique plutôt que l'équilibre
          `,
          difficultyModifier: -1,
          benefits: "Sécurité renforcée, confiance progressive, maîtrise technique"
        },
        {
          type: "complexification",
          title: "Fentes sautées",
          description: "Version explosive pour l'intensité cardio",
          instructions: `
- Position de fente puis saut pour changer de jambe en l'air
- Réception directe en fente opposée
- Mouvement explosif et contrôlé
- Excellent pour le cardio et la puissance
          `,
          difficultyModifier: 1,
          benefits: "Développement de la puissance, intensité cardio, coordination avancée"
        }
      ]
    },
    {
      exercise: {
        title: "Jumping Jacks",
        description: "Exercice cardio ludique et énergisant, symbolise la joie retrouvée du mouvement.",
        category: "cardio",
        difficulty: "beginner",
        duration: 4,
        instructions: `
**Position de départ :**
- Debout, pieds joints, bras le long du corps
- Posture droite, regard devant

**Exécution :**
1. Sautez en écartant simultanément jambes et bras
2. Les pieds atterrissent écartés, bras se rejoignent au-dessus de la tête
3. Sautez pour revenir en position initiale
4. Mouvement fluide et rythmé

**Rythme :**
- Commencez lentement pour coordonner bras et jambes
- Accélérez progressivement
- Respirez naturellement

**Énergie :**
L'exercice emblématique de la joie de bouger ! Laissez-vous porter par l'énergie positive.
        `,
        benefits: "Excellent échauffement et cardio léger. Améliore la coordination. Libère des endorphines rapidement. Évoque la joie et la légèreté.",
        isActive: true
      },
      variations: [
        {
          type: "simplification",
          title: "Stepping Jacks",
          description: "Version sans saut pour préserver les articulations",
          instructions: `
- Remplacez les sauts par des pas de côté alternés
- Gardez le mouvement des bras identique
- Un pied de côté, bras vers le haut, puis retour
- Même rythme mais sans impact
          `,
          difficultyModifier: -1,
          benefits: "Version douce pour les articulations, maintien du mouvement cardio"
        },
        {
          type: "simplification",
          title: "Jumping Jacks assis",
          description: "Adaptation pour personnes à mobilité réduite",
          instructions: `
- Assis sur une chaise, travail des bras uniquement
- Mouvements amples et rythmés des bras
- Ajout de mouvements des jambes si possible
- Adaptation totale aux capacités individuelles
          `,
          difficultyModifier: -2,
          benefits: "Inclusion totale, travail cardio adapté, maintien de la motivation"
        },
        {
          type: "complexification",
          title: "Star Jumps",
          description: "Version intensive avec position étoile",
          instructions: `
- Même principe mais saut plus ample
- Position d'arrivée en étoile (jambes très écartées, bras en V)
- Saut plus haut et plus expressif
- Version festive et énergisante
          `,
          difficultyModifier: 1,
          benefits: "Intensité cardio supérieure, expression corporelle, joie du mouvement"
        }
      ]
    }
  ];

  // Insertion des exercices et leurs variations
  for (const { exercise, variations } of exercisesData) {
    try {
      // Insérer l'exercice principal
      const [insertedExercise] = await getDB().insert(exercises).values(exercise).returning();
      console.log(`✓ Exercice créé: ${exercise.title}`);

      // Insérer les variations
      for (const variation of variations) {
        const variationData = {
          ...variation,
          exerciseId: insertedExercise.id,
          isActive: true
        };
        
        await getDB().insert(exerciseVariations).values(variationData);
        console.log(`  ↳ Variation ajoutée: ${variation.title}`);
      }

    } catch (error) {
      console.error(`✗ Erreur pour l'exercice "${exercise.title}":`, error.message);
    }
  }

  console.log('\n🎉 Création des exercices et variations terminée !');
  console.log('📝 Exercices créés avec des variations adaptées pour tous niveaux');
  console.log('💪 Chaque exercice peut être simplifié ou complexifié selon les besoins du patient');
}

// Exécution si le script est lancé directement
// Fonction exportée pour utilisation dans le script principal

export { createExercisesWithVariations };