import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Music, ArrowLeft, Play, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import MeditationPlayer from "@/components/MeditationPlayer";

export default function Meditations() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMeditation, setSelectedMeditation] = useState<any | null>(null);

  const allMeditationsQuery = trpc.meditations.getAll.useQuery();
  const categoryMeditationsQuery = trpc.meditations.getByCategory.useQuery(
    { category: selectedCategory },
    { enabled: selectedCategory !== "all" }
  );
  const completionMutation = trpc.meditations.recordCompletion.useMutation();

  const meditations = selectedCategory === "all" ? allMeditationsQuery.data : categoryMeditationsQuery.data;
  const categories = ["stress", "sleep", "focus", "gratitude", "energy"];

  const handlePlayMeditation = (meditation: any) => {
    setSelectedMeditation(meditation);
  };

  const handleCompleteMeditation = async (id: number) => {
    setSelectedMeditation(null);
    await allMeditationsQuery.refetch();
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
            <Music className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Poppins' }}>
              Meditations
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins' }}>Filter by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === "all"
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  style={{ fontFamily: 'Inter' }}
                >
                  All
                </motion.button>
                {categories.map((cat) => (
                  <motion.button
                    key={cat}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg transition-all capitalize ${
                      selectedCategory === cat
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    style={{ fontFamily: 'Inter' }}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Meditations Grid */}
        {meditations && meditations.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {meditations.map((meditation) => (
              <motion.div key={meditation.id} variants={item}>
                <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg" style={{ fontFamily: 'Poppins' }}>
                          {meditation.title}
                        </CardTitle>
                        <CardDescription style={{ fontFamily: 'Lora' }}>
                          {meditation.duration} minutes
                        </CardDescription>
                      </div>
                      <span className="text-2xl capitalize">{meditation.category[0]}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Lora' }}>
                      {meditation.description}
                    </p>
                    <Button
                      onClick={() => handlePlayMeditation(meditation)}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      style={{ fontFamily: "Inter" }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {meditations && meditations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Music className="w-12 h-12 text-accent/30 mx-auto mb-4" />
            <p className="text-muted-foreground" style={{ fontFamily: 'Lora' }}>
              No meditations available in this category
            </p>
          </motion.div>
        )}
      </main>

      {/* Meditation Player Modal */}
      {selectedMeditation && (
        <MeditationPlayer
          meditation={selectedMeditation}
          onClose={() => setSelectedMeditation(null)}
          onComplete={handleCompleteMeditation}
        />
      )}
    </div>
  );
}
