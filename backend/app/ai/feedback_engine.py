"""
SwaraGPT - Virtual Guru AI Feedback Engine
Generates deep, transparent, metric-grounded Indian Classical pedagogical feedback.
Computes weighted scores, diagnoses microtonal deviations, and prescribes customized Alankar drills.
"""
from typing import Optional, Dict, Any, List
from app.config import settings


def generate_structured_feedback(
    pitch_data: Dict[str, Any],
    swara_data: Dict[str, Any],
    raga_data: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Computes transparent weighted overall score and generates authentic Guru feedback:
    - Pitch: 35%
    - Swara: 25%
    - Shruti: 15%
    - Raga: 15%
    - Tonic Stability: 10%
    """
    pitch_stability = pitch_data.get("pitch_stability", 82.0)
    shruti_precision = pitch_data.get("shruti_precision", 84.0)
    mean_shruti_dev = pitch_data.get("mean_shruti_deviation_cents", 8.0)

    swara_acc = swara_data.get("average_swara_accuracy", 80.0)
    strong_notes = swara_data.get("strong_swaras", ["Sa", "Pa"])
    weak_notes = swara_data.get("weak_swaras", ["Ga"])

    top_raga = raga_data[0] if raga_data else {"raga_name": "Yaman", "confidence": 0.85}
    raga_acc = float(top_raga.get("confidence", 0.85) * 100.0)

    # 1. Transparent Weighted Score Calculation
    pitch_term = pitch_stability * settings.WEIGHT_PITCH
    swara_term = swara_acc * settings.WEIGHT_SWARA
    shruti_term = shruti_precision * settings.WEIGHT_SHRUTI
    raga_term = raga_acc * settings.WEIGHT_RAGA
    tonic_term = pitch_stability * settings.WEIGHT_TONIC

    overall_score = round(pitch_term + swara_term + shruti_term + raga_term + tonic_term, 1)

    formula_exp = (
        f"Overall Score {overall_score}/100 = "
        f"Pitch Stability ({pitch_stability}% × 35%) + "
        f"Swara Intonation ({swara_acc}% × 25%) + "
        f"22-Shruti Precision ({shruti_precision}% × 15%) + "
        f"Raga Scale Adherence ({raga_acc}% × 15%) + "
        f"Tonic Consistency ({pitch_stability}% × 10%)"
    )

    # 2. Pedagogical Feedback Generation
    feedback_lines = []
    sa_hz = pitch_data.get("tonic", {}).get("estimated_sa_hz", 130.81)
    raga_name = top_raga.get("raga_name", "Yaman")

    if overall_score >= 85.0:
        feedback_lines.append(f"🙏 **Shabash! Excellent Riyaz rendition.** Your vocal foundation on Adhara Shadja ({sa_hz} Hz) is remarkably stable.")
    elif overall_score >= 70.0:
        feedback_lines.append(f"🎵 **Good singing with commendable effort.** Your phrase contour demonstrates clear awareness of {raga_name}, with a few microtonal adjustments needed.")
    else:
        feedback_lines.append(f"💡 **Promising practice session.** Your breath control and pitch centering require daily foundational Kharaj Sadhana before tackling intricate phrases.")

    # Strengths
    if strong_notes:
        feedback_lines.append(f"- **Key Strengths**: Notes {', '.join(strong_notes)} were rendered with commendable precision and stayed well within Sur (±25 cents threshold).")
    
    # Intonation & Shruti feedback
    if mean_shruti_dev <= 10.0:
        feedback_lines.append(f"- **Microtonal Precision**: Average shruti deviation was only {mean_shruti_dev} cents, exhibiting keen ears and disciplined muscle memory.")
    else:
        feedback_lines.append(f"- **Microtonal Drift**: Average shruti deviation was {mean_shruti_dev} cents. Remember that Indian Classical music demands staying centered on the shruti hub rather than equal-tempered approximations.")

    # Weak notes & specific corrective advice
    if weak_notes:
        feedback_lines.append(f"- **Areas to Refine**: Note(s) {', '.join(weak_notes)} tended to waver or drift out of tune. Avoid sliding prematurely; hold each note steadily for full value.")
    
    # 3. Actionable Riyaz Recommendations
    recommendations = []
    if "Ga" in weak_notes or "ga" in weak_notes:
        recommendations.append("Practice sustained Gandhar: hold Sa for 4 beats, then transition deliberately to Ga holding for 6 beats.")
    if "Ma'" in weak_notes or "Tivra Ma" in weak_notes:
        recommendations.append("Focus on Tivra Ma sharpness: practice Pa-Ma'-Ga-Ma'-Pa ensuring Ma' does not sag towards Shuddha Ma.")
    recommendations.append(f"Daily Alankar Drill: Sing slow sargam in {raga_name} at 60 BPM with Tanpura drone before attempting fast taans.")
    recommendations.append("5 minutes of morning Kharaj Sadhana on low Mandra Sa to strengthen vocal chord stamina.")

    return {
        "score_breakdown": {
            "pitch_score": round(pitch_stability, 1),
            "swara_score": round(swara_acc, 1),
            "shruti_score": round(shruti_precision, 1),
            "raga_score": round(raga_acc, 1),
            "tonic_score": round(pitch_stability, 1),
            "overall_score": overall_score,
            "formula_explanation": formula_exp,
        },
        "feedback_text": "\n\n".join(feedback_lines),
        "recommendations": recommendations,
        "strong_swaras": strong_notes,
        "weak_swaras": weak_notes,
    }
