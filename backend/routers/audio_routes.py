import os
import sys
import uuid
from fastapi import APIRouter, UploadFile, File, Form
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import AudioSession
from database.db import SessionLocal
from audio.pipeline import AudioIntelligencePipeline
from audio.converter import convert_webm_to_wav

router = APIRouter(prefix="/api/audio", tags=["Audio Intelligence"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/analyze")
async def analyze_audio_file(
    file: UploadFile = File(...),
    tonic_override: str = Form(None)
):
    file_ext = os.path.splitext(file.filename or "file.wav")[1] or ".wav"
    file_id = f"audio_{uuid.uuid4().hex[:10]}"
    raw_path = os.path.join(UPLOAD_DIR, f"{file_id}_raw{file_ext}")
    wav_path = os.path.join(UPLOAD_DIR, f"{file_id}.wav")

    content = await file.read()
    with open(raw_path, "wb") as f:
        f.write(content)

    wav_path = convert_webm_to_wav(raw_path, wav_path)

    pipeline = AudioIntelligencePipeline()
    result = pipeline.process(wav_path, user_tonic_override=tonic_override)
    return result

@router.get("/sessions")
async def list_practice_sessions():
    db = SessionLocal()
    try:
        sessions = db.query(AudioSession).order_by(AudioSession.created_at.desc()).limit(15).all()
        result = [
            {
                "id": s.id,
                "file_name": s.file_name,
                "duration_seconds": s.duration_seconds,
                "detected_tonic": s.detected_tonic,
                "detected_raga": s.detected_raga,
                "raga_confidence": s.raga_confidence,
                "pitch_accuracy_pct": s.pitch_accuracy_pct,
                "created_at": s.created_at.isoformat() if s.created_at else ""
            } for s in sessions
        ]
        return result
    finally:
        db.close()
