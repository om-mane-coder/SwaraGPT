import os
import sys

# Ensure backend root is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import Raga, Song, Taal, Concept
from database.db import SessionLocal

def retrieve_knowledge(query_text, raga_context=None):
    """
    RAG Retrieval Engine querying Ragas, Songs, Taals, and Concepts from SQLite.
    Returns structured knowledge context for LLM prompt augmentation.
    """
    db = SessionLocal()
    results = {
        "ragas": [],
        "songs": [],
        "taals": [],
        "concepts": []
    }
    
    query_lower = (query_text or "").lower()
    
    # 1. Retrieve Raga context
    all_ragas = db.query(Raga).all()
    if raga_context:
        raga_matches = [r for r in all_ragas if raga_context.lower() in r.name.lower()]
    else:
        raga_matches = [
            r for r in all_ragas 
            if r.name.lower() in query_lower or any(word in query_lower for word in r.name.lower().split() if len(word) > 2)
        ]
        
    for r in (raga_matches or all_ragas[:2]):
        results["ragas"].append({
            "name": r.name or "Yaman",
            "thaat": r.thaat or "Kalyan",
            "jati": r.jati or "Audav-Sampurna",
            "aroh": r.aroh or "",
            "avroh": r.avroh or "",
            "pakad": r.pakad or "",
            "vadi": r.vadi or "Ga",
            "samvadi": r.samvadi or "Ni",
            "time_period": r.time_period or "Evening",
            "rasa": r.rasa or "Shanta",
            "famous_songs": r.famous_songs or [],
            "famous_compositions": r.famous_compositions or [],
            "description": r.description or ""
        })

    # 2. Retrieve Song context
    all_songs = db.query(Song).all()
    song_matches = [
        s for s in all_songs 
        if s.primary_raga.lower() in query_lower or s.title.lower() in query_lower or any(w in query_lower for w in s.artist.lower().split() if len(w) > 3)
    ]
    if not song_matches:
        song_matches = all_songs[:4]

    for s in song_matches[:5]:
        results["songs"].append({
            "title": s.title,
            "artist": s.artist,
            "film_or_album": s.film_or_album,
            "primary_raga": s.primary_raga,
            "genre": s.genre,
            "taal": s.taal,
            "classical_notes": s.classical_notes,
            "difficulty": s.difficulty_level
        })

    # 3. Retrieve Taal context
    all_taals = db.query(Taal).all()
    taal_matches = [
        t for t in all_taals 
        if t.name.lower() in query_lower
    ]
    if not taal_matches and ("taal" in query_lower or "rhythm" in query_lower or "beat" in query_lower):
        taal_matches = all_taals

    for t in taal_matches:
        results["taals"].append({
            "name": t.name,
            "matras": t.matras,
            "vibhags": t.vibhags,
            "theka": t.theka,
            "sam_matra": t.sam_matra,
            "khali_matra": t.khali_matra,
            "description": t.description
        })

    # 4. Retrieve Concept context
    all_concepts = db.query(Concept).all()
    concept_matches = [
        c for c in all_concepts 
        if c.title.lower() in query_lower or any(w in query_lower for w in c.title.lower().split() if len(w) > 3)
    ]
    for c in concept_matches:
        results["concepts"].append({
            "title": c.title,
            "category": c.category,
            "definition": c.definition,
            "importance": c.importance_for_learners
        })

    db.close()
    return results
