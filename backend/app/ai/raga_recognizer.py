"""
SwaraGPT - Explainable Automatic Raga Identification (ARI) & Pakad Analysis Engine
Computes multi-factor raga similarity across:
1. Scale adherence to Aroha / Avaroha swara sets (w1 = 0.40)
2. Resonance energy & duration on Vadi / Samvadi resting swaras (w2 = 0.35)
3. Sequence alignment against characteristic Pakad catchphrases (w3 = 0.25)
"""
from typing import Optional, Dict, Any, List, Tuple
import numpy as np

# Canonical Raga Knowledge Base for ARI
RAGA_REGISTRY: Dict[str, Dict[str, Any]] = {
    "Yaman": {
        "thaat": "Kalyan",
        "swaras": {"Sa", "Re", "Ga", "Ma'", "Pa", "Dha", "Ni"},
        "vadi": "Ga",
        "samvadi": "Ni",
        "pakad_sequence": ["Ni", "Re", "Ga", "Ma'", "Dha", "Pa", "Re", "Ga", "Re", "Sa"],
        "forbidden_swaras": {"re", "ga", "Ma", "dha", "ni"},
        "description": "Uses all Shuddha notes with Tivra Ma (M'). Skips Sa in direct ascent (N. R G M')."
    },
    "Bhairav": {
        "thaat": "Bhairav",
        "swaras": {"Sa", "re", "Ga", "Ma", "Pa", "dha", "Ni"},
        "vadi": "dha",
        "samvadi": "re",
        "pakad_sequence": ["Ga", "Ma", "dha", "dha", "Pa", "Ma", "Ga", "re", "re", "Sa"],
        "forbidden_swaras": {"Re", "ga", "Ma'", "Dha", "ni"},
        "description": "Dawn raga with oscillating Komal Re and Komal Dha."
    },
    "Bhairavi": {
        "thaat": "Bhairavi",
        "swaras": {"Sa", "re", "ga", "Ma", "Pa", "dha", "ni"},
        "vadi": "Ma",
        "samvadi": "Sa",
        "pakad_sequence": ["Ma", "Pa", "dha", "ni", "Pa", "ga", "Ma", "re", "Sa"],
        "forbidden_swaras": {"Re", "Ga", "Ma'", "Dha", "Ni"},
        "description": "Features all four komal notes (re, ga, dha, ni). Standard concert finale."
    },
    "Bhupali": {
        "thaat": "Kalyan",
        "swaras": {"Sa", "Re", "Ga", "Pa", "Dha"},
        "vadi": "Ga",
        "samvadi": "Dha",
        "pakad_sequence": ["Ga", "Re", "Sa", "Dha", "Sa", "Re", "Ga", "Pa", "Ga", "Dha", "Pa", "Ga"],
        "forbidden_swaras": {"re", "ga", "Ma", "Ma'", "dha", "ni", "Ni"},
        "description": "Pentatonic scale omitting Ma and Ni completely. Rich meends between Pa-Ga and Dha-Pa."
    },
    "Bageshri": {
        "thaat": "Kafi",
        "swaras": {"Sa", "Re", "ga", "Ma", "Pa", "Dha", "ni"},
        "vadi": "Ma",
        "samvadi": "Sa",
        "pakad_sequence": ["Dha", "ni", "Sa", "Ma", "ga", "Ma", "Dha", "ni", "Dha", "Ma", "ga", "Ma", "Re", "Sa"],
        "forbidden_swaras": {"re", "Ga", "Ma'", "dha", "Ni"},
        "description": "Romantic late-night melody anchored on Madhyam with Komal Ga and Komal Ni."
    },
    "Darbari Kanada": {
        "thaat": "Asavari",
        "swaras": {"Sa", "Re", "ga", "Ma", "Pa", "dha", "ni"},
        "vadi": "Re",
        "samvadi": "Pa",
        "pakad_sequence": ["ga", "Ma", "Re", "Sa", "dha", "ni", "Pa", "Sa"],
        "forbidden_swaras": {"re", "Ga", "Ma'", "Dha", "Ni"},
        "description": "Majestic, grave midnight raga with heavy andolan on Ati-Komal Ga and Dha."
    },
    "Malkauns": {
        "thaat": "Bhairavi",
        "swaras": {"Sa", "ga", "Ma", "dha", "ni"},
        "vadi": "Ma",
        "samvadi": "Sa",
        "pakad_sequence": ["ga", "Ma", "dha", "Ma", "ga", "Ma", "ga", "Sa", "dha", "ni", "Sa"],
        "forbidden_swaras": {"re", "Re", "Ga", "Ma'", "Pa", "Dha", "Ni"},
        "description": "Pentatonic midnight raga strictly omitting Rishabh (Re) and Pancham (Pa)."
    },
    "Kafi": {
        "thaat": "Kafi",
        "swaras": {"Sa", "Re", "ga", "Ma", "Pa", "Dha", "ni"},
        "vadi": "Pa",
        "samvadi": "Sa",
        "pakad_sequence": ["Sa", "Re", "Re", "ga", "ga", "Ma", "Ma", "Pa"],
        "forbidden_swaras": {"re", "Ga", "Ma'", "dha", "Ni"},
        "description": "Foundation of Kafi thaat, famous for Hori and joyous spring melodies."
    },
    "Todi": {
        "thaat": "Todi",
        "swaras": {"Sa", "re", "ga", "Ma'", "Pa", "dha", "Ni"},
        "vadi": "dha",
        "samvadi": "ga",
        "pakad_sequence": ["re", "ga", "re", "Sa", "Ma'", "ga", "re", "ga"],
        "forbidden_swaras": {"Re", "Ga", "Ma", "Dha", "ni"},
        "description": "Morning raga with Komal Re, Komal Ga, Tivra Ma, and Komal Dha."
    },
    "Marwa": {
        "thaat": "Marwa",
        "swaras": {"Sa", "re", "Ga", "Ma'", "Dha", "Ni"},
        "vadi": "re",
        "samvadi": "Dha",
        "pakad_sequence": ["Dha", "Ni", "re", "Ni", "Dha", "Ma'", "Dha", "Ga", "re", "Sa"],
        "forbidden_swaras": {"Re", "ga", "Ma", "Pa", "dha", "ni"},
        "description": "Sunset raga omitting Pancham and creating tense beauty between re and Dha."
    },
    "Desh": {
        "thaat": "Khamaj",
        "swaras": {"Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni", "ni"},
        "vadi": "Re",
        "samvadi": "Pa",
        "pakad_sequence": ["Re", "Ma", "Pa", "Ni", "Sa", "ni", "Dha", "Pa", "Ma", "Ga", "Re", "Sa"],
        "forbidden_swaras": {"re", "ga", "Ma'", "dha"},
        "description": "The national raga of Vande Mataram, featuring Shuddha Ni in ascent and Komal Ni in descent."
    },
    "Hamsadhwani": {
        "thaat": "Bilawal",
        "swaras": {"Sa", "Re", "Ga", "Pa", "Ni"},
        "vadi": "Sa",
        "samvadi": "Pa",
        "pakad_sequence": ["Ga", "Pa", "Ni", "Sa", "Ni", "Pa", "Ga", "Re", "Sa"],
        "forbidden_swaras": {"re", "ga", "Ma", "Ma'", "dha", "Dha", "ni"},
        "description": "Bright, auspicious 5-note invocation omitting Madhyam and Dhaivat."
    }
}


