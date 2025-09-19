import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { ExerciseCard } from "@/components/exercise-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { EXERCISE_CATEGORIES, DIFFICULTY_LEVELS, ExerciseCategoryValue, DifficultyLevelValue, getExerciseCategoryLabel, getDifficultyLabel } from "@/lib/categories";
import RespirationPlayer from "@/components/interactive-exercises/RespirationPlayer";
import { Heart, Square, Triangle, Sparkles } from "lucide-react";
import type { Exercise as APIExercise } from "../../../../shared/schema";

// Types pour la compatibilité avec le composant ExerciseCard existant
interface Exercise {
  id: string;
  title: string;
  description: string;
  category: ExerciseCategoryValue;
  level: DifficultyLevelValue | 'all_levels';
  duration: number;
  intensity: 'gentle' | 'moderate' | 'dynamic';
  type: 'physical' | 'breathing' | 'relaxation' | 'emergency';
  imageUrl: string;
  instructions: string[];
  benefits: string[];
}

// Mappages des catégories API vers les catégories frontend - correspondance directe et variantes
const categoryMapping: Record<string, ExerciseCategoryValue> = {
  // Correspondance directe avec les catégories de l'admin
  'cardio': 'cardio',
  'strength': 'strength',
  'renforcement': 'strength', // Variante française
  'flexibility': 'flexibility',
  'etirement': 'flexibility', // Variante française
  'mindfulness': 'mindfulness',
  'relaxation': 'relaxation',
  'respiration': 'respiration',
  'meditation': 'meditation',
  'debutant': 'debutant'
};

// Exercices de respiration interactifs intégrés
const interactiveBreathingExercises = [
  {
    id: 'heart-coherence-interactive',
    title: 'Cohérence Cardiaque Interactive',
    description: 'Exercice de cohérence cardiaque avec animation guidée pour synchroniser votre respiration et votre rythme cardiaque.',
    category: 'respiration' as ExerciseCategoryValue,
    level: 'beginner' as const,
    duration: 5,
    intensity: 'gentle' as const,
    type: 'breathing' as const,
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: ['Suivez le mouvement de la balle qui grandit et rétrécit', 'Inspirez quand elle grandit, expirez quand elle rétrécit', 'Maintenez un rythme régulier de 5 secondes'],
    benefits: ['Réduction du stress et de l\'anxiété', 'Synchronisation du rythme cardiaque', 'Amélioration de la variabilité cardiaque', 'Activation du système nerveux parasympathique']
  },
  {
    id: 'square-breathing-interactive',
    title: 'Respiration Carrée Interactive',
    description: 'Technique de respiration carrée avec visualisation animée pour calmer l\'esprit et réduire le stress.',
    category: 'respiration' as ExerciseCategoryValue,
    level: 'beginner' as const,
    duration: 4,
    intensity: 'gentle' as const,
    type: 'breathing' as const,
    imageUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: ['Suivez la balle le long du carré', 'Inspirez sur le côté gauche, retenez en haut', 'Expirez sur le côté droit, pausez en bas', 'Maintenez 4 temps pour chaque phase'],
    benefits: ['Amélioration du contrôle respiratoire', 'Stabilisation de l\'humeur', 'Réduction de l\'anxiété', 'Amélioration de la concentration']
  },
  {
    id: 'triangle-breathing-interactive',
    title: 'Respiration Triangle Interactive',
    description: 'Exercice de respiration triangulaire avec guide visuel pour équilibrer votre système nerveux et favoriser la relaxation.',
    category: 'respiration' as ExerciseCategoryValue,
    level: 'beginner' as const,
    duration: 6,
    intensity: 'gentle' as const,
    type: 'breathing' as const,
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: ['Suivez la balle le long du triangle', 'Inspirez en montant, retenez sur le côté', 'Expirez en descendant', 'Adaptez le rythme selon votre confort'],
    benefits: ['Équilibrage du système nerveux', 'Amélioration de la qualité du sommeil', 'Réduction du stress', 'Harmonisation des énergies']
  }
];

