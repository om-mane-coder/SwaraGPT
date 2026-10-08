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

    # Filter voiced frames between 65 Hz and 800 Hz
    voiced = f0_array[(f0_array > 65.0) & (f0_array < 800.0)]
    if len(voiced) < 10:
        # Default fallback C3
        return {
            "estimated_sa_hz": 130.81,
            "confidence": 0.5,
            "nearest_western_note": "C3",
            "source": "default_fallback"
        }

    # Fold all frequencies into one reference octave [110 Hz, 220 Hz]
    folded_pitches = []
    for f in voiced:
        folded = f
        while folded > 220.0:
            folded /= 2.0
        while folded < 110.0:
            folded *= 2.0
        folded_pitches.append(folded)

    # Compute high-resolution histogram (120 bins across octave = 10-cent resolution)
    hist, bin_edges = np.histogram(folded_pitches, bins=120, range=(110.0, 220.0))
    peak_idx = int(np.argmax(hist))
    estimated_sa = float(0.5 * (bin_edges[peak_idx] + bin_edges[peak_idx + 1]))

    # Confidence estimation from peak prominence
    peak_count = hist[peak_idx]
    mean_count = np.mean(hist) + 1e-5
    confidence = float(min(0.98, max(0.60, (peak_count / (2.5 * mean_count)))))

    return {
        "estimated_sa_hz": round(estimated_sa, 2),
        "confidence": round(confidence, 2),
        "nearest_western_note": freq_to_note_name(estimated_sa),
        "source": "auto_histogram"
    }
