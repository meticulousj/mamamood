import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import AffirmationCard from "@/components/AffirmationCard";

export default function Affirmations() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const favoritesQuery = trpc.affirmations.getFavorites.useQuery();
  const generateMutation = trpc.affirmations.generate.useMutation();
  const saveMutation = trpc.affirmations.save.useMutation();
  const toggleFavoriteMutation = trpc.affirmations.toggleFavorite.useMutation();

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const moodLabels = ['Overwhelmed', 'Stressed', 'Neutral', 'Good', 'Great'];

  const handleGenerateAffirmations = async (mood: number) => {
    setSelectedMood(mood);
    try {
      await generateMutation.mutateAsync({
        mood,
        notes: undefined,
      });
    } catch (error) {
      console.error("Error generating affirmations:", error);
    }
  };

  const handleToggleFavorite = async (affirmationText: string) => {
    try {
      // For generated affirmations, we save them first
      await saveMutation.mutateAsync({
        affirmationId: 0, // Will be set by backend
      });
      await favoritesQuery.refetch();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-accent" />
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Poppins' }}>
                Affirmations
              </h1>
            </div>
          </div>
          <Button
            onClick={() => setLocation("/saved-affirmations")}
            variant="outline"
            className="gap-2"
            style={{ fontFamily: "Inter" }}
          >
            <Heart className="w-4 h-4" />
            Saved ({favoritesQuery.data?.length || 0})
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Generate New Affirmations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins' }}>Generate New Affirmations</CardTitle>
              <CardDescription style={{ fontFamily: 'Lora' }}>
                Select your current mood to receive personalized affirmations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {moodEmojis.map((emoji, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGenerateAffirmations(index + 1)}
                    disabled={generateMutation.isPending}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                      selectedMood === index + 1
                        ? 'bg-accent/20 ring-2 ring-accent'
                        : 'bg-muted/50 hover:bg-muted'
                    } disabled:opacity-50`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter' }}>
                      {moodLabels[index]}
                    </span>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Affirmations */}
        {generateMutation.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Poppins' }}>
                Today's Affirmations
              </h2>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {generateMutation.data.affirmations.map((affirmation, index) => (
                  <AffirmationCard
                    key={index}
                    content={affirmation}
                    moodContext={selectedMood || undefined}
                    isFavorite={false}
                    onToggleFavorite={() => handleToggleFavorite(affirmation)}
                    index={index}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!generateMutation.data && (!favoritesQuery.data || favoritesQuery.data.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Sparkles className="w-12 h-12 text-accent/30 mx-auto mb-4" />
            <p className="text-muted-foreground" style={{ fontFamily: 'Lora' }}>
              Generate your first affirmations by selecting a mood above
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
