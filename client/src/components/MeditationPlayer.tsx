import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, X, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

interface MeditationPlayerProps {
  meditation: {
    id: number;
    title: string;
    duration: number;
    description: string;
    transcript?: string | null;
    category: string;
  };
  onClose: () => void;
  onComplete: (meditationId: number) => void;
}

export default function MeditationPlayer({
  meditation,
  onClose,
  onComplete,
}: MeditationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const completionMutation = trpc.meditations.recordCompletion.useMutation();

  const durationMinutes = Math.floor(meditation.duration / 60);
  const durationSeconds = meditation.duration % 60;
  const elapsedMinutes = Math.floor(elapsed / 60);
  const elapsedSeconds = elapsed % 60;
  const progress = (elapsed / meditation.duration) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && elapsed < meditation.duration) {
      interval = setInterval(() => {
        setElapsed((prev) => {
          const newElapsed = prev + 1;
          if (newElapsed >= meditation.duration) {
            setIsPlaying(false);
            handleComplete();
            return meditation.duration;
          }
          return newElapsed;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, elapsed, meditation.duration]);

  const handleComplete = async () => {
    setIsCompleted(true);
    try {
      await completionMutation.mutateAsync({
        meditationId: meditation.id,
      });
      onComplete(meditation.id);
    } catch (error) {
      console.error("Error recording completion:", error);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setElapsed(0);
    setIsPlaying(false);
    setIsCompleted(false);
  };

  const categoryEmojis: Record<string, string> = {
    stress: "😌",
    sleep: "😴",
    focus: "🎯",
    gratitude: "🙏",
    energy: "⚡",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {categoryEmojis[meditation.category] || "🧘"}
                </span>
                <CardTitle style={{ fontFamily: "Poppins" }}>
                  {meditation.title}
                </CardTitle>
              </div>
              <p
                className="text-sm text-muted-foreground"
                style={{ fontFamily: "Lora" }}
              >
                {meditation.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Transcript Display */}
          {meditation.transcript && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-secondary/10 rounded-lg p-4 max-h-40 overflow-y-auto border border-secondary/20"
            >
              <p
                className="text-sm text-foreground leading-relaxed"
                style={{ fontFamily: "Lora" }}
              >
                {meditation.transcript}
              </p>
            </motion.div>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "linear" }}
                className="bg-accent h-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground" style={{ fontFamily: "Inter" }}>
              <span>
                {String(elapsedMinutes).padStart(2, "0")}:
                {String(elapsedSeconds).padStart(2, "0")}
              </span>
              <span>
                {String(durationMinutes).padStart(2, "0")}:
                {String(durationSeconds).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Status Message */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-accent/20 border border-accent/50 rounded-lg p-4 text-center"
            >
              <p
                className="text-sm font-semibold text-accent"
                style={{ fontFamily: "Poppins" }}
              >
                ✨ Meditation Complete!
              </p>
              <p
                className="text-xs text-accent/80 mt-1"
                style={{ fontFamily: "Lora" }}
              >
                You've taken a moment for yourself. Great job!
              </p>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex gap-3">
            <Button
              onClick={handlePlayPause}
              disabled={isCompleted}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              style={{ fontFamily: "Inter" }}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {elapsed === 0 ? "Start" : "Resume"}
                </>
              )}
            </Button>

            {elapsed > 0 && !isCompleted && (
              <Button
                onClick={handleReset}
                variant="outline"
                style={{ fontFamily: "Inter" }}
              >
                Reset
              </Button>
            )}

            <Button
              onClick={onClose}
              variant="outline"
              style={{ fontFamily: "Inter" }}
            >
              Close
            </Button>
          </div>

          {/* Breathing Guide (for stress/sleep meditations) */}
          {(meditation.category === "stress" ||
            meditation.category === "sleep") && (
            <motion.div
              animate={{
                scale: isPlaying ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 4,
                repeat: isPlaying ? Infinity : 0,
              }}
              className="flex justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-accent" />
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
