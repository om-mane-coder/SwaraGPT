'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AudioRecorder from '@/components/audio/AudioRecorder';
import { 
  Upload, Sparkles, CheckCircle2, ArrowRight, RefreshCw, 
  Layers, ShieldAlert, Music, FileAudio, Clock, Play, Pause,
  Award, GraduationCap, Volume2
} from 'lucide-react';
import { audioApi } from '@/lib/api';
import { useSwaraStore } from '@/lib/store';
import { decodeAndAnalyzeAudio } from '@/lib/mir/audioDecoder';

const BENCHMARK_PAIRS = [
  {
    num: "01",
    song: "Lag Ja Gale",
    raga: "Bhairavi",
    tonic: 138.59,
    masterSinger: "Lata Mangeshkar",
    masterFile: "Pair_01_MASTER_Lata_Mangeshkar_Lag_Ja_Gale.wav",
    masterScore: "99.5%",
    userSinger: "Amateur Student Singer",
    userFile: "Pair_01_USER_Amateur_Student_Singer_Lag_Ja_Gale.wav",
    userScore: "73.6%"
  },
  {
    num: "02",
    song: "Madhuban Mein Radhika Nache Re",
    raga: "Hamir",
    tonic: 146.83,
    masterSinger: "Mohammed Rafi",
    masterFile: "Pair_02_MASTER_Mohammed_Rafi_Madhuban_Mein_Radhika_Nache_Re.wav",
    masterScore: "98.5%",
    userSinger: "Learner Vocal Cover",
    userFile: "Pair_02_USER_Learner_Vocal_Cover_Madhuban_Mein_Radhika_Nache_Re.wav",
    userScore: "74.9%"
  },
  {
    num: "03",
    song: "Ketaki Gulab Juhi",
    raga: "Basant",
    tonic: 146.83,
    masterSinger: "Pt Bhimsen Joshi",
    masterFile: "Pair_03_MASTER_Pt_Bhimsen_Joshi_Ketaki_Gulab_Juhi.wav",
    masterScore: "98.8%",
    userSinger: "Music Academy Student",
    userFile: "Pair_03_USER_Music_Academy_Student_Ketaki_Gulab_Juhi.wav",
    userScore: "75.5%"
  },
  {
    num: "04",
    song: "Chingari Koi Bhadke",
    raga: "Bhairavi",
    tonic: 130.81,
    masterSinger: "Kishore Kumar",
    masterFile: "Pair_04_MASTER_Kishore_Kumar_Chingari_Koi_Bhadke.wav",
    masterScore: "96.8%",
    userSinger: "Amateur Student Singer",
    userFile: "Pair_04_USER_Amateur_Student_Singer_Chingari_Koi_Bhadke.wav",
    userScore: "78.4%"
  },
  {
    num: "05",
    song: "Albela Sajan Aayo Ri",
    raga: "Ahir Bhairav",
    tonic: 138.59,
    masterSinger: "Ustad Sultan Khan",
    masterFile: "Pair_05_MASTER_Ustad_Sultan_Khan_Albela_Sajan_Aayo_Ri.wav",
    masterScore: "98.0%",
    userSinger: "Classical Riyaz Learner",
    userFile: "Pair_05_USER_Classical_Riyaz_Learner_Albela_Sajan_Aayo_Ri.wav",
    userScore: "78.6%"
  },
  {
    num: "06",
    song: "Laga Chunari Mein Daag",
    raga: "Bhairavi",
    tonic: 146.83,
    masterSinger: "Manna Dey",
    masterFile: "Pair_06_MASTER_Manna_Dey_Laga_Chunari_Mein_Daag.wav",
    masterScore: "97.7%",
    userSinger: "College Student Cover",
    userFile: "Pair_06_USER_College_Student_Cover_Laga_Chunari_Mein_Daag.wav",
    userScore: "76.5%"
  },
  {
    num: "07",
    song: "In Aankhon Ki Masti",
    raga: "Yaman",
    tonic: 164.81,
    masterSinger: "Asha Bhosle",
    masterFile: "Pair_07_MASTER_Asha_Bhosle_In_Aankhon_Ki_Masti.wav",
    masterScore: "97.6%",
    userSinger: "Amateur Vocalist",
    userFile: "Pair_07_USER_Amateur_Vocalist_In_Aankhon_Ki_Masti.wav",
    userScore: "78.3%"
  },
  {
    num: "08",
    song: "Gori Tera Gaon Bada Pyara",
    raga: "Bhupali",
    tonic: 130.81,
    masterSinger: "Dr. K.J. Yesudas",
    masterFile: "Pair_08_MASTER_KJ_Yesudas_Gori_Tera_Gaon_Bada_Pyara.wav",
    masterScore: "99.0%",
    userSinger: "Student Singer Cover",
    userFile: "Pair_08_USER_Student_Singer_Cover_Gori_Tera_Gaon_Bada_Pyara.wav",
    userScore: "74.4%"
  },
  {
    num: "09",
    song: "Hothon Se Chhoo Lo Tum",
    raga: "Bhairavi",
    tonic: 123.47,
    masterSinger: "Jagjit Singh",
    masterFile: "Pair_09_MASTER_Jagjit_Singh_Hothon_Se_Chhoo_Lo_Tum.wav",
    masterScore: "97.1%",
    userSinger: "Learner Ghazal Cover",
    userFile: "Pair_09_USER_Learner_Ghazal_Cover_Hothon_Se_Chhoo_Lo_Tum.wav",
    userScore: "77.5%"
  },
  {
    num: "10",
    song: "Mitwa",
    raga: "Khamaj",
    tonic: 146.83,
    masterSinger: "Shankar Mahadevan",
    masterFile: "Pair_10_MASTER_Shankar_Mahadevan_Mitwa.wav",
    masterScore: "98.5%",
    userSinger: "Music Academy Student",
    userFile: "Pair_10_USER_Music_Academy_Student_Mitwa.wav",
    userScore: "78.7%"
  }
];

