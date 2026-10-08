'use client';

import React, { useState } from 'react';
import { Award, Info, ChevronDown, ChevronUp, CheckCircle, ShieldCheck } from 'lucide-react';

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
  const [showFormula, setShowFormula] = useState(false);

  // Score color logic
  const getScoreColor = (val: number) => {
    if (val >= 80) return { text: 'text-emerald-400', stroke: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (val >= 60) return { text: 'text-amber-400', stroke: '#F59E0B', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    return { text: 'text-rose-400', stroke: '#EF4444', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  };

  const overallColors = getScoreColor(overallScore);

  // SVG Circular progress constants
  const size = 150;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  const scoreMetrics = [
    { label: 'Pitch Accuracy', value: pitchAccuracy, weight: 35, desc: 'F0 stability & cent tolerance' },
    { label: 'Swara Accuracy', value: swaraAccuracy, weight: 25, desc: 'Nominal notes intonation' },
    { label: 'Shruti Precision', value: shrutiAccuracy, weight: 15, desc: '22-Microtonal placement' },
    { label: 'Raga Adherence', value: ragaAccuracy, weight: 15, desc: 'Aroha/Avaroha & Vadi grammar' },
    { label: 'Tonic Stability', value: tonicStability, weight: 10, desc: 'Sa grounding consistency' },
  ];

  return (
    <div className={`glass-card p-6 rounded-2xl border border-amber-500/20 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Vocal Performance Evaluation</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Confidence: {Math.round(confidence * 100)}%</span>
        </div>
      </div>

      {/* Main Score & Radial Gauge */}
      <div className="flex flex-col sm:flex-row items-center gap-8 mb-8 pb-6 border-b border-gray-800">
        <div className="relative w-[150px] h-[150px] shrink-0">
          <svg width={size} height={size} className="rotate-[-90deg]">
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#1E293B"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Value stroke */}
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
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-extrabold font-mono ${overallColors.text}`}>
              {Math.round(overallScore)}%
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 mt-0.5">
              Overall Score
            </span>
          </div>
        </div>

        {/* Evaluation Summary text */}
        <div className="space-y-2 text-center sm:text-left">
          <h4 className="text-lg font-bold text-white font-serif">
            {overallScore >= 85 ? 'Outstanding Riyaz (Uttam)' : overallScore >= 70 ? 'Proficient Intonation (Madhyam)' : 'Developing Intonation (Abhyasa)'}
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed max-w-md">
            {overallScore >= 80 
              ? 'Your vocal intonation aligns strongly with canonical shruti intervals and the target raga contour.'
              : overallScore >= 60 
              ? 'Steady intonation on principal notes, with mild microtonal drift observed on transit swaras.'
              : 'Pitch fluctuations detected during sustained notes. Regular Sa-Pa stability practice recommended.'}
          </p>
        </div>
      </div>

      {/* Metric Breakdown Bars */}
      <div className="space-y-4">
        {scoreMetrics.map((m, idx) => {
          const colors = getScoreColor(m.value);
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-200">{m.label}</span>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-800/60 px-1.5 py-0.5 rounded">
                    Weight: {m.weight}%
                  </span>
                </div>
                <span className={`font-mono font-bold ${colors.text}`}>{Math.round(m.value)}%</span>
              </div>
              <div className="h-2 w-full bg-[#090D16] rounded-full overflow-hidden border border-gray-800">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${m.value}%`,
                    backgroundColor: colors.stroke,
                  }}
                />
              </div>
              <div className="text-[10px] text-gray-400 font-mono">{m.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Transparent Formula Accordion */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="w-full flex items-center justify-between text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>How your score was calculated</span>
          </span>
          {showFormula ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFormula && (
          <div className="mt-3 p-4 rounded-xl bg-[#090D16] border border-gray-800/80 text-xs text-gray-300 space-y-2 font-mono">
            <div className="text-amber-300 font-bold">Transparent Multi-Factor Scoring Formula:</div>
            <div className="p-2.5 rounded bg-black/40 border border-gray-800 text-[11px] overflow-x-auto text-amber-200/90">
              Score = (0.35 × Pitch) + (0.25 × Swara) + (0.15 × Shruti) + (0.15 × Raga) + (0.10 × Tonic)
            </div>
            <ul className="list-disc list-inside text-[11px] text-gray-400 space-y-1 pt-1">
              <li><strong>Pitch Accuracy (35%):</strong> Evaluates cent deviation and pYIN unvoiced/voiced continuity.</li>
              <li><strong>Swara Accuracy (25%):</strong> Fraction of frames within ±25¢ of nominal note intervals.</li>
              <li><strong>Shruti Precision (15%):</strong> Proximity to the target raga&apos;s 22-shruti microtone positions.</li>
              <li><strong>Raga Adherence (15%):</strong> Aaroha/Avaroha scale compliance and vadi/samvadi energy ratio.</li>
              <li><strong>Tonic Stability (10%):</strong> Variance of the fundamental Sa reference across the phrase.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
