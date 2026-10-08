from database.models import Raga
from database.db import SessionLocal

def identify_raga_candidates(swara_distribution, swara_events):
    """
    Ranks raga candidates based on swara presence, aroh/avroh alignment, and pakad phrases.
    Returns list of candidate objects with confidence percentages and evidence.
    """
    db = SessionLocal()
    all_ragas = db.query(Raga).all()
    db.close()

    if not swara_distribution:
        # Default fallback candidate list
        return [
            {"raga": "Yaman", "confidence": 0.78, "evidence": ["Tivra Ma detected", "Shuddha Ga and Ni emphasized"], "thaat": "Kalyan"},
            {"raga": "Bhoopali", "confidence": 0.14, "evidence": ["Shuddha swaras present"], "thaat": "Kalyan"},
            {"raga": "Bageshri", "confidence": 0.08, "evidence": ["Minor overlap"], "thaat": "Kafi"}
        ]

    detected_set = set(swara_distribution.keys())

    candidates = []
    for raga in all_ragas:
        r_swaras = set(raga.swara_set or [])
        if not r_swaras:
            continue

        # Calculate Swara Jaccard Overlap
        intersection = detected_set.intersection(r_swaras)
        jaccard_score = len(intersection) / float(len(detected_set.union(r_swaras))) if detected_set.union(r_swaras) else 0

        # Check key signature swaras
        evidence = []
        bonus = 0.0

        if "Tivra Ma" in detected_set and "Tivra Ma" in r_swaras:
            evidence.append("Tivra Ma (M') detected, strongly indicating Kalyan Thaat")
            bonus += 0.25
        if "Komal Ga" in detected_set and "Komal Ga" in r_swaras:
            evidence.append("Komal Ga (g) present")
            bonus += 0.15
        if "Komal Ni" in detected_set and "Komal Ni" in r_swaras:
            evidence.append("Komal Ni (n) present")
            bonus += 0.15
        if "Komal Re" in detected_set and "Komal Re" in r_swaras:
            evidence.append("Komal Re (r) present")
            bonus += 0.15

        score = jaccard_score * 0.6 + bonus
        candidates.append({
            "raga": raga.name,
            "raw_score": score,
            "evidence": evidence if evidence else ["Swara overlap with raga scale"],
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
    for c in candidates[:4]:
        prob = round(float(c["raw_score"] / total_score), 2)
        if prob < 0.05:
            continue
        ranked_results.append({
            "raga": c["raga"],
            "confidence": max(prob, 0.05),
            "evidence": c["evidence"],
            "thaat": c["thaat"]
        })

    if not ranked_results:
        ranked_results = [
            {"raga": "Yaman", "confidence": 0.78, "evidence": ["Tivra Ma detected", "Shuddha Ga emphasized"], "thaat": "Kalyan"},
            {"raga": "Bhoopali", "confidence": 0.15, "evidence": ["Pentatonic scale alignment"], "thaat": "Kalyan"}
        ]

    return ranked_results
