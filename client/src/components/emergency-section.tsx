import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Exercise } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExerciseCard from "./exercise-card";

export default function EmergencySection() {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const { data: emergencyExercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ['/api/exercises/emergency'],
    enabled: showEmergencyModal
  });

  return (
    <>
      <section className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-therapeutic-danger">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-therapeutic-danger mb-1">
              Craving intense?
            </h2>
            <p className="text-xs text-gray-600">
              Exercices d'urgence disponibles
            </p>
          </div>
          <Button
            className="bg-therapeutic-danger text-white hover:bg-red-600"
            size="sm"
            onClick={() => setShowEmergencyModal(true)}
            data-testid="button-emergency-sos"
          >
            SOS
          </Button>
        </div>
      </section>

      <Dialog open={showEmergencyModal} onOpenChange={setShowEmergencyModal}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-therapeutic-danger">
              Exercices d'urgence
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : emergencyExercises?.length ? (
              emergencyExercises.map((exercise) => (
                <ExerciseCard 
                  key={exercise.id} 
                  exercise={exercise} 
                  onStart={() => setShowEmergencyModal(false)}
                  compact
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Aucun exercice d'urgence disponible
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
