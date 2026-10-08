'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SwaraIndicator from '@/components/swara/SwaraIndicator';
import ShrutiDial from '@/components/swara/ShrutiDial';
import PitchGraph, { PitchPoint } from '@/components/pitch/PitchGraph';
import AudioRecorder from '@/components/audio/AudioRecorder';
import { 
  Music, Mic, Settings, Play, Pause, Award, 
  Sparkles, Layers, Sliders, ArrowRight, CheckCircle, RefreshCw, Volume2 
} from 'lucide-react';
import { useSwaraStore } from '@/lib/store';
import { audioApi, ragasApi } from '@/lib/api';

const TONIC_OPTIONS = [
  { label: "C3 (130.81 Hz)", val: 130.81, note: "C3" },
  { label: "C#3 (138.59 Hz) - Standard Male", val: 138.59, note: "C#3" },
  { label: "D3 (146.83 Hz)", val: 146.83, note: "D3" },
  { label: "D#3 (155.56 Hz)", val: 155.56, note: "D#3" },
  { label: "E3 (164.81 Hz)", val: 164.81, note: "E3" },
  { label: "F3 (174.61 Hz)", val: 174.61, note: "F3" },
  { label: "G#3 (207.65 Hz) - Standard Female", val: 207.65, note: "G#3" },
  { label: "A3 (220.00 Hz)", val: 220.00, note: "A3" },
  { label: "A#3 (233.08 Hz)", val: 233.08, note: "A#3" },
  { label: "B3 (246.94 Hz)", val: 246.94, note: "B3" },
];

