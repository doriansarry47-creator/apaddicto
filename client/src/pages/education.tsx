import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import type { EducationalContent, ContentCategory } from "@shared/schema";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { 
  BookOpen, 
  Play, 
  Volume2, 
  FileText, 
  Image as ImageIcon,
  Search,
  Filter,
  Heart,
  Eye,
  Clock,
  Star,
  Bookmark,
  CheckCircle2,
  Grid3x3,
  List,
  TrendingUp,
  Award,
  Target,
  Lightbulb,
  Brain,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Users,
  ThumbsUp,
  MessageCircle,
  Share2,
  Download,
  Timer,
  BarChart3,
  ExternalLink
} from "lucide-react";

interface ContentStats {
  totalContents: number;
  completedContents: number;
  likedContents: number;
  bookmarkedContents: number;
  totalReadTime: number;
  currentStreak: number;
}

interface UserProgress {
  contentId: string;
  isCompleted: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  viewCount: number;
  lastViewedAt?: string;
}

interface ContentCardProps {
  content: EducationalContent;
  isCompleted: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  category?: ContentCategory;
  onLike: () => void;
  onBookmark: () => void;
  onComplete: () => void;
  onRead: () => void;
  getTypeIcon: (type: string) => React.ReactNode;
  getDifficultyColor: (difficulty: string) => string;
}

