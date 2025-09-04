import MobileHeader from "@/components/layout/mobile-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { JournalEntry } from "@shared/schema";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Calendar } from "lucide-react";

export default function Journal() {
  const [newEntry, setNewEntry] = useState("");
  const [newMood, setNewMood] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewEntry, setShowNewEntry] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch journal entries
  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal'],
  });

  // Create entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (data: { content: string; mood?: number }) => {
      return await apiRequest("POST", "/api/journal", data);
    },
    onSuccess: () => {
      toast({
        title: "Entrée sauvegardée",
        description: "Votre journal a été mis à jour.",
      });
      setNewEntry("");
      setNewMood(5);
      setShowNewEntry(false);
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'entrée.",
        variant: "destructive",
      });
    }
  });

  const handleSaveEntry = () => {
    if (newEntry.trim()) {
      createEntryMutation.mutate({
        content: newEntry.trim(),
        mood: newMood,
      });
    }
  };

  // Filter entries
  const filteredEntries = entries?.filter((entry) =>
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return 'text-red-500';
    if (mood <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return '😢';
    if (mood <= 4) return '😞';
    if (mood <= 6) return '😐';
    if (mood <= 8) return '🙂';
    return '😊';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      
      <main className="max-w-md mx-auto bg-white min-h-screen pb-24">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800" data-testid="text-journal-title">
              Journal
            </h1>
            <Button
              onClick={() => setShowNewEntry(true)}
              className="bg-primary-500 hover:bg-primary-600"
              size="sm"
              data-testid="button-new-entry"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nouvelle entrée
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher dans le journal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-journal"
            />
          </div>
        </div>

        {/* New Entry Form */}
        {showNewEntry && (
          <div className="p-4 border-b border-gray-100 bg-primary-50">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3" data-testid="text-new-entry-title">
                  Nouvelle entrée
                </h3>
                
                {/* Mood Slider */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Humeur (1-10)
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newMood}
                      onChange={(e) => setNewMood(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer intensity-slider"
                      data-testid="slider-mood"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1</span>
                      <span className="font-medium flex items-center">
                        {newMood} {getMoodEmoji(newMood)}
                      </span>
                      <span>10</span>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <Textarea
                  placeholder="Décrivez comment vous vous sentez, vos pensées, vos défis ou vos victoires du jour..."
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  rows={4}
                  className="mb-4"
                  data-testid="textarea-new-entry-content"
                />
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewEntry(false)}
                    className="flex-1"
                    data-testid="button-cancel-entry"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSaveEntry}
                    disabled={!newEntry.trim() || createEntryMutation.isPending}
                    className="flex-1 bg-primary-500 hover:bg-primary-600"
                    data-testid="button-save-entry"
                  >
                    {createEntryMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Journal Entries */}
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse" />
              ))}
            </div>
          ) : filteredEntries.length > 0 ? (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow" data-testid={`card-journal-entry-${entry.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span data-testid={`text-entry-date-${entry.id}`}>
                          {formatDate(entry.timestamp!.toString())}
                        </span>
                      </div>
                      {entry.mood && (
                        <div className={`text-sm font-medium ${getMoodColor(entry.mood)}`} data-testid={`text-entry-mood-${entry.id}`}>
                          {getMoodEmoji(entry.mood)} {entry.mood}/10
                        </div>
                      )}
                    </div>
                    
                    <div className="text-gray-700 whitespace-pre-wrap" data-testid={`text-entry-content-${entry.id}`}>
                      {entry.content}
                    </div>
                    
                    {entry.tags && Array.isArray(entry.tags) && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {entry.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                            data-testid={`tag-${tag}-${entry.id}`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8" data-testid="text-no-entries">
              <div className="text-gray-400 mb-4">
                <i className="fas fa-book-open text-6xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {searchTerm ? "Aucune entrée trouvée" : "Votre journal est vide"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm 
                  ? "Essayez un autre terme de recherche" 
                  : "Commencez par écrire votre première entrée"
                }
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setShowNewEntry(true)}
                  className="bg-primary-500 hover:bg-primary-600"
                  data-testid="button-create-first-entry"
                >
                  Créer ma première entrée
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
