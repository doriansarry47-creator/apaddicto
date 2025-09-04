import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EMOTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { HeartCrack, Brain, Lightbulb, Activity } from "lucide-react";

export default function CravingTracker() {
  const [intensity, setIntensity] = useState(5);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [trigger, setTrigger] = useState("");
  const [emotions, setEmotions] = useState("");
  const [automaticThoughts, setAutomaticThoughts] = useState("");
  const [behaviors, setBehaviors] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const logCravingMutation = useMutation({
    mutationFn: async (data: { 
      intensity: number; 
      emotion?: string;
      trigger?: string;
      emotions?: string;
      automaticThoughts?: string;
      behaviors?: string;
    }) => {
      return await apiRequest("POST", "/api/cravings", data);
    },
    onSuccess: () => {
      toast({
        title: "Craving enregistré",
        description: "Votre journal des cravings a été mis à jour avec succès.",
      });
      // Reset form
      setIntensity(5);
      setSelectedEmotion(null);
      setTrigger("");
      setEmotions("");
      setAutomaticThoughts("");
      setBehaviors("");
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/cravings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre ressenti.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    logCravingMutation.mutate({
      intensity,
      emotion: selectedEmotion || undefined,
      trigger: trigger.trim() || undefined,
      emotions: emotions.trim() || undefined,
      automaticThoughts: automaticThoughts.trim() || undefined,
      behaviors: behaviors.trim() || undefined,
    });
  };

  return (
    <Card className="mx-4 my-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HeartCrack className="h-5 w-5 text-destructive" />
          <span>Journal des Cravings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Intensity Slider */}
        <div>
          <Label className="block text-sm font-medium mb-3">
            Intensité du craving (1-10)
          </Label>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer intensity-slider"
              data-testid="slider-craving-intensity"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span className="font-medium text-primary-600" data-testid="text-intensity-value">
                {intensity}
              </span>
              <span>10</span>
            </div>
          </div>
        </div>

        {/* Situation déclencheur */}
        <div>
          <Label htmlFor="trigger" className="flex items-center space-x-2 mb-2">
            <Activity className="h-4 w-4" />
            <span>Situation déclencheur</span>
          </Label>
          <Textarea
            id="trigger"
            placeholder="Décrivez la situation qui a déclenché ce craving..."
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            className="resize-none"
            rows={2}
            data-testid="textarea-trigger"
          />
        </div>

        {/* Émotions ressenties */}
        <div>
          <Label htmlFor="emotions" className="flex items-center space-x-2 mb-2">
            <HeartCrack className="h-4 w-4" />
            <span>Émotions ressenties</span>
          </Label>
          <Textarea
            id="emotions"
            placeholder="Quelles émotions avez-vous ressenties? (tristesse, colère, frustration, anxiété...)"
            value={emotions}
            onChange={(e) => setEmotions(e.target.value)}
            className="resize-none"
            rows={2}
            data-testid="textarea-emotions"
          />
        </div>

        {/* Pensées automatiques */}
        <div>
          <Label htmlFor="thoughts" className="flex items-center space-x-2 mb-2">
            <Brain className="h-4 w-4" />
            <span>Pensées automatiques</span>
          </Label>
          <Textarea
            id="thoughts"
            placeholder="Quelles pensées vous sont venues à l'esprit? (Ex: 'Je ne vais pas y arriver', 'Ça ne sert à rien'...)"
            value={automaticThoughts}
            onChange={(e) => setAutomaticThoughts(e.target.value)}
            className="resize-none"
            rows={2}
            data-testid="textarea-thoughts"
          />
        </div>

        {/* Comportements adoptés */}
        <div>
          <Label htmlFor="behaviors" className="flex items-center space-x-2 mb-2">
            <Lightbulb className="h-4 w-4" />
            <span>Comportements adoptés</span>
          </Label>
          <Textarea
            id="behaviors"
            placeholder="Comment avez-vous réagi? Qu'avez-vous fait pour gérer ce craving?"
            value={behaviors}
            onChange={(e) => setBehaviors(e.target.value)}
            className="resize-none"
            rows={2}
            data-testid="textarea-behaviors"
          />
        </div>

        {/* Emotion Selection */}
        <div>
          <Label className="block text-sm font-medium mb-3">
            Émotion principale (optionnel)
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {EMOTIONS.map((emotion) => (
              <button
                key={emotion.id}
                onClick={() => setSelectedEmotion(emotion.id)}
                className={cn(
                  "p-3 rounded-xl text-center transition-colors",
                  selectedEmotion === emotion.id
                    ? "bg-primary-100 border-2 border-primary-300"
                    : "bg-white hover:bg-primary-50 border border-gray-200"
                )}
                data-testid={`button-emotion-${emotion.id}`}
              >
                <i className={`fas fa-${emotion.icon} text-lg ${emotion.color} mb-1`}></i>
                <div className="text-xs">{emotion.name}</div>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={logCravingMutation.isPending}
          className="w-full"
          data-testid="button-log-craving"
        >
          {logCravingMutation.isPending ? "Enregistrement..." : "Enregistrer le craving"}
        </Button>
      </CardContent>
    </Card>
  );
}
