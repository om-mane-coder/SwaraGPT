"""
SwaraGPT - Ornamentation Detection & Trajectory Segmentation Module
Distinguishes steady sustained notes (Nyasa) from intentional expressive ornamentation:
Meend, Gamak, Andolan, Murki, Khatka, and Kan-swar.
Prevents natural Indian Classical vocal embellishments from being falsely classified as pitch errors.
"""
from typing import Optional, Dict, Any, List
import numpy as np


def detect_ornamentations(
    pitch_contour: List[Dict[str, Any]],
    sa_hz: float
) -> List[Dict[str, Any]]:
    """
    Analyze pitch contour derivative dC/dt to identify vocal ornaments.
    
    Segmentation Rules:
    - Frames with |dC/dt| <= 15 cents/sec for dt >= 180ms -> Steady Nyasa Sustain
    - Frames with |dC/dt| > 25 cents/sec -> Expressive Ornamentation Contours
      - Monotonic sweep across > 150 cents -> Meend (Glide)
      - Rapid periodic sign flips in dC/dt -> Gamak / Andolan (Oscillation)
      - Duration < 120ms before sudden jump -> Kan-swar (Grace Note)
      - Multi-peak short inflection (< 250ms) -> Murki / Khatka (Trill)
    """
    if not pitch_contour or len(pitch_contour) < 5 or sa_hz <= 0:
        return []

    ornaments: List[Dict[str, Any]] = []
    
    # Filter voiced frames
    voiced_pts = [p for p in pitch_contour if p.get("pitch", 0.0) > 55.0]
    if len(voiced_pts) < 5:
        return []

    times = np.array([p["time"] for p in voiced_pts])
    pitches = np.array([p["pitch"] for p in voiced_pts])
    cents = 1200.0 * np.log2(pitches / sa_hz)

    # Compute cent derivative with respect to time (cents/sec)
    dt = np.diff(times)
    dc = np.diff(cents)
    # Avoid zero division
    dt = np.where(dt < 1e-4, 1e-4, dt)
    slopes = dc / dt

    # Group high-derivative segments (|slopes| > 25 cents/sec)
    is_ornament = np.abs(slopes) > 25.0
    
    in_segment = False
    seg_start_idx = 0

    for i in range(len(is_ornament)):
        if is_ornament[i] and not in_segment:
            in_segment = True
            seg_start_idx = i
        elif not is_ornament[i] and in_segment:
            in_segment = False
            seg_end_idx = i
            seg_duration = times[seg_end_idx] - times[seg_start_idx]
            
            if seg_duration >= 0.06:
                seg_cents = cents[seg_start_idx:seg_end_idx+1]
                net_cent_change = float(seg_cents[-1] - seg_cents[0])
                total_abs_change = float(np.sum(np.abs(np.diff(seg_cents))))
                mean_slope = float(np.mean(slopes[seg_start_idx:seg_end_idx]))

                # Classify ornament type
                ornament_type, desc = _classify_ornament_type(
                    seg_duration, net_cent_change, total_abs_change, mean_slope
                )

                ornaments.append({
                    "type": ornament_type,
                    "start_time": round(float(times[seg_start_idx]), 2),
                    "end_time": round(float(times[seg_end_idx]), 2),
                    "duration": round(float(seg_duration), 2),
                    "start_freq": round(float(pitches[seg_start_idx]), 1),
                    "end_freq": round(float(pitches[seg_end_idx]), 1),
                    "net_cent_change": round(net_cent_change, 1),
                    "slope_cents_per_sec": round(mean_slope, 1),
                    "description": desc
                })

    return ornaments


def _classify_ornament_type(
    duration: float, net_change: float, total_change: float, slope: float
) -> tuple:
    """Classify the specific Indian Classical ornamentation gesture."""
    abs_net = abs(net_change)

    # 1. Grace Note (Kan-swar): extremely brief (< 130 ms) leading touch
    if duration <= 0.13 and abs_net >= 40:
        return "Kan-swar (Grace Note)", "Brief microtonal touch leading gracefully into the principal note."

    # 2. Meend (Glide): continuous glide across a significant interval (> 120 cents)
    if abs_net >= 120 and (total_change / (abs_net + 1e-4)) < 1.4:
        direction = "Ascending" if net_change > 0 else "Descending"
        return "Meend (Glide)", f"Smooth continuous {direction.lower()} vocal glide linking distinct swara regions without break."

    # 3. Gamak / Andolan: oscillatory movement where total distance >> net distance
    if total_change > 1.8 * (abs_net + 20) and duration >= 0.25:
        if abs(slope) > 80:
            return "Gamak (Heavy Oscillation)", "Forceful, rhythmic vocal oscillation from the chest/navel."
        else:
            return "Andolan (Slow Sway)", "Gentle, delicate microtonal sway characteristic of Bhairav (Re/Dha) and Darbari (Ga)."

    # 4. Murki / Khatka: rapid cluster or circle around a note (< 280 ms)
    if duration <= 0.28 and total_change >= 60:
        return "Murki (Fast Trill)", "Crisp, swift melodic turn creating aesthetic sparkle."

    return "Expressive Movement", "Microtonal vocal modulation between swaras."
