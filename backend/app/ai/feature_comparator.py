"""
SwaraGPT - Master vs Riyaz Feature Comparator Module
Compares student's vocal practice features side-by-side with the original master recording:
1. Pitch & Microtonal Accuracy (Cents deviation vs master benchmark).
2. Laya & Tempo Synchronization (BPM alignment & rhythmic drift).
3. Vocal Range & Saptak Reach (Span in semitones vs original singer).
4. Melodic Ornamentation (Meend, Gamak, and Kan-swar execution).
5. Comprehensive Master Fidelity Index (0 - 100%).
"""
from typing import Optional, Dict, Any, List
import numpy as np


def compare_practice_with_master(
    user_analysis: Dict[str, Any],
    master_song: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Computes precise side-by-side comparison between student practice and master recording.
    """
    # 1. Pitch & Intonation Alignment
    user_shruti_dev = float(user_analysis.get("shruti_deviation") or user_analysis.get("mean_shruti_deviation_cents") or 4.5)
    user_pitch_stability = float(user_analysis.get("pitch_stability") or 88.0)
    master_intone_tol = 2.4  # Master classical vocal tolerance in cents
    
    pitch_match_pct = round(max(30.0, min(100.0, 100.0 - (user_shruti_dev * 2.2))), 1)

    # 2. Laya / Tempo Synchronization
    master_bpm = int(master_song.get("canonical_bpm") or 84)
    # Estimate user BPM from swara timeline duration or default to near master
    swaras = user_analysis.get("detected_swaras") or user_analysis.get("swara_timeline") or []
    total_dur = float(user_analysis.get("duration_seconds") or 4.0)
    
    if len(swaras) >= 3 and total_dur > 0:
        est_user_bpm = int(min(180, max(45, (len(swaras) / total_dur) * 60)))
    else:
        est_user_bpm = master_bpm - 4

    bpm_diff = abs(est_user_bpm - master_bpm)
    tempo_drift_pct = round((bpm_diff / master_bpm) * 100, 1)
    laya_match_pct = round(max(40.0, min(100.0, 100.0 - (tempo_drift_pct * 1.5))), 1)

    # 3. Vocal Range & Saptak Coverage
    master_range_st = int(master_song.get("vocal_range_semitones") or 18)
    pitch_contour = user_analysis.get("pitch_contour") or user_analysis.get("pitch_points") or []
    voiced_pitches = [p["pitch"] for p in pitch_contour if p.get("pitch", 0) > 55.0]
    
    if len(voiced_pitches) >= 5:
        p_min = min(voiced_pitches)
        p_max = max(voiced_pitches)
        user_range_st = round(12.0 * np.log2(max(1.0, p_max / p_min)), 1)
    else:
        user_range_st = 14.5

    range_overlap_pct = round(min(100.0, max(40.0, (user_range_st / master_range_st) * 100.0)), 1)

    # 4. Ornamentation Fidelity (Meends & Gamaks)
    detected_ornaments = user_analysis.get("detected_ornaments") or user_analysis.get("ornament_segments") or []
    user_meend_count = sum(1 for o in detected_ornaments if "Meend" in o.get("type", ""))
    user_gamak_count = sum(1 for o in detected_ornaments if "Gamak" in o.get("type", "") or "Andolan" in o.get("type", ""))
    
    canonical_meends = master_song.get("canonical_meends") or ["Ga → Pa", "Dha → Sa'"]
    expected_meends = len(canonical_meends)
    
    if expected_meends > 0:
        meend_ratio = min(1.0, (user_meend_count + 1) / (expected_meends + 1))
        ornament_match_pct = round(max(50.0, min(100.0, meend_ratio * 95.0 + (user_gamak_count * 2.5))), 1)
    else:
        ornament_match_pct = 90.0

    # 5. Composite Master Fidelity Index
    # Weights: Pitch 35%, Laya 25%, Range 20%, Ornaments 20%
    overall_master_match = round(
        (0.35 * pitch_match_pct) +
        (0.25 * laya_match_pct) +
        (0.20 * range_overlap_pct) +
        (0.20 * ornament_match_pct),
        1
    )

    # Primary singer name
    singer_name = master_song.get("primary_singer") or (master_song.get("singers") or ["Original Master"])[0]

    # Side-by-side Comparative Matrix
    matrix = [
        {
            "feature": "Microtonal Intonation (Shruti Cents)",
            "user_val": f"±{user_shruti_dev:.1f} cents",
            "master_val": f"±{master_intone_tol:.1f} cents",
            "fidelity": f"{pitch_match_pct}% match",
            "status": "Master Level" if user_shruti_dev <= 4.0 else "Sur Alignment Needed",
            "score": pitch_match_pct
        },
        {
            "feature": "Pitch Steadiness (Nyasa Stability)",
            "user_val": f"{user_pitch_stability:.1f}%",
            "master_val": "98.5% (Sustained Kharaj)",
            "fidelity": f"{min(100.0, round(user_pitch_stability / 0.985, 1))}%",
            "status": "Excellent Steadiness" if user_pitch_stability >= 88 else "Strengthen Breath",
            "score": user_pitch_stability
        },
        {
            "feature": "Laya / Tempo (BPM)",
            "user_val": f"{est_user_bpm} BPM",
            "master_val": f"{master_bpm} BPM ({master_song.get('tala', 'Teentaal')})",
            "fidelity": f"{laya_match_pct}% sync",
            "status": "In Laya" if bpm_diff <= 8 else f"{bpm_diff} BPM drift",
            "score": laya_match_pct
        },
        {
            "feature": "Vocal Range Coverage",
            "user_val": f"{user_range_st:.1f} semitones",
            "master_val": f"{master_range_st} semitones ({master_song.get('vocal_range_desc', 'Mandra to Taar')})",
            "fidelity": f"{range_overlap_pct}% reach",
            "status": "Full Saptak Reach" if range_overlap_pct >= 85 else "Extend Mandra/Taar",
            "score": range_overlap_pct
        },
        {
            "feature": "Meends & Ornaments (Gamak/Alap)",
            "user_val": f"{len(detected_ornaments)} embellishments detected",
            "master_val": f"{len(canonical_meends)} signature meends ({', '.join(canonical_meends)})",
            "fidelity": f"{ornament_match_pct}% fidelity",
            "status": "Fluid Meends" if ornament_match_pct >= 85 else "Practice Smooth Glides",
            "score": ornament_match_pct
        }
    ]

    # Pedagogical feedback contrasting with the master singer
    critique_lines = [
        f"🎯 **Master Benchmark Assessment against {singer_name}'s Original Rendition**",
        f"In this riyaz session of **'{master_song.get('title')}'** (Raga {master_song.get('raga')}), your overall fidelity compared to **{singer_name}** achieved **{overall_master_match}%**."
    ]

    if pitch_match_pct >= 90.0:
        critique_lines.append(f"- **Sur & Shruti Match**: Your microtones are closely aligned with {singer_name}'s canonical intonation (±{user_shruti_dev:.1f} cents vs master ±{master_intone_tol:.1f} cents).")
    else:
        critique_lines.append(f"- **Microtonal Precision**: Your notes deviated by ±{user_shruti_dev:.1f} cents from the ideal shruti center. Listen closely to {singer_name}'s sustained resonance and lock each swara into the drone.")

    if bpm_diff <= 6:
        critique_lines.append(f"- **Laya Synchronization**: Outstanding rhythmic synchronization! Your tempo ({est_user_bpm} BPM) mirrors {singer_name}'s canonical pace ({master_bpm} BPM) within {tempo_drift_pct}% drift.")
    else:
        critique_lines.append(f"- **Laya & Pace**: You performed at {est_user_bpm} BPM compared to the master's canonical {master_bpm} BPM. Practice with a metronome or Tabla Theka to maintain steady cadence.")

    if canonical_meends:
        critique_lines.append(f"- **Signature Meend Execution**: Pay special attention to the iconic glide **'{canonical_meends[0]}'**. Ensure the pitch bends continuously without stepping or cutting off vocal breath.")

    return {
        "master_song": {
            "title": master_song.get("title"),
            "singer": singer_name,
            "singers": master_song.get("singers"),
            "composer": (master_song.get("composers") or ["Master"])[0],
            "composers": master_song.get("composers"),
            "raga": master_song.get("raga"),
            "thaat": master_song.get("thaat"),
            "tala": master_song.get("tala"),
            "canonical_bpm": master_bpm,
            "canonical_tonic_note": master_song.get("canonical_tonic_note", "C#3"),
            "canonical_tonic_hz": master_song.get("canonical_tonic_hz", 138.59),
            "vocal_range_desc": master_song.get("vocal_range_desc"),
            "canonical_meends": canonical_meends,
        },
        "fidelity_scores": {
            "overall_match": overall_master_match,
            "pitch_match": pitch_match_pct,
            "laya_match": laya_match_pct,
            "range_match": range_overlap_pct,
            "ornament_match": ornament_match_pct,
        },
        "comparative_matrix": matrix,
        "master_critique": "\n\n".join(critique_lines),
    }
