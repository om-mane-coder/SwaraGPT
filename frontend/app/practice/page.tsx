'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SwaraIndicator from '@/components/swara/SwaraIndicator';
import ShrutiDial, { CANONICAL_SHRUTIS } from '@/components/swara/ShrutiDial';
import PitchGraph, { PitchPoint } from '@/components/pitch/PitchGraph';
import AudioRecorder from '@/components/audio/AudioRecorder';
import { 
  Music, Mic, Settings, Play, Pause, Award, 
  Layers, Sliders, ArrowRight, CheckCircle, RefreshCw, Volume2 
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

  // McLeod Pitch Method (MPM) with Normalized Square Difference Function (NSDF)
  const detectPitchMPM = (buf: Float32Array, sampleRate: number): number => {
    const SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      rms += buf[i] * buf[i];
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.015) return -1;

    const maxLag = Math.min(SIZE - 1, Math.floor(sampleRate / 60));
    const minLag = Math.floor(sampleRate / 1050);
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

    let maxVal = -1;
    let bestLag = -1;
    for (let tau = minLag; tau < maxLag - 1; tau++) {
      if (nsdf[tau] > 0.45 && nsdf[tau] > nsdf[tau - 1] && nsdf[tau] >= nsdf[tau + 1]) {
        if (nsdf[tau] > maxVal) {
          maxVal = nsdf[tau];
          bestLag = tau;
        }
      }
    }

    if (bestLag === -1 || maxVal < 0.48) return -1;

    const x1 = nsdf[bestLag - 1];
    const x2 = nsdf[bestLag];
    const x3 = nsdf[bestLag + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    const delta = a !== 0 ? -b / (2 * a) : 0;
    const refinedLag = bestLag + delta;

    return sampleRate / refinedLag;
  };

  const mapFrequencyToSwara = useCallback((freq: number, saFreq: number) => {
    if (freq <= 40 || freq > 1500) return;

    const rawCents = 1200 * Math.log2(freq / saFreq);
    const modCents = ((rawCents % 1200) + 1200) % 1200;

    let bestShruti = CANONICAL_SHRUTIS[0];
    let minShrutiDist = 99999;
    for (const sh of CANONICAL_SHRUTIS) {
      const d = Math.abs(modCents - sh.cents);
      if (d < minShrutiDist) {
        minShrutiDist = d;
        bestShruti = sh;
      }
    }
    if (Math.abs(modCents - 1200) < minShrutiDist) {
      bestShruti = CANONICAL_SHRUTIS[0];
      minShrutiDist = Math.abs(modCents - 1200);
    }

    const semitone = Math.round(modCents / 100) % 12;
    const targetCents = semitone * 100;
    const dev = modCents - targetCents;
    const matchedSwara = NOMINAL_SWARAS[semitone].name;

    let shrutiDev = modCents - bestShruti.cents;
    if (shrutiDev > 600) shrutiDev -= 1200;
    else if (shrutiDev < -600) shrutiDev += 1200;

    const displaySwara = analysisMode === 'shruti' ? `${bestShruti.swara} (${bestShruti.name})` : matchedSwara;
    const displayDev = analysisMode === 'shruti' ? shrutiDev : dev;

    setLiveFreq(freq);
    setLiveSwara(displaySwara);
    setLiveCents(modCents);
    setLiveDeviation(displayDev);

    setPitchHistory((prev) => {
      const now = prev.length > 0 ? prev[prev.length - 1].time + 0.1 : 0;
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
  }, [analysisMode]);

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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Practice Studio
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time fundamental frequency tracking & intonation gauge
            </p>
          </div>

          {/* Clean Mic Button */}
          <div>
            <button
              onClick={isLiveListening ? stopLivePitchTracker : startLivePitchTracker}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                isLiveListening
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isLiveListening ? 'Stop Pitch Tracker' : 'Start Live Pitch'}</span>
            </button>
          </div>
        </div>

        {/* Minimalist Configuration Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center shadow-2xs">
          
          {/* Tonic Sa */}
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">
              Tonic Sa:
            </label>
            <select
              value={tonic}
              onChange={(e) => handleTonicChange(parseFloat(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
            >
              {TONIC_OPTIONS.map((opt) => (
                <option key={opt.val} value={opt.val}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Raga */}
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">
              Target Raga:
            </label>
            <select
              value={ragaName}
              onChange={(e) => {
                setRagaName(e.target.value);
                setSelectedRaga(e.target.value);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
            >
              {['Yaman', 'Bhairav', 'Bhairavi', 'Bhupali', 'Bageshri', 'Darbari Kanada', 'Malkauns', 'Kafi', 'Todi', 'Marwa', 'Desh', 'Hamsadhwani'].map((r) => (
                <option key={r} value={r}>Raga {r}</option>
              ))}
            </select>
          </div>

          {/* Drill */}
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">
              Drill:
            </label>
            <select
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
            >
              <option value="Sa-Pa Stability Practice">Sa-Pa Stability Practice</option>
              <option value="Aroha & Avaroha Slow Ascent">Aroha & Avaroha Slow Ascent</option>
              <option value="Pakad Signature Phrase">Pakad Signature Phrase</option>
              <option value="Alankar: Sa-Re-Ga, Re-Ga-Ma">Alankar: S-R-G, R-G-M</option>
              <option value="Long Note Gandhar Hold">Long Note Gandhar Hold</option>
              <option value="Free Riyaz / Khayal Alap">Free Riyaz</option>
            </select>
          </div>

          {/* Mode */}
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">
              Mode:
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setAnalysisMode('swara')}
                className={`py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  analysisMode === 'swara'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Swara
              </button>
              <button
                onClick={() => setAnalysisMode('shruti')}
                className={`py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  analysisMode === 'shruti'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                22-Shruti
              </button>
            </div>
          </div>

        </div>

        {/* Central Practice Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Left Column: Intonation Gauge */}
          <div className="lg:col-span-1 space-y-4">
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
          </div>

          {/* Right Column: Live Pitch Trajectory & Audio Capture */}
          <div className="lg:col-span-2 space-y-4">
            <PitchGraph
              pitchPoints={pitchHistory}
              referenceSa={tonic}
              targetRaga={ragaName}
              title={`Pitch Trajectory — Raga ${ragaName}`}
              subtitle="Live F0 contour relative to Sa"
              height={300}
            />

            <AudioRecorder
              onAudioReady={handleAudioReady}
              tonicFrequency={tonic}
            />

            {analyzingBlob && (
              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center gap-2 text-slate-700 text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating vocal intonation & raga adherence...</span>
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
    <React.Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <PracticeContent />
    </React.Suspense>
  );
}
