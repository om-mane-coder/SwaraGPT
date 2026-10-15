'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Sparkles, Music, Mic, Award, ArrowRight, Play, CheckCircle2, 
  Activity, BookOpen, ChevronRight, Sliders, Volume2
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span>Indian Classical Vocal Intelligence</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight mb-5">
            Vocal Riyaz with Sub-Cent Precision
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Real-time fundamental frequency tracking, 22-shruti microtonal analysis, and automated raga recognition for dedicated vocalists.
          </p>

          {/* Clean CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-14">
            <Link
              href="/practice"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              id="hero-vocal-cta"
            >
              <Mic className="w-4 h-4" />
              <span>Start Live Riyaz</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/analyze"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              id="hero-analyze-cta"
            >
              <Award className="w-4 h-4 text-slate-500" />
              <span>Analyze Recording</span>
            </Link>
          </div>

          {/* Minimalist Live Waveform Demo */}
          <div className="max-w-3xl mx-auto bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm text-left">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Signal Monitor</span>
              </div>
              <span className="text-slate-400 font-mono">Sample: Raga Yaman</span>
            </div>

            {/* Subtle Waveform */}
            <div className="flex items-center justify-center gap-1.5 h-16 mb-5">
              {[35, 55, 75, 45, 80, 65, 90, 50, 75, 85, 45, 60, 75, 50, 85, 35, 65, 80, 70, 50, 85, 55].map((height, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-slate-300 animate-wave-bar"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${i * 0.07}s`
                  }}
                />
              ))}
            </div>

            {/* Faint Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">Tonic Sa</div>
                <div className="text-sm font-semibold text-slate-900 font-mono">138.6 Hz (C#3)</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">Swara</div>
                <div className="text-sm font-semibold text-emerald-700 font-mono">Ga (Krodha)</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">Raga</div>
                <div className="text-sm font-semibold text-slate-900 font-mono">Yaman (90%)</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">Intonation</div>
                <div className="text-sm font-semibold text-emerald-700 font-mono">Sur (+2.1¢)</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* THREE ESSENTIAL CAPABILITIES */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Live Intonation Gauge</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Sub-cent pitch detection via MPM algorithms provides immediate visual feedback as you sing.
              </p>
              <Link href="/practice" className="text-xs font-medium text-slate-900 hover:text-slate-600 inline-flex items-center gap-1">
                Open studio <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">22 Shrutis & Ornaments</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Measures exact microtonal deviations and detects classical meends, andolans, and kan-swars.
              </p>
              <Link href="/analyze" className="text-xs font-medium text-slate-900 hover:text-slate-600 inline-flex items-center gap-1">
                Upload audio <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Virtual Music Guru</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Musicological guidance grounded in canonical treatises including Natya Shastra and Sangeeta Ratnakara.
              </p>
              <Link href="/chat" className="text-xs font-medium text-slate-900 hover:text-slate-600 inline-flex items-center gap-1">
                Consult Guru <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
