import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // in minutes
}

const BREATHING_PHASES = [
  { phase: "Préparez-vous", duration: 3 },
  { phase: "Inspirez", duration: 4 },
  { phase: "Retenez", duration: 7 },
  { phase: "Expirez", duration: 8 },
] as const;

export default function BreathingModal({ isOpen, onClose, duration = 3 }: BreathingModalProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseTime, setPhaseTime] = useState(0);
  const [totalTime, setTotalTime] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);

  const currentPhase = BREATHING_PHASES[currentPhaseIndex];

  useEffect(() => {
    if (!isOpen) {
      setCurrentPhaseIndex(0);
      setPhaseTime(0);
      setTotalTime(duration * 60);
      setIsActive(false);
      return;
    }

    if (isActive && totalTime > 0) {
      const interval = setInterval(() => {
        setPhaseTime(prev => {
          if (prev >= currentPhase.duration - 1) {
            // Move to next phase
            setCurrentPhaseIndex(prevIndex => {
              if (prevIndex === 0) return 1; // Skip to breathing cycle
              return prevIndex >= BREATHING_PHASES.length - 1 ? 1 : prevIndex + 1;
            });
            return 0;
          }
          return prev + 1;
        });

        setTotalTime(prev => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, isActive, totalTime, currentPhase.duration]);

  const handleStart = () => {
    setIsActive(true);
    setCurrentPhaseIndex(1); // Start with "Inspirez"
  };

  const handlePause = () => {
    setIsActive(!isActive);
  };

  const handleStop = () => {
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4 text-center">
        <div className="py-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-6" data-testid="text-breathing-title">
            Respiration 4-7-8
          </h2>
          
          {/* Breathing Animation Circle */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-therapeutic-calm to-primary-500 ${
              isActive && currentPhaseIndex > 0 ? 'animate-breathe' : ''
            }`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-medium" data-testid="text-breathing-phase">
                {currentPhase.phase}
              </span>
            </div>
          </div>
          
          {/* Instructions */}
          <p className="text-gray-600 mb-6">
            {currentPhaseIndex === 0 ? "Appuyez sur Commencer" : "Suivez le rythme du cercle"}
          </p>
          
          {/* Timer Display */}
          <div className="text-3xl font-bold text-primary-600 mb-6" data-testid="text-remaining-time">
            {formatTime(totalTime)}
          </div>
          
          {/* Controls */}
          <div className="flex space-x-3">
            {!isActive && currentPhaseIndex === 0 ? (
              <Button
                onClick={handleStart}
                className="flex-1 bg-primary-500 hover:bg-primary-600"
                data-testid="button-start-breathing"
              >
                Commencer
              </Button>
            ) : (
              <>
                <Button
                  onClick={handlePause}
                  variant="secondary"
                  className="flex-1"
                  data-testid="button-pause-breathing"
                >
                  {isActive ? 'Pause' : 'Reprendre'}
                </Button>
                <Button
                  onClick={handleStop}
                  className="flex-1 bg-primary-500 hover:bg-primary-600"
                  data-testid="button-stop-breathing"
                >
                  Terminer
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
