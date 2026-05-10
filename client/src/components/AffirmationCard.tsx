import { motion } from "framer-motion";
import { Heart, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import AffirmationAudioPlayer from "./AffirmationAudioPlayer";

interface AffirmationCardProps {
  content: string;
  moodContext?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  audioUrl?: string;
  onGenerateAudio?: () => Promise<string>;
  isGeneratingAudio?: boolean;
  index?: number;
}

const moodEmojis: Record<number, string> = {
  1: "😢",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "😊",
};

export default function AffirmationCard({
  content,
  moodContext,
  isFavorite = false,
  onToggleFavorite,
  onShare,
  audioUrl,
  onGenerateAudio,
  isGeneratingAudio = false,
  index = 0,
}: AffirmationCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Affirmation copied to clipboard!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Card className="bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/20 hover:border-accent/40 transition-all">
        <div className="p-6 space-y-4">
          {/* Mood indicator */}
          {moodContext && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-lg">{moodEmojis[moodContext]}</span>
              <span style={{ fontFamily: "Inter" }}>
                {["", "Overwhelmed", "Stressed", "Neutral", "Good", "Great"][
                  moodContext
                ]}
              </span>
            </div>
          )}

          {/* Affirmation text */}
          <p
            className="text-lg leading-relaxed text-foreground"
            style={{ fontFamily: "Lora" }}
          >
            "{content}"
          </p>

          {/* Audio player */}
          {onGenerateAudio && (
            <AffirmationAudioPlayer
              affirmationText={content}
              audioUrl={audioUrl}
              onGenerateAudio={onGenerateAudio}
              isGenerating={isGeneratingAudio}
            />
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleFavorite}
              className="flex-1"
            >
              <Button
                variant="ghost"
                size="sm"
                className={`w-full ${
                  isFavorite
                    ? "text-accent bg-accent/10"
                    : "text-muted-foreground hover:text-accent"
                }`}
                style={{ fontFamily: "Inter" }}
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`}
                />
                {isFavorite ? "Saved" : "Save"}
              </Button>
            </motion.button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground"
              style={{ fontFamily: "Inter" }}
            >
              <Copy className="w-4 h-4" />
            </Button>

            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
                className="text-muted-foreground hover:text-foreground"
                style={{ fontFamily: "Inter" }}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
