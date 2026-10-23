'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Music, Activity } from 'lucide-react';

export interface PitchPoint {
  time: number;
  pitch?: number;
  frequency?: number;
  swara?: string;
  delta_cents?: number;
  cents?: number;
  deviation?: number;
  is_in_tune?: boolean;
  confidence?: number;
}

export interface PitchGraphProps {
  data?: PitchPoint[];
  pitchPoints?: PitchPoint[];
  saHz?: number;
  referenceSa?: number;
  targetRaga?: string;
  title?: string;
  subtitle?: string;
  height?: number;
  className?: string;
}

export default function PitchGraph({
  data,
  pitchPoints,
  saHz,
  referenceSa,
  targetRaga = 'Yaman',
  title = 'Fundamental Frequency Pitch Trajectory',
  subtitle = 'Extracted F0 contour mapped relative to selected tonic Sa',
  height = 280,
  className = '',
}: PitchGraphProps) {
  const points = pitchPoints || data || [];
  const baseSa = referenceSa || saHz || 130.81;

  if (!points || points.length === 0) {
    return (
      <div 
        className={`glass-card p-8 rounded-2xl border border-amber-300 shadow-md flex flex-col items-center justify-center bg-white/95 text-center ${className}`} 
        style={{ minHeight: height }}
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mb-3 shadow-2xs">
          <Activity className="w-6 h-6 animate-pulse text-amber-700" />
        </div>
        <div className="text-sm font-bold text-slate-900 font-serif mb-1">
          Awaiting Audio Signal for Pitch Tracking
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Sing or upload audio to visualize fundamental frequency (F0) trajectory
        </div>
      </div>
    );
  }

  // Filter valid points for display
  const chartData = points.map((d) => {
    const rawFreq = d.frequency ?? d.pitch ?? 0;
    return {
      time: d.time,
      pitch: rawFreq > 50 ? rawFreq : null,
      swara: d.swara,
      cents: d.cents ?? d.delta_cents ?? 0,
      inTune: d.is_in_tune ?? (Math.abs(d.deviation ?? 0) <= 25),
    };
  });

  // Render custom saffron and emerald dots with crisp high-definition white borders
  const renderPitchDot = (dotProps: any) => {
    const { cx, cy, payload, index } = dotProps;
    if (cx == null || cy == null || payload?.pitch == null) return null;
    const isSur = Boolean(payload?.inTune);
    // Vibrant Indian Saffron (#EA580C) for pitch trajectory, Brilliant Emerald (#059669) for Sur intonation
    const fill = isSur ? '#059669' : '#EA580C';

    return (
      <circle
        key={`pitch-dot-${index ?? cx}-${cy}`}
        cx={cx}
        cy={cy}
        r={3.8}
        fill={fill}
        stroke="#FFFFFF"
        strokeWidth={1.5}
      />
    );
  };

  return (
    <div className={`glass-card p-6 rounded-2xl border border-amber-300 shadow-md bg-white/95 backdrop-blur-md ${className}`}>
      {/* Top Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div>
          <div className="font-bold text-slate-900 text-base font-serif flex items-center gap-2">
            <Music className="w-4 h-4 text-amber-700" />
            <span>{title}</span>
          </div>
          <div className="text-xs text-slate-500 font-sans mt-0.5">{subtitle}</div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1.5 bg-orange-50 text-orange-950 font-bold px-2.5 py-1 rounded-full border border-orange-300 shadow-2xs">
            <span className="w-3 h-3 rounded-full bg-[#EA580C] border border-white shadow-2xs"></span>
            <span>Saffron Contour (Hz)</span>
          </span>
          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-950 font-bold px-2.5 py-1 rounded-full border border-emerald-300 shadow-2xs">
            <span className="w-3 h-3 rounded-full bg-[#059669] border border-white shadow-2xs"></span>
            <span>Sur In-Tune (±25¢)</span>
          </span>
          <span className="bg-amber-50 text-amber-950 font-mono font-bold px-2.5 py-1 rounded-full border border-amber-300 shadow-2xs">
            Sa: <strong>{baseSa.toFixed(1)} Hz</strong>
          </span>
        </div>
      </div>

      {/* Styled Chart Canvas Container */}
      <div className="p-3 rounded-xl bg-[#FFFDF9] border border-amber-200/90 shadow-2xs relative">
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 25, left: -15, bottom: 5 }}>
              <defs>
                <linearGradient id="pitchContourGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE3D5" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#857564"
                fontSize={10}
                tickFormatter={(v) => `${Number(v).toFixed(1)}s`}
              />
              <YAxis
                stroke="#857564"
                fontSize={10}
                domain={['auto', 'auto']}
                unit="Hz"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  borderColor: '#FCD34D',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px -4px rgba(180, 83, 9, 0.15), 0 2px 6px rgba(0, 0, 0, 0.04)',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#0F172A',
                  padding: '8px 12px',
                }}
                formatter={(value: any, name: any, item: any) => {
                  const swaraLabel = item.payload.swara ? ` (${item.payload.swara})` : '';
                  const inTuneText = item.payload.inTune ? ' (Sur)' : '';
                  return [`${Number(value).toFixed(1)} Hz${swaraLabel}${inTuneText}`, 'Pitch'];
                }}
                labelFormatter={(label) => `Time: ${Number(label).toFixed(2)}s`}
              />
              {/* Reference tonic line */}
              <ReferenceLine
                y={baseSa}
                stroke="#B45309"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{ value: `Sa (${baseSa.toFixed(1)} Hz)`, fill: '#78350F', fontSize: 11, fontWeight: 'bold' }}
              />
              {/* Pancham reference line */}
              <ReferenceLine
                y={baseSa * 1.5}
                stroke="#0284C7"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{ value: 'Pa', fill: '#0369A1', fontSize: 11, fontWeight: 'bold' }}
              />

              <Line
                type="monotone"
                dataKey="pitch"
                stroke="#FB923C"
                strokeWidth={2.2}
                strokeOpacity={0.8}
                dot={renderPitchDot}
                activeDot={{
                  r: 7,
                  fill: '#EA580C',
                  stroke: '#FFFFFF',
                  strokeWidth: 2.5,
                }}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
