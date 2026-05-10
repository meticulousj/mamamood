import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Heart, Sparkles, BookOpen, Music, TrendingUp, LogOut } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  
  const submitMoodMutation = trpc.checkin.submit.useMutation();
  const generateAffirmationsMutation = trpc.affirmations.generate.useMutation();
  const generateJournalPromptMutation = trpc.journal.generatePrompt.useMutation();
  const streakQuery = trpc.streak.getStreak.useQuery(undefined, { enabled: isAuthenticated });
  const weeklySummaryQuery = trpc.streak.getWeeklySummary.useQuery(undefined, { enabled: isAuthenticated });

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const moodLabels = ['Overwhelmed', 'Stressed', 'Neutral', 'Good', 'Great'];

  const handleMoodSubmit = async () => {
    if (!selectedMood) return;
    
    try {
      // Submit mood check-in
      await submitMoodMutation.mutateAsync({
        mood: selectedMood,
        notes: notes || undefined,
      });
      
      // Generate affirmations
      await generateAffirmationsMutation.mutateAsync({
        mood: selectedMood,
        notes: notes || undefined,
      });
      
      // Generate journal prompt
      await generateJournalPromptMutation.mutateAsync({
        mood: selectedMood,
        notes: notes || undefined,
      });
      
      // Reset form
      setSelectedMood(null);
      setNotes("");
    } catch (error) {
      console.error("Error submitting mood:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <Heart className="w-12 h-12 text-accent mx-auto mb-4" />
          <p className="text-foreground font-lora">Loading your sanctuary...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <Heart className="w-16 h-16 text-accent mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-4" style={{ fontFamily: 'Poppins' }}>
            Welcome to MamaMood
          </h1>
          <p className="text-lg text-muted-foreground mb-8" style={{ fontFamily: 'Lora' }}>
            Your daily sanctuary for wellness, affirmations, and self-care designed specifically for working moms.
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            style={{ fontFamily: 'Inter' }}
          >
            Begin Your Journey
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Poppins' }}>MamaMood</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'Poppins' }}>
            Hello, {user?.name || 'Mom'}
          </h2>
          <p className="text-lg text-muted-foreground" style={{ fontFamily: 'Lora' }}>
            How are you feeling today?
          </p>
        </motion.div>

        {/* Mood Check-In Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Poppins' }}>
                <Sparkles className="w-5 h-5 text-accent" />
                Daily Check-In
              </CardTitle>
              <CardDescription style={{ fontFamily: 'Lora' }}>
                Share your mood to get personalized affirmations and journaling prompts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-4" style={{ fontFamily: 'Inter' }}>
                  How are you feeling?
                </label>
                <div className="flex justify-between gap-2">
                  {moodEmojis.map((emoji, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedMood(index + 1)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                        selectedMood === index + 1
                          ? 'bg-accent/20 ring-2 ring-accent'
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <span className="text-3xl">{emoji}</span>
                      <span className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter' }}>
                        {moodLabels[index]}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Notes Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2" style={{ fontFamily: 'Inter' }}>
                  Optional: Share what's on your mind
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What's weighing on you today? What are you grateful for?"
                  className="w-full p-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                  style={{ fontFamily: 'Lora' }}
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleMoodSubmit}
                disabled={!selectedMood || submitMoodMutation.isPending}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                style={{ fontFamily: 'Inter' }}
              >
                {submitMoodMutation.isPending ? 'Generating...' : 'Get My Affirmations & Prompt'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak & Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: 'Poppins' }}>
                <TrendingUp className="w-5 h-5 text-accent" />
                Your Streak
              </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-5xl font-bold text-accent mb-2" style={{ fontFamily: 'Poppins' }}>
                    {streakQuery.data?.currentStreak || 0}
                  </div>
                  <p className="text-muted-foreground" style={{ fontFamily: 'Lora' }}>
                    {streakQuery.data?.currentStreak === 1 ? 'day' : 'days'} of consistency
                  </p>
                  <p className="text-sm text-muted-foreground mt-2" style={{ fontFamily: 'Inter' }}>
                    Longest: {streakQuery.data?.longestStreak || 0} days
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: 'Poppins' }}>
                <Heart className="w-5 h-5 text-accent" />
                This Week
              </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground" style={{ fontFamily: 'Inter' }}>Check-ins:</span>
                  <span className="font-semibold text-foreground" style={{ fontFamily: 'Poppins' }}>
                    {weeklySummaryQuery.data?.moodCheckInsThisWeek || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground" style={{ fontFamily: 'Inter' }}>Journal entries:</span>
                  <span className="font-semibold text-foreground" style={{ fontFamily: 'Poppins' }}>
                    {weeklySummaryQuery.data?.journalEntriesThisWeek || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground" style={{ fontFamily: 'Inter' }}>Meditations:</span>
                  <span className="font-semibold text-foreground" style={{ fontFamily: 'Poppins' }}>
                    {weeklySummaryQuery.data?.meditationsCompletedThisWeek || 0}
                  </span>
                </div>
                {weeklySummaryQuery.data?.averageMood && (
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-muted-foreground" style={{ fontFamily: 'Inter' }}>Avg mood:</span>
                    <span className="font-semibold text-accent" style={{ fontFamily: 'Poppins' }}>
                      {weeklySummaryQuery.data.averageMood}/5
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Access Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <Sparkles className="w-8 h-8 text-accent mx-auto" />
                <h3 className="font-semibold text-foreground" style={{ fontFamily: 'Poppins' }}>Affirmations</h3>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Lora' }}>
                  Personalized daily affirmations
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <BookOpen className="w-8 h-8 text-accent mx-auto" />
                <h3 className="font-semibold text-foreground" style={{ fontFamily: 'Poppins' }}>Journal</h3>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Lora' }}>
                  Private journaling space
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <Music className="w-8 h-8 text-accent mx-auto" />
                <h3 className="font-semibold text-foreground" style={{ fontFamily: 'Poppins' }}>Meditations</h3>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Lora' }}>
                  Guided meditation sessions
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
