// frontend/lib/audio/tanpuraSynth.ts
// Precision Web Audio Synthesizer for Acoustic Tanpura Drone, Just Intonation Swara Harmonium, and Classical Taal Metronome

export type TanpuraTuningPreset = 'Pa' | 'Ma' | 'Ni';

export interface TanpuraOptions {
  tonicHz: number;
  preset: TanpuraTuningPreset;
  tempoBpm: number;
  volume: number;
  fineTuneCents: number;
  onPluck?: (stringIdx: number) => void;
}

export interface SwaraToneInfo {
  name: string;
  devanagari: string;
  semitone: number;
  cents: number;
  ratio: number;
  ratioStr: string;
}

export const SWARA_JUST_RATIOS: SwaraToneInfo[] = [
  { name: 'Sa', devanagari: 'सा', semitone: 0, cents: 0, ratio: 1.0, ratioStr: '1/1' },
  { name: 're', devanagari: 'रे॒', semitone: 1, cents: 112, ratio: 16 / 15, ratioStr: '16/15' },
  { name: 'Re', devanagari: 'रे', semitone: 2, cents: 204, ratio: 9 / 8, ratioStr: '9/8' },
  { name: 'ga', devanagari: 'ग॒', semitone: 3, cents: 316, ratio: 6 / 5, ratioStr: '6/5' },
  { name: 'Ga', devanagari: 'ग', semitone: 4, cents: 386, ratio: 5 / 4, ratioStr: '5/4' },
  { name: 'ma', devanagari: 'म', semitone: 5, cents: 498, ratio: 4 / 3, ratioStr: '4/3' },
  { name: "Ma'", devanagari: 'म॑', semitone: 6, cents: 590, ratio: 45 / 32, ratioStr: '45/32' },
  { name: 'Pa', devanagari: 'प', semitone: 7, cents: 702, ratio: 3 / 2, ratioStr: '3/2' },
  { name: 'dha', devanagari: 'ध॒', semitone: 8, cents: 814, ratio: 8 / 5, ratioStr: '8/5' },
  { name: 'Dha', devanagari: 'ध', semitone: 9, cents: 884, ratio: 5 / 3, ratioStr: '5/3' },
  { name: 'ni', devanagari: 'नि॒', semitone: 10, cents: 1018, ratio: 9 / 5, ratioStr: '9/5' },
  { name: 'Ni', devanagari: 'नि', semitone: 11, cents: 1088, ratio: 15 / 8, ratioStr: '15/8' },
  { name: 'Tar Sa', devanagari: 'सां', semitone: 12, cents: 1200, ratio: 2.0, ratioStr: '2/1' },
];

export interface TaalDefinition {
  name: string;
  totalBeats: number;
  bols: string[];
  divisions: number[];
  types: ('sam' | 'taali' | 'khaali')[];
}

export const CLASSICAL_TAALS: Record<string, TaalDefinition> = {
  Teentaal: {
    name: 'Teentaal (16 Matras)',
    totalBeats: 16,
    bols: ['Dha', 'Dhin', 'Dhin', 'Dha', 'Dha', 'Dhin', 'Dhin', 'Dha', 'Dha', 'Tin', 'Tin', 'Ta', 'Ta', 'Dhin', 'Dhin', 'Dha'],
    divisions: [4, 4, 4, 4],
    types: ['sam', 'taali', 'taali', 'taali', 'taali', 'taali', 'taali', 'taali', 'khaali', 'taali', 'taali', 'taali', 'taali', 'taali', 'taali', 'taali']
  },
  Keharwa: {
    name: 'Keharwa (8 Matras)',
    totalBeats: 8,
    bols: ['Dha', 'Ge', 'Na', 'Ti', 'Na', 'Ka', 'Dhi', 'Na'],
    divisions: [4, 4],
    types: ['sam', 'taali', 'taali', 'taali', 'khaali', 'taali', 'taali', 'taali']
  },
  Dadra: {
    name: 'Dadra (6 Matras)',
    totalBeats: 6,
    bols: ['Dha', 'Dhi', 'Na', 'Dha', 'Tu', 'Na'],
    divisions: [3, 3],
    types: ['sam', 'taali', 'taali', 'khaali', 'taali', 'taali']
  },
  Roopak: {
    name: 'Roopak (7 Matras)',
    totalBeats: 7,
    bols: ['Tin', 'Tin', 'Na', 'Dhi', 'Na', 'Dhi', 'Na'],
    divisions: [3, 2, 2],
    types: ['sam', 'taali', 'taali', 'taali', 'taali', 'taali', 'taali']
  },
  Ektaal: {
    name: 'Ektaal (12 Matras)',
    totalBeats: 12,
    bols: ['Dhin', 'Dhin', 'Dha', 'Dha', 'Tu', 'Na', 'Kat', 'Ta', 'Dhe', 'Te', 'Dha', 'Ge'],
    divisions: [2, 2, 2, 2, 2, 2],
    types: ['sam', 'taali', 'khaali', 'taali', 'khaali', 'taali', 'taali', 'taali', 'taali', 'taali', 'taali', 'taali']
  }
};

