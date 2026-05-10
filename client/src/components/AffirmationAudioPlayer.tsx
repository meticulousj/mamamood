import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface AffirmationAudioPlayerProps {
  affirmationText: string;
  audioUrl?: string;
  onGenerateAudio?: () => Promise<string>;
  isGenerating?: boolean;
}

export default function AffirmationAudioPlayer({
  affirmationText,
  audioUrl,
  onGenerateAudio,
  isGenerating = false,
}: AffirmationAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasAudio, setHasAudio] = useState(!!audioUrl);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleGenerateAudio = async () => {
    if (!onGenerateAudio) return;

    try {
      const url = await onGenerateAudio();
      setHasAudio(true);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
      }
      toast.success("Audio generated successfully!");
    } catch (error) {
      console.error("Error generating audio:", error);
      toast.error("Failed to generate audio");
    }
  };

  const handleDownload = async () => {
    if (!audioUrl) return;

    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "affirmation-audio.mp3";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Audio downloaded!");
    } catch (error) {
      console.error("Error downloading audio:", error);
      toast.error("Failed to download audio");
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-accent/5 to-secondary/5 border border-accent/20 rounded-lg p-4 space-y-4"
    >
      {/* Audio element */}
      <audio ref={audioRef} src={audioUrl} />

      {/* Player controls */}
      <div className="flex items-center gap-3">
        {hasAudio ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayPause}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </motion.button>

            {/* Progress bar */}
            <div className="flex-1 space-y-1">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={(value) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = value[0];
                  }
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateAudio}
            disabled={isGenerating}
            className="flex-1 py-2 px-4 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            style={{ fontFamily: "Inter" }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Generate Audio
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Additional controls */}
      {hasAudio && (
        <div className="space-y-3">
          {/* Volume control */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0])}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8 text-right">
              {volume}%
            </span>
          </div>

          {/* Playback rate and download */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {[0.75, 1, 1.25, 1.5].map((rate) => (
                <Button
                  key={rate}
                  variant={playbackRate === rate ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPlaybackRate(rate)}
                  className="text-xs"
                  style={{ fontFamily: "Inter" }}
                >
                  {rate}x
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-muted-foreground hover:text-foreground"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
