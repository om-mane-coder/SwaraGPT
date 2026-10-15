'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Music, Clock, Sparkles, ArrowLeft, Play, Pause, 
  Mic, MessageSquare, BookOpen, Volume2, Award, CheckCircle 
} from 'lucide-react';
import { ragasApi } from '@/lib/api';

const RAGA_DETAILS_SEED: Record<string, {
  name: string;
  tradition: string;
  thaat: string;
  time: string;
  rasa: string;
  aroha: string;
  avaroha: string;
  vadi: string;
  samvadi: string;
  pakad: string;
  swara_cents: number[]; // cent offsets for audio synthesis
  notes_list: string[];
  description: string;
  practice_guidance: string;
}> = {
  yaman: {
    name: "Yaman",
    tradition: "Hindustani",
    thaat: "Kalyan",
    time: "First Prahar of Night (6 PM - 9 PM)",
    rasa: "Shanta (Peaceful), Sringara (Devotion & Beauty)",
    aroha: ".N R G, M' D N S'",
    avaroha: "S' N D P, M' G R S",
    vadi: "Ga (Gandhar - 386¢)",
    samvadi: "Ni (Nishad - 1088¢)",
    pakad: ".N R G, R G M' P, D P M' G R, .N R S",
    swara_cents: [1088 - 1200, 204, 386, 590, 702, 884, 1088, 1200],
    notes_list: ["Nishad (Low)", "Shuddha Re", "Shuddha Ga (Vadi)", "Tivra Ma", "Pancham", "Shuddha Dha", "Shuddha Ni (Samvadi)", "Taar Sa"],
    description: "Raga Yaman is regarded as the introductory and foundational pillar of Hindustani classical music. Characterized by its sharp fourth (Tivra Ma) and the delicate omission of Shadja in direct ascent, its expansive meditative character evokes serene evening contemplation.",
    practice_guidance: "Always begin by establishing Mandra Nishad (.N) resolving upward into Rishabh (R) and Gandhar (G). Avoid landing abruptly on Sa from Re; allow the melody to float gracefully across Tivra Ma into Pancham."
  },
  bhairav: {
    name: "Bhairav",
    tradition: "Hindustani",
    thaat: "Bhairav",
    time: "Dawn (First Prahar of Day: 4 AM - 7 AM)",
    rasa: "Karuna (Pathos), Gambhir (Grave Majesty), Bhakti (Devotion)",
    aroha: "S r G M P d N S'",
    avaroha: "S' N d P M G r S",
    vadi: "dha (Komal Dhaivat - 814¢)",
    samvadi: "re (Komal Rishabh - 112¢)",
    pakad: "G M (d)d P, G M (r)r S",
    swara_cents: [0, 112, 386, 498, 702, 814, 1088, 1200],
    notes_list: ["Shadja", "Komal Re (Samvadi)", "Shuddha Ga", "Shuddha Ma", "Pancham", "Komal Dha (Vadi)", "Shuddha Ni", "Taar Sa"],
    description: "The grand sovereign dawn raga named after Lord Shiva. Famous for its slow, deliberate microtonal oscillations (andolan) on Komal Rishabh and Komal Dhaivat, imparting an aura of majestic spiritual awakening.",
    practice_guidance: "Focus deeply on the slow andolan oscillations on Komal Re and Komal Dha. The glide must be smooth without jerky pitch steps. Sustain Sa with firm, grounded diaphragm support."
  },
  bhupali: {
    name: "Bhupali (Bhoop)",
    tradition: "Hindustani / Carnatic (Mohanam)",
    thaat: "Kalyan",
    time: "First Prahar of Night (7 PM - 10 PM)",
    rasa: "Shanta, Bhakti, Veera (Sublime Peace)",
    aroha: "S R G P D S'",
    avaroha: "S' D P G R S",
    vadi: "Ga (Gandhar - 386¢)",
    samvadi: "Dha (Dhaivat - 884¢)",
    pakad: "S R G, P G, D P G R S",
    swara_cents: [0, 204, 386, 702, 884, 1200],
    notes_list: ["Shadja", "Shuddha Re", "Shuddha Ga (Vadi)", "Pancham", "Shuddha Dha (Samvadi)", "Taar Sa"],
    description: "A pure pentatonic (Audav-Audav) raga omitting Madhyam and Nishad. Its pristine symmetry and rich meends connecting Gandhar and Pancham create a luminous atmosphere of tranquility.",
    practice_guidance: "Keep the meend between Ga and Pa fluid and unbroken. In Avaroha, emphasize Dha resolving gently to Pa and Ga."
  }
};