export class TanpuraEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private intervalId: any = null;
  private isRunning: boolean = false;
  private options: TanpuraOptions;
  private currentString: number = 0;

  constructor(opts: TanpuraOptions) {
    this.options = { ...opts };
  }

  private initContext() {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.options.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.options.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.options.volume, this.ctx.currentTime);
    }
  }

  public updateTuning(tonicHz: number, preset: TanpuraTuningPreset, fineTuneCents: number) {
    this.options.tonicHz = tonicHz;
    this.options.preset = preset;
    this.options.fineTuneCents = fineTuneCents;
  }

  public setTempo(bpm: number) {
    this.options.tempoBpm = Math.max(30, Math.min(160, bpm));
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  private getFrequencies(): number[] {
    // Base calibrated tonic with fine-tuning in cents
    const multiplier = Math.pow(2, this.options.fineTuneCents / 1200);
    const sa = this.options.tonicHz * multiplier;

    let string1 = sa * 1.5; // Default Pa
    if (this.options.preset === 'Ma') {
      string1 = sa * (4 / 3); // Shuddha Ma
    } else if (this.options.preset === 'Ni') {
      string1 = sa * (15 / 16); // Shuddha Ni in lower octave
    }

    // Tanpura 4 strings:
    // String 1: First note (Pa / Ma / Ni)
    // String 2: Jodi 1 (Tar/Middle Sa)
    // String 3: Jodi 2 (Tar/Middle Sa + tiny 2-cent offset for acoustic acoustic shimmer)
    // String 4: Kharja (Mandra Sa - low octave)
    const jodi1 = sa;
    const jodi2 = sa * Math.pow(2, 2 / 1200);
    const kharja = sa * 0.5;

    return [string1, jodi1, jodi2, kharja];
  }

  private pluckAcousticString(freq: number, strIdx: number) {
    if (!this.ctx || this.ctx.state === 'closed' || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const decayTime = 3.6; // Long reverberant sustain

    // 1. Fundamental Oscillator
    const fundOsc = this.ctx.createOscillator();
    fundOsc.type = 'triangle';
    fundOsc.frequency.setValueAtTime(freq, now);

    // 2. Harmonic Buzz Generator (Sawtooth with Jawari thread filter)
    const buzzOsc = this.ctx.createOscillator();
    buzzOsc.type = 'sawtooth';
    buzzOsc.frequency.setValueAtTime(freq, now);

    // Filter simulating the bridge jawari resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 3.2, now);
    filter.Q.setValueAtTime(3.5, now);

    // Modulate filter slightly to simulate thread flutter
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(4.5, now);
    lfoGain.gain.setValueAtTime(freq * 0.4, now);
    lfo.connect(filter.frequency);
    lfo.start(now);
    lfo.stop(now + decayTime);

    // Individual Envelope Gain
    const strGain = this.ctx.createGain();
    strGain.gain.setValueAtTime(0.0001, now);
    // Rapid soft attack
    strGain.gain.exponentialRampToValueAtTime(0.4, now + 0.04);
    // Natural exponential release
    strGain.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);

    // Routing
    fundOsc.connect(strGain);
    buzzOsc.connect(filter);
    filter.connect(strGain);
    strGain.connect(this.masterGain);

    fundOsc.start(now);
    buzzOsc.start(now);

    fundOsc.stop(now + decayTime + 0.1);
    buzzOsc.stop(now + decayTime + 0.1);

    if (this.options.onPluck) {
      this.options.onPluck(strIdx);
    }
  }

  public start() {
    this.initContext();
    if (this.isRunning) return;
    this.isRunning = true;

    const stringFreqs = this.getFrequencies();
    // Pluck interval in ms calculated from tempo
    const intervalMs = (60 / this.options.tempoBpm) * 1000;

    // First pluck
    this.pluckAcousticString(stringFreqs[0], 0);
    this.currentString = 1;

    this.intervalId = setInterval(() => {
      if (!this.isRunning) return;
      const freqs = this.getFrequencies();
      this.pluckAcousticString(freqs[this.currentString], this.currentString);
      this.currentString = (this.currentString + 1) % freqs.length;
    }, intervalMs);
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentString = 0;
  }

  public getStatus() {
    return this.isRunning;
  }

  public dispose() {
    this.stop();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Harmonium Swara Tone Synthesizer
export class SwaraHarmoniumEngine {
  private ctx: AudioContext | null = null;
  private activeVoices: Map<string, { oscs: OscillatorNode[]; gain: GainNode }> = new Map();

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playSwara(freq: number, swaraKey: string, durationSec: number = 1.2) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Stop existing voice if playing
    this.stopSwara(swaraKey);

    // Warm reed synth (dual oscillator: square + sawtooth blended with low-pass)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 1.002, now); // slight chorus

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 4.5, now);
    filter.Q.setValueAtTime(1.8, now);

    const voiceGain = ctx.createGain();
    voiceGain.gain.setValueAtTime(0.001, now);
    voiceGain.gain.linearRampToValueAtTime(0.28, now + 0.04);
    voiceGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(voiceGain);
    voiceGain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durationSec + 0.05);
    osc2.stop(now + durationSec + 0.05);

    this.activeVoices.set(swaraKey, { oscs: [osc1, osc2], gain: voiceGain });
  }

  public stopSwara(swaraKey: string) {
    const voice = this.activeVoices.get(swaraKey);
    if (voice && this.ctx) {
      const now = this.ctx.currentTime;
      voice.gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
      voice.oscs.forEach(o => {
        try { o.stop(now + 0.06); } catch (_) {}
      });
      this.activeVoices.delete(swaraKey);
    }
  }
}

