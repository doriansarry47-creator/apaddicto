import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, 
  Video, 
  Headphones, 
  FileText, 
  Image as ImageIcon,
  Plus,
  Search,
  Filter,
  Eye,
  Heart,
  Bookmark,
  Edit,
  Trash2,
  Save,
  X,
  Star,
  Calendar,
  Clock,
  Tag,
  Folder,
  Settings,
  Download,
  Upload,
  Link,
  Youtube,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import MarkdownEditor from "@/components/ui/markdown-editor";

interface EducationalContent {
  id: string;
  title: string;
  description?: string;
  type: 'text' | 'video' | 'audio' | 'pdf' | 'image';
  categoryId?: string;
  tags: string[];
  mediaUrl?: string;
  mediaType?: string;
  content: string;
  difficulty: 'easy' | 'intermediate' | 'advanced';
  estimatedReadTime?: number;
  status: 'draft' | 'published' | 'archived';
  isRecommended: boolean;
  viewCount: number;
  likeCount: number;
  thumbnailUrl?: string;
  authorId?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContentCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

interface ContentTag {
  id: string;
  name: string;
  description?: string;
  color: string;
  usageCount: number;
}

export default function EducationalContentAdmin() {
  const [contents, setContents] = useState<EducationalContent[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [tags, setTags] = useState<ContentTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<EducationalContent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Form state for creating/editing content
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "text" as EducationalContent['type'],
    categoryId: "",
    tags: [] as string[],
    mediaUrl: "",
    mediaType: "external_link" as string,
    content: "",
    difficulty: "easy" as EducationalContent['difficulty'],
    estimatedReadTime: "",
    status: "draft" as EducationalContent['status'],
    isRecommended: false,
    thumbnailUrl: ""
  });

