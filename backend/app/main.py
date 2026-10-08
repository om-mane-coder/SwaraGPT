"""
SwaraGPT - FastAPI Application Entry Point
AI-Powered Virtual Guru for Personalized Indian Classical Music Education
"""
import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Force UTF-8 encoding on standard streams
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Ensure app is discoverable on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import settings
from app.database.connection import init_db, create_all_tables, init_mongodb, async_session
from app.database.seed import seed_database
from app.routers import auth, audio, analysis, chat, ragas, progress, practice, users
from app.ai.shrutis import find_nearest_shruti


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown orchestration."""
    print(f"🎵 {settings.APP_NAME} v{settings.APP_VERSION} is starting up...")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs("data/knowledge", exist_ok=True)

    # Database Initialization & Fallback handling
    await init_db()
    await create_all_tables()
    await init_mongodb()

    # Seed master data (Ragas, Taals, Exercises, Demo User)
    from app.database.connection import get_session_factory
    factory = get_session_factory()
    async with factory() as session:
        await seed_database(session)

    print("✔ SwaraGPT Core Engine is active and ready to serve.")
    yield
    print("🎵 SwaraGPT is shutting down gracefully.")


app = FastAPI(
    title=settings.APP_NAME,
    summary=settings.APP_SUBTITLE,
    version=settings.APP_VERSION,
    description="Full-stack AI Virtual Guru integrating Music Information Retrieval (pYIN), 22-Shrutis, and Grounded RAG.",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", settings.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Modular Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(audio.router, prefix="/api/audio", tags=["Audio Ingestion"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["MIR Performance Analysis"])
app.include_router(chat.router, prefix="/api/chat", tags=["Virtual Guru Chat"])
app.include_router(ragas.router, prefix="/api/ragas", tags=["Raga Explorer"])
app.include_router(progress.router, prefix="/api/progress", tags=["Progress & Analytics"])
app.include_router(practice.router, prefix="/api/practice", tags=["Practice & Riyaz"])
app.include_router(users.router, prefix="/api/users", tags=["User Profile & Settings"])


# Section 38: Live WebSocket Pitch Streaming
@app.websocket("/ws/pitch")
async def websocket_pitch_endpoint(websocket: WebSocket):
    """
    Live WebSocket stream for real-time practice intonation:
    Receives current frequency (Hz) or audio parameters, calculates relative cents
    against user tonic, and returns real-time swara, shruti, and Sur/Besur intonation.
    """
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            freq = float(data.get("frequency", 0.0))
            tonic_hz = float(data.get("tonic_hz", 130.81))
            t = float(data.get("timestamp", 0.0))

            if freq > 55.0 and tonic_hz > 0:
                import numpy as np
                cents = 1200.0 * np.log2(freq / tonic_hz)
                shruti_res = find_nearest_shruti(cents)

                await websocket.send_json({
                    "frequency": round(freq, 1),
                    "tonic_hz": round(tonic_hz, 1),
                    "cents": round(cents, 1),
                    "swara": shruti_res["swara"],
                    "swara_type": shruti_res["swara_type"],
                    "shruti": shruti_res["shruti_name"],
                    "delta_cents": shruti_res["delta_cents"],
                    "is_in_tune": shruti_res["is_in_tune"],
                    "intonation_status": shruti_res["intonation_status"],
                    "timestamp": round(t, 2),
                })
            else:
                await websocket.send_json({
                    "frequency": 0.0,
                    "cents": 0.0,
                    "swara": "-",
                    "shruti": "-",
                    "delta_cents": 0.0,
                    "is_in_tune": False,
                    "intonation_status": "Silent / Unvoiced",
                    "timestamp": round(t, 2),
                })
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket pitch error: {e}")


@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
async def health_check():
    """Observability & Health Check."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "subtitle": settings.APP_SUBTITLE,
        "version": settings.APP_VERSION,
        "ai_provider": settings.AI_PROVIDER,
        "audio_pipeline": "Librosa / pYIN 22.05 kHz Active",
        "tolerance_cents": {
            "sur": settings.TOLERANCE_SUR_CENTS,
            "mild": settings.TOLERANCE_MILD_CENTS
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
