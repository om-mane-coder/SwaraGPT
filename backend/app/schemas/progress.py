"""
SwaraGPT - Progress, Analytics, and Session History Schemas
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class DailyStat(BaseModel):
    date: str
    minutes: int
    score: float
    sessions_count: int


class ProgressSummaryResponse(BaseModel):
    user_name: str
    current_streak_days: int
    total_practice_minutes: int
    total_sessions_completed: int
    overall_improvement_pct: float
    average_pitch_accuracy: float
    average_swara_accuracy: float
    average_shruti_precision: float
    best_score: float
    weakest_swara: str
    strongest_swara: str
    target_raga: str
    recent_trend: List[DailyStat]


class SessionHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    raga_name: str
    duration_seconds: float
    overall_score: float
    pitch_accuracy: float
    swara_accuracy: float
    shruti_accuracy: float
    tonic_swara: str
    created_at: datetime
    feedback_summary: Optional[str] = None


class ComparisonResponse(BaseModel):
    session_before: SessionHistoryItem
    session_after: SessionHistoryItem
    score_delta: float
    pitch_accuracy_delta: float
    swara_accuracy_delta: float
    shruti_precision_delta: float
    summary: str
