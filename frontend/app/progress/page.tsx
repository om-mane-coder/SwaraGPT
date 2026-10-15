'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  TrendingUp, Award, Clock, Flame, CheckCircle, 
  AlertTriangle, Music, Calendar, Filter, BarChart2 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar 
} from 'recharts';
import { progressApi } from '@/lib/api';

const SAMPLE_TREND_DATA = [
  { day: 'Day 1', score: 68, pitch: 70, duration: 15 },
  { day: 'Day 4', score: 72, pitch: 74, duration: 20 },
  { day: 'Day 8', score: 75, pitch: 78, duration: 25 },
  { day: 'Day 12', score: 79, pitch: 81, duration: 30 },
  { day: 'Day 16', score: 77, pitch: 80, duration: 20 },
  { day: 'Day 20', score: 82, pitch: 84, duration: 35 },
  { day: 'Day 25', score: 86, pitch: 88, duration: 40 },
  { day: 'Day 30', score: 89, pitch: 91, duration: 45 },
];

const SWARA_ACCURACY_DATA = [
  { swara: 'Sa', accuracy: 96, status: 'Rock Solid', color: '#10B981' },
  { swara: 'Re', accuracy: 88, status: 'In Tune', color: '#10B981' },
  { swara: 'Ga', accuracy: 74, status: 'Tends Sharp (+28¢)', color: '#F59E0B' },
  { swara: 'Ma', accuracy: 82, status: 'In Tune', color: '#10B981' },
  { swara: 'Ma\'', accuracy: 79, status: 'Mild Drift', color: '#F59E0B' },
  { swara: 'Pa', accuracy: 94, status: 'Rock Solid', color: '#10B981' },
  { swara: 'Dha', accuracy: 85, status: 'In Tune', color: '#10B981' },
  { swara: 'Ni', accuracy: 83, status: 'In Tune', color: '#10B981' },
];

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [trendData, setTrendData] = useState(SAMPLE_TREND_DATA);
  const [stats, setStats] = useState({
    totalMinutes: 245,
    sessionsCount: 18,
    currentStreak: 6,
    bestScore: 89,
    strongestSwara: 'Pancham (Pa)',
    weakestSwara: 'Gandhar (Ga)'
  });

  useEffect(() => {
    progressApi.getSummary()
      .then((res) => {
        if (res.data) {
          setStats((prev) => ({
            ...prev,
            totalMinutes: res.data.total_practice_minutes || prev.totalMinutes,
            sessionsCount: res.data.total_sessions || prev.sessionsCount,
            currentStreak: res.data.current_streak_days || prev.currentStreak,
            bestScore: res.data.best_score || prev.bestScore,
          }));
        }
      })
      .catch(() => {
        // Use demo stats
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Riyaz Longitudinal Analytics</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">
              Progress & Vocal Mastery
            </h1>
          </div>

          {/* Time range selector */}
          <div className="flex items-center gap-1 bg-[#090D16] p-1 rounded-xl border border-gray-800">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                  timeRange === range
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Top 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5 rounded-2xl border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-gray-400">Total Riyaz Time</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{stats.totalMinutes} mins</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span>+18% this month</span>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-gray-400">Current Streak</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-400">{stats.currentStreak} Days</div>
            <div className="text-[11px] text-gray-400 mt-1">Dedication unbroken</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-gray-400">Best Intonation Score</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">{stats.bestScore}%</div>
            <div className="text-[11px] text-gray-400 mt-1">Raga Bhupali session</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-gray-400">Completed Sessions</span>
              <CheckCircle className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-sky-400">{stats.sessionsCount}</div>
            <div className="text-[11px] text-gray-400 mt-1">Evaluated by MIR engine</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Historical Intonation Trend Area Chart */}
          <div className="glass-card p-6 rounded-2xl border border-amber-500/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Intonation Score Evolution</h3>
                <p className="text-xs text-gray-400">Progressive improvement in pitch & swara accuracy</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                Trend: +21%
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                  <YAxis domain={[50, 100]} stroke="#64748B" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090D16', borderColor: '#F59E0B', borderRadius: '12px' }}
                    labelStyle={{ color: '#F59E0B', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#F59E0B" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Swara Accuracy Breakdown Bar Chart */}
          <div className="glass-card p-6 rounded-2xl border border-amber-500/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Swara-by-Swara Intonation Accuracy</h3>
                <p className="text-xs text-gray-400">Average accuracy percentage across all practicing phrases</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SWARA_ACCURACY_DATA}>
                  <XAxis dataKey="swara" stroke="#64748B" fontSize={12} fontWeight="bold" />
                  <YAxis domain={[50, 100]} stroke="#64748B" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090D16', borderColor: '#38BDF8', borderRadius: '12px' }}
                    labelStyle={{ color: '#38BDF8', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="accuracy" fill="#38BDF8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Strongest vs Weakest Swara & Raga Mastery Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Swara Diagnostics */}
          <div className="glass-card p-6 rounded-2xl border border-amber-500/20 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-amber-400" />
              <span>Microtonal Diagnostics</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#090D16] border border-emerald-500/30">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Strongest Swara</span>
                </div>
                <div className="text-lg font-bold text-white font-serif">{stats.strongestSwara}</div>
                <div className="text-[11px] text-gray-400 mt-1 font-mono">96% intonation accuracy</div>
              </div>

              <div className="p-4 rounded-xl bg-[#090D16] border border-amber-500/30">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Drifting Swara</span>
                </div>
                <div className="text-lg font-bold text-white font-serif">{stats.weakestSwara}</div>
                <div className="text-[11px] text-gray-400 mt-1 font-mono">Tends sharp (+28¢) on holds</div>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed pt-2">
              Recommendation: Conduct 5-minute sustained note drills on Gandhar (Ga) against the Tanpura drone before attempting fast taans.
            </p>
          </div>

          {/* Raga Mastery Progress */}
          <div className="glass-card p-6 rounded-2xl border border-amber-500/20 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-amber-400" />
              <span>Raga Mastery Progress</span>
            </h3>

            <div className="space-y-3.5">
              {[
                { name: 'Raga Yaman', percent: 84, color: '#10B981' },
                { name: 'Raga Bhupali', percent: 92, color: '#10B981' },
                { name: 'Raga Bhairav', percent: 76, color: '#F59E0B' },
                { name: 'Raga Kafi', percent: 81, color: '#10B981' },
              ].map((raga, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white font-serif">{raga.name}</span>
                    <span className="font-mono font-bold text-amber-300">{raga.percent}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#090D16] rounded-full overflow-hidden border border-gray-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${raga.percent}%`, backgroundColor: raga.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