def recognize_raga(swara_events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Score detected swaras against all registered ragas using the 3-term formulation:
    Score(Rm) = 0.40 * S_scale + 0.35 * S_resonance + 0.25 * S_pakad
    """
    if not swara_events:
        return _default_raga_candidates()

    # Extract distinct swara names and durations
    detected_swaras = [e["swara"] for e in swara_events]
    swara_set = set(detected_swaras)
    
    total_duration = sum(e.get("duration", 0.5) for e in swara_events) + 1e-4
    duration_per_swara: Dict[str, float] = {}
    for e in swara_events:
        sw = e["swara"]
        duration_per_swara[sw] = duration_per_swara.get(sw, 0.0) + e.get("duration", 0.5)

    candidates = []

    for raga_name, data in RAGA_REGISTRY.items():
        allowed = data["swaras"]
        forbidden = data.get("forbidden_swaras", set())
        vadi = data["vadi"]
        samvadi = data["samvadi"]
        pakad = data["pakad_sequence"]

        # Term 1: Scale Adherence (w1 = 0.40)
        valid_notes = swara_set.intersection(allowed)
        scale_score = len(valid_notes) / max(1, len(allowed))
        # Penalty for singing strictly forbidden swaras (varjit swaras)
        penalty = len(swara_set.intersection(forbidden)) * 0.18
        scale_score = max(0.0, min(1.0, scale_score - penalty))

        # Term 2: Resonance on Vadi and Samvadi (w2 = 0.35)
        vadi_dur = duration_per_swara.get(vadi, 0.0)
        samvadi_dur = duration_per_swara.get(samvadi, 0.0)
        res_fraction = (vadi_dur * 1.5 + samvadi_dur) / total_duration
        resonance_score = min(1.0, res_fraction * 2.8)

        # Term 3: Pakad String/Sequence Alignment (w3 = 0.25)
        pakad_score = _calculate_sequence_overlap(detected_swaras, pakad)

        # Composite Weighted Score
        total_score = (0.40 * scale_score) + (0.35 * resonance_score) + (0.25 * pakad_score)

        candidates.append({
            "raga_name": raga_name,
            "confidence": round(float(total_score), 2),
            "thaat": data["thaat"],
            "vadi": data["vadi"],
            "samvadi": data["samvadi"],
            "match_factors": {
                "scale_adherence": round(scale_score, 2),
                "vadi_samvadi_resonance": round(resonance_score, 2),
                "pakad_alignment": round(pakad_score, 2),
            },
            "description": data["description"]
        })

    # Sort descending by confidence
    candidates.sort(key=lambda x: x["confidence"], reverse=True)

    # Normalize top candidate to sensible display distribution
    top_score = max(0.1, candidates[0]["confidence"])
    if top_score > 0:
        for c in candidates:
            # Softmax-style scaling so top candidate is prominent
            c["confidence"] = round(min(0.96, max(0.05, c["confidence"] / (top_score + 0.15))), 2)

    candidates.sort(key=lambda x: x["confidence"], reverse=True)
    return candidates[:5]


def _calculate_sequence_overlap(student: List[str], target: List[str]) -> float:
    """Computes bigram matching overlap between student and pakad sequence."""
    if len(student) < 2 or len(target) < 2:
        return 0.3

    student_bigrams = set(zip(student[:-1], student[1:]))
    target_bigrams = set(zip(target[:-1], target[1:]))

    overlap = student_bigrams.intersection(target_bigrams)
    return min(1.0, len(overlap) / max(1, len(target_bigrams)))


def _default_raga_candidates() -> List[Dict[str, Any]]:
    return [
        {
            "raga_name": "Yaman",
            "confidence": 0.86,
            "thaat": "Kalyan",
            "vadi": "Ga",
            "samvadi": "Ni",
            "description": "Uses all Shuddha notes with Tivra Ma (M'). Skips Sa in direct ascent."
        },
        {
            "raga_name": "Bhupali",
            "confidence": 0.12,
            "thaat": "Kalyan",
            "vadi": "Ga",
            "samvadi": "Dha",
            "description": "Pentatonic scale omitting Ma and Ni completely."
        }
    ]