// Fonction pour convertir les exercices API en format frontend
const convertAPIExerciseToFrontend = (apiExercise: APIExercise): Exercise => {
  const mappedCategory = categoryMapping[apiExercise.category] || apiExercise.category as ExerciseCategoryValue;
  
  return {
    id: apiExercise.id,
    title: apiExercise.title,
    description: apiExercise.description || '',
    category: mappedCategory,
    level: (apiExercise.difficulty as DifficultyLevelValue) || 'beginner',
    duration: apiExercise.duration || 10,
    intensity: 'moderate', // Valeur par défaut, pourrait être déterminée par la durée/catégorie
    type: ['mindfulness', 'respiration', 'meditation'].includes(apiExercise.category) ? 'breathing' : 
          ['flexibility', 'relaxation'].includes(apiExercise.category) ? 'relaxation' :
          'physical',
    imageUrl: apiExercise.imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: apiExercise.instructions ? apiExercise.instructions.split('\n').filter(Boolean) : [],
    benefits: apiExercise.benefits ? apiExercise.benefits.split('\n').filter(Boolean) : []
  };
};

// Catégories et niveaux importés depuis le fichier centralisé
// Création d'objets de mapping compatibles avec l'interface existante
const categories = Object.fromEntries(
  EXERCISE_CATEGORIES.map(cat => [cat.value, cat.label])
) as Record<ExerciseCategoryValue, string>;

const levels = {
  ...Object.fromEntries(DIFFICULTY_LEVELS.map(level => [level.value, level.label])),
  all_levels: 'Tous niveaux'
} as const;

