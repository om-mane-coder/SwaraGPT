import React from 'react';
import Link from 'next/link';
import { Music, GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-pink-100/80 bg-white py-10 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Brand Info */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-900 ring-1 ring-pink-300/60 flex items-center justify-center text-pink-300">
              <Music className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">SwaraGPT</span>
          </div>
          <p className="text-slate-500 max-w-sm leading-relaxed">
            Intelligent Riyaz companion for Indian Classical Music learners across Hindustani and Carnatic traditions.
          </p>
          <div className="flex items-center gap-1.5 text-slate-600 bg-pink-50/50 px-2.5 py-1 rounded-md border border-pink-100/80 w-fit">
            <GraduationCap className="w-3.5 h-3.5 text-pink-700" />
            <span>Walchand College of Engineering, Sangli</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <div className="text-slate-900 font-semibold uppercase tracking-wider text-[11px]">Resources</div>
          <ul className="space-y-1.5">
            <li><Link href="/practice" className="hover:text-pink-900 transition-colors">Practice Studio</Link></li>
            <li><Link href="/analyze" className="hover:text-pink-900 transition-colors">Vocal Analyzer</Link></li>
            <li><Link href="/ragas" className="hover:text-pink-900 transition-colors">Raga Catalog</Link></li>
            <li><Link href="/chat" className="hover:text-pink-900 transition-colors">Guru AI</Link></li>
            <li><a href="https://github.com/om-mane-coder/SwaraGPT" target="_blank" rel="noopener noreferrer" className="hover:text-pink-900 transition-colors">GitHub Repository ↗</a></li>
          </ul>
        </div>

        {/* Project Team */}
        <div className="space-y-2">
          <div className="text-slate-900 font-semibold uppercase tracking-wider text-[11px]">Academic Project</div>
          <ul className="space-y-1 text-slate-600">
            <li>Om Ramesh Mane</li>
            <li>Sakshi Jayant Bhosale</li>
            <li>Gauri Dattatray Dhole</li>
            <li className="pt-1 text-slate-400">Guide: Prof. P. D. Mundada</li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-pink-50 flex flex-col sm:flex-row items-center justify-between text-slate-400 gap-2">
        <p>© 2026 SwaraGPT — Indian Classical Music Education System</p>
        <p>Built with Next.js & DSP</p>
      </div>
    </footer>
  );
}
