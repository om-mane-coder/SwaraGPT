'use client';

import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';

interface PerformanceScoreProps {
  overallScore: number;
  pitchAccuracy: number;
  swaraAccuracy: number;
  shrutiAccuracy: number;
  ragaAccuracy: number;
  tonicStability: number;
  confidence?: number;
  className?: string;
}

export default function PerformanceScore({
  overallScore,
  pitchAccuracy,
  swaraAccuracy,
  shrutiAccuracy,
  ragaAccuracy,
  tonicStability,
  confidence = 0.95,
  className = '',
}: PerformanceScoreProps) {
  // Score color logic - muted faint tones
  const getScoreColor = (val: number) => {
    if (val >= 80) return { text: 'text-emerald-700', stroke: '#059669', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (val >= 60) return { text: 'text-slate-700', stroke: '#475569', bg: 'bg-slate-100', border: 'border-slate-200' };
    return { text: 'text-rose-600', stroke: '#E11D48', bg: 'bg-rose-50', border: 'border-rose-200' };
  };

  const overallColors = getScoreColor(overallScore);

  // SVG Circular progress
  const size = 130;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  const scoreMetrics = [
    { label: 'Pitch Accuracy', value: pitchAccuracy, weight: 35 },
    { label: 'Swara Accuracy', value: swaraAccuracy, weight: 25 },
    { label: 'Shruti Precision', value: shrutiAccuracy, weight: 15 },
    { label: 'Raga Adherence', value: ragaAccuracy, weight: 15 },
    { label: 'Tonic Stability', value: tonicStability, weight: 10 },
  ];

  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-800">Performance Score</h3>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600">
          <ShieldCheck className="w-3 h-3 text-slate-500" />
          <span>Confidence {Math.round(confidence * 100)}%</span>
        </div>
      </div>

      {/* Main Score & Radial Gauge */}
      <div className="flex items-center gap-5 mb-5 pb-4 border-b border-slate-100">
        <div className="relative w-[130px] h-[130px] shrink-0">
          <svg width={size} height={size} className="rotate-[-90deg]">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={overallColors.stroke}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold font-mono ${overallColors.text}`}>
              {Math.round(overallScore)}%
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Overall
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-800">
            {overallScore >= 80 ? 'Precise Intonation' : overallScore >= 60 ? 'Moderate Intonation' : 'Developing Intonation'}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {overallScore >= 80 
              ? 'Strong alignment with canonical pitch and target raga swaras.'
              : overallScore >= 60 
              ? 'Stable principal notes with mild drift on transitions.'
              : 'Focus on holding steady notes against the drone.'}
          </p>
        </div>
      </div>

      {/* Metric Breakdown Bars */}
      <div className="space-y-3">
        {scoreMetrics.map((m, idx) => {
          const colors = getScoreColor(m.value);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">{m.label}</span>
                <span className={`font-mono font-semibold ${colors.text}`}>{Math.round(m.value)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${m.value}%`,
                    backgroundColor: colors.stroke,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
