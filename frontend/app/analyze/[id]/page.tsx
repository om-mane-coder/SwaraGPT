'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PerformanceScore from '@/components/feedback/PerformanceScore';
import PitchGraph, { PitchPoint } from '@/components/pitch/PitchGraph';
import { 
  Award, Sparkles, MessageSquare, Download, ArrowLeft, 
  CheckCircle2, AlertTriangle, XCircle, Activity, Music, Share2, Compass, Layers
} from 'lucide-react';
import { useSwaraStore } from '@/lib/store';
import { analysisApi } from '@/lib/api';

// Synthetic sample performance data in case of offline fallback or direct link
const SAMPLE_ANALYSIS = {
  id: "session-demo-01",
  target_raga: "Yaman",
  detected_tonic_hz: 138.59,
  duration_seconds: 14.8,
  overall_score: 82.4,
  pitch_accuracy: 85.0,
  swara_accuracy: 80.5,
  shruti_accuracy: 78.0,
  raga_accuracy: 84.0,
  tonic_stability: 91.2,
  confidence: 0.94,
  raga_candidates: [
    { raga: "Yaman", confidence: 0.84, explanation: "Strong presence of Tivra Ma (590¢) and Shuddha Ni leading cleanly to Taar Sa." },
    { raga: "Kalyan", confidence: 0.11, explanation: "Closely aligned parent Thaat melodic structure." },
    { raga: "Marwa", confidence: 0.05, explanation: "Tivra Ma shared, but Komal Re was absent in this phrase." },
  ],
  detected_ornaments: [
    { type: "Meend", swaras: "Pa → Ga", start_time: 3.2, duration: 1.1, smoothness: "92% continuous glide" },
    { type: "Gamak", swaras: "Dha", start_time: 7.4, duration: 0.6, oscillations: "5.2 Hz vibrato" },
    { type: "Kan-Swar", swaras: "Ni (grace before Sa)", start_time: 11.0, duration: 0.15, note: "Expressive grace note" }
  ],
  strengths: [
    "Rock-solid Sa stability (138.6 Hz reference maintained within ±4¢).",
    "Flawless intonation on Pancham (Pa) with excellent breath support.",
    "Expressive and continuous Meend transition connecting Pa down to Ga."
  ],
  issues: [
    "Gandhar (Ga) tended to drift 28¢ sharp during the sustained phrase.",
    "Tivra Ma intonation was slightly hurried before resolving to Pa."
  ],
  recommendations: [
    "Practice sustaining Ga for 4 seconds at 386¢ against the drone.",
    "Repeat the signature Yaman pakad: 'N R G, R G M' P, D P M' G R, .N R S'.",
    "Focus on slow meend glides without stepping pitch jumps."
  ],
  pitch_points: [
    { time: 0.0, frequency: 138.6, cents: 0.0, swara: "Sa", deviation: 0.0, confidence: 0.96 },
    { time: 0.5, frequency: 139.1, cents: 6.2, swara: "Sa", deviation: 6.2, confidence: 0.95 },
    { time: 1.0, frequency: 138.4, cents: -2.5, swara: "Sa", deviation: -2.5, confidence: 0.98 },
    { time: 1.8, frequency: 155.8, cents: 203.0, swara: "Re", deviation: 3.0, confidence: 0.93 },
    { time: 2.5, frequency: 174.5, cents: 398.0, swara: "Ga", deviation: 11.7, confidence: 0.91 },
    { time: 3.2, frequency: 176.2, cents: 414.8, swara: "Ga", deviation: 28.5, confidence: 0.90 },
    { time: 4.0, frequency: 195.8, cents: 597.5, swara: "Ma'", deviation: 7.3, confidence: 0.94 },
    { time: 5.2, frequency: 207.9, cents: 702.0, swara: "Pa", deviation: 0.0, confidence: 0.97 },
    { time: 6.5, frequency: 208.4, cents: 706.2, swara: "Pa", deviation: 4.2, confidence: 0.96 },
    { time: 7.8, frequency: 233.2, cents: 894.0, swara: "Dha", deviation: 9.6, confidence: 0.92 },
    { time: 9.0, frequency: 261.2, cents: 1092.5, swara: "Ni", deviation: 4.2, confidence: 0.93 },
    { time: 10.5, frequency: 277.2, cents: 1200.0, swara: "Sa'", deviation: 0.0, confidence: 0.97 },
  ]
};

function PerformanceReportContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lastAnalysis } = useSwaraStore();

  const [data, setData] = useState<typeof SAMPLE_ANALYSIS>(SAMPLE_ANALYSIS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If store has lastAnalysis from recent session, use it
    if (lastAnalysis) {
      setData({
        ...SAMPLE_ANALYSIS,
        ...lastAnalysis,
        target_raga: lastAnalysis.target_raga || lastAnalysis.raga_match?.name || SAMPLE_ANALYSIS.target_raga,
        overall_score: lastAnalysis.overall_score || lastAnalysis.score || SAMPLE_ANALYSIS.overall_score,
        pitch_accuracy: lastAnalysis.pitch_accuracy || SAMPLE_ANALYSIS.pitch_accuracy,
        swara_accuracy: lastAnalysis.swara_accuracy || SAMPLE_ANALYSIS.swara_accuracy,
        shruti_accuracy: lastAnalysis.shruti_accuracy || SAMPLE_ANALYSIS.shruti_accuracy,
        raga_accuracy: lastAnalysis.raga_accuracy || SAMPLE_ANALYSIS.raga_accuracy,
        tonic_stability: lastAnalysis.tonic_stability || SAMPLE_ANALYSIS.tonic_stability,
        pitch_points: lastAnalysis.pitch_points || SAMPLE_ANALYSIS.pitch_points,
      });
    } else {
      // Check query params
      const qRaga = searchParams.get('raga');
      const qTonic = searchParams.get('tonic');
      if (qRaga) {
        setData((prev) => ({
          ...prev,
          target_raga: qRaga,
          detected_tonic_hz: qTonic ? parseFloat(qTonic) : prev.detected_tonic_hz,
        }));
      }
    }
  }, [lastAnalysis, searchParams]);

  // Navigate to AI Guru chat with full performance context pre-populated
  const handleAskGuru = () => {
    const query = `Guru ji, please analyze my recent performance of Raga ${data.target_raga}. My overall score was ${Math.round(data.overall_score)}% (Pitch: ${Math.round(data.pitch_accuracy)}%, Swara: ${Math.round(data.swara_accuracy)}%). My weak points were: ${data.issues.join('; ')}. How can I fix this in my next riyaz?`;
    router.push(`/chat?q=${encodeURIComponent(query)}&raga=${encodeURIComponent(data.target_raga)}&score=${Math.round(data.overall_score)}`);
  };

  // Download printable PDF report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb & Action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-[#090D16] border border-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
                Evaluation Report • Session ID: {String(params?.id || 'latest')}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                Vocal Performance & Shruti Analysis
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAskGuru}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask Guru About This</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-gray-800 text-gray-300 font-semibold text-xs hover:border-gray-700 transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Top Summary Banner */}
        <div className="glass-card p-6 rounded-2xl border border-amber-500/20 mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-[#090D16] border border-gray-800/80">
            <div className="text-[10px] text-gray-400 font-mono">Target Raga</div>
            <div className="text-base font-bold text-amber-400 font-serif">Raga {data.target_raga}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#090D16] border border-gray-800/80">
            <div className="text-[10px] text-gray-400 font-mono">Detected Sa (Tonic)</div>
            <div className="text-base font-bold text-white font-mono">{data.detected_tonic_hz.toFixed(1)} Hz</div>
          </div>
          <div className="p-3 rounded-xl bg-[#090D16] border border-gray-800/80">
            <div className="text-[10px] text-gray-400 font-mono">Phrase Duration</div>
            <div className="text-base font-bold text-sky-400 font-mono">{data.duration_seconds}s</div>
          </div>
          <div className="p-3 rounded-xl bg-[#090D16] border border-gray-800/80">
            <div className="text-[10px] text-gray-400 font-mono">Analysis Confidence</div>
            <div className="text-base font-bold text-emerald-400 font-mono">{Math.round(data.confidence * 100)}%</div>
          </div>
        </div>

        {/* Score & Pitch Contour Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Left Column: Transparent Performance Score Breakdown */}
          <div className="lg:col-span-1">
            <PerformanceScore
              overallScore={data.overall_score}
              pitchAccuracy={data.pitch_accuracy}
              swaraAccuracy={data.swara_accuracy}
              shrutiAccuracy={data.shruti_accuracy}
              ragaAccuracy={data.raga_accuracy}
              tonicStability={data.tonic_stability}
              confidence={data.confidence}
            />
          </div>

          {/* Right Column (2 cols): Pitch Contour & Melodic Trajectory */}
          <div className="lg:col-span-2 space-y-6">
            <PitchGraph
              pitchPoints={data.pitch_points}
              referenceSa={data.detected_tonic_hz}
              targetRaga={data.target_raga}
              title={`F0 Pitch Trajectory — ${data.target_raga}`}
              subtitle="Extracted vocal fundamental frequency vs. nominal swara intervals"
              height={320}
            />

            {/* Ornamentation Awareness Section */}
            <div className="glass-card p-6 rounded-2xl border border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Ornamentation & Continuous Glides</h3>
                <span className="text-[10px] font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                  Non-error expressive segmentation
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                The MIR engine distinguishes intentional expressive movements (Meend, Gamak, Kan-swar) from pitch instability.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {data.detected_ornaments.map((orn, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#090D16] border border-gray-800 text-xs">
                    <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
                      <span>{orn.type}</span>
                      <span className="text-[10px] font-mono text-gray-500">{orn.start_time}s</span>
                    </div>
                    <div className="text-gray-200 font-mono text-[11px] mb-1">{orn.swaras}</div>
                    <div className="text-gray-400 text-[10px]">{orn.smoothness || orn.oscillations || orn.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section: Raga Candidates & Guru Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Automated Raga Recognition Candidates */}
          <div className="glass-card p-6 rounded-2xl border border-amber-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Raga Recognition Candidates</h3>
              </div>
              <span className="text-[10px] font-mono text-gray-400 bg-gray-800/80 px-2 py-0.5 rounded border border-gray-700">
                Baseline Model Confidence
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Candidate ranking based on scale adherence (0.40), vadi/samvadi energy (0.35), and pakad n-gram matching (0.25).
            </p>

            <div className="space-y-3">
              {data.raga_candidates.map((c, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#090D16] border border-gray-800 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white text-sm font-serif">
                      {i + 1}. Raga {c.raga}
                    </span>
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {Math.round(c.confidence * 100)}% Match
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {c.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Constructive AI Guru Feedback */}
          <div className="glass-card p-6 rounded-2xl border border-amber-500/20 space-y-5">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Virtual Guru Pedagogical Feedback</h3>
            </div>

            {/* Strengths */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Strengths Observed:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {data.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2 bg-[#090D16] p-2.5 rounded-lg border border-gray-800">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Microtonal Adjustments Needed:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {data.issues.map((iss, i) => (
                  <li key={i} className="flex items-start gap-2 bg-[#090D16] p-2.5 rounded-lg border border-gray-800">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{iss}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actionable Practice Drills */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 mb-2">
                <Music className="w-4 h-4" />
                <span>Recommended Practice Drills:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {data.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 bg-[#090D16] p-2.5 rounded-lg border border-gray-800">
                    <span className="text-sky-400 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function PerformanceReportPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#FAF8F5]" />}>
      <PerformanceReportContent />
    </React.Suspense>
  );
}
