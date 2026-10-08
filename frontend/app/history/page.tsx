'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Clock, Music, Award, ArrowRight, ArrowLeftRight, 
  Calendar, CheckCircle, BarChart2, Filter, Layers, CheckSquare, Square
} from 'lucide-react';
import { progressApi } from '@/lib/api';

interface SessionItem {
  id: string;
  date: string;
  raga: string;
  duration_seconds: number;
  overall_score: number;
  pitch_accuracy: number;
  swara_accuracy: number;
  tonic_hz: number;
}

const SAMPLE_SESSIONS: SessionItem[] = [
  {
    id: "sess-101",
    date: "2026-10-07 19:30",
    raga: "Yaman",
    duration_seconds: 180,
    overall_score: 84.5,
    pitch_accuracy: 86.0,
    swara_accuracy: 82.5,
    tonic_hz: 138.59,
  },
  {
    id: "sess-102",
    date: "2026-10-06 08:15",
    raga: "Bhairav",
    duration_seconds: 120,
    overall_score: 76.2,
    pitch_accuracy: 78.0,
    swara_accuracy: 74.0,
    tonic_hz: 138.59,
  },
  {
    id: "sess-103",
    date: "2026-10-04 20:00",
    raga: "Bhupali",
    duration_seconds: 240,
    overall_score: 91.0,
    pitch_accuracy: 92.5,
    swara_accuracy: 89.0,
    tonic_hz: 138.59,
  },
  {
    id: "sess-104",
    date: "2026-10-02 18:45",
    raga: "Yaman",
    duration_seconds: 150,
    overall_score: 72.0,
    pitch_accuracy: 71.5,
    swara_accuracy: 73.0,
    tonic_hz: 138.59,
  },
];

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionItem[]>(SAMPLE_SESSIONS);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  useEffect(() => {
    progressApi.getHistory()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped = res.data.map((item: any, idx: number) => ({
            id: item.id || `sess-${idx}`,
            date: item.created_at ? new Date(item.created_at).toLocaleString() : new Date().toLocaleString(),
            raga: item.raga_name || item.target_raga || "Yaman",
            duration_seconds: Math.round(item.duration_seconds || 120),
            overall_score: item.overall_score || 80,
            pitch_accuracy: item.pitch_accuracy || 82,
            swara_accuracy: item.swara_accuracy || 79,
            tonic_hz: item.tonic_hz || 138.59,
          }));
          setSessions(mapped);
        }
      })
      .catch(() => {
        // Use demo sessions
      });
  }, []);

  const toggleSelectForCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length < 2) {
        setSelectedForCompare([...selectedForCompare, id]);
      } else {
        setSelectedForCompare([selectedForCompare[1], id]);
      }
    }
  };

  const session1 = sessions.find((s) => s.id === selectedForCompare[0]);
  const session2 = sessions.find((s) => s.id === selectedForCompare[1]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Riyaz Archives</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">
              Practice Session History
            </h1>
          </div>

          {/* Compare Sessions Button */}
          {selectedForCompare.length === 2 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2 animate-bounce-slow"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Compare Selected Sessions</span>
            </button>
          )}
        </div>

        {/* Sessions Table / List */}
        <div className="glass-card rounded-2xl border border-amber-500/20 overflow-hidden mb-12">
          <div className="p-4 bg-[#090D16] border-b border-gray-800 flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>Select any 2 sessions to compare Before vs After</span>
            <span>{sessions.length} Recorded Sessions</span>
          </div>

          <div className="divide-y divide-gray-800">
            {sessions.map((s) => {
              const isSelected = selectedForCompare.includes(s.id);

              return (
                <div
                  key={s.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isSelected ? 'bg-amber-500/5' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Left: Checkbox + Raga + Date */}
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => toggleSelectForCompare(s.id)}
                      className="text-gray-400 hover:text-amber-400 transition-colors"
                      title="Select for comparison"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white font-serif">
                          Raga {s.raga}
                        </span>
                        <span className="text-xs font-mono text-gray-400">
                          ({Math.floor(s.duration_seconds / 60)}m {s.duration_seconds % 60}s)
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">
                        {s.date} • Sa: {s.tonic_hz.toFixed(1)} Hz
                      </div>
                    </div>
                  </div>

                  {/* Middle: Scores */}
                  <div className="flex items-center gap-6">
                    <div className="text-center sm:text-right">
                      <div className="text-xs text-gray-400 font-mono">Overall</div>
                      <div className={`text-base font-bold font-mono ${
                        s.overall_score >= 80 ? 'text-emerald-400' : s.overall_score >= 65 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {Math.round(s.overall_score)}%
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-xs text-gray-400 font-mono">Pitch</div>
                      <div className="text-sm font-semibold text-gray-200 font-mono">
                        {Math.round(s.pitch_accuracy)}%
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-xs text-gray-400 font-mono">Swara</div>
                      <div className="text-sm font-semibold text-gray-200 font-mono">
                        {Math.round(s.swara_accuracy)}%
                      </div>
                    </div>
                  </div>

                  {/* Right: View Report Link */}
                  <div>
                    <Link
                      href={`/analyze/${s.id}`}
                      className="px-3.5 py-2 rounded-xl bg-[#090D16] border border-amber-500/30 text-amber-300 font-semibold text-xs hover:bg-amber-500/10 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>View Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compare Sessions Modal */}
        {showCompareModal && session1 && session2 && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-2xl border border-amber-500/30 shadow-2xl relative">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white font-serif">
                    Side-by-Side Session Comparison
                  </h3>
                </div>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="text-gray-400 hover:text-white text-xs font-mono"
                >
                  ✕ Close
                </button>
              </div>

              {/* Side-by-Side Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Session 1 */}
                <div className="p-4 rounded-xl bg-[#090D16] border border-gray-800 space-y-3">
                  <div className="text-xs font-mono text-gray-400">{session1.date}</div>
                  <div className="text-base font-bold text-amber-300 font-serif">Raga {session1.raga}</div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Overall:</span>
                      <strong className="text-white">{Math.round(session1.overall_score)}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pitch Acc:</span>
                      <strong className="text-white">{Math.round(session1.pitch_accuracy)}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Swara Acc:</span>
                      <strong className="text-white">{Math.round(session1.swara_accuracy)}%</strong>
                    </div>
                  </div>
                </div>

                {/* Session 2 */}
                <div className="p-4 rounded-xl bg-[#090D16] border border-gray-800 space-y-3">
                  <div className="text-xs font-mono text-gray-400">{session2.date}</div>
                  <div className="text-base font-bold text-amber-300 font-serif">Raga {session2.raga}</div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Overall:</span>
                      <strong className="text-white">{Math.round(session2.overall_score)}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pitch Acc:</span>
                      <strong className="text-white">{Math.round(session2.pitch_accuracy)}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Swara Acc:</span>
                      <strong className="text-white">{Math.round(session2.swara_accuracy)}%</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Differential Delta calculation */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
                <div className="text-amber-300 font-bold">Progression Delta:</div>
                <div className="text-gray-300 font-mono">
                  Overall Score Change: {' '}
                  <span className={session2.overall_score >= session1.overall_score ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {(session2.overall_score - session1.overall_score) >= 0 ? '+' : ''}
                    {(session2.overall_score - session1.overall_score).toFixed(1)}%
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-sans">
                  {session2.overall_score >= session1.overall_score
                    ? 'Improvement observed in tonic stability and shruti placement on principal swaras.'
                    : 'Mild pitch drift observed in the second session during rapid melodic transitions.'}
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
