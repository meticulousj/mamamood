import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Journal() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState("");
  const [currentMood, setCurrentMood] = useState<number | null>(null);

  const entriesQuery = trpc.journal.getEntries.useQuery({ limit: 20, offset: 0 });
  const saveMutation = trpc.journal.save.useMutation();
  const deleteMutation = trpc.journal.delete.useMutation();
  const generatePromptMutation = trpc.journal.generatePrompt.useMutation();

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const moodLabels = ['Overwhelmed', 'Stressed', 'Neutral', 'Good', 'Great'];

  const handleStartWriting = async (mood: number) => {
    setCurrentMood(mood);
    setIsWriting(true);
    try {
      const result = await generatePromptMutation.mutateAsync({
        mood,
        notes: undefined,
      });
      // Could display the prompt here
    } catch (error) {
      console.error("Error generating prompt:", error);
    }
  };

  const handleSaveEntry = async () => {
    if (!content.trim() || !currentMood) return;
    try {
      await saveMutation.mutateAsync({
        content,
        moodAtTime: currentMood,
        prompt: generatePromptMutation.data?.prompt,
      });
      setContent("");
      setCurrentMood(null);
      setIsWriting(false);
      await entriesQuery.refetch();
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      await entriesQuery.refetch();
    } catch (error) {
      console.error("Error deleting entry:", error);
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
            <BookOpen className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Poppins' }}>
              Journal
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Writing Section */}
        {!isWriting ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Poppins' }}>Start Writing</CardTitle>
                <CardDescription style={{ fontFamily: 'Lora' }}>
                  Choose your mood to get a personalized journaling prompt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {moodEmojis.map((emoji, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStartWriting(index + 1)}
                      disabled={generatePromptMutation.isPending}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                        'bg-muted/50 hover:bg-muted'
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
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle style={{ fontFamily: 'Poppins' }}>Write Your Entry</CardTitle>
                    {generatePromptMutation.data && (
                      <CardDescription style={{ fontFamily: 'Lora' }} className="mt-2">
                        "{generatePromptMutation.data.prompt}"
                      </CardDescription>
                    )}
                  </div>
                  <span className="text-3xl">{moodEmojis[currentMood! - 1]}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your thoughts, feelings, and reflections here..."
                  className="w-full p-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                  style={{ fontFamily: 'Lora' }}
                  rows={8}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEntry}
                    disabled={!content.trim() || saveMutation.isPending}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Save Entry
                  </Button>
                  <Button
                    onClick={() => {
                      setIsWriting(false);
                      setContent("");
                      setCurrentMood(null);
                    }}
                    variant="outline"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Journal Entries */}
        {entriesQuery.data && entriesQuery.data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Poppins' }}>Your Entries</CardTitle>
                <CardDescription style={{ fontFamily: 'Lora' }}>
                  {entriesQuery.data.length} journal entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {entriesQuery.data.map((entry) => (
                    <motion.div
                      key={entry.id}
                      variants={item}
                      className="p-4 bg-secondary/10 rounded-lg border border-secondary/20 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Inter' }}>
                            {new Date(entry.createdAt).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-foreground mt-2 line-clamp-3" style={{ fontFamily: 'Lora' }}>
                            {entry.content}
                          </p>
                        </div>
                        {entry.moodAtTime && (
                          <span className="text-2xl ml-4">
                            {moodEmojis[entry.moodAtTime - 1]}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteEntry(entry.id)}
                        disabled={deleteMutation.isPending}
                        className="text-destructive hover:text-destructive/90"
                        style={{ fontFamily: 'Inter' }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {(!entriesQuery.data || entriesQuery.data.length === 0) && !isWriting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <BookOpen className="w-12 h-12 text-accent/30 mx-auto mb-4" />
            <p className="text-muted-foreground" style={{ fontFamily: 'Lora' }}>
              No journal entries yet. Start writing to reflect on your day.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
