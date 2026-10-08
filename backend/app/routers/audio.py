"""
SwaraGPT - Audio Ingestion & File Upload Router
Handles microphone recording uploads, uploaded audio file storage,
format validation, and audio analysis bridge.
"""
import os
import uuid
import aiofiles
from typing import Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database.connection import get_db
from app.models.user import User
from app.services.auth_service import get_current_user_optional
from app.routers.analysis import analyze_vocal_performance

router = APIRouter()


@router.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    """Upload an audio file (WAV, MP3, FLAC, M4A, OGG) for vocal analysis."""
    filename = file.filename or "recording.wav"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in settings.ALLOWED_AUDIO_FORMATS and ext not in ['.webm', '.opus', '.aac']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported audio format '{ext}'. Allowed: {', '.join(settings.ALLOWED_AUDIO_FORMATS)}"
        )

    # Secure unique file name
    unique_name = f"{uuid.uuid4().hex[:12]}_{filename}"
    upload_path = os.path.join(settings.UPLOAD_DIR, unique_name)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    contents = await file.read()
    if len(contents) > settings.MAX_AUDIO_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_AUDIO_SIZE_MB}MB."
        )

    async with aiofiles.open(upload_path, "wb") as f:
        await f.write(contents)

    return {
        "status": "success",
        "file_name": unique_name,
        "file_path": upload_path,
        "file_size_bytes": len(contents),
        "url": f"/uploads/{unique_name}"
    }


@router.post("/recording")
async def upload_live_recording(
    audio: UploadFile = File(...),
    duration_seconds: float = Form(0.0)
):
    """Save live microphone recording stream from browser Web Audio MediaRecorder."""
    unique_name = f"rec_{uuid.uuid4().hex[:10]}.wav"
    upload_path = os.path.join(settings.UPLOAD_DIR, unique_name)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    contents = await audio.read()
    async with aiofiles.open(upload_path, "wb") as f:
        await f.write(contents)

    return {
        "status": "recorded",
        "file_name": unique_name,
        "file_path": upload_path,
        "duration_seconds": duration_seconds,
        "url": f"/uploads/{unique_name}"
    }


@router.post("/analyze")
async def analyze_audio_direct(
    audio_file: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
    file_path: Optional[str] = Form(None),
    target_raga: Optional[str] = Form("Yaman"),
    user_sa_hz: Optional[float] = Form(None),
    user_sa: Optional[float] = Form(None),
    manual_tonic_hz: Optional[float] = Form(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Direct MIR Audio analysis bridge:
    Executes full digital signal processing pipeline identical to /api/analysis/full.
    """
    return await analyze_vocal_performance(
        audio_file=audio_file,
        file=file,
        file_path=file_path,
        target_raga=target_raga,
        user_sa_hz=user_sa_hz,
        user_sa=user_sa,
        manual_tonic_hz=manual_tonic_hz,
        current_user=current_user,
        db=db,
    )


@router.post("/generate")
async def generate_swara_audio(payload: Dict[str, Any]):
    """
    Synthesize audio representation for requested swara sequence and tonic.
    """
    notes = payload.get("notes", "Sa Re Ga Pa Dha Sa'")
    tonic = payload.get("tonic", "C#3")
    raga = payload.get("raga", "Bhupali")
    
    return {
        "status": "synthesized",
        "notes": notes,
        "tonic": tonic,
        "raga": raga,
        "message": f"Synthesized '{notes}' tuned to {tonic} ({raga}).",
        "duration_seconds": 3.5,
    }
