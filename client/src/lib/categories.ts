// Catégories d'exercices uniformisées
export const EXERCISE_CATEGORIES = [
  { value: "cardio", label: "Cardio Training", description: "Exercices cardiovasculaires pour améliorer l'endurance" },
  { value: "strength", label: "Renforcement Musculaire", description: "Exercices de force et tonification musculaire" },
  { value: "flexibility", label: "Étirement & Flexibilité", description: "Exercices d'assouplissement et de mobilité" },
  { value: "mindfulness", label: "Pleine Conscience & Méditation", description: "Pratiques de méditation et de présence" },
  { value: "relaxation", label: "Relaxation", description: "Techniques de détente et de récupération" },
  { value: "respiration", label: "Exercices de Respiration", description: "Techniques de contrôle respiratoire" },
  { value: "meditation", label: "Méditation", description: "Pratiques méditatives approfondies" },
  { value: "debutant", label: "Exercices Débutant", description: "Exercices adaptés aux novices" },
] as const;

// Catégories de séances uniformisées
export const SESSION_CATEGORIES = [
  { value: "morning", label: "Séance Matinale", description: "Séances pour bien commencer la journée", icon: "wb_sunny" },
  { value: "evening", label: "Séance du Soir", description: "Séances de détente pour la fin de journée", icon: "bedtime" },
  { value: "crisis", label: "Gestion de Crise", description: "Séances d'urgence pour gérer les craving intenses", icon: "emergency" },
  { value: "maintenance", label: "Entretien", description: "Séances de maintien et de renforcement", icon: "fitness_center" },
  { value: "recovery", label: "Récupération", description: "Séances de récupération active", icon: "healing" },
  { value: "energy", label: "Boost d'Énergie", description: "Séances énergisantes et motivantes", icon: "bolt" },
  { value: "focus", label: "Concentration", description: "Séances pour améliorer la concentration", icon: "center_focus_strong" },
  { value: "stress", label: "Anti-Stress", description: "Séances pour gérer le stress et l'anxiété", icon: "spa" },
] as const;

// Niveaux de difficulté uniformisés
export const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Débutant", description: "Accessible à tous, aucune expérience requise", color: "text-green-600" },
  { value: "intermediate", label: "Intermédiaire", description: "Nécessite quelques bases et de la pratique", color: "text-orange-600" },
  { value: "advanced", label: "Avancé", description: "Pour les pratiquants expérimentés", color: "text-red-600" },
] as const;

// Catégories de routines d'urgence
export const EMERGENCY_ROUTINE_CATEGORIES = [
  { value: "general", label: "Général", description: "Routines polyvalentes pour toutes situations" },
  { value: "breathing", label: "Respiration", description: "Techniques respiratoires d'urgence" },
  { value: "grounding", label: "Ancrage", description: "Techniques d'ancrage et de recentrage" },
  { value: "distraction", label: "Distraction", description: "Techniques de détournement d'attention" },
] as const;

// Types pour TypeScript
export type ExerciseCategoryValue = typeof EXERCISE_CATEGORIES[number]['value'];
export type SessionCategoryValue = typeof SESSION_CATEGORIES[number]['value'];
export type DifficultyLevelValue = typeof DIFFICULTY_LEVELS[number]['value'];
export type EmergencyRoutineCategoryValue = typeof EMERGENCY_ROUTINE_CATEGORIES[number]['value'];

// Fonctions utilitaires
export function getExerciseCategoryLabel(value: string): string {
  return EXERCISE_CATEGORIES.find(cat => cat.value === value)?.label || value;
}

export function getSessionCategoryLabel(value: string): string {
  return SESSION_CATEGORIES.find(cat => cat.value === value)?.label || value;
}

export function getDifficultyLabel(value: string): string {
  return DIFFICULTY_LEVELS.find(level => level.value === value)?.label || value;
}

export function getEmergencyRoutineCategoryLabel(value: string): string {
  return EMERGENCY_ROUTINE_CATEGORIES.find(cat => cat.value === value)?.label || value;
}

// Badge variants pour les difficultés
export function getDifficultyBadgeVariant(difficulty: string) {
  switch (difficulty) {
    case "beginner":
      return "default";
    case "intermediate":
      return "secondary";
    case "advanced":
      return "destructive";
    default:
      return "outline";
  }
}