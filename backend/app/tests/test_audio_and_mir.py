"""
SwaraGPT - Comprehensive Audio, MIR & Mathematical Formulation Unit Tests
Tests fundamental frequency tracking, cent calculations relative to Adhara Shadja,
22-Shruti mapping, tolerance thresholds, and synthetic audio signals.
"""
import pytest
import numpy as np
from app.ai.shrutis import find_nearest_shruti, get_all_shrutis
from app.ai.tonic_detector import estimate_tonic_from_f0, freq_to_note_name
from app.ai.swara_detector import detect_swaras
from app.ai.ornament_detector import detect_ornamentations
from app.ai.raga_recognizer import recognize_raga
from app.ai.feedback_engine import generate_structured_feedback
from app.rag.retriever import retriever
from app.utils.synthetic_audio import generate_swara_tone, generate_alankar_audio


def test_22_shrutis_catalog():
    """Verify all 22 shrutis are properly indexed and ratios calculated."""
    shrutis = get_all_shrutis()
    assert len(shrutis) == 22
    assert shrutis[0]["name"] == "Tivra"  # Sa
    assert shrutis[0]["cents"] == 0.0
    assert shrutis[14]["name"] == "Rakta" # Pa (Pancham)
    assert abs(shrutis[14]["cents"] - 702.0) < 1.0


def test_cent_calculation_and_tolerance_thresholds():
    """
    Test cent formula: C = 1200 * log2(f / fSa)
    Sur <= 25 cents, Mild <= 50 cents, Besur > 50 cents.
    """
    tonic_sa = 130.81 # C3

    # Exactly in tune Sa (0 cents)
    res_sa = find_nearest_shruti(0.0)
    assert res_sa["swara"] == "Sa"
    assert res_sa["is_in_tune"] is True
    assert res_sa["intonation_status"] == "In Tune (Sur)"

    # Mild deviation (+32 cents from Sa)
    res_mild = find_nearest_shruti(32.0, target_swara="Sa")
    assert res_mild["is_in_tune"] is False
    assert res_mild["intonation_status"] == "Mild Deviation"

    # Significant deviation (+65 cents from Sa)
    res_besur = find_nearest_shruti(65.0, target_swara="Sa")
    assert res_besur["is_in_tune"] is False
    assert res_besur["intonation_status"] == "Besur (Significant Deviation)"

    # Pure Pancham (3/2 ratio = 702 cents)
    pa_freq = tonic_sa * 1.5
    pa_cents = 1200.0 * np.log2(pa_freq / tonic_sa)
    res_pa = find_nearest_shruti(pa_cents)
    assert res_pa["swara"] == "Pa"
    assert res_pa["is_in_tune"] is True


def test_synthetic_sine_audio_generation():
    """Test deterministic pure sine wave generator for vocal notes."""
    tonic_sa = 130.81
    sa_wave = generate_swara_tone("Sa", tonic_hz=tonic_sa, duration_sec=0.5, sample_rate=22050)
    assert len(sa_wave) == 11025
    assert np.max(np.abs(sa_wave)) <= 1.0
    assert np.max(np.abs(sa_wave)) > 0.5

    # Generate multi-note Alankar audio
    alankar_wave, sr = generate_alankar_audio(["Sa", "Re", "Ga", "Ma", "Pa"], tonic_hz=tonic_sa, note_duration=0.2)
    assert sr == 22050
    assert len(alankar_wave) == 22050 # 5 notes * 0.2s * 22050 = 22050 samples


def test_tonic_estimation():
    """Test automatic Sa tonic estimation from long-term pitch distribution."""
    # Synthetic array centered on 130.8 Hz
    pitches = np.random.normal(130.81, 1.5, 300)
    tonic_res = estimate_tonic_from_f0(pitches)
    assert abs(tonic_res["estimated_sa_hz"] - 130.81) < 8.0
    assert tonic_res["nearest_western_note"] == "C3"

    # Manual user override
    user_res = estimate_tonic_from_f0(pitches, user_specified_hz=233.08)
    assert user_res["estimated_sa_hz"] == 233.08
    assert user_res["source"] == "user_specified"


def test_raga_recognition_and_pakad():
    """Test explainable raga recognition ranking."""
    # Synthetic Yaman swara sequence (Ni, Re, Ga, Ma', Dha, Ni, Sa')
    yaman_swaras = [
        {"swara": "Ni", "duration": 0.8},
        {"swara": "Re", "duration": 0.7},
        {"swara": "Ga", "duration": 1.2}, # Vadi
        {"swara": "Ma'", "duration": 0.9},
        {"swara": "Dha", "duration": 0.6},
        {"swara": "Ni", "duration": 1.1}, # Samvadi
        {"swara": "Sa'", "duration": 0.8},
    ]

    candidates = recognize_raga(yaman_swaras)
    assert len(candidates) > 0
    top_candidate = candidates[0]
    assert top_candidate["raga_name"] == "Yaman"
    assert top_candidate["confidence"] > 0.65


def test_feedback_engine_weighted_scoring():
    """Verify weighted scoring formula matches Section 62 of specification."""
    pitch_data = {
        "pitch_stability": 80.0,
        "shruti_precision": 85.0,
        "mean_shruti_deviation_cents": 5.2,
        "tonic": {"estimated_sa_hz": 130.81, "nearest_western_note": "C3"}
    }
    swara_data = {
        "average_swara_accuracy": 82.0,
        "strong_swaras": ["Sa", "Pa"],
        "weak_swaras": ["Ga"]
    }
    raga_data = [{"raga_name": "Yaman", "confidence": 0.90}]

    feedback = generate_structured_feedback(pitch_data, swara_data, raga_data)
    scores = feedback["score_breakdown"]
    
    # Weights: Pitch 35%, Swara 25%, Shruti 15%, Raga 15%, Tonic 10%
    expected = (80.0 * 0.35) + (82.0 * 0.25) + (85.0 * 0.15) + (90.0 * 0.15) + (80.0 * 0.10)
    assert abs(scores["overall_score"] - round(expected, 1)) <= 0.2
    assert "Good singing" in feedback["feedback_text"] or "Shabash" in feedback["feedback_text"]


def test_rag_musicology_retriever_and_anti_hallucination():
    """Test grounded document retrieval and anti-hallucination fallback."""
    # Known inquiry
    docs, has_context = retriever.retrieve("What is Raga Yaman thaat and pakad?")
    assert has_context is True
    assert len(docs) > 0
    assert any("Yaman" in d["title"] or "Kalyan" in d["content"] for d in docs)

    # Obscure or undocumented inquiry
    docs_unknown, has_unknown_ctx = retriever.retrieve("Give me an undocumented alien quantum raga rule.")
    # The retriever should signal lack of confident match
    assert has_unknown_ctx is False or docs_unknown[0]["relevance_score"] < 0.25
