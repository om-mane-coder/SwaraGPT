"""
SwaraGPT - Tonic (Adhara Shadja / Sa) Detection & Estimation
Computes automatic tonic frequency from the long-term pitch distribution (LTPD),
or applies user-specified manual tonic tuning without Western A=440 bias.
"""
from typing import Optional, Dict, Any, List
import numpy as np

# Western reference note mappings for user-friendly display
NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]


def freq_to_note_name(freq: float) -> str:
    """Convert Hz to nearest Western note name (e.g. 130.81 -> C3)."""
    if freq <= 0:
        return "Unknown"
    # A4 = 440 Hz is note index 69
    midi = int(round(69 + 12 * np.log2(freq / 440.0)))
    octave = (midi // 12) - 1
    note = NOTE_NAMES[midi % 12]
    return f"{note}{octave}"


def estimate_tonic_from_f0(
    f0_array: np.ndarray,
    user_specified_hz: Optional[float] = None
) -> Dict[str, Any]:
    """
    Estimate Adhara Shadja (Sa) tonic:
    - If user provided manual Sa: respect that frequency.
    - Otherwise: estimate tonic from the peak of the long-term pitch histogram.
    """
    if user_specified_hz and user_specified_hz > 50.0:
        return {
            "estimated_sa_hz": round(float(user_specified_hz), 2),
            "confidence": 1.0,
            "nearest_western_note": freq_to_note_name(user_specified_hz),
            "source": "user_specified"
        }

    # Filter voiced frames between 65 Hz and 850 Hz
    voiced = f0_array[(f0_array > 65.0) & (f0_array < 850.0)]
    if len(voiced) < 10:
        # Default fallback C3
        return {
            "estimated_sa_hz": 130.81,
            "confidence": 0.5,
            "nearest_western_note": "C3",
            "source": "default_fallback"
        }

    median_pitch = float(np.median(voiced))
    # Determine singer's register: male (around 110-180 Hz) vs female/child (around 180-320 Hz)
    is_high_register = median_pitch > 185.0
    oct_low = 180.0 if is_high_register else 105.0
    oct_high = 360.0 if is_high_register else 210.0

    # Fold frequencies into singer's native octave
    folded_pitches = []
    for f in voiced:
        folded = f
        while folded > oct_high:
            folded /= 2.0
        while folded < oct_low:
            folded *= 2.0
        folded_pitches.append(folded)

    # Compute high-resolution histogram (120 bins across octave = ~10-cent resolution)
    hist, bin_edges = np.histogram(folded_pitches, bins=120, range=(oct_low, oct_high))
    bin_centers = 0.5 * (bin_edges[:-1] + bin_edges[1:])

    # Find candidate peaks (local maxima in histogram)
    candidates = []
    for i in range(1, len(hist) - 1):
        if hist[i] > hist[i - 1] and hist[i] > hist[i + 1] and hist[i] > np.mean(hist) * 0.8:
            candidates.append((hist[i], bin_centers[i]))

    if not candidates:
        peak_idx = int(np.argmax(hist))
        estimated_sa = float(bin_centers[peak_idx])
        confidence = 0.65
    else:
        # Sort candidates by peak height
        candidates.sort(key=lambda x: x[0], reverse=True)
        top_candidates = candidates[:5]

        # Multi-Pitch Class Template Matching:
        # In Indian music, Sa has a pure fifth (Pa, +702¢) or pure fourth (Ma, +498¢).
        best_sa = top_candidates[0][1]
        best_score = -1.0

        for peak_cnt, cand_sa in top_candidates:
            # Score presence of Pancham (+702 cents) and Madhyam (+498 cents)
            # cand_pa = cand_sa * 1.5; cand_ma = cand_sa * (4/3)
            cand_pa = cand_sa * 1.4983
            cand_ma = cand_sa * 1.3348
            while cand_pa > oct_high:
                cand_pa /= 2.0
            while cand_ma > oct_high:
                cand_ma /= 2.0

            # Find bins corresponding to Pa and Ma
            pa_idx = int(np.clip(int((cand_pa - oct_low) / (oct_high - oct_low) * 120), 0, 119))
            ma_idx = int(np.clip(int((cand_ma - oct_low) / (oct_high - oct_low) * 120), 0, 119))

            pa_energy = hist[pa_idx]
            ma_energy = hist[ma_idx]

            # Composite score: prominence of candidate + fifth/fourth harmonic validation
            template_score = peak_cnt * 1.0 + pa_energy * 0.45 + ma_energy * 0.25
            if template_score > best_score:
                best_score = template_score
                best_sa = cand_sa

        estimated_sa = float(best_sa)
        peak_idx = int(np.argmin(np.abs(bin_centers - estimated_sa)))
        peak_count = hist[peak_idx]
        mean_count = np.mean(hist) + 1e-5
        confidence = float(min(0.98, max(0.65, (peak_count / (2.2 * mean_count)))))

    return {
        "estimated_sa_hz": round(estimated_sa, 2),
        "confidence": round(confidence, 2),
        "nearest_western_note": freq_to_note_name(estimated_sa),
        "source": "auto_harmonic_template_histogram"
    }
