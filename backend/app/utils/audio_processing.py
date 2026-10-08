"""
SwaraGPT - Digital Signal Processing & Audio Preprocessing Pipeline
Performs resilient audio decoding (PyAV / SoundFile / Scipy / Librosa),
resampling to 22.05 kHz, high-pass filtering at 80 Hz,
energy-based voice activity detection (VAD), silence trimming, and normalization.
"""
import os
import numpy as np
from scipy import signal
from typing import Tuple, Optional
from app.config import settings


def _load_audio_file(file_path: str, target_sr: int = 22050) -> Tuple[np.ndarray, int]:
    """
    Robust audio loader supporting WebM (Opus), MP3, AAC, M4A, FLAC, WAV, OGG.
    First tries PyAV (built-in FFmpeg decoders), then SoundFile, then Scipy, then Librosa.
    """
    # 1. Try PyAV (handles WebM, Opus, MP3, AAC, etc.)
    try:
        import av
        container = av.open(file_path)
        if container.streams.audio:
            resampler = av.AudioResampler(format='fltp', layout='mono', rate=target_sr)
            frames = []
            for frame in container.decode(audio=0):
                for r_f in resampler.resample(frame):
                    frames.append(r_f.to_ndarray())
            if frames:
                arr = np.concatenate(frames, axis=1).squeeze()
                if arr.ndim > 1:
                    arr = np.mean(arr, axis=0)
                if len(arr) > 0:
                    return arr.astype(np.float32), target_sr
    except Exception as e:
        pass

    # 2. Try SoundFile
    try:
        import soundfile as sf
        y, orig_sr = sf.read(file_path, dtype='float32')
        if y.ndim > 1:
            y = np.mean(y, axis=1)
        if orig_sr != target_sr and len(y) > 0:
            import librosa
            y = librosa.resample(y, orig_sr=orig_sr, target_sr=target_sr)
        return y, target_sr
    except Exception:
        pass

    # 3. Try Librosa standard load
    try:
        import librosa
        y, orig_sr = librosa.load(file_path, sr=target_sr, mono=True)
        return y, target_sr
    except Exception:
        pass

    # 4. Try Scipy wavfile
    try:
        from scipy.io import wavfile
        orig_sr, data = wavfile.read(file_path)
        if data.dtype == np.int16:
            y = data.astype(np.float32) / 32768.0
        elif data.dtype == np.int32:
            y = data.astype(np.float32) / 2147483648.0
        else:
            y = data.astype(np.float32)
        if y.ndim > 1:
            y = np.mean(y, axis=1)
        if orig_sr != target_sr and len(y) > 0:
            import librosa
            y = librosa.resample(y, orig_sr=orig_sr, target_sr=target_sr)
        return y, target_sr
    except Exception:
        pass

    return np.zeros(target_sr, dtype=np.float32), target_sr


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

    y, sr = _load_audio_file(file_path, target_sr=target_sr)
    if len(y) == 0 or np.all(y == 0):
        return np.zeros(target_sr, dtype=np.float32), target_sr, 0.0

    # High-pass filter at 80 Hz (2nd order Butterworth)
    try:
        sos = signal.butter(2, settings.HIGH_PASS_CUTOFF_HZ, 'hp', fs=sr, output='sos')
        y_filtered = signal.sosfilt(sos, y)
    except Exception:
        y_filtered = y

    # Normalize to -1.0 dBFS (~0.89 max amplitude)
    max_val = np.max(np.abs(y_filtered))
    if max_val > 1e-4:
        y_normalized = (y_filtered / max_val) * 0.891
    else:
        y_normalized = y_filtered

    # Voice Activity Trimming (top_db=30)
    try:
        trimmed_y, _ = librosa.effects.trim(y_normalized, top_db=30)
        if len(trimmed_y) > sr * 0.2:
            final_y = trimmed_y
        else:
            final_y = y_normalized
    except Exception:
        final_y = y_normalized

    duration = float(len(final_y) / sr)
    return final_y.astype(np.float32), sr, duration
