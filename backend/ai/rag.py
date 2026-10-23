import os
import sys

# Ensure backend root is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import Raga, Song, Taal, Concept
from database.db import SessionLocal

def retrieve_knowledge(query_text, raga_context=None):
    """
    RAG Retrieval Engine querying Ragas, Songs, Taals, and Concepts from SQLite.
    Returns targeted, pruned knowledge context to maximize LLM efficiency and minimize token bloat.
    """
    db = SessionLocal()
    try:
        results = {
            "ragas": [],
            "songs": [],
            "taals": [],
            "concepts": []
        }
        
        query_lower = (query_text or "").lower()
        
        # 1. Retrieve Raga context (only if explicitly matched or requested)
        all_ragas = db.query(Raga).all()
        if raga_context:
            raga_matches = [r for r in all_ragas if raga_context.lower() in r.name.lower()]
        else:
            raga_matches = [
                r for r in all_ragas 
                if r.name.lower() in query_lower or any(word in query_lower for word in r.name.lower().split() if len(word) > 3)
            ]
            
        if raga_matches:
            for r in raga_matches[:2]:
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
                    "famous_compositions": r.famous_compositions or [],
                    "description": r.description or ""
                })

        # 2. Retrieve Song context (only if user asks about songs/compositions/examples)
        is_song_query = any(w in query_lower for w in ["song", "bandish", "composition", "sing", "movie", "film", "track", "example"])
        if is_song_query or (raga_matches and ("song" in query_lower or "example" in query_lower)):
            all_songs = db.query(Song).all()
            song_matches = [
                s for s in all_songs 
                if (s.primary_raga and s.primary_raga.lower() in query_lower) or 
                   (s.title and s.title.lower() in query_lower) or 
                   (s.artist and any(w in query_lower for w in s.artist.lower().split() if len(w) > 3))
            ]
            if not song_matches and raga_matches:
                target_raga_name = raga_matches[0].name.lower()
                song_matches = [s for s in all_songs if s.primary_raga and target_raga_name in s.primary_raga.lower()]

            for s in song_matches[:3]:
                results["songs"].append({
                    "title": s.title,
                    "artist": s.artist,
                    "film_or_album": s.film_or_album,
                    "primary_raga": s.primary_raga,
                    "genre": s.genre,
                    "taal": s.taal,
                    "classical_notes": s.classical_notes
                })

        # 3. Retrieve Taal context (only if rhythm/taal terms are present)
        is_taal_query = any(w in query_lower for w in ["taal", "rhythm", "beat", "matra", "theka", "teentaal", "dadra", "keharwa", "rupak", "jhaptal"])
        if is_taal_query:
            all_taals = db.query(Taal).all()
            taal_matches = [t for t in all_taals if t.name.lower() in query_lower]
            if not taal_matches:
                taal_matches = all_taals[:2]

            for t in taal_matches[:2]:
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
        for c in concept_matches[:2]:
            results["concepts"].append({
                "title": c.title,
                "category": c.category,
                "definition": c.definition,
                "importance": c.importance_for_learners
            })

        return results if any(results.values()) else {}
    except Exception as e:
        print(f"[RAG Retrieval Warning] {e}")
        return {}
    finally:
        db.close()
