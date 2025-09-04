import MobileHeader from "@/components/layout/mobile-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import EmergencySection from "@/components/emergency-section";
import CravingTracker from "@/components/craving-tracker";
import ExerciseCard from "@/components/exercise-card";
import ProgressCard from "@/components/progress-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Exercise } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "wouter";
import { WEEKDAYS } from "@/lib/constants";

export default function Home() {
  const [journalContent, setJournalContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch exercises
  const { data: exercises, isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: ['/api/exercises'],
  });

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    select: (data: any) => ({
      totalSessions: data.totalSessions || 0,
      totalMinutes: data.totalMinutes || 0,
      dailyActivity: data.dailyActivity || []
    })
  });

  // Journal mutation
  const saveJournalMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", "/api/journal", { content });
    },
    onSuccess: () => {
      toast({
        title: "Journal sauvegardé",
        description: "Votre entrée a été enregistrée.",
      });
      setJournalContent("");
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

  const handleSaveJournal = () => {
    if (journalContent.trim()) {
      saveJournalMutation.mutate(journalContent.trim());
    }
  };

  // Get recommended exercises (first 3)
  const recommendedExercises = exercises?.slice(0, 3) || [];

  // Generate weekly chart data
  const weeklyData = Array.from({ length: 7 }, (_, index) => {
    const activityForDay = stats?.dailyActivity.find(
      day => new Date(day.date).getDay() === (index + 1) % 7
    );
    return {
      day: WEEKDAYS[index],
      sessions: activityForDay?.sessions || 0,
      height: activityForDay ? Math.min((activityForDay.sessions / 5) * 80, 80) : 5
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      
      <main className="max-w-md mx-auto bg-white min-h-screen pb-24">
        <EmergencySection />
        <CravingTracker />
        
        {/* Recommended Exercises */}
        <section className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Exercices recommandés
            </h2>
            <Link href="/exercises">
              <Button variant="ghost" className="text-primary-600 text-sm font-medium p-0" data-testid="button-view-all-exercises">
                Voir tout
              </Button>
            </Link>
          </div>

          {exercisesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedExercises.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          )}
        </section>

        {/* Progress Section */}
        <section className="p-4 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Vos progrès aujourd'hui
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <ProgressCard
              value={stats?.totalSessions || 0}
              label="Exercices réalisés"
              icon="check-circle"
              className="bg-gradient-to-br from-therapeutic-calm to-secondary-600"
              testId="card-exercises-completed"
            />
            <ProgressCard
              value={stats?.totalMinutes || 0}
              label="Minutes actives"
              icon="clock"
              className="bg-gradient-to-br from-primary-500 to-primary-700"
              testId="card-minutes-active"
            />
          </div>

          {/* Weekly Progress Chart */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <h3 className="font-medium text-gray-800 mb-3" data-testid="text-weekly-progress">
              Cette semaine
            </h3>
            <div className="flex items-end justify-between h-20" data-testid="chart-weekly-progress">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-primary-400 rounded-t w-2"
                    style={{ height: `${day.height}px` }}
                    data-testid={`bar-day-${index}`}
                  />
                  <div className={`text-xs mt-2 ${day.sessions > 0 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                    {day.day}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Journal Quick Entry */}
        <section className="p-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3" data-testid="text-journal-title">
              Journal rapide
            </h3>
            <Textarea
              placeholder="Comment vous sentez-vous après cet exercice? Notez vos pensées..."
              className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              data-testid="textarea-journal-content"
            />
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center space-x-3 text-gray-500">
                <Button variant="ghost" size="icon" className="p-2 hover:bg-gray-100" data-testid="button-journal-emoji">
                  <i className="fas fa-smile text-sm"></i>
                </Button>
                <Button variant="ghost" size="icon" className="p-2 hover:bg-gray-100" data-testid="button-journal-photo">
                  <i className="fas fa-camera text-sm"></i>
                </Button>
              </div>
              <Button
                onClick={handleSaveJournal}
                disabled={!journalContent.trim() || saveJournalMutation.isPending}
                className="bg-primary-500 hover:bg-primary-600"
                data-testid="button-save-journal"
              >
                {saveJournalMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
