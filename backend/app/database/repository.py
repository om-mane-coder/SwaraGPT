"""
SwaraGPT - Telemetry & Analysis Repository Abstraction
Seamlessly bridges between MongoDB (when available) and PostgreSQL/SQLite JSON
so development works out-of-the-box with zero database friction.
"""
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_mongodb
from app.models.session import AudioAnalysis, PracticeSession
from app.models.chat import Message, Conversation


class AnalysisRepository:
    """Manages high-volume pitch contours, ornament trajectories, and analysis records."""

    @staticmethod
    async def save_analysis(
        session_id: str,
        user_id: int,
        pitch_contour: List[Dict[str, Any]],
        swara_sequence: List[Dict[str, Any]],
        shruti_deviations: List[float],
        ornament_segments: List[Dict[str, Any]],
        raga_predictions: List[Dict[str, Any]],
        raw_summary: Optional[str] = None,
        db_session: Optional[AsyncSession] = None,
    ) -> Dict[str, Any]:
        mongo = get_mongodb()
        doc = {
            "session_id": session_id,
            "user_id": user_id,
            "pitch_contour": pitch_contour,
            "swara_sequence": swara_sequence,
            "shruti_deviations": shruti_deviations,
            "ornament_segments": ornament_segments,
            "raga_predictions": raga_predictions,
            "raw_summary": raw_summary,
            "created_at": datetime.now(timezone.utc),
        }

        # 1. If MongoDB is online, store in MongoDB collection
        if mongo is not None:
            try:
                await mongo.analysis_results.update_one(
                    {"session_id": session_id},
                    {"$set": doc},
                    upsert=True
                )
            except Exception as err:
                print(f"MongoDB write note: {err}")

        # 2. Always persist into relational AudioAnalysis table for transactional safety
        if db_session is not None:
            try:
                stmt = select(AudioAnalysis).where(AudioAnalysis.session_id == session_id)
                res = await db_session.execute(stmt)
                existing = res.scalar_one_or_none()
                if existing:
                    existing.pitch_contour = pitch_contour
                    existing.swara_sequence = swara_sequence
                    existing.shruti_deviations = shruti_deviations
                    existing.ornament_segments = ornament_segments
                    existing.raga_predictions = raga_predictions
                    existing.raw_summary = raw_summary
                else:
                    new_analysis = AudioAnalysis(
                        session_id=session_id,
                        user_id=user_id,
                        pitch_contour=pitch_contour,
                        swara_sequence=swara_sequence,
                        shruti_deviations=shruti_deviations,
                        ornament_segments=ornament_segments,
                        raga_predictions=raga_predictions,
                        raw_summary=raw_summary,
                    )
                    db_session.add(new_analysis)
                await db_session.commit()
            except Exception as err:
                print(f"Relational analysis write note: {err}")

        return doc

    @staticmethod
    async def get_analysis(
        session_id: str,
        db_session: Optional[AsyncSession] = None
    ) -> Optional[Dict[str, Any]]:
        # Check MongoDB first
        mongo = get_mongodb()
        if mongo is not None:
            try:
                record = await mongo.analysis_results.find_one({"session_id": session_id}, {"_id": 0})
                if record:
                    return record
            except Exception:
                pass

        # Fallback to relational DB
        if db_session is not None:
            stmt = select(AudioAnalysis).where(AudioAnalysis.session_id == session_id)
            res = await db_session.execute(stmt)
            row = res.scalar_one_or_none()
            if row:
                return {
                    "session_id": row.session_id,
                    "user_id": row.user_id,
                    "pitch_contour": row.pitch_contour,
                    "swara_sequence": row.swara_sequence,
                    "shruti_deviations": row.shruti_deviations,
                    "ornament_segments": row.ornament_segments,
                    "raga_predictions": row.raga_predictions,
                    "raw_summary": row.raw_summary,
                    "created_at": row.created_at,
                }
        return None
