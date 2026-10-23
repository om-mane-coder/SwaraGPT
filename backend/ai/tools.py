import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import UserProfile, Raga, Song
from database.db import SessionLocal
from ai.rag import retrieve_knowledge

def tool_get_user_profile(user_id=1):
    default_profile = {
        "skill_level": "Intermediate",
        "preferred_tonic": "A#",
        "tonic_frequency_hz": 233.08,
        "preferred_gharana": "Hindustani Classical (Gwalior / Kirana)",
        "strong_swaras": ["Sa", "Pa", "Shuddha Re"],
        "weak_swaras": ["Shuddha Ga", "Komal Ni"],
        "current_ragas": ["Yaman", "Bhairavi"],
        "overall_accuracy_pct": 82.4
    }
    db = SessionLocal()
    try:
        profile = db.query(UserProfile).filter_by(user_id=user_id).first()
        if not profile:
            return default_profile
        return {
            "skill_level": getattr(profile, "skill_level", "Intermediate") or "Intermediate",
            "preferred_tonic": getattr(profile, "preferred_tonic", "A#") or "A#",
            "tonic_frequency_hz": getattr(profile, 'tonic_frequency_hz', 233.08) or 233.08,
            "preferred_gharana": getattr(profile, 'preferred_gharana', 'Hindustani Classical') or "Hindustani Classical",
            "strong_swaras": getattr(profile, "strong_swaras", None) or ["Sa", "Pa"],
            "weak_swaras": getattr(profile, "weak_swaras", None) or ["Shuddha Ga"],
            "current_ragas": getattr(profile, "current_ragas", None) or ["Yaman"],
            "overall_accuracy_pct": getattr(profile, "overall_accuracy_pct", 80.0) or 80.0
        }
    except Exception as e:
        print(f"[Profile Warning] Falling back to default profile: {e}")
        return default_profile
    finally:
        db.close()

def tool_search_raga_database(raga_name):
    knowledge = retrieve_knowledge(raga_name, raga_context=raga_name)
    return knowledge["ragas"]

def tool_search_song_database(query):
    knowledge = retrieve_knowledge(query)
    return knowledge["songs"]

def tool_generate_practice_exercise(raga_name, weak_swara):
    db = SessionLocal()
    raga = db.query(Raga).filter(Raga.name.ilike(f"%{raga_name}%")).first()
    db.close()

    pakad = raga.pakad if raga else "N. R G, M' P, D N S'"
    
    return {
        "title": f"{raga_name} Targeted Riyaaz: {weak_swara} Stabilization",
        "raga": raga_name,
        "target_swara": weak_swara,
        "recommended_tempo_bpm": 70,
        "steps": [
            f"Establish your Sa tonic clearly for 30 seconds.",
            f"Practice slow movement focusing on {weak_swara}: Re → {weak_swara} → Re → Sa.",
            f"Hold {weak_swara} steadily for 3 seconds without vocal wobble.",
            f"Integrate into the characteristic phrase: {pakad}."
        ]
    }