// Classical Taal Metronome Engine
export class TaalMetronomeEngine {
  private ctx: AudioContext | null = null;
  private intervalId: any = null;
  private isRunning: boolean = false;
  private currentBeat: number = 0;
  private taalName: string = 'Teentaal';
  private bpm: number = 80;
  private onBeatCallback?: (beatIdx: number, bol: string, type: string) => void;

  constructor(taalName: string = 'Teentaal', bpm: number = 80, onBeat?: (beatIdx: number, bol: string, type: string) => void) {
    this.taalName = taalName;
    this.bpm = bpm;
    this.onBeatCallback = onBeat;
  }

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setTaal(name: string) {
    this.taalName = name;
    this.currentBeat = 0;
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(40, Math.min(240, newBpm));
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  private triggerStroke(type: 'sam' | 'taali' | 'khaali') {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'sam') {
      // Deep resonant Dha stroke
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(145, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.18);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    } else if (type === 'taali') {
      // Wood/bell clap
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    } else {
      // Soft wave for khaali
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public start() {
    this.getContext();
    if (this.isRunning) return;
    this.isRunning = true;
    const def = CLASSICAL_TAALS[this.taalName] || CLASSICAL_TAALS['Teentaal'];
    const intervalMs = (60 / this.bpm) * 1000;

    const playBeat = () => {
      if (!this.isRunning) return;
      const type = def.types[this.currentBeat] || 'taali';
      const bol = def.bols[this.currentBeat] || '';
      this.triggerStroke(type);

      if (this.onBeatCallback) {
        this.onBeatCallback(this.currentBeat, bol, type);
      }
      this.currentBeat = (this.currentBeat + 1) % def.totalBeats;
    };

    playBeat();
    this.intervalId = setInterval(playBeat, intervalMs);
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentBeat = 0;
  }

  public getStatus() {
    return this.isRunning;
  }

  public dispose() {
    this.stop();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