const NOMINAL_SWARAS = [
  { name: "Sa", semitone: 0 },
  { name: "re", semitone: 1 },
  { name: "Re", semitone: 2 },
  { name: "ga", semitone: 3 },
  { name: "Ga", semitone: 4 },
  { name: "ma", semitone: 5 },
  { name: "Ma'", semitone: 6 },
  { name: "Pa", semitone: 7 },
  { name: "dha", semitone: 8 },
  { name: "Dha", semitone: 9 },
  { name: "ni", semitone: 10 },
  { name: "Ni", semitone: 11 },
];

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedTonicHz, setSelectedTonic, selectedRaga, setSelectedRaga, setLastAnalysis } = useSwaraStore();

  const [tonic, setTonic] = useState<number>(selectedTonicHz || 138.59);
  const [ragaName, setRagaName] = useState<string>(searchParams.get('raga') || selectedRaga || 'Yaman');
  const [exercise, setExercise] = useState<string>('Sa-Pa Stability Practice');
  const [analysisMode, setAnalysisMode] = useState<'swara' | 'shruti'>('swara');

  // Real-time live pitch states
  const [liveFreq, setLiveFreq] = useState<number>(0);
  const [liveSwara, setLiveSwara] = useState<string>('Sa');
  const [liveCents, setLiveCents] = useState<number>(0);
  const [liveDeviation, setLiveDeviation] = useState<number>(0);
  const [pitchHistory, setPitchHistory] = useState<PitchPoint[]>([]);
  const [isLiveListening, setIsLiveListening] = useState<boolean>(false);
  const [analyzingBlob, setAnalyzingBlob] = useState<boolean>(false);

  // Audio Context for live pitch tracker
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Auto-correlation pitch detection for real-time responsiveness
  const autoCorrelate = (buf: Float32Array, sampleRate: number): number => {
    let SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      const val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.02) return -1; // Unvoiced / silence threshold

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    const c = new Float32Array(SIZE);
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] = c[i] + buf[j] * buf[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;
    if (maxval < 0.01) return -1;

    // Parabolic interpolation around peak
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  };

  // Convert Hz to Swara & Cents
  const mapFrequencyToSwara = useCallback((freq: number, saFreq: number) => {
    if (freq <= 40 || freq > 1500) return;

    // C = 1200 * log2(freq / saFreq)
    const rawCents = 1200 * Math.log2(freq / saFreq);
    const modCents = ((rawCents % 1200) + 1200) % 1200;

    // Find nearest 12-semitone note
    const semitone = Math.round(modCents / 100) % 12;
    const targetCents = semitone * 100;
    const dev = modCents - targetCents;
    const matchedSwara = NOMINAL_SWARAS[semitone].name;

    setLiveFreq(freq);
    setLiveSwara(matchedSwara);
    setLiveCents(modCents);
    setLiveDeviation(dev);

    // Update real-time contour history
    setPitchHistory((prev) => {
      const now = prev.length > 0 ? prev[prev.length - 1].time + 0.1 : 0;
      const nextPoint: PitchPoint = {
        time: parseFloat(now.toFixed(2)),
        frequency: parseFloat(freq.toFixed(1)),
        cents: parseFloat(modCents.toFixed(1)),
        swara: matchedSwara,
        deviation: parseFloat(dev.toFixed(1)),
        confidence: 0.95,
      };
      return [...prev.slice(-60), nextPoint];
    });
  }, []);

  // Start live mic pitch tracking
  const startLivePitchTracker = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);

      const updatePitch = () => {
        analyser.getFloatTimeDomainData(buffer);
        const pitch = autoCorrelate(buffer, audioCtx.sampleRate);

        if (pitch !== -1 && pitch >= 60 && pitch <= 1000) {
          mapFrequencyToSwara(pitch, tonic);
        } else {
          setLiveFreq(0);
          setLiveDeviation(0);
        }

        animFrameRef.current = requestAnimationFrame(updatePitch);
      };

      setIsLiveListening(true);
      updatePitch();
    } catch (err) {
      console.error("Microphone pitch tracking failed:", err);
    }
  };

  const stopLivePitchTracker = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsLiveListening(false);
    setLiveFreq(0);
  };

  const handleTonicChange = (newVal: number) => {
    setTonic(newVal);
    setSelectedTonic(newVal);
  };

  // Submit audio blob for comprehensive server-side MIR analysis
  const handleAudioReady = async (blob: Blob, file?: File) => {
    setAnalyzingBlob(true);
    try {
      const formData = new FormData();
      const uploadFile = file || new File([blob], 'riyaz_practice.webm', { type: blob.type || 'audio/webm' });
      formData.append('file', uploadFile);
      formData.append('target_raga', ragaName);
      formData.append('manual_tonic_hz', tonic.toString());

      const res = await audioApi.analyze(formData);
      setLastAnalysis(res.data);
      router.push(`/analyze/${res.data.session_id || 'latest'}`);
    } catch (err) {
      console.error("MIR audio analysis error:", err);
      // Fallback: navigate with state
      router.push(`/analyze/latest?raga=${encodeURIComponent(ragaName)}&tonic=${tonic}`);
    } finally {
      setAnalyzingBlob(false);
    }
  };

  useEffect(() => {
    return () => {
      stopLivePitchTracker();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 font-semibold">
                Interactive Riyaz Studio
              </span>
              <span className="text-xs text-slate-500 font-mono font-medium">Real-Time Pitch & Intonation</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-serif tracking-tight">
              Sadhana & Live Vocal Practice
            </h1>
          </div>

          {/* Live Mic pitch tracker switch */}
          <div className="flex items-center gap-3">
            <button
              onClick={isLiveListening ? stopLivePitchTracker : startLivePitchTracker}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer ${
                isLiveListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isLiveListening ? 'Stop Live Pitch Sensor' : 'Start Live Pitch Sensor'}</span>
            </button>
          </div>
        </div>

        {/* Configuration Bar: Tonic Sa + Raga + Exercise + Mode */}
        <div className="glass-card p-4 rounded-2xl border border-amber-300 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center shadow-md">
          
          {/* Tonic Sa Selector */}
          <div>
            <label className="text-[11px] font-mono text-slate-600 block mb-1 font-semibold">
              Tonic Sa (Fundamental Pitch):
            </label>
            <select
              value={tonic}
              onChange={(e) => handleTonicChange(parseFloat(e.target.value))}
              className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono text-amber-900 font-bold focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              {TONIC_OPTIONS.map((opt) => (
                <option key={opt.val} value={opt.val}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Raga Selector */}
          <div>
            <label className="text-[11px] font-mono text-slate-600 block mb-1 font-semibold">
              Target Raga:
            </label>
            <select
              value={ragaName}
              onChange={(e) => {
                setRagaName(e.target.value);
                setSelectedRaga(e.target.value);
              }}
              className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 font-semibold focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              {['Yaman', 'Bhairav', 'Bhairavi', 'Bhupali', 'Bageshri', 'Darbari Kanada', 'Malkauns', 'Kafi', 'Todi', 'Marwa', 'Desh', 'Hamsadhwani'].map((r) => (
                <option key={r} value={r}>Raga {r}</option>
              ))}
            </select>
          </div>

          {/* Exercise Selector */}
          <div>
            <label className="text-[11px] font-mono text-slate-600 block mb-1 font-semibold">
              Practice Drill:
            </label>
            <select
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="Sa-Pa Stability Practice">Sa-Pa Stability Practice</option>
              <option value="Aroha & Avaroha Slow Ascent">Aroha & Avaroha Slow Ascent</option>
              <option value="Pakad Signature Phrase">Pakad Signature Phrase</option>
              <option value="Alankar: Sa-Re-Ga, Re-Ga-Ma">Alankar: S-R-G, R-G-M</option>
              <option value="Long Note Gandhar Hold">Long Note Gandhar Hold</option>
              <option value="Free Riyaz / Khayal Alap">Free Riyaz / Khayal Alap</option>
            </select>
          </div>

          {/* Analysis View Mode */}
          <div>
            <label className="text-[11px] font-mono text-slate-600 block mb-1 font-semibold">
              Visualization Mode:
            </label>
            <div className="grid grid-cols-2 gap-1 bg-amber-50/80 p-1 rounded-xl border border-amber-200">
              <button
                onClick={() => setAnalysisMode('swara')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  analysisMode === 'swara'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Swara
              </button>
              <button
                onClick={() => setAnalysisMode('shruti')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  analysisMode === 'shruti'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                22-Shruti
              </button>
            </div>
          </div>

        </div>

        {/* Central Practice Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Left Column: Intonation Indicators (Swara / 22-Shruti Dial) */}
          <div className="lg:col-span-1 space-y-6">
            <SwaraIndicator
              swara={liveSwara}
              frequency={liveFreq}
              cents={liveCents}
              deviation={liveDeviation}
              tonic={tonic}
              confidence={isLiveListening ? 0.95 : 0}
            />

            {analysisMode === 'shruti' && (
              <ShrutiDial
                currentCents={liveCents}
                nearestShrutiName={liveSwara}
              />
            )}

            {/* Target Raga Quick Guide */}
            <div className="glass-card p-5 rounded-2xl border border-amber-500/20 text-xs">
              <div className="flex items-center gap-2 mb-3">
                <Music className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-white font-serif text-sm">Raga {ragaName} Guidelines</h4>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed mb-3">
                Maintain steady breath control. Listen carefully to the drone frequency of Sa ({tonic.toFixed(1)} Hz) and Pa ({(tonic * 1.5).toFixed(1)} Hz).
              </p>
              <div className="p-2.5 rounded-lg bg-[#090D16] border border-gray-800 font-mono text-[11px] text-amber-200">
                Drill: {exercise}
              </div>
            </div>
          </div>

          {/* Right Column (2 cols): Real-Time Pitch Contour Chart & Audio Capture */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Pitch Contour */}
            <PitchGraph
              pitchPoints={pitchHistory}
              referenceSa={tonic}
              targetRaga={ragaName}
              title={`Live Melodic Contour — Raga ${ragaName}`}
              subtitle="Fundamental frequency contour mapped relative to selected tonic Sa"
              height={320}
            />

            {/* Audio Capture Studio */}
            <AudioRecorder
              onAudioReady={handleAudioReady}
              tonicFrequency={tonic}
            />

            {analyzingBlob && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-3 text-amber-300 text-sm animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing singing audio through MIR pipeline (pYIN + Swara + Raga evaluation)...</span>
              </div>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function PracticePage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#FAF8F5]" />}>
      <PracticeContent />
    </React.Suspense>
  );
}
