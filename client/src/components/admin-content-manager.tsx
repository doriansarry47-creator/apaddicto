import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Eye,
  BookOpen, 
  Activity,
  Users,
  Settings,
  FileText,
  Target,
  Clock,
  TrendingUp,
  Shield,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  instructions?: string;
  benefits?: string;
  isActive: boolean;
  variations?: ExerciseVariation[];
}

interface ExerciseVariation {
  id: string;
  exerciseId: string;
  type: 'simplification' | 'complexification';
  title: string;
  description: string;
  instructions?: string;
  difficultyModifier: number;
  benefits?: string;
  isActive: boolean;
}

interface PsychoContent {
  id: string;
  title: string;
  content: string;
  category: string;
  type: string;
  difficulty: string;
  estimatedReadTime?: number;
  isActive: boolean;
}

interface CustomSession {
  id: string;
  title: string;
  description: string;
  category: string;
  totalDuration: number;
  difficulty: string;
  isPublic: boolean;
  tags: string[];
  creatorId: string;
  isActive: boolean;
  elements: SessionElement[];
}

interface SessionElement {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  order: number;
  duration: number;
  repetitions: number;
  restTime: number;
  notes?: string;
  isOptional: boolean;
}

interface AdminContentManagerProps {
  userRole: string;
}

