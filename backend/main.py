import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.seed_data import seed_database
from routers import chat, audio_routes, knowledge, profile, practice

app = FastAPI(
    title="SwaraGPT API",
    description="Backend API & Audio Intelligence Engine for SwaraGPT AI Virtual Guru",
    version="1.0.0"
)

# Enable CORS for frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads static directory exists and is mounted
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(chat.router)
app.include_router(audio_routes.router)
app.include_router(knowledge.router)
app.include_router(profile.router)
app.include_router(practice.router)

@app.on_event("startup")
def on_startup():
    print("[SwaraGPT] Initializing database and verifying seed data...")
    seed_database()

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "product": "SwaraGPT AI Guru",
        "version": "1.0.0",
        "audio_intelligence": "Librosa / SciPy Pitch Pipeline active",
        "mode": "Conversational Audio Teacher"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
