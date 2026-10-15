export interface PitchPoint {
  time: number;
  pitch: number;
  frequency?: number;
  confidence: number;
  swara: string;
  canonical_swara?: string;
  shruti: string;
  delta_cents: number;
  cents?: number;
  deviation?: number;
  is_in_tune: boolean;
}

export interface SwaraEvent {
  swara: string;
  swara_type: string;
  shruti_name: string;
  octave: 'Mandra' | 'Madhya' | 'Taar';
  start_time: number;
  end_time: number;
  duration: number;
  mean_pitch: number;
  cents_from_sa: number;
  cents_deviation: number;
  accuracy: number;
  stability: number;
  intonation_status: string;
  is_in_tune: boolean;
  frequency?: number;
  timestamp?: number;
}

export interface OrnamentEvent {
  type: 'Meend' | 'Andolan' | 'Gamak' | 'Kan-swar' | 'Murki/Khatka' | string;
  start_time: number;
  end_time: number;
  duration: number;
  start_freq: number;
  end_freq: number;
  net_cent_change: number;
  slope_cents_per_sec: number;
  swaras?: string;
  oscillations?: string;
  smoothness?: string;
  description: string;
}

export interface RagaCandidate {
  raga_name: string;
  raga?: string;
  confidence: number;
  thaat: string;
  vadi: string;
  samvadi: string;
  scale_adherence: number;
  vadi_adherence: number;
  pakad_match_score: number;
  explanation: string;
  description?: string;
}

export interface ShrutiDefinition {
  index: number;
  name: string;
  sanskrit: string;
  swara: string;
  canonical_swara: string;
  swara_type: string;
  cents: number;
  ratio_str: string;
  ratio: number;
  rasa: string;
  description: string;
}

export interface AudioQualityMetrics {
  is_valid: boolean;
  duration_seconds: number;
  rms_energy: number;
  signal_to_noise_ratio_db: number;
  voiced_percentage: number;
  status: 'clear_audio' | 'unclear_audio' | 'silent_audio';
  message: string;
  instructions: string;
}

export interface ScoreBreakdown {
  overall_score: number;
  pitch_score: number;
  swara_score: number;
  shruti_score: number;
  raga_score: number;
  tonic_score: number;
}

export interface AnalysisResult {
  session_id: string;
  status: string;
  is_valid_audio: boolean;
  duration_seconds: number;
  tonic: {
    estimated_sa_hz: number;
    confidence: number;
    nearest_western_note: string;
    source: string;
  };
  score: ScoreBreakdown;
  overall_score: number;
  pitch_accuracy: number;
  swara_accuracy: number;
  shruti_accuracy: number;
  raga_accuracy: number;
  tonic_stability: number;
  pitch_stability: number;
  shruti_precision: number;
  mean_shruti_deviation_cents: number;
  detected_raga: string;
  target_raga: string;
  raga_confidence: number;
  raga_candidates: RagaCandidate[];
  raga_predictions: RagaCandidate[];
  detected_swaras: SwaraEvent[];
  swara_timeline: SwaraEvent[];
  pitch_contour: PitchPoint[];
  display_pitch_contour: PitchPoint[];
  detected_ornaments: OrnamentEvent[];
  ornament_segments: OrnamentEvent[];
  strong_swaras: string[];
  weak_swaras: string[];
  strengths: string[];
  issues: string[];
  recommendations: string[];
  practice_recommendations: string[];
  ai_feedback: string;
  audio_quality?: AudioQualityMetrics;
}
