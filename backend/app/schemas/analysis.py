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
