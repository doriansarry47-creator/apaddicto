export const EMOTIONS = [
  { id: 'sadness', name: 'Tristesse', icon: 'sad-tear', color: 'text-blue-500' },
  { id: 'anger', name: 'Colère', icon: 'angry', color: 'text-red-500' },
  { id: 'fatigue', name: 'Fatigue', icon: 'tired', color: 'text-yellow-500' },
  { id: 'stress', name: 'Stress', icon: 'frown', color: 'text-gray-500' },
] as const;

export const EXERCISE_TYPES = [
  { id: 'breathing', name: 'Respiration', color: 'therapeutic-calm' },
  { id: 'physical', name: 'Physique', color: 'therapeutic-energy' },
  { id: 'meditation', name: 'Méditation', color: 'therapeutic-focus' },
  { id: 'stretching', name: 'Étirement', color: 'secondary-500' },
] as const;

export const DIFFICULTY_LEVELS = [
  { id: 'beginner', name: 'Débutant', color: 'green' },
  { id: 'intermediate', name: 'Modéré', color: 'yellow' },
  { id: 'advanced', name: 'Avancé', color: 'red' },
] as const;

export const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const;
