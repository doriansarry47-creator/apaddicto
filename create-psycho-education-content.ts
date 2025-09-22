import { getDB } from './server/db.js';
import { psychoEducationContent } from './shared/schema.js';

async function createPsychoEducationContent() {
  console.log('Création du contenu psychoéducatif basé sur les sources ONAPS...');

  const contents = [
    {
      title: "L'activité physique : votre alliée contre l'addiction",
      content: `
# L'activité physique : votre alliée contre l'addiction

## Qu'est-ce que l'addiction ?

Les addictions sont des pathologies d'ordre cérébral caractérisées par une dépendance à une substance ou à une activité avec des conséquences délétères. Elles touchent le circuit de la récompense dans le cerveau, notamment par l'action sur la dopamine.

## Comment l'activité physique peut-elle vous aider ?

### 1. Activation du même circuit de récompense
L'activité physique active la même voie de récompense que les drogues, par l'augmentation des concentrations de dopamine et la liaison aux récepteurs de la dopamine. Cette activation naturelle peut remplacer progressivement le besoin de substances addictives.

### 2. Réduction des envies de consommer
Des études ont montré que l'activité physique peut réduire significativement :
- Le craving (envie intense de consommer)
- Les symptômes de manque
- L'anxiété et la dépression associées au sevrage

### 3. Amélioration du bien-être global
La pratique régulière d'activité physique contribue à :
- Améliorer l'estime de soi
- Réduire le stress
- Favoriser un meilleur sommeil
- Renforcer la confiance en soi

## Les preuves scientifiques

Selon l'étude de l'Observatoire national de l'activité physique et de la sédentarité (ONAPS) :

- Les personnes physiquement actives sont **moins susceptibles** de consommer des cigarettes ou des drogues illicites
- Les adolescents très actifs présentent une **réduction de 2 à 4 fois** du risque de consommation de substances
- L'activité physique permet d'atteindre des **niveaux significativement plus élevés d'abstinence** dans les programmes de sevrage

## Recommandations pratiques

### Fréquence recommandée :
- **30 à 45 minutes**, 3 fois par semaine minimum
- **150 à 300 minutes** d'intensité modérée par semaine
- Ou **75 à 150 minutes** d'intensité élevée par semaine

### Types d'activités bénéfiques :
- Exercices cardiovasculaires (marche rapide, vélo, natation)
- Renforcement musculaire
- Exercices de relaxation et de respiration
- Sports collectifs (selon le contexte social)

## Important à retenir

L'activité physique n'est pas un remède miracle, mais un **complément efficace** aux traitements traditionnels. Elle doit être pratiquée dans le cadre d'un suivi médical et psychologique approprié.

*Sources : ONAPS 2022 - Activités physiques et sportives, sédentarité, addictions - Revue de littérature*
      `,
      category: 'addiction',
      type: 'article',
      difficulty: 'beginner',
      estimatedReadTime: 8,
      isActive: true
    },
    {
      title: "Comprendre les mécanismes neurobiologiques de l'addiction",
      content: `
# Comprendre les mécanismes neurobiologiques de l'addiction

## Le circuit de la récompense

L'addiction implique principalement le **circuit de la récompense** dans le cerveau, centré sur :
- Le système dopaminergique
- Les régions cérébrales du plaisir
- Les mécanismes d'apprentissage et de mémoire

## La dopamine : neurotransmetteur clé

### Fonctionnement normal
La dopamine est naturellement libérée lors d'activités plaisantes comme :
- Manger un bon repas
- Avoir des relations sociales positives
- Pratiquer une activité physique

### En cas d'addiction
Les substances addictives :
- Provoquent une libération massive de dopamine
- Créent une tolérance progressive
- Nécessitent des doses toujours plus importantes

## L'activité physique : une stimulation naturelle

### Mécanismes bénéfiques
L'exercice physique stimule naturellement :
- La production d'endorphines ("hormones du bonheur")
- La libération de dopamine de manière équilibrée
- La neurogenèse (création de nouveaux neurones)
- La neuroplasticité (capacité d'adaptation du cerveau)

### Effets sur l'addiction
Cette stimulation naturelle peut :
- Réduire le besoin de stimulation artificielle
- Restaurer progressivement l'équilibre neurochimique
- Améliorer les fonctions cognitives
- Renforcer les mécanismes de contrôle inhibiteur

## Types d'exercices particulièrement bénéfiques

### 1. Exercices d'endurance
- Libération prolongée d'endorphines
- Amélioration de la condition cardiovasculaire
- Réduction du stress et de l'anxiété

### 2. Exercices de force
- Amélioration de l'estime de soi
- Renforcement de la discipline
- Gains visibles motivants

### 3. Activités de pleine conscience
- Yoga et tai chi
- Amélioration de la régulation émotionnelle
- Réduction des pensées automatiques négatives

## Recommandations spécifiques

### Phase de sevrage aigu
- Exercices légers à modérés
- Focus sur la régularité plutôt que l'intensité
- Accompagnement professionnel recommandé

### Phase de maintien
- Progression graduelle de l'intensité
- Diversification des activités
- Intégration sociale par le sport

## Précautions importantes

- Éviter les activités à risque de blessure en phase fragile
- Adapter l'intensité selon l'état de santé
- Maintenir un équilibre avec d'autres thérapies
- Surveiller les signes de surentraînement

*Cette approche neurobiologique souligne l'importance de l'activité physique comme outil thérapeutique complémentaire dans la prise en charge des addictions.*
      `,
      category: 'addiction',
      type: 'article',
      difficulty: 'intermediate',
      estimatedReadTime: 10,
      isActive: true
    },
    {
      title: "Gérer les envies de consommer par l'exercice",
      content: `
# Gérer les envies de consommer par l'exercice

## Qu'est-ce que le craving ?

Le **craving** est une envie intense et difficilement contrôlable de consommer une substance addictive. Il peut survenir :
- De manière spontanée
- En réponse à des déclencheurs (stress, émotions, environnement)
- Plusieurs mois après l'arrêt de la consommation

## L'activité physique comme outil de gestion immédiate

### Mécanismes d'action
L'exercice physique permet de :
- **Détourner l'attention** du craving
- **Libérer des endorphines** naturelles
- **Réduire le stress** et l'anxiété
- **Améliorer l'humeur** rapidement

### Exercices d'urgence anti-craving

#### 🏃‍♂️ Exercices cardiovasculaires rapides (5-10 minutes)
- **Montées de genoux sur place** : 30 secondes x 3 séries
- **Jumping jacks** : 30 secondes x 3 séries
- **Course sur place** : 2 minutes continue
- **Burpees modifiés** : 10 répétitions x 2 séries

#### 💪 Exercices de renforcement (5-15 minutes)
- **Pompes** (adaptées selon le niveau) : 3 séries de 8-15 répétitions
- **Squats** : 3 séries de 15-20 répétitions
- **Gainage** : 3 séries de 30 secondes à 1 minute
- **Fentes alternées** : 3 séries de 10 de chaque côté

#### 🧘‍♀️ Exercices de respiration et relaxation (3-10 minutes)
- **Respiration carrée** : 4 temps inspiration, 4 temps rétention, 4 temps expiration, 4 temps pause
- **Étirements dynamiques** : rotation des bras, flexions latérales
- **Marche consciente** : 5-10 minutes en extérieur si possible

## Stratégies personnalisées selon le contexte

### À la maison
- Avoir un **kit d'exercices** préparé à l'avance
- Utiliser des **applications** de fitness courtes
- Préparer un **espace dédié** même petit

### Au travail
- **Escaliers** plutôt qu'ascenseur
- **Marche** pendant les pauses
- **Étirements** discrets au bureau
- **Respiration profonde** en position assise

### En déplacement
- **Exercices au poids du corps** dans la chambre d'hôtel
- **Marche d'exploration** de nouveaux lieux
- **Utilisation d'applications mobiles** sans équipement

## Planification préventive

### Identifier vos déclencheurs
- **Situations** à risque (stress, ennui, tristesse)
- **Moments** critiques (fin de journée, week-end)
- **Lieux** associés à la consommation

### Préparer vos réponses
- **Liste d'exercices** selon le lieu et le temps disponible
- **Numéros d'urgence** (proches, professionnels)
- **Rappels** des bénéfices de l'abstinence

## Suivi et ajustement

### Tenez un journal
- **Intensité** du craving avant/après l'exercice (échelle 1-10)
- **Type d'exercice** le plus efficace selon les situations
- **Durée** nécessaire pour ressentir un soulagement

### Évolution progressive
- **Commencez simple** : 5 minutes suffisent au début
- **Augmentez graduellement** la durée et l'intensité
- **Variez les exercices** pour éviter la lassitude

## Cas d'urgence

Si le craving reste très intense malgré l'exercice :
- **Contactez immédiatement** votre thérapeute ou un proche
- **Utilisez d'autres techniques** complémentaires (méditation, appel d'aide)
- **Ne restez pas seul(e)** dans cette situation

## Témoignage type

*"Quand j'avais envie de boire, je faisais 50 pompes. Au début, c'était dur, mais après 2 minutes d'effort intense, l'envie diminuait déjà. Maintenant, c'est devenu un réflexe automatique."* - Patient en rétablissement

L'exercice physique n'est pas magique, mais c'est un **outil concret et immédiatement disponible** pour reprendre le contrôle lors des moments difficiles.
      `,
      category: 'coping',
      type: 'article',
      difficulty: 'beginner',
      estimatedReadTime: 12,
      isActive: true
    },
    {
      title: "Construire une routine d'exercice durable",
      content: `
# Construire une routine d'exercice durable dans votre parcours de rétablissement

## Pourquoi la régularité est-elle cruciale ?

Dans le processus de rétablissement d'une addiction, la **régularité** de l'activité physique est plus importante que l'intensité. Une pratique constante permet de :
- Stabiliser les neurotransmetteurs
- Créer de nouvelles habitudes saines
- Maintenir un équilibre émotionnel
- Renforcer la confiance en soi

## Les 4 piliers d'une routine durable

### 1. 🎯 Fixez des objectifs réalistes
- **Commencez petit** : 10-15 minutes, 3 fois par semaine
- **Soyez spécifique** : "Je fais 20 minutes de marche lundi, mercredi, vendredi à 18h"
- **Ajustez selon vos capacités** actuelles, pas vos ambitions
- **Célébrez chaque victoire**, même petite

### 2. 📅 Planifiez et structurez
- **Choisissez des créneaux fixes** dans votre semaine
- **Préparez tout à l'avance** (vêtements, équipement)
- **Notez vos séances** dans un agenda
- **Ayez un plan B** (exercices à domicile si météo défavorable)

### 3. 🔄 Variez pour maintenir l'intérêt
- **Alternez les types d'exercices** : cardio, force, souplesse
- **Changez les lieux** : parc, salle, domicile, piscine
- **Essayez de nouvelles activités** régulièrement
- **Suivez vos envies du moment** tout en gardant la structure

### 4. 🤝 Cherchez le soutien social
- **Trouvez un partenaire d'exercice** ou un groupe
- **Partagez vos objectifs** avec vos proches
- **Rejoignez des communautés** (clubs, applications, forums)
- **Célébrez ensemble** vos progrès

## Semaine type pour débuter

### Semaine 1-2 : Établissement de la base
- **Lundi** : 15 min marche rapide
- **Mercredi** : 10 min exercices au poids du corps
- **Vendredi** : 15 min activité libre (vélo, natation, danse)
- **Week-end** : Activité récréative optionnelle (jardinage, ménage actif)

### Semaine 3-4 : Consolidation
- **Lundi** : 20 min marche + 5 min étirements
- **Mercredi** : 15 min circuit training
- **Vendredi** : 20 min activité cardio de votre choix
- **Dimanche** : 30 min activité relaxante (yoga, marche en nature)

### Mois 2+ : Progression personnalisée
- Augmentez progressivement la durée (5 min par semaine)
- Ajoutez une 4ème séance hebdomadaire
- Intégrez des défis personnels motivants
- Explorez de nouvelles disciplines

## Gérer les obstacles courants

### "Je n'ai pas le temps"
- **Fractionnez** : 3 séances de 10 min = 1 séance de 30 min
- **Intégrez** l'activité dans votre quotidien (escaliers, vélo pour les courses)
- **Priorisez** : 20 minutes pour votre santé mentale sont un investissement, pas du temps perdu

### "Je n'ai pas la motivation"
- **Ne dépendez pas de la motivation**, créez des **habitudes automatiques**
- **Commencez mini** : "Je mets juste mes chaussures de sport"
- **Récompensez-vous** après chaque séance
- **Rappelez-vous** pourquoi vous avez commencé

### "C'est trop difficile"
- **Adaptez** chaque exercice à votre niveau actuel
- **Écoutez votre corps** et respectez ses limites
- **Progressez graduellement** (augmentation de 10% par semaine maximum)
- **Consultez** un professionnel si nécessaire

## Intégration avec votre rétablissement

### Liens avec votre thérapie
- **Discutez** de votre routine avec votre thérapeute
- **Utilisez l'exercice** comme sujet dans vos séances
- **Identifiez** comment l'activité physique influence votre état mental
- **Ajustez** selon les phases de votre rétablissement

### Gestion des rechutes d'activité
Si vous interrompez votre routine :
- **Pas de culpabilité** : c'est normal et courant
- **Recommencez plus petit** qu'avant l'arrêt
- **Identifiez** ce qui a causé l'interruption
- **Ajustez** votre approche pour éviter la répétition

## Outils de suivi utiles

### Journal d'activité
- Date et durée de l'exercice
- Type d'activité réalisée
- Niveau d'énergie avant/après (1-10)
- Humeur avant/après (1-10)
- Notes personnelles et ressentis

### Applications recommandées
- Suivi simple d'habitudes
- Programmes d'exercices guidés
- Communautés de soutien en ligne
- Rappels et notifications personnalisables

## Signaux d'une routine bien établie

Après 2-3 mois, vous devriez observer :
- L'exercice devient **automatique** dans votre planning
- Vous ressentez un **manque** les jours sans activité
- Votre **humeur générale** est plus stable
- Vous dormez **mieux**
- Vous gérez **mieux le stress** quotidien

Rappelez-vous : le meilleur programme d'exercice est celui que vous suivrez réellement. Soyez patient avec vous-même et ajustez continuellement selon vos besoins et votre évolution.
      `,
      category: 'motivation',
      type: 'article',
      difficulty: 'beginner',
      estimatedReadTime: 15,
      isActive: true
    },
    {
      title: "L'exercice en groupe : retrouver le lien social",
      content: `
# L'exercice en groupe : retrouver le lien social dans votre rétablissement

## Pourquoi l'aspect social est-il crucial ?

L'addiction isole souvent la personne de son entourage. L'exercice en groupe offre une opportunité unique de :
- **Reconstruire des liens sociaux sains**
- **Partager des expériences positives**
- **Bénéficier d'un soutien mutuel**
- **Développer un sentiment d'appartenance**

## Les bénéfices spécifiques de l'exercice collectif

### 🤝 Support émotionnel
- **Motivation mutuelle** lors des moments difficiles
- **Compréhension partagée** des défis du rétablissement
- **Célébration collective** des victoires
- **Réduction du sentiment d'isolement**

### 🎯 Responsabilisation positive
- **Engagement** envers le groupe
- **Régularité** renforcée par les rendez-vous fixés
- **Dépassement de soi** stimulé par les autres
- **Accountability** bienveillante

### 🧠 Apprentissage social
- **Observation** de stratégies d'adaptation diverses
- **Échange** de techniques et conseils
- **Modèles positifs** dans le groupe
- **Normalisation** du processus de rétablissement

## Types d'activités de groupe adaptées

### Activités thérapeutiques structurées

#### 🏃‍♂️ Groupes de course thérapeutique
- **Running clubs** spécialisés en addiction
- **Programmes** de 8-12 semaines avec objectifs progressifs
- **Encadrement** par des professionnels de santé
- **Combinaison** course + temps d'échange

#### 🧘‍♀️ Yoga et méditation de groupe
- **Classes** adaptées au stress post-addiction
- **Focus** sur la régulation émotionnelle
- **Techniques** de respiration anti-craving
- **Ambiance** bienveillante et non-jugementale

#### 💪 Circuits training collectifs
- **Programmes** de renforcement musculaire
- **Rotation** par stations avec partenaires
- **Adaptation** des exercices selon les niveaux
- **Esprit d'équipe** et d'entraide

### Activités récréatives et sportives

#### ⚽ Sports collectifs adaptés
- **Football, basket, volleyball** en version loisir
- **Règles modifiées** pour l'inclusion de tous niveaux
- **Tournois** internes sans enjeu compétitif
- **Focus** sur le plaisir et la participation

#### 🚶‍♀️ Randonnée et marche nordique
- **Exploration** de nouveaux environnements
- **Rythme** adapté au groupe
- **Moments** de partage et discussion
- **Contact** avec la nature thérapeutique

#### 🏊‍♀️ Aqua-fitness et natation
- **Activités** à faible impact articulaire
- **Convivialité** de l'environnement aquatique
- **Exercices** ludiques et rafraîchissants
- **Accessible** à différents niveaux de forme

## Comment intégrer un groupe ?

### 1. Identifier le bon groupe pour vous
- **Évaluez votre niveau** de forme physique actuel
- **Considérez vos préférences** (intérieur/extérieur, intensité, type d'activité)
- **Renseignez-vous** sur la philosophie du groupe
- **Vérifiez** la compatibilité des horaires

### 2. Premiers pas en douceur
- **Observez** une séance avant de participer
- **Présentez-vous** simplement, sans obligation de tout révéler
- **Participez à votre rythme**, sans pression de performance
- **Engagez-vous** sur 3-4 séances pour donner sa chance au groupe

### 3. Communication avec l'encadrant
- **Informez** discrètement de votre situation si pertinent
- **Discutez** d'éventuelles adaptations nécessaires
- **Établissez** des objectifs personnels réalistes
- **Demandez conseil** pour progresser en sécurité

## Gérer les défis du groupe

### Anxiété sociale
- **Commencez** par des groupes plus petits (5-8 personnes)
- **Choisissez** des activités moins exposées (yoga vs sports collectifs)
- **Préparez** des phrases d'introduction simples
- **Rappelez-vous** que les autres sont là pour les mêmes raisons

### Comparaison avec les autres
- **Concentrez-vous** sur vos propres progrès
- **Célébrez** chaque amélioration personnelle
- **Acceptez** que chacun évolue à son rythme
- **Utilisez** les différences comme sources d'apprentissage

### Pression de performance
- **Communiquez** clairement vos limites
- **Priorisez** la participation sur la performance
- **Adaptez** les exercices selon votre état du jour
- **Quittez temporairement** si nécessaire sans culpabilité

## Créer ou rejoindre un groupe spécialisé

### Dans les structures de soins
- **Hôpitaux** avec programmes d'addictologie
- **Centres** de réhabilitation
- **Associations** spécialisées en addiction
- **CSAPA** (Centres de Soins d'Accompagnement et de Prévention en Addictologie)

### Dans la communauté
- **Clubs** sportifs avec sections "sport santé"
- **Associations** de quartier
- **Centres** de loisirs municipaux
- **Groupes** d'entraide existants

### Initiatives personnelles
- **Proposez** la création d'un groupe dans votre structure de soin
- **Utilisez** les réseaux sociaux pour rassembler
- **Contactez** d'autres personnes en rétablissement
- **Sollicitez** un professionnel pour l'encadrement initial

## Témoignages et exemples de réussite

### Sarah, 34 ans, ex-alcoolodépendante
*"Le groupe de course du mardi soir m'a sauvée. Chaque semaine, je savais que Martine et Jean m'attendaient. Même les jours où j'avais envie de boire, je me disais 'juste aller courir', et après ça allait mieux."*

### David, 42 ans, ex-consommateur de cocaïne  
*"Au début, j'avais honte dans le groupe de musculation. Mais quand j'ai vu que même le 'costaud' du groupe avait ses difficultés personnelles, j'ai compris qu'on était tous là pour se reconstruire."*

## Conseils pour maintenir l'engagement

- **Participez régulièrement**, même les jours difficiles
- **Investissez-vous** dans la vie du groupe (organisation, soutien aux nouveaux)
- **Maintenez** le contact avec les membres en dehors des séances
- **Évoluez** avec le groupe (nouveaux défis, sorties, événements)

L'exercice en groupe n'est pas seulement une activité physique : c'est un moyen de reconstruire votre identité sociale et de vous rappeler que vous n'êtes pas seul dans votre parcours de rétablissement.
      `,
      category: 'motivation',
      type: 'article',
      difficulty: 'beginner',
      estimatedReadTime: 12,
      isActive: true
    },
    {
      title: "Prévention des rechutes par l'activité physique",
      content: `
# Prévention des rechutes par l'activité physique : votre bouclier protecteur

## Comprendre le risque de rechute

La rechute fait partie du processus de rétablissement pour la majorité des personnes. Les statistiques montrent des taux de rechute de **60 à 90% la première année**. L'activité physique représente un outil puissant pour :
- **Réduire** ce risque significativement
- **Gérer** les situations à haut risque
- **Maintenir** l'équilibre neurochimique
- **Renforcer** les stratégies d'adaptation

## Mécanismes de protection par l'exercice

### 🧠 Protection neurobiologique
- **Restauration** de l'équilibre dopaminergique naturel
- **Renforcement** des connexions neuronales liées au contrôle inhibiteur
- **Réduction** de l'hyperactivation du système de stress
- **Amélioration** des fonctions cognitives (attention, mémoire, prise de décision)

### 💪 Renforcement psychologique
- **Augmentation** de l'estime de soi et de l'efficacité personnelle
- **Développement** de la tolérance à l'inconfort physique et émotionnel
- **Création** d'une identité positive ("je suis quelqu'un qui fait du sport")
- **Amélioration** de la régulation émotionnelle

### ⏰ Structuration du quotidien
- **Organisation** du temps libre de manière constructive
- **Création** de routines saines et prévisibles
- **Réduction** des périodes d'inactivité propices aux pensées obsédantes
- **Établissement** de nouveaux rituels remplaçant les anciens

## Identifier vos signaux d'alarme personnels

### Signaux émotionnels
- Augmentation du stress, de l'anxiété ou de l'irritabilité
- Retour de sentiments dépressifs
- Sensation d'isolement ou de solitude
- Perte d'intérêt pour les activités habituelles

### Signaux comportementaux
- Diminution ou arrêt de l'activité physique
- Négligence de l'hygiène de vie (sommeil, alimentation)
- Évitement des proches ou des groupes de soutien
- Retour vers d'anciens lieux ou personnes liés à la consommation

### Signaux cognitifs
- Pensées récurrentes liées à la substance
- Minimisation des conséquences de la consommation passée
- Idéalisation des effets de la substance
- Perte de confiance dans le processus de rétablissement

## Plan d'action exercice anti-rechute

### Phase 1 : Prévention primaire (routine quotidienne)
**Objectif** : Maintenir un niveau de base protecteur

- **Activité quotidienne minimale** : 20-30 minutes d'intensité modérée
- **Routine matinale** : 5-10 minutes d'exercices de réveil (étirements, mobilité)
- **Pauses actives** : intégrer du mouvement dans la journée de travail
- **Activité du soir** : exercices de relaxation ou marche digestive

### Phase 2 : Intervention précoce (premiers signaux d'alarme)
**Objectif** : Intensifier la réponse dès les premiers signaux

- **Augmentation** de la fréquence : passer de 3 à 5-6 séances par semaine
- **Intensité** légèrement supérieure pour maximiser la libération d'endorphines
- **Variété** : essayer de nouvelles activités pour stimuler l'intérêt
- **Support social** : solliciter davantage l'exercice en groupe

### Phase 3 : Gestion de crise (risque imminent de rechute)
**Objectif** : Utiliser l'exercice comme stratégie d'urgence

- **Exercices intensifs** de courte durée (HIIT de 10-15 minutes)
- **Disponibilité immédiate** : avoir toujours un plan d'exercice "d'urgence"
- **Distraction maximale** : activités très engageantes mentalement et physiquement
- **Suivi professionnel** : coordination avec l'équipe thérapeutique

## Programmes spécifiques anti-rechute

### Programme "Bouclier" (maintenance quotidienne)

#### Matin (10 minutes)
- **Réveil musculaire** : rotations articulaires (2 min)
- **Cardio léger** : marche sur place ou étirements dynamiques (5 min)  
- **Affirmations positives** pendant l'exercice (3 min)

#### Midi (15 minutes)
- **Marche consciente** : attention portée sur l'environnement
- **Respiration profonde** : exercices de cohérence cardiaque
- **Étirements** : libération des tensions accumulées

#### Soir (20 minutes)
- **Activité cardiovasculaire** modérée (vélo, marche rapide)
- **Renforcement musculaire** léger (poids du corps)
- **Relaxation** : yoga ou étirements doux

### Programme "Alerte" (signaux d'alarme)

#### Séance intensive (30-45 minutes)
- **Échauffement** : 5 minutes progressif
- **Cœur de séance** : alternance cardio/renforcement (25-35 min)
- **Retour au calme** : étirements et méditation (5-10 min)
- **Journal** : noter les sensations et l'évolution de l'humeur

#### Fréquence adaptée
- **Minimum** : 1 séance par jour
- **Idéal** : 2 séances (matin énergisante + soir relaxante)
- **Flexibilité** : adapter selon l'état du jour

### Programme "Urgence" (crise aiguë)

#### Circuit express (10-20 minutes)
1. **Jumping jacks** : 1 minute
2. **Pompes** (adaptées) : 30 secondes
3. **Squats** : 1 minute  
4. **Gainage** : 30 secondes
5. **Course sur place** : 1 minute
6. **Respiration** profonde : 2 minutes
**Répéter** 2-3 fois selon le besoin

## Suivi et ajustement du plan

### Indicateurs de réussite à surveiller
- **Stabilité émotionnelle** au quotidien
- **Qualité du sommeil** et de l'appétit  
- **Maintien** des relations sociales positives
- **Engagement** dans les activités de rétablissement
- **Confiance** en sa capacité à rester abstinent

### Signaux d'ajustement nécessaire
- **Lassitude** ou perte d'intérêt pour l'exercice habituel
- **Blessures** répétées ou surmenage
- **Inefficacité** de la routine sur l'humeur ou le stress
- **Changements** de situation de vie (travail, déménagement, etc.)

## Intégration avec le suivi thérapeutique

### Communication avec l'équipe soignante
- **Partager** votre plan d'exercice anti-rechute
- **Rapporter** l'efficacité ressentie de différentes activités
- **Ajuster** en fonction des autres traitements (médicaments, thérapies)
- **Signaler** immédiatement les difficultés rencontrées

### Coordination avec les autres stratégies
- **Complémentarité** avec les techniques de gestion du stress
- **Intégration** dans le plan de prévention des rechutes global
- **Synergie** avec les groupes de parole et thérapies individuelles
- **Cohérence** avec les objectifs thérapeutiques généraux

## Témoignage de réussite

*"Il y a eu ce jour où j'ai eu une envie terrible de boire. J'étais devant le bar, la main sur la poignée. Au lieu d'entrer, j'ai fait le tour du pâté de maisons en courant, encore et encore, jusqu'à être épuisé. L'envie était partie. Depuis, je cours dès que ça va mal. Ça fait 18 mois que je suis abstinent."* - Marc, 45 ans

L'activité physique n'est pas une garantie absolue contre la rechute, mais c'est un allié puissant et toujours disponible dans votre arsenal de protection. La clé est d'en faire un automatisme : plus c'est intégré naturellement dans votre vie, plus c'est efficace dans les moments critiques.
      `,
      category: 'relapse_prevention',
      type: 'article',
      difficulty: 'intermediate',
      estimatedReadTime: 18,
      isActive: true
    }
  ];

  for (const content of contents) {
    try {
      await getDB().insert(psychoEducationContent).values(content);
      console.log(`✓ Contenu créé: ${content.title}`);
    } catch (error) {
      console.error(`✗ Erreur pour "${content.title}":`, error.message);
    }
  }

  console.log('\n🎉 Création du contenu psychoéducatif terminée !');
}

// Fonction exportée pour utilisation dans le script principal

export { createPsychoEducationContent };