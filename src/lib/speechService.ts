// Tasalli — Read-aloud service for the Hadith Library
// Android app: uses the native TasalliTts plugin (Android TextToSpeech), because the Android WebView
// has no working speechSynthesis. Browser/dev: uses the Web Speech API.
import { Capacitor, registerPlugin } from '@capacitor/core';

interface TasalliTtsPlugin {
  speak(options: { text: string; rate: number; lang: string }): Promise<{ interrupted?: boolean }>;
  stop(): Promise<void>;
  isAvailable(): Promise<{ available: boolean }>;
}

const NativeTts = registerPlugin<TasalliTtsPlugin>('TasalliTts');

export interface SpeechQueueItem {
  id: string;
  text: string;
  label: string; // shown in the player, e.g. the reference
}

export interface SpeechState {
  status: 'idle' | 'playing' | 'paused';
  currentId: string | null;
  label: string;
  index: number;   // position in queue (0-based)
  total: number;
  rate: number;
  error?: string;
}

type Listener = (s: SpeechState) => void;

const RATE_KEY = 'tasalli_speech_rate_v1';

function splitIntoChunks(text: string): string[] {
  // Short utterances avoid browsers cutting off long speech and let pause/resume land near the right spot.
  const parts = text.match(/[^.!?;:]+[.!?;:]*/g) ?? [text];
  const chunks: string[] = [];
  let buf = '';
  for (const p of parts.map(s => s.trim()).filter(Boolean)) {
    if ((buf + ' ' + p).length > 220 && buf) { chunks.push(buf); buf = p; }
    else buf = buf ? `${buf} ${p}` : p;
  }
  if (buf) chunks.push(buf);
  return chunks;
}

class SpeechService {
  private listeners: Listener[] = [];
  private queue: SpeechQueueItem[] = [];
  private qi = 0;
  private chunks: string[] = [];
  private ci = 0;
  private runId = 0; // increments on every stop/skip so stale callbacks are ignored
  private state: SpeechState = { status: 'idle', currentId: null, label: '', index: 0, total: 0, rate: 0.9 };
  private readonly native = Capacitor.isNativePlatform();

  constructor() {
    try {
      const r = parseFloat(localStorage.getItem(RATE_KEY) ?? '');
      if (r >= 0.5 && r <= 2) this.state.rate = r;
    } catch { /* ignore */ }
  }

  get isSupported(): boolean {
    return this.native || (typeof window !== 'undefined' && 'speechSynthesis' in window);
  }

  subscribe(fn: Listener): () => void {
    this.listeners.push(fn);
    fn(this.state);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  getState(): SpeechState { return this.state; }

  private set(patch: Partial<SpeechState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(l => l(this.state));
  }

  setRate(rate: number) {
    this.set({ rate });
    try { localStorage.setItem(RATE_KEY, String(rate)); } catch { /* ignore */ }
  }

  playQueue(items: SpeechQueueItem[], startIndex = 0) {
    if (!this.isSupported) {
      this.set({ status: 'idle', error: 'Reading aloud is not supported on this device.' });
      return;
    }
    this.cancelSpeech();
    this.queue = items;
    this.qi = startIndex;
    this.startItem();
  }

  play(item: SpeechQueueItem) { this.playQueue([item]); }

  pause() {
    if (this.state.status !== 'playing') return;
    this.runId++;
    this.cancelSpeechEngine();
    this.set({ status: 'paused' });
  }

  resume() {
    if (this.state.status !== 'paused') return;
    this.set({ status: 'playing' });
    this.speakChunk(++this.runId); // restart the current sentence
  }

  next() {
    if (this.state.status === 'idle') return;
    this.cancelSpeech();
    this.qi++;
    this.startItem();
  }

  stop() {
    this.cancelSpeech();
    this.queue = [];
    this.set({ status: 'idle', currentId: null, label: '', index: 0, total: 0 });
  }

  private startItem() {
    if (this.qi >= this.queue.length) { this.stop(); return; }
    const item = this.queue[this.qi];
    this.chunks = splitIntoChunks(item.text);
    this.ci = 0;
    this.set({ status: 'playing', currentId: item.id, label: item.label, index: this.qi, total: this.queue.length, error: undefined });
    this.speakChunk(++this.runId);
  }

  private speakChunk(run: number) {
    if (run !== this.runId) return;
    if (this.ci >= this.chunks.length) {
      this.qi++;
      setTimeout(() => { if (run === this.runId) { this.runId++; this.startItem(); } }, 500);
      return;
    }
    const text = this.chunks[this.ci];
    const advance = () => { if (run !== this.runId) return; this.ci++; this.speakChunk(run); };

    if (this.native) {
      NativeTts.speak({ text, rate: this.state.rate, lang: 'en-GB' })
        .then(res => { if (!res?.interrupted) advance(); })
        .catch(err => {
          if (run !== this.runId) return;
          this.stop();
          this.set({ error: String(err?.message ?? 'Text-to-speech is not available. Install a voice in Android Settings → Text-to-speech.') });
        });
      return;
    }

    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    const voice = this.pickVoice();
    if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-GB';
    u.rate = this.state.rate;
    u.onend = advance;
    u.onerror = e => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      advance();
    };
    synth.speak(u);
  }

  private pickVoice(): SpeechSynthesisVoice | undefined {
    const voices = window.speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
    const score = (v: SpeechSynthesisVoice) =>
      (/natural|neural|premium|enhanced/i.test(v.name) ? 4 : 0) + (/en-GB|en-US/i.test(v.lang) ? 2 : 0) + (/google/i.test(v.name) ? 1 : 0);
    return voices.sort((a, b) => score(b) - score(a))[0];
  }

  private cancelSpeech() {
    this.runId++;
    this.cancelSpeechEngine();
  }

  private cancelSpeechEngine() {
    if (this.native) NativeTts.stop().catch(() => undefined);
    else if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }
}

export const speech = new SpeechService();
