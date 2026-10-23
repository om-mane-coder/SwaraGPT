'use client';

import React from 'react';
import Link from 'next/link';
import { Music, Clock, Sparkles, ArrowRight, BookOpen, Mic } from 'lucide-react';

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
    <div className={`glass-card p-6 rounded-2xl border border-amber-300 hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group shadow-md ${className}`}>
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-bold shadow-2xs">
                {raga.tradition}
              </span>
              {raga.thaat && (
                <span className="text-[11px] text-slate-600 font-mono font-medium">
                  Thaat: {raga.thaat}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-serif mt-2 group-hover:text-amber-800 transition-colors">
              {raga.name}
            </h3>
          </div>

          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0 shadow-2xs">
            <Music className="w-5 h-5" />
          </div>
        </div>

        {/* Time and Rasa tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-600 font-sans">
          {raga.time_of_day && (
            <div className="flex items-center gap-1 bg-[#090D16] px-2.5 py-1 rounded-md border border-gray-800">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>{raga.time_of_day}</span>
            </div>
          )}
          {raga.rasa && (
            <div className="flex items-center gap-1 bg-[#090D16] px-2.5 py-1 rounded-md border border-gray-800">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>{raga.rasa}</span>
            </div>
          )}
        </div>

        {/* Swara Details Box */}
        <div className="space-y-2 p-3.5 rounded-xl bg-[#090D16] border border-gray-800/80 text-xs font-mono mb-4">
          <div>
            <span className="text-slate-500 text-[11px] font-medium">Aroha: </span>
            <span className="text-emerald-700 font-bold">{raga.aroha}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] font-medium">Avaroha: </span>
            <span className="text-sky-700 font-bold">{raga.avaroha}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-gray-800/60 text-[11px]">
            <div>
              <span className="text-slate-500 font-medium">Vadi: </span>
              <span className="text-amber-900 font-bold">{raga.vadi}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Samvadi: </span>
              <span className="text-amber-900 font-bold">{raga.samvadi}</span>
            </div>
          </div>
        </div>

        {/* Pakad phrase preview */}
        {raga.pakad && (
          <div className="text-xs text-slate-700 mb-4 line-clamp-2">
            <span className="text-slate-500 font-mono text-[11px] font-medium">Pakad: </span>
            <span className="italic text-slate-800 font-medium">&ldquo;{raga.pakad}&rdquo;</span>
          </div>
        )}
      </div>

      {/* Action CTA Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-800/80">
        <Link
          href={`/practice?raga=${encodeURIComponent(raga.name)}`}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Practice</span>
        </Link>
        <Link
          href={`/ragas/${encodeURIComponent(raga.id || raga.name.toLowerCase())}`}
          className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
          <span>Details</span>
        </Link>
      </div>
    </div>
  );
}
