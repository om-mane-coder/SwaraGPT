from sqlalchemy import create_engine, Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
import datetime
import os

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, default='student')
    name = Column(String(100), default='Vocal Student')
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    conversations = relationship("Conversation", back_populates="user")
    sessions = relationship("AudioSession", back_populates="user")

class UserProfile(Base):
    __tablename__ = 'user_profiles'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    skill_level = Column(String(50), default='Intermediate') # Beginner, Intermediate, Advanced
    preferred_tonic = Column(String(10), default='A#') # Default Sa
    tonic_frequency_hz = Column(Float, default=233.08)
    preferred_gharana = Column(String(100), default='Hindustani Classical')
    preferred_language = Column(String(50), default='Hindi/English')
    strong_swaras = Column(JSON, default=['Sa', 'Pa', 'Shuddha Re'])
    weak_swaras = Column(JSON, default=['Shuddha Ga', 'Komal Ni', 'Tivra Ma'])
    current_ragas = Column(JSON, default=['Yaman', 'Bhairavi', 'Bhoopali'])
    completed_ragas = Column(JSON, default=['Kafi'])
    total_practice_minutes = Column(Integer, default=145)
    overall_accuracy_pct = Column(Float, default=81.5)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="profile")

class Conversation(Base):
    __tablename__ = 'conversations'
    
    id = Column(String(100), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    title = Column(String(200), default='Riyaaz Session & AI Guru Dialogue')
    mode = Column(String(50), default='Guru Mode') # Guru Mode, Practice Mode, Analysis Mode, Song Mode
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = 'messages'
    
    id = Column(String(100), primary_key=True)
    conversation_id = Column(String(100), ForeignKey('conversations.id'))
    sender = Column(String(20), nullable=False) # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    message_type = Column(String(50), default='text') # 'text', 'audio', 'analysis', 'practice_card', 'raga_card', 'song_card'
    media_url = Column(String(300), nullable=True)
    analysis_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    conversation = relationship("Conversation", back_populates="messages")

class AudioSession(Base):
    __tablename__ = 'audio_sessions'
    
    id = Column(String(100), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    file_name = Column(String(200))
    file_path = Column(String(300))
    duration_seconds = Column(Float, default=0.0)
    detected_tonic = Column(String(10))
    detected_tonic_hz = Column(Float)
    detected_raga = Column(String(100))
    raga_confidence = Column(Float)
    pitch_accuracy_pct = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="sessions")
    analysis = relationship("AudioAnalysis", back_populates="session", uselist=False, cascade="all, delete-orphan")

class AudioAnalysis(Base):
    __tablename__ = 'audio_analyses'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(100), ForeignKey('audio_sessions.id'))
    tonic_data = Column(JSON)
    pitch_contour = Column(JSON) # time vs F0 hz/cents
    swara_sequence = Column(JSON) # swara events with time range, swara name, deviation
    raga_predictions = Column(JSON) # ranked ragas
    rhythm_data = Column(JSON) # bpm, taal candidates
    singing_metrics = Column(JSON) # accuracy, stability, repeated errors
    timestamped_feedback = Column(JSON) # timestamped issue list
    raw_summary = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    session = relationship("AudioSession", back_populates="analysis")

class Raga(Base):
    __tablename__ = 'ragas'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    aliases = Column(String(200))
    thaat = Column(String(100))
    aroh = Column(String(200))
    avroh = Column(String(200))
    pakad = Column(String(300))
    chalan = Column(Text)
    vadi = Column(String(50))
    samvadi = Column(String(50))
    jati = Column(String(100))
    time_period = Column(String(100))
    season = Column(String(100))
    rasa = Column(String(100))
    swara_set = Column(JSON) # list of swaras present
    important_swaras = Column(JSON)
    avoided_swaras = Column(JSON)
    similar_ragas = Column(JSON)
    famous_compositions = Column(JSON)
    famous_songs = Column(JSON)
    description = Column(Text)

class Song(Base):
    __tablename__ = 'songs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    artist = Column(String(100))
    composer = Column(String(100))
    film_or_album = Column(String(200))
    genre = Column(String(100)) # Classical Bandish, Bhajan, Ghazal, Semi-Classical, Film Song
    language = Column(String(50))
    primary_raga = Column(String(100))
    taal = Column(String(100))
    tempo_bpm = Column(Integer)
    classical_notes = Column(Text)
    youtube_or_audio_url = Column(String(300))
    difficulty_level = Column(String(50))

class Taal(Base):
    __tablename__ = 'taals'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    matras = Column(Integer)
    vibhags = Column(String(100)) # e.g. '4+4+4+4'
    theka = Column(Text) # bol sequence
    sam_matra = Column(Integer, default=1)
    khali_matra = Column(String(50))
    description = Column(Text)

class Concept(Base):
    __tablename__ = 'concepts'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), unique=True, nullable=False)
    category = Column(String(100)) # Foundations, Ornamentation, Structure, Performance
    definition = Column(Text)
    examples = Column(Text)
    importance_for_learners = Column(Text)
