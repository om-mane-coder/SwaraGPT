import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import UserProfile, Raga, Song
from database.db import SessionLocal
from ai.rag import retrieve_knowledge

def tool_get_user_profile(user_id=1):
    db = SessionLocal()
    profile = db.query(UserProfile).filter_by(user_id=user_id).first()
    db.close()
    if not profile:
        return {
            "skill_level": "Intermediate",
            "preferred_tonic": "A#",
            "tonic_frequency_hz": 233.08,
            "preferred_gharana": "Hindustani Classical (Gwalior / Kirana)",
            "strong_swaras": ["Sa", "Pa", "Shuddha Re"],
            "weak_swaras": ["Shuddha Ga", "Komal Ni"],
            "current_ragas": ["Yaman", "Bhairavi"],
            "overall_accuracy_pct": 82.4
        }
    return {
        "skill_level": profile.skill_level or "Intermediate",
        "preferred_tonic": profile.preferred_tonic or "A#",
        "tonic_frequency_hz": getattr(profile, 'tonic_frequency_hz', 233.08) or 233.08,
        "preferred_gharana": getattr(profile, 'preferred_gharana', 'Hindustani Classical') or "Hindustani Classical",
        "strong_swaras": profile.strong_swaras or ["Sa", "Pa"],
        "weak_swaras": profile.weak_swaras or ["Shuddha Ga"],
        "current_ragas": profile.current_ragas or ["Yaman"],
        "overall_accuracy_pct": profile.overall_accuracy_pct or 80.0
    }

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
