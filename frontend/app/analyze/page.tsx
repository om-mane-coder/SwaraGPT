'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AudioRecorder from '@/components/audio/AudioRecorder';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { audioApi } from '@/lib/api';
import { useSwaraStore } from '@/lib/store';
import { decodeAndAnalyzeAudio } from '@/lib/mir/audioDecoder';

const PIPELINE_STAGES = [
  { step: 1, name: 'Audio Preprocessing' },
  { step: 2, name: 'Tonic (Sa) Detection' },
  { step: 3, name: 'Pitch & Swara Extraction' },
  { step: 4, name: 'Raga & Intonation Analysis' },
];

export default function AnalyzePage() {
  const router = useRouter();
  const { setLastAnalysis, selectedTonicHz, selectedRaga } = useSwaraStore();

  const [targetRaga, setTargetRaga] = useState<string>(selectedRaga || 'Yaman');
  const [tonicHz, setTonicHz] = useState<number>(selectedTonicHz || 138.59);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number>(1);

  const runPipelineAnimation = async () => {
    for (let i = 1; i <= 4; i++) {
      setCurrentStage(i);
      await new Promise((res) => setTimeout(res, 450));
    }
  };

  const handleAudioReady = async (blob: Blob, file?: File) => {
    setIsProcessing(true);
    const uploadFile = file || new File([blob], 'vocal_recording.webm', { type: blob.type || 'audio/webm' });

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('audio_file', uploadFile);
      formData.append('target_raga', targetRaga);
      formData.append('manual_tonic_hz', tonicHz.toString());
      formData.append('user_sa_hz', tonicHz.toString());
      formData.append('user_sa', tonicHz.toString());

      const animationPromise = runPipelineAnimation();
      const apiPromise = audioApi.analyze(formData);

      const [, response] = await Promise.all([animationPromise, apiPromise]);

      setLastAnalysis(response.data);
      const sessionId = response.data.session_id || 'latest';
      router.push(`/analyze/${sessionId}`);
    } catch (err: unknown) {
      console.warn("API response error, falling back to in-browser MIR analysis:", err);
      
      try {
        const clientResult = await decodeAndAnalyzeAudio(uploadFile, {
          targetRaga,
          manualTonicHz: tonicHz
        });
        setLastAnalysis(clientResult as any);
        await runPipelineAnimation();
        router.push(`/analyze/${clientResult.session_id || 'latest'}`);
        return;
      } catch (clientErr) {
        console.error("Client MIR decoding error:", clientErr);
      }

      await runPipelineAnimation();
      router.push(`/analyze/latest?raga=${encodeURIComponent(targetRaga)}&tonic=${tonicHz}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F9]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1.5">
            Analyze Vocal Riyaz
          </h1>
          <p className="text-xs text-slate-500">
            Record or upload singing audio to evaluate pitch accuracy, swara alignment, and raga adherence.
          </p>
        </div>

        {/* Target Raga & Tonic Selection */}
        <div className="bg-white p-5 rounded-2xl border border-pink-100/90 shadow-2xs mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1.5">
              Target Raga:
            </label>
            <select
              value={targetRaga}
              onChange={(e) => setTargetRaga(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-300"
            >
              {['Yaman', 'Bhairav', 'Bhairavi', 'Bhupali', 'Bageshri', 'Darbari Kanada', 'Malkauns', 'Kafi', 'Todi', 'Marwa', 'Desh', 'Hamsadhwani'].map((r) => (
                <option key={r} value={r}>Raga {r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1.5">
              Tonic Sa (Hz):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={tonicHz}
                step="0.1"
                onChange={(e) => setTonicHz(parseFloat(e.target.value) || 130.81)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-slate-400"
              />
              <span className="text-[11px] font-mono text-slate-500 shrink-0">
                {tonicHz < 150 ? 'Male' : 'Female'}
              </span>
            </div>
          </div>
        </div>

        {/* Audio Recorder Component */}
        {!isProcessing ? (
          <AudioRecorder
            onAudioReady={handleAudioReady}
            tonicFrequency={tonicHz}
            className="mb-6"
          />
        ) : (
          /* Clean Minimal Processing View */
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs text-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mx-auto mb-4">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>

            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Analyzing Audio
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Extracting pitch contour and evaluating swaras...
            </p>

            {/* Stages Step-by-Step */}
            <div className="space-y-2 max-w-sm mx-auto text-left">
              {PIPELINE_STAGES.map((s) => {
                const isDone = currentStage > s.step;
                const isCurrent = currentStage === s.step;

                return (
                  <div
                    key={s.step}
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-colors ${
                      isDone
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : isCurrent
                        ? 'bg-slate-100 border-slate-300 text-slate-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-slate-700 animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-mono text-slate-400">
                          {s.step}
                        </div>
                      )}
                    </div>
                    <span>{s.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
