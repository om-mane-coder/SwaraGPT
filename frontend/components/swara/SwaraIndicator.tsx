'use client';

import React from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface SwaraIndicatorProps {
  swara: string;
  frequency: number;
  cents: number;
  deviation: number;
  tonic: number;
  confidence?: number;
  className?: string;
}

export default function SwaraIndicator({
  swara,
  frequency,
  cents,
  deviation,
  tonic,
  confidence = 1.0,
  className = '',
}: SwaraIndicatorProps) {
  // Determine intonation status based on cent deviation thresholds (±25 Sur, 25-50 Mild, >50 Besur)
  const absDev = Math.abs(deviation);
  let status: 'sur' | 'mild' | 'besur' = 'sur';
  let statusText = 'SUR (In Tune)';
  let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  let badgeIcon = <CheckCircle className="w-4 h-4 text-emerald-400" />;

  if (frequency <= 0 || confidence < 0.3) {
    statusText = 'Listening...';
    statusColor = 'text-gray-400 bg-gray-800/40 border-gray-700/40';
    badgeIcon = <Activity className="w-4 h-4 text-gray-400 animate-pulse" />;
  } else if (absDev > 50) {
    status = 'besur';
    statusText = 'Besur (Significant Deviation)';
    statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    badgeIcon = <XCircle className="w-4 h-4 text-rose-400" />;
  } else if (absDev > 25) {
    status = 'mild';
    statusText = 'Mild Deviation';
    statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    badgeIcon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
  }

  // Cent gauge position: -50 cents to +50 cents mapped to 0% - 100%
  const clampedDev = Math.max(-50, Math.min(50, deviation));
  const needlePercent = ((clampedDev + 50) / 100) * 100;

  return (
    <div className={`glass-card p-6 rounded-2xl border border-amber-500/20 relative overflow-hidden ${className}`}>
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Current Swara</span>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${statusColor}`}>
          {badgeIcon}
          <span>{statusText}</span>
        </div>
      </div>

      {/* Main Swara & Pitch Readout */}
      <div className="grid grid-cols-2 gap-4 items-center mb-6">
        <div>
          <div className="text-5xl font-extrabold tracking-tight saffron-gradient-text font-serif">
            {swara || '—'}
          </div>
          <div className="text-xs text-gray-400 font-mono mt-1">
            Ref Sa: <span className="text-amber-300 font-semibold">{tonic.toFixed(1)} Hz</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-white">
            {frequency > 0 ? `${frequency.toFixed(1)} Hz` : '— Hz'}
          </div>
          <div className="text-xs font-mono mt-1">
            <span className="text-gray-400">Deviation: </span>
            <span className={`font-semibold ${deviation > 0 ? 'text-amber-300' : deviation < 0 ? 'text-sky-300' : 'text-emerald-400'}`}>
              {deviation >= 0 ? `+${deviation.toFixed(1)}` : deviation.toFixed(1)} ¢
            </span>
          </div>
        </div>
      </div>

      {/* Cent Deviation Gauge */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-mono text-gray-400">
          <span>-50¢ (Flat)</span>
          <span className="text-emerald-400 font-bold">0¢ (Sur)</span>
          <span>+50¢ (Sharp)</span>
        </div>

        {/* Gauge bar */}
        <div className="h-3 w-full bg-[#0D121F] rounded-full relative overflow-hidden border border-gray-800">
          {/* Target In-Tune Safe Zone (±25 cents) */}
          <div 
            className="absolute top-0 bottom-0 bg-emerald-500/20 border-x border-emerald-500/40"
            style={{ left: '25%', width: '50%' }}
          />
          {/* Center line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-emerald-400 -translate-x-1/2 z-10" />

          {/* Needle */}
          {frequency > 0 && (
            <div
              className={`absolute top-0 bottom-0 w-2.5 rounded-full -translate-x-1/2 shadow-lg transition-all duration-150 z-20 ${
                status === 'sur' 
                  ? 'bg-emerald-400 shadow-emerald-500/50' 
                  : status === 'mild' 
                  ? 'bg-amber-400 shadow-amber-500/50' 
                  : 'bg-rose-500 shadow-rose-500/50'
              }`}
              style={{ left: `${needlePercent}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
