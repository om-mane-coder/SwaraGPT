'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Music, Volume2, VolumeX, Play, Pause, Sparkles, Sliders, 
  RotateCcw, ArrowRight, Disc, Activity, Layers, HelpCircle, Check, Mic
} from 'lucide-react';
import { useSwaraStore } from '@/lib/store';
import { 
  TanpuraEngine, 
  TanpuraTuningPreset, 
  SwaraHarmoniumEngine, 
  TaalMetronomeEngine, 
  SWARA_JUST_RATIOS, 
  CLASSICAL_TAALS, 
  SwaraToneInfo 
} from '@/lib/audio/tanpuraSynth';

const TONIC_OPTIONS = [
  { label: "C3 (130.81 Hz)", val: 130.81, note: "C3" },
  { label: "C#3 (138.59 Hz) - Standard Male", val: 138.59, note: "C#3" },
  { label: "D3 (146.83 Hz)", val: 146.83, note: "D3" },
  { label: "D#3 (155.56 Hz)", val: 155.56, note: "D#3" },
  { label: "E3 (164.81 Hz)", val: 164.81, note: "E3" },
  { label: "F3 (174.61 Hz)", val: 174.61, note: "F3" },
  { label: "F#3 (185.00 Hz)", val: 185.00, note: "F#3" },
  { label: "G3 (196.00 Hz)", val: 196.00, note: "G3" },
  { label: "G#3 (207.65 Hz) - Standard Female", val: 207.65, note: "G#3" },
  { label: "A3 (220.00 Hz)", val: 220.00, note: "A3" },
  { label: "A#3 (233.08 Hz)", val: 233.08, note: "A#3" },
  { label: "B3 (246.94 Hz)", val: 246.94, note: "B3" },
];

const RAGA_DATABASE: Record<string, {
  name: string;
  thaat: string;
  vadi: string;
  samvadi: string;
  swaras: string[];
  tuning: TanpuraTuningPreset;
  time: string;
  mood: string;
}> = {
  Yaman: {
    name: 'Yaman',
    thaat: 'Kalyan',
    vadi: 'Ga',
    samvadi: 'Ni',
    swaras: ['Sa', 'Re', 'Ga', "Ma'", 'Pa', 'Dha', 'Ni', 'Tar Sa'],
    tuning: 'Pa',
    time: 'First Prahar of Night (7-10 PM)',
    mood: 'Devotional, Serene & Romantic'
  },
  Bhairav: {
    name: 'Bhairav',
    thaat: 'Bhairav',
    vadi: 'Dha',
    samvadi: 'Re',
    swaras: ['Sa', 're', 'Ga', 'ma', 'Pa', 'dha', 'Ni', 'Tar Sa'],
    tuning: 'Pa',
    time: 'Dawn (Sunrise)',
    mood: 'Majestic, Meditative & Somber'
  },
  Bhupali: {
    name: 'Bhupali',
    thaat: 'Kalyan',
    vadi: 'Ga',
    samvadi: 'Dha',
    swaras: ['Sa', 'Re', 'Ga', 'Pa', 'Dha', 'Tar Sa'],
    tuning: 'Pa',
    time: 'First Prahar of Night',
    mood: 'Shringara, Peace & Joy'
  },
  Malkauns: {
    name: 'Malkauns',
    thaat: 'Bhairavi',
    vadi: 'ma',
    samvadi: 'Sa',
    swaras: ['Sa', 'ga', 'ma', 'dha', 'ni', 'Tar Sa'],
    tuning: 'Ma', // Crucial: Malkauns has no Pa, tuned to Ma
    time: 'Late Night (Midnight to 3 AM)',
    mood: 'Profound, Meditative & Introspective'
  },
  Bageshree: {
    name: 'Bageshree',
    thaat: 'Kafi',
    vadi: 'ma',
    samvadi: 'Sa',
    swaras: ['Sa', 'Re', 'ga', 'ma', 'dha', 'ni', 'Tar Sa'],
    tuning: 'Ma',
    time: 'Midnight',
    mood: 'Longing, Love & Emotion'
  },
  Darbari: {
    name: 'Darbari Kanada',
    thaat: 'Asavari',
    vadi: 'Re',
    samvadi: 'Pa',
    swaras: ['Sa', 'Re', 'ga', 'ma', 'Pa', 'dha', 'ni', 'Tar Sa'],
    tuning: 'Pa',
    time: 'Late Night',
    mood: 'Grand, Solemn & Gravity'
  },
  Bihag: {
    name: 'Bihag',
    thaat: 'Bilawal',
    vadi: 'Ga',
    samvadi: 'Ni',
    swaras: ['Sa', 'Re', 'Ga', 'ma', "Ma'", 'Pa', 'Dha', 'Ni', 'Tar Sa'],
    tuning: 'Pa',
    time: 'Second Prahar of Night',
    mood: 'Romantic, Celebratory & Sweet'
  },
  Todi: {
    name: 'Miyan Ki Todi',
    thaat: 'Todi',
    vadi: 'dha',
    samvadi: 'ga',
    swaras: ['Sa', 're', 'ga', "Ma'", 'Pa', 'dha', 'Ni', 'Tar Sa'],
    tuning: 'Pa',
    time: 'Morning (Late Morning)',
    mood: 'Pathos, Yearning & Deep Prayer'
  }
};

