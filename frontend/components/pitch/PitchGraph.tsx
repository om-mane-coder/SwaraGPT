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
  title = 'Pitch Contour',
  subtitle,
  height = 260,
}: PitchGraphProps) {
  const points = pitchPoints || data || [];
  const baseSa = referenceSa || saHz || 130.81;

  if (!points || points.length === 0) {
    return (
      <div 
        className="w-full flex items-center justify-center bg-white rounded-xl border border-slate-200 p-6 text-slate-400 text-xs font-mono" 
        style={{ height }}
      >
        Waiting for audio pitch signal...
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
    <div className="w-full bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 text-xs gap-2">
        <div>
          <div className="font-semibold text-slate-800 text-xs">{title}</div>
          {subtitle && <div className="text-[11px] text-slate-400">{subtitle}</div>}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-600"></span>
            F0 (Hz)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Sur (±25¢)
          </span>
          <span>
            Sa: <strong className="text-slate-700">{baseSa.toFixed(1)} Hz</strong>
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: -24, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#94A3B8"
              fontSize={10}
              tickFormatter={(v) => `${Number(v).toFixed(1)}s`}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={10}
              domain={['auto', 'auto']}
              unit="Hz"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '11px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                color: '#0F172A',
              }}
              formatter={(value: any, name: any, item: any) => {
                const swaraLabel = item.payload.swara ? ` (${item.payload.swara})` : '';
                return [`${Number(value).toFixed(1)} Hz${swaraLabel}`, 'Pitch'];
              }}
              labelFormatter={(label) => `Time: ${Number(label).toFixed(2)}s`}
            />
            {/* Reference tonic line */}
            <ReferenceLine y={baseSa} stroke="#64748B" strokeDasharray="3 3" label={{ value: 'Sa', fill: '#64748B', fontSize: 10 }} />
            {/* Pancham reference line */}
            <ReferenceLine y={baseSa * 1.5} stroke="#94A3B8" strokeDasharray="3 3" label={{ value: 'Pa', fill: '#94A3B8', fontSize: 10 }} />

            <Line
              type="monotone"
              dataKey="pitch"
              stroke="#334155"
              strokeWidth={2}
              dot={{ r: 1.5, fill: '#334155' }}
              activeDot={{ r: 4, fill: '#10B981' }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
