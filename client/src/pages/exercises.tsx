import MobileHeader from "@/components/layout/mobile-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import ExerciseCard from "@/components/exercise-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Exercise } from "@shared/schema";
import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { EXERCISE_TYPES, DIFFICULTY_LEVELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Exercises() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const { data: exercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ['/api/exercises'],
  });

  // Filter exercises
  const filteredExercises = exercises?.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || exercise.type === selectedType;
    const matchesDifficulty = selectedDifficulty === "all" || exercise.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesType && matchesDifficulty;
  }) || [];

  const emergencyExercises = filteredExercises.filter(ex => ex.isEmergency);
  const regularExercises = filteredExercises.filter(ex => !ex.isEmergency);

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      
      <main className="max-w-md mx-auto bg-white min-h-screen pb-24">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800 mb-4" data-testid="text-exercises-title">
            Exercices
          </h1>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un exercice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-exercises"
            />
          </div>
          
          {/* Filters */}
          <div className="space-y-3">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'exercice
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={selectedType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("all")}
                  data-testid="filter-type-all"
                >
                  Tous
                </Button>
                {EXERCISE_TYPES.map((type) => (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type.id)}
                    className="whitespace-nowrap"
                    data-testid={`filter-type-${type.id}`}
                  >
                    {type.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau
              </label>
              <div className="flex gap-2">
                <Button
                  variant={selectedDifficulty === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty("all")}
                  data-testid="filter-difficulty-all"
                >
                  Tous
                </Button>
                {DIFFICULTY_LEVELS.map((level) => (
                  <Button
                    key={level.id}
                    variant={selectedDifficulty === level.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDifficulty(level.id)}
                    data-testid={`filter-difficulty-${level.id}`}
                  >
                    {level.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Exercise Lists */}
        <div className="p-4 space-y-6">
          {/* Emergency Exercises */}
          {emergencyExercises.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-therapeutic-danger mb-3" data-testid="text-emergency-exercises">
                Exercices d'urgence
              </h2>
              <div className="space-y-3">
                {emergencyExercises.map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
            </div>
          )}

          {/* Regular Exercises */}
          {regularExercises.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3" data-testid="text-regular-exercises">
                {emergencyExercises.length > 0 ? "Autres exercices" : "Tous les exercices"}
              </h2>
              <div className="space-y-3">
                {regularExercises.map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredExercises.length === 0 && (
            <div className="text-center py-8" data-testid="text-no-exercises">
              <div className="text-gray-400 mb-2">
                <i className="fas fa-search text-4xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-1">
                Aucun exercice trouvé
              </h3>
              <p className="text-sm text-gray-500">
                Essayez de modifier vos filtres ou votre recherche
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
