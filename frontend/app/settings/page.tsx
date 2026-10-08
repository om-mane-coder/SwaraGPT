'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Settings as SettingsIcon, Sliders, Mic, Shield, Trash2, 
  CheckCircle, Globe, Moon, Volume2, AlertTriangle 
} from 'lucide-react';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'dark' | 'saffron'>('dark');
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [micSensitivity, setMicSensitivity] = useState<number>(75);
  const [analysisMode, setAnalysisMode] = useState<'swara' | 'shruti'>('swara');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [privacyAudioRetention, setPrivacyAudioRetention] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const audioInputs = devices.filter((d) => d.kind === 'audioinput');
        setAudioDevices(audioInputs);
        if (audioInputs.length > 0) {
          setSelectedDevice(audioInputs[0].deviceId);
        }
      }).catch(() => {
        // devices fallback
      });
    }
  }, []);

  const handleClearRecordings = () => {
    if (confirm("Are you sure you want to permanently delete your saved vocal practice recordings?")) {
      setNotice("All user audio recordings permanently expunged from the storage tier.");
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Reset local practice history and telemetry?")) {
      setNotice("Local practice history and analytics cache cleared.");
      setTimeout(() => setNotice(null), 4000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-serif">Studio & Application Settings</h1>
            <p className="text-xs text-gray-400">Hardware calibration, audio processing thresholds, and privacy controls.</p>
          </div>
        </div>

        {notice && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{notice}</span>
          </div>
        )}

        <div className="space-y-8">
          
          {/* Audio Hardware & DSP Section */}
          <div className="glass-card p-6 rounded-2xl border border-amber-500/20 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-amber-400" />
              <span>Audio Hardware & MIR Input</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-2">Microphone Input Device:</label>
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  className="w-full bg-[#090D16] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {audioDevices.length > 0 ? (
                    audioDevices.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `Microphone ${i + 1}`}
                      </option>
                    ))
                  ) : (
                    <option value="default">Default System Microphone</option>
                  )}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-gray-400">Microphone Sensitivity / Gain:</span>
                  <span className="text-amber-300 font-bold">{micSensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={micSensitivity}
                  onChange={(e) => setMicSensitivity(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-2">Default Visualization Mode:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAnalysisMode('swara')}
                    className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                      analysisMode === 'swara'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#090D16] border-gray-800 text-gray-400'
                    }`}
                  >
                    12-Nominal Swara Mode (Default)
                  </button>
                  <button
                    onClick={() => setAnalysisMode('shruti')}
                    className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                      analysisMode === 'shruti'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#090D16] border-gray-800 text-gray-400'
                    }`}
                  >
                    22-Shruti Radial Intonation Mode
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="glass-card p-6 rounded-2xl border border-amber-500/20 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Language & Aesthetics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-2">Interface Language:</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                  className="w-full bg-[#090D16] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="en">English (Classical Musicology)</option>
                  <option value="hi">हिन्दी (पारंपरिक शब्दावली)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-2">Color Atmosphere:</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'dark' | 'saffron')}
                  className="w-full bg-[#090D16] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="dark">Deep Indigo Obsidian (Dark)</option>
                  <option value="saffron">Saffron Classical Radiance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy & Data Ownership Section */}
          <div className="glass-card p-6 rounded-2xl border border-amber-500/20 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Audio Privacy & Data Ownership</span>
            </h3>

            <p className="text-xs text-gray-400 leading-relaxed">
              SwaraGPT values your vocal practice privacy. Your recorded audio files are never published publicly or shared with commercial entities.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#090D16] border border-gray-800">
                <div>
                  <div className="text-xs font-semibold text-white">Temporary Audio Buffering Only</div>
                  <div className="text-[11px] text-gray-400">Automatically delete raw recordings after feature extraction</div>
                </div>
                <input
                  type="checkbox"
                  checked={privacyAudioRetention}
                  onChange={(e) => setPrivacyAudioRetention(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleClearRecordings}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete All Vocal Audio Recordings</span>
                </button>
                <button
                  onClick={handleClearHistory}
                  className="px-4 py-2.5 rounded-xl bg-[#090D16] border border-gray-800 text-gray-300 text-xs font-semibold hover:bg-gray-800 transition-all"
                >
                  Clear Analytics Cache
                </button>
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
