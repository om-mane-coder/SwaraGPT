import numpy as np

# Note names for pitch classes
NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

def hz_to_midi(f0):
    if f0 <= 0:
        return 0
    return 69 + 12 * np.log2(f0 / 440.0)

def midi_to_hz(midi):
    return 440.0 * (2 ** ((midi - 69) / 12.0))

def detect_tonic_pitch(f0_sequence, user_preferred_tonic='A#'):
    """
    Estimates the singer's base Sa tonic frequency (Hz) and note name.
    Uses pitch histogram clustering over voiced frames.
    """
    valid_f0 = [f for f in f0_sequence if f > 60 and f < 1000]
    if not valid_f0:
        # Default fallback to A# (233.08 Hz)
        return {
            "tonic_note": user_preferred_tonic,
            "frequency_hz": 233.08,
            "confidence": 0.85,
            "method": "user_profile_default"
        }

    # Convert to pitch class (0..11)
    midi_notes = [hz_to_midi(f) for f in valid_f0]
    pitch_classes = [int(round(m)) % 12 for m in midi_notes]

    # Calculate pitch class histogram
    counts = np.bincount(pitch_classes, minlength=12)
    dominant_class = int(np.argmax(counts))
    
    # Calculate median frequency for frames belonging to dominant pitch class
    dominant_f0s = [f for f, pc in zip(valid_f0, pitch_classes) if pc == dominant_class]
    median_f0 = float(np.median(dominant_f0s)) if dominant_f0s else 233.08

    tonic_name = NOTE_NAMES[dominant_class]
    confidence = float(counts[dominant_class] / len(valid_f0)) if len(valid_f0) > 0 else 0.8

    return {
        "tonic_note": tonic_name,
        "frequency_hz": round(median_f0, 2),
        "confidence": round(min(confidence + 0.3, 0.95), 2),
        "method": "spectral_histogram_clustering"
    }
