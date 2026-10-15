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
    <div className={`glass-card p-6 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between group ${className}`}>
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {raga.tradition}
              </span>
              {raga.thaat && (
                <span className="text-[11px] text-gray-400 font-mono">
                  Thaat: {raga.thaat}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white font-serif mt-2 group-hover:text-amber-300 transition-colors">
              {raga.name}
            </h3>
          </div>

          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Music className="w-5 h-5" />
          </div>
        </div>

        {/* Time and Rasa tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-gray-400 font-sans">
          {raga.time_of_day && (
            <div className="flex items-center gap-1 bg-[#090D16] px-2.5 py-1 rounded-md border border-gray-800">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{raga.time_of_day}</span>
            </div>
          )}
          {raga.rasa && (
            <div className="flex items-center gap-1 bg-[#090D16] px-2.5 py-1 rounded-md border border-gray-800">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>{raga.rasa}</span>
            </div>
          )}
        </div>

        {/* Swara Details Box */}
        <div className="space-y-2 p-3.5 rounded-xl bg-[#090D16] border border-gray-800/80 text-xs font-mono mb-4">
          <div>
            <span className="text-gray-500 text-[11px]">Aroha: </span>
            <span className="text-emerald-300 font-semibold">{raga.aroha}</span>
          </div>
          <div>
            <span className="text-gray-500 text-[11px]">Avaroha: </span>
            <span className="text-sky-300 font-semibold">{raga.avaroha}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-gray-800/60 text-[11px]">
            <div>
              <span className="text-gray-500">Vadi: </span>
              <span className="text-amber-300 font-bold">{raga.vadi}</span>
            </div>
            <div>
              <span className="text-gray-500">Samvadi: </span>
              <span className="text-amber-300 font-bold">{raga.samvadi}</span>
            </div>
          </div>
        </div>

        {/* Pakad phrase preview */}
        {raga.pakad && (
          <div className="text-xs text-gray-300 mb-4 line-clamp-2">
            <span className="text-gray-500 font-mono text-[11px]">Pakad: </span>
            <span className="italic text-gray-300">&ldquo;{raga.pakad}&rdquo;</span>
          </div>
        )}
      </div>

      {/* Action CTA Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-800/80">
        <Link
          href={`/practice?raga=${encodeURIComponent(raga.name)}`}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Practice</span>
        </Link>
        <Link
          href={`/ragas/${encodeURIComponent(raga.id || raga.name.toLowerCase())}`}
          className="px-3 py-2 rounded-xl bg-[#090D16] border border-amber-500/30 text-amber-300 font-medium text-xs hover:bg-amber-500/10 transition-all flex items-center justify-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Details</span>
        </Link>
      </div>
    </div>
  );
}
