"""
SwaraGPT - Digital Signal Processing & Audio Preprocessing Pipeline
Performs resampling to 22.05 kHz, high-pass filtering at 80 Hz,
energy-based voice activity detection (VAD), silence trimming, and normalization.
"""
import os
import numpy as np
from scipy import signal
from typing import Tuple, Optional
from app.config import settings


def preprocess_audio(file_path: str, target_sr: int = 22050) -> Tuple[np.ndarray, int, float]:
    """
    Load and preprocess audio signal for Music Information Retrieval (MIR):
    1. Resample to standard analysis rate (22.05 kHz).
    2. Convert to mono.
    3. Apply 80 Hz high-pass filter (suppresses microphone rumble/fan noise).
    4. Normalize amplitude to -1.0 dBFS.
    5. Trim leading/trailing silence using energy thresholding.

    Returns:
        (y_processed, sample_rate, duration_seconds)
    """
    import librosa

    # Load audio
    y, sr = librosa.load(file_path, sr=target_sr, mono=True)
    if len(y) == 0:
        return np.zeros(target_sr), target_sr, 0.0

    # High-pass filter at 80 Hz (2nd order Butterworth)
    sos = signal.butter(2, settings.HIGH_PASS_CUTOFF_HZ, 'hp', fs=sr, output='sos')
    y_filtered = signal.sosfilt(sos, y)

    # Normalize to -1.0 dBFS (~0.89 max amplitude)
    max_val = np.max(np.abs(y_filtered))
    if max_val > 1e-4:
        y_normalized = (y_filtered / max_val) * 0.891
    else:
        y_normalized = y_filtered

    # Voice Activity Trimming (top_db=30)
    trimmed_y, _ = librosa.effects.trim(y_normalized, top_db=30)
    if len(trimmed_y) > sr * 0.2:
        final_y = trimmed_y
    else:
        final_y = y_normalized

    duration = float(len(final_y) / sr)
    return final_y, sr, duration
