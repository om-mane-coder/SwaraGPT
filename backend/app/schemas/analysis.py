"""
SwaraGPT - Comprehensive Performance Analysis Schemas
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.audio import PitchPoint, SwaraEvent, OrnamentSegment, TonicEstimate, RagaCandidate


class ScoreBreakdown(BaseModel):
    pitch_score: float     # 35% weight
    swara_score: float     # 25% weight
    shruti_score: float    # 15% weight
    raga_score: float      # 15% weight
    tonic_score: float     # 10% weight
    overall_score: float   # Weighted total 0 - 100
    formula_explanation: str


class FullAnalysisResponse(BaseModel):
    session_id: str
    duration_seconds: float = 0.0
    tonic: Optional[TonicEstimate] = None
    score: Optional[ScoreBreakdown] = None
    detected_raga: Optional[str] = "Yaman"
    raga_confidence: Optional[float] = 0.85
    raga_candidates: Optional[List[RagaCandidate]] = None
    pitch_stability: Optional[float] = 0.0
    shruti_precision: Optional[float] = 0.0
    mean_shruti_deviation_cents: Optional[float] = 0.0
    strong_swaras: Optional[List[str]] = None
    weak_swaras: Optional[List[str]] = None
    pitch_contour: Optional[List[PitchPoint]] = None
    swara_timeline: Optional[List[SwaraEvent]] = None
    ornament_segments: Optional[List[OrnamentSegment]] = None
    feedback_text: Optional[str] = ""
    recommendations: Optional[List[str]] = None
    is_demo: bool = False

    # Audio Validation & Diagnostics
    status: str = "success"  # "success", "unclear_audio", "silent_audio", "too_short"
    is_valid_audio: bool = True
    error_code: Optional[str] = None
    detail: Optional[str] = None
    message: Optional[str] = None
    instructions: Optional[str] = None
    audio_quality: Optional[Dict[str, Any]] = None

    # Original Master Comparison & Song Recognition
    identified_song: Optional[Dict[str, Any]] = None
    master_comparison: Optional[Dict[str, Any]] = None

    # Frontend Compatibility & Direct Mapping Aliases
    overall_score: Optional[float] = None
    pitch_accuracy: Optional[float] = None
    swara_accuracy: Optional[float] = None
    shruti_accuracy: Optional[float] = None
    raga_accuracy: Optional[float] = None
    tonic_stability: Optional[float] = None
    shruti_deviation: Optional[float] = None
    sa_estimate: Optional[float] = None
    target_raga: Optional[str] = None
    pitch_analysis: Optional[Dict[str, Any]] = None
    detected_swaras: Optional[List[Dict[str, Any]]] = None
    raga_predictions: Optional[List[Dict[str, Any]]] = None
    ai_feedback: Optional[str] = None
    practice_recommendations: Optional[List[str]] = None
    strengths: Optional[List[str]] = None
    issues: Optional[List[str]] = None
    detected_ornaments: Optional[List[Dict[str, Any]]] = None
    pitch_points: Optional[List[Dict[str, Any]]] = None


class PakadAnalysisRequest(BaseModel):
    target_raga: str
    file_path: Optional[str] = None


class PakadAnalysisResponse(BaseModel):
    target_raga: str
    target_pakad_notation: str
    reference_contour: List[Dict[str, float]]
    student_contour: List[Dict[str, float]]
    similarity_score: float
    feedback: str
