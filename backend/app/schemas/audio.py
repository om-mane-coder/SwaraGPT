"""
SwaraGPT - Audio & MIR Data Schemas
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class PitchPoint(BaseModel):
    time: float
    pitch: float
    confidence: Optional[float] = 1.0
    swara: Optional[str] = "Sa"
    shruti: Optional[str] = "Tivra"
    delta_cents: Optional[float] = 0.0
    is_in_tune: Optional[bool] = True


class SwaraEvent(BaseModel):
    swara: str
    swara_type: Optional[str] = None
    shruti_name: str
    octave: str
    start_time: float
    end_time: float
    duration: float
    mean_pitch: float
    accuracy: float
    delta_cents: float
    stability: float
    intonation_status: str # "In Tune (Sur)" | "Mild Deviation" | "Besur"


class OrnamentSegment(BaseModel):
    type: str # 'Meend' | 'Gamak' | 'Andolan' | 'Murki' | 'Khatka' | 'Kan-swar'
    start_time: float
    end_time: float
    duration: float
    start_freq: float
    end_freq: float
    slope_cents_per_sec: float
    description: str


class TonicEstimate(BaseModel):
    estimated_sa_hz: float
    confidence: float
    nearest_western_note: str
    source: str # "auto_histogram" | "user_specified"


class RagaCandidate(BaseModel):
    raga_name: str
    confidence: float
    thaat: Optional[str] = None
    vadi: Optional[str] = None
    samvadi: Optional[str] = None
    match_factors: Optional[Dict[str, float]] = None
    description: Optional[str] = None
