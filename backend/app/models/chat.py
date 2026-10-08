"""
SwaraGPT - Conversational AI & Virtual Guru Dialogue Models
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.connection import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(100), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), default="Virtual Guru Riyaz Guidance")
    mode = Column(String(50), default="Guru Mode") # Guru Mode, Practice Mode, Performance Review
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(100), primary_key=True)
    conversation_id = Column(String(100), ForeignKey("conversations.id"), nullable=False)
    sender = Column(String(20), nullable=False) # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    message_type = Column(String(50), default="text") # 'text', 'card', 'audio', 'performance_feedback'
    media_url = Column(String(300), nullable=True)
    metadata_json = Column(JSON, nullable=True) # citations, referenced raga, performance metrics
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    conversation = relationship("Conversation", back_populates="messages")
