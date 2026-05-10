import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import AffirmationCard from "@/components/AffirmationCard";

export default function SavedAffirmations() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const favoritesQuery = trpc.affirmations.getFavorites.useQuery();
  const toggleFavoriteMutation = trpc.affirmations.toggleFavorite.useMutation();

  const handleToggleFavorite = async (affirmationId: number) => {
    try {
      await toggleFavoriteMutation.mutateAsync({ affirmationId });
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
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/affirmations")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "Poppins" }}>
              My Saved Affirmations
            </h1>
            <p className="text-muted-foreground mt-1" style={{ fontFamily: "Lora" }}>
              Your collection of favorite affirmations
            </p>
          </div>
        </div>

        {/* Content */}
        {favoritesQuery.isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : favoritesQuery.data && favoritesQuery.data.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {favoritesQuery.data.map((affirmation, index) => (
              <AffirmationCard
                key={affirmation.id}
                content={affirmation.content}
                moodContext={affirmation.moodContext || undefined}
                isFavorite={true}
                onToggleFavorite={() => handleToggleFavorite(affirmation.id)}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Heart className="w-12 h-12 text-accent/30 mx-auto mb-4" />
            <p className="text-muted-foreground" style={{ fontFamily: "Lora" }}>
              You haven't saved any affirmations yet.
            </p>
            <p className="text-sm text-muted-foreground mt-2" style={{ fontFamily: "Lora" }}>
              Generate affirmations and save your favorites to see them here.
            </p>
            <Button
              onClick={() => setLocation("/affirmations")}
              className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground"
              style={{ fontFamily: "Inter" }}
            >
              Generate Affirmations
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
