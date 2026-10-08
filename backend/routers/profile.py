import os
import sys
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import UserProfile, User, AudioSession
from database.db import SessionLocal

router = APIRouter(prefix="/api/profile", tags=["User Profile & Progress"])

class ProfileUpdateRequest(BaseModel):
    skill_level: Optional[str] = None
    preferred_tonic: Optional[str] = None
    preferred_gharana: Optional[str] = None

@router.get("")
async def get_profile():
    db = SessionLocal()
    profile = db.query(UserProfile).filter_by(user_id=1).first()
    user = db.query(User).filter_by(id=1).first()
    db.close()

    if not profile:
        return {"name": "Om Mane", "skill_level": "Intermediate", "preferred_tonic": "A#"}

    return {
        "user_id": user.id,
        "name": user.name,
        "skill_level": profile.skill_level,
        "preferred_tonic": profile.preferred_tonic,
        "tonic_frequency_hz": profile.tonic_frequency_hz,
        "preferred_gharana": profile.preferred_gharana,
        "strong_swaras": profile.strong_swaras,
        "weak_swaras": profile.weak_swaras,
        "current_ragas": profile.current_ragas,
        "completed_ragas": profile.completed_ragas,
        "total_practice_minutes": profile.total_practice_minutes,
        "overall_accuracy_pct": profile.overall_accuracy_pct
    }

@router.patch("")
async def update_profile(req: ProfileUpdateRequest):
    db = SessionLocal()
    profile = db.query(UserProfile).filter_by(user_id=1).first()
    if profile:
        if req.skill_level:
            profile.skill_level = req.skill_level
        if req.preferred_tonic:
            profile.preferred_tonic = req.preferred_tonic
            # Update default hz mapping
            tonic_hz_map = {"C": 130.81, "C#": 138.59, "D": 146.83, "D#": 155.56, "E": 164.81, "F": 174.61, "F#": 185.00, "G": 196.00, "G#": 207.65, "A": 220.00, "A#": 233.08, "B": 246.94}
            profile.tonic_frequency_hz = tonic_hz_map.get(req.preferred_tonic, 233.08)
        if req.preferred_gharana:
            profile.preferred_gharana = req.preferred_gharana
        db.commit()
    db.close()
    return {"status": "success", "message": "Profile updated"}

@router.get("/progress")
async def get_user_progress():
    db = SessionLocal()
    sessions = db.query(AudioSession).order_by(AudioSession.created_at.asc()).all()
    profile = db.query(UserProfile).filter_by(user_id=1).first()
    db.close()

    accuracy_history = []
    for s in sessions:
        accuracy_history.append({
            "session_id": s.id,
            "raga": s.detected_raga,
            "accuracy_pct": s.pitch_accuracy_pct,
            "date": s.created_at.strftime("%b %d")
        })

    if not accuracy_history:
        # Default mock trend for UI display before first upload
        accuracy_history = [
            {"session_id": "s1", "raga": "Yaman", "accuracy_pct": 74.0, "date": "Aug 01"},
            {"session_id": "s2", "raga": "Yaman", "accuracy_pct": 78.5, "date": "Aug 05"},
            {"session_id": "s3", "raga": "Bhoopali", "accuracy_pct": 81.0, "date": "Aug 09"},
            {"session_id": "s4", "raga": "Yaman", "accuracy_pct": 84.2, "date": "Aug 13"}
        ]

    return {
        "overall_accuracy_pct": profile.overall_accuracy_pct if profile else 82.4,
        "total_practice_minutes": profile.total_practice_minutes if profile else 180,
        "strong_swaras": profile.strong_swaras if profile else ["Sa", "Pa"],
        "weak_swaras": profile.weak_swaras if profile else ["Shuddha Ga"],
        "accuracy_history": accuracy_history
    }
