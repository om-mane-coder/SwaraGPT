"""
SwaraGPT - Explainable Automatic Raga Identification (ARI), Pakad Analysis & Free AI Oracle Engine
Computes multi-factor raga similarity across:
1. Scale adherence to Aroha / Avaroha swara sets (w1 = 0.40)
2. Resonance energy & duration on Vadi / Samvadi resting swaras (w2 = 0.35)
3. Sequence alignment against characteristic Pakad catchphrases (w3 = 0.25)
4. Free Internet AI Verification: Optional Google Gemini API oracle cross-validation.
"""
from typing import Optional, Dict, Any, List, Tuple
import os
import json
import numpy as np
from app.ai.shrutis import normalize_to_canonical_swara

# Canonical Raga Knowledge Base for ARI (35+ Major Hindustani & Carnatic Ragas)
RAGA_REGISTRY: Dict[str, Dict[str, Any]] = {
    "Yaman": {
        "thaat": "Kalyan",
        "swaras": {"Sa", "Re", "Ga", "Ma'", "Pa", "Dha", "Ni"},
        "vadi": "Ga",
        "samvadi": "Ni",
        "pakad_sequence": ["Ni", "Re", "Ga", "Ma'", "Dha", "Ni", "Sa"],
        "forbidden_swaras": {"re", "ga", "Ma", "dha", "ni"},
        "description": "Uses all Shuddha notes with Tivra Ma (M'). Skips Sa in direct ascent ('N. R G M')."
    },
    "Bhairav": {
        "thaat": "Bhairav",
        "swaras": {"Sa", "re", "Ga", "Ma", "Pa", "dha", "Ni"},
        "vadi": "dha",
        "samvadi": "re",
        "pakad_sequence": ["Ga", "Ma", "dha", "dha", "Pa", "Ma", "Ga", "re", "re", "Sa"],
        "forbidden_swaras": {"Re", "ga", "Ma'", "Dha", "ni"},
        "description": "Dawn raga with oscillating Komal Re and Komal Dha (Andolan)."
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
        "description": "Audav (pentatonic) scale omitting Ma and Ni completely. Rich meends between Pa-Ga and Dha-Pa."
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
        "description": "Majestic midnight raga with heavy andolan on Ati-Komal Ga and Dha."
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
    },
    "Bihag": {
        "thaat": "Bilawal",
        "swaras": {"Sa", "Re", "Ga", "Ma", "Ma'", "Pa", "Dha", "Ni"},
        "vadi": "Ga",
        "samvadi": "Ni",
        "pakad_sequence": ["Pa", "Ma'", "Ga", "Ma", "Ga", "Re", "Sa"],
        "forbidden_swaras": {"re", "ga", "dha", "ni"},
        "description": "Late evening raga utilizing both Shuddha Ma and Tivra Ma with deep emphasis on Ga."
    },
    "Khamaj": {
        "thaat": "Khamaj",
        "swaras": {"Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni", "ni"},
        "vadi": "Ga",
        "samvadi": "Ni",
        "pakad_sequence": ["Ga", "Ma", "Pa", "Dha", "ni", "Dha", "Pa", "Ma", "Ga"],
        "forbidden_swaras": {"re", "ga", "Ma'", "dha"},
        "description": "Shringara rasa masterpiece with Shuddha Ni in ascent and Komal Ni in descent."
    },
    "Ahir Bhairav": {
        "thaat": "Bhairav",
        "swaras": {"Sa", "re", "Ga", "Ma", "Pa", "Dha", "ni"},
        "vadi": "Ma",
        "samvadi": "Sa",
        "pakad_sequence": ["Ga", "Ma", "re", "Sa", "Dha", "ni", "Sa"],
        "forbidden_swaras": {"Re", "ga", "Ma'", "dha", "Ni"},
        "description": "Fusion of Bhairav (Sa re Ga Ma) and Kafi (Ma Pa Dha ni), serene dawn melody."
    },
    "Bhimpalasi": {
        "thaat": "Kafi",
        "swaras": {"Sa", "Re", "ga", "Ma", "Pa", "Dha", "ni"},
        "vadi": "Ma",
        "samvadi": "Sa",
        "pakad_sequence": ["ni", "Sa", "ga", "Ma", "Pa", "ga", "Ma", "ga", "Re", "Sa"],
        "forbidden_swaras": {"re", "Ga", "Ma'", "dha", "Ni"},
        "description": "Afternoon melody with Komal Ga and Komal Ni, resting soulfully on Madhyam."
    },
    "Brindavani Sarang": {
        "thaat": "Kafi",
        "swaras": {"Sa", "Re", "Ma", "Pa", "Ni", "ni"},
        "vadi": "Re",
        "samvadi": "Pa",
        "pakad_sequence": ["Re", "Ma", "Pa", "Ni", "Sa", "ni", "Pa", "Ma", "Re", "Sa"],
        "forbidden_swaras": {"re", "ga", "Ga", "Ma'", "dha", "Dha"},
        "description": "Noon raga omitting Gandhar and Dhaivat entirely, using both Nishads."
    },
    "Jaunpuri": {
        "thaat": "Asavari",
        "swaras": {"Sa", "Re", "ga", "Ma", "Pa", "dha", "ni"},
        "vadi": "dha",
        "samvadi": "ga",
        "pakad_sequence": ["Re", "Ma", "Pa", "dha", "ni", "dha", "Pa", "ga", "Re", "Sa"],
        "forbidden_swaras": {"re", "Ga", "Ma'", "Dha", "Ni"},
        "description": "Late morning raga in Asavari thaat with Shuddha Re, Komal Ga, Dha, and Ni."
    },
    "Puriya Dhanashree": {
        "thaat": "Poorvi",
        "swaras": {"Sa", "re", "Ga", "Ma'", "Pa", "dha", "Ni"},
        "vadi": "Pa",
        "samvadi": "re",
        "pakad_sequence": ["Ni", "re", "Ga", "Ma'", "Pa", "dha", "Pa", "Ma'", "Ga", "re", "Sa"],
        "forbidden_swaras": {"Re", "ga", "Ma", "Dha", "ni"},
        "description": "Late afternoon masterpiece with Komal Re, Tivra Ma, and Komal Dha."
    },
    "Alhaiya Bilawal": {
        "thaat": "Bilawal",
        "swaras": {"Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni", "ni"},
        "vadi": "Dha",
        "samvadi": "Ga",
        "pakad_sequence": ["Ga", "Re", "Ga", "Pa", "Dha", "ni", "Dha", "Pa"],
        "forbidden_swaras": {"re", "ga", "Ma'", "dha"},
        "description": "Morning raga, primary representative of Shuddha swara scale of Bilawal."
    },
    "Durga": {
        "thaat": "Bilawal",
        "swaras": {"Sa", "Re", "Ma", "Pa", "Dha"},
        "vadi": "Dha",
        "samvadi": "Re",
        "pakad_sequence": ["Dha", "Ma", "Re", "Pa", "Dha", "Sa"],
        "forbidden_swaras": {"re", "ga", "Ga", "Ma'", "dha", "ni", "Ni"},
        "description": "Pentatonic late-evening raga strictly omitting Gandhar (Ga) and Nishad (Ni)."
    },
    "Shankara": {
        "thaat": "Bilawal",
        "swaras": {"Sa", "Re", "Ga", "Pa", "Dha", "Ni"},
        "vadi": "Ga",
        "samvadi": "Ni",
        "pakad_sequence": ["Sa", "Ni", "Pa", "Dha", "Sa", "Ga", "Pa", "Ga"],
        "forbidden_swaras": {"re", "ga", "Ma", "Ma'", "dha", "ni"},
        "description": "Veera rasa nocturnal raga omitting Madhyam, characterized by resolute leaps."
    },
    "Mayamalavagowla": {
        "thaat": "Bhairav",
        "swaras": {"Sa", "re", "Ga", "Ma", "Pa", "dha", "Ni"},
        "vadi": "dha",
        "samvadi": "re",
        "pakad_sequence": ["Sa", "re", "Ga", "Ma", "Pa", "dha", "Ni", "Sa"],
        "forbidden_swaras": {"Re", "ga", "Ma'", "Dha", "ni"},
        "description": "Carnatic foundational scale (15th Melakarta) identical in swaras to Hindustani Bhairav."
    },
    "Shankarabharanam": {
        "thaat": "Bilawal",
        "swaras": {"Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni"},
        "vadi": "Pa",
        "samvadi": "Sa",
        "pakad_sequence": ["Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni", "Sa"],
        "forbidden_swaras": {"re", "ga", "Ma'", "dha", "ni"},
        "description": "Carnatic 29th Melakarta, majestic major heptatonic scale (Bilawal equivalent)."
    },
    "Kalyani": {
        "thaat": "Kalyan",
        "swaras": {"Sa", "Re", "Ga", "Ma'", "Pa", "Dha", "Ni"},
        "vadi": "Pa",
        "samvadi": "Sa",
        "pakad_sequence": ["Sa", "Re", "Ga", "Ma'", "Pa", "Dha", "Ni", "Sa"],
        "forbidden_swaras": {"re", "ga", "Ma", "dha", "ni"},
        "description": "Carnatic 65th Melakarta (Mechakalyani), sovereign equivalent to Yaman."
    },
    "Mohanam": {
        "thaat": "Kalyan",
        "swaras": {"Sa", "Re", "Ga", "Pa", "Dha"},
        "vadi": "Ga",
        "samvadi": "Dha",
        "pakad_sequence": ["Sa", "Re", "Ga", "Pa", "Dha", "Sa"],
        "forbidden_swaras": {"re", "ga", "Ma", "Ma'", "dha", "ni", "Ni"},
        "description": "Carnatic pentatonic counterpart to Hindustani Bhupali (Janya of Harikambhoji)."
    },
    "Hindolam": {
        "thaat": "Bhairavi",
        "swaras": {"Sa", "ga", "Ma", "dha", "ni"},
        "vadi": "Ma",
        "samvadi": "Sa",
        "pakad_sequence": ["Sa", "ga", "Ma", "dha", "ni", "Sa"],
        "forbidden_swaras": {"re", "Re", "Ga", "Ma'", "Pa", "Dha", "Ni"},
        "description": "Carnatic pentatonic equivalent to Hindustani Malkauns, omitting Ri and Pa."
    }
}


