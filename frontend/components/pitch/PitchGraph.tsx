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
}: PitchGraphProps) {
  const points = pitchPoints || data || [];
  const baseSa = referenceSa || saHz || 130.81;

  if (!points || points.length === 0) {
    return (
      <div 
        className="w-full flex items-center justify-center bg-[#0B0F19] rounded-xl border border-gray-800 p-8 text-gray-400 text-xs font-mono" 
        style={{ height }}
      >
        Awaiting audio signal for fundamental frequency (F0) tracking...
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

  return (
    <div className="w-full bg-[#0B0F19] rounded-xl border border-amber-500/20 p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 text-xs font-mono gap-2">
        <div>
          <div className="font-bold text-white text-sm font-serif">{title}</div>
          <div className="text-[10px] text-gray-400 font-sans">{subtitle}</div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            Contour (Hz)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Sur (±25¢)
          </span>
          <span className="text-gray-400">
            Sa: <strong className="text-amber-300">{baseSa.toFixed(1)} Hz</strong>
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748B"
              fontSize={10}
              tickFormatter={(v) => `${Number(v).toFixed(1)}s`}
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              domain={['auto', 'auto']}
              unit="Hz"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#090D16',
                border: '1px solid #F59E0B',
                borderRadius: '8px',
                fontSize: '11px',
              }}
              formatter={(value: any, name: any, item: any) => {
                const swaraLabel = item.payload.swara ? ` (${item.payload.swara})` : '';
                return [`${Number(value).toFixed(1)} Hz${swaraLabel}`, 'Pitch'];
              }}
              labelFormatter={(label) => `Time: ${Number(label).toFixed(2)}s`}
            />
            {/* Reference tonic line */}
            <ReferenceLine y={baseSa} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Sa', fill: '#F59E0B', fontSize: 10 }} />
            {/* Pancham reference line */}
            <ReferenceLine y={baseSa * 1.5} stroke="#38BDF8" strokeDasharray="4 4" label={{ value: 'Pa', fill: '#38BDF8', fontSize: 10 }} />

            <Line
              type="monotone"
              dataKey="pitch"
              stroke="#F59E0B"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: '#F59E0B' }}
              activeDot={{ r: 5, fill: '#10B981' }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
