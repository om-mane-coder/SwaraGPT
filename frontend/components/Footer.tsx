import React from 'react';
import Link from 'next/link';
import { Music, Heart, GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-amber-900/10 bg-[#F5EFE6] py-12 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Brand Info */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold shadow-md shadow-amber-500/20">
              <Music className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">SwaraGPT</span>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm max-w-md leading-relaxed">
            An AI-Powered Virtual Guru for personalized Indian Classical Music learning. Combining Artificial Intelligence, Pitch Estimation (YIN/FFT), Speech Processing (Whisper), and LLMs to preserve and elevate classical music heritage.
          </p>
          <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-100/80 px-3 py-1.5 rounded-full border border-amber-300/80 w-fit font-medium">
            <GraduationCap className="w-4 h-4 text-amber-800" />
            <span>Walchand College of Engineering, Sangli (WCE)</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h3 className="text-slate-900 font-bold text-xs tracking-wider uppercase">Features</h3>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li><Link href="/chat" className="hover:text-amber-800 transition-colors">AI Virtual Guru</Link></li>
            <li><Link href="/practice" className="hover:text-amber-800 transition-colors">Live Riyaz Studio</Link></li>
            <li><Link href="/ragas" className="hover:text-amber-800 transition-colors">Raga Knowledge Base</Link></li>
            <li><Link href="/progress" className="hover:text-amber-800 transition-colors">Sadhana Progress Tracker</Link></li>
          </ul>
        </div>

        {/* Project Team */}
        <div className="space-y-3">
          <h3 className="text-slate-900 font-bold text-xs tracking-wider uppercase">Development Team</h3>
          <ul className="space-y-1.5 text-xs text-slate-600">
            <li className="text-slate-800 font-medium">Om Ramesh Mane (245100006)</li>
            <li className="text-slate-800 font-medium">Sakshi Jayant Bhosale (245100191)</li>
            <li className="text-slate-800 font-medium">Gauri Dattatray Dhole (245100023)</li>
            <li className="pt-2 text-amber-800 font-semibold text-[11px]">Guide: Prof. P. D. Mundada</li>
            <li className="text-amber-800 font-semibold text-[11px]">HOD: Dr. A. R. Surve</li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-amber-900/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 SwaraGPT — Indian Classical Music Educational Technology.</p>
        <p className="flex items-center gap-1">
          Crafted with <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" /> for Indian Classical Music Learners
        </p>
      </div>
    </footer>
  );
}