function ContentCard({ 
  content, 
  isCompleted, 
  isLiked, 
  isBookmarked, 
  category,
  onLike,
  onBookmark,
  onComplete,
  onRead,
  getTypeIcon,
  getDifficultyColor 
}: ContentCardProps) {
  
  return (
    <Card className={`group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
      isCompleted 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-green-100' 
        : 'bg-gradient-to-br from-white to-blue-50/30 hover:from-blue-50/50 hover:to-purple-50/30'
    } border-2`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-3 rounded-xl shadow-sm ${
              isCompleted 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700'
            }`}>
              {getTypeIcon(content.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-start gap-2 mb-2">
                <CardTitle className="text-xl leading-tight text-gray-800 group-hover:text-blue-800 transition-colors">
                  {content.title}
                </CardTitle>
                {content.isRecommended && (
                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                    <Star className="h-3 w-3 fill-current" />
                    Recommandé
                  </div>
                )}
                {isCompleted && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    Terminé
                  </div>
                )}
              </div>
              {content.description && (
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
                  {content.description}
                </p>
              )}
            </div>
          </div>
          {content.thumbnailUrl && (
            <div className="relative overflow-hidden rounded-xl shadow-sm ml-4">
              <img 
                src={content.thumbnailUrl} 
                alt={content.title}
                className="w-20 h-20 object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Métadonnées améliorées */}
        <div className="flex flex-wrap gap-3">
          <Badge className={`${getDifficultyColor(content.difficulty)} border-0 shadow-sm px-3 py-1`}>
            {content.difficulty === 'easy' ? '🟢 Facile' : 
             content.difficulty === 'intermediate' ? '🟡 Intermédiaire' : '🔴 Avancé'}
          </Badge>
          {category && (
            <Badge variant="outline" className="border-2 border-blue-200 text-blue-700 bg-blue-50 px-3 py-1">
              📁 {category.name}
            </Badge>
          )}
        </div>

        {/* Statistiques améliorées */}
        <div className="grid grid-cols-3 gap-4">
          {content.estimatedReadTime && (
            <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div className="text-sm">
                <div className="font-medium text-blue-800">{content.estimatedReadTime} min</div>
                <div className="text-xs text-blue-600">Lecture</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 bg-purple-50 rounded-lg p-2">
            <Eye className="h-4 w-4 text-purple-600" />
            <div className="text-sm">
              <div className="font-medium text-purple-800">{content.viewCount || 0}</div>
              <div className="text-xs text-purple-600">Vues</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-pink-50 rounded-lg p-2">
            <Heart className="h-4 w-4 text-pink-600" />
            <div className="text-sm">
              <div className="font-medium text-pink-800">{content.likeCount || 0}</div>
              <div className="text-xs text-pink-600">J'aime</div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {content.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {content.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{content.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Bouton de lecture */}
        <div className="border-2 border-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={onRead}
            className="w-full p-4 text-left transition-all duration-200 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-100 hover:to-purple-100 text-gray-700 hover:text-blue-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span className="font-medium">
                  📖 Lire l'article complet
                </span>
              </div>
              <ExternalLink className="h-4 w-4 text-blue-600" />
            </div>
          </button>
        </div>

        {/* Actions modernisées */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={onLike}
              className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                isLiked 
                  ? 'bg-pink-100 text-pink-700 hover:bg-pink-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-700'
              }`}
            >
              <Heart className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                isLiked ? 'fill-current' : ''
              }`} />
              <span className="text-sm font-medium">J'aime</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onBookmark}
              className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                isBookmarked 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700'
              }`}
            >
              <Bookmark className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                isBookmarked ? 'fill-current' : ''
              }`} />
              <span className="text-sm font-medium">Sauvegarder</span>
            </Button>
          </div>
          
          <Button
            onClick={onComplete}
            disabled={isCompleted}
            size="sm"
            className={`flex items-center gap-1 px-3 py-2 rounded-full font-medium transition-all duration-200 text-xs ${
              isCompleted 
                ? 'bg-green-600 text-white cursor-default shadow-lg'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                ✅ Lu
              </>
            ) : (
              <>
                <Timer className="h-3 w-3" />
                Marquer comme lu
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EducationNew() {
  // Navigation
  const [, setLocation] = useLocation();
  
  // États pour la navigation et filtres
  const [activeTab, setActiveTab] = useState("explore");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // États pour l'interaction utilisateur
  const [completedContents, setCompletedContents] = useState<string[]>([]);
  const [likedContents, setLikedContents] = useState<string[]>([]);
  const [bookmarkedContents, setBookmarkedContents] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // Récupération des catégories
  const { data: categories = [], isLoading: isLoadingCategories, error: categoriesError, refetch: refetchCategories } = useQuery<ContentCategory[]>({
    queryKey: ['content-categories'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/content-categories');
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data.filter(cat => cat.isActive !== false) : [];
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Récupération du contenu éducationnel
  const { data: contents = [], isLoading: isLoadingContents, error, refetch: refetchContents } = useQuery<EducationalContent[]>({
    queryKey: ['educational-contents', selectedCategory, difficultyFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append('status', 'published');
        if (selectedCategory && selectedCategory !== "all") params.append('categoryId', selectedCategory);
        if (difficultyFilter && difficultyFilter !== "all") params.append('difficulty', difficultyFilter);
        
        const response = await apiRequest('GET', `/api/educational-contents?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Erreur lors de la récupération du contenu éducationnel:', error);
        throw error;
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
    enabled: true, // Toujours activer, même si pas de catégories
  });

  // Ne pas sélectionner automatiquement une catégorie pour afficher tous les contenus initialement
  // L'utilisateur peut choisir manuellement la catégorie qu'il souhaite explorer

  // Mutations pour les interactions
  const likeMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await apiRequest('POST', `/api/educational-contents/${contentId}/like`);
      return response.json();
    },
    onSuccess: (_, contentId) => {
      setLikedContents(prev => 
        prev.includes(contentId) 
          ? prev.filter(id => id !== contentId)
          : [...prev, contentId]
      );
      queryClient.invalidateQueries({ queryKey: ['educational-contents'] });
    }
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await apiRequest('POST', `/api/educational-contents/${contentId}/bookmark`);
      return response.json();
    },
    onSuccess: (_, contentId) => {
      setBookmarkedContents(prev => 
        prev.includes(contentId) 
          ? prev.filter(id => id !== contentId)
          : [...prev, contentId]
      );
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await apiRequest('POST', `/api/educational-contents/${contentId}/complete`);
      return response.json();
    },
    onSuccess: (_, contentId) => {
      setCompletedContents(prev => [...prev, contentId]);
      queryClient.invalidateQueries({ queryKey: ['educational-contents'] });
    }
  });

  // Fonctions de filtrage et tri améliorées
  const filteredContents = contents
    .filter(content => {
      if (searchTerm && !content.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !content.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !content.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Prioriser les contenus recommandés d'abord, puis appliquer le tri secondaire
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popular':
          return (b.viewCount || 0) - (a.viewCount || 0);
        case 'recommended':
          return (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0);
        case 'shortest':
          return (a.estimatedReadTime || 0) - (b.estimatedReadTime || 0);
        case 'difficulty':
          const difficultyOrder = { easy: 1, intermediate: 2, advanced: 3 };
          return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
        case 'alphabetical':
          return a.title.localeCompare(b.title, 'fr');
        default:
          // Tri par défaut : recommandés d'abord, puis par ordre de difficulté, puis par titre
          const defaultDifficultyOrder = { easy: 1, intermediate: 2, advanced: 3 };
          const aDiff = defaultDifficultyOrder[a.difficulty] || 0;
          const bDiff = defaultDifficultyOrder[b.difficulty] || 0;
          if (aDiff !== bDiff) return aDiff - bDiff;
          return a.title.localeCompare(b.title, 'fr');
      }
    });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'audio': return <Volume2 className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('addiction') || name.includes('dépendance')) return Brain;
    if (name.includes('relaxation') || name.includes('détente')) return Shield;
    if (name.includes('motivation') || name.includes('énergie')) return Zap;
    if (name.includes('technique') || name.includes('méthode')) return Target;
    return Lightbulb;
  };

  // Statistiques calculées
  const stats: ContentStats = {
    totalContents: contents.length,
    completedContents: completedContents.length,
    likedContents: likedContents.length,
    bookmarkedContents: bookmarkedContents.length,
    totalReadTime: completedContents.reduce((acc, id) => {
      const content = contents.find(c => c.id === id);
      return acc + (content?.estimatedReadTime || 0);
    }, 0),
    currentStreak: 3 // Placeholder - à calculer selon les dates réelles
  };

  if (isLoadingCategories || isLoadingContents) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement de votre espace éducatif...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || categoriesError) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="text-center py-12">
            <div className="mb-4">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">Erreur de chargement</h2>
              <p className="text-muted-foreground mb-6">
                {categoriesError ? 
                  "Impossible de charger les catégories de contenu. Cela peut indiquer un problème de configuration." :
                  "Impossible de charger le contenu éducatif. Veuillez réessayer."
                }
              </p>
              <div className="space-y-2">
                <Button onClick={() => window.location.reload()}>
                  Réessayer
                </Button>
                {(categoriesError || (categories.length === 0 && !isLoadingCategories)) && (
                  <p className="text-sm text-muted-foreground">
                    Si le problème persiste, contactez l'administrateur.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        
        {/* En-tête modernisé */}
        <section className="mb-10">
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 border border-blue-100 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl text-white shadow-lg transform rotate-3">
                    <BookOpen className="h-10 w-10" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
                      🎓 Bibliothèque Pédagogique
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      🌱 Découvrez des ressources adaptées pour votre parcours de guérison et d'apprentissage
                    </p>
                  </div>
                </div>
                
                {/* Statistiques rapides */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 bg-white/70 rounded-full px-3 py-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">{contents.length} contenus disponibles</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/70 rounded-full px-3 py-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">{completedContents.length} terminés</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/70 rounded-full px-3 py-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-800">{categories.length} catégories</span>
                  </div>
                </div>
              </div>
              
              {/* Contrôles d'affichage améliorés */}
              <div className="flex items-center gap-3">
                <div className="bg-white/80 rounded-xl p-1 shadow-sm border border-white/50">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-lg transition-all duration-200 ${
                      viewMode === "grid" 
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'hover:bg-blue-50 text-gray-600'
                    }`}
                  >
                    <Grid3x3 className="h-4 w-4 mr-2" />
                    Grille
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`rounded-lg transition-all duration-200 ${
                      viewMode === "list" 
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'hover:bg-blue-50 text-gray-600'
                    }`}
                  >
                    <List className="h-4 w-4 mr-2" />
                    Liste
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          // Actualiser le contenu lors du changement d'onglet
          if (value === "explore" || value === "dashboard") {
            refetchContents();
            refetchCategories();
          }
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="explore" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Explorer
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Mes Ressources
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ma Progression
            </TabsTrigger>
          </TabsList>

          {/* Onglet Tableau de Bord */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Statistiques de progression */}
            <section>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Votre Progression
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Contenus Complétés</p>
                        <p className="text-3xl font-bold text-blue-700">{stats.completedContents}</p>
                        <p className="text-xs text-blue-500">sur {stats.totalContents} disponibles</p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Temps de Lecture</p>
                        <p className="text-3xl font-bold text-green-700">{stats.totalReadTime}</p>
                        <p className="text-xs text-green-500">minutes au total</p>
                      </div>
                      <Clock className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Contenus Aimés</p>
                        <p className="text-3xl font-bold text-purple-700">{stats.likedContents}</p>
                        <p className="text-xs text-purple-500">évaluations positives</p>
                      </div>
                      <Heart className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600">Série Actuelle</p>
                        <p className="text-3xl font-bold text-orange-700">{stats.currentStreak}</p>
                        <p className="text-xs text-orange-500">jours consécutifs</p>
                      </div>
                      <Award className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progression par catégorie */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Progression par Catégorie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.sort((a, b) => a.order - b.order).map((category) => {
                      const categoryContents = contents.filter(c => c.categoryId === category.id);
                      const completed = categoryContents.filter(c => completedContents.includes(c.id)).length;
                      const progress = categoryContents.length > 0 ? (completed / categoryContents.length) * 100 : 0;
                      const IconComponent = getCategoryIcon(category.name);
                      
                      return (
                        <div key={category.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{category.name}</h4>
                              <span className="text-sm text-muted-foreground">
                                {completed}/{categoryContents.length}
                              </span>
                            </div>
                            <div className="w-full bg-background rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-primary">
                            {Math.round(progress)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Contenus recommandés */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Recommandés pour Vous
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contents
                      .filter(content => content.isRecommended && !completedContents.includes(content.id))
                      .slice(0, 4)
                      .map((content) => (
                        <div key={content.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            {getTypeIcon(content.type)}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{content.title}</h5>
                            <p className="text-xs text-muted-foreground">
                              {content.estimatedReadTime} min • {categories.find(c => c.id === content.categoryId)?.name}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => setActiveTab("explore")}>
                            Lire
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Onglet Explorer */}
          <TabsContent value="explore" className="space-y-8">
            {/* Filtres et recherche */}
            <section>
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher un contenu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les catégories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les niveaux" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les niveaux</SelectItem>
                        <SelectItem value="easy">Facile</SelectItem>
                        <SelectItem value="intermediate">Intermédiaire</SelectItem>
                        <SelectItem value="advanced">Avancé</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Trier par..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Ordre recommandé</SelectItem>
                        <SelectItem value="difficulty">Par difficulté</SelectItem>
                        <SelectItem value="alphabetical">Alphabétique</SelectItem>
                        <SelectItem value="newest">Plus récents</SelectItem>
                        <SelectItem value="popular">Plus populaires</SelectItem>
                        <SelectItem value="shortest">Plus courts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Catégories rapides avec progression */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {categories.sort((a, b) => a.order - b.order).map((category) => {
                  const IconComponent = getCategoryIcon(category.name);
                  const categoryContents = contents.filter(c => c.categoryId === category.id);
                  const completedInCategory = categoryContents.filter(c => completedContents.includes(c.id)).length;
                  const progressPercentage = categoryContents.length > 0 ? (completedInCategory / categoryContents.length) * 100 : 0;
                  
                  return (
                    <Card
                      key={category.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedCategory === category.id ? 'border-primary shadow-md' : 'border-border'
                      }`}
                      onClick={() => setSelectedCategory(category.id === selectedCategory ? "all" : category.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{category.name}</h4>
                            <p className="text-xs text-muted-foreground">{categoryContents.length} contenus</p>
                          </div>
                        </div>
                        
                        {/* Barre de progression */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="font-medium">{Math.round(progressPercentage)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Badges d'information */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          <Badge variant="secondary" className="text-xs">
                            {completedInCategory}/{categoryContents.length}
                          </Badge>
                          {categoryContents.some(c => c.isRecommended) && (
                            <Badge className="text-xs bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Recommandé
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Liste des contenus avec organisation améliorée */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold">
                    {selectedCategory && selectedCategory !== "all"
                      ? `${categories.find(c => c.id === selectedCategory)?.name}`
                      : `Tous les contenus`
                    }
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredContents.length} contenu{filteredContents.length !== 1 ? 's' : ''} disponible{filteredContents.length !== 1 ? 's' : ''}
                    {selectedCategory && selectedCategory !== "all" && (
                      <span className="ml-2">
                        • {categories.find(c => c.id === selectedCategory)?.description}
                      </span>
                    )}
                  </p>
                </div>
                
                {/* Résumé rapide des niveaux disponibles */}
                {filteredContents.length > 0 && (
                  <div className="flex gap-2">
                    {['easy', 'intermediate', 'advanced'].map(level => {
                      const count = filteredContents.filter(c => c.difficulty === level).length;
                      if (count === 0) return null;
                      return (
                        <Badge key={level} className={getDifficultyColor(level)} variant="outline">
                          {level === 'easy' ? 'Facile' : level === 'intermediate' ? 'Inter.' : 'Avancé'} ({count})
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              {filteredContents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium text-foreground mb-2">Aucun contenu trouvé</h3>
                    <p className="text-muted-foreground mb-6">
                      {contents.length === 0 
                        ? "Aucun contenu éducatif n'a encore été créé par les administrateurs."
                        : "Essayez de modifier vos filtres pour voir plus de contenus."
                      }
                    </p>
                    {selectedCategory && selectedCategory !== "all" && (
                      <Button onClick={() => setSelectedCategory("all")}>
                        Voir tous les contenus
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {/* Organisation par niveau de difficulté quand une catégorie spécifique est sélectionnée */}
                  {selectedCategory !== "all" && selectedCategory ? (
                    ['easy', 'intermediate', 'advanced'].map(difficulty => {
                      const contentsForDifficulty = filteredContents.filter(c => c.difficulty === difficulty);
                      if (contentsForDifficulty.length === 0) return null;
                      
                      return (
                        <div key={difficulty} className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Badge className={getDifficultyColor(difficulty)}>
                              {difficulty === 'easy' ? 'Niveau Facile' : 
                               difficulty === 'intermediate' ? 'Niveau Intermédiaire' : 'Niveau Avancé'}
                            </Badge>
                            <div className="h-px bg-border flex-1" />
                            <span className="text-sm text-muted-foreground">
                              {contentsForDifficulty.length} contenu{contentsForDifficulty.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          <div className={viewMode === "grid" 
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                            : "space-y-4"
                          }>
                            {contentsForDifficulty.map((content) => {
                              const isCompleted = completedContents.includes(content.id);
                              const isLiked = likedContents.includes(content.id);
                              const isBookmarked = bookmarkedContents.includes(content.id);
                              const category = categories.find(c => c.id === content.categoryId);

                              return (
                                <ContentCard 
                                  key={content.id} 
                                  content={content} 
                                  isCompleted={isCompleted}
                                  isLiked={isLiked} 
                                  isBookmarked={isBookmarked}
                                  category={category}
                                  onLike={() => likeMutation.mutate(content.id)}
                                  onBookmark={() => bookmarkMutation.mutate(content.id)}
                                  onComplete={() => completeMutation.mutate(content.id)}
                                  onRead={() => setLocation(`/content/${content.id}`)}
                                  getTypeIcon={getTypeIcon}
                                  getDifficultyColor={getDifficultyColor}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Vue globale sans regroupement par difficulté */
                    <div className={viewMode === "grid" 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                      : "space-y-4"
                    }>
                      {filteredContents.map((content) => {
                        const isCompleted = completedContents.includes(content.id);
                        const isLiked = likedContents.includes(content.id);
                        const isBookmarked = bookmarkedContents.includes(content.id);
                        const category = categories.find(c => c.id === content.categoryId);

                        return (
                          <ContentCard 
                            key={content.id} 
                            content={content} 
                            isCompleted={isCompleted}
                            isLiked={isLiked} 
                            isBookmarked={isBookmarked}
                            category={category}
                            onLike={() => likeMutation.mutate(content.id)}
                            onBookmark={() => bookmarkMutation.mutate(content.id)}
                            onComplete={() => completeMutation.mutate(content.id)}
                            onRead={() => setLocation(`/content/${content.id}`)}
                            getTypeIcon={getTypeIcon}
                            getDifficultyColor={getDifficultyColor}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>
          </TabsContent>

          {/* Onglet Favoris */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5" />
                  Vos Contenus Favoris
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookmarkedContents.length === 0 ? (
                  <div className="text-center py-8">
                    <Bookmark className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun contenu ajouté aux favoris.</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setActiveTab("explore")}
                    >
                      Explorer les contenus
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contents
                      .filter(content => bookmarkedContents.includes(content.id))
                      .map((content) => (
                        <div key={content.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {getTypeIcon(content.type)}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">{content.title}</h5>
                            <p className="text-sm text-muted-foreground">
                              {content.estimatedReadTime} min
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => setActiveTab("explore")}>
                            Lire
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Complétés */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Contenus Complétés
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedContents.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun contenu complété pour le moment.</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setActiveTab("explore")}
                    >
                      Commencer à apprendre
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contents
                      .filter(content => completedContents.includes(content.id))
                      .map((content) => (
                        <div key={content.id} className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                          <div className="flex-1">
                            <h5 className="font-medium">{content.title}</h5>
                            <p className="text-sm text-muted-foreground">
                              Complété • {content.estimatedReadTime} min de lecture
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Terminé</Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ressources rapides d'urgence */}
        <section className="mt-12">
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-4 flex items-center gap-2 text-red-700">
                <Shield className="h-6 w-6" />
                Ressources d'Urgence
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/80 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-red-600">En Cas de Craving Intense</h4>
                  <p className="text-sm text-red-700/80">
                    Rappelez-vous : les cravings sont temporaires et diminuent naturellement.
                  </p>
                </div>
                <div className="bg-white/80 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-orange-600">Technique STOP</h4>
                  <p className="text-sm text-orange-700/80">
                    Stop, Take a breath, Observe, Proceed mindfully.
                  </p>
                </div>
                <div className="bg-white/80 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-red-600">Aide Professionnelle</h4>
                  <p className="text-sm text-red-700/80">
                    En cas de détresse, contactez immédiatement un professionnel de santé.
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