export function AdminContentManager({ userRole }: AdminContentManagerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("exercises");
  const [loading, setLoading] = useState(false);

  // États pour les différents contenus
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [psychoContents, setPsychoContents] = useState<PsychoContent[]>([]);
  const [customSessions, setCustomSessions] = useState<CustomSession[]>([]);
  
  // États pour l'édition
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editingContent, setEditingContent] = useState<PsychoContent | null>(null);
  const [editingSession, setEditingSession] = useState<CustomSession | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createType, setCreateType] = useState<'exercise' | 'variation' | 'content' | 'session'>('exercise');

  // Vérification des permissions admin
  if (userRole !== 'admin') {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Accès réservé aux administrateurs
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les exercices
      const exercisesRes = await fetch('/api/exercises');
      if (exercisesRes.ok) {
        const exercisesData = await exercisesRes.json();
        
        // Charger les variations pour chaque exercice
        const exercisesWithVariations = await Promise.all(
          exercisesData.map(async (exercise: Exercise) => {
            try {
              const variationsRes = await fetch(`/api/exercises/${exercise.id}/variations`);
              const variations = variationsRes.ok ? await variationsRes.json() : [];
              return { ...exercise, variations };
            } catch (error) {
              console.error(`Erreur loading variations for exercise ${exercise.id}:`, error);
              return { ...exercise, variations: [] };
            }
          })
        );
        
        setExercises(exercisesWithVariations);
      }

      // Charger le contenu psychoéducatif
      const contentRes = await fetch('/api/psycho-education');
      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setPsychoContents(contentData);
      }

      // Charger les séances personnalisées
      const sessionsRes = await fetch('/api/custom-sessions');
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setCustomSessions(sessionsData);
      }

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = async (formData: any) => {
    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Exercice créé",
          description: "Le nouvel exercice a été ajouté avec succès"
        });
        loadData();
        setShowCreateDialog(false);
      } else {
        throw new Error('Erreur lors de la création');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'exercice",
        variant: "destructive"
      });
    }
  };

  const handleCreateVariation = async (exerciseId: string, formData: any) => {
    try {
      const response = await fetch(`/api/exercises/${exerciseId}/variations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Variation créée",
          description: "La nouvelle variation a été ajoutée avec succès"
        });
        loadData();
      } else {
        throw new Error('Erreur lors de la création');
      }
    } catch (error) {
      toast({
        title: "Erreur", 
        description: "Impossible de créer la variation",
        variant: "destructive"
      });
    }
  };

  const handleCreateContent = async (formData: any) => {
    try {
      const response = await fetch('/api/psycho-education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Contenu créé",
          description: "Le nouveau contenu psychoéducatif a été ajouté"
        });
        loadData();
        setShowCreateDialog(false);
      } else {
        throw new Error('Erreur lors de la création');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le contenu",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'; 
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cardio': return '🏃‍♂️';
      case 'strength': return '💪';
      case 'flexibility': return '🧘‍♀️';
      case 'mindfulness': return '🧠';
      case 'addiction': return '🎯';
      case 'motivation': return '⭐';
      case 'coping': return '🛡️';
      case 'relapse_prevention': return '🔒';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement des données administrateur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-6 w-6 mr-2" />
            Panneau d'Administration - Gestion des Contenus
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="exercises" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Exercices
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Contenu Éducatif
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Séances
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        {/* Onglet Exercices */}
        <TabsContent value="exercises" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Gestion des Exercices ({exercises.length})
                </CardTitle>
                <Dialog open={showCreateDialog && createType === 'exercise'} onOpenChange={(open) => {
                  setShowCreateDialog(open);
                  setCreateType('exercise');
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvel Exercice
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Créer un nouvel exercice</DialogTitle>
                    </DialogHeader>
                    <ExerciseForm onSubmit={handleCreateExercise} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exercises.map(exercise => (
                  <Card key={exercise.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{exercise.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {exercise.description?.slice(0, 100)}...
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryIcon(exercise.category)} {exercise.category}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                          {exercise.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {exercise.duration}min
                        </Badge>
                      </div>

                      {exercise.variations && exercise.variations.length > 0 && (
                        <div className="border-t pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              Variations ({exercise.variations.length})
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCreateType('variation');
                                setShowCreateDialog(true);
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="space-y-1">
                            {exercise.variations.map(variation => (
                              <div key={variation.id} className="flex items-center justify-between text-xs">
                                <span>{variation.title}</span>
                                <Badge 
                                  variant={variation.type === 'simplification' ? 'secondary' : 'default'}
                                  className="text-xs"
                                >
                                  {variation.type === 'simplification' ? '👇' : '👆'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className={exercise.isActive ? 'text-green-600' : 'text-red-600'}>
                          {exercise.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 inline mr-1" />
                              Actif
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 inline mr-1" />
                              Inactif
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Contenu Éducatif */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Contenu Psychoéducatif ({psychoContents.length})
                </CardTitle>
                <Button
                  onClick={() => {
                    setCreateType('content');
                    setShowCreateDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Contenu
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {psychoContents.map(content => (
                  <Card key={content.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{content.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {content.content?.slice(0, 150)}...
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryIcon(content.category)} {content.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {content.type}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(content.difficulty)}`}>
                          {content.difficulty}
                        </Badge>
                        {content.estimatedReadTime && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {content.estimatedReadTime}min
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className={content.isActive ? 'text-green-600' : 'text-red-600'}>
                          {content.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 inline mr-1" />
                              Publié
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 inline mr-1" />
                              Brouillon
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Séances */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Séances Thérapeutiques ({customSessions.length})
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Séance
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customSessions.map(session => (
                  <Card key={session.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{session.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {session.description?.slice(0, 100)}...
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {session.category}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(session.difficulty)}`}>
                          {session.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(session.totalDuration)}
                        </Badge>
                        {session.isPublic && (
                          <Badge variant="default" className="text-xs">
                            Public
                          </Badge>
                        )}
                      </div>

                      {session.elements && session.elements.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {session.elements.length} exercices configurés
                        </div>
                      )}

                      {session.tags && session.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {session.tags.slice(0, 3).map((tag, index) => (
                            <span 
                              key={index} 
                              className="text-xs bg-muted px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {session.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{session.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Statistiques */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Exercices</p>
                  <p className="text-2xl font-bold">{exercises.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Articles Éducatifs</p>
                  <p className="text-2xl font-bold">{psychoContents.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Séances Créées</p>
                  <p className="text-2xl font-bold">{customSessions.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Séances Publiques</p>
                  <p className="text-2xl font-bold">
                    {customSessions.filter(s => s.isPublic).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Répartition du Contenu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Exercices par Catégorie</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['cardio', 'strength', 'flexibility', 'mindfulness'].map(category => {
                      const count = exercises.filter(ex => ex.category === category).length;
                      return (
                        <div key={category} className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-lg font-bold">{count}</div>
                          <div className="text-xs text-muted-foreground capitalize">{category}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Contenu par Catégorie</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['addiction', 'motivation', 'coping', 'relapse_prevention'].map(category => {
                      const count = psychoContents.filter(content => content.category === category).length;
                      return (
                        <div key={category} className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-lg font-bold">{count}</div>
                          <div className="text-xs text-muted-foreground">{category.replace('_', ' ')}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Composant formulaire pour créer un exercice
function ExerciseForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'strength',
    difficulty: 'beginner',
    duration: 15,
    instructions: '',
    benefits: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Titre de l'exercice</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Catégorie</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cardio">🏃‍♂️ Cardio</SelectItem>
              <SelectItem value="strength">💪 Renforcement</SelectItem>
              <SelectItem value="flexibility">🧘‍♀️ Souplesse</SelectItem>
              <SelectItem value="mindfulness">🧠 Pleine conscience</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Difficulté</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Débutant</SelectItem>
              <SelectItem value="intermediate">Intermédiaire</SelectItem>
              <SelectItem value="advanced">Avancé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Durée (minutes)</Label>
        <Input
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
          min="1"
          max="120"
        />
      </div>

      <div>
        <Label>Instructions détaillées</Label>
        <Textarea
          value={formData.instructions}
          onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
          rows={4}
          placeholder="Décrivez précisément comment réaliser l'exercice..."
        />
      </div>

      <div>
        <Label>Bénéfices</Label>
        <Textarea
          value={formData.benefits}
          onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
          rows={2}
          placeholder="Quels sont les bénéfices de cet exercice ?"
        />
      </div>

      <Button type="submit" className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Créer l'Exercice
      </Button>
    </form>
  );
}