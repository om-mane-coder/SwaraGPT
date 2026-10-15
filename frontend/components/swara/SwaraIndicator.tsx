'use client';

import React from 'react';
import { Activity, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

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
  const absDev = Math.abs(deviation);
  let status: 'sur' | 'mild' | 'besur' = 'sur';
  let statusText = 'In Tune (Sur)';
  let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let badgeIcon = <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;

  if (frequency <= 0 || confidence < 0.3) {
    statusText = 'Listening...';
    statusColor = 'text-slate-500 bg-slate-50 border-slate-200';
    badgeIcon = <Activity className="w-3.5 h-3.5 text-slate-400 animate-pulse" />;
  } else if (absDev > 50) {
    status = 'besur';
    statusText = 'Deviation >50¢';
    statusColor = 'text-rose-600 bg-rose-50 border-rose-200';
    badgeIcon = <XCircle className="w-3.5 h-3.5 text-rose-500" />;
  } else if (absDev > 25) {
    status = 'mild';
    statusText = 'Slight Drift';
    statusColor = 'text-slate-700 bg-slate-100 border-slate-200';
    badgeIcon = <AlertCircle className="w-3.5 h-3.5 text-slate-500" />;
  }

  // Cent gauge position: -50 cents to +50 cents mapped to 0% - 100%
  const clampedDev = Math.max(-50, Math.min(50, deviation));
  const needlePercent = ((clampedDev + 50) / 100) * 100;

  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Current Swara</span>
        <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border flex items-center gap-1.5 ${statusColor}`}>
          {badgeIcon}
          <span>{statusText}</span>
        </div>
      </div>

      {/* Main Swara & Pitch Readout */}
      <div className="grid grid-cols-2 gap-4 items-center mb-5">
        <div>
          <div className="text-4xl font-bold tracking-tight text-slate-900 font-serif">
            {swara || '—'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            Sa: <span className="text-slate-700 font-semibold">{tonic.toFixed(1)} Hz</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-slate-800">
            {frequency > 0 ? `${frequency.toFixed(1)} Hz` : '— Hz'}
          </div>
          <div className="text-[11px] font-mono mt-0.5">
            <span className="text-slate-400">Deviation: </span>
            <span className={`font-semibold ${deviation > 25 ? 'text-slate-700' : deviation < -25 ? 'text-slate-700' : 'text-emerald-600'}`}>
              {deviation >= 0 ? `+${deviation.toFixed(1)}` : deviation.toFixed(1)} ¢
            </span>
          </div>
        </div>
      </div>

      {/* Cent Deviation Gauge */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>-50¢</span>
          <span className="text-emerald-700 font-medium">0¢ Sur</span>
          <span>+50¢</span>
        </div>

        {/* Gauge bar */}
        <div className="h-2.5 w-full bg-slate-100 rounded-full relative overflow-hidden border border-slate-200">
          {/* Target In-Tune Safe Zone (±25 cents) */}
          <div 
            className="absolute top-0 bottom-0 bg-emerald-100/60"
            style={{ left: '25%', width: '50%' }}
          />
          {/* Center line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-emerald-500 -translate-x-1/2 z-10" />

          {/* Needle */}
          {frequency > 0 && (
            <div
              className={`absolute top-0 bottom-0 w-2 rounded-full -translate-x-1/2 transition-all duration-150 z-20 ${
                status === 'sur' 
                  ? 'bg-emerald-600' 
                  : status === 'mild' 
                  ? 'bg-slate-600' 
                  : 'bg-rose-500'
              }`}
              style={{ left: `${needlePercent}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
