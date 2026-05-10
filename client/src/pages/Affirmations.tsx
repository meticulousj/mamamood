import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Affirmations() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const favoritesQuery = trpc.affirmations.getFavorites.useQuery();
  const generateMutation = trpc.affirmations.generate.useMutation();
  const saveMutation = trpc.affirmations.save.useMutation();

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

  const handleSaveAffirmation = async (affirmationText: string) => {
    try {
      await saveMutation.mutateAsync({
        affirmationId: 0, // Will be set by backend
      });
      // Invalidate favorites query to refresh
      await favoritesQuery.refetch();
    } catch (error) {
      console.error("Error saving affirmation:", error);
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
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
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
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Poppins' }}>Today's Affirmations</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {generateMutation.data.affirmations.map((affirmation, index) => (
                    <motion.div
                      key={index}
                      variants={item}
                      className="p-4 bg-accent/10 rounded-lg border border-accent/20 space-y-3"
                    >
                      <p className="text-foreground" style={{ fontFamily: 'Lora' }}>
                        "{affirmation}"
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleSaveAffirmation(affirmation)}
                        disabled={saveMutation.isPending}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        style={{ fontFamily: 'Inter' }}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Save to Favorites
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Saved Affirmations */}
        {favoritesQuery.data && favoritesQuery.data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Poppins' }}>Your Favorite Affirmations</CardTitle>
                <CardDescription style={{ fontFamily: 'Lora' }}>
                  {favoritesQuery.data.length} saved affirmations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {favoritesQuery.data.map((fav, index) => (
                    <motion.div
                      key={index}
                      variants={item}
                      className="p-4 bg-secondary/10 rounded-lg border border-secondary/20"
                    >
                      <p className="text-foreground" style={{ fontFamily: 'Lora' }}>
                        "{fav.content}"
                      </p>
                      <p className="text-xs text-muted-foreground mt-2" style={{ fontFamily: 'Inter' }}>
                        Saved for {fav.moodContext ? moodLabels[fav.moodContext - 1] : 'neutral'} mood
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
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
