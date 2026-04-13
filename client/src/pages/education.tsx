import React, { useState } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, Search, Brain, Heart, Zap, Shield, Clock, 
  ChevronDown, ChevronUp, Star, CheckCircle2, ArrowLeft,
  Lightbulb, Target, TrendingUp, AlertCircle, Users
} from "lucide-react";

// =============================================
// ARTICLES SCIENTIFIQUES VULGARISÉS
// Basés sur des études peer-reviewed réelles
// =============================================
interface Article {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  icon: React.ReactNode;
  readTime: number;
  difficulty: "facile" | "intermédiaire" | "avancé";
  tags: string[];
  summary: string;
  source: string;
  content: Section[];
  keyPoints: string[];
}

interface Section {
  heading: string;
  text: string;
}

const ARTICLES: Article[] = [
  // ============================
  // CATÉGORIE : COMPRENDRE L'ADDICTION
  // ============================
  {
    id: "1",
    title: "Comment le cerveau développe une dépendance",
    category: "Comprendre l'addiction",
    categoryColor: "bg-purple-100 text-purple-800",
    icon: <Brain className="h-5 w-5" />,
    readTime: 7,
    difficulty: "facile",
    tags: ["dopamine", "cerveau", "dépendance", "neurologie"],
    summary: "Découvrez pourquoi l'addiction n'est pas une question de volonté, mais une modification réelle du cerveau — et comment cette connaissance peut vous aider.",
    source: "Volkow et al., New England Journal of Medicine (2016); NIDA Research Reports",
    keyPoints: [
      "L'addiction est une maladie cérébrale chronique, pas un manque de volonté",
      "La dopamine joue un rôle central dans le circuit de récompense",
      "Le cerveau peut se reconstruire avec du temps et du soutien",
      "Comprendre le mécanisme aide à dédramatiser les rechutes"
    ],
    content: [
      {
        heading: "🧠 Le circuit de la récompense : votre « bouton plaisir »",
        text: "Dans votre cerveau, il existe un système appelé le circuit de la récompense. Chaque fois que vous faites quelque chose d'agréable — manger, rire avec des amis, faire du sport — ce circuit libère un messager chimique appelé dopamine. Cette dopamine vous donne une sensation de plaisir et vous pousse à recommencer.\n\nLes substances addictives (alcool, drogues, mais aussi certains comportements) activent ce même circuit, mais beaucoup plus fort que les plaisirs naturels. C'est comme si on appuyait sur le bouton plaisir avec un maillet au lieu d'un doigt."
      },
      {
        heading: "🔄 Pourquoi le cerveau change avec l'usage répété",
        text: "Quand une substance est consommée régulièrement, le cerveau s'adapte. Il réduit sa sensibilité à la dopamine pour compenser l'excès. Résultat : on ressent moins de plaisir pour les choses ordinaires, et on a besoin de plus de la substance pour ressentir l'effet d'avant. C'est ce qu'on appelle la tolérance.\n\nEn parallèle, certaines zones du cerveau liées à la maîtrise de soi (le cortex préfrontal) deviennent moins actives, tandis que les zones liées à la survie et à l'urgence s'emballent. Le cerveau commence à traiter la substance comme un besoin vital, au même titre que boire de l'eau."
      },
      {
        heading: "💡 Ce que ça change pour vous",
        text: "Comprendre que l'addiction est une modification réelle du cerveau, documentée par imagerie cérébrale (IRM), change tout. Cela signifie :\n\n• Ce n'est PAS un manque de volonté ou un défaut de caractère\n• Les rechutes font partie du processus de guérison d'une maladie chronique\n• Le cerveau peut se reconstruire — c'est ce qu'on appelle la neuroplasticité\n• Les traitements (thérapies, médicaments, soutien social) fonctionnent réellement"
      },
      {
        heading: "🌱 La bonne nouvelle : le cerveau peut changer",
        text: "Des études d'imagerie cérébrale (NIDA, 2020) montrent qu'après une période d'abstinence, le cerveau commence à récupérer. Les voies de la récompense se reconstituent progressivement. Ce n'est pas immédiat — cela peut prendre des mois — mais c'est réel et documenté.\n\nChaque jour sans consommer, chaque exercice de pleine conscience, chaque activité positive que vous pratiquez contribue à recâbler votre cerveau. Ce n'est pas une métaphore : c'est de la biologie."
      }
    ]
  },
  {
    id: "2",
    title: "Les cravings : pourquoi ils arrivent et comment y faire face",
    category: "Comprendre l'addiction",
    categoryColor: "bg-purple-100 text-purple-800",
    icon: <Brain className="h-5 w-5" />,
    readTime: 6,
    difficulty: "facile",
    tags: ["craving", "envie", "gestion", "triggers"],
    summary: "Un craving n'est pas une faiblesse — c'est une réaction normale de votre cerveau. Voici ce qui se passe réellement et 4 stratégies prouvées pour traverser ces moments.",
    source: "Witkiewitz & Marlatt, Clinical Psychology Review (2004); Baker et al., Psychological Review (2004)",
    keyPoints: [
      "Un craving dure en moyenne 15-20 minutes puis diminue naturellement",
      "Les déclencheurs (triggers) peuvent être appris et anticipés",
      "La technique du 'surf sur le craving' est validée scientifiquement",
      "La distraction active est l'une des stratégies les plus efficaces"
    ],
    content: [
      {
        heading: "🌊 Un craving, c'est quoi exactement ?",
        text: "Le craving (en français : envie intense ou fringale de consommer) est une sensation puissante qui surgit soudainement. C'est votre cerveau qui réclame la substance à laquelle il s'est habitué.\n\nCette sensation est désagréable, parfois très intense, mais elle a une caractéristique essentielle : elle est temporaire. Les recherches montrent qu'un craving atteint son pic entre 3 et 5 minutes après son déclenchement, puis diminue progressivement. La plupart des cravings disparaissent d'eux-mêmes en 15 à 20 minutes."
      },
      {
        heading: "🎯 Pourquoi les cravings se déclenchent-ils ?",
        text: "Votre cerveau associe des situations, des émotions, des lieux ou des personnes à la consommation passée. Ces associations s'appellent des 'triggers' (déclencheurs). Voici les plus courants :\n\n• Émotions : stress, ennui, solitude, colère, anxiété\n• Lieux ou personnes associés à la consommation passée\n• Certaines heures de la journée (fin de journée, week-end)\n• Voir ou sentir la substance\n• Certains états physiques (fatigue, faim)\n\nConnaître VOS déclencheurs personnels est l'une des meilleures protections."
      },
      {
        heading: "🏄 La technique du 'surf sur le craving'",
        text: "Développée par le Dr Alan Marlatt (Université de Washington), cette technique consiste à observer le craving sans lui obéir, comme un surfeur qui regarde une vague passer.\n\nComment pratiquer :\n1. Remarquez le craving sans panique : 'Je ressens une envie de consommer'\n2. Observez où vous le sentez dans votre corps (gorge, poitrine, ventre)\n3. Respirez lentement (4 secondes d'inspiration, 4 de pause, 4 d'expiration)\n4. Répétez-vous : 'Cette vague va passer. Je n'ai pas à y céder'\n5. Attendez — dans 15-20 minutes, elle sera passée\n\nDes études (Bowen & Marlatt, 2009) montrent que cette technique réduit significativement l'intensité des cravings et le risque de rechute."
      },
      {
        heading: "🛠️ 4 autres stratégies prouvées",
        text: "1. **La distraction active** : Appelez quelqu'un, faites une marche rapide, faites la vaisselle. Engager le corps et le cerveau dans une activité physique ou sociale est très efficace.\n\n2. **La délocalisation** : Changez simplement d'endroit. Quitter le lieu où le craving s'est déclenché réduit son intensité.\n\n3. **L'auto-rappel** : Relisez votre liste de raisons de ne pas consommer, regardez une photo de quelqu'un que vous aimez.\n\n4. **La pleine conscience** : Plutôt que de lutter contre le craving (ce qui l'amplifie), acceptez sa présence sans le juger. 'Oui, je ressens une envie. C'est normal. Je peux la traverser.'"
      }
    ]
  },
  {
    id: "3",
    title: "Comprendre les rechutes : ni échec, ni fin du chemin",
    category: "Comprendre l'addiction",
    categoryColor: "bg-purple-100 text-purple-800",
    icon: <Brain className="h-5 w-5" />,
    readTime: 8,
    difficulty: "intermédiaire",
    tags: ["rechute", "prévention", "espoir", "TCC"],
    summary: "80% des personnes en rémission connaissent au moins une rechute. C'est une réalité médicale documentée, pas un signe d'échec. Voici comment transformer une rechute en apprentissage.",
    source: "McLellan et al., JAMA (2000); Marlatt & Gordon, Relapse Prevention (1985); OMS rapport addictions",
    keyPoints: [
      "Le taux de rechute de l'addiction est similaire à celui de l'hypertension ou du diabète",
      "Une rechute n'annule pas les progrès précédents",
      "Distinguer 'lapsus' et 'rechute' est crucial pour la récupération",
      "Chaque rechute peut devenir une source d'apprentissage"
    ],
    content: [
      {
        heading: "📊 La réalité des rechutes : ce que disent les chiffres",
        text: "Selon le NIDA (Institut National sur l'Abus des Drogues, USA), le taux de rechute dans l'addiction est de 40 à 60%. Ce chiffre, qui peut sembler décourageant, prend un tout autre sens quand on le compare à d'autres maladies chroniques :\n\n• Hypertension artérielle : 50-70% de rechute (retour des symptômes)\n• Asthme : 50-70%\n• Diabète de type 2 : 30-50%\n\nLa conclusion est claire : l'addiction est une maladie chronique, et les rechutes font partie de son histoire naturelle, exactement comme pour ces maladies médicales reconnues."
      },
      {
        heading: "🔍 Lapsus vs. rechute : une distinction cruciale",
        text: "Le modèle de Marlatt & Gordon (1985), validé par des décennies de recherche, distingue deux situations :\n\n• **Lapsus** : un ou quelques épisodes de consommation isolés après une période d'abstinence. C'est fréquent et récupérable.\n\n• **Rechute** : un retour durable aux anciens schémas de consommation.\n\nLa différence entre un lapsus et une rechute dépend souvent de la réaction à cet épisode. Si vous vous dites 'Tout est foutu, autant continuer' (c'est l'effet de violation de l'abstinence), le lapsus risque de devenir une rechute. Si vous le traitez comme une information ('Qu'est-ce qui s'est passé ? Que puis-je apprendre ?'), il reste un lapsus."
      },
      {
        heading: "🧩 Les 3 étapes d'une rechute",
        text: "La recherche (Gorski & Miller, 1986) montre que les rechutes ne sont pas soudaines. Elles passent généralement par 3 étapes :\n\n1. **Rechute émotionnelle** : émotions non gérées, stress accumulé, isolement. On ne pense pas encore à consommer, mais on se fragilise.\n\n2. **Rechute mentale** : pensées ambivalentes ('peut-être qu'une fois...'), romantisation du passé ('c'était bien quand même...').\n\n3. **Rechute physique** : la consommation elle-même.\n\nConnaître ces étapes permet d'intervenir tôt, bien avant la consommation."
      },
      {
        heading: "💪 Transformer la rechute en apprentissage",
        text: "Si une rechute se produit, voici l'approche validée par la thérapie cognitivo-comportementale (TCC) :\n\n1. **Ne pas catastropher** : 'J'ai rechuté' ≠ 'Je suis un échec'\n2. **Analyser sans se juger** : Qu'est-ce qui s'est passé ? Quel était mon état émotionnel ? Y avait-il un trigger identifiable ?\n3. **Reprendre le fil dès que possible** : Chaque heure, chaque jour sans consommer compte\n4. **En parler à quelqu'un** : votre thérapeute, votre groupe de soutien\n5. **Mettre à jour votre plan de prévention** : Qu'est-ce que je ferai différemment la prochaine fois ?\n\nLes personnes qui atteignent une rémission durable ont souvent traversé plusieurs rechutes. Ce ne sont pas des témoignages d'échec — ce sont des chemins vers la guérison."
      }
    ]
  },

  // ============================
  // CATÉGORIE : GESTION DU STRESS
  // ============================
  {
    id: "4",
    title: "Le stress et l'addiction : un lien profond mais gérable",
    category: "Gestion du stress",
    categoryColor: "bg-orange-100 text-orange-800",
    icon: <Shield className="h-5 w-5" />,
    readTime: 7,
    difficulty: "facile",
    tags: ["stress", "cortisol", "coping", "anxiété"],
    summary: "Le stress est l'un des plus grands facteurs de risque de rechute. Comprendre ce lien et apprendre à gérer le stress autrement que par la consommation est une compétence centrale du rétablissement.",
    source: "Sinha, Science & Practice Perspectives (2008); Koob & Volkow, Neuropsychopharmacology (2010)",
    keyPoints: [
      "Le stress active les mêmes circuits cérébraux que les substances",
      "Les personnes dépendantes ont souvent une réponse au stress altérée",
      "La respiration profonde réduit le cortisol en moins de 5 minutes",
      "L'exercice physique est aussi efficace que certains anxiolytiques"
    ],
    content: [
      {
        heading: "🔗 Pourquoi stress et addiction sont si liés",
        text: "La chercheuse Rajita Sinha (Yale University) a montré que l'exposition au stress déclenche une libération de corticotropin-releasing factor (CRF), une hormone qui active directement les circuits de l'envie de consommer dans le cerveau.\n\nEn termes simples : quand vous êtes stressé, votre cerveau réclame plus intensément la substance à laquelle il s'est habitué. C'est une réaction biologique, pas psychologique. Ce n'est pas vous qui êtes 'faible sous pression' — c'est votre neurochimie qui réagit d'une façon qui a été conditionnée."
      },
      {
        heading: "🧪 La réponse au stress dans l'addiction",
        text: "Des études d'imagerie cérébrale montrent que les personnes ayant développé une dépendance ont souvent une réponse au stress altérée :\n\n• Le cortisol (hormone du stress) est libéré en plus grande quantité\n• La récupération après un événement stressant est plus lente\n• Le seuil de tolérance au stress est abaissé\n\nRésultat : les mêmes situations qui semblent gérables pour d'autres personnes peuvent déclencher un niveau de stress très élevé. Ce n'est pas exagéré — c'est physiologique."
      },
      {
        heading: "💨 La respiration : votre outil anti-stress le plus puissant",
        text: "Des dizaines d'études (dont une méta-analyse de Zaccaro et al., 2018) confirment que la respiration lente et profonde active le système nerveux parasympathique, ce qui réduit le cortisol et la tension artérielle en quelques minutes.\n\nLa technique 4-7-8 (Dr Andrew Weil) :\n1. Expirez complètement par la bouche\n2. Inspirez par le nez pendant 4 secondes\n3. Retenez votre souffle pendant 7 secondes\n4. Expirez par la bouche pendant 8 secondes\n5. Répétez 4 fois\n\nPratiquer cette technique 2 fois par jour, même sans stress, renforce progressivement votre système de régulation émotionnelle."
      },
      {
        heading: "🏃 L'exercice : le médicament naturel contre le stress",
        text: "Une étude publiée dans JAMA Psychiatry (Blumenthal et al., 2007) a montré que l'exercice physique régulier est aussi efficace que la sertraline (un antidépresseur courant) pour réduire les symptômes d'anxiété et de dépression.\n\nPour la gestion de l'addiction spécifiquement :\n• 30 minutes de marche rapide réduit le craving pendant plusieurs heures\n• L'exercice libère des endorphines qui compensent le déficit dopaminergique\n• Il améliore la qualité du sommeil, facteur protecteur majeur\n• Il crée une routine positive qui structure les journées\n\nPas besoin de s'inscrire à une salle de sport : une marche de 20 minutes par jour produit déjà des effets mesurables."
      }
    ]
  },
  {
    id: "5",
    title: "La pleine conscience (mindfulness) pour prévenir les rechutes",
    category: "Gestion du stress",
    categoryColor: "bg-orange-100 text-orange-800",
    icon: <Shield className="h-5 w-5" />,
    readTime: 6,
    difficulty: "intermédiaire",
    tags: ["mindfulness", "méditation", "MBRP", "présence"],
    summary: "Le programme MBRP (Mindfulness-Based Relapse Prevention) a démontré une réduction de 50% des rechutes dans plusieurs études cliniques. Voici comment l'appliquer au quotidien.",
    source: "Bowen et al., JAMA Psychiatry (2014); Witkiewitz et al., Journal of Consulting and Clinical Psychology (2013)",
    keyPoints: [
      "MBRP réduit le risque de rechute de 50% comparé aux traitements standard",
      "La pleine conscience change structurellement le cerveau en 8 semaines",
      "Même 10 minutes par jour ont des effets mesurables",
      "La pleine conscience s'applique aussi aux cravings (surfing)"
    ],
    content: [
      {
        heading: "🧘 Qu'est-ce que la pleine conscience ?",
        text: "La pleine conscience (mindfulness) est la capacité à être conscient de ce qui se passe en soi et autour de soi, dans le moment présent, sans jugement. Contrairement à ce qu'on croit souvent, il ne s'agit pas de 'vider son esprit', mais d'observer ses pensées et sensations comme si on les regardait défiler, sans s'y accrocher.\n\nCette pratique, issue de traditions méditatives millénaires, a été adaptée à la médecine moderne par Jon Kabat-Zinn (MIT, 1979) puis appliquée spécifiquement à l'addiction par Sarah Bowen (Université de Washington)."
      },
      {
        heading: "📊 Les preuves scientifiques",
        text: "Une étude clinique randomisée publiée dans JAMA Psychiatry (Bowen et al., 2014) a comparé trois approches chez 286 personnes en rémission d'addiction :\n\n• Traitement standard\n• Programme de prévention de la rechute classique (TCC)\n• Programme MBRP (mindfulness)\n\nRésultats à 12 mois : le groupe MBRP présentait 50% moins de jours de consommation intense et une réduction significative du craving comparé aux deux autres groupes.\n\nD'autres études montrent que 8 semaines de pratique régulière modifient la densité de matière grise dans l'insula et le cortex préfrontal — des zones clés de la régulation émotionnelle."
      },
      {
        heading: "🎯 Exercice de pleine conscience pour les cravings",
        text: "Cet exercice peut être fait n'importe où, dès qu'une envie de consommer apparaît :\n\n1. **STOP** : Arrêtez ce que vous faites\n2. **Respirez** : Prenez 3 respirations profondes\n3. **Observez** : Où sentez-vous le craving dans votre corps ? Gorge, poitrine, ventre ? Quelle température ? Quelle texture ?\n4. **Procédez** : Continuez votre journée avec cette conscience\n\nLe simple fait d'observer le craving avec curiosité plutôt que de le combattre ou d'y céder réduit son intensité. Le cerveau ne peut pas être pleinement dans le craving et dans l'observation simultanément."
      },
      {
        heading: "⏱️ Comment commencer avec seulement 10 minutes par jour",
        text: "Un programme d'entrée recommandé par des chercheurs :\n\n**Semaine 1-2** : Scan corporel (10 min)\nAllongez-vous. Portez votre attention successivement sur chaque partie de votre corps, des pieds jusqu'à la tête. Observez les sensations sans les juger.\n\n**Semaine 3-4** : Respiration consciente (10 min)\nAsseyez-vous. Focalisez votre attention sur le mouvement de votre souffle. Quand votre esprit s'échappe (ce qu'il fera, c'est normal), ramenez-le doucement.\n\n**Semaine 5-8** : Pleine conscience des émotions\nQuand une émotion difficile surgit, nomm-la ('je ressens de la colère'), identifiez où vous la sentez dans le corps, respirez avec elle plutôt que contre elle.\n\nLes applications Petit Bambou, Calm ou Headspace proposent des programmes structurés en français."
      }
    ]
  },

  // ============================
  // CATÉGORIE : MOTIVATION ET RÉCUPÉRATION
  // ============================
  {
    id: "6",
    title: "L'entretien motivationnel : comment renforcer votre propre motivation",
    category: "Motivation et récupération",
    categoryColor: "bg-green-100 text-green-800",
    icon: <Zap className="h-5 w-5" />,
    readTime: 5,
    difficulty: "facile",
    tags: ["motivation", "objectifs", "changement", "entretien motivationnel"],
    summary: "La motivation ne vient pas de l'extérieur — elle se construit de l'intérieur. Les techniques de l'entretien motivationnel (EM), validées par des centaines d'études, vous aident à renforcer votre propre désir de changer.",
    source: "Miller & Rollnick, Motivational Interviewing (2013); Rubak et al., British Journal of General Practice (2005)",
    keyPoints: [
      "La motivation fluctue — c'est normal et prévisible",
      "Écrire ses raisons de changer les renforce dans la mémoire",
      "L'ambivalence (vouloir ET ne pas vouloir) est universelle dans l'addiction",
      "Le modèle des stades de changement aide à se situer sans se juger"
    ],
    content: [
      {
        heading: "🎭 L'ambivalence : le cœur de l'addiction",
        text: "Une des idées les plus libératrices de l'entretien motivationnel (EM), développé par les Drs Miller & Rollnick dans les années 80 et validé depuis par plus de 200 études cliniques, est que l'ambivalence est normale.\n\nL'ambivalence, c'est de vouloir arrêter ET de ne pas vouloir. C'est de savoir que la substance vous fait du mal ET d'en avoir envie. Beaucoup de personnes se culpabilisent de ressentir ces deux choses en même temps. Mais c'est, en réalité, la réaction humaine normale face à un changement de comportement majeur."
      },
      {
        heading: "🗺️ Les stades de changement : où en êtes-vous ?",
        text: "Le modèle transthéorique de Prochaska & DiClemente (1983) identifie 5 stades de changement :\n\n1. **Pré-contemplation** : 'Je n'ai pas vraiment de problème'\n2. **Contemplation** : 'Je vois le problème mais je ne suis pas prêt à changer'\n3. **Préparation** : 'Je veux changer, je cherche comment'\n4. **Action** : 'Je suis en train de changer'\n5. **Maintien** : 'Je maintiens le changement'\n\nSe situer dans ces stades sans jugement permet de comprendre pourquoi la motivation varie selon les jours, et de choisir les bonnes stratégies selon où on en est."
      },
      {
        heading: "✍️ L'exercice de la balance décisionnelle",
        text: "Cet exercice, central dans l'EM, aide à clarifier votre motivation :\n\nDivisez une feuille en 4 quadrants :\n• **Avantages de continuer à consommer** (soyez honnête)\n• **Inconvénients de continuer à consommer**\n• **Avantages d'arrêter/réduire**\n• **Inconvénients d'arrêter/réduire** (c'est difficile, il y en a)\n\nPrenez votre temps pour remplir chaque case. Cette clarté vous appartient — personne d'autre ne peut la ressentir à votre place. Les personnes qui complètent cet exercice régulièrement ont tendance à maintenir leur motivation plus longtemps selon les études de l'EM."
      },
      {
        heading: "🌟 Renforcer votre motivation au quotidien",
        text: "Des techniques validées pour maintenir la motivation :\n\n**La lettre à soi-même** : Écrivez une lettre à vous-même décrivant votre vie dans 1 an si vous réussissez votre rétablissement. Relisez-la quand la motivation baisse.\n\n**Les micro-objectifs** : Au lieu de 'Je dois arrêter pour toujours', essayez 'Je ne consomme pas aujourd'hui'. L'accumulation de petites victoires est prouvée comme plus efficace que les grands objectifs.\n\n**La règle de 5 minutes** : Quand vous n'avez pas envie de faire un exercice, une séance de mindfulness, ou d'appeler votre soutien, prometez-vous de faire juste 5 minutes. Très souvent, 5 minutes deviennent plus.\n\n**Célébrez les victoires** : Chaque journée sans consommer mérite reconnaissance. Le cerveau apprend par les récompenses — offrez-vous des récompenses saines pour renforcer les bons comportements."
      }
    ]
  },
  {
    id: "7",
    title: "Le sommeil : votre allié secret dans le rétablissement",
    category: "Motivation et récupération",
    categoryColor: "bg-green-100 text-green-800",
    icon: <Zap className="h-5 w-5" />,
    readTime: 5,
    difficulty: "facile",
    tags: ["sommeil", "récupération", "neurologie", "bien-être"],
    summary: "Le manque de sommeil multiplie par 4 le risque de rechute. Voici pourquoi le sommeil est essentiel au rétablissement et comment améliorer sa qualité concrètement.",
    source: "Brower & Perron, Sleep Medicine Reviews (2010); Walker, Why We Sleep (2017)",
    keyPoints: [
      "Le sommeil est quand le cerveau se 'nettoie' et consolide les apprentissages",
      "L'insomnie est un facteur de rechute majeur et sous-estimé",
      "La restriction de sommeil amplifie l'envie de consommer",
      "Une bonne hygiène du sommeil peut changer significativement la récupération"
    ],
    content: [
      {
        heading: "😴 Pourquoi le sommeil est si important dans l'addiction",
        text: "Pendant le sommeil, votre cerveau fait quelque chose d'extraordinaire : il évacue les déchets métaboliques (via le système glymphatique), consolide les apprentissages et régule les émotions. C'est littéralement pendant que vous dormez que les effets de vos thérapies et de vos efforts sont intégrés.\n\nEn parallèle, le manque de sommeil amplifie l'activation du circuit de la récompense tout en réduisant le contrôle préfrontal (celui qui dit 'non'). En d'autres termes : un cerveau fatigué ressemble à un cerveau sous l'emprise — moins de contrôle, plus d'impulsivité, plus d'envies."
      },
      {
        heading: "📊 Les chiffres qui font réfléchir",
        text: "Une étude de Brower & Perron (2010) dans Sleep Medicine Reviews a analysé le lien entre sommeil et rechute chez des patients traités pour alcoolisme :\n\n• 60% des personnes en traitement souffrent d'insomnie clinique\n• L'insomnie non traitée multiplie par 4 le risque de rechute dans les 6 mois\n• 80% des rechutes surviennent dans un contexte de privation de sommeil ou de fatigue accumulée\n\nPour le Dr Matthew Walker (Université de Berkeley), auteur de 'Why We Sleep', 'le sommeil est la chose la plus efficace que vous puissiez faire pour réinitialiser votre santé mentale et physique'."
      },
      {
        heading: "🌙 7 règles d'hygiène du sommeil validées par la science",
        text: "1. **Horaires fixes** : Couchez-vous et levez-vous à la même heure, même le week-end. Cela synchronise votre horloge biologique.\n\n2. **Évitez les écrans 1h avant le coucher** : La lumière bleue bloque la mélatonine (hormone du sommeil). Utilisez le mode nuit.\n\n3. **Chambre fraîche** : Le sommeil profond se produit mieux à 18-20°C.\n\n4. **Évitez la caféine après 14h** : La caféine a une demi-vie de 6h. Un café à 16h, c'est encore la moitié dans votre sang à 22h.\n\n5. **Évitez l'alcool** : L'alcool semble aider à s'endormir mais fragmente le sommeil en seconde moitié de nuit.\n\n6. **Rituels de relaxation** : Un bain chaud, de la lecture légère, de la respiration profonde signalent à votre cerveau que c'est l'heure de dormir.\n\n7. **Si vous ne dormez pas, levez-vous** : Rester au lit éveillé crée une association négative 'lit = éveil anxieux'. Levez-vous, lisez, revenez quand vous avez sommeil."
      }
    ]
  },

  // ============================
  // CATÉGORIE : RELATIONS ET SOUTIEN SOCIAL
  // ============================
  {
    id: "8",
    title: "L'isolement social : un facteur de risque invisible mais puissant",
    category: "Relations et soutien social",
    categoryColor: "bg-blue-100 text-blue-800",
    icon: <Users className="h-5 w-5" />,
    readTime: 6,
    difficulty: "facile",
    tags: ["isolement", "soutien", "connexion", "famille"],
    summary: "L'isolement social augmente le risque de dépendance de 250%. Inversement, des liens sociaux solides sont l'un des meilleurs prédicteurs de rémission. Voici pourquoi et comment tisser ce filet de soutien.",
    source: "Holt-Lunstad et al., PLoS Medicine (2010); Kelly et al., Drug and Alcohol Dependence (2011)",
    keyPoints: [
      "L'isolement social a un impact sur la santé équivalent à fumer 15 cigarettes par jour",
      "Le soutien social est le prédicteur le plus constant de rémission durable",
      "Les groupes d'entraide réduisent le risque de rechute de 40%",
      "Même une seule relation de confiance fait une différence significative"
    ],
    content: [
      {
        heading: "🔗 La connexion sociale : un besoin biologique",
        text: "Des recherches en neurosciences montrent que le cerveau traite l'isolement social de la même façon qu'une douleur physique. L'exclusion sociale active les mêmes zones cérébrales (cortex cingulaire antérieur) que la douleur physique — ce n'est pas une métaphore.\n\nMeta-analyse de Holt-Lunstad et al. (2010), portant sur 308 000 participants : les personnes avec des relations sociales solides ont 50% de chances en plus de survie que celles qui sont isolées. L'isolement social a un impact sur la santé comparable à fumer 15 cigarettes par jour."
      },
      {
        heading: "💊 Le soutien social dans l'addiction : chiffres clés",
        text: "Une étude de Kelly et al. (2011) a suivi 1726 personnes en rémission d'alcoolisme pendant 3 ans. Les résultats :\n\n• Le soutien social (famille, amis, groupes d'entraide) était le prédicteur N°1 de rémission durable\n• Les personnes participant à des groupes d'entraide (AA, NA, SMART Recovery) réduisaient leur risque de rechute de 40%\n• L'effet était indépendant du type de substance ou de la sévérité de la dépendance\n\nEn d'autres termes : peu importe où vous en êtes, avoir du soutien autour de vous est l'une des choses les plus puissantes que vous puissiez faire."
      },
      {
        heading: "🤝 Comment construire son réseau de soutien",
        text: "Si vous vous sentez isolé, voici des pistes concrètes :\n\n**Dans votre entourage :**\n• Choisissez 1 à 3 personnes en qui vous avez confiance\n• Expliquez-leur ce que vous vivez (dans la mesure où vous vous sentez à l'aise)\n• Demandez-leur une chose précise : 'Appelle-moi si je ne réponds pas à tes messages' ou 'Viens faire une marche avec moi le week-end'\n\n**Les groupes d'entraide :**\n• Alcooliques Anonymes (AA), Narcotiques Anonymes (NA)\n• SMART Recovery (approche TCC, sans spiritualité)\n• Groupes proposés par votre CSAPA ou établissement de soin\n\n**En ligne :**\n• Des forums et groupes privés permettent de briser l'isolement quand on n'est pas prêt à se montrer en personne"
      },
      {
        heading: "💬 Communiquer avec sa famille : gérer la blessure relationnelle",
        text: "L'addiction abîme souvent les relations. La famille peut être à la fois soutien et source de stress. Quelques principes issus de la thérapie familiale systémique :\n\n**Pour vous** :\n• Distinguez qui vous êtes de vos comportements passés. L'addiction a influencé vos actions, pas votre valeur humaine.\n• Acceptez que la confiance se reconstruise dans le temps, pas en une conversation\n\n**Pour votre entourage (si vous en parlez avec eux)** :\n• Les proches peuvent assister aux groupes Al-Anon ou Nar-Anon pour eux-mêmes\n• La thérapie familiale est prouvée comme augmentant les taux de rémission\n\nLa reconstruction relationnelle est souvent un processus parallèle au rétablissement personnel — lent, mais réel."
      }
    ]
  },

  // ============================
  // CATÉGORIE : ÉMOTIONS ET TCC
  // ============================
  {
    id: "9",
    title: "Comprendre et transformer vos pensées automatiques",
    category: "Émotions et pensées",
    categoryColor: "bg-pink-100 text-pink-800",
    icon: <Heart className="h-5 w-5" />,
    readTime: 7,
    difficulty: "intermédiaire",
    tags: ["TCC", "pensées automatiques", "distorsions cognitives", "émotions"],
    summary: "Nos pensées influencent directement nos émotions et nos comportements. La thérapie cognitivo-comportementale (TCC), la plus validée pour l'addiction, vous apprend à identifier et transformer les pensées qui mènent à la consommation.",
    source: "Beck, Cognitive Therapy of Depression (1979); Hofmann et al., Cognitive Therapy and Research (2012)",
    keyPoints: [
      "La TCC est la thérapie la plus validée pour l'addiction (plus de 300 études)",
      "Les pensées automatiques surviennent en moins d'une seconde",
      "10 distorsions cognitives récurrentes sont associées à la rechute",
      "Identifier une pensée automatique suffit souvent à en réduire l'impact"
    ],
    content: [
      {
        heading: "🧩 Qu'est-ce qu'une pensée automatique ?",
        text: "Aaron Beck, psychiatre américain qui a développé la Thérapie Cognitivo-Comportementale (TCC) dans les années 60, a découvert quelque chose de fondamental : entre un événement et notre réaction émotionnelle, il y a toujours une pensée — souvent si rapide que nous ne la remarquons pas.\n\nCes 'pensées automatiques' se forment en fractions de secondes et influencent directement comment vous vous sentez, puis ce que vous faites. Dans l'addiction, certaines pensées automatiques très spécifiques ('J'en ai besoin pour me sentir bien', 'Je n'y arriverai jamais', 'Ça n'a aucune importance') peuvent déclencher ou aggraver les cravings."
      },
      {
        heading: "🔍 Les 5 distorsions cognitives les plus communes dans l'addiction",
        text: "La recherche a identifié des schémas de pensée récurrents qui alimentent l'addiction :\n\n1. **Tout ou rien** : 'J'ai rechuté une fois, tout est foutu' — Réalité : une rechute n'annule pas les progrès\n\n2. **La lecture de pensées** : 'Tout le monde me juge' — Réalité : la plupart des gens sont occupés par leurs propres préoccupations\n\n3. **La catastrophisation** : 'Si j'arrête de consommer, je ne pourrai jamais gérer le stress' — Réalité : vous pouvez apprendre d'autres façons de gérer le stress\n\n4. **La personnalisation** : 'Je suis faible parce que j'ai développé une dépendance' — Réalité : l'addiction est une maladie avec des bases biologiques\n\n5. **Le raisonnement émotionnel** : 'Je me sens coupable, donc je suis mauvais' — Réalité : les émotions ne sont pas des faits"
      },
      {
        heading: "🛠️ La technique des 3 colonnes de Beck",
        text: "Cet outil central de la TCC est validé par des centaines d'études :\n\n**Colonne 1 : La situation**\nDécrivez factuellem la situation (sans interprétation). Ex : 'J'ai envie de consommer après une dispute avec mon partenaire'\n\n**Colonne 2 : La pensée automatique**\nQuelle pensée est apparue ? 'Je n'en peux plus, j'ai besoin de quelque chose pour décompresser'\n\n**Colonne 3 : La réponse rationnelle**\nComment pourrait répondre une personne bienveillante et raisonnée à cette pensée ?\n'J'ai effectivement besoin de décompresser. Consommer va aggraver la situation. Je peux appeler quelqu'un, faire une marche, respirer...'\n\nÉcrire régulièrement cet exercice restructure progressivement les schémas de pensée automatique."
      },
      {
        heading: "💡 La pleine conscience + TCC : la combinaison gagnante",
        text: "Des méta-analyses récentes (Hofmann et al., 2012) confirment que la combinaison pleine conscience + TCC produit des effets plus durables que chaque approche séparément.\n\nEn pratique, voici comment les combiner :\n\n1. **Pleine conscience** : Remarquez que vous avez une pensée difficile sans automatiquement y réagir\n2. **TCC** : Examinez cette pensée avec curiosité — est-elle vraie ? Est-elle utile ?\n3. **Choisissez** : Maintenant que vous avez remarqué et examiné la pensée, quelle action correspond le mieux à vos valeurs ?\n\nCe n'est pas un processus rapide au début, mais avec la pratique, il devient de plus en plus automatique — et les nouvelles pensées plus adaptées remplacent progressivement les anciennes."
      }
    ]
  },
  {
    id: "10",
    title: "La honte dans l'addiction : l'ennemi silencieux du rétablissement",
    category: "Émotions et pensées",
    categoryColor: "bg-pink-100 text-pink-800",
    icon: <Heart className="h-5 w-5" />,
    readTime: 6,
    difficulty: "facile",
    tags: ["honte", "culpabilité", "auto-compassion", "stigmatisation"],
    summary: "La honte est l'émotion qui maintient l'addiction et sabote le rétablissement. Comprendre la différence entre honte et culpabilité, et pratiquer l'auto-compassion, sont des étapes cruciales documentées par la recherche.",
    source: "Brown, The Gifts of Imperfection (2010); Neff, Self-Compassion (2011); Luoma et al., Drug and Alcohol Dependence (2012)",
    keyPoints: [
      "La honte augmente le risque de rechute — la culpabilité peut favoriser le changement",
      "La honte se cache derrière la colère, l'arrogance ou le retrait social",
      "L'auto-compassion (self-compassion) est prouvée comme facteur de rémission",
      "Se traiter soi-même comme on traiterait un ami est une technique puissante"
    ],
    content: [
      {
        heading: "🎭 Honte vs culpabilité : une distinction qui change tout",
        text: "La chercheuse Brené Brown (Université de Houston) a étudié pendant 20 ans les émotions de honte et de culpabilité. Sa distinction est fondamentale :\n\n• **Culpabilité** : 'J'ai fait quelque chose de mal' → oriente vers la réparation et le changement\n• **Honte** : 'Je SUIS mauvais / défectueux / sans valeur' → paralyse, isole, maintient les comportements problématiques\n\nJonas Luoma (Portland State University) a démontré dans une étude publiée dans Drug and Alcohol Dependence (2012) que les niveaux de honte prédisent directement les taux de rechute — plus la honte est élevée, plus le risque de rechute est important."
      },
      {
        heading: "🔎 Comment reconnaître la honte en soi",
        text: "La honte se cache souvent derrière d'autres comportements :\n\n• **Retrait social** : s'isoler pour ne pas être 'découvert'\n• **Colère et agression** : attaquer avant d'être attaqué\n• **Perfectionisme** : prouver sa valeur par la performance\n• **Autodestruction** : 'De toute façon, je ne mérite pas de m'en sortir'\n\nDes phrases intérieures typiques de la honte :\n• 'Je suis un(e) nul(le)'\n• 'Je suis différent(e), personne ne me comprend vraiment'\n• 'Si les gens savaient vraiment qui je suis...'\n• 'Je ne mérite pas d'être aidé(e)'"
      },
      {
        heading: "💝 L'auto-compassion : votre antidote à la honte",
        text: "Kristin Neff (Université du Texas), pionnière de la recherche sur l'auto-compassion, définit celle-ci en 3 composantes :\n\n1. **La bienveillance envers soi-même** : se traiter avec la même gentillesse qu'on offrirait à un ami proche\n2. **L'humanité commune** : reconnaître que souffrir et faillir sont des expériences humaines universelles\n3. **La pleine conscience** : observer ses difficultés sans les minimiser ni les dramatiser\n\nSes études montrent que l'auto-compassion réduit l'anxiété, la dépression et la honte, tout en augmentant la motivation à changer — parce qu'on ne change pas par peur de se punir, mais parce qu'on se soucie de soi."
      },
      {
        heading: "✨ Exercice pratique : la lettre de l'ami",
        text: "Cet exercice, validé par Neff et al. (2007), prend 10 minutes :\n\n1. Pensez à une situation dans votre parcours avec l'addiction dont vous vous sentez honteux(euse)\n\n2. Imaginez qu'un ami très proche vous confie exactement la même chose — les mêmes erreurs, le même parcours, la même situation\n\n3. Écrivez la lettre que vous lui enverriez. Sans minimiser, mais avec bienveillance, compréhension, et encouragement\n\n4. Relisez cette lettre en imaginant qu'elle vous est adressée\n\nLa plupart des gens constatent que la bienveillance qu'ils offriraient naturellement à un ami, ils ne se la permettent pas pour eux-mêmes. Cet exercice construit progressivement ce pont."
      }
    ]
  }
];

