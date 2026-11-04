'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SwaraIndicator from '@/components/swara/SwaraIndicator';
import ShrutiDial from '@/components/swara/ShrutiDial';
import { 
  findNearestShruti, 
  CANONICAL_SWARA_CENTERS, 
  CANONICAL_22_SHRUTIS, 
  RAGA_SHRUTI_PREFERENCES 
} from '@/lib/mir/shrutis';
import PitchGraph, { PitchPoint } from '@/components/pitch/PitchGraph';
import AudioRecorder from '@/components/audio/AudioRecorder';
import { 
  Music, Mic, Settings, Play, Pause, Award, 
  Sparkles, Layers, Sliders, ArrowRight, CheckCircle, RefreshCw, Volume2 
} from 'lucide-react';
import { useSwaraStore } from '@/lib/store';
import { audioApi, ragasApi } from '@/lib/api';
import { decodeAndAnalyzeAudio } from '@/lib/mir/audioDecoder';

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

  // McLeod Pitch Method (MPM) / Normalized Square Difference Function (NSDF)
  // Provides sub-cent frequency accuracy and eliminates octave jumping
  const detectPitchMPM = (buf: Float32Array, sampleRate: number): number => {
    const SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      rms += buf[i] * buf[i];
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.015) return -1; // Unvoiced / silence threshold

    // Autocorrelation and Normalized Square Difference
    const maxLag = Math.min(SIZE - 1, Math.floor(sampleRate / 60)); // ~60 Hz lowest note
    const minLag = Math.floor(sampleRate / 1050); // ~1050 Hz highest note
    const nsdf = new Float32Array(maxLag);

    for (let tau = 0; tau < maxLag; tau++) {
      let acf = 0;
      let m = 0;
      for (let i = 0; i < SIZE - tau; i++) {
        acf += buf[i] * buf[i + tau];
        m += buf[i] * buf[i] + buf[i + tau] * buf[i + tau];
      }
      nsdf[tau] = m > 0 ? (2 * acf) / m : 0;
    }

    // Find candidate peak with highest normalized autocorrelation above threshold
    const peaks: number[] = [];
    let maxVal = 0;
    for (let tau = minLag; tau < maxLag - 1; tau++) {
      if (nsdf[tau] > 0.45 && nsdf[tau] > nsdf[tau - 1] && nsdf[tau] >= nsdf[tau + 1]) {
        peaks.push(tau);
        if (nsdf[tau] > maxVal) {
          maxVal = nsdf[tau];
        }
      }
    }

    if (peaks.length === 0 || maxVal < 0.45) return -1;

    // Canonical MPM: Pick the first peak within 0.88 of max peak to prevent subharmonic octave halving
    const cutoff = maxVal * 0.88;
    let bestLag = peaks[0];
    for (const p of peaks) {
      if (nsdf[p] >= cutoff) {
        bestLag = p;
        break;
      }
    }

    // 3-point parabolic peak interpolation for sub-sample precision (<0.1 Hz resolution)
    const x1 = nsdf[bestLag - 1];
    const x2 = nsdf[bestLag];
    const x3 = nsdf[bestLag + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    const delta = a !== 0 ? -b / (2 * a) : 0;
    const refinedLag = bestLag + delta;

    return sampleRate / refinedLag;
  };

  // Convert Hz to Swara & 22-Shruti with Just Intonation precision
  const mapFrequencyToSwara = useCallback((freq: number, saFreq: number) => {
    if (freq <= 40 || freq > 1500 || saFreq <= 0) return;

    // C = 1200 * log2(freq / saFreq)
    const rawCents = 1200 * Math.log2(freq / saFreq);
    const modCents = ((rawCents % 1200) + 1200) % 1200;

    // Authentic Indian Classical 22-Shruti match with active Raga microtonal context
    const match = findNearestShruti(modCents, ragaName);

    let displaySwara = match.canonical_swara;
    let displayDev = match.delta_cents;

    if (analysisMode === 'shruti') {
      displaySwara = `${match.swara} (${match.shruti_name})`;
      displayDev = match.delta_cents;
    } else {
      // Swara Mode: authentic Just Intonation center (e.g. 386.3 cents for Ga, 590.2 for Ma', etc.)
      const canonical = match.canonical_swara;
      displaySwara = canonical;

      // Check if active raga has a preferred microtonal center for this swara
      const ragaPrefIdx = RAGA_SHRUTI_PREFERENCES[ragaName]?.[canonical];
      let targetCents = CANONICAL_SWARA_CENTERS[canonical]?.cents ?? match.shruti.cents;
      if (ragaPrefIdx && CANONICAL_22_SHRUTIS[ragaPrefIdx - 1]) {
        targetCents = CANONICAL_22_SHRUTIS[ragaPrefIdx - 1].cents;
      }

      let dev = modCents - targetCents;
      if (dev > 600) dev -= 1200;
      else if (dev < -600) dev += 1200;
      displayDev = Math.round(dev * 10) / 10;
    }

    setLiveFreq(freq);
    setLiveSwara(displaySwara);
    setLiveCents(Math.round(modCents * 10) / 10);
    setLiveDeviation(displayDev);

    // Update real-time contour history
    setPitchHistory((prev) => {
      const now = prev.length > 0 ? prev[prev.length - 1].time + 0.05 : 0;
      const nextPoint: PitchPoint = {
        time: parseFloat(now.toFixed(2)),
        frequency: parseFloat(freq.toFixed(1)),
        cents: parseFloat(modCents.toFixed(1)),
        swara: displaySwara,
        deviation: parseFloat(displayDev.toFixed(1)),
        confidence: 0.98,
      };
      return [...prev.slice(-60), nextPoint];
    });
  }, [analysisMode, ragaName]);

  const mapFrequencyToSwaraRef = useRef(mapFrequencyToSwara);
  mapFrequencyToSwaraRef.current = mapFrequencyToSwara;
  const tonicRef = useRef(tonic);
  tonicRef.current = tonic;

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
        const pitch = detectPitchMPM(buffer, audioCtx.sampleRate);

        if (pitch !== -1 && pitch >= 60 && pitch <= 1000) {
          mapFrequencyToSwaraRef.current(pitch, tonicRef.current);
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
    const uploadFile = file || new File([blob], 'riyaz_practice.webm', { type: blob.type || 'audio/webm' });
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('audio_file', uploadFile);
      formData.append('target_raga', ragaName);
      formData.append('manual_tonic_hz', tonic.toString());
      formData.append('user_sa_hz', tonic.toString());
      formData.append('user_sa', tonic.toString());

      const res = await audioApi.analyze(formData);
      setLastAnalysis(res.data);
      router.push(`/analyze/${res.data.session_id || 'latest'}`);
    } catch (err: any) {
      console.warn("MIR audio analysis network error, running client-side MIR engine:", err);
      const errData = err?.response?.data;
      if (errData && (errData.status === 'unclear_audio' || errData.status === 'silent_audio' || errData.is_valid_audio === false)) {
        setLastAnalysis(errData);
        router.push(`/analyze/quality-alert`);
        return;
      }
      
      // Client-side real audio decoding fallback
      try {
        const clientAnalysis = await decodeAndAnalyzeAudio(uploadFile, {
          targetRaga: ragaName,
          manualTonicHz: tonic
        });
        setLastAnalysis(clientAnalysis as any);
        router.push(`/analyze/${clientAnalysis.session_id || 'latest'}`);
        return;
      } catch (clientErr) {
        console.error("Client practice audio decoding failed:", clientErr);
      }

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
            <div className="glass-card p-5 rounded-2xl border border-amber-300 text-xs shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Music className="w-4 h-4 text-amber-700" />
                <h4 className="font-bold text-slate-900 font-serif text-sm">Raga {ragaName} Guidelines</h4>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed mb-3">
                Maintain steady breath control. Listen carefully to the drone frequency of Sa ({tonic.toFixed(1)} Hz) and Pa ({(tonic * 1.5).toFixed(1)} Hz).
              </p>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 font-mono text-[11px] text-amber-950 font-bold shadow-2xs">
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
              <div className="p-4 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center gap-3 text-amber-900 font-bold text-sm shadow-2xs">
                <RefreshCw className="w-4 h-4 text-amber-700 animate-spin" />
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
