import os
import sys
import uuid
import datetime
import traceback

from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import Conversation, Message, AudioSession, AudioAnalysis, UserProfile
from database.db import SessionLocal
from audio.pipeline import AudioIntelligencePipeline
from audio.converter import convert_webm_to_wav
from ai.orchestrator import SwaraGPTOrchestrator

router = APIRouter(prefix="/api/chat", tags=["Chat & Multimodal Dialogue"])
orchestrator = SwaraGPTOrchestrator()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


class TextMessageRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    mode: Optional[str] = "Guru Mode"


@router.post("")
async def send_text_message(req: TextMessageRequest):
    db = SessionLocal()
    try:
        conv_id = req.conversation_id or f"conv_{uuid.uuid4().hex[:10]}"
        conv = db.query(Conversation).filter_by(id=conv_id).first()
        if not conv:
            conv = Conversation(id=conv_id, user_id=1, title=(req.message[:40] if req.message else "New Chat"), mode=req.mode or "Guru Mode")
            db.add(conv)
            db.flush()

        user_msg_id = f"msg_{uuid.uuid4().hex[:10]}"
        user_msg = Message(
            id=user_msg_id,
            conversation_id=conv_id,
            sender="user",
            content=req.message,
            message_type="text"
        )
        db.add(user_msg)
        db.flush()

        # Get conversation history
        history_msgs = db.query(Message).filter_by(conversation_id=conv_id).all()
        history = [{"sender": m.sender, "content": m.content} for m in history_msgs]

        # Generate AI response
        response_text = orchestrator.generate_response(
            user_message=req.message,
            audio_analysis=None,
            conversation_history=history,
            mode=req.mode or "Guru Mode"
        )

        asst_msg_id = f"msg_{uuid.uuid4().hex[:10]}"
        asst_msg = Message(
            id=asst_msg_id,
            conversation_id=conv_id,
            sender="assistant",
            content=response_text,
            message_type="text"
        )
        db.add(asst_msg)
        db.commit()

        now_iso = datetime.datetime.utcnow().isoformat()
        return {
            "conversation_id": conv_id,
            "user_message": {
                "id": user_msg_id,
                "sender": "user",
                "content": req.message,
                "created_at": now_iso
            },
            "assistant_message": {
                "id": asst_msg_id,
                "sender": "assistant",
                "content": response_text,
                "message_type": "text",
                "created_at": now_iso
            }
        }
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        # Return a graceful fallback response
        return {
            "conversation_id": req.conversation_id or "conv_fallback",
            "user_message": {
                "id": f"msg_{uuid.uuid4().hex[:6]}",
                "sender": "user",
                "content": req.message,
                "created_at": datetime.datetime.utcnow().isoformat()
            },
            "assistant_message": {
                "id": f"msg_{uuid.uuid4().hex[:6]}",
                "sender": "assistant",
                "content": orchestrator.generate_response(user_message=req.message, audio_analysis=None, conversation_history=None, mode=req.mode or "Guru Mode"),
                "message_type": "text",
                "created_at": datetime.datetime.utcnow().isoformat()
            }
        }
    finally:
        db.close()


