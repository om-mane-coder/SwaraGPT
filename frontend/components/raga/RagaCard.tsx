'use client';

import React from 'react';
import Link from 'next/link';
import { Music, Clock, Sparkles, BookOpen, Mic } from 'lucide-react';

export interface RagaData {
  id: string;
  name: string;
  tradition: string;
  thaat?: string;
  melakarta?: string;
  time_of_day?: string;
  rasa?: string;
  aroha: string;
  avaroha: string;
  vadi: string;
  samvadi: string;
  pakad?: string;
  description?: string;
}

interface RagaCardProps {
  raga: RagaData;
  className?: string;
}

export default function RagaCard({ raga, className = '' }: RagaCardProps) {
  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between shadow-2xs ${className}`}>
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {raga.tradition}
              </span>
              {raga.thaat && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {raga.thaat}
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-slate-900 mt-1">
              {raga.name}
            </h3>
          </div>

          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <Music className="w-4 h-4" />
          </div>
        </div>

        {/* Time and Rasa tags */}
        {(raga.time_of_day || raga.rasa) && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px] text-slate-500">
            {raga.time_of_day && (
              <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {raga.time_of_day}
              </span>
            )}
            {raga.rasa && (
              <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {raga.rasa}
              </span>
            )}
          </div>
        )}

        {/* Swara Details Box */}
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono mb-3">
          <div>
            <span className="text-slate-400 text-[10px]">Aroha: </span>
            <span className="text-slate-800 font-medium">{raga.aroha}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px]">Avaroha: </span>
            <span className="text-slate-800 font-medium">{raga.avaroha}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px]">
            <div>
              <span className="text-slate-400">Vadi: </span>
              <span className="text-slate-800 font-medium">{raga.vadi}</span>
            </div>
            <div>
              <span className="text-slate-400">Samvadi: </span>
              <span className="text-slate-800 font-medium">{raga.samvadi}</span>
            </div>
          </div>
        </div>

        {/* Pakad */}
        {raga.pakad && (
          <div className="text-xs text-slate-600 mb-3 line-clamp-1">
            <span className="text-slate-400 text-[10px] font-mono">Pakad: </span>
            <span className="font-mono text-slate-700">{raga.pakad}</span>
          </div>
        )}
      </div>

      {/* Action CTA Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <Link
          href={`/practice?raga=${encodeURIComponent(raga.name)}`}
          className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Practice</span>
        </Link>
        <Link
          href={`/ragas/${encodeURIComponent(raga.id || raga.name.toLowerCase())}`}
          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Details</span>
        </Link>
      </div>
    </div>
  );
}
