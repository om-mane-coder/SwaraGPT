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

    # Check raw signal energy before amplifying
    raw_peak = float(np.max(np.abs(y_filtered)))
    raw_rms = float(np.sqrt(np.mean(y_filtered ** 2)))

    # If raw signal is silent or background room noise, DO NOT boost it by 500x!
    if raw_peak < 0.015 or raw_rms < 0.003:
        duration = float(len(y_filtered) / sr)
        return y_filtered.astype(np.float32), sr, duration

    # Normalize genuine singing audio to -1.0 dBFS (~0.89 max amplitude)
    max_val = raw_peak
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


def validate_audio_quality(y: np.ndarray, sr: int = 22050) -> dict:
    """
    Evaluates raw audio signal quality before MIR analysis:
    - Checks for silence, extremely low volume, clipping, spectral flatness (unvoiced noise vs singing),
      and lack of voiced harmonic content.
    - Returns structured diagnostics explaining whether audio is clear for practice.
    """
    import librosa

    if y is None or len(y) == 0:
        return {
            "is_valid": False,
            "status": "silent_audio",
            "message": "⚠️ No audio data received. Your recording is empty.",
            "instructions": "Please ensure your microphone is enabled and unmute your input before recording.",
            "metrics": {"rms": 0.0, "peak": 0.0, "duration_sec": 0.0}
        }

    duration = float(len(y) / sr)
    if duration < 0.35:
        return {
            "is_valid": False,
            "status": "too_short",
            "message": "⚠️ Audio recording is too short for analysis.",
            "instructions": "Please sing and sustain a vocal phrase for at least 1-2 seconds (e.g. Sa... Re... Ga...).",
            "metrics": {"duration_sec": round(duration, 2)}
        }

    peak = float(np.max(np.abs(y)))
    rms = float(np.sqrt(np.mean(y ** 2)))

    # Silence / near-silence threshold
    if peak < 0.015 or rms < 0.004:
        return {
            "is_valid": False,
            "status": "silent_audio",
            "message": "⚠️ Recording is silent or too faint to detect singing.",
            "instructions": "Your microphone volume is very low or silent. Please check your mic settings, unmute, sing louder, and stay within 15–30 cm of the mic.",
            "metrics": {
                "rms": round(rms, 5),
                "peak": round(peak, 4),
                "duration_sec": round(duration, 2)
            }
        }

    # Spectral flatness check: genuine singing has prominent harmonic peaks (flatness < 0.35),
    # while white noise, static hiss, or mic friction has flatness > 0.40.
    try:
        flatness = float(np.mean(librosa.feature.spectral_flatness(y=y)))
        if flatness > 0.38:
            return {
                "is_valid": False,
                "status": "unclear_audio",
                "message": "⚠️ Unvoiced noise or background static detected instead of singing voice.",
                "instructions": "Please sing audible sustained vowels (e.g. Aaa, Ooo) or swaras (Sa, Re, Ga) clearly into the microphone.",
                "metrics": {
                    "rms": round(rms, 5),
                    "peak": round(peak, 4),
                    "spectral_flatness": round(flatness, 3),
                    "duration_sec": round(duration, 2)
                }
            }
    except Exception:
        pass

    # Voice energy check using short-time RMS
    try:
        frame_rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=512)[0]
        voiced_energy_ratio = float(np.mean(frame_rms > 0.02))
    except Exception:
        voiced_energy_ratio = 1.0

    if voiced_energy_ratio < 0.08:
        return {
            "is_valid": False,
            "status": "unclear_audio",
            "message": "⚠️ Audio has very low vocal energy or is masked by room silence.",
            "instructions": "Please sing clearly and sustain your notes with steady vocal volume.",
            "metrics": {
                "rms": round(rms, 5),
                "peak": round(peak, 4),
                "voiced_energy_ratio": round(voiced_energy_ratio, 3),
                "duration_sec": round(duration, 2)
            }
        }

    return {
        "is_valid": True,
        "status": "clear_audio",
        "message": "Audio signal is clear and ready for MIR intonation analysis.",
        "instructions": "Vocal input verified.",
        "metrics": {
            "rms": round(rms, 4),
            "peak": round(peak, 4),
            "voiced_energy_ratio": round(voiced_energy_ratio, 3),
            "duration_sec": round(duration, 2)
        }
    }

