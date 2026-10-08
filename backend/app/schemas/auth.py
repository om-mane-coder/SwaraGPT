from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    age: Optional[int] = None
    experience_level: Optional[str] = "Intermediate" # Beginner, Intermediate, Advanced
    tradition: Optional[str] = "Hindustani"          # Hindustani, Carnatic, Both
    preferred_tonic: Optional[str] = "C3"           # C3, C#3, D3, etc.
    preferred_tonic_hz: Optional[float] = 130.81
    target_raga: Optional[str] = "Yaman"


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    experience_level: str
    tradition: str
    preferred_tonic: str
    preferred_tonic_hz: float
    daily_goal_minutes: int
    target_ragas: List[str]
    strong_swaras: List[str]
    weak_swaras: List[str]
    current_streak_days: int
    total_practice_minutes: int


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: str
    bio: Optional[str] = None
    created_at: Optional[datetime] = None
    profile: Optional[UserProfileResponse] = None


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    experience_level: Optional[str] = None
    tradition: Optional[str] = None
    preferred_tonic: Optional[str] = None
    preferred_tonic_hz: Optional[float] = None
    daily_goal_minutes: Optional[int] = None
    target_ragas: Optional[List[str]] = None
