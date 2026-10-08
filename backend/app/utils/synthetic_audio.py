"""
SwaraGPT - Synthetic Audio Generator for Testing & Reference Tuning
Generates mathematically pure acoustic signals for Indian Classical Swaras,
Alankars, continuous Meends, and test sine waves relative to any Adhara Shadja.
"""
import numpy as np
import soundfile as sf
import os
from typing import Dict, List, Optional

# Standard Classical Ratios from Sa
SWARA_RATIOS: Dict[str, float] = {
    "Sa": 1.0,
    "re": 16.0 / 15.0,        # Komal Re (112 cents)
    "Re": 9.0 / 8.0,          # Shuddha Re (204 cents)
    "ga": 6.0 / 5.0,          # Komal Ga (316 cents)
    "Ga": 5.0 / 4.0,          # Shuddha Ga (386 cents)
    "Ma": 4.0 / 3.0,          # Shuddha Ma (498 cents)
    "ma'": 45.0 / 32.0,       # Tivra Ma (590 cents)
    "Pa": 3.0 / 2.0,          # Pancham (702 cents)
    "dha": 8.0 / 5.0,         # Komal Dha (814 cents)
    "Dha": 5.0 / 3.0,         # Shuddha Dha (884 cents)
    "ni": 9.0 / 5.0,          # Komal Ni (1018 cents)
    "Ni": 15.0 / 8.0,         # Shuddha Ni (1088 cents)
    "Sa'": 2.0,               # Taar Sa (1200 cents)
}


def generate_swara_tone(
    swara: str,
    tonic_hz: float = 130.81,
    duration_sec: float = 1.0,
    sample_rate: int = 22050
) -> np.ndarray:
    """Generate a clean synthetic sine wave for a specific Swara."""
    ratio = SWARA_RATIOS.get(swara, 1.0)
    freq = tonic_hz * ratio
    t = np.linspace(0, duration_sec, int(sample_rate * duration_sec), endpoint=False)
    
    # Apply soft envelope (fade in and fade out) to prevent acoustic clicks
    fade_len = int(sample_rate * 0.04)
    envelope = np.ones_like(t)
    if len(t) > 2 * fade_len:
        envelope[:fade_len] = np.linspace(0, 1, fade_len)
        envelope[-fade_len:] = np.linspace(1, 0, fade_len)

    waveform = 0.85 * np.sin(2 * np.pi * freq * t) * envelope
    return waveform


def generate_alankar_audio(
    swara_sequence: List[str],
    tonic_hz: float = 130.81,
    note_duration: float = 0.6,
    output_path: Optional[str] = None,
    sample_rate: int = 22050
) -> tuple:
    """Generate a continuous audio waveform of a series of swaras."""
    chunks = []
    for swara in swara_sequence:
        chunks.append(generate_swara_tone(swara, tonic_hz, note_duration, sample_rate))
    
    full_audio = np.concatenate(chunks)
    if output_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        sf.write(output_path, full_audio, sample_rate)
    return full_audio, sample_rate
