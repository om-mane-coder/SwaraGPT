"""
SwaraGPT - Personalized Practice & Riyaz Recommendation Engine
Generates tailored daily practice schedules based on historical performance,
intonation error patterns, weak swaras, and student learning goals.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


def generate_personalized_plan(
    user_name: str = "Student",
    experience_level: str = "Intermediate",
    target_raga: str = "Yaman",
    weak_swaras: Optional[List[str]] = None,
    strong_swaras: Optional[List[str]] = None,
    daily_goal_minutes: int = 25,
    recent_average_score: float = 78.0,
) -> Dict[str, Any]:
    """
    Constructs a structured daily Riyaz plan based on weak swaras and recent performance.
    """
    weak_list = weak_swaras or ["Ga", "Tivra Ma"]
    primary_weak = weak_list[0] if weak_list else "Gandhar"

    # Time distribution proportional to daily goal
    t_warmup = max(3, int(daily_goal_minutes * 0.20))
    t_weakness = max(4, int(daily_goal_minutes * 0.25))
    t_pakad = max(5, int(daily_goal_minutes * 0.30))
    t_creative = max(3, daily_goal_minutes - (t_warmup + t_weakness + t_pakad))

    schedule = [
        {
            "step": 1,
            "title": "Adhara Sa Stability & Kharaj Sadhana",
            "duration_minutes": t_warmup,
            "focus": "Breathing & Diaphragm Support",
            "instructions": f"Sustain tonic Sa with steady Tanpura drone. Aim for zero pitch drift (stay within ±10 cents) for 6–8 seconds per breath.",
            "swaras": "Sa"
        },
        {
            "step": 2,
            "title": f"Targeted Intonation Drill: Correcting {primary_weak}",
            "duration_minutes": t_weakness,
            "focus": f"Centering {primary_weak} to eliminate detected drift",
            "instructions": f"Sing slow step-wise phrases passing through {primary_weak} (e.g. Sa-Re-{primary_weak}-{primary_weak}-Re-Sa). Confirm intonation on the live pitch indicator.",
            "swaras": f"Sa Re {primary_weak}"
        },
        {
            "step": 3,
            "title": f"Raga {target_raga} Characteristic Pakad Alignment",
            "duration_minutes": t_pakad,
            "focus": f"{target_raga} Signature Phrase & Microtonal Flow",
            "instructions": f"Practice {target_raga}'s signature pakad phrase at 60 BPM. Focus on smooth meends and clean note stops without sliding into unauthorized swaras.",
            "swaras": f"{target_raga} Pakad"
        },
        {
            "step": 4,
            "title": "Aakar Improvisation & Free Riyaz",
            "duration_minutes": t_creative,
            "focus": "Expressive Freedom & Confidence",
            "instructions": "Explore spontaneous phrases in your target raga using open vowel 'Aa'. Record the audio to analyze improvement.",
            "swaras": f"All {target_raga} Swaras"
        }
    ]

    guru_advice = (
        f"Namaste {user_name}! Your recent accuracy stands at {recent_average_score}%. "
        f"Our signal analysis detected that {primary_weak} requires stabilization. "
        f"Dedicate the next 3 days to step 2 before attempting fast taans."
    )

    return {
        "user_name": user_name,
        "target_raga": target_raga,
        "total_minutes": daily_goal_minutes,
        "guru_advice": guru_advice,
        "practice_steps": schedule,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
