import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExerciseSchema } from "../../../../shared/schema";
import type { Exercise, InsertExercise, EmergencyRoutine, InsertEmergencyRoutine, ExerciseLibrary, InsertExerciseLibrary, ExerciseVariation, InsertExerciseVariation, CustomSession, InsertCustomSession, SessionElement, InsertSessionElement } from "../../../../shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit, Activity, AlertTriangle, Filter, Image, Clock, Target, Library, Star, Users, Play, Settings, Camera, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ExerciseVariationsManager } from "@/components/admin/exercise-variations-manager";

type FormData = InsertExercise;

// Catégories prédéfinies (alignées avec la base de données)
const EXERCISE_CATEGORIES = [
  { value: "cardio", label: "Cardio Training" },
  { value: "strength", label: "Renforcement Musculaire" },
  { value: "flexibility", label: "Étirement & Flexibilité" },
  { value: "mindfulness", label: "Pleine Conscience & Méditation" },
  { value: "relaxation", label: "Relaxation" },
  { value: "respiration", label: "Exercices de Respiration" },
  { value: "meditation", label: "Méditation" },
  { value: "debutant", label: "Exercices Débutant" },
];

// Niveaux de difficulté
const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced", label: "Avancé" },
];

export default function ManageExercises() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [emergencyRoutineSteps, setEmergencyRoutineSteps] = useState<string[]>(['']);
  const [selectedExerciseForLibrary, setSelectedExerciseForLibrary] = useState<Exercise | null>(null);
  const [libraryImages, setLibraryImages] = useState<File[]>([]);
  const [libraryVideos, setLibraryVideos] = useState<{url: string, title: string, description?: string}[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [variations, setVariations] = useState<{type: 'simplification' | 'complexification', title: string, description: string, instructions: string}[]>([]);

  const { data: exercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ["admin", "exercises"],
    queryFn: async () => apiRequest("GET", "/api/admin/exercises").then(res => res.json()),
    initialData: [],
  });

  const { data: emergencyRoutines, isLoading: isLoadingRoutines } = useQuery<EmergencyRoutine[]>({
    queryKey: ["admin", "emergency-routines"],
    queryFn: async () => apiRequest("GET", "/api/admin/emergency-routines").then(res => res.json()),
    initialData: [],
  });

  const { data: exerciseLibrary, isLoading: isLoadingLibrary } = useQuery<ExerciseLibrary[]>({
    queryKey: ["admin", "exercise-library"],
    queryFn: async () => apiRequest("GET", "/api/admin/exercise-library").then(res => res.json()),
    initialData: [],
  });

  const { data: exerciseVariations, isLoading: isLoadingVariations } = useQuery<ExerciseVariation[]>({
    queryKey: ["admin", "exercise-variations"],
    queryFn: async () => apiRequest("GET", "/api/admin/exercise-variations").then(res => res.json()),
    initialData: [],
  });

  const mutation = useMutation({
    mutationFn: async (newExercise: InsertExercise) => {
      let imageUrl = newExercise.imageUrl;
      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);

        try {
          const uploadResponse = await fetch("/api/admin/media/upload", {
            method: "POST",
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            imageUrl = uploadResult.url;
          }
        } catch (error) {
          console.warn("Image upload failed, proceeding without image");
        }
      }

      return apiRequest("POST", "/api/exercises", { ...newExercise, imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "exercises"] });
      queryClient.invalidateQueries({ queryKey: ["exercises"] }); // Invalider aussi le cache patient
      toast({
        title: "Succès",
        description: "Exercice créé avec succès.",
      });
      reset();
      setSelectedImage(null);
      setImagePreview(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: (exerciseId: string) => apiRequest("DELETE", `/api/admin/exercises/${exerciseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "exercises"] });
      queryClient.invalidateQueries({ queryKey: ["exercises"] }); // Invalider aussi le cache patient
      toast({
        title: "Succès",
        description: "Exercice supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const createRoutineMutation = useMutation({
    mutationFn: async (newRoutine: InsertEmergencyRoutine) => {
      return apiRequest("POST", "/api/admin/emergency-routines", newRoutine);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "emergency-routines"] });
      toast({
        title: "Succès",
        description: "Routine d'urgence créée avec succès.",
      });
      setEmergencyRoutineSteps(['']);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const deleteRoutineMutation = useMutation({
    mutationFn: (routineId: string) => apiRequest("DELETE", `/api/admin/emergency-routines/${routineId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "emergency-routines"] });
      toast({
        title: "Succès",
        description: "Routine d'urgence supprimée avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const setDefaultRoutineMutation = useMutation({
    mutationFn: (routineId: string) => apiRequest("PUT", `/api/admin/emergency-routines/${routineId}/set-default`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "emergency-routines"] });
      toast({
        title: "Succès",
        description: "Routine d'urgence définie comme routine par défaut.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredExercises =
    exercises?.filter((exercise) => {
      const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === "all" || exercise.difficulty === difficultyFilter;
      return matchesCategory && matchesDifficulty;
    }) || [];

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(insertExerciseSchema),
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    mutation.mutate(data);
  };

  const addRoutineStep = () => {
    setEmergencyRoutineSteps([...emergencyRoutineSteps, '']);
  };

  const removeRoutineStep = (index: number) => {
    if (emergencyRoutineSteps.length > 1) {
      setEmergencyRoutineSteps(emergencyRoutineSteps.filter((_, i) => i !== index));
    }
  };

  const updateRoutineStep = (index: number, value: string) => {
    const newSteps = [...emergencyRoutineSteps];
    newSteps[index] = value;
    setEmergencyRoutineSteps(newSteps);
  };

  const handleCreateRoutine = (formData: FormData) => {
    const title = formData.get('routine-title') as string;
    const description = formData.get('routine-description') as string;
    const durationStr = formData.get('routine-duration') as string;
    const duration = durationStr ? parseInt(durationStr) : undefined;
    const category = formData.get('routine-category') as string;

    if (!title || emergencyRoutineSteps.filter(step => step.trim()).length === 0) {
      toast({
        title: "Erreur",
        description: "Le titre et au moins une étape sont requis.",
        variant: "destructive",
      });
      return;
    }

    const routine: InsertEmergencyRoutine = {
      title,
      description: description || undefined,
      duration: duration,
      category: category || 'general',
      steps: emergencyRoutineSteps.filter(step => step.trim()),
      isActive: true,
      isDefault: false
    };

    createRoutineMutation.mutate(routine);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestion des Exercices</h1>
        </div>
      </div>

      <Tabs defaultValue="exercises" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="exercises" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Exercices</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center space-x-2">
            <Library className="h-4 w-4" />
            <span>Bibliothèque</span>
          </TabsTrigger>
          <TabsTrigger value="variations" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Variations</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center space-x-2">
            <Play className="h-4 w-4" />
            <span>Séances</span>
          </TabsTrigger>
          <TabsTrigger value="emergency-routines" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Routines d\'Urgence</span>
          </TabsTrigger>
        </TabsList>

        {/* Onglet exercices */}
        <TabsContent value="exercises" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Gestion des Exercices</h2>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nouvel Exercice</span>
            </Button>
          </div>

          {/* Filtres */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filtres</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category-filter">Catégorie</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {EXERCISE_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty-filter">Difficulté</Label>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les niveaux" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les niveaux</SelectItem>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{filteredExercises.length}</div>
                <div className="text-sm text-muted-foreground">Exercices affichés</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {exercises?.filter(e => e.difficulty === "beginner").length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Débutant</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {exercises?.filter(e => e.difficulty === "intermediate").length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Intermédiaire</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {exercises?.filter(e => e.difficulty === "advanced").length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Avancé</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire de création */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Créer un Exercice</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Titre</Label>
                      <Input id="title" {...register("title")} placeholder="Nom de l\'exercice" />
                      {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="category">Catégorie</Label>
                      <Select onValueChange={(value) => setValue("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXERCISE_CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="difficulty">Difficulté</Label>
                      <Select onValueChange={(value) => setValue("difficulty", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          {DIFFICULTY_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.difficulty && <p className="text-red-500 text-xs mt-1">{errors.difficulty.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="duration">Durée (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        {...register("duration", { valueAsNumber: true })}
                        placeholder="15"
                      />
                      {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder="Description de l\'exercice"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="instructions">Instructions</Label>
                      <Textarea
                        id="instructions"
                        {...register("instructions")}
                        placeholder="Instructions détaillées"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="benefits">Bénéfices</Label>
                      <Textarea
                        id="benefits"
                        {...register("benefits")}
                        placeholder="Bénéfices de cet exercice"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="image">Image</Label>
                      <div className="space-y-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="cursor-pointer"
                        />
                        {imagePreview && (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Aperçu"
                              className="w-full h-32 object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview(null);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button type="submit" disabled={mutation.isPending} className="w-full">
                      {mutation.isPending ? "Création..." : "Créer l\'Exercice"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Liste des exercices */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Exercices Existants</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p>Chargement des exercices...</p>
                  ) : (
                    <div className="space-y-4">
                      {filteredExercises.map((exercise) => (
                        <div key={exercise.id} className="border p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-bold text-lg">{exercise.title}</h3>
                                <Badge variant="outline">
                                  {EXERCISE_CATEGORIES.find(c => c.value === exercise.category)?.label || exercise.category}
                                </Badge>
                                <Badge
                                  variant={
                                    exercise.difficulty === "beginner"
                                      ? "default"
                                      : exercise.difficulty === "intermediate"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {DIFFICULTY_LEVELS.find(d => d.value === exercise.difficulty)?.label || exercise.difficulty}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {exercise.description}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{exercise.duration} min</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Target className="h-4 w-4" />
                                  <span>{exercise.instructions}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Modifier l\'exercice</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action ne peut pas être annulée. Cela modifiera
                                      définitivement l\'exercice.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <form
                                    onSubmit={handleSubmit((data) => {
                                      // Logic for updating exercise
                                      console.log("Update data:", data);
                                    })}
                                    className="space-y-4"
                                  >
                                    <div>
                                      <Label htmlFor="edit-title">Titre</Label>
                                      <Input
                                        id="edit-title"
                                        defaultValue={exercise.title}
                                        {...register("title")}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-category">Catégorie</Label>
                                      <Select
                                        defaultValue={exercise.category}
                                        onValueChange={(value) => setValue("category", value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {EXERCISE_CATEGORIES.map((category) => (
                                            <SelectItem
                                              key={category.value}
                                              value={category.value}
                                            >
                                              {category.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-difficulty">Difficulté</Label>
                                      <Select
                                        defaultValue={exercise.difficulty}
                                        onValueChange={(value) => setValue("difficulty", value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {DIFFICULTY_LEVELS.map((level) => (
                                            <SelectItem
                                              key={level.value}
                                              value={level.value}
                                            >
                                              {level.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-duration">Durée (minutes)</Label>
                                      <Input
                                        id="edit-duration"
                                        type="number"
                                        defaultValue={exercise.duration}
                                        {...register("duration", { valueAsNumber: true })}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-description">Description</Label>
                                      <Textarea
                                        id="edit-description"
                                        defaultValue={exercise.description}
                                        {...register("description")}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-instructions">Instructions</Label>
                                      <Textarea
                                        id="edit-instructions"
                                        defaultValue={exercise.instructions}
                                        {...register("instructions")}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-benefits">Bénéfices</Label>
                                      <Textarea
                                        id="edit-benefits"
                                        defaultValue={exercise.benefits}
                                        {...register("benefits")}
                                      />
                                    </div>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <Button type="submit">Sauvegarder</Button>
                                    </AlertDialogFooter>
                                  </form>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action ne peut pas être annulée. Cela supprimera
                                      définitivement cet exercice de nos serveurs.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteExerciseMutation.mutate(exercise.id)}
                                    >
                                      Continuer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Onglet Bibliothèque d'exercices */}
        <TabsContent value="library" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Bibliothèque d'Exercices</h2>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Créez des cartes d'identité complètes pour vos exercices</p>
              <p className="text-xs text-info mt-1">Tous les exercices unitaires (pompes, squats, fentes, etc.) doivent être ajoutés ici</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sélection d'exercice et création de carte */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Library className="h-5 w-5" />
                    <span>Créer une Fiche Détaillée</span>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Chaque exercice doit avoir une fiche détaillée avec :</p>
                    <ul className="text-xs space-y-1 ml-4">
                      <li>• Nom de l'exercice</li>
                      <li>• Description complète</li>
                      <li>• Catégorie / type</li>
                      <li>• Niveau de difficulté</li>
                      <li>• Objectifs thérapeutiques</li>
                      <li>• Durée / Intensité</li>
                      <li>• Options variables personnalisables</li>
                    </ul>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Sélection d'exercice */}
                  <div>
                    <Label>Sélectionner un exercice</Label>
                    <Select onValueChange={(value) => {
                      const exercise = exercises?.find(e => e.id === value);
                      setSelectedExerciseForLibrary(exercise || null);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un exercice" />
                      </SelectTrigger>
                      <SelectContent>
                        {exercises?.map((exercise) => (
                          <SelectItem key={exercise.id} value={exercise.id}>
                            {exercise.title} ({exercise.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedExerciseForLibrary && (
                    <>
                      {/* Exercice sélectionné */}
                      <div className="p-3 bg-primary/5 rounded-lg">
                        <h4 className="font-semibold">{selectedExerciseForLibrary.title}</h4>
                        <p className="text-sm text-muted-foreground">{selectedExerciseForLibrary.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{selectedExerciseForLibrary.category}</Badge>
                          <Badge variant="outline">{selectedExerciseForLibrary.difficulty}</Badge>
                          <Badge variant="outline">{selectedExerciseForLibrary.duration} min</Badge>
                        </div>
                      </div>

                      {/* Image principale pour la carte */}
                      <div>
                        <Label>Image principale de la carte</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="cursor-pointer"
                        />
                        {imagePreview && (
                          <div className="mt-2 relative">
                            <img src={imagePreview} alt="Aperçu carte" className="w-full h-32 object-cover rounded-md" />
                          </div>
                        )}
                      </div>

                      {/* Galerie d'images */}
                      <div>
                        <Label className="flex items-center space-x-2">
                          <Camera className="h-4 w-4" />
                          <span>Galerie d'images</span>
                        </Label>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setLibraryImages(files);
                          }}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Ajoutez plusieurs images pour illustrer l'exercice
                        </p>
                      </div>

                      {/* Vidéos */}
                      <div>
                        <Label className="flex items-center space-x-2">
                          <Video className="h-4 w-4" />
                          <span>Vidéos démonstratives</span>
                        </Label>
                        <div className="space-y-2">
                          <Input
                            placeholder="URL de la vidéo (YouTube, Vimeo...)"
                            value={newVideoUrl}
                            onChange={(e) => setNewVideoUrl(e.target.value)}
                          />
                          <Input
                            placeholder="Titre de la vidéo"
                            value={newVideoTitle}
                            onChange={(e) => setNewVideoTitle(e.target.value)}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              if (newVideoUrl && newVideoTitle) {
                                setLibraryVideos([...libraryVideos, {
                                  url: newVideoUrl,
                                  title: newVideoTitle,
                                  description: ''
                                }]);
                                setNewVideoUrl('');
                                setNewVideoTitle('');
                              }
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Ajouter vidéo
                          </Button>
                        </div>
                        
                        {/* Liste des vidéos ajoutées */}
                        {libraryVideos.length > 0 && (
                          <div className="space-y-2 mt-3">
                            {libraryVideos.map((video, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-secondary/10 rounded">
                                <span className="text-sm">{video.title}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setLibraryVideos(libraryVideos.filter((_, i) => i !== index));
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Métadonnées enrichies */}
                      <div className="space-y-3">
                        <div>
                          <Label>Équipement nécessaire</Label>
                          <Input placeholder="Tapis, haltères, élastique... (séparés par des virgules)" />
                        </div>
                        
                        <div>
                          <Label>Contre-indications</Label>
                          <Textarea 
                            placeholder="Blessures, conditions médicales à éviter..."
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <Label>Public cible</Label>
                          <Input placeholder="Débutants, seniors, sportifs... (séparés par des virgules)" />
                        </div>
                        
                        <div>
                          <Label>Groupes musculaires</Label>
                          <Input placeholder="Abdominaux, dorsaux, jambes... (séparés par des virgules)" />
                        </div>
                        
                        <div>
                          <Label>Option variable 1</Label>
                          <Input placeholder="Champ personnalisable 1 (intensité, répétitions, etc.)" />
                        </div>
                        
                        <div>
                          <Label>Option variable 2</Label>
                          <Input placeholder="Champ personnalisable 2 (tempo, angle, etc.)" />
                        </div>
                        
                        <div>
                          <Label>Option variable 3</Label>
                          <Input placeholder="Champ personnalisable 3 (position, accessoire, etc.)" />
                        </div>
                      </div>

                      {/* Variations */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <Label>Variations de l'exercice</Label>
                          <Button 
                            type="button" 
                            size="sm" 
                            onClick={() => {
                              setVariations([...variations, {
                                type: 'simplification',
                                title: '',
                                description: '',
                                instructions: ''
                              }]);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {variations.map((variation, index) => (
                          <Card key={index} className="p-3 mb-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Select 
                                  value={variation.type}
                                  onValueChange={(value: 'simplification' | 'complexification') => {
                                    const newVariations = [...variations];
                                    newVariations[index].type = value;
                                    setVariations(newVariations);
                                  }}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="simplification">Simplification</SelectItem>
                                    <SelectItem value="complexification">Complexification</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setVariations(variations.filter((_, i) => i !== index))}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <Input
                                placeholder="Titre de la variation"
                                value={variation.title}
                                onChange={(e) => {
                                  const newVariations = [...variations];
                                  newVariations[index].title = e.target.value;
                                  setVariations(newVariations);
                                }}
                              />
                              <Textarea
                                placeholder="Description de la variation"
                                value={variation.description}
                                onChange={(e) => {
                                  const newVariations = [...variations];
                                  newVariations[index].description = e.target.value;
                                  setVariations(newVariations);
                                }}
                                rows={2}
                              />
                              <Textarea
                                placeholder="Instructions spécifiques"
                                value={variation.instructions}
                                onChange={(e) => {
                                  const newVariations = [...variations];
                                  newVariations[index].instructions = e.target.value;
                                  setVariations(newVariations);
                                }}
                                rows={2}
                              />
                            </div>
                          </Card>
                        ))}
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={() => {
                          toast({
                            title: "En développement",
                            description: "La sauvegarde de la carte d'identité sera bientôt disponible.",
                          });
                        }}
                      >
                        <Library className="h-4 w-4 mr-2" />
                        Créer la Carte d'Identité
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Liste des cartes d'identité existantes */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Library className="h-5 w-5" />
                      <span>Cartes d'Identité Créées</span>
                    </div>
                    <Badge variant="outline">{exerciseLibrary?.length || 0} cartes</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingLibrary ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground mt-2">Chargement de la bibliothèque...</p>
                    </div>
                  ) : exerciseLibrary && exerciseLibrary.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {exerciseLibrary.map((item) => {
                        const exercise = exercises?.find(e => e.id === item.exerciseId);
                        return (
                          <Card key={item.id} className="overflow-hidden">
                            {item.cardImageUrl && (
                              <div className="h-32 bg-cover bg-center" style={{backgroundImage: `url(${item.cardImageUrl})`}} />
                            )}
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-2">{exercise?.title}</h4>
                              <div className="flex items-center space-x-2 mb-2">
                                {item.averageRating && (
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="text-sm ml-1">{item.averageRating}/5</span>
                                  </div>
                                )}
                                <Badge variant="outline">{item.usageCount || 0} utilisations</Badge>
                                {item.isVerified && <Badge className="bg-green-100 text-green-800">Vérifié</Badge>}
                                {item.isFeatured && <Badge className="bg-blue-100 text-blue-800">Mis en avant</Badge>}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                                {item.galleryImages && item.galleryImages.length > 0 && (
                                  <div className="flex items-center">
                                    <Camera className="h-4 w-4 mr-1" />
                                    <span>{item.galleryImages.length} images</span>
                                  </div>
                                )}
                                {item.videos && item.videos.length > 0 && (
                                  <div className="flex items-center">
                                    <Video className="h-4 w-4 mr-1" />
                                    <span>{item.videos.length} vidéos</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Library className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Aucune carte d'identité créée</h3>
                      <p className="text-muted-foreground mb-4">
                        Commencez par sélectionner un exercice et créez sa première carte d'identité complète.
                      </p>
                      <div className="bg-info/10 p-4 rounded-lg max-w-md mx-auto">
                        <p className="text-sm text-info font-medium mb-2">💡 Préparation future :</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Les exercices de la bibliothèque serviront de base pour créer des séances structurées.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Chaque fiche détaillée enrichit l'expérience avec images, vidéos, variations 
                          et métadonnées pour assurer la cohérence entre Séances (patients) et Bibliothèque d'exercices (admin).
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Onglet Variations d'Exercices */}
        <TabsContent value="variations" className="mt-6">
          <ExerciseVariationsManager />
        </TabsContent>

        {/* Onglet Séances personnalisées */}
        <TabsContent value="sessions" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Créateur de Séances Personnalisées</h2>
              <p className="text-sm text-muted-foreground">Composez des séances avec timing, répétitions et étapes fractionnées</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Créateur de séance */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="h-5 w-5" />
                    <span>Nouvelle Séance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Informations générales */}
                  <div>
                    <Label>Titre de la séance</Label>
                    <Input placeholder="Ex: Séance matinale énergisante" />
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea placeholder="Description de la séance et objectifs..." rows={3} />
                  </div>
                  
                  <div>
                    <Label>Catégorie</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
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
                  
                  <div>
                    <Label>Difficulté</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Niveau de difficulté" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Débutant</SelectItem>
                        <SelectItem value="intermediate">Intermédiaire</SelectItem>
                        <SelectItem value="advanced">Avancé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="isPublic" className="rounded" />
                    <Label htmlFor="isPublic">Visible pour tous les patients</Label>
                  </div>

                  {/* Sélection d'exercices */}
                  <div className="border-t pt-4">
                    <Label className="flex items-center space-x-2 mb-3">
                      <Target className="h-4 w-4" />
                      <span>Ajouter des exercices</span>
                    </Label>
                    
                    <div className="space-y-3">
                      <Select onValueChange={(value) => {
                        // Logique pour ajouter un exercice
                        console.log('Exercise selected:', value);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un exercice" />
                        </SelectTrigger>
                        <SelectContent>
                          {exercises?.map((exercise) => (
                            <SelectItem key={exercise.id} value={exercise.id}>
                              {exercise.title} ({exercise.duration} min)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Configuration d'exercice */}
                  <div className="space-y-3 p-3 bg-secondary/5 rounded-lg">
                    <h4 className="font-medium text-sm">Configuration de l'exercice</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Durée (min)</Label>
                        <Input type="number" placeholder="15" className="h-8" />
                      </div>
                      <div>
                        <Label className="text-xs">Répétitions</Label>
                        <Input type="number" placeholder="1" className="h-8" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Repos (sec)</Label>
                        <Input type="number" placeholder="60" className="h-8" />
                      </div>
                      <div>
                        <Label className="text-xs">Timer type</Label>
                        <Select>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="continuous">Continu</SelectItem>
                            <SelectItem value="interval">Intervalles</SelectItem>
                            <SelectItem value="breathing">Respiration</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Fractionnement</Label>
                      <Input placeholder="Ex: 5min effort, 1min repos, répété 3x" className="h-8" />
                    </div>

                    <Button size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter à la séance
                    </Button>
                  </div>

                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Créer la Séance
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Aperçu de la séance en cours de création */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Aperçu de la Séance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Play className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-sm">Ajoutez des exercices pour voir l'aperçu</p>
                    <div className="mt-4 p-4 bg-info/10 rounded-lg">
                      <p className="text-xs font-medium mb-2">💡 Composition :</p>
                      <ul className="text-xs space-y-1">
                        <li>• Sélectionnez vos exercices</li>
                        <li>• Configurez durée et répétitions</li>
                        <li>• Définissez les temps de repos</li>
                        <li>• Fractionnez selon vos besoins</li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Exemple d'aperçu quand des exercices sont ajoutés */}
                  {/* 
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Durée totale estimée:</span>
                      <Badge variant="outline">25 min</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="p-2 border rounded flex items-center justify-between">
                        <span className="text-sm">Exercice 1</span>
                        <div className="flex items-center space-x-2 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>10 min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  */}
                </CardContent>
              </Card>
            </div>

            {/* Liste des séances créées */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Play className="h-5 w-5" />
                      <span>Séances Créées</span>
                    </div>
                    <Badge variant="outline">0 séances</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Aucune séance créée</h3>
                    <p className="text-muted-foreground mb-4">
                      Créez votre première séance personnalisée pour vos patients.
                    </p>
                    <div className="bg-info/10 p-4 rounded-lg">
                      <p className="text-sm text-info font-medium mb-2">🎯 Avantages :</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Séances structurées et guidées</li>
                        <li>• Contrôle précis du timing</li>
                        <li>• Adaptation aux besoins individuels</li>
                        <li>• Suivi de progression intégré</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Onglet routines d\'urgence */}
        <TabsContent value="emergency-routines" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Gestion des Routines d\'Urgence</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire de création de routine */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Créer une Routine d\'Urgence</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    handleCreateRoutine(formData);
                  }} className="space-y-4">
                    <div>
                      <Label htmlFor="routine-title">Titre</Label>
                      <Input id="routine-title" name="routine-title" placeholder="Nom de la routine" required />
                    </div>

                    <div>
                      <Label htmlFor="routine-description">Description</Label>
                      <Textarea
                        id="routine-description"
                        name="routine-description"
                        placeholder="Description de la routine"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="routine-category">Catégorie</Label>
                      <Select name="routine-category" defaultValue="general">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Général</SelectItem>
                          <SelectItem value="breathing">Respiration</SelectItem>
                          <SelectItem value="grounding">Ancrage</SelectItem>
                          <SelectItem value="distraction">Distraction</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="routine-duration">Durée (minutes)</Label>
                      <Input
                        id="routine-duration"
                        name="routine-duration"
                        type="number"
                        placeholder="5"
                        min="1"
                        max="30"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Étapes de la routine</Label>
                        <Button type="button" size="sm" onClick={addRoutineStep}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {emergencyRoutineSteps.map((step, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={step}
                              onChange={(e) => updateRoutineStep(index, e.target.value)}
                              placeholder={`Étape ${index + 1}`}
                            />
                            {emergencyRoutineSteps.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeRoutineStep(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" disabled={createRoutineMutation.isPending} className="w-full">
                      {createRoutineMutation.isPending ? "Création..." : "Créer la Routine"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Liste des routines existantes */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Routines d\'Urgence Existantes</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingRoutines ? (
                    <p>Chargement des routines...</p>
                  ) : (
                    <div className="space-y-4">
                      {emergencyRoutines.map((routine) => (
                        <div key={routine.id} className="border p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-bold text-lg">{routine.title}</h3>
                                {routine.isDefault && (
                                  <Badge variant="default">
                                    Par défaut
                                  </Badge>
                                )}
                                <Badge variant="outline">
                                  {routine.category === 'general' ? 'Général' : 
                                   routine.category === 'breathing' ? 'Respiration' :
                                   routine.category === 'grounding' ? 'Ancrage' : 
                                   routine.category === 'distraction' ? 'Distraction' : routine.category}
                                </Badge>
                              </div>
                              {routine.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {routine.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                {routine.duration && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{routine.duration} min</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1">
                                  <Target className="h-4 w-4" />
                                  <span>{Array.isArray(routine.steps) ? routine.steps.length : 0} étape{Array.isArray(routine.steps) && routine.steps.length > 1 ? 's' : ''}</span>
                                </div>
                              </div>
                              <div className="text-sm">
                                <strong>Étapes :</strong>
                                <ol className="list-decimal list-inside mt-1 space-y-1">
                                  {Array.isArray(routine.steps) && routine.steps.map((step: string, index: number) => (
                                    <li key={index} className="text-muted-foreground">{step}</li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {!routine.isDefault && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDefaultRoutineMutation.mutate(routine.id)}
                                >
                                  Définir par défaut
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action ne peut pas être annulée. Cela supprimera
                                      définitivement cette routine d\'urgence de nos serveurs.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteRoutineMutation.mutate(routine.id)}
                                    >
                                      Continuer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                      {emergencyRoutines.length === 0 && (
                        <div className="text-center py-8">
                          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            Aucune routine d\'urgence créée. Créez-en une pour aider les patients en cas de craving intense.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

