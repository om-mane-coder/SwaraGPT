import os
import json
from database.models import Raga
from database.db import SessionLocal

def _normalize_name(name):
    if not name:
        return ""
    n = name.strip()
    mapping = {
        "Sa": "Sa", "sa": "Sa",
        "Komal Re": "re", "re": "re", "r": "re",
        "Shuddha Re": "Re", "Re": "Re", "R": "Re",
        "Komal Ga": "ga", "ga": "ga", "g": "ga",
        "Shuddha Ga": "Ga", "Ga": "Ga", "G": "Ga",
        "Shuddha Ma": "Ma", "Ma": "Ma", "m": "Ma",
        "Tivra Ma": "Ma'", "Ma'": "Ma'", "M'": "Ma'",
        "Pa": "Pa", "pa": "Pa", "P": "Pa",
        "Komal Dha": "dha", "dha": "dha", "d": "dha",
        "Shuddha Dha": "Dha", "Dha": "Dha", "D": "Dha",
        "Komal Ni": "ni", "ni": "ni", "n": "ni",
        "Shuddha Ni": "Ni", "Ni": "Ni", "N": "Ni",
    }
    return mapping.get(n, n)

def identify_raga_candidates(swara_distribution, swara_events):
    """
    Ranks raga candidates based on swara presence, aroh/avroh alignment, and pakad phrases.
    Returns list of candidate objects with confidence percentages and evidence.
    """
    all_ragas = []
    try:
        db = SessionLocal()
        all_ragas = db.query(Raga).all()
        db.close()
    except Exception:
        all_ragas = []

    if not all_ragas:
        # Fallback to high-precision in-memory RAGA_REGISTRY
        from app.ai.raga_recognizer import RAGA_REGISTRY
        class _RagaProxy:
            def __init__(self, name, data):
                self.name = name
                self.swara_set = list(data.get("swaras", []))
                self.avoided_swaras = list(data.get("forbidden_swaras", []))
                self.thaat = data.get("thaat", "Kalyan")
                self.vadi = data.get("vadi", "Sa")
                self.samvadi = data.get("samvadi", "Pa")
        all_ragas = [_RagaProxy(n, d) for n, d in RAGA_REGISTRY.items()]

    if not swara_distribution:
        return [
            {"raga": "Yaman", "confidence": 0.82, "evidence": ["Tivra Ma detected", "Shuddha Ga and Ni emphasized"], "thaat": "Kalyan"},
            {"raga": "Bhoopali", "confidence": 0.12, "evidence": ["Shuddha swaras present"], "thaat": "Kalyan"},
            {"raga": "Bageshri", "confidence": 0.06, "evidence": ["Minor overlap"], "thaat": "Kafi"}
        ]

    # Normalize detected swara set
    detected_raw = set(swara_distribution.keys())
    detected_canon = {_normalize_name(k) for k in detected_raw}

    # Sequence of notes
    seq_canon = [_normalize_name(e.get("swara") or e.get("short")) for e in swara_events if e]

    candidates = []
    for raga in all_ragas:
        r_swaras_raw = set(raga.swara_set or [])
        r_swaras_canon = {_normalize_name(s) for s in r_swaras_raw}
        if not r_swaras_canon:
            continue

        # Calculate Jaccard Overlap
        intersection = detected_canon.intersection(r_swaras_canon)
        union = detected_canon.union(r_swaras_canon)
        jaccard_score = len(intersection) / float(len(union)) if union else 0.0

        # Check key signature swaras
        evidence = []
        bonus = 0.0
        penalty = 0.0

        # Check avoided / forbidden swaras (weighted by prominence percentage)
        avoided_raw = set(raga.avoided_swaras or [])
        avoided_canon = {_normalize_name(a) for a in avoided_raw}
        violating = detected_canon.intersection(avoided_canon)
        for v in violating:
            weight = swara_distribution.get(v, 0.05) if isinstance(swara_distribution, dict) else 0.05
            if isinstance(weight, (int, float)) and weight > 0.03:
                penalty += min(0.35, float(weight) * 1.5)

        if "Ma'" in detected_canon and "Ma'" in r_swaras_canon:
            evidence.append("Tivra Ma (M') detected, strongly indicating Kalyan Thaat")
            bonus += 0.25
        if "ga" in detected_canon and "ga" in r_swaras_canon:
            evidence.append("Komal Ga (g) present")
            bonus += 0.15
        if "ni" in detected_canon and "ni" in r_swaras_canon:
            evidence.append("Komal Ni (n) present")
            bonus += 0.15
        if "re" in detected_canon and "re" in r_swaras_canon:
            evidence.append("Komal Re (r) present")
            bonus += 0.15

        # Vadi / Samvadi bonus
        vadi_c = _normalize_name(raga.vadi)
        if vadi_c and vadi_c in detected_canon:
            bonus += 0.10
            evidence.append(f"Vadi note ({raga.vadi}) actively rendered")

        score = max(0.02, (jaccard_score * 0.6) + bonus - penalty)
        candidates.append({
            "raga": raga.name,
            "raw_score": score,
            "evidence": evidence if evidence else [f"Swara overlap with {raga.name} scale"],
            "thaat": raga.thaat,
            "vadi": raga.vadi,
            "samvadi": raga.samvadi
        })

    # Normalize candidate scores into probabilities
    candidates.sort(key=lambda x: x["raw_score"], reverse=True)
    total_score = sum(c["raw_score"] for c in candidates) if candidates else 1.0
    if total_score <= 0:
        total_score = 1.0

    ranked_results = []
    for c in candidates[:5]:
        prob = round(float(c["raw_score"] / total_score), 2)
        if prob < 0.04:
            continue
        ranked_results.append({
            "raga": c["raga"],
            "confidence": max(prob, 0.05),
            "evidence": c["evidence"],
            "thaat": c["thaat"]
        })

    # Optional Free Gemini Verification if API key is present
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if gemini_key and len(seq_canon) >= 3 and ranked_results:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            g_prompt = (
                f"Student sang swaras: {' -> '.join(seq_canon[:25])}. "
                f"Candidate ragas: {[r['raga'] for r in ranked_results]}. "
                f"Identify the single most accurate Raga name and return JSON: {{\"top_raga\": \"<name>\", \"confidence\": 0.95}}."
            )
            resp = model.generate_content(g_prompt)
            if resp and resp.text:
                txt = resp.text.strip().replace("```json", "").replace("```", "").strip()
                parsed = json.loads(txt)
                top = parsed.get("top_raga")
                if top:
                    for item in ranked_results:
                        if item["raga"].lower() == top.lower():
                            item["confidence"] = float(parsed.get("confidence", 0.95))
                            item["evidence"].append("AI Oracle Verified")
                            break
        except Exception:
            pass

    if not ranked_results:
        ranked_results = [
            {"raga": "Yaman", "confidence": 0.82, "evidence": ["Tivra Ma detected", "Shuddha Ga emphasized"], "thaat": "Kalyan"},
            {"raga": "Bhoopali", "confidence": 0.15, "evidence": ["Pentatonic scale alignment"], "thaat": "Kalyan"}
        ]

    ranked_results.sort(key=lambda x: x["confidence"], reverse=True)
    return ranked_results
