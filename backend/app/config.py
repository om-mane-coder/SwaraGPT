"""
SwaraGPT - Configuration and Settings
Manages environment variables, database URLs, AI provider preferences,
and Indian Classical Music analysis tolerances.
"""
import os
from typing import Optional, List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application Info
    APP_NAME: str = "SwaraGPT"
    APP_SUBTITLE: str = "AI-Powered Virtual Guru for Indian Classical Music Education"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Server & Networking
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3000"

    # JWT Authentication
    SECRET_KEY: str = "swaragpt-classical-guru-secret-key-super-secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Relational Database (PostgreSQL with zero-friction SQLite fallback)
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "swaragpt"
    SQLITE_DB_PATH: str = "./swaragpt.db"

    @property
    def DATABASE_URL(self) -> str:
        # Check explicit env override first
        env_url = os.environ.get("DATABASE_URL")
        if env_url:
            return env_url
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # MongoDB (for raw pitch contours and telemetry, with fallback to relational JSON)
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "swaragpt"

    # AI Provider Selection: 'openai' | 'gemini' | 'offline'
    AI_PROVIDER: str = "gemini"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Vector RAG (ChromaDB)
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    CHROMA_COLLECTION: str = "swaragpt_musicology"

    # Storage & Uploads
    UPLOAD_DIR: str = "uploads"
    MAX_AUDIO_SIZE_MB: int = 50
    ALLOWED_AUDIO_FORMATS: List[str] = [".wav", ".mp3", ".m4a", ".ogg", ".flac"]

    # Musicology Tolerances & Configurable Scoring Weights
    # Section 62: Transparent weighted scoring (Pitch: 35%, Swara: 25%, Shruti: 15%, Raga: 15%, Tonic: 10%)
    WEIGHT_PITCH: float = 0.35
    WEIGHT_SWARA: float = 0.25
    WEIGHT_SHRUTI: float = 0.15
    WEIGHT_RAGA: float = 0.15
    WEIGHT_TONIC: float = 0.10

    # Section 16 & 53: Configurable intonation thresholds in cents
    TOLERANCE_SUR_CENTS: float = 25.0       # <= 25 cents: In tune (Sur)
    TOLERANCE_MILD_CENTS: float = 50.0      # 25-50 cents: Mild deviation
                                            # > 50 cents: Besur (significant deviation)

    # Audio Signal Analysis parameters
    ANALYSIS_SAMPLE_RATE: int = 22050       # Recommended MIR sample rate
    HIGH_PASS_CUTOFF_HZ: float = 80.0       # Microphone rumble filter
    DEFAULT_TONIC_HZ: float = 130.81        # C3 default reference Sa

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }


settings = Settings()
