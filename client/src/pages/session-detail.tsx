import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { IntervalTimer } from "@/components/interval-timer";
import { 
  Play, 
  Pause, 
  SkipForward, 
  CheckCircle, 
  ArrowLeft, 
  Timer,
  Target,
  Activity,
  Clock,
  Star,
  XCircle
} from "lucide-react";

// Interface pour une séance avec ses éléments
interface SessionElement {
  id: string;
  exerciseId: string;
  name: string;
  description: string;
  duration: number;
  repetitions?: number;
  sets?: number;
  restTime?: number;
  instructions?: string;
  order: number;
}

interface SessionDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  totalDuration: number;
  tags: string[];
  elements: SessionElement[];
}

interface PatientSession {
  id: string;
  sessionId: string;
  status: 'assigned' | 'done' | 'skipped';
  feedback?: string;
  effort?: number;
  duration?: number;
  assignedAt: string;
  completedAt?: string;
  session: SessionDetail;
}

export default function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // États pour l'exécution de la séance
  const [currentElementIndex, setCurrentElementIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [elementTimeElapsed, setElementTimeElapsed] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  
  // États pour le feedback
  const [feedback, setFeedback] = useState("");
  const [effort, setEffort] = useState([5]);
  const [actualDuration, setActualDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupérer la séance détaillée
  const { data: patientSession, isLoading, error } = useQuery<PatientSession>({
    queryKey: ['patient-session', sessionId],
    queryFn: async () => {
      // D'abord récupérer la liste des séances du patient
      const sessionsResponse = await apiRequest('GET', '/api/patient-sessions');
      const sessions = await sessionsResponse.json();
      
      // Trouver la séance spécifique
      const session = sessions.find((s: PatientSession) => s.sessionId === sessionId);
      if (!session) {
        throw new Error('Séance non trouvée');
      }
      
      return session;
    },
    enabled: !!sessionId,
  });

  // Timer pour l'exécution
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        setElementTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused]);

  // Mutation pour finaliser la séance
  const completeSessionMutation = useMutation({
    mutationFn: async (data: { feedback: string; effort: number; duration: number }) => {
      if (!patientSession) throw new Error('Session non trouvée');
      
      const response = await apiRequest('POST', `/api/patient-sessions/${patientSession.id}/complete`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Séance terminée !",
        description: "Votre feedback a été enregistré avec succès"
      });
      queryClient.invalidateQueries({ queryKey: ['patient-sessions'] });
      setLocation('/exercises');
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement du feedback",
        variant: "destructive"
      });
    },
  });

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleNextElement = () => {
    if (!patientSession?.session?.elements || !Array.isArray(patientSession.session.elements)) return;
    
    if (currentElementIndex < patientSession.session.elements.length - 1) {
      setCurrentElementIndex(prev => prev + 1);
      setElementTimeElapsed(0);
    } else {
      // Fin de la séance
      setIsRunning(false);
      setShowCompletion(true);
      setActualDuration(Math.round(timeElapsed / 60).toString());
    }
  };

  const handleSkipElement = () => {
    handleNextElement();
  };

  const handleCompleteSession = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback requis",
        description: "Veuillez ajouter un commentaire sur votre séance",
        variant: "destructive"
      });
      return;
    }

    if (!actualDuration || parseInt(actualDuration) <= 0) {
      toast({
        title: "Durée requise",
        description: "Veuillez indiquer la durée de votre séance",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    completeSessionMutation.mutate({
      feedback: feedback.trim(),
      effort: effort[0],
      duration: parseInt(actualDuration)
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-orange-100 text-orange-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </>
    );
  }

  if (error || !patientSession) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-bold text-destructive mb-4">Séance non trouvée</h2>
            <p className="text-muted-foreground mb-4">La séance demandée n'existe pas ou n'est plus disponible.</p>
            <Button onClick={() => setLocation("/exercises")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux séances
            </Button>
          </div>
        </main>
      </>
    );
  }

  const currentElement = patientSession?.session?.elements?.[currentElementIndex];
  const progress = patientSession?.session?.elements && Array.isArray(patientSession.session.elements) ? 
    ((currentElementIndex + 1) / patientSession.session.elements.length) * 100 : 0;

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => setLocation("/exercises")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux séances
          </Button>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span>Temps total : {formatTime(timeElapsed)}</span>
            </div>
          </div>
        </div>

        {/* Progression globale */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{patientSession.session.title}</h2>
              <Badge className={getDifficultyColor(patientSession.session.difficulty)}>
                {patientSession.session.difficulty}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-4">{patientSession.session.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span>{currentElementIndex + 1} / {(patientSession?.session?.elements && Array.isArray(patientSession.session.elements)) ? patientSession.session.elements.length : 0}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {!showCompletion ? (
          <>
            {/* Élément actuel */}
            {currentElement && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Étape {currentElementIndex + 1}: {currentElement.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{currentElement.description}</p>
                  
                  {currentElement.instructions && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">Instructions :</h4>
                      <p className="text-sm">{currentElement.instructions}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{currentElement.duration}</div>
                      <div className="text-xs text-muted-foreground">minutes</div>
                    </div>
                    {currentElement.repetitions && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{currentElement.repetitions}</div>
                        <div className="text-xs text-muted-foreground">répétitions</div>
                      </div>
                    )}
                    {currentElement.sets && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{currentElement.sets}</div>
                        <div className="text-xs text-muted-foreground">séries</div>
                      </div>
                    )}
                    {currentElement.restTime && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{currentElement.restTime}s</div>
                        <div className="text-xs text-muted-foreground">repos</div>
                      </div>
                    )}
                  </div>

                  {/* Timer pour l'élément actuel */}
                  <div className="text-center py-4">
                    <div className="text-4xl font-mono font-bold text-primary mb-2">
                      {formatTime(elementTimeElapsed)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Durée recommandée : {currentElement.duration} min
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contrôles */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-center gap-4">
                  {!isRunning ? (
                    <Button onClick={handleStart} size="lg" className="px-8">
                      <Play className="h-5 w-5 mr-2" />
                      Commencer
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={handlePause} 
                        variant="outline" 
                        size="lg"
                        className="px-6"
                      >
                        <Pause className="h-5 w-5 mr-2" />
                        {isPaused ? 'Reprendre' : 'Pause'}
                      </Button>
                      
                      <Button 
                        onClick={handleNextElement} 
                        size="lg"
                        className="px-6"
                      >
                        {currentElementIndex < ((patientSession?.session?.elements && Array.isArray(patientSession.session.elements)) ? patientSession.session.elements.length : 0) - 1 ? (
                          <>
                            <SkipForward className="h-5 w-5 mr-2" />
                            Exercice suivant
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Terminer la séance
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
                
                {isRunning && (
                  <div className="mt-4 text-center">
                    <Button 
                      onClick={handleSkipElement} 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground"
                    >
                      Passer cet exercice
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          /* Formulaire de finalisation */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Félicitations ! Séance terminée
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-4">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-lg text-muted-foreground">
                  Vous avez terminé votre séance en {formatTime(timeElapsed)} !
                </p>
              </div>

              <div>
                <Label htmlFor="actualDuration">Durée réelle (minutes) *</Label>
                <Input
                  id="actualDuration"
                  type="number"
                  min="1"
                  max="300"
                  value={actualDuration}
                  onChange={(e) => setActualDuration(e.target.value)}
                  placeholder="Combien de temps avez-vous vraiment pratiqué ?"
                />
              </div>

              <div>
                <Label>Effort ressenti : {effort[0]}/10</Label>
                <Slider
                  value={effort}
                  onValueChange={setEffort}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Très facile</span>
                  <span>Très difficile</span>
                </div>
              </div>

              <div>
                <Label htmlFor="feedback">Comment s'est passée votre séance ? *</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Décrivez votre ressenti, les difficultés rencontrées, ce que vous avez aimé..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setLocation('/exercises')}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  onClick={handleCompleteSession}
                  className="flex-1"
                  disabled={isSubmitting || !feedback.trim() || !actualDuration}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Enregistrement...' : 'Finaliser la séance'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}