const CATEGORIES = [
  { name: "Tous", icon: <BookOpen className="h-4 w-4" /> },
  { name: "Comprendre l'addiction", icon: <Brain className="h-4 w-4" /> },
  { name: "Gestion du stress", icon: <Shield className="h-4 w-4" /> },
  { name: "Motivation et récupération", icon: <Zap className="h-4 w-4" /> },
  { name: "Relations et soutien social", icon: <Users className="h-4 w-4" /> },
  { name: "Émotions et pensées", icon: <Heart className="h-4 w-4" /> },
];

function DifficultyBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    "facile": "bg-green-100 text-green-800",
    "intermédiaire": "bg-yellow-100 text-yellow-800",
    "avancé": "bg-red-100 text-red-800",
  };
  const emojis: Record<string, string> = {
    "facile": "🟢",
    "intermédiaire": "🟡",
    "avancé": "🔴",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[level] || "bg-gray-100 text-gray-800"}`}>
      {emojis[level]} {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

function ArticleCard({ article, onRead }: { article: Article; onRead: () => void }) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 hover:border-blue-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 shrink-0">
            {article.icon}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-snug text-gray-800 group-hover:text-blue-800 transition-colors mb-1.5">
              {article.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${article.categoryColor}`}>
                {article.category}
              </span>
              <DifficultyBadge level={article.difficulty} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{article.summary}</p>
        
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readTime} min
          </span>
          <span className="flex flex-wrap gap-1">
            {article.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs py-0 px-1.5">{tag}</Badge>
            ))}
          </span>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
          <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            Points clés
          </p>
          <p className="text-xs text-amber-600 mt-1">{article.keyPoints[0]}</p>
        </div>

        <Button
          onClick={onRead}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm"
        >
          Lire l'article →
        </Button>
      </CardContent>
    </Card>
  );
}

