// Tasalli — Audio Player Service for Sacred Recitations & Adhkar

class AudioService {
  private currentAudio: HTMLAudioElement | null = null;
  private currentTextId: string | null = null;
  private isPlaying = false;
  private listeners: ((playing: boolean, textId: string | null) => void)[] = [];
  private audioContext: AudioContext | null = null;

  public subscribe(fn: (playing: boolean, textId: string | null) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.isPlaying, this.currentTextId));
  }

  public play(textId: string, audioUrl?: string) {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    this.currentTextId = textId;
    this.isPlaying = true;
    this.notify();

    if (audioUrl) {
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.onended = () => {
        this.isPlaying = false;
        this.currentTextId = null;
        this.notify();
      };
      this.currentAudio.onerror = () => {
        // Fallback to peaceful contemplative tone
        this.playPeacefulChime();
      };
      this.currentAudio.play().catch(() => {
        this.playPeacefulChime();
      });
    } else {
      this.playPeacefulChime();
    }
  }

  public pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
    this.isPlaying = false;
    this.notify();
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isPlaying = false;
    this.currentTextId = null;
    this.notify();
  }

  public getCurrentState() {
    return {
      isPlaying: this.isPlaying,
      currentTextId: this.currentTextId
    };
  }

  // Gentle, calm acoustic chime simulation using Web Audio API
  private playPeacefulChime() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const ctx = this.audioContext;
      const now = ctx.currentTime;

      // Soft harmonic bell tone (A3, E4, A4)
      const freqs = [220, 329.63, 440];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0, now + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.15 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 2.6);
      });

      setTimeout(() => {
        this.isPlaying = false;
        this.currentTextId = null;
        this.notify();
      }, 3000);
    } catch {
      this.isPlaying = false;
      this.notify();
    }
  }
}

export const audioPlayer = new AudioService();