  // Category and Tag form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    color: "blue",
    icon: ""
  });

  const [tagForm, setTagForm] = useState({
    name: "",
    description: ""
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contentsRes, categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/educational-contents', { credentials: 'include' }),
        fetch('/api/content-categories', { credentials: 'include' }),
        fetch('/api/content-tags', { credentials: 'include' })
      ]);

      if (contentsRes.ok) {
        const contentsData = await contentsRes.json();
        setContents(contentsData);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setTags(tagsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saving) return; // Prévenir les soumissions multiples
    
    try {
      setSaving(true);
      setSaveMessage("💾 Sauvegarde en cours...");
      
      // Validation côté client
      if (!form.title.trim()) {
        setSaveMessage("❌ Le titre est obligatoire");
        setTimeout(() => setSaveMessage(""), 3000);
        return;
      }
      
      if (!form.content.trim()) {
        setSaveMessage("❌ Le contenu est obligatoire");
        setTimeout(() => setSaveMessage(""), 3000);
        return;
      }
      
      const contentData = {
        ...form,
        estimatedReadTime: form.estimatedReadTime ? parseInt(form.estimatedReadTime) : null,
        tags: form.tags.filter(tag => tag.trim().length > 0) // Nettoyer les tags vides
      };

      const url = editingContent 
        ? `/api/educational-contents/${editingContent.id}`
        : '/api/educational-contents';
      
      const method = editingContent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(contentData)
      });

      if (response.ok) {
        const savedContent = await response.json();
        setSaveMessage(editingContent ? "✅ Contenu mis à jour avec succès !" : "✨ Contenu créé avec succès !");
        
        // Recharger les données
        await loadData();
        
        // Afficher le message de succès pendant 2 secondes
        setTimeout(() => {
          setSaveMessage("");
          resetForm();
        }, 2000);
      } else {
        const error = await response.json();
        setSaveMessage(`❌ Erreur: ${error.message}`);
        setTimeout(() => setSaveMessage(""), 5000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSaveMessage("❌ Erreur de connexion lors de la sauvegarde");
      setTimeout(() => setSaveMessage(""), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (content: EducationalContent) => {
    setEditingContent(content);
    setForm({
      title: content.title,
      description: content.description || "",
      type: content.type,
      categoryId: content.categoryId || "",
      tags: content.tags || [],
      mediaUrl: content.mediaUrl || "",
      mediaType: content.mediaType || "",
      content: content.content,
      difficulty: content.difficulty,
      estimatedReadTime: content.estimatedReadTime?.toString() || "",
      status: content.status,
      isRecommended: content.isRecommended,
      thumbnailUrl: content.thumbnailUrl || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return;

    try {
      const response = await fetch(`/api/educational-contents/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await loadData();
        alert('Contenu supprimé avec succès');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      type: "text",
      categoryId: "",
      tags: [],
      mediaUrl: "",
      mediaType: "external_link",
      content: "",
      difficulty: "easy",
      estimatedReadTime: "",
      status: "draft",
      isRecommended: false,
      thumbnailUrl: ""
    });
    setEditingContent(null);
    setShowForm(false);
  };

  // Category management functions
  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) return;

    try {
      const response = await fetch('/api/content-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        setCategoryForm({ name: "", description: "", color: "blue", icon: "" });
        await loadData();
        alert('Catégorie créée avec succès!');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Erreur lors de la création de la catégorie');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      const response = await fetch(`/api/content-categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await loadData();
        alert('Catégorie supprimée avec succès');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Erreur lors de la suppression de la catégorie');
    }
  };

  // Tag management functions
  const handleCreateTag = async () => {
    if (!tagForm.name.trim()) return;

    try {
      const response = await fetch('/api/content-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(tagForm)
      });

      if (response.ok) {
        setTagForm({ name: "", description: "" });
        await loadData();
        alert('Tag créé avec succès!');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Erreur lors de la création du tag');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Headphones className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-orange-100 text-orange-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter contents based on search and filters
  const filteredContents = contents.filter(content => {
    if (searchTerm && !content.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !content.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterType && filterType !== "all" && content.type !== filterType) return false;
    if (filterCategory && filterCategory !== "all" && content.categoryId !== filterCategory) return false;
    if (filterStatus && filterStatus !== "all" && content.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Contenus Éducatifs</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Contenu
        </Button>
      </div>

      <Tabs defaultValue="contents" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contents">Contenus ({contents.length})</TabsTrigger>
          <TabsTrigger value="categories">Catégories ({categories.length})</TabsTrigger>
          <TabsTrigger value="tags">Tags ({tags.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="contents">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un contenu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de contenu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="text">Texte</SelectItem>
                    <SelectItem value="video">Vidéo</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
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
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Content List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content) => (
              <Card key={content.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(content.type)}
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{content.title}</CardTitle>
                        {content.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {content.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {content.isRecommended && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusBadgeColor(content.status)}>
                        {content.status}
                      </Badge>
                      <Badge className={getDifficultyColor(content.difficulty)}>
                        {content.difficulty}
                      </Badge>
                      {content.categoryId && (
                        <Badge variant="outline">
                          {categories.find(c => c.id === content.categoryId)?.name}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {content.viewCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {content.likeCount}
                      </div>
                      {content.estimatedReadTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {content.estimatedReadTime}min
                        </div>
                      )}
                    </div>

                    {content.tags.length > 0 && (
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

                    <div className="flex justify-between items-center pt-3 border-t">
                      <div className="text-xs text-gray-400">
                        {new Date(content.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(content)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(content.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredContents.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Aucun contenu trouvé</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <div className="space-y-6">
            {/* New Category Form */}
            <Card>
              <CardHeader>
                <CardTitle>Nouvelle Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input 
                    placeholder="Nom de la catégorie" 
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  />
                  <Input 
                    placeholder="Description" 
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  />
                  <Select value={categoryForm.color} onValueChange={(value) => setCategoryForm({...categoryForm, color: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Couleur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Bleu</SelectItem>
                      <SelectItem value="green">Vert</SelectItem>
                      <SelectItem value="red">Rouge</SelectItem>
                      <SelectItem value="purple">Violet</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="yellow">Jaune</SelectItem>
                      <SelectItem value="pink">Rose</SelectItem>
                      <SelectItem value="gray">Gris</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleCreateCategory} disabled={!categoryForm.name.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Categories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0 hover:bg-red-50"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={`bg-${category.color}-100 text-${category.color}-800`}>
                        {category.color}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        Ordre: {category.order}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {categories.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Folder className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Aucune catégorie créée</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tags">
          <div className="space-y-6">
            {/* New Tag Form */}
            <Card>
              <CardHeader>
                <CardTitle>Nouveau Tag</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input 
                    placeholder="Nom du tag" 
                    value={tagForm.name}
                    onChange={(e) => setTagForm({...tagForm, name: e.target.value})}
                  />
                  <Input 
                    placeholder="Description (optionnelle)" 
                    value={tagForm.description}
                    onChange={(e) => setTagForm({...tagForm, description: e.target.value})}
                  />
                  <Button onClick={handleCreateTag} disabled={!tagForm.name.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tags List */}
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <div 
                  key={tag.id} 
                  className="group relative bg-white border rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {tag.name}
                    </Badge>
                    <span className="text-xs text-gray-500">({tag.usageCount})</span>
                  </div>
                  {tag.description && (
                    <p className="text-xs text-gray-600 mb-2">{tag.description}</p>
                  )}
                  <div className="hidden group-hover:flex absolute top-1 right-1 gap-1">
                    <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                      <Edit className="h-2 w-2" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 w-6 p-0 hover:bg-red-50">
                      <Trash2 className="h-2 w-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {tags.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Aucun tag créé</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {editingContent ? 'Modifier le contenu' : 'Nouveau contenu éducatif'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Section Informations de base */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-3 text-gray-700">📝 Informations de base</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="title" className="text-xs">Titre *</Label>
                      <Input
                        id="title"
                        value={form.title}
                        onChange={(e) => setForm({...form, title: e.target.value})}
                        placeholder="Titre du contenu"
                        className="h-9"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type" className="text-xs">Type de contenu *</Label>
                      <Select value={form.type} onValueChange={(value) => setForm({...form, type: value as any})}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">📄 Texte</SelectItem>
                          <SelectItem value="video">🎥 Vidéo</SelectItem>
                          <SelectItem value="audio">🎵 Audio</SelectItem>
                          <SelectItem value="pdf">📋 PDF</SelectItem>
                          <SelectItem value="image">🖼️ Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Label htmlFor="description" className="text-xs">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({...form, description: e.target.value})}
                      placeholder="Description courte du contenu"
                      className="h-20 resize-none"
                    />
                  </div>
                </div>

                {/* Section Classification */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-3 text-blue-700">🏷️ Classification et Métadonnées</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="categoryId" className="text-xs font-medium text-blue-600">Catégorie *</Label>
                      <Select value={form.categoryId} onValueChange={(value) => setForm({...form, categoryId: value})}>
                        <SelectTrigger className="h-9 bg-white">
                          <SelectValue placeholder="📁 Choisir une catégorie..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              📂 {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="difficulty" className="text-xs">Difficulté</Label>
                      <Select value={form.difficulty} onValueChange={(value) => setForm({...form, difficulty: value as any})}>
                        <SelectTrigger className="h-9 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">🟢 Facile</SelectItem>
                          <SelectItem value="intermediate">🟡 Intermédiaire</SelectItem>
                          <SelectItem value="advanced">🔴 Avancé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="estimatedReadTime" className="text-xs">Temps lecture (min)</Label>
                      <Input
                        id="estimatedReadTime"
                        type="number"
                        value={form.estimatedReadTime}
                        onChange={(e) => setForm({...form, estimatedReadTime: e.target.value})}
                        placeholder="10"
                        className="h-9"
                        min="1"
                        max="180"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Médias (pliable) */}
                <details className="bg-purple-50 rounded-lg">
                  <summary className="p-4 cursor-pointer text-sm font-medium text-purple-700 hover:bg-purple-100 rounded-lg">🎬 Médias et ressources (optionnel)</summary>
                  <div className="p-4 pt-0 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="mediaUrl" className="text-xs">URL du média</Label>
                        <Input
                          id="mediaUrl"
                          value={form.mediaUrl}
                          onChange={(e) => setForm({...form, mediaUrl: e.target.value})}
                          placeholder="https://example.com/media.mp4"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="mediaType" className="text-xs">Type de média</Label>
                        <Select value={form.mediaType} onValueChange={(value) => setForm({...form, mediaType: value})}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Type de média" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="external_link">🔗 Lien externe</SelectItem>
                            <SelectItem value="youtube">📺 YouTube</SelectItem>
                            <SelectItem value="vimeo">🎬 Vimeo</SelectItem>
                            <SelectItem value="upload">📁 Fichier uploadé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="thumbnailUrl" className="text-xs">URL de la miniature</Label>
                      <Input
                        id="thumbnailUrl"
                        value={form.thumbnailUrl}
                        onChange={(e) => setForm({...form, thumbnailUrl: e.target.value})}
                        placeholder="https://example.com/thumb.jpg"
                        className="h-9"
                      />
                    </div>
                  </div>
                </details>

                {/* Section Tags */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-3 text-green-700">🏷️ Tags et mots-clés</h3>
                  <div>
                    <Label htmlFor="tags" className="text-xs">Tags (séparés par des virgules)</Label>
                    <Input
                      id="tags"
                      value={form.tags.join(', ')}
                      onChange={(e) => {
                        const tagList = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                        setForm({...form, tags: tagList});
                      }}
                      placeholder="addiction, motivation, relaxation, gestion-stress"
                      className="h-9"
                    />
                    <p className="text-xs text-green-600 mt-1">
                      💡 Suggestions: addiction, motivation, relaxation, gestion-stress, prévention, exercices
                    </p>
                  </div>
                </div>

                {/* Section Contenu principal avec Markdown */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-3 text-yellow-700 flex items-center gap-2">
                    📝 Contenu principal
                    <Badge variant="secondary" className="text-xs bg-yellow-200 text-yellow-800">
                      Markdown activé
                    </Badge>
                  </h3>
                  <div>
                    <Label htmlFor="content" className="text-xs font-medium">Contenu détaillé *</Label>
                    <MarkdownEditor
                      value={form.content}
                      onChange={(value) => setForm({...form, content: value})}
                      placeholder="Rédigez ici votre contenu éducatif...

# Exemple de structure

## Introduction
Commencez par présenter le sujet de manière claire et engageante.

## Points clés
- **Point important** : Explication détaillée
- *Conseil pratique* : Ajoutez des exemples concrets
- [Ressource utile](https://example.com) : Liens vers des informations supplémentaires

## Conclusion
Résumez les points essentiels et donnez des pistes d'action."
                      minHeight="min-h-[400px]"
                    />
                  </div>
                </div>

                {/* Section Publication */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-3 text-red-700">🚀 Publication et visibilité</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status" className="text-xs font-medium">Statut de publication</Label>
                      <Select value={form.status} onValueChange={(value) => setForm({...form, status: value as any})}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">📝 Brouillon (non visible)</SelectItem>
                          <SelectItem value="published">✅ Publié (visible patients)</SelectItem>
                          <SelectItem value="archived">📦 Archivé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="isRecommended"
                        checked={form.isRecommended}
                        onCheckedChange={(checked) => setForm({...form, isRecommended: checked})}
                      />
                      <Label htmlFor="isRecommended" className="text-xs font-medium">⭐ Contenu recommandé</Label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-white border-t-2 border-gray-200 p-6 flex justify-between items-center shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600">
                      {editingContent ? '✏️ Modification en cours' : '✨ Nouveau contenu'}
                    </div>
                    {saving && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <span className="text-sm">Sauvegarde...</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm} 
                      disabled={saving}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saving || !form.title.trim() || !form.content.trim()}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? 'Sauvegarde...' : (editingContent ? '💾 Mettre à jour' : '✨ Créer le contenu')}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}