function ArticleReader({ article, onBack }: { article: Article; onBack: () => void }) {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux articles
      </Button>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-100">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-lg">
            {article.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 leading-tight mb-2">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${article.categoryColor}`}>
                {article.category}
              </span>
              <DifficultyBadge level={article.difficulty} />
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {article.readTime} min de lecture
              </span>
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-base leading-relaxed italic">{article.summary}</p>
      </div>

      {/* Points clés */}
      <Card className="mb-6 border-amber-200 bg-amber-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-amber-800 flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            Points clés de cet article
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {article.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                {point}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Contenu de l'article */}
      <div className="space-y-3 mb-6">
        {article.content.map((section, index) => (
          <Card key={index} className="border border-gray-200 overflow-hidden">
            <button
              className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedSection(expandedSection === index ? null : index)}
            >
              <h3 className="font-semibold text-gray-800 text-sm flex-1 pr-3">{section.heading}</h3>
              {expandedSection === index
                ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
              }
            </button>
            {expandedSection === index && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="prose prose-sm max-w-none pt-3">
                  {section.text.split('\n\n').map((para, pIdx) => (
                    <p key={pIdx} className="text-sm text-gray-700 leading-relaxed mb-3 last:mb-0 whitespace-pre-line">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Source scientifique */}
      <Card className="bg-blue-50 border-blue-200 mb-6">
        <CardContent className="p-4">
          <p className="text-xs text-blue-700 font-semibold flex items-center gap-1.5 mb-1">
            <AlertCircle className="h-3.5 w-3.5" />
            Sources scientifiques
          </p>
          <p className="text-xs text-blue-600 leading-relaxed">{article.source}</p>
          <p className="text-xs text-blue-500 mt-2 italic">
            Cet article est une vulgarisation à usage informatif. Il ne remplace pas l'avis d'un professionnel de santé.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Autres articles
        </Button>
      </div>
    </div>
  );
}

export default function Education() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredArticles = ARTICLES.filter(article => {
    const matchCategory = selectedCategory === "Tous" || article.category === selectedCategory;
    const matchSearch = !searchTerm || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCategory && matchSearch;
  });

  if (selectedArticle) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <ArticleReader article={selectedArticle} onBack={() => setSelectedArticle(null)} />
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        
        {/* En-tête */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 border border-blue-100 shadow-lg">
            <div className="flex items-start gap-5">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl text-white shadow-lg transform rotate-3">
                <BookOpen className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
                  🎓 Psychoéducation
                </h1>
                <p className="text-gray-600 leading-relaxed max-w-2xl">
                  Des articles basés sur la recherche scientifique, écrits pour vous — sans jargon médical. 
                  Comprendre ce qui se passe dans votre cerveau et votre vie, c'est déjà commencer à changer.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="bg-white/80 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium">
                    📚 {ARTICLES.length} articles
                  </span>
                  <span className="bg-white/80 text-purple-700 text-xs px-3 py-1.5 rounded-full font-medium">
                    🔬 Tous basés sur des études
                  </span>
                  <span className="bg-white/80 text-green-700 text-xs px-3 py-1.5 rounded-full font-medium">
                    💬 Langage accessible
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article (stress, rechute, sommeil...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === cat.name
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Articles */}
        {filteredArticles.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Aucun article trouvé pour cette recherche.</p>
              <Button
                variant="ghost"
                onClick={() => { setSearchTerm(""); setSelectedCategory("Tous"); }}
                className="mt-3 text-sm"
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onRead={() => setSelectedArticle(article)}
              />
            ))}
          </div>
        )}

        {/* Ressources d'urgence */}
        <section className="mt-10">
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-700">
                <Shield className="h-5 w-5" />
                En cas de crise ou de craving intense
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/80 rounded-xl p-4">
                  <h4 className="font-semibold text-sm mb-1.5 text-red-600">⏱️ Règle des 15 minutes</h4>
                  <p className="text-xs text-gray-600">
                    Attendez 15 minutes avant de céder à un craving. Il diminuera naturellement. Distrayez-vous activement pendant ce temps.
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-4">
                  <h4 className="font-semibold text-sm mb-1.5 text-orange-600">💨 Respiration 4-7-8</h4>
                  <p className="text-xs text-gray-600">
                    Inspirez 4s → Bloquez 7s → Expirez 8s. Répétez 4 fois. Réduit le cortisol en quelques minutes.
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-4">
                  <h4 className="font-semibold text-sm mb-1.5 text-red-600">📞 Aide professionnelle</h4>
                  <p className="text-xs text-gray-600">
                    En cas de détresse, contactez votre thérapeute ou appelez le 3114 (numéro national prévention suicide).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
