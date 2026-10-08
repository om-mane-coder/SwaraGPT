"""
SwaraGPT - Audio Ingestion & File Upload Router
Handles microphone recording uploads, uploaded audio file storage, and format validation.
"""
import os
import uuid
import aiofiles
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.config import settings

router = APIRouter()


@router.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    """Upload an audio file (WAV, MP3, FLAC, M4A, OGG) for vocal analysis."""
    filename = file.filename or "recording.wav"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in settings.ALLOWED_AUDIO_FORMATS:
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
