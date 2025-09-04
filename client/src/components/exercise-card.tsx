import { Exercise } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Bookmark, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface ExerciseCardProps {
  exercise: Exercise;
  onStart?: () => void;
  compact?: boolean;
}

// Move utility functions outside component to prevent recreation on every render
const getExerciseIcon = (type: string): string => {
  switch (type) {
    case 'breathing':
      return 'fas fa-wind';
    case 'physical':
      return 'fas fa-dumbbell';
    case 'meditation':
      return 'fas fa-spa';
    case 'stretching':
      return 'fas fa-leaf';
    default:
      return 'fas fa-heart';
  }
};

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner':
      return 'text-green-600';
    case 'intermediate':
      return 'text-yellow-600';
    case 'advanced':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

const getDifficultyLabel = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner':
      return 'Débutant';
    case 'intermediate':
      return 'Modéré';
    case 'advanced':
      return 'Avancé';
    default:
      return difficulty;
  }
};

export default function ExerciseCard({ exercise, onStart, compact = false }: ExerciseCardProps) {
  const [, setLocation] = useLocation();

  const handleStart = () => {
    if (onStart) {
      onStart();
    }
    setLocation(`/exercises/${exercise.id}`);
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm" data-testid={`card-exercise-${exercise.id}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center mr-3"
            style={{ backgroundColor: exercise.color }}
          >
            <i className={`${getExerciseIcon(exercise.type)} text-white text-lg`}></i>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800" data-testid={`text-exercise-name-${exercise.id}`}>
              {exercise.name}
            </h3>
            <p className="text-sm text-gray-600" data-testid={`text-exercise-meta-${exercise.id}`}>
              {exercise.duration} min • {getDifficultyLabel(exercise.difficulty)}
            </p>
          </div>
        </div>
        {!compact && (
          <div className="text-right">
            <div className={cn("text-xs font-medium", getDifficultyColor(exercise.difficulty))}>
              {exercise.isEmergency ? 'Urgence' : 'Adapté'}
            </div>
            <div className="flex text-xs" style={{ color: exercise.color }}>
              {[...Array(exercise.isEmergency ? 5 : 3)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {!compact && exercise.description && (
        <p className="text-sm text-gray-600 mb-3" data-testid={`text-exercise-description-${exercise.id}`}>
          {exercise.description}
        </p>
      )}
      
      <div className="flex space-x-2">
        <Button
          onClick={handleStart}
          className="flex-1 text-white hover:opacity-90"
          style={{ backgroundColor: exercise.color }}
          data-testid={`button-start-exercise-${exercise.id}`}
        >
          Commencer
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="px-4 py-2 border-gray-200 hover:bg-gray-50"
          data-testid={`button-bookmark-exercise-${exercise.id}`}
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
