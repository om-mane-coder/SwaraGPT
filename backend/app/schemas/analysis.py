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
    duration_seconds: float
    tonic: TonicEstimate
    score: ScoreBreakdown
    detected_raga: str
    raga_confidence: float
    raga_candidates: List[RagaCandidate]
    pitch_stability: float
    shruti_precision: float
    mean_shruti_deviation_cents: float
    strong_swaras: List[str]
    weak_swaras: List[str]
    pitch_contour: List[PitchPoint]
    swara_timeline: List[SwaraEvent]
    ornament_segments: List[OrnamentSegment]
    feedback_text: str
    recommendations: List[str]
    is_demo: bool = False

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
