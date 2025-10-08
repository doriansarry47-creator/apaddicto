import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Play, Pause, RotateCcw, Clock, Settings, Target, Activity, Send, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface SessionExercise {
  id: string;
  exerciseId: string;
  title: string;
  duration: number; // en secondes
  repetitions: number; // pour compatibilité
  sets?: number; // nombre de séries
  repetitionCount?: number; // nombre de répétitions par série
  exerciseMode?: 'duration' | 'repetitions' | 'interval';
  restTime: number; // en secondes
  intervals?: {
    work: number;
    rest: number;
    cycles: number;
  };
  isOptional: boolean;
  order: number;
  notes?: string;
}

interface SessionTemplate {
  id?: string;
  title: string;
  description: string;
  category: 'morning' | 'evening' | 'crisis' | 'maintenance' | 'recovery';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalDuration: number;
  exercises: SessionExercise[];
  isPublic: boolean;
  tags: string[];
}

interface EnhancedSessionBuilderProps {
  exercises: Array<{
    id: string;
    title: string;
    category: string;
    duration: number;
    difficulty: string;
  }>;
  onSave: (session: SessionTemplate) => Promise<void>;
  onPublish?: (sessionId: string, patientIds: string[]) => Promise<void>;
  existingSession?: SessionTemplate;
  patients?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

export function EnhancedSessionBuilder({ exercises, onSave, onPublish, existingSession, patients = [] }: EnhancedSessionBuilderProps) {
  const { toast } = useToast();
  const [session, setSession] = useState<SessionTemplate>({
    title: "",
    description: "",
    category: 'maintenance',
    difficulty: 'beginner',
    totalDuration: 0,
    exercises: [],
    isPublic: false,
    tags: []
  });
  
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [exerciseConfig, setExerciseConfig] = useState({
    duration: 300, // 5 minutes par défaut
    sets: 1, // Nombre de séries (remplace repetitions pour éviter confusion)
    restTime: 60,
    exerciseMode: 'duration' as 'duration' | 'repetitions' | 'interval',
    repetitionCount: 10, // Nombre de répétitions par série
    workTime: 30, // Pour le mode fractionné
    restInterval: 10, // Pour le mode fractionné
    cycles: 5, // Pour le mode fractionné
    isOptional: false,
    notes: ""
  });

  const [activeTab, setActiveTab] = useState("builder");
  const [previewMode, setPreviewMode] = useState(false);
  const [currentPreviewExercise, setCurrentPreviewExercise] = useState(0);
  const [previewTimer, setPreviewTimer] = useState(0);
  
  // États pour la publication
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (existingSession) {
      setSession(existingSession);
    }
  }, [existingSession]);

  // Calcul automatique de la durée totale
  useEffect(() => {
    const totalDuration = session.exercises.reduce((total, exercise) => {
      let exerciseDuration = exercise.duration * exercise.repetitions;
      if (exercise.intervals) {
        exerciseDuration = (exercise.intervals.work + exercise.intervals.rest) * exercise.intervals.cycles;
      }
      return total + exerciseDuration + exercise.restTime;
    }, 0);
    
    setSession(prev => ({ ...prev, totalDuration }));
  }, [session.exercises]);

  const addExerciseToSession = () => {
    if (!selectedExercise) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un exercice",
        variant: "destructive"
      });
      return;
    }

    const exercise = exercises.find(e => e.id === selectedExercise);
    if (!exercise) return;

    const sessionExercise: SessionExercise = {
      id: `session-exercise-${Date.now()}`,
      exerciseId: exercise.id,
      title: exercise.title,
      duration: exerciseConfig.exerciseMode === 'duration' ? exerciseConfig.duration : 
                exerciseConfig.exerciseMode === 'repetitions' ? exerciseConfig.repetitionCount * 3 : // Estimation 3s par rép
                (exerciseConfig.workTime + exerciseConfig.restInterval) * exerciseConfig.cycles,
      repetitions: exerciseConfig.exerciseMode === 'repetitions' ? exerciseConfig.repetitionCount : exerciseConfig.sets,
      sets: exerciseConfig.sets,
      restTime: exerciseConfig.restTime,
      isOptional: exerciseConfig.isOptional,
      order: session.exercises.length,
      notes: exerciseConfig.notes || undefined,
      exerciseMode: exerciseConfig.exerciseMode,
      ...(exerciseConfig.exerciseMode === 'repetitions' && {
        repetitionCount: exerciseConfig.repetitionCount
      }),
      ...(exerciseConfig.exerciseMode === 'interval' && {
        intervals: {
          work: exerciseConfig.workTime,
          rest: exerciseConfig.restInterval,
          cycles: exerciseConfig.cycles
        }
      })
    };

    setSession(prev => ({
      ...prev,
      exercises: [...prev.exercises, sessionExercise]
    }));

    // Reset config
    setSelectedExercise("");
    setExerciseConfig({
      duration: 300,
      sets: 1,
      restTime: 60,
      exerciseMode: 'duration',
      repetitionCount: 10,
      workTime: 30,
      restInterval: 10,
      cycles: 5,
      isOptional: false,
      notes: ""
    });

    toast({
      title: "Exercice ajouté",
      description: `${exercise.title} a été ajouté à la séance`
    });
  };

  const removeExercise = (exerciseId: string) => {
    setSession(prev => ({
      ...prev,
      exercises: prev.exercises
        .filter(e => e.id !== exerciseId)
        .map((e, index) => ({ ...e, order: index }))
    }));
  };

  const moveExercise = (exerciseId: string, direction: 'up' | 'down') => {
    const currentIndex = session.exercises.findIndex(e => e.id === exerciseId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === session.exercises.length - 1)
    ) return;

    const newExercises = [...session.exercises];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newExercises[currentIndex], newExercises[targetIndex]] = [newExercises[targetIndex], newExercises[currentIndex]];
    
    // Réordonner
    newExercises.forEach((ex, index) => {
      ex.order = index;
    });

    setSession(prev => ({ ...prev, exercises: newExercises }));
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    if (remainingSeconds === 0) return `${minutes}min`;
    return `${minutes}min ${remainingSeconds}s`;
  };

  const startPreview = () => {
    if (session.exercises.length === 0) {
      toast({
        title: "Aucun exercice",
        description: "Ajoutez des exercices pour prévisualiser la séance",
        variant: "destructive"
      });
      return;
    }
    setPreviewMode(true);
    setCurrentPreviewExercise(0);
    setPreviewTimer(0);
  };

  const stopPreview = () => {
    setPreviewMode(false);
    setCurrentPreviewExercise(0);
    setPreviewTimer(0);
  };

  const saveSession = async () => {
    if (!session.title.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez donner un titre à la séance",
        variant: "destructive"
      });
      return;
    }

    if (session.exercises.length === 0) {
      toast({
        title: "Erreur",
        description: "Ajoutez au moins un exercice à la séance",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSave(session);
      toast({
        title: "Séance sauvegardée",
        description: `"${session.title}" a été sauvegardée avec succès`
      });
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde de la séance",
        variant: "destructive"
      });
    }
  };

  const handlePublish = async () => {
    if (!session.id || !onPublish) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord sauvegarder la séance",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);
    
    try {
      await onPublish(session.id, selectedPatients);
      
      toast({
        title: "Séance publiée",
        description: selectedPatients.length > 0 
          ? `Séance assignée à ${selectedPatients.length} patient(s)`
          : "Séance publiée pour tous les patients"
      });
      
      setShowPublishModal(false);
      setSelectedPatients([]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la publication de la séance",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const togglePatientSelection = (patientId: string) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Constructeur</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration de l'exercice */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter un Exercice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Sélectionner un exercice</Label>
                  <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un exercice" />
                    </SelectTrigger>
                    <SelectContent>
                      {exercises.map(exercise => (
                        <SelectItem key={exercise.id} value={exercise.id}>
                          {exercise.title} ({exercise.category} - {exercise.duration}min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedExercise && (
                  <>
                    <div>
                      <Label>Mode d'exécution</Label>
                      <Select
                        value={exerciseConfig.exerciseMode}
                        onValueChange={(value: 'duration' | 'repetitions' | 'interval') => 
                          setExerciseConfig(prev => ({ ...prev, exerciseMode: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="duration">Durée (en temps)</SelectItem>
                          <SelectItem value="repetitions">Répétitions (nombre de mouvements)</SelectItem>
                          <SelectItem value="interval">Fractionné (travail/repos)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {exerciseConfig.exerciseMode === 'duration' && "L'exercice se fait pendant une durée définie"}
                        {exerciseConfig.exerciseMode === 'repetitions' && "L'exercice se fait sur un nombre de mouvements"}
                        {exerciseConfig.exerciseMode === 'interval' && "L'exercice alterne phases de travail et de repos"}
                      </p>
                    </div>

                    {exerciseConfig.exerciseMode === 'duration' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Durée par série (sec)</Label>
                          <Input
                            type="number"
                            value={exerciseConfig.duration}
                            onChange={(e) => setExerciseConfig(prev => ({
                              ...prev,
                              duration: Number(e.target.value)
                            }))}
                            min="10"
                            max="1800"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Durée de l'exercice en secondes
                          </p>
                        </div>
                        <div>
                          <Label>Nombre de séries</Label>
                          <Input
                            type="number"
                            value={exerciseConfig.sets}
                            onChange={(e) => setExerciseConfig(prev => ({
                              ...prev,
                              sets: Number(e.target.value)
                            }))}
                            min="1"
                            max="10"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Nombre de fois à répéter l'exercice
                          </p>
                        </div>
                      </div>
                    ) : exerciseConfig.exerciseMode === 'repetitions' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Répétitions par série</Label>
                          <Input
                            type="number"
                            value={exerciseConfig.repetitionCount}
                            onChange={(e) => setExerciseConfig(prev => ({
                              ...prev,
                              repetitionCount: Number(e.target.value)
                            }))}
                            min="1"
                            max="100"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Nombre de mouvements par série (ex: 10 pompes)
                          </p>
                        </div>
                        <div>
                          <Label>Nombre de séries</Label>
                          <Input
                            type="number"
                            value={exerciseConfig.sets}
                            onChange={(e) => setExerciseConfig(prev => ({
                              ...prev,
                              sets: Number(e.target.value)
                            }))}
                            min="1"
                            max="10"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Nombre de séries à effectuer
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label>Effort (sec)</Label>
                            <Input
                              type="number"
                              value={exerciseConfig.workTime}
                              onChange={(e) => setExerciseConfig(prev => ({
                                ...prev,
                                workTime: Number(e.target.value)
                              }))}
                              min="5"
                              max="300"
                            />
                          </div>
                          <div>
                            <Label>Repos (sec)</Label>
                            <Input
                              type="number"
                              value={exerciseConfig.restInterval}
                              onChange={(e) => setExerciseConfig(prev => ({
                                ...prev,
                                restInterval: Number(e.target.value)
                              }))}
                              min="5"
                              max="180"
                            />
                          </div>
                          <div>
                            <Label>Cycles</Label>
                            <Input
                              type="number"
                              value={exerciseConfig.cycles}
                              onChange={(e) => setExerciseConfig(prev => ({
                                ...prev,
                                cycles: Number(e.target.value)
                              }))}
                              min="1"
                              max="20"
                            />
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>Durée totale:</strong> {formatDuration((exerciseConfig.workTime + exerciseConfig.restInterval) * exerciseConfig.cycles)}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            {exerciseConfig.cycles} cycles de {exerciseConfig.workTime}s travail + {exerciseConfig.restInterval}s repos
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>Repos après exercice (sec)</Label>
                      <Input
                        type="number"
                        value={exerciseConfig.restTime}
                        onChange={(e) => setExerciseConfig(prev => ({
                          ...prev,
                          restTime: Number(e.target.value)
                        }))}
                        min="0"
                        max="300"
                      />
                    </div>

                    <div>
                      <Label>Notes (optionnel)</Label>
                      <Textarea
                        value={exerciseConfig.notes}
                        onChange={(e) => setExerciseConfig(prev => ({
                          ...prev,
                          notes: e.target.value
                        }))}
                        placeholder="Instructions spéciales, conseils..."
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isOptional"
                        checked={exerciseConfig.isOptional}
                        onChange={(e) => setExerciseConfig(prev => ({
                          ...prev,
                          isOptional: e.target.checked
                        }))}
                      />
                      <Label htmlFor="isOptional">Exercice optionnel</Label>
                    </div>

                    <Button onClick={addExerciseToSession} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter à la Séance
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Liste des exercices dans la séance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Exercices de la Séance
                  </div>
                  <Badge variant="outline">
                    {session.exercises.length} exercices - {formatDuration(session.totalDuration)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {session.exercises.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun exercice ajouté</p>
                    <p className="text-sm">Sélectionnez un exercice pour commencer</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {session.exercises.map((exercise, index) => (
                      <Card key={exercise.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                #{index + 1}
                              </Badge>
                              <h4 className="font-medium">{exercise.title}</h4>
                              {exercise.isOptional && (
                                <Badge variant="secondary" className="text-xs">
                                  Optionnel
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {exercise.intervals ? 
                                  `${exercise.intervals.work}s/${exercise.intervals.rest}s × ${exercise.intervals.cycles} cycles` :
                                  exercise.exerciseMode === 'repetitions' ?
                                  `${exercise.repetitionCount || exercise.repetitions} rép × ${exercise.sets || 1} séries` :
                                  `${formatDuration(exercise.duration)} × ${exercise.sets || exercise.repetitions || 1} séries`
                                }
                              </div>
                              <div>Repos: {formatDuration(exercise.restTime)}</div>
                            </div>
                            
                            {exercise.notes && (
                              <p className="text-xs text-muted-foreground italic">
                                {exercise.notes}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveExercise(exercise.id, 'up')}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveExercise(exercise.id, 'down')}
                              disabled={index === session.exercises.length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExercise(exercise.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Aperçu de la Séance
                </div>
                <div className="flex gap-2">
                  {!previewMode ? (
                    <Button onClick={startPreview} disabled={session.exercises.length === 0}>
                      <Play className="h-4 w-4 mr-2" />
                      Démarrer l'aperçu
                    </Button>
                  ) : (
                    <Button onClick={stopPreview} variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      Arrêter l'aperçu
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {session.exercises.length === 0 ? (
                <div className="text-center py-12">
                  <Play className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Ajoutez des exercices pour voir l'aperçu de la séance
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Résumé de la séance */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{session.exercises.length}</div>
                      <div className="text-sm text-muted-foreground">Exercices</div>
                    </div>
                    <div className="text-center p-4 bg-secondary/10 rounded-lg">
                      <div className="text-2xl font-bold text-secondary">
                        {Math.round(session.totalDuration / 60)}
                      </div>
                      <div className="text-sm text-muted-foreground">Minutes</div>
                    </div>
                    <div className="text-center p-4 bg-warning/10 rounded-lg">
                      <div className="text-2xl font-bold text-warning">
                        {session.exercises.filter(e => !e.isOptional).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Obligatoires</div>
                    </div>
                  </div>

                  {/* Timeline des exercices */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Déroulement de la séance :</h4>
                    {session.exercises.map((exercise, index) => (
                      <div
                        key={exercise.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          previewMode && currentPreviewExercise === index
                            ? 'border-l-primary bg-primary/5'
                            : 'border-l-border bg-muted/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              Étape {index + 1}
                            </Badge>
                            <h5 className="font-medium">{exercise.title}</h5>
                            {exercise.isOptional && (
                              <Badge variant="secondary" className="text-xs">
                                Optionnel
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {exercise.intervals ? 
                              formatDuration((exercise.intervals.work + exercise.intervals.rest) * exercise.intervals.cycles) :
                              exercise.exerciseMode === 'repetitions' ?
                              `${exercise.repetitionCount || exercise.repetitions} rép` :
                              formatDuration(exercise.duration * (exercise.sets || exercise.repetitions || 1))
                            }
                          </Badge>
                        </div>
                        
                        {exercise.intervals && (
                          <div className="text-sm text-muted-foreground mb-2">
                            Fractionné: {exercise.intervals.work}s effort / {exercise.intervals.rest}s repos × {exercise.intervals.cycles} cycles
                          </div>
                        )}
                        
                        {exercise.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            💡 {exercise.notes}
                          </p>
                        )}
                        
                        {exercise.restTime > 0 && (
                          <div className="text-sm text-muted-foreground mt-2">
                            ⏸️ Repos après exercice: {formatDuration(exercise.restTime)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Paramètres de la Séance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Titre de la séance</Label>
                  <Input
                    value={session.title}
                    onChange={(e) => setSession(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nom de la séance"
                  />
                </div>
                
                <div>
                  <Label>Catégorie</Label>
                  <Select
                    value={session.category}
                    onValueChange={(value: SessionTemplate['category']) => 
                      setSession(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Séance Matinale</SelectItem>
                      <SelectItem value="evening">Séance du Soir</SelectItem>
                      <SelectItem value="crisis">Gestion de Crise</SelectItem>
                      <SelectItem value="maintenance">Entretien</SelectItem>
                      <SelectItem value="recovery">Récupération</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={session.description}
                  onChange={(e) => setSession(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de la séance, objectifs, recommandations..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Difficulté</Label>
                <Select
                  value={session.difficulty}
                  onValueChange={(value: SessionTemplate['difficulty']) => 
                    setSession(prev => ({ ...prev, difficulty: value }))
                  }
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={session.isPublic}
                  onChange={(e) => setSession(prev => ({ ...prev, isPublic: e.target.checked }))}
                />
                <Label htmlFor="isPublic">Visible pour tous les patients</Label>
              </div>

              <div>
                <Label>Tags (séparés par des virgules)</Label>
                <Input
                  value={session.tags.join(', ')}
                  onChange={(e) => setSession(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                  placeholder="relaxation, anti-stress, débutant..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={saveSession} className="flex-1">
                  <Target className="h-4 w-4 mr-2" />
                  Sauvegarder la Séance
                </Button>
                
                {onPublish && (
                  <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!session.id}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Publier
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <Users className="h-5 w-5 mr-2" />
                          Publier la séance
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Sélectionnez les patients qui recevront cette séance. 
                          Laissez vide pour publier pour tous les patients.
                        </p>
                        
                        {patients.length > 0 ? (
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {patients.map((patient) => (
                              <div key={patient.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={patient.id}
                                  checked={selectedPatients.includes(patient.id)}
                                  onCheckedChange={() => togglePatientSelection(patient.id)}
                                />
                                <Label htmlFor={patient.id} className="text-sm">
                                  {patient.firstName} {patient.lastName}
                                  <span className="text-muted-foreground text-xs block">
                                    {patient.email}
                                  </span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            Aucun patient disponible. La séance sera publiée globalement.
                          </p>
                        )}
                        
                        <div className="flex gap-2 pt-4">
                          <Button 
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="flex-1"
                          >
                            {isPublishing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Publication...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Publier maintenant
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowPublishModal(false)}
                            disabled={isPublishing}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setSession({
                      title: "",
                      description: "",
                      category: 'maintenance',
                      difficulty: 'beginner',
                      totalDuration: 0,
                      exercises: [],
                      isPublic: false,
                      tags: []
                    });
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}