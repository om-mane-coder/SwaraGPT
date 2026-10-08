import os
import sys
from fastapi import APIRouter, HTTPException
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import Raga, Song, Taal, Concept
from database.db import SessionLocal

router = APIRouter(prefix="/api", tags=["Music Knowledge System"])

@router.get("/ragas")
async def get_all_ragas():
    db = SessionLocal()
    ragas = db.query(Raga).all()
    db.close()
    return ragas

@router.get("/ragas/{raga_id}")
async def get_raga_by_id(raga_id: int):
    db = SessionLocal()
    raga = db.query(Raga).filter_by(id=raga_id).first()
    db.close()
    if not raga:
        raise HTTPException(status_code=404, detail="Raga not found")
    return raga

@router.get("/songs")
async def get_all_songs():
    db = SessionLocal()
    songs = db.query(Song).all()
    db.close()
    return songs

@router.get("/songs/{song_id}")
async def get_song_by_id(song_id: int):
    db = SessionLocal()
    song = db.query(Song).filter_by(id=song_id).first()
    db.close()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song

@router.get("/taals")
async def get_all_taals():
    db = SessionLocal()
    taals = db.query(Taal).all()
    db.close()
    return taals

@router.get("/concepts")
async def get_all_concepts():
    db = SessionLocal()
    concepts = db.query(Concept).all()
    db.close()
    return concepts
