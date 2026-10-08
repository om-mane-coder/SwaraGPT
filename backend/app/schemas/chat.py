"""
SwaraGPT - Conversational AI & RAG Chat Schemas
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class PerformanceContext(BaseModel):
    session_id: Optional[str] = None
    overall_score: Optional[float] = None
    detected_raga: Optional[str] = None
    target_raga: Optional[str] = None
    tonic_used_hz: Optional[float] = None
    weak_swaras: Optional[List[str]] = None
    strong_swaras: Optional[List[str]] = None
    shruti_deviation_cents: Optional[float] = None


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: Optional[str] = None
    performance_context: Optional[PerformanceContext] = None
    voice_input: Optional[bool] = False


class Citation(BaseModel):
    title: str
    source: str
    author: Optional[str] = None
    tradition: Optional[str] = None
    topic: Optional[str] = None
    relevance_score: Optional[float] = None


class ChatMessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str = "assistant"
    content: str
    response: Optional[str] = None
    message: Optional[str] = None
    citations: List[Citation] = Field(default_factory=list)
    suggested_drills: List[str] = Field(default_factory=list)
    created_at: datetime


class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
