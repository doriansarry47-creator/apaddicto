import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Play, 
  Star, 
  Clock, 
  Target, 
  Trash2, 
  Info, 
  Edit2,
  CheckCircle,
  BookOpen,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";
import type { CustomSession } from "@shared/schema";
import { 
  getCategoryByValue, 
  getDifficultyByValue, 
  getProtocolByValue,
  SESSION_CATEGORIES 
} from "@shared/constants";

interface SessionExercise {
  id: string;
  exerciseId: string;
  title: string;
  duration: number;
  repetitions: number;
  sets: number;
  restTime: number;
  order: number;
  notes?: string;
}

interface Session {
  id: string;
  title: string;
  description: string;
  category: string;
  protocol: string;
  protocolConfig?: any;
  totalDuration: number;
  difficulty: string;
  exercises: SessionExercise[];
  tags: string[];
  isPublic: boolean;
  status?: string;
  isFavorite?: boolean;
  customizedFrom?: string;
}

interface AssignedSession {
  id: string;
  sessionId: string;
  status: 'assigned' | 'in_progress' | 'done' | 'skipped';
  assignedAt: string;
  completedAt?: string;
  duration?: number;
  feedback?: string;
  session: Session;
}

export default function SessionsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("library");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customizedSession, setCustomizedSession] = useState<Session | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Récupérer les séances disponibles (bibliothèque)
  const { data: availableSessions = [], isLoading: loadingSessions } = useQuery<Session[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/sessions");
      const sessions = await response.json();
      return sessions.filter((s: Session) => s.status === 'published' && s.isPublic);
    },
    initialData: [],
  });

  // Récupérer les séances favorites
  const { data: favoriteSessions = [], isLoading: loadingFavorites } = useQuery<Session[]>({
    queryKey: ["favorite-sessions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/patient-sessions/favorites");
      return response.json();
    },
    initialData: [],
  });

  // Récupérer les séances assignées
  const { data: assignedSessions = [], isLoading: loadingAssigned } = useQuery<AssignedSession[]>({
    queryKey: ["assigned-sessions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/patient-sessions");
      return response.json();
    },
    initialData: [],
  });

  // Mutation pour sauvegarder une séance favorite
  const saveFavoriteMutation = useMutation({
    mutationFn: async (data: { session: Session; customName?: string }) => {
      const response = await apiRequest("POST", "/api/patient-sessions/favorites", {
        sessionId: data.session.id,
        customName: data.customName,
        customizedData: data.session
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Séance ajoutée aux favoris",
        description: "Vous pouvez maintenant la retrouver dans vos favoris"
      });
      queryClient.invalidateQueries({ queryKey: ["favorite-sessions"] });
      setShowSaveDialog(false);
      setCustomName("");
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la séance",
        variant: "destructive"
      });
    }
  });

  // Mutation pour supprimer une séance favorite
  const deleteFavoriteMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiRequest("DELETE", `/api/patient-sessions/favorites/${sessionId}`);
    },
    onSuccess: () => {
      toast({
        title: "Séance supprimée",
        description: "La séance a été retirée de vos favoris"
      });
      queryClient.invalidateQueries({ queryKey: ["favorite-sessions"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la séance",
        variant: "destructive"
      });
    }
  });

  // Filtrer les séances
  const filterSessions = (sessions: Session[]) => {
    return sessions.filter(session => {
      const matchesSearch =
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === "all" || session.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === "all" || session.difficulty === difficultyFilter;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  };

  const filteredAvailable = filterSessions(availableSessions);
  const filteredFavorites = filterSessions(favoriteSessions);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return mins > 0 ? `${mins} min` : `${seconds}s`;
  };

  const handleOpenDetails = (session: Session) => {
    setSelectedSession(session);
    setCustomizedSession(JSON.parse(JSON.stringify(session))); // Deep copy
    setShowDetailsDialog(true);
  };

  const handleStartSession = (sessionId: string) => {
    // Navigation vers la page de détail de la séance pour l'exécuter
    navigate(`/session/${sessionId}`);
  };

  const handleSaveAsFavorite = (session: Session) => {
    setSelectedSession(session);
    setCustomName(session.title + " (Personnalisée)");
    setShowSaveDialog(true);
  };

  const handleConfirmSave = () => {
    if (!selectedSession) return;
    setIsSaving(true);
    saveFavoriteMutation.mutate(
      { session: customizedSession || selectedSession, customName },
      {
        onSettled: () => setIsSaving(false)
      }
    );
  };

  const handleUpdateExercise = (index: number, field: string, value: any) => {
    if (!customizedSession) return;
    const updated = { ...customizedSession };
    updated.exercises[index] = {
      ...updated.exercises[index],
      [field]: value
    };
    // Recalculer la durée totale
    const totalDuration = updated.exercises.reduce((sum, ex) => sum + (ex.duration * 60), 0);
    updated.totalDuration = totalDuration;
    setCustomizedSession(updated);
  };

  const handleSaveCustomized = () => {
    if (!customizedSession) return;
    handleSaveAsFavorite(customizedSession);
    setShowDetailsDialog(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge className="bg-blue-500">À faire</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500">En cours</Badge>;
      case 'done':
        return <Badge className="bg-green-500">Terminée</Badge>;
      case 'skipped':
        return <Badge className="bg-gray-500">Ignorée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderSessionCard = (session: Session, isFavorite: boolean = false) => {
    const category = getCategoryByValue(session.category, SESSION_CATEGORIES);
    const difficulty = getDifficultyByValue(session.difficulty);
    const protocol = getProtocolByValue(session.protocol);

    return (
      <Card key={session.id} className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1 flex items-center gap-2">
                {session.title}
                {isFavorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {session.description}
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className={category.color}>
              {category.icon} {category.label}
            </Badge>
            <Badge className={protocol.color}>
              {protocol.icon} {protocol.label}
            </Badge>
            <Badge className={difficulty.color}>
              {difficulty.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatDuration(session.totalDuration || 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>{session.exercises?.length || 0} exercices</span>
            </div>
          </div>

          {session.tags && session.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {session.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenDetails(session)}
              className="flex-1"
            >
              <Info className="h-4 w-4 mr-1" />
              Détails
            </Button>

            <Button
              size="sm"
              onClick={() => handleStartSession(session.id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="h-4 w-4 mr-1" />
              Démarrer
            </Button>

            {!isFavorite ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSaveAsFavorite(session)}
              >
                <Star className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteFavoriteMutation.mutate(session.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAssignedSessionCard = (assignedSession: AssignedSession) => {
    const category = getCategoryByValue(assignedSession.session.category, SESSION_CATEGORIES);
    const difficulty = getDifficultyByValue(assignedSession.session.difficulty);

    return (
      <Card key={assignedSession.id} className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">
                {assignedSession.session.title}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {assignedSession.session.description}
              </CardDescription>
            </div>
            {getStatusBadge(assignedSession.status)}
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className={category.color}>
              {category.icon} {category.label}
            </Badge>
            <Badge className={difficulty.color}>
              {difficulty.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Assignée le {new Date(assignedSession.assignedAt).toLocaleDateString()}</span>
            </div>
            {assignedSession.completedAt && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Complétée le {new Date(assignedSession.completedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenDetails(assignedSession.session)}
              className="flex-1"
            >
              <Info className="h-4 w-4 mr-1" />
              Détails
            </Button>
            
            {assignedSession.status !== 'done' && (
              <Button
                size="sm"
                onClick={() => handleStartSession(assignedSession.session.id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="h-4 w-4 mr-1" />
                {assignedSession.status === 'in_progress' ? 'Continuer' : 'Commencer'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Mes Séances</h1>
            </div>
            <p className="text-muted-foreground">
              Explorez, personnalisez et suivez vos séances d'entraînement
            </p>
          </div>

          {/* Recherche et filtres */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une séance..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Toutes catégories</option>
                {SESSION_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Toutes difficultés</option>
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
              </select>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="library">
                <BookOpen className="h-4 w-4 mr-2" />
                Bibliothèque ({filteredAvailable.length})
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Star className="h-4 w-4 mr-2" />
                Mes favoris ({filteredFavorites.length})
              </TabsTrigger>
              <TabsTrigger value="assigned">
                <CheckCircle className="h-4 w-4 mr-2" />
                Assignées ({assignedSessions.length})
              </TabsTrigger>
            </TabsList>

            {/* Bibliothèque */}
            <TabsContent value="library" className="mt-6">
              {loadingSessions ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredAvailable.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAvailable.map(session => renderSessionCard(session, false))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucune séance disponible</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Favoris */}
            <TabsContent value="favorites" className="mt-6">
              {loadingFavorites ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredFavorites.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredFavorites.map(session => renderSessionCard(session, true))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune séance favorite</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Personnalisez et sauvegardez vos séances préférées depuis la bibliothèque
                      pour y accéder rapidement ici.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Assignées */}
            <TabsContent value="assigned" className="mt-6">
              {loadingAssigned ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : assignedSessions.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {assignedSessions.map(session => renderAssignedSessionCard(session))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune séance assignée</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Votre coach vous assignera des séances personnalisées qui apparaîtront ici.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Dialog: Détails et personnalisation */}
          <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Détails - {selectedSession?.title}
                </DialogTitle>
                <DialogDescription>
                  Consultez les exercices et personnalisez les paramètres
                </DialogDescription>
              </DialogHeader>

              {customizedSession && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Informations Générales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Durée: {formatDuration(customizedSession.totalDuration || 0)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>Exercices: {customizedSession.exercises?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Difficulté: {customizedSession.difficulty}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">{customizedSession.description}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Edit2 className="h-5 w-5" />
                        Exercices de la Séance
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Modifiez les paramètres selon vos besoins
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {customizedSession.exercises?.map((exercise, index) => (
                          <Card key={exercise.id} className="border border-gray-200">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                  {index + 1}. {exercise.title}
                                </CardTitle>
                                <Badge variant="outline">Ordre {exercise.order}</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <Label className="text-xs">Durée (min)</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={exercise.duration}
                                    onChange={(e) => handleUpdateExercise(index, 'duration', parseInt(e.target.value) || 1)}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Répétitions</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={exercise.repetitions || 1}
                                    onChange={(e) => handleUpdateExercise(index, 'repetitions', parseInt(e.target.value) || 1)}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Séries</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={exercise.sets || 1}
                                    onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Repos (sec)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="300"
                                    value={exercise.restTime || 30}
                                    onChange={(e) => handleUpdateExercise(index, 'restTime', parseInt(e.target.value) || 0)}
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              {exercise.notes && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <Label className="text-xs font-medium">Notes:</Label>
                                  <Textarea
                                    value={exercise.notes}
                                    onChange={(e) => handleUpdateExercise(index, 'notes', e.target.value)}
                                    className="mt-1 text-xs"
                                    rows={2}
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Fermer
                </Button>
                <Button
                  onClick={() => customizedSession && handleStartSession(customizedSession.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Démarrer
                </Button>
                <Button onClick={handleSaveCustomized}>
                  <Star className="h-4 w-4 mr-2" />
                  Sauvegarder personnalisation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Sauvegarder comme favori */}
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enregistrer comme favori</DialogTitle>
                <DialogDescription>
                  Donnez un nom personnalisé à cette séance
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom de la séance</Label>
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Ex: Mon entraînement du matin"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                  disabled={isSaving}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleConfirmSave}
                  disabled={!customName.trim() || isSaving}
                >
                  {isSaving ? "Sauvegarde..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </>
  );
}
