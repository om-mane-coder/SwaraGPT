"""
SwaraGPT - User & Profile Models
"""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from app.database.connection import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ENTHUSIAST = "enthusiast"


class ExperienceLevel(str, enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"


class Tradition(str, enum.Enum):
    HINDUSTANI = "Hindustani"
    CARNATIC = "Carnatic"
    BOTH = "Both"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="student")
    age = Column(Integer, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    sessions = relationship("PracticeSession", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    experience_level = Column(String(50), default="Intermediate")
    tradition = Column(String(50), default="Hindustani")
    preferred_tonic = Column(String(20), default="C3")
    preferred_tonic_hz = Column(Float, default=130.81)
    daily_goal_minutes = Column(Integer, default=20)
    target_ragas = Column(JSON, default=lambda: ["Yaman", "Bhairav", "Bhoopali"])
    strong_swaras = Column(JSON, default=lambda: ["Sa", "Pa", "Shuddha Re"])
    weak_swaras = Column(JSON, default=lambda: ["Shuddha Ga", "Komal Ni", "Tivra Ma"])
    current_streak_days = Column(Integer, default=1)
    total_practice_minutes = Column(Integer, default=0)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="profile")
