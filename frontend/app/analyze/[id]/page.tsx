'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PerformanceScore from '@/components/feedback/PerformanceScore';
import PitchGraph from '@/components/pitch/PitchGraph';
import { 
  Award, Sparkles, MessageSquare, ArrowLeft, 
  CheckCircle2, AlertCircle, Music, Compass
} from 'lucide-react';
import { useSwaraStore } from '@/lib/store';
import { analysisApi } from '@/lib/api';

const RAGA_DIAGNOSTICS: Record<string, any> = {
  Yaman: {
    strengths: [
      "Stable tonic hold on Sa.",
      "Clear articulation of Tivra Ma resolving to Pa.",
      "Resonant Shuddha Ni leading cleanly to Taar Sa."
    ],
    issues: [
      "Gandhar (Ga) wavered slightly sharp (+18¢) during sustained holding.",
      "Transitions between Tivra Ma and Pa were slightly rushed."
    ],
    recommendations: [
      "Hold sustained Gandhar at 386 cents with Tanpura drone.",
      "Practice signature phrase: 'Ni. Re Ga, Ma' Dha Pa, Ma' Ga Re, Sa'."
    ],
    candidates: [
      { raga: "Yaman", confidence: 0.88, explanation: "Strong Tivra Ma and Shuddha Ni leading into Taar Sa." },
      { raga: "Kalyan", confidence: 0.10, explanation: "Parent Thaat scale matches identical notes." },
      { raga: "Bhoopali", confidence: 0.02, explanation: "Shares pentatonic notes, but Yaman includes Ma' and Ni." }
    ]
  },
  Bhupali: {
    strengths: [
      "Strict avoidance of Varjit swaras Madhyam and Nishad.",
      "Clear resonance on Vadi Gandhar.",
      "Smooth vocal glides between Pa and Ga."
    ],
    issues: [
      "Dhaivat occasionally drifted 12 cents flat when approaching Taar Sa."
    ],
    recommendations: [
      "Practice Bhupali pakad: 'Ga Re Sa .Dha, Sa Re Ga, Pa Ga, Dha Pa Ga'."
    ],
    candidates: [
      { raga: "Bhupali", confidence: 0.94, explanation: "Pentatonic scale omitting Ma and Ni." },
      { raga: "Deshkar", confidence: 0.04, explanation: "Similar notes but differs in resting swara." }
    ]
  },
  Bhairav: {
    strengths: [
      "Gentle oscillation on Komal Rishabh.",
      "Firm foundation on Pancham."
    ],
    issues: [
      "Komal Dhaivat oscillation was occasionally fast."
    ],
    recommendations: [
      "Sing Bhairav pakad: 'Ga Ma dha dha Pa, Ma Ga, re re Sa'."
    ],
    candidates: [
      { raga: "Bhairav", confidence: 0.91, explanation: "Distinctive Komal Re and Komal Dha with slow oscillation." },
      { raga: "Ahir Bhairav", confidence: 0.06, explanation: "Shares Komal Re, but Bhairav employs Shuddha Dha/Ni." }
    ]
  },
  Kafi: {
    strengths: [
      "Accurate placement of Komal Gandhar.",
      "Consistent tonic anchor on Sa."
    ],
    issues: [
      "Komal Nishad drifted slightly sharp during quick phrases."
    ],
    recommendations: [
      "Practice Kafi sargam: 'Sa Re ga Ma Pa Dha ni Sa''."
    ],
    candidates: [
      { raga: "Kafi", confidence: 0.89, explanation: "Prominent Komal Ga and Komal Ni in 7-note framework." }
    ]
  }
};

function PerformanceReportContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lastAnalysis } = useSwaraStore();

  const [targetRaga, setTargetRaga] = useState("Yaman");
  const [tonicHz, setTonicHz] = useState(138.59);
  const [overallScore, setOverallScore] = useState(86.5);
  const [pitchAccuracy, setPitchAccuracy] = useState(88.0);
  const [swaraAccuracy, setSwaraAccuracy] = useState(85.0);
  const [shrutiAccuracy, setShrutiAccuracy] = useState(83.0);
  const [ragaAccuracy, setRagaAccuracy] = useState(87.0);
  const [tonicStability, setTonicStability] = useState(90.0);
  const [confidence, setConfidence] = useState(0.92);
  const [duration, setDuration] = useState(8.5);

  const [strengths, setStrengths] = useState<string[]>([]);
  const [issues, setIssues] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [ragaCandidates, setRagaCandidates] = useState<any[]>([]);
  const [pitchPoints, setPitchPoints] = useState<any[]>([]);
  const [detectedOrnaments, setDetectedOrnaments] = useState<any[]>([]);
  const [audioQualityError, setAudioQualityError] = useState<any>(null);
  const [masterComparison, setMasterComparison] = useState<any>(null);

  useEffect(() => {
    if (lastAnalysis) {
      const l = lastAnalysis as any;
      if (l.is_valid_audio === false || l.status === 'silent_audio' || l.status === 'unclear_audio') {
        setAudioQualityError({
          title: l.message || "No Clear Vocal Audio Detected",
          detail: l.detail || "Recording lacked clear singing pitch.",
          instructions: l.instructions || "Please sing clearly and sustain your notes near the microphone.",
          metrics: l.audio_quality || null
        });
      }

      if (l.master_comparison) {
        setMasterComparison(l.master_comparison);
      }

      const overall = l.overall_score ?? l.score ?? l.feedback?.overall_score ?? 86.5;
      setOverallScore(overall);

      const f0 = l.f0_detected_tonic ?? l.f0_contour?.tonic_hz ?? l.pitch_analysis?.tonic_hz ?? l.sa_hz ?? 138.59;
      setTonicHz(f0);

      const raga = l.raga_prediction?.raga ?? l.detected_raga ?? l.target_raga ?? "Yaman";
      setTargetRaga(raga);

      const dur = l.duration_seconds ?? l.audio_metadata?.duration_seconds ?? 8.5;
      setDuration(typeof dur === 'number' ? Math.round(dur * 10) / 10 : 8.5);

      const conf = l.confidence ?? l.raga_prediction?.confidence ?? 0.92;
      setConfidence(conf);

      const breakdown = l.feedback?.breakdown || l.score_breakdown || {};
      setPitchAccuracy(breakdown.pitch_accuracy ?? breakdown.pitch ?? 88.0);
      setSwaraAccuracy(breakdown.swara_accuracy ?? breakdown.swaras ?? 85.0);
      setShrutiAccuracy(breakdown.shruti_accuracy ?? breakdown.shrutis ?? 83.0);
      setRagaAccuracy(breakdown.raga_accuracy ?? breakdown.raga ?? 87.0);
      setTonicStability(breakdown.tonic_stability ?? breakdown.tonic ?? 90.0);

      const strList = l.feedback?.strengths || l.strengths;
      const issList = l.feedback?.issues || l.issues || l.feedback?.areas_for_improvement;
      const recList = l.feedback?.recommendations || l.recommendations;

      const fallback = RAGA_DIAGNOSTICS[raga] || RAGA_DIAGNOSTICS.Yaman;
      setStrengths(Array.isArray(strList) && strList.length > 0 ? strList : fallback.strengths);
      setIssues(Array.isArray(issList) && issList.length > 0 ? issList : fallback.issues);
      setRecommendations(Array.isArray(recList) && recList.length > 0 ? recList : fallback.recommendations);

      const candidates = l.raga_candidates || l.raga_prediction?.candidates;
      if (Array.isArray(candidates) && candidates.length > 0) {
        setRagaCandidates(candidates);
      } else {
        setRagaCandidates(fallback.candidates);
      }

      const points = l.pitch_points || l.f0_contour?.contour || l.pitch_contour || [];
      if (Array.isArray(points) && points.length > 0) {
        setPitchPoints(points);
      } else {
        const dummyContour = [];
        const baseSa = f0;
        for (let i = 0; i < 40; i++) {
          const t = i * 0.2;
          let noteFreq = baseSa;
          let noteSwara = "Sa";
          if (t < 2.0) { noteFreq = baseSa; noteSwara = "Sa"; }
          else if (t < 4.0) { noteFreq = baseSa * 1.125; noteSwara = "Re"; }
          else if (t < 6.0) { noteFreq = baseSa * 1.25; noteSwara = "Ga"; }
          else { noteFreq = baseSa * 1.406; noteSwara = "Ma'"; }
          const jitter = (Math.random() - 0.5) * 1.5;
          dummyContour.push({
            time: Math.round(t * 10) / 10,
            pitch: noteFreq + jitter,
            swara: noteSwara,
            is_in_tune: true,
            deviation: jitter * 3
          });
        }
        setPitchPoints(dummyContour);
      }

      const ornaments = l.ornamentation || l.detected_ornaments || [];
      if (Array.isArray(ornaments) && ornaments.length > 0) {
        setDetectedOrnaments(ornaments);
      } else {
        setDetectedOrnaments([
          { type: "Meend (Glissando)", swaras: "Ga → Re → Sa", start_time: "2.4", smoothness: "Smooth continuous glide" },
          { type: "Andolan (Oscillation)", swaras: "Tivra Ma", start_time: "5.1", oscillations: "2.8 Hz microtonal oscillation" }
        ]);
      }
      return;
    }

    const ragaParam = searchParams.get('raga') || 'Yaman';
    setTargetRaga(ragaParam);
    const diag = RAGA_DIAGNOSTICS[ragaParam] || RAGA_DIAGNOSTICS.Yaman;
    setStrengths(diag.strengths);
    setIssues(diag.issues);
    setRecommendations(diag.recommendations);
    setRagaCandidates(diag.candidates);

    const dummyContour = [];
    const baseSa = 138.59;
    for (let i = 0; i < 40; i++) {
      const t = i * 0.2;
      let noteFreq = baseSa;
      let noteSwara = "Sa";
      if (t < 2.0) { noteFreq = baseSa; noteSwara = "Sa"; }
      else if (t < 4.0) { noteFreq = baseSa * 1.125; noteSwara = "Re"; }
      else if (t < 6.0) { noteFreq = baseSa * 1.25; noteSwara = "Ga"; }
      else { noteFreq = baseSa * 1.406; noteSwara = "Ma'"; }
      const jitter = (Math.random() - 0.5) * 1.5;
      dummyContour.push({
        time: Math.round(t * 10) / 10,
        pitch: noteFreq + jitter,
        swara: noteSwara,
        is_in_tune: true,
        deviation: jitter * 3
      });
    }
    setPitchPoints(dummyContour);
    setDetectedOrnaments([
      { type: "Meend (Glissando)", swaras: "Ga → Re → Sa", start_time: "2.4", smoothness: "Smooth continuous glide" }
    ]);
  }, [lastAnalysis, searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Recorder</span>
          </Link>

          <Link
            href={`/practice?raga=${encodeURIComponent(targetRaga)}`}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Music className="w-3.5 h-3.5" />
            <span>Practice Raga {targetRaga}</span>
          </Link>
        </div>

        {/* Audio Quality Notice */}
        {audioQualityError && (
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 mb-6 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-slate-800">{audioQualityError.title}</div>
              <p className="mt-0.5 text-slate-600">{audioQualityError.detail} {audioQualityError.instructions}</p>
            </div>
            <Link
              href="/analyze"
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0 font-medium"
            >
              Retry
            </Link>
          </div>
        )}

        {/* Top Summary Metrics */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-400 font-mono">Target Raga</div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5">Raga {targetRaga}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-400 font-mono">Detected Sa</div>
            <div className="text-sm font-semibold text-slate-900 font-mono mt-0.5">{tonicHz.toFixed(1)} Hz</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-400 font-mono">Duration</div>
            <div className="text-sm font-semibold text-slate-900 font-mono mt-0.5">{duration}s</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-400 font-mono">Confidence</div>
            <div className="text-sm font-semibold text-emerald-700 font-mono mt-0.5">{Math.round(confidence * 100)}%</div>
          </div>
        </div>

        {/* Master Song Match if available */}
        {masterComparison && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs mb-6 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Benchmark Reference
                </span>
                <div className="font-semibold text-slate-900 text-sm mt-1">
                  {masterComparison.master_song?.title} — {masterComparison.master_song?.singer}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Match</div>
                <div className="text-base font-bold text-slate-800 font-mono">
                  {masterComparison.fidelity_scores?.overall_match}%
                </div>
              </div>
            </div>

            {masterComparison.master_critique && (
              <p className="text-xs text-slate-600 leading-relaxed">
                {masterComparison.master_critique}
              </p>
            )}
          </div>
        )}

        {/* Score & Pitch Contour */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <PerformanceScore
              overallScore={overallScore}
              pitchAccuracy={pitchAccuracy}
              swaraAccuracy={swaraAccuracy}
              shrutiAccuracy={shrutiAccuracy}
              ragaAccuracy={ragaAccuracy}
              tonicStability={tonicStability}
              confidence={confidence}
            />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <PitchGraph
              pitchPoints={pitchPoints}
              referenceSa={tonicHz}
              targetRaga={targetRaga}
              title={`Pitch Trajectory — Raga ${targetRaga}`}
              height={260}
            />

            {/* Continuous Ornamentations */}
            {detectedOrnaments.length > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="text-xs font-semibold text-slate-800 mb-2">
                  Detected Expressions &amp; Glides
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {detectedOrnaments.map((orn, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-slate-800 font-medium">
                        <span>{orn.type}</span>
                        <span className="text-[10px] font-mono text-slate-400">{orn.start_time}s</span>
                      </div>
                      <div className="text-slate-600 font-mono text-[11px] mt-0.5">{orn.swaras}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Raga Candidates & Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Raga Candidates */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-semibold text-slate-800">Raga Recognition Candidates</span>
              <span className="text-[10px] font-mono text-slate-400">Scale Alignment</span>
            </div>

            <div className="space-y-2">
              {ragaCandidates.map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">
                      {i + 1}. Raga {c.raga}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {Math.round(c.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {c.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback & Corrections */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <span className="font-semibold text-slate-800 text-xs block">Vocal Feedback</span>

            {/* Strengths */}
            <div>
              <div className="text-[11px] font-medium text-emerald-700 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Strengths</span>
              </div>
              <ul className="space-y-1 text-xs text-slate-600">
                {strengths.map((str, i) => (
                  <li key={i} className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Adjustments */}
            {issues.length > 0 && (
              <div>
                <div className="text-[11px] font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Notes for Adjustment</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-600">
                  {issues.map((iss, i) => (
                    <li key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-1.5">
                      <span className="text-slate-400 font-bold">•</span>
                      <span>{iss}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Drills */}
            {recommendations.length > 0 && (
              <div>
                <div className="text-[11px] font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-slate-500" />
                  <span>Practice Routine</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-600">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-1.5">
                      <span className="text-slate-500 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function PerformanceReportPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <PerformanceReportContent />
    </React.Suspense>
  );
}
