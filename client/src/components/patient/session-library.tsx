import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  Star,
  Play,
  Edit2,
  Save,
  Clock,
  Target,
  Zap,
  Heart,
  Info,
  Copy,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  workTime?: number;
  restInterval?: number;
  notes?: string;
  order: number;
}

interface Session {
  id: string;
  title: string;
  description: string;
  category: string;
  protocol: string;
  protocolConfig: any;
  totalDuration: number;
  difficulty: string;
  exercises: SessionExercise[];
  tags: string[];
  isPublic: boolean;
  isFavorite?: boolean;
}

interface SessionLibraryProps {
  availableSessions: Session[];
  favoriteSessions: Session[];
  onCustomize: (session: Session) => void;
  onSaveFavorite: (session: Session, customName?: string) => Promise<void>;
  onRemoveFavorite: (sessionId: string) => Promise<void>;
  onStartSession: (sessionId: string) => void;
  onRefresh: () => void;
}

export function SessionLibrary({
  availableSessions,
  favoriteSessions,
  onCustomize,
  onSaveFavorite,
  onRemoveFavorite,
  onStartSession,
  onRefresh
}: SessionLibraryProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("library");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [protocolFilter, setProtocolFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [customizingSession, setCustomizingSession] = useState<Session | null>(null);
  const [saveFavoriteName, setSaveFavoriteName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Filtrer les séances
  const filterSessions = (sessions: Session[]) => {
    return sessions.filter(session => {
      const matchesSearch =
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === "all" || session.category === categoryFilter;
      const matchesProtocol = protocolFilter === "all" || session.protocol === protocolFilter;
      const matchesDifficulty = difficultyFilter === "all" || session.difficulty === difficultyFilter;

      return matchesSearch && matchesCategory && matchesProtocol && matchesDifficulty;
    });
  };

  const filteredAvailableSessions = filterSessions(availableSessions);
  const filteredFavoriteSessions = filterSessions(favoriteSessions);

  const handleOpenCustomize = (session: Session) => {
    setSelectedSession(session);
    setCustomizingSession(JSON.parse(JSON.stringify(session))); // Deep copy
  };

  const handleSaveAsFavorite = async (session: Session) => {
    setSaveFavoriteName(session.title);
    setSelectedSession(session);
    setShowSaveDialog(true);
  };

  const handleConfirmSaveFavorite = async () => {
    if (!selectedSession) return;

    setIsSaving(true);
    try {
      const customSession = { ...selectedSession, title: saveFavoriteName };
      await onSaveFavorite(customSession, saveFavoriteName);

      toast({
        title: "✅ Séance ajoutée aux favoris",
        description: `"${saveFavoriteName}" a été sauvegardée`,
      });

      setShowSaveDialog(false);
      setSaveFavoriteName("");
      setSelectedSession(null);
      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la séance",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveFavorite = async (sessionId: string) => {
    try {
      await onRemoveFavorite(sessionId);
      toast({
        title: "Séance supprimée",
        description: "La séance a été retirée de vos favoris",
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la séance",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}min ${secs}s` : `${secs}s`;
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
          {/* Informations */}
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

          {/* Tags */}
          {session.tags && session.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {session.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {session.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{session.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button
              size="sm"
              onClick={() => onStartSession(session.id)}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-1" />
              Démarrer
            </Button>

            {!isFavorite && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenCustomize(session)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSaveAsFavorite(session)}
                >
                  <Star className="h-4 w-4" />
                </Button>
              </>
            )}

            {isFavorite && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenCustomize(session)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveFavorite(session.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">📚 Bibliothèque de Séances</h2>
        <p className="text-muted-foreground mt-2">
          Explorez, personnalisez et sauvegardez vos séances d'entraînement
        </p>
      </div>

      {/* Barre de recherche et filtres */}
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
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">Tous protocoles</option>
            <option value="standard">Standard</option>
            <option value="hiit">⚡ HIIT</option>
            <option value="tabata">🔥 TABATA</option>
            <option value="hict">🧱 HICT</option>
            <option value="emom">🕐 EMOM</option>
            <option value="e2mom">🕑 E2MOM</option>
            <option value="amrap">🔁 AMRAP</option>
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

      {/* Tabs : Bibliothèque / Favoris */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Séances disponibles ({filteredAvailableSessions.length})
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Mes favoris ({filteredFavoriteSessions.length})
          </TabsTrigger>
        </TabsList>

        {/* Séances disponibles */}
        <TabsContent value="library" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAvailableSessions.map(session => renderSessionCard(session, false))}
          </div>

          {filteredAvailableSessions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucune séance disponible</p>
            </div>
          )}
        </TabsContent>

        {/* Séances favorites */}
        <TabsContent value="favorites" className="mt-6">
          {favoriteSessions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Star className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune séance favorite</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Personnalisez et sauvegardez vos séances préférées depuis la bibliothèque
                  pour y accéder rapidement ici.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFavoriteSessions.map(session => renderSessionCard(session, true))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog pour sauvegarder comme favori */}
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
                value={saveFavoriteName}
                onChange={(e) => setSaveFavoriteName(e.target.value)}
                placeholder="Ex: Mon entraînement du matin"
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Vous pourrez modifier cette séance à tout moment depuis vos favoris
              </AlertDescription>
            </Alert>
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
              onClick={handleConfirmSaveFavorite}
              disabled={!saveFavoriteName.trim() || isSaving}
            >
              {isSaving ? "Sauvegarde..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
