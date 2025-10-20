import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Search, Grid, List, Target, Play } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { 
  PsychoEducationContent, 
  Exercise, 
  CustomSession, 
  EducationalContent, 
  ContentCategory 
} from "@shared/schema";
import { 
  EXERCISE_CATEGORIES, 
  SESSION_CATEGORIES, 
  getCategoryByValue 
} from "@shared/constants.ts";

const DIFFICULTY_COLORS = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800", 
  advanced: "bg-red-100 text-red-800"
};

const DIFFICULTY_LABELS = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé"
};

export default function Library() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("educational");

  // Réinitialiser la catégorie quand on change d'onglet
  React.useEffect(() => {
    setSelectedCategory("all");
  }, [activeTab]);

  // Récupération du contenu éducatif (nouveau système)
  const { data: educationalContent = [], isLoading: educationalLoading } = useQuery<EducationalContent[]>({
    queryKey: ["educational-contents"],
    queryFn: async () => {
      try {
        return apiRequest("GET", "/api/educational-contents?status=published").then(res => res.json());
      } catch (error) {
        console.log('Educational contents not available');
        return [];
      }
    },
    initialData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes de cache
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Récupération des catégories de contenu éducatif
  const { data: contentCategories = [], isLoading: categoriesLoading } = useQuery<ContentCategory[]>({
    queryKey: ["content-categories"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/content-categories");
        const categories = await response.json();
        return Array.isArray(categories) ? categories.filter(cat => cat.isActive) : [];
      } catch (error) {
        console.log('Content categories not available');
        return [];
      }
    },
    initialData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes de cache (les catégories changent rarement)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Récupération du contenu legacy (fallback)
  const { data: legacyContent = [], isLoading: legacyLoading } = useQuery<PsychoEducationContent[]>({
    queryKey: ["psycho-education"],
    queryFn: async () => apiRequest("GET", "/api/psycho-education").then(res => res.json()),
    initialData: [],
    enabled: educationalContent.length === 0 && !educationalLoading // Seulement si pas de nouveau contenu
  });

  // Récupération des EXERCICES (différent du contenu éducatif)
  const { data: exercises = [], isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: ["exercises"],
    queryFn: async () => apiRequest("GET", "/api/exercises").then(res => res.json()),
    initialData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes de cache
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Récupération des SÉANCES (différent des exercices)
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<CustomSession[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      try {
        return apiRequest("GET", "/api/sessions").then(res => res.json());
      } catch (error) {
        console.log('Sessions not available');
        return [];
      }
    },
    initialData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes de cache
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Combiner le contenu éducatif (nouveau + legacy)
  const allEducationalContent = [...educationalContent, ...legacyContent];

  // Filtrer le contenu éducatif
  const filteredEducationalContent = allEducationalContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.content?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    let matchesCategory = selectedCategory === "all";
    if (!matchesCategory) {
      // Pour le nouveau système, utiliser categoryId
      if ('categoryId' in item && item.categoryId) {
        matchesCategory = item.categoryId === selectedCategory;
      }
      // Pour le legacy, utiliser category
      else if ('category' in item) {
        matchesCategory = item.category === selectedCategory;
      }
    }
    
    const matchesDifficulty = selectedDifficulty === "all" || item.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty && item.isActive;
  });

  // Filtrer les exercices (utilise les catégories d'exercices)
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (exercise.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesCategory = selectedCategory === "all" || exercise.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || exercise.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty && exercise.isActive;
  });

  // Filtrer les séances (utilise les catégories de séances)
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (session.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesCategory = selectedCategory === "all" || session.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || session.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty && session.isActive && session.status === 'published';
  });

  // Regrouper le contenu éducatif par catégorie dynamique
  const educationalContentByCategory = contentCategories.reduce((acc, category) => {
    acc[category.id] = filteredEducationalContent.filter(item => {
      if ('categoryId' in item) return item.categoryId === category.id;
      return false;
    });
    return acc;
  }, {} as Record<string, EducationalContent[]>);

  // Regrouper les exercices par catégorie
  const exercisesByCategory = EXERCISE_CATEGORIES.reduce((acc, category) => {
    acc[category.value] = (filteredExercises || []).filter(item => item.category === category.value);
    return acc;
  }, {} as Record<string, Exercise[]>);

  // Regrouper les séances par catégorie
  const sessionsByCategory = SESSION_CATEGORIES.reduce((acc, category) => {
    acc[category.value] = (filteredSessions || []).filter(item => item.category === category.value);
    return acc;
  }, {} as Record<string, CustomSession[]>);

  const EducationalContentCard = ({ item }: { item: EducationalContent }) => {
    // Trouve la catégorie pour le nouveau système
    const category = contentCategories.find(cat => cat.id === item.categoryId);
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  {category?.name || 'Contenu éducatif'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={DIFFICULTY_COLORS[item.difficulty as keyof typeof DIFFICULTY_COLORS]}>
                {DIFFICULTY_LABELS[item.difficulty as keyof typeof DIFFICULTY_LABELS]}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {item.description || (item.content?.substring(0, 120) + "...")}
          </p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center text-sm text-muted-foreground min-w-0">
              <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{item.estimatedReadTime || 5} min</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="group-hover:bg-primary group-hover:text-primary-foreground flex-shrink-0"
              onClick={() => navigate(`/content/${item.id}`)}
            >
              Lire
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ExerciseCard = ({ exercise }: { exercise: Exercise }) => {
    const category = getCategoryByValue(exercise.category, EXERCISE_CATEGORIES);
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`p-2 rounded-lg ${category.color}`}>
                <span className="text-sm">{category.icon}</span>
              </div>
              <div>
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {exercise.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {category.label}
                </CardDescription>
              </div>
            </div>
            <Badge className={DIFFICULTY_COLORS[exercise.difficulty as keyof typeof DIFFICULTY_COLORS]}>
              {DIFFICULTY_LABELS[exercise.difficulty as keyof typeof DIFFICULTY_LABELS]}
            </Badge>
          </div>
          <CardDescription>{exercise.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center text-sm text-muted-foreground min-w-0">
              <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{exercise.duration} min</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="group-hover:bg-primary group-hover:text-primary-foreground flex-shrink-0"
              onClick={() => navigate(`/exercise/${exercise.id}`)}
            >
              Commencer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const SessionCard = ({ session }: { session: CustomSession }) => {
    const category = getCategoryByValue(session.category, SESSION_CATEGORIES);
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`p-2 rounded-lg ${category.color}`}>
                <span className="text-sm">{category.icon}</span>
              </div>
              <div>
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {session.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {category.label}
                </CardDescription>
              </div>
            </div>
            <Badge className={DIFFICULTY_COLORS[session.difficulty as keyof typeof DIFFICULTY_COLORS]}>
              {DIFFICULTY_LABELS[session.difficulty as keyof typeof DIFFICULTY_LABELS]}
            </Badge>
          </div>
          <CardDescription>{session.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center text-sm text-muted-foreground min-w-0">
              <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{Math.round((session.totalDuration || 0) / 60)} min</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="group-hover:bg-primary group-hover:text-primary-foreground flex-shrink-0"
              onClick={() => navigate(`/session/${session.id}`)}
            >
              <Play className="h-4 w-4 mr-1" />
              Démarrer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (educationalLoading || categoriesLoading || legacyLoading || exercisesLoading || sessionsLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Obtenir les catégories pour le filtre selon l'onglet actif
  const getCategoriesForFilter = () => {
    switch (activeTab) {
      case "educational":
        return contentCategories.map(cat => ({ id: cat.id, name: cat.name }));
      case "exercises":
        return EXERCISE_CATEGORIES.map(cat => ({ id: cat.value, name: cat.label }));
      case "sessions":
        return SESSION_CATEGORIES.map(cat => ({ id: cat.value, name: cat.label }));
      default:
        return [
          ...contentCategories.map(cat => ({ id: cat.id, name: cat.name })),
          ...EXERCISE_CATEGORIES.map(cat => ({ id: cat.value, name: cat.label })),
          ...SESSION_CATEGORIES.map(cat => ({ id: cat.value, name: cat.label }))
        ];
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Bibliothèque de Ressources</h1>
        </div>
        <p className="text-muted-foreground">
          Découvrez nos ressources organisées par type : contenu éducatif, exercices et séances personnalisées
        </p>
      </div>

      {/* Filtres et recherche */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher du contenu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {getCategoriesForFilter().map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Difficulté" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{filteredEducationalContent.length}</div>
            <div className="text-sm text-muted-foreground">Contenus éducatifs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{filteredExercises.length}</div>
            <div className="text-sm text-muted-foreground">Exercices pratiques</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{filteredSessions.length}</div>
            <div className="text-sm text-muted-foreground">Séances disponibles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{contentCategories.length + EXERCISE_CATEGORIES.length + SESSION_CATEGORIES.length}</div>
            <div className="text-sm text-muted-foreground">Catégories totales</div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="educational">Contenu Éducatif</TabsTrigger>
          <TabsTrigger value="exercises">Exercices</TabsTrigger>
          <TabsTrigger value="sessions">Séances</TabsTrigger>
          <TabsTrigger value="all">Tout Voir</TabsTrigger>
        </TabsList>

        {/* Vue contenu éducatif */}
        <TabsContent value="educational">
          <div className="space-y-8">
            {(contentCategories || []).length > 0 ? (contentCategories || []).map(category => {
              const categoryContent = educationalContentByCategory[category.id] || [];
              if (!categoryContent || categoryContent.length === 0) return null;
              
              return (
                <div key={category.id}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{category.name}</h2>
                      <p className="text-sm text-muted-foreground">{category.description || 'Contenu éducatif'}</p>
                    </div>
                    <Badge variant="outline">{categoryContent.length}</Badge>
                  </div>
                  
                  <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {categoryContent.map(item => (
                      <EducationalContentCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              );
            }) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun contenu éducatif</h3>
                  <p className="text-muted-foreground">
                    Le contenu éducatif sera disponible une fois ajouté par les administrateurs.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Vue exercices */}
        <TabsContent value="exercises">
          <div className="space-y-8">
            {EXERCISE_CATEGORIES.map(category => {
              const categoryExercises = exercisesByCategory[category.value] || [];
              if (!categoryExercises || categoryExercises.length === 0) return null;
              
              return (
                <div key={category.value}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      <span className="text-lg">{category.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{category.label}</h2>
                      <p className="text-sm text-muted-foreground">Exercices de {category.label.toLowerCase()}</p>
                    </div>
                    <Badge variant="outline">{categoryExercises.length}</Badge>
                  </div>
                  
                  <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {categoryExercises.map(exercise => (
                      <ExerciseCard key={exercise.id} exercise={exercise} />
                    ))}
                  </div>
                </div>
              );
            })}
            
            {filteredExercises.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun exercice disponible</h3>
                  <p className="text-muted-foreground">
                    Les exercices seront disponibles une fois ajoutés par les administrateurs.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Vue séances */}
        <TabsContent value="sessions">
          <div className="space-y-8">
            {SESSION_CATEGORIES.map(category => {
              const categorySessions = sessionsByCategory[category.value] || [];
              if (!categorySessions || categorySessions.length === 0) return null;
              
              return (
                <div key={category.value}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      <span className="text-lg">{category.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{category.label}</h2>
                      <p className="text-sm text-muted-foreground">Séances de {category.label.toLowerCase()}</p>
                    </div>
                    <Badge variant="outline">{categorySessions.length}</Badge>
                  </div>
                  
                  <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {categorySessions.map(session => (
                      <SessionCard key={session.id} session={session} />
                    ))}
                  </div>
                </div>
              );
            })}
            
            {filteredSessions.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune séance disponible</h3>
                  <p className="text-muted-foreground">
                    Les séances personnalisées seront disponibles une fois créées et publiées par les administrateurs.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Vue tout voir */}
        <TabsContent value="all">
          <div className="space-y-8">
            {filteredEducationalContent.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Contenu Éducatif</h2>
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {filteredEducationalContent.map(item => (
                    <EducationalContentCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
            
            {filteredExercises.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Exercices</h2>
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {filteredExercises.map(exercise => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                  ))}
                </div>
              </div>
            )}
            
            {filteredSessions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Séances</h2>
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {filteredSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Message si aucun résultat */}
      {filteredEducationalContent.length === 0 && filteredExercises.length === 0 && filteredSessions.length === 0 && (
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun contenu trouvé</h3>
            <p className="text-muted-foreground">
              Essayez d'ajuster vos filtres ou votre terme de recherche.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}