const PIPELINE_STAGES = [
  { step: 1, name: 'Audio Preprocessing', desc: 'Resampling to 22.05 kHz, 80 Hz HPF, normalization & VAD trimming' },
  { step: 2, name: 'Tonic (Sa) Detection', desc: 'Long-term pitch distribution peak histogram estimation' },
  { step: 3, name: 'pYIN Pitch Extraction', desc: 'Probabilistic fundamental frequency (F0) tracking & unvoiced suppression' },
  { step: 4, name: 'Swara & Shruti Mapping', desc: 'Microtonal cent conversion C = 1200 log2(f/fSa) & 22-shruti alignment' },
  { step: 5, name: 'Melodic & Raga Analysis', desc: 'Aroha/Avaroha scale compliance, Vadi energy & Pakad sequence matching' },
  { step: 6, name: 'Guru Feedback Generation', desc: 'Multi-factor weighted scoring & constructive vocal corrections' },
];

export default function AnalyzePage() {
  const router = useRouter();
  const { setLastAnalysis, selectedTonicHz, selectedRaga } = useSwaraStore();

  const [targetRaga, setTargetRaga] = useState<string>(selectedRaga || 'Yaman');
  const [tonicHz, setTonicHz] = useState<number>(selectedTonicHz || 138.59);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [playingFile, setPlayingFile] = useState<string | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayAudio = (filename: string) => {
    if (playingFile === filename) {
      if (audioElemRef.current) {
        audioElemRef.current.pause();
      }
      setPlayingFile(null);
    } else {
      if (audioElemRef.current) {
        audioElemRef.current.pause();
      }
      const audio = new Audio(`/test_audio/${filename}`);
      audio.onended = () => setPlayingFile(null);
      audio.play().catch(e => console.error("Audio playback error:", e));
      audioElemRef.current = audio;
      setPlayingFile(filename);
    }
  };

  const handleSelectDemoTrack = async (filename: string, raga: string, tonic: number) => {
    setTargetRaga(raga);
    setTonicHz(tonic);
    try {
      const resp = await fetch(`/test_audio/${filename}`);
      const blob = await resp.blob();
      const file = new File([blob], filename, { type: 'audio/wav' });
      await handleAudioReady(blob, file);
    } catch (err) {
      console.error("Failed to load demo track:", err);
    }
  };

  const runPipelineAnimation = async () => {
    for (let i = 1; i <= 6; i++) {
      setCurrentStage(i);
      await new Promise((res) => setTimeout(res, 500));
    }
  };

  const handleAudioReady = async (blob: Blob, file?: File) => {
    setIsProcessing(true);
    setAnalysisError(null);
    const uploadFile = file || new File([blob], 'vocal_recording.webm', { type: blob.type || 'audio/webm' });

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('audio_file', uploadFile);
      formData.append('target_raga', targetRaga);
      formData.append('manual_tonic_hz', tonicHz.toString());
      formData.append('user_sa_hz', tonicHz.toString());
      formData.append('user_sa', tonicHz.toString());

      // Start visual pipeline progress animation in parallel
      const animationPromise = runPipelineAnimation();
      const apiPromise = audioApi.analyze(formData);

      const [, response] = await Promise.all([animationPromise, apiPromise]);

      setLastAnalysis(response.data);
      const sessionId = response.data.session_id || 'latest';
      router.push(`/analyze/${sessionId}`);
    } catch (err: unknown) {
      console.warn("Audio analysis API response error, running client-side MIR engine:", err);
      const errData = (err as any)?.response?.data;
      if (errData && (errData.status === 'unclear_audio' || errData.status === 'silent_audio' || errData.is_valid_audio === false)) {
        setLastAnalysis(errData);
        router.push(`/analyze/quality-alert`);
        return;
      }
      
      // Attempt client-side MIR audio decoding of the actual recording
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
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automated MIR Vocal Evaluator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight mb-3">
            Analyze Vocal Performance
          </h1>
          <p className="text-sm text-gray-400">
            Upload or record singing audio to extract pitch contours, identify swaras, check raga adherence, and receive AI Guru critique.
          </p>
        </div>

        {/* Target Raga & Tonic Selection */}
        <div className="glass-card p-6 rounded-2xl border border-amber-500/20 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-mono text-gray-400 block mb-2">
              Target Raga Benchmark:
            </label>
            <select
              value={targetRaga}
              onChange={(e) => setTargetRaga(e.target.value)}
              className="w-full bg-[#090D16] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {['Yaman', 'Bhairav', 'Bhairavi', 'Bhupali', 'Bageshri', 'Darbari Kanada', 'Malkauns', 'Kafi', 'Todi', 'Marwa', 'Desh', 'Hamsadhwani'].map((r) => (
                <option key={r} value={r}>Raga {r}</option>
              ))}
            </select>
            <span className="text-[11px] text-gray-500 mt-1 block">
              Evaluation rules and canonical shrutis are configured per raga.
            </span>
          </div>

          <div>
            <label className="text-xs font-mono text-gray-400 block mb-2">
              Fundamental Sa Reference (Hz):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={tonicHz}
                step="0.1"
                onChange={(e) => setTonicHz(parseFloat(e.target.value) || 130.81)}
                className="w-full bg-[#090D16] border border-gray-800 rounded-xl px-4 py-2.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs font-mono text-gray-400 shrink-0">
                {tonicHz < 150 ? 'Male Voice' : 'Female Voice'}
              </span>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              Set your personal tonic or leave for automated long-term estimation.
            </span>
          </div>
        </div>

        {/* Audio Recorder & Uploader Component */}
        {!isProcessing ? (
          <AudioRecorder
            onAudioReady={handleAudioReady}
            tonicFrequency={tonicHz}
            className="mb-8"
          />
        ) : (
          /* Animated 6-Stage Analysis Processing View */
          <div className="glass-card p-8 rounded-2xl border border-amber-500/30 text-center mb-8 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-6 animate-pulse">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>

            <h3 className="text-xl font-bold text-white font-serif mb-2">
              Analyzing Vocal Performance
            </h3>
            <p className="text-xs text-gray-400 mb-8 max-w-md mx-auto">
              Please wait while the Music Information Retrieval engine extracts pitch contours and evaluates intonation.
            </p>

            {/* Stages Step-by-Step Indicator */}
            <div className="space-y-3 max-w-xl mx-auto text-left">
              {PIPELINE_STAGES.map((s) => {
                const isDone = currentStage > s.step;
                const isCurrent = currentStage === s.step;

                return (
                  <div
                    key={s.step}
                    className={`p-3 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : isCurrent
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-md'
                        : 'bg-[#090D16] border-gray-800/80 text-gray-500'
                    }`}
                  >
                    <div className="shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-700 flex items-center justify-center text-[10px] font-mono">
                          {s.step}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="text-xs font-bold">{s.name}</div>
                      <div className="text-[10px] text-gray-400">{s.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 10 Canonical Benchmark Vocal Pairs (Master vs. Amateur) */}
        {!isProcessing && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-2">
                  <Award className="w-3.5 h-3.5" />
                  <span>Canonical MIR Ground-Truth Testbed</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-serif">
                  10 Master vs. Amateur Vocal Benchmark Pairs
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Listen or evaluate famous legends (scoring 95–100%) against amateur learners singing identical lyrics.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500">
                <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-semibold">Master (95–100%)</span>
                <span>vs</span>
                <span className="px-2 py-1 rounded bg-slate-200 text-slate-700 border border-slate-300 font-semibold">Learner (70–79%)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BENCHMARK_PAIRS.map((pair) => (
                <div
                  key={pair.num}
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                          #{pair.num}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 font-serif">
                          {pair.song}
                        </h3>
                      </div>
                      <span className="text-[11px] text-amber-700 font-mono mt-0.5 inline-block">
                        Raga {pair.raga}
                      </span>
                    </div>
                  </div>

                  {/* Master vs Student Row */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {/* Master Singer Option */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-200/60 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <div className="truncate">
                          <span className="font-semibold text-slate-900 block truncate">{pair.masterSinger}</span>
                          <span className="text-[10px] text-amber-700 font-mono">Master Score: {pair.masterScore}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => togglePlayAudio(pair.masterFile)}
                          className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:text-amber-600 hover:border-amber-400 transition-all"
                          title="Preview Master audio"
                        >
                          {playingFile === pair.masterFile ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleSelectDemoTrack(pair.masterFile, pair.raga, pair.tonic)}
                          className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium text-[11px] transition-all flex items-center gap-1 shadow-sm"
                        >
                          <span>Analyze</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Learner Singer Option */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <div className="truncate">
                          <span className="font-medium text-slate-800 block truncate">{pair.userSinger}</span>
                          <span className="text-[10px] text-slate-500 font-mono">Learner Score: {pair.userScore}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => togglePlayAudio(pair.userFile)}
                          className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 transition-all"
                          title="Preview Learner audio"
                        >
                          {playingFile === pair.userFile ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleSelectDemoTrack(pair.userFile, pair.raga, pair.tonic)}
                          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-900 text-white font-medium text-[11px] transition-all flex items-center gap-1 shadow-sm"
                        >
                          <span>Analyze</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
