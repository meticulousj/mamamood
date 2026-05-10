/**
 * Theta Frequency Tone Generator
 * Generates isochronic theta tones (4-8 Hz) using Web Audio API
 * Isochronic tones are single tones that pulse on/off at regular intervals
 */

export interface ThetaToneConfig {
  frequency: number; // Hz (4-8 for theta)
  duration: number; // milliseconds
  volume: number; // 0-1
  pulseRate: number; // Hz (how fast the tone pulses)
}

export class ThetaToneGenerator {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  constructor() {
    // Initialize audio context lazily on first use
  }

  private initAudioContext() {
    if (!this.audioContext) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
    }
    return this.audioContext;
  }

  /**
   * Generate and play an isochronic theta tone
   * @param config Configuration for the theta tone
   */
  async playThetaTone(config: ThetaToneConfig): Promise<void> {
    if (this.isPlaying) {
      this.stopThetaTone();
    }

    const ctx = this.initAudioContext();
    if (!ctx) throw new Error('AudioContext initialization failed');
    
    // Create nodes
    this.oscillator = ctx.createOscillator();
    this.gainNode = ctx.createGain();

    // Configure oscillator
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = config.frequency;

    // Create isochronic pulse effect
    const pulseInterval = 1000 / config.pulseRate; // milliseconds between pulses
    const onDuration = pulseInterval * 0.5; // Tone on for half the cycle

    // Set initial gain to 0
    if (!this.gainNode) throw new Error('GainNode not initialized');
    this.gainNode.gain.setValueAtTime(0, ctx.currentTime);

    // Create pulsing effect
    let currentTime = ctx.currentTime;
    const endTime = currentTime + config.duration / 1000;
    const baseVolume = config.volume * 0.3; // Reduce volume to prevent hearing damage

    while (currentTime < endTime) {
      // Tone ON
      if (!this.gainNode) throw new Error('GainNode not initialized');
      this.gainNode.gain.setTargetAtTime(baseVolume, currentTime, 0.01);
      currentTime += onDuration / 1000;

      // Tone OFF
      if (currentTime < endTime) {
        if (!this.gainNode) throw new Error('GainNode not initialized');
        this.gainNode.gain.setTargetAtTime(0, currentTime, 0.01);
        currentTime += (pulseInterval - onDuration) / 1000;
      }
    }

    // Fade out at the end
    if (!this.gainNode) throw new Error('GainNode not initialized');
    this.gainNode.gain.setTargetAtTime(0, endTime, 0.1);

    // Connect nodes
    if (!this.oscillator || !this.gainNode) throw new Error('Nodes not initialized');
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(ctx.destination);

    // Start playback
    if (!this.oscillator) throw new Error('Oscillator not initialized');
    this.oscillator.start(ctx.currentTime);
    this.oscillator.stop(endTime + 0.1);

    this.isPlaying = true;

    // Mark as not playing when done
    setTimeout(() => {
      this.isPlaying = false;
    }, config.duration + 100);
  }

  /**
   * Stop the currently playing theta tone
   */
  stopThetaTone(): void {
    if (this.oscillator) {
      try {
        this.oscillator.stop();
      } catch (e) {
        // Already stopped
      }
      this.oscillator = null;
    }
    this.isPlaying = false;
  }

  /**
   * Create a background theta tone layer for meditation
   * Returns an audio buffer that can be looped
   */
  async createThetaLayer(config: ThetaToneConfig): Promise<AudioBuffer> {
    const ctx = this.initAudioContext();
    if (!ctx) throw new Error('AudioContext initialization failed');
    const sampleRate = ctx.sampleRate;
    const numberOfChannels = 1;
    const length = sampleRate * (config.duration / 1000);

    const audioBuffer = ctx.createBuffer(numberOfChannels, length, sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    const pulseInterval = sampleRate / config.pulseRate;
    const onDuration = pulseInterval * 0.5;
    const frequency = config.frequency;
    const baseVolume = config.volume * 0.2; // Subtle background layer

    let sampleIndex = 0;
    let pulsePhase = 0;

    while (sampleIndex < length) {
      // Determine if we're in "on" or "off" phase
      const phasePosition = sampleIndex % pulseInterval;
      const isOn = phasePosition < onDuration;

      // Generate sine wave
      const t = sampleIndex / sampleRate;
      const sample = Math.sin(2 * Math.PI * frequency * t);

      // Apply envelope and volume
      if (isOn) {
        channelData[sampleIndex] = sample * baseVolume;
      } else {
        channelData[sampleIndex] = 0;
      }

      sampleIndex++;
    }

    return audioBuffer;
  }

  /**
   * Get the current playing state
   */
  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopThetaTone();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioContext = null;
  }
}

// Singleton instance
let thetaGenerator: ThetaToneGenerator | null = null;

export function getThetaToneGenerator(): ThetaToneGenerator {
  if (!thetaGenerator) {
    thetaGenerator = new ThetaToneGenerator();
  }
  return thetaGenerator;
}

/**
 * Preset configurations for common use cases
 */
export const THETA_PRESETS = {
  deepSleep: {
    frequency: 4.5,
    pulseRate: 4,
    volume: 0.3,
  },
  lightSleep: {
    frequency: 5.5,
    pulseRate: 5,
    volume: 0.4,
  },
  meditation: {
    frequency: 6.0,
    pulseRate: 6,
    volume: 0.35,
  },
  relaxation: {
    frequency: 7.0,
    pulseRate: 7,
    volume: 0.4,
  },
  calmFocus: {
    frequency: 7.5,
    pulseRate: 8,
    volume: 0.35,
  },
};
