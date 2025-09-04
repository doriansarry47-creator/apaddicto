import { useParams, useLocation } from "wouter";
import MobileHeader from "@/components/layout/mobile-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import BreathingModal from "@/components/breathing-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Exercise } from "@shared/schema";
import { useState, useEffect } from "react";
import { ArrowLeft, Play, Pause, Square, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ExerciseDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepTime, setStepTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: exercise, isLoading } = useQuery<Exercise>({
    queryKey: ['/api/exercises', params?.id],
    enabled: !!params?.id,
  });

  // Session tracking mutation
  const saveSessionMutation = useMutation({
    mutationFn: async (sessionData: {
      exerciseId: string;
      duration: number;
      completed: boolean;
      rating?: number;
      notes?: string;
    }) => {
      return await apiRequest("POST", "/api/exercise-sessions", sessionData);
    },
    onSuccess: () => {
      toast({
        title: "Session enregistrée",
        description: "Votre activité a été sauvegardée.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/exercise-sessions'] });
    },
  });

  const instructions = exercise?.instructions as any[] || [];

  // Timer logic
  useEffect(() => {
    if (!isActive || !exercise) return;

    const interval = setInterval(() => {
      setStepTime(prev => prev + 1);
      setTotalTime(prev => prev + 1);

      // Move to next step if current step is complete
      if (instructions[currentStep] && stepTime >= (instructions[currentStep].duration || 0)) {
        if (currentStep < instructions.length - 1) {
          setCurrentStep(prev => prev + 1);
          setStepTime(0);
        } else {
          // Exercise completed
          setIsActive(false);
          setIsCompleted(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, currentStep, stepTime, instructions, exercise]);

  const handleStart = () => {
    if (exercise?.type === 'breathing') {
      setShowBreathingModal(true);
    } else {
      setIsActive(true);
      setCurrentStep(0);
      setStepTime(0);
    }
  };

  const handlePause = () => {
    setIsActive(!isActive);
  };

  const handleStop = () => {
    setIsActive(false);
    if (totalTime > 0) {
      saveSessionMutation.mutate({
        exerciseId: exercise!.id,
        duration: Math.floor(totalTime / 60),
        completed: isCompleted,
        rating: rating > 0 ? rating : undefined,
        notes: notes.trim() || undefined,
      });
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    setIsCompleted(true);
    saveSessionMutation.mutate({
      exerciseId: exercise!.id,
      duration: Math.floor(totalTime / 60) || exercise!.duration,
      completed: true,
      rating: rating > 0 ? rating : undefined,
      notes: notes.trim() || undefined,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Exercice introuvable</h2>
          <Button onClick={() => setLocation("/exercises")} data-testid="button-back-to-exercises">
            Retour aux exercices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      
      <main className="max-w-md mx-auto bg-white min-h-screen pb-24">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/exercises")}
              className="mr-2"
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800" data-testid="text-exercise-title">
                {exercise.name}
              </h1>
              <p className="text-sm text-gray-600" data-testid="text-exercise-meta">
                {exercise.duration} min • {exercise.difficulty === 'beginner' ? 'Débutant' : 
                exercise.difficulty === 'intermediate' ? 'Modéré' : 'Avancé'}
              </p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4" data-testid="text-exercise-description">
            {exercise.description}
          </p>
          
          {/* Exercise Icon */}
          <div className="flex justify-center mb-4">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: exercise.color }}
            >
              <i className={`fas fa-${exercise.icon} text-white text-2xl`}></i>
            </div>
          </div>
        </div>

        {/* Timer and Controls */}
        <div className="p-4 border-b border-gray-100">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-primary-600 mb-2" data-testid="text-exercise-timer">
              {formatTime(totalTime)}
            </div>
            {isActive && instructions[currentStep] && (
              <div className="text-sm text-gray-600" data-testid="text-current-step">
                {instructions[currentStep].text}
              </div>
            )}
          </div>
          
          <div className="flex justify-center space-x-3">
            {!isActive && totalTime === 0 ? (
              <Button 
                onClick={handleStart}
                className="bg-primary-500 hover:bg-primary-600 px-6"
                data-testid="button-start-exercise"
              >
                <Play className="h-4 w-4 mr-2" />
                Commencer
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline"
                  onClick={handlePause}
                  data-testid="button-pause-exercise"
                >
                  {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleStop}
                  data-testid="button-stop-exercise"
                >
                  <Square className="h-4 w-4" />
                </Button>
                {!isCompleted && (
                  <Button 
                    onClick={handleComplete}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-complete-exercise"
                  >
                    Terminer
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3" data-testid="text-instructions-title">
            Instructions
          </h3>
          <div className="space-y-3">
            {instructions.map((instruction: any, index: number) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  index === currentStep && isActive 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                data-testid={`instruction-step-${index}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-800">
                      Étape {instruction.step}
                    </div>
                    <div className="text-sm text-gray-600">
                      {instruction.text}
                    </div>
                  </div>
                  {instruction.duration > 0 && (
                    <div className="text-xs text-gray-500">
                      {instruction.duration}s
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        {(totalTime > 0 || isCompleted) && (
          <div className="p-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3" data-testid="text-feedback-title">
                  Comment était cet exercice?
                </h3>
                
                {/* Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Utilité (1-5 étoiles)
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-1 ${
                          star <= rating ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                        data-testid={`button-rating-${star}`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optionnel)
                  </label>
                  <Textarea
                    placeholder="Comment vous sentez-vous? Avez-vous des observations?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    data-testid="textarea-exercise-notes"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <BreathingModal
        isOpen={showBreathingModal}
        onClose={() => {
          setShowBreathingModal(false);
          // Save breathing session
          saveSessionMutation.mutate({
            exerciseId: exercise.id,
            duration: exercise.duration,
            completed: true,
            rating: rating > 0 ? rating : undefined,
            notes: notes.trim() || undefined,
          });
        }}
        duration={exercise.duration}
      />

      <BottomNavigation />
    </div>
  );
}