export default function RagaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = String(params?.id || 'yaman').toLowerCase();
  const ragaKey = RAGA_DETAILS_SEED[rawId] ? rawId : 'yaman';
  const raga = RAGA_DETAILS_SEED[ragaKey];

  const [isPlayingScale, setIsPlayingScale] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play synthetic scale using Web Audio API
  const playScaleAudio = () => {
    if (isPlayingScale) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsPlayingScale(false);
      return;
    }

    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;
      setIsPlayingScale(true);

      const baseTonic = 138.59; // C#3
      const centsArray = raga.swara_cents;

      centsArray.forEach((cents, index) => {
        const freq = baseTonic * Math.pow(2, cents / 1200);
        const startTime = ctx.currentTime + index * 0.7;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.7);
      });

      // Stop after entire scale plays
      setTimeout(() => {
        setIsPlayingScale(false);
      }, centsArray.length * 700 + 200);

    } catch (err) {
      console.error("Scale playback error:", err);
      setIsPlayingScale(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Link */}
        <Link
          href="/ragas"
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-amber-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Raga Catalog</span>
        </Link>

        {/* Hero Header */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-amber-500/20 mb-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                  {raga.tradition} • Thaat {raga.thaat}
                </span>
                <span className="text-xs text-gray-400 font-mono">{raga.time}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight">
                Raga {raga.name}
              </h1>
              <p className="text-xs text-rose-300 font-serif mt-1">Rasa: {raga.rasa}</p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={playScaleAudio}
                className={`px-4 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg ${
                  isPlayingScale
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-amber-500 text-black hover:bg-amber-400'
                }`}
              >
                {isPlayingScale ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlayingScale ? 'Stop Scale Audio' : 'Play Reference Scale'}</span>
              </button>

              <Link
                href={`/practice?raga=${encodeURIComponent(raga.name)}`}
                className="px-4 py-3 rounded-xl bg-[#090D16] border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/10 transition-all flex items-center gap-2"
              >
                <Mic className="w-4 h-4 text-amber-400" />
                <span>Practice Raga</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Musicological Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Aroha, Avaroha, Pakad */}
          <div className="glass-card p-6 rounded-2xl border border-amber-500/20 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-400" />
              <span>Melodic Structure & Notation</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#090D16] border border-gray-800">
                <span className="text-gray-500 text-[11px] block mb-0.5">Aroha (Ascent):</span>
                <span className="text-emerald-300 font-bold text-sm">{raga.aroha}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#090D16] border border-gray-800">
                <span className="text-gray-500 text-[11px] block mb-0.5">Avaroha (Descent):</span>
                <span className="text-sky-300 font-bold text-sm">{raga.avaroha}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#090D16] border border-gray-800">
                <span className="text-gray-500 text-[11px] block mb-0.5">Pakad (Signature Phrase):</span>
                <span className="text-amber-300 font-bold italic text-sm">{raga.pakad}</span>
              </div>
            </div>
          </div>

          {/* Vadi, Samvadi, Notes */}
          <div className="glass-card p-6 rounded-2xl border border-amber-500/20 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Hierarchical Swara Placement</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-xl bg-[#090D16] border border-gray-800">
                <span className="text-[10px] text-gray-500 font-mono uppercase block">Vadi (King Note)</span>
                <span className="text-base font-bold text-amber-400 font-serif">{raga.vadi}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#090D16] border border-gray-800">
                <span className="text-[10px] text-gray-500 font-mono uppercase block">Samvadi (Queen Note)</span>
                <span className="text-base font-bold text-amber-400 font-serif">{raga.samvadi}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-gray-400">Constituent Swaras:</span>
              <div className="flex flex-wrap gap-1.5">
                {raga.notes_list.map((note, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#090D16] border border-gray-800 text-xs font-mono text-gray-300">
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Musicological Insight & Practice Guidance */}
        <div className="glass-card p-6 rounded-2xl border border-amber-500/20 space-y-4 mb-8">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Classical Insight & Pedagogical Guidance</span>
          </h3>

          <p className="text-xs text-gray-300 leading-relaxed">
            {raga.description}
          </p>

          <div className="p-4 rounded-xl bg-[#090D16] border border-amber-500/30">
            <div className="text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guru Practice Recommendation:</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              {raga.practice_guidance}
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