export default function RiyazPage() {
  const { selectedTonicHz, setSelectedTonic, selectedRaga, setSelectedRaga } = useSwaraStore();

  // State
  const [tonicHz, setTonicHzState] = useState<number>(selectedTonicHz || 138.59);
  const [ragaKey, setRagaKeyState] = useState<string>(selectedRaga || 'Yaman');
  const [tuningPreset, setTuningPreset] = useState<TanpuraTuningPreset>('Pa');
  const [tempoBpm, setTempoBpm] = useState<number>(68);
  const [volume, setVolumeState] = useState<number>(0.65);
  const [fineTuneCents, setFineTuneCents] = useState<number>(0);
  const [isTanpuraPlaying, setIsTanpuraPlaying] = useState<boolean>(false);
  const [activePluckedString, setActivePluckedString] = useState<number | null>(null);

  // Taal State
  const [selectedTaal, setSelectedTaal] = useState<string>('Teentaal');
  const [taalBpm, setTaalBpm] = useState<number>(75);
  const [isTaalPlaying, setIsTaalPlaying] = useState<boolean>(false);
  const [currentBeatIdx, setCurrentBeatIdx] = useState<number>(0);
  const [currentBol, setCurrentBol] = useState<string>('');

  // Active playing swara tone
  const [playingSwaraKey, setPlayingSwaraKey] = useState<string | null>(null);

  // Engine references
  const tanpuraRef = useRef<TanpuraEngine | null>(null);
  const harmoniumRef = useRef<SwaraHarmoniumEngine | null>(null);
  const taalRef = useRef<TaalMetronomeEngine | null>(null);

  // Active raga metadata
  const currentRagaInfo = RAGA_DATABASE[ragaKey] || RAGA_DATABASE['Yaman'];

  // Sync with global store
  const handleTonicChange = (newVal: number) => {
    setTonicHzState(newVal);
    const matched = TONIC_OPTIONS.find(o => Math.abs(o.val - newVal) < 0.1);
    setSelectedTonic(matched ? matched.note : 'Custom', newVal);
  };

  const handleRagaChange = (newRaga: string) => {
    setRagaKeyState(newRaga);
    setSelectedRaga(newRaga);
    if (RAGA_DATABASE[newRaga]) {
      setTuningPreset(RAGA_DATABASE[newRaga].tuning);
    }
  };

  // Initialize Audio Engines
  useEffect(() => {
    tanpuraRef.current = new TanpuraEngine({
      tonicHz,
      preset: tuningPreset,
      tempoBpm,
      volume,
      fineTuneCents,
      onPluck: (strIdx) => {
        setActivePluckedString(strIdx);
        setTimeout(() => {
          setActivePluckedString(null);
        }, 500);
      }
    });

    harmoniumRef.current = new SwaraHarmoniumEngine();

    taalRef.current = new TaalMetronomeEngine(selectedTaal, taalBpm, (beatIdx, bol) => {
      setCurrentBeatIdx(beatIdx);
      setCurrentBol(bol);
    });

    return () => {
      tanpuraRef.current?.dispose();
      taalRef.current?.dispose();
    };
  }, []);

  // Update dynamic Tanpura parameters
  useEffect(() => {
    if (tanpuraRef.current) {
      tanpuraRef.current.updateTuning(tonicHz, tuningPreset, fineTuneCents);
      tanpuraRef.current.setVolume(volume);
    }
  }, [tonicHz, tuningPreset, fineTuneCents, volume]);

  useEffect(() => {
    if (tanpuraRef.current) {
      tanpuraRef.current.setTempo(tempoBpm);
    }
  }, [tempoBpm]);

  // Update dynamic Taal parameters
  useEffect(() => {
    if (taalRef.current) {
      taalRef.current.setTaal(selectedTaal);
      taalRef.current.setBpm(taalBpm);
    }
  }, [selectedTaal, taalBpm]);

  // Toggle Tanpura
  const toggleTanpura = () => {
    if (!tanpuraRef.current) return;
    if (isTanpuraPlaying) {
      tanpuraRef.current.stop();
      setIsTanpuraPlaying(false);
      setActivePluckedString(null);
    } else {
      tanpuraRef.current.start();
      setIsTanpuraPlaying(true);
    }
  };

  // Toggle Taal Metronome
  const toggleTaal = () => {
    if (!taalRef.current) return;
    if (isTaalPlaying) {
      taalRef.current.stop();
      setIsTaalPlaying(false);
      setCurrentBeatIdx(0);
      setCurrentBol('');
    } else {
      taalRef.current.start();
      setIsTaalPlaying(true);
    }
  };

  // Play Swara Tone
  const playSwaraTone = useCallback((swara: SwaraToneInfo) => {
    if (!harmoniumRef.current) return;
    const effTonic = tonicHz * Math.pow(2, fineTuneCents / 1200);
    const swaraFreq = effTonic * swara.ratio;
    harmoniumRef.current.playSwara(swaraFreq, swara.name, 1.4);
    setPlayingSwaraKey(swara.name);
    setTimeout(() => {
      setPlayingSwaraKey((prev) => (prev === swara.name ? null : prev));
    }, 1200);
  }, [tonicHz, fineTuneCents]);

  const activeTaalDef = CLASSICAL_TAALS[selectedTaal] || CLASSICAL_TAALS['Teentaal'];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-slate-800 antialiased selection:bg-amber-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 text-white p-8 md:p-10 shadow-xl border border-amber-600/30">
          <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-medium tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Virtual Riyaz Companion • 22 Shrutis & Tanpura Drone
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                Acoustic Riyaz Studio
                <span className="text-xl md:text-2xl font-normal text-amber-200/80 font-serif">
                  (सुर साधना)
                </span>
              </h1>
              <p className="text-amber-100/80 max-w-2xl text-sm md:text-base leading-relaxed">
                Practice pitch stability, shruti precision, and vocal intonation against an authentic 
                harmonic acoustic Tanpura drone and classical Taal accompaniment.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/analyze?raga=${encodeURIComponent(ragaKey)}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-lg hover:shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 text-sm"
              >
                <Mic className="w-4 h-4" />
                Sing Along & Analyze
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Global Raga & Tonic Selection Bar */}
        <div className="bg-white rounded-2xl p-5 border border-amber-900/10 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Raga Selector */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Raga:</span>
              <select
                value={ragaKey}
                onChange={(e) => handleRagaChange(e.target.value)}
                className="bg-amber-50/70 border border-amber-200/80 rounded-xl px-3.5 py-2 text-sm font-semibold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer"
              >
                {Object.keys(RAGA_DATABASE).map((k) => (
                  <option key={k} value={k}>
                    {RAGA_DATABASE[k].name} ({RAGA_DATABASE[k].thaat})
                  </option>
                ))}
              </select>
            </div>

            {/* Tonic Sa Selector */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tonic (Sa):</span>
              <select
                value={tonicHz}
                onChange={(e) => handleTonicChange(parseFloat(e.target.value))}
                className="bg-amber-50/70 border border-amber-200/80 rounded-xl px-3.5 py-2 text-sm font-semibold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer"
              >
                {TONIC_OPTIONS.map((opt) => (
                  <option key={opt.val} value={opt.val}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Raga Info Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-medium">
              Vadi: <strong className="text-amber-950 font-bold">{currentRagaInfo.vadi}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-900 font-medium">
              Samvadi: <strong className="text-orange-950 font-bold">{currentRagaInfo.samvadi}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              {currentRagaInfo.time}
            </span>
          </div>
        </div>

        {/* Studio Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Acoustic Tanpura Drone (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Main Tanpura Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                    <Disc className={`w-5 h-5 ${isTanpuraPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Acoustic Tanpura Drone</h2>
                    <p className="text-xs text-slate-500">4-String Jawari Harmonic Simulation</p>
                  </div>
                </div>

                {/* Master Play Button */}
                <button
                  onClick={toggleTanpura}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all transform active:scale-95 shadow-md ${
                    isTanpuraPlaying
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25 ring-4 ring-rose-100'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25 ring-4 ring-amber-100'
                  }`}
                >
                  {isTanpuraPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      Stop Tanpura
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Start Drone
                    </>
                  )}
                </button>
              </div>

              {/* 4-STRING ACOUSTIC VISUALIZER */}
              <div className="relative my-8 py-8 px-6 bg-gradient-to-b from-[#2E190E] via-[#3B2112] to-[#1F1008] rounded-2xl border-4 border-[#54301B] shadow-inner text-amber-100">
                <div className="text-center text-[10px] tracking-widest text-amber-400 uppercase font-mono mb-4">
                  Acoustic Bridge (Jawari Thread Resonance)
                </div>

                <div className="grid grid-cols-4 gap-4 h-48 relative items-center justify-items-center">
                  {[
                    { label: `String 1 (${tuningPreset})`, note: tuningPreset, sub: 'First Pitch' },
                    { label: 'String 2 (Sa)', note: 'Sa', sub: 'Tar Jodi 1' },
                    { label: 'String 3 (Sa\')', note: 'Sa', sub: 'Tar Jodi 2' },
                    { label: 'String 4 (Mandra Sa)', note: '.Sa', sub: 'Kharja Bass' },
                  ].map((str, idx) => {
                    const isPlucked = activePluckedString === idx;
                    return (
                      <div key={idx} className="flex flex-col items-center h-full justify-between w-full">
                        {/* Note badge */}
                        <div
                          className={`text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-300 ${
                            isPlucked
                              ? 'bg-amber-400 text-slate-950 scale-110 shadow-lg shadow-amber-400/50'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          }`}
                        >
                          {str.note}
                        </div>

                        {/* Physical String Wire */}
                        <div className="relative w-full flex justify-center h-28 items-center">
                          <div
                            className={`w-0.5 rounded-full transition-all duration-150 ${
                              isPlucked
                                ? 'bg-amber-300 shadow-[0_0_12px_#F59E0B] scale-x-150 animate-pulse'
                                : 'bg-amber-600/60'
                            }`}
                            style={{
                              height: '100%',
                              transform: isPlucked ? 'scaleX(2.5)' : 'scaleX(1)'
                            }}
                          />
                          {isPlucked && (
                            <div className="absolute w-8 h-8 rounded-full bg-amber-400/20 blur-sm pointer-events-none animate-ping" />
                          )}
                        </div>

                        {/* Sub label */}
                        <div className="text-[10px] text-amber-200/60 font-mono text-center">
                          {str.sub}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                
                {/* Tuning Preset (Pa / Ma / Ni) */}
                <div className="space-y-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>First String Tuning:</span>
                    <span className="text-[10px] text-slate-400 font-normal">Raga Dependent</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Pa', 'Ma', 'Ni'] as TanpuraTuningPreset[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setTuningPreset(p)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                          tuningPreset === p
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-white text-slate-700 hover:bg-amber-100/50 border border-slate-200'
                        }`}
                      >
                        {p}-Tuning
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 italic mt-1">
                    {tuningPreset === 'Pa' && '• Standard for Yaman, Bhairav, Bhupali, Bilawal'}
                    {tuningPreset === 'Ma' && '• Essential for Malkauns, Bageshree, Marwa (No Pa)'}
                    {tuningPreset === 'Ni' && '• Characteristic for Marwa, Puriya, Darbari'}
                  </p>
                </div>

                {/* Pluck Tempo */}
                <div className="space-y-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Plucking Tempo:</span>
                    <span className="text-amber-800 font-mono">{tempoBpm} BPM</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="110"
                    step="2"
                    value={tempoBpm}
                    onChange={(e) => setTempoBpm(parseInt(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Vilambit (Slow)</span>
                    <span>Madhyalay (Medium)</span>
                    <span>Drut (Fast)</span>
                  </div>
                </div>

                {/* Microtonal Fine Tuning Slider */}
                <div className="space-y-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Microtonal Calibration:</span>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-amber-800">
                        {fineTuneCents > 0 ? `+${fineTuneCents}` : fineTuneCents} cents
                      </span>
                      {fineTuneCents !== 0 && (
                        <button
                          onClick={() => setFineTuneCents(0)}
                          className="text-[10px] text-slate-400 hover:text-amber-700 underline"
                        >
                          reset
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={fineTuneCents}
                    onChange={(e) => setFineTuneCents(parseInt(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>-50 cents</span>
                    <span>Exact Pitch (0)</span>
                    <span>+50 cents</span>
                  </div>
                </div>

                {/* Master Volume */}
                <div className="space-y-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Drone Volume:</span>
                    <span className="text-amber-800 font-mono">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolumeState(parseFloat(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Soft</span>
                    <span>Acoustic Balance</span>
                    <span>Loud</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TAAL METRONOME (Theka & Rhythm Accompaniment) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-md">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-800">
                    <Activity className={`w-5 h-5 ${isTaalPlaying ? 'animate-pulse' : ''}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Taal Accompaniment (Theka)</h2>
                    <p className="text-xs text-slate-500">Classical Rhythmic Cycles & Visual Bols</p>
                  </div>
                </div>

                {/* Taal Start/Stop Button */}
                <button
                  onClick={toggleTaal}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                    isTaalPlaying
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {isTaalPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      Stop Taal
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Start Taal
                    </>
                  )}
                </button>
              </div>

              {/* Taal & BPM selector */}
              <div className="flex flex-wrap items-center gap-4 mb-6 bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                <div className="flex-1 min-w-[180px]">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Select Taal:</label>
                  <select
                    value={selectedTaal}
                    onChange={(e) => setSelectedTaal(e.target.value)}
                    className="w-full bg-white border border-orange-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    {Object.keys(CLASSICAL_TAALS).map((t) => (
                      <option key={t} value={t}>
                        {CLASSICAL_TAALS[t].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[180px]">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Laya / Tempo:</span>
                    <span className="font-mono text-orange-800">{taalBpm} BPM</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    step="5"
                    value={taalBpm}
                    onChange={(e) => setTaalBpm(parseInt(e.target.value))}
                    className="w-full accent-orange-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Live Matra Indicator Strip */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Matras & Bols:</span>
                  {isTaalPlaying && (
                    <span className="font-mono text-xs font-bold text-orange-600 animate-pulse">
                      Matra {currentBeatIdx + 1} / {activeTaalDef.totalBeats}: &quot;{currentBol}&quot;
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-8 sm:grid-cols-8 md:grid-cols-16 gap-1.5">
                  {activeTaalDef.bols.map((bol, idx) => {
                    const isCurrent = isTaalPlaying && currentBeatIdx === idx;
                    const type = activeTaalDef.types[idx];
                    const isSam = type === 'sam';
                    const isKhaali = type === 'khaali';

                    return (
                      <div
                        key={idx}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all ${
                          isCurrent
                            ? 'bg-orange-600 text-white font-extrabold scale-110 shadow-md ring-2 ring-orange-300'
                            : isSam
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                            : isKhaali
                            ? 'bg-slate-100 text-slate-500 border border-dashed border-slate-300'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span className="text-[9px] opacity-70 font-mono">
                          {isSam ? 'X' : isKhaali ? '0' : idx + 1}
                        </span>
                        <span className="text-xs font-semibold truncate w-full">{bol}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 12-Swara Harmonium Soundboard & Shruti Reference (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Virtual Swara Keyboard</h2>
                    <p className="text-xs text-slate-500">22 Shrutis • Pure Just Intonation</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Click any Swara below to hear its exact microtonal reference frequency against your selected tonic Sa ({tonicHz} Hz). 
                Notes active in <strong>Raga {currentRagaInfo.name}</strong> are highlighted.
              </p>

              {/* Swara Keyboard Grid */}
              <div className="space-y-2">
                {SWARA_JUST_RATIOS.map((swara) => {
                  const isRagaSwara = currentRagaInfo.swaras.includes(swara.name);
                  const isVadi = currentRagaInfo.vadi === swara.name;
                  const isSamvadi = currentRagaInfo.samvadi === swara.name;
                  const isPlaying = playingSwaraKey === swara.name;
                  const effTonic = tonicHz * Math.pow(2, fineTuneCents / 1200);
                  const noteFreq = (effTonic * swara.ratio).toFixed(1);

                  return (
                    <button
                      key={swara.name}
                      onClick={() => playSwaraTone(swara)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-150 text-left border ${
                        isPlaying
                          ? 'bg-amber-500 text-white border-amber-600 shadow-md transform scale-[1.02]'
                          : isVadi
                          ? 'bg-amber-100/80 hover:bg-amber-200/80 border-amber-300 text-amber-950 font-semibold'
                          : isSamvadi
                          ? 'bg-orange-100/70 hover:bg-orange-200/70 border-orange-300 text-orange-950 font-semibold'
                          : isRagaSwara
                          ? 'bg-amber-50/50 hover:bg-amber-100/60 border-amber-200 text-slate-800'
                          : 'bg-slate-50/60 hover:bg-slate-100/70 border-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Note Name */}
                        <div className="flex flex-col">
                          <span className="text-sm font-bold flex items-center gap-2">
                            {swara.name}
                            <span className="text-xs font-normal opacity-70 font-serif">
                              ({swara.devanagari})
                            </span>
                          </span>
                          <span className="text-[10px] opacity-70 font-mono">
                            {swara.cents} cents • {swara.ratioStr}
                          </span>
                        </div>
                      </div>

                      {/* Right Tag / Badge */}
                      <div className="flex items-center gap-2">
                        {isVadi && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wide">
                            Vadi
                          </span>
                        )}
                        {isSamvadi && (
                          <span className="px-2 py-0.5 rounded-md bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wide">
                            Samvadi
                          </span>
                        )}
                        {!isRagaSwara && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Varjit
                          </span>
                        )}
                        <span className="text-xs font-mono font-medium opacity-80 min-w-[55px] text-right">
                          {noteFreq} Hz
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Practice Tip Box */}
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent rounded-3xl p-6 border border-amber-500/20">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                Riyaz Recommendation for {currentRagaInfo.name}
              </h3>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>
                  Set your Tanpura to <strong>{currentRagaInfo.tuning}-Tuning</strong> and hold your fundamental <strong>Sa</strong> for at least 8 breaths.
                </li>
                <li>
                  Pay special attention to the Vadi note <strong>({currentRagaInfo.vadi})</strong>; hold it sustained without shaking to train your vocal intonation.
                </li>
                <li>
                  When you feel in tune, switch to the <strong>Sing Along & Analyze</strong> mode to get your real-time pYIN pitch curve and 5-factor transparent score.
                </li>
              </ul>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