@router.post("/audio")
async def upload_and_analyze_audio(
    file: UploadFile = File(...),
    conversation_id: Optional[str] = Form(None),
    user_message: Optional[str] = Form(""),
    tonic_override: Optional[str] = Form(None),
    mode: Optional[str] = Form("Guru Mode")
):
    db = SessionLocal()
    try:
        profile = db.query(UserProfile).filter_by(user_id=1).first()
        preferred_tonic = profile.preferred_tonic if profile else "A#"

        # Save uploaded file
        file_ext = os.path.splitext(file.filename or "recording.wav")[1] or ".wav"
        file_id = f"audio_{uuid.uuid4().hex[:10]}"
        raw_path = os.path.join(UPLOAD_DIR, f"{file_id}_raw{file_ext}")
        wav_path = os.path.join(UPLOAD_DIR, f"{file_id}.wav")

        content = await file.read()
        with open(raw_path, "wb") as f:
            f.write(content)

        # Convert to WAV (handles webm from browser MediaRecorder)
        wav_path = convert_webm_to_wav(raw_path, wav_path)

        # Run audio pipeline
        pipeline = AudioIntelligencePipeline(user_preferred_tonic=preferred_tonic)
        analysis_result = pipeline.process(wav_path, user_tonic_override=tonic_override)

        # Create conversation
        conv_id = conversation_id or f"conv_{uuid.uuid4().hex[:10]}"
        conv = db.query(Conversation).filter_by(id=conv_id).first()
        if not conv:
            conv = Conversation(id=conv_id, user_id=1, title=f"Vocal Practice ({file.filename or 'Recording'})", mode=mode or "Guru Mode")
            db.add(conv)
            db.flush()

        media_url = f"/static/uploads/{os.path.basename(wav_path)}"
        u_text = user_message if user_message else f"Uploaded vocal recording: {file.filename}"

        user_msg_id = f"msg_{uuid.uuid4().hex[:10]}"
        user_msg = Message(
            id=user_msg_id,
            conversation_id=conv_id,
            sender="user",
            content=u_text,
            message_type="audio",
            media_url=media_url
        )
        db.add(user_msg)
        db.flush()

        # Save audio session
        audio_sess = AudioSession(
            id=file_id,
            user_id=1,
            file_name=file.filename or "recording.wav",
            file_path=wav_path,
            duration_seconds=analysis_result["duration_seconds"],
            detected_tonic=analysis_result["tonic"]["tonic_note"],
            detected_tonic_hz=analysis_result["tonic"]["frequency_hz"],
            detected_raga=analysis_result["raga_predictions"][0]["raga"] if analysis_result["raga_predictions"] else "Yaman",
            raga_confidence=analysis_result["raga_predictions"][0]["confidence"] if analysis_result["raga_predictions"] else 0.78,
            pitch_accuracy_pct=analysis_result["swaras"]["overall_accuracy_pct"]
        )
        db.add(audio_sess)
        db.flush()

        db_analysis = AudioAnalysis(
            session_id=audio_sess.id,
            tonic_data=analysis_result["tonic"],
            pitch_contour=analysis_result["pitch_points"],
            swara_sequence=analysis_result["swaras"]["events"],
            raga_predictions=analysis_result["raga_predictions"],
            rhythm_data=analysis_result["rhythm"],
            singing_metrics={
                "overall_accuracy_pct": analysis_result["swaras"]["overall_accuracy_pct"],
                "swara_distribution": analysis_result["swaras"]["swara_distribution"]
            },
            timestamped_feedback=analysis_result["timestamped_issues"],
            raw_summary=analysis_result["summary_text"]
        )
        db.add(db_analysis)
        db.flush()

        # Generate AI teacher response
        response_text = orchestrator.generate_response(
            user_message=u_text,
            audio_analysis=analysis_result,
            conversation_history=None,
            mode=mode or "Guru Mode"
        )

        asst_msg_id = f"msg_{uuid.uuid4().hex[:10]}"
        asst_msg = Message(
            id=asst_msg_id,
            conversation_id=conv_id,
            sender="assistant",
            content=response_text,
            message_type="analysis",
            media_url=media_url,
            analysis_json=analysis_result
        )
        db.add(asst_msg)

        # Update user practice stats
        if profile:
            profile.total_practice_minutes += max(1, int(analysis_result["duration_seconds"] // 60))

        db.commit()

        now_iso = datetime.datetime.utcnow().isoformat()
        return {
            "conversation_id": conv_id,
            "user_message": {
                "id": user_msg_id,
                "sender": "user",
                "content": u_text,
                "media_url": media_url,
                "created_at": now_iso
            },
            "assistant_message": {
                "id": asst_msg_id,
                "sender": "assistant",
                "content": response_text,
                "message_type": "analysis",
                "media_url": media_url,
                "analysis_json": analysis_result,
                "created_at": now_iso
            }
        }
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        # Return graceful error with whatever analysis we managed
        return {
            "conversation_id": conversation_id or "conv_error",
            "user_message": {
                "id": f"msg_{uuid.uuid4().hex[:6]}",
                "sender": "user",
                "content": user_message or "Audio upload",
                "media_url": "",
                "created_at": datetime.datetime.utcnow().isoformat()
            },
            "assistant_message": {
                "id": f"msg_{uuid.uuid4().hex[:6]}",
                "sender": "assistant",
                "content": f"I received your audio but encountered a processing issue: {str(e)}. Please try uploading a .wav or .mp3 file for best results. You can also ask me questions about ragas and music theory!",
                "message_type": "text",
                "media_url": "",
                "analysis_json": None,
                "created_at": datetime.datetime.utcnow().isoformat()
            }
        }
    finally:
        db.close()