export default function Exercises() {
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategoryValue | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevelValue | 'all_levels' | 'all'>('all');
  const [showRespirationDialog, setShowRespirationDialog] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupération des exercices depuis l'API
  const { data: apiExercises, isLoading, error, refetch: refetchExercises } = useQuery<APIExercise[]>({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/exercises');
      return response.json();
    },
    initialData: [],
    staleTime: 0, // Forcer le refetch
    cacheTime: 300000, // 5 minutes de cache
  });

  // Conversion des exercices API vers le format frontend et ajout des exercices interactifs
  const apiConvertedExercises = apiExercises.map(convertAPIExerciseToFrontend);
  const exercises = [...apiConvertedExercises, ...interactiveBreathingExercises];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category && categories[category as ExerciseCategoryValue]) {
      setSelectedCategory(category as ExerciseCategoryValue);
    }
  }, [location.search]);

  // Rafraîchir les exercices quand on arrive sur la page
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['exercises'] });
  }, [queryClient]);

  const filteredExercises = exercises.filter((exercise) => {
    const categoryMatch = selectedCategory === 'all' || exercise.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || exercise.level === selectedLevel;
    return categoryMatch && levelMatch;
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des exercices...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Erreur lors du chargement des exercices.</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </main>
      </>
    );
  }

  const handleStartExercise = (exercise: Exercise) => {
    // Vérifier s'il s'agit d'un exercice de respiration interactif
    if (exercise.id.includes('interactive')) {
      // Rediriger vers la page des exercices de relaxation avec l'onglet approprié
      const exerciseType = exercise.id.replace('-interactive', '').replace('-', '_');
      window.location.href = `/relaxation-exercises?tab=${exerciseType}`;
      return;
    }
    
    toast({
      title: "Exercice démarré",
      description: `Vous avez commencé "${exercise.title}". Bonne séance !`,
    });
    // Navigation vers la page de détail de l'exercice
    window.location.href = `/exercise/${exercise.id}`;
  };

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        
        {/* Page Header */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Bibliothèque d'Exercices</h1>
              <p className="text-muted-foreground">
                Choisissez parmi nos exercices adaptés à votre niveau et vos besoins du moment.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => refetchExercises()}
              className="flex items-center space-x-2"
            >
              <span className="material-icons">refresh</span>
              <span>Actualiser</span>
            </Button>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-8">
          <Card className="shadow-material" data-testid="card-filters">
            <CardHeader>
              <CardTitle className="text-lg">Filtres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Catégorie</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    data-testid="button-category-all"
                  >
                    Toutes les catégories
                  </Button>
                  {Object.entries(categories).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(key as keyof typeof categories)}
                      data-testid={`button-category-${key}`}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Niveau</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedLevel === 'all' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel('all')}
                    data-testid="button-level-all"
                  >
                    Tous niveaux
                  </Button>
                  {Object.entries(levels).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedLevel === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedLevel(key as keyof typeof levels)}
                      data-testid={`button-level-${key}`}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Interactive Breathing Exercises */}
        <section className="mb-8">
          <Card className="shadow-material bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-lg text-emerald-800">Exercices de Respiration Interactifs</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Nouveau</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-emerald-700 mb-4">
                Découvrez nos exercices de respiration guidés avec visualisation animée et personnalisation complète des durées.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
                  <Heart className="h-5 w-5 text-red-500" />
                  <div>
                    <h4 className="font-medium text-sm">Cohérence Cardiaque</h4>
                    <p className="text-xs text-muted-foreground">Synchronisation respiration-cœur</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
                  <Square className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-sm">Respiration Carrée</h4>
                    <p className="text-xs text-muted-foreground">4 phases équilibrées</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
                  <Triangle className="h-5 w-5 text-green-500" />
                  <div>
                    <h4 className="font-medium text-sm">Respiration Triangle</h4>
                    <p className="text-xs text-muted-foreground">3 phases fluides</p>
                  </div>
                </div>
              </div>
              <Dialog open={showRespirationDialog} onOpenChange={setShowRespirationDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Ouvrir les Exercices Interactifs
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl h-[90vh] p-0">
                  <DialogHeader className="sr-only">
                    <DialogTitle>Exercices de Respiration Interactifs</DialogTitle>
                  </DialogHeader>
                  <RespirationPlayer />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </section>

        {/* Results Summary */}
        <section className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-medium text-foreground">
              {selectedCategory === 'all' ? 'Tous les exercices' : categories[selectedCategory as keyof typeof categories]}
              {selectedLevel !== 'all' && ` - ${levels[selectedLevel as keyof typeof levels]}`}
            </h2>
            <span className="text-sm text-muted-foreground" data-testid="text-results-count">
              {filteredExercises.length} exercice{filteredExercises.length !== 1 ? 's' : ''}
            </span>
          </div>
        </section>

        {/* Exercise Grid */}
        <section>
          {filteredExercises.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-exercises">
              {filteredExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onStart={() => handleStartExercise(exercise)}
                />
              ))}
            </div>
          ) : (
            <Card className="shadow-material" data-testid="card-no-results">
              <CardContent className="p-8 text-center">
                <span className="material-icons text-6xl text-muted-foreground mb-4">search_off</span>
                <h3 className="text-xl font-medium text-foreground mb-2">Aucun exercice trouvé</h3>
                <p className="text-muted-foreground mb-4">
                  {exercises.length === 0 ? 
                    "Aucun exercice disponible pour le moment. Les administrateurs peuvent en ajouter via l'interface d'administration." :
                    "Essayez de modifier vos filtres pour voir plus d'exercices."
                  }
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedLevel('all');
                  }}
                  data-testid="button-reset-filters"
                >
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Emergency Access */}
        <section className="mt-12">
          <Card className="bg-gradient-to-r from-destructive to-red-600 shadow-material text-destructive-foreground" data-testid="card-emergency-section">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-medium mb-2 flex items-center">
                    <span className="material-icons mr-2">emergency</span>
                    Besoin d'aide immédiate ?
                  </h3>
                  <p className="opacity-90">
                    Accédez rapidement à nos routines d'urgence de 3 minutes pour gérer un craving intense.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    // Chercher d'abord un exercice d'urgence
                    const emergencyExercise = exercises.find(ex => ex.type === 'emergency');
                    if (emergencyExercise) {
                      handleStartExercise(emergencyExercise);
                    } else {
                      // Rediriger vers les routines d'urgence ou exercices de respiration
                      const breathingExercise = exercises.find(ex => ex.type === 'breathing' || ex.category === 'emotion_management');
                      if (breathingExercise) {
                        handleStartExercise(breathingExercise);
                      } else {
                        toast({
                          title: "Routine d'urgence",
                          description: "Aucune routine d'urgence spécifique disponible. Essayez les exercices de respiration ou de relaxation.",
                        });
                      }
                    }
                  }}
                  className="bg-white text-destructive hover:bg-gray-50 ml-4"
                  data-testid="button-emergency-access"
                >
                  Routine d'Urgence
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