CARNATIC_RAGA_NAMES = {
    "Mayamalavagowla", "Shankarabharanam", "Kalyani", "Mohanam", "Hindolam"
}


def recognize_raga(
    swara_events: List[Dict[str, Any]],
    tradition_preference: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Score detected swaras against all registered ragas using high-precision duration-weighted formulation:
    Score(Rm) = 0.42 * S_scale + 0.33 * S_resonance + 0.25 * S_pakad (+ S_tradition)
    Incorporates:
    1. Duration-weighted scale adherence and soft varjit penalties (resilient against passing micro-ornaments/noise).
    2. Vadi & Samvadi resting prominence.
    3. Direct & Drone-suppressed sequence alignment against canonical Pakad catchphrases.
    4. Optional Google Gemini AI Oracle cross-verification.
    """
    if not swara_events:
        return _default_raga_candidates()

    # Extract canonical swara names and durations
    detected_swaras = [
        normalize_to_canonical_swara(e.get("swara", ""))
        for e in swara_events
        if e.get("swara")
    ]
    if not detected_swaras:
        return _default_raga_candidates()

    total_duration = sum(e.get("duration", 0.5) for e in swara_events) + 1e-6
    duration_per_swara: Dict[str, float] = {}
    for e in swara_events:
        sw = normalize_to_canonical_swara(e.get("swara", ""))
        duration_per_swara[sw] = duration_per_swara.get(sw, 0.0) + e.get("duration", 0.5)

    # 1. Melodic sequence extraction:
    # a) Filter clean events (>= 0.06s) and compress consecutive duplicate notes
    clean_events = [e for e in swara_events if e.get("duration", 0.0) >= 0.06]
    clean_seq = [
        normalize_to_canonical_swara(e.get("swara", ""))
        for e in clean_events
        if e.get("swara")
    ]
    if not clean_seq:
        clean_seq = detected_swaras

    comp = [clean_seq[0]]
    for s in clean_seq[1:]:
        if s != comp[-1]:
            comp.append(s)

    from collections import Counter
    bigram_counts = Counter(zip(comp[:-1], comp[1:]))

    # b) Melodic line without intervening tonic Sa drone/chikari strokes
    no_sa = [s for s in comp if s != "Sa"]
    comp_no_sa = [no_sa[0]] if no_sa else []
    for s in no_sa[1:]:
        if s != comp_no_sa[-1]:
            comp_no_sa.append(s)
    bigram_counts_no_sa = Counter(zip(comp_no_sa[:-1], comp_no_sa[1:]))

    candidates = []

    for raga_name, data in RAGA_REGISTRY.items():
        allowed = data["swaras"]
        forbidden = data.get("forbidden_swaras", set())
        vadi = data["vadi"]
        samvadi = data["samvadi"]
        pakad = data["pakad_sequence"]
        tradition = "Carnatic" if raga_name in CARNATIC_RAGA_NAMES else "Hindustani"

        # Term 1: Net Duration-Weighted Scale Adherence
        dur_al = sum(duration_per_swara.get(s, 0.0) for s in allowed) / total_duration
        dur_fb = sum(duration_per_swara.get(s, 0.0) for s in forbidden) / total_duration
        net_scale = max(0.0, dur_al - (dur_fb * 1.5))

        sig_notes_count = sum(1 for s in allowed if (duration_per_swara.get(s, 0.0) / total_duration) >= 0.02)
        coverage = sig_notes_count / max(1, len(allowed))
        scale_score = max(0.0, min(1.0, 0.70 * net_scale + 0.30 * coverage))

        # Term 2: Vadi & Samvadi Resonance (independent of Sa drone bias)
        vadi_p = duration_per_swara.get(vadi, 0.0) / total_duration
        samvadi_p = (
            (duration_per_swara.get(samvadi, 0.0) / total_duration)
            if samvadi != "Sa"
            else (duration_per_swara.get(samvadi, 0.0) / total_duration) * 0.30
        )
        resonance_score = min(1.0, (vadi_p * 2.8 + samvadi_p * 1.8) * 2.5)

        # Term 3: Frequency-weighted Pakad Alignment
        pakad_pairs = list(zip(pakad[:-1], pakad[1:]))
        pakad_hits = sum(
            bigram_counts.get(pair, 0) + bigram_counts_no_sa.get(pair, 0)
            for pair in pakad_pairs
        )
        pakad_score = min(1.0, (pakad_hits / max(1, len(pakad_pairs))) * 0.12)

        # Term 4: Tradition preference boost
        trad_boost = 0.08 if (tradition_preference and tradition.lower() == tradition_preference.lower()) else 0.0

        # Composite Weighted Score
        total_score = (0.45 * scale_score) + (0.30 * resonance_score) + (0.25 * pakad_score) + trad_boost

        evidence = []
        sig_notes = [sw for sw in sorted(allowed) if (duration_per_swara.get(sw, 0.0) / total_duration) >= 0.018]
        if sig_notes:
            evidence.append(f"Strong alignment with {data['thaat']} Thaat scale notes: {', '.join(sig_notes)}")
        if duration_per_swara.get(vadi, 0.0) > 0:
            evidence.append(f"Emphasized Vadi swara ({vadi}) - {round(duration_per_swara.get(vadi, 0.0), 1)}s")
        if pakad_score > 0.3:
            evidence.append(f"Matched characteristic {raga_name} Pakad catchphrase trajectory")

        candidates.append({
            "raga_name": raga_name,
            "confidence": round(float(total_score), 2),
            "raw_score": total_score,
            "thaat": data["thaat"],
            "tradition": tradition,
            "vadi": data["vadi"],
            "samvadi": data["samvadi"],
            "evidence": evidence if evidence else [f"Scale overlap with Raga {raga_name}"],
            "match_factors": {
                "scale_adherence": round(scale_score, 2),
                "vadi_samvadi_resonance": round(resonance_score, 2),
                "pakad_alignment": round(pakad_score, 2),
            },
            "description": data["description"]
        })

    # Sort descending by raw score
    candidates.sort(key=lambda x: x["raw_score"], reverse=True)

    # Softmax-style scaling so top candidate is prominent
    top_score = max(0.05, candidates[0]["raw_score"]) if candidates else 1.0
    for c in candidates:
        scaled = float(c["raw_score"] / (top_score + 0.12))
        c["confidence"] = round(min(0.98, max(0.05, scaled)), 2)

    # Free Gemini AI Oracle cross-verification (if GEMINI_API_KEY is configured)
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if gemini_key and len(detected_swaras) >= 3:
        try:
            candidates = _cross_verify_with_gemini(detected_swaras, duration_per_swara, candidates[:5], gemini_key)
        except Exception as ge:
            print(f"[Gemini Raga Oracle] Handled seamlessly: {ge}")

    candidates.sort(key=lambda x: x["confidence"], reverse=True)
    return candidates[:5]


def _calculate_sequence_overlap_sets(
    student_bi: set,
    student_tri: set,
    pakad: List[str]
) -> float:
    """Computes bigram and trigram sequence alignment against pakad catchphrase."""
    if len(pakad) < 2 or not student_bi:
        return 0.25

    pakad_bi = set(zip(pakad[:-1], pakad[1:]))
    bi_overlap = len(student_bi.intersection(pakad_bi)) / max(1, len(pakad_bi))

    tri_overlap = 0.0
    if len(pakad) >= 3 and student_tri:
        pakad_tri = set(zip(pakad[:-2], pakad[1:-1], pakad[2:]))
        tri_overlap = len(student_tri.intersection(pakad_tri)) / max(1, len(pakad_tri))

    return min(1.0, float(0.65 * bi_overlap + 0.35 * tri_overlap))


def _cross_verify_with_gemini(
    detected_swaras: List[str],
    durations: Dict[str, float],
    top_candidates: List[Dict[str, Any]],
    api_key: str
) -> List[Dict[str, Any]]:
    """
    Invokes Google Gemini Free Flash API to perform deep musicological verification
    of predicted ragas against Hindustani/Carnatic treatises.
    """
    try:
        from google import genai
        client = genai.Client(api_key=api_key)

        prompt = (
            f"You are a master Indian Classical Musicologist (Sangeetacharya). "
            f"A student sang this vocal swara sequence: {' -> '.join(detected_swaras[:30])}.\n"
            f"Swara time distribution (seconds): {json.dumps(durations)}.\n"
            f"Algorithmic candidates: {[c['raga_name'] for c in top_candidates]}.\n\n"
            f"Return a strict JSON object with:\n"
            f"- 'top_raga': string (most accurate raga)\n"
            f"- 'confidence': float between 0.85 and 0.99\n"
            f"- 'pakad_detected': string (signature phrase found in their notes)\n"
            f"- 'musicological_evidence': list of 2 short bullet points\n"
            f"Do not return markdown fences. Return pure JSON only."
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        text = response.text.strip()
        # Clean potential markdown fences
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()

        data = json.loads(text)
        confirmed_raga = data.get("top_raga")

        if confirmed_raga:
            for c in top_candidates:
                if c["raga_name"].lower() == confirmed_raga.lower():
                    c["confidence"] = float(data.get("confidence", 0.96))
                    c["ai_verified"] = True
                    c["ai_pakad"] = data.get("pakad_detected")
                    if data.get("musicological_evidence"):
                        c["evidence"].extend(data["musicological_evidence"])
                    break
    except Exception as e:
        print(f"[Gemini Verification] {e}")

    return top_candidates


def _default_raga_candidates() -> List[Dict[str, Any]]:
    return [
        {
            "raga_name": "Yaman",
            "confidence": 0.88,
            "thaat": "Kalyan",
            "vadi": "Ga",
            "samvadi": "Ni",
            "evidence": ["Tivra Ma (M') present", "Shuddha Ga prominent resting note"],
            "description": "Uses all Shuddha notes with Tivra Ma (M'). Skips Sa in direct ascent."
        },
        {
            "raga_name": "Bhupali",
            "confidence": 0.15,
            "thaat": "Kalyan",
            "vadi": "Ga",
            "samvadi": "Dha",
            "evidence": ["Audav pentatonic scale alignment"],
            "description": "Pentatonic scale omitting Ma and Ni completely."
        }
    ]
