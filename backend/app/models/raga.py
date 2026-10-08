"""
SwaraGPT - Raga Master, Taal, Exercises, and Musicology Models
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.connection import Base


class RagaMaster(Base):
    __tablename__ = "raga_master"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    aliases = Column(String(200), nullable=True)
    tradition = Column(String(50), default="Hindustani")
    thaat = Column(String(100), nullable=True) # Kalyan, Bhairav, Kafi, etc.
    mela = Column(String(100), nullable=True)  # Carnatic Melakarta parent
    aaroha = Column(String(255), nullable=False)
    avaroha = Column(String(255), nullable=False)
    vadi = Column(String(50), nullable=False)
    samvadi = Column(String(50), nullable=False)
    pakad = Column(String(500), nullable=False)
    chalan = Column(Text, nullable=True)
    jati = Column(String(100), default="Sampurna-Sampurna")
    time_period = Column(String(100), default="Evening")
    season = Column(String(100), default="All Seasons")
    rasa = Column(String(200), default="Shanta (Peaceful)")
    swara_set = Column(JSON, default=list)
    important_swaras = Column(JSON, default=list)
    avoided_swaras = Column(JSON, default=list)
    famous_compositions = Column(JSON, default=list)
    description = Column(Text, nullable=False)
    practice_guidance = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    exercises = relationship("PracticeExercise", back_populates="raga")


class TaalMaster(Base):
    __tablename__ = "taal_master"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    matras = Column(Integer, nullable=False)
    vibhags = Column(String(50), nullable=False) # e.g. "4+4+4+4"
    theka = Column(Text, nullable=False)
    sam_matra = Column(Integer, default=1)
    khali_matra = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)


class PracticeExercise(Base):
    __tablename__ = "practice_exercises"

    id = Column(Integer, primary_key=True, autoincrement=True)
    raga_id = Column(Integer, ForeignKey("raga_master.id"), nullable=True)
    title = Column(String(150), nullable=False)
    category = Column(String(80), default="Alankar") # Alankar, Sa stability, Pakad, Long notes, Aakar, Saptak
    difficulty = Column(String(50), default="Beginner") # Beginner, Intermediate, Advanced
    duration_minutes = Column(Integer, default=5)
    target_notes = Column(String(255), nullable=False) # e.g. "Sa Re Ga Ma Pa"
    instructions = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    raga = relationship("RagaMaster", back_populates="exercises")


class ConceptMaster(Base):
    __tablename__ = "concepts_master"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(120), unique=True, nullable=False)
    category = Column(String(80), default="Theory") # Theory, Ornamentation, Rhythmic, Aesthetics
    definition = Column(Text, nullable=False)
    examples = Column(Text, nullable=True)
    importance_for_learners = Column(Text, nullable=True)
