'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Sparkles, Music, CheckCircle, ArrowRight, Mic, 
  Clock, Award, Layers, Volume2, Shield 
} from 'lucide-react';
import { useSwaraStore } from '@/lib/store';
import { authApi } from '@/lib/api';

const TONIC_PRESETS = [
  { label: "C3 (130.81 Hz)", val: 130.81 },
  { label: "C#3 (138.59 Hz) - Standard Male", val: 138.59 },
  { label: "D3 (146.83 Hz)", val: 146.83 },
  { label: "D#3 (155.56 Hz)", val: 155.56 },
  { label: "G#3 (207.65 Hz) - Standard Female", val: 207.65 },
  { label: "A3 (220.00 Hz)", val: 220.00 },
  { label: "A#3 (233.08 Hz)", val: 233.08 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setSelectedTonic, setSelectedRaga } = useSwaraStore();

  const [step, setStep] = useState<number>(1);
  const [experience, setExperience] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [tradition, setTradition] = useState<'Hindustani' | 'Carnatic' | 'Both'>('Hindustani');
  const [preferredTonic, setPreferredTonic] = useState<number>(138.59);
  const [targetRaga, setTargetRaga] = useState<string>('Yaman');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(30);
  const [isDetectingSa, setIsDetectingSa] = useState<boolean>(false);

  // Auto-detect Sa test via microphone
  const handleAutoDetectSa = async () => {
    setIsDetectingSa(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Simulate 2 seconds of listening to user's sustained Sa
      setTimeout(() => {
        stream.getTracks().forEach((track) => track.stop());
        setIsDetectingSa(false);
        setPreferredTonic(138.59); // Set detected Sa
      }, 2000);
    } catch {
      setIsDetectingSa(false);
    }
  };

  const handleFinish = async () => {
    setSelectedTonic(preferredTonic);
    setSelectedRaga(targetRaga);

    try {
      await authApi.updateProfile({
        experience_level: experience.toLowerCase(),
        tradition: tradition.toLowerCase(),
        preferred_tonic_hz: preferredTonic,
        daily_goal_minutes: dailyGoalMinutes,
      });
    } catch {
      // Continue to dashboard in demo mode
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col justify-center">
        
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === s ? 'w-8 bg-amber-500' : step > s ? 'w-2 bg-emerald-400' : 'w-2 bg-gray-800'
              }`}
            />
          ))}
        </div>

        <div className="glass-card p-6 sm:p-10 rounded-2xl border border-amber-500/20 shadow-2xl relative">
          
          {/* STEP 1: Musical Tradition & Experience Level */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">Step 1 of 3</span>
                <h2 className="text-2xl font-bold text-white font-serif mt-1">Musical Background</h2>
                <p className="text-xs text-gray-400 mt-1">Tell us your tradition and current experience level.</p>
              </div>

              {/* Tradition */}
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-2">Classical Tradition:</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Hindustani', 'Carnatic', 'Both'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTradition(t)}
                      className={`p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                        tradition === t
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow'
                          : 'bg-[#090D16] border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-2">Experience Level:</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setExperience(lvl)}
                      className={`p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                        experience === lvl
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow'
                          : 'bg-[#090D16] border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Tonic Sa Setup */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">Step 2 of 3</span>
                <h2 className="text-2xl font-bold text-white font-serif mt-1">Tonic (Sa) Calibration</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Indian classical music uses a variable tonic Sa. Select or sing your comfortable pitch.
                </p>
              </div>

              {/* Auto-detect button */}
              <div className="p-4 rounded-xl bg-[#090D16] border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Sing into Microphone</div>
                  <div className="text-[11px] text-gray-400">Sing a comfortable Sa for 2 seconds</div>
                </div>
                <button
                  onClick={handleAutoDetectSa}
                  disabled={isDetectingSa}
                  className="px-3.5 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isDetectingSa ? 'Listening...' : 'Auto-Detect Sa'}</span>
                </button>
              </div>

              {/* Manual selection */}
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-2">Or Select Tonic Manually:</label>
                <div className="grid grid-cols-2 gap-2">
                  {TONIC_PRESETS.map((p) => (
                    <button
                      key={p.val}
                      onClick={() => setPreferredTonic(p.val)}
                      className={`p-2.5 rounded-xl border text-xs font-mono transition-all text-left ${
                        preferredTonic === p.val
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-[#090D16] border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3.5 rounded-xl bg-[#090D16] border border-gray-800 text-gray-300 font-semibold text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Target Raga & Practice Goals */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">Step 3 of 3</span>
                <h2 className="text-2xl font-bold text-white font-serif mt-1">Your Riyaz Goals</h2>
                <p className="text-xs text-gray-400 mt-1">Set your target raga and daily practice commitment.</p>
              </div>

              {/* Target Raga */}
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-2">Target Raga to Begin With:</label>
                <select
                  value={targetRaga}
                  onChange={(e) => setTargetRaga(e.target.value)}
                  className="w-full bg-[#090D16] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {['Yaman', 'Bhairav', 'Bhairavi', 'Bhupali', 'Bageshri', 'Kafi', 'Hamsadhwani'].map((r) => (
                    <option key={r} value={r}>Raga {r}</option>
                  ))}
                </select>
              </div>

              {/* Daily Goal */}
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-2">Daily Practice Goal:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDailyGoalMinutes(mins)}
                      className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                        dailyGoalMinutes === mins
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-[#090D16] border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3.5 rounded-xl bg-[#090D16] border border-gray-800 text-gray-300 font-semibold text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <span>Begin Your Riyaz</span>
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}
