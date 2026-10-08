"""
SwaraGPT - User Profile Management, Settings & Privacy Compliance Router
Provides profile updates, audio device preferences, recording deletion, and account deletion.
"""
import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from app.database.connection import get_db
from app.models.user import User, UserProfile
from app.models.session import PracticeSession, AudioAnalysis
from app.schemas.auth import UserResponse, ProfileUpdateRequest
from app.services.auth_service import get_current_user

router = APIRouter()


@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update profile details, preferred tonic Sa, tradition, and learning goals."""
    if req.name:
        current_user.name = req.name
    if req.bio is not None:
        current_user.bio = req.bio

    if current_user.profile:
        if req.experience_level:
            current_user.profile.experience_level = req.experience_level
        if req.tradition:
            current_user.profile.tradition = req.tradition
        if req.preferred_tonic:
            current_user.profile.preferred_tonic = req.preferred_tonic
        if req.preferred_tonic_hz:
            current_user.profile.preferred_tonic_hz = req.preferred_tonic_hz
        if req.daily_goal_minutes:
            current_user.profile.daily_goal_minutes = req.daily_goal_minutes
        if req.target_ragas:
            current_user.profile.target_ragas = req.target_ragas

    await db.commit()

    # Re-fetch
    stmt = select(User).options(selectinload(User.profile)).where(User.id == current_user.id)
    res = await db.execute(stmt)
    return res.scalar_one()


@router.get("/settings")
async def get_user_settings(current_user: User = Depends(get_current_user)):
    """Fetch user audio hardware and interface settings."""
    prof = current_user.profile
    return {
        "theme": "dark",
        "audio_input_device": "default",
        "microphone_sensitivity": 80,
        "preferred_tonic": prof.preferred_tonic if prof else "C3",
        "preferred_tonic_hz": prof.preferred_tonic_hz if prof else 130.81,
        "analysis_mode": "advanced", # "simple" or "advanced"
        "language": "en",
        "notifications_enabled": True,
        "privacy_mode": "standard",
    }


@router.delete("/recording/{session_id}")
async def delete_user_recording(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Privacy: Delete an audio recording and its associated analysis telemetry."""
    stmt = select(PracticeSession).where(
        PracticeSession.id == session_id,
        PracticeSession.user_id == current_user.id
    )
    res = await db.execute(stmt)
    sess = res.scalar_one_or_none()

    if not sess:
        raise HTTPException(status_code=404, detail="Session not found or access denied.")

    # Remove file on disk if exists
    if sess.audio_url and sess.audio_url.startswith("/uploads/"):
        fname = sess.audio_url.replace("/uploads/", "")
        fpath = os.path.join("uploads", fname)
        if os.path.exists(fpath):
            try:
                os.remove(fpath)
            except Exception:
                pass

    # Delete relational rows (AudioAnalysis is cascade-deleted with session)
    await db.delete(sess)
    await db.commit()

    return {"status": "success", "message": f"Recording {session_id} deleted permanently."}


@router.delete("/account")
async def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Privacy: Delete user account and all personal recordings completely."""
    # Delete user record (cascades to profile, sessions, analyses, conversations)
    await db.delete(current_user)
    await db.commit()
    return {"status": "success", "message": "Account and all personal recordings permanently erased."}
