"""
SwaraGPT - Practice Session & Audio Analysis Storage Models
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.connection import Base


class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id = Column(String(100), primary_key=True) # UUID or friendly id
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    raga_id = Column(Integer, ForeignKey("raga_master.id"), nullable=True)
    raga_name = Column(String(100), default="Free Practice")
    exercise_id = Column(Integer, ForeignKey("practice_exercises.id"), nullable=True)
    audio_url = Column(String(300), nullable=True)
    duration_seconds = Column(Float, default=0.0)
    
    # Performance metrics (Percentages: 0 - 100)
    overall_score = Column(Float, default=0.0)
    pitch_accuracy = Column(Float, default=0.0)
    swara_accuracy = Column(Float, default=0.0)
    shruti_accuracy = Column(Float, default=0.0)
    raga_accuracy = Column(Float, default=0.0)
    tonic_stability = Column(Float, default=0.0)
    
    # Tonic information
    tonic_used_hz = Column(Float, default=130.81)
    tonic_swara = Column(String(20), default="C3")
    
    # Pedagogical feedback
    feedback_summary = Column(Text, nullable=True)
    feedback_json = Column(JSON, nullable=True)
    recommendations_json = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="sessions")
    analysis = relationship("AudioAnalysis", back_populates="session", uselist=False, cascade="all, delete-orphan")


class AudioAnalysis(Base):
    __tablename__ = "audio_analyses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(100), ForeignKey("practice_sessions.id"), unique=True, nullable=False)
    user_id = Column(Integer, nullable=False)
    
    # Detailed MIR time-series and structural items
    pitch_contour = Column(JSON)          # [{time, pitch, swara, shruti, delta_cents, is_in_tune}]
    swara_sequence = Column(JSON)         # [{swara, shruti, start_time, end_time, duration, accuracy}]
    shruti_deviations = Column(JSON)      # Distribution of cent offsets
    ornament_segments = Column(JSON)      # [{type: 'meend'|'gamak'|'andolan'|'murki', start, end, slope}]
    raga_predictions = Column(JSON)       # [{raga_name, confidence, thaat, vadi, samvadi}]
    raw_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    session = relationship("PracticeSession", back_populates="analysis")
