import os
import sys
import json
import urllib.request
import numpy as np

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from audio.pipeline import AudioIntelligencePipeline
from app.ai.pitch_detector import extract_pitch_contour
from app.ai.swara_detector import detect_swaras
from app.ai.shrutis import find_nearest_shruti, get_all_shrutis
from app.ai.raga_recognizer import recognize_raga, RAGA_REGISTRY
from app.utils.audio_processing import preprocess_audio, validate_audio_quality

SAMPLE_AUDIO_DIR = os.path.join(backend_dir, "..", "data", "sample_audio")
os.makedirs(SAMPLE_AUDIO_DIR, exist_ok=True)

INTERNET_TEST_FILES = [
    {
        "name": "yaman_sitar_sample.ogg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/1/14/Sitar_sample_yaman.ogg",
        "ground_truth_raga": "Yaman",
        "tradition": "Hindustani",
        "expected_swaras": ["Sa", "Re", "Ga", "Ma'", "Pa", "Dha", "Ni"]
    },
    {
        "name": "bhairavi_vocal_art_song_1931.ogg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/d/df/Art_song_from_Meerut_Raga_Bhairavi_%281931%29.ogg",
        "ground_truth_raga": "Bhairavi",
        "tradition": "Hindustani",
        "expected_swaras": ["Sa", "re", "ga", "Ma", "Pa", "dha", "ni"]
    }
]

def download_file(url, target_path):
    if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
        print(f"[Cache] Already downloaded: {os.path.basename(target_path)}")
        return True
    print(f"[Download] Fetching internet audio: {url}")
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 SwaraGPT-MIR-Benchmark/1.0 (Indian Classical Musicology Research)"}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp, open(target_path, "wb") as f:
            f.write(resp.read())
        print(f"[Download] Success: {os.path.basename(target_path)} ({os.path.getsize(target_path)} bytes)")
        return True
    except Exception as e:
        print(f"[Download] Error downloading {url}: {e}")
        return False

def run_single_audio_benchmark(meta):
    file_path = os.path.join(SAMPLE_AUDIO_DIR, meta["name"])
    ok = download_file(meta["url"], file_path)
    if not ok:
        print(f"Skipping {meta['name']} due to download failure.")
        return None

    print(f"\n=======================================================")
    print(f"🎶 BENCHMARKING REAL INTERNET RECORDING: {meta['name']}")
    print(f"   Ground Truth Raga: {meta['ground_truth_raga']}")
    print(f"   Expected Swaras: {', '.join(meta['expected_swaras'])}")
    print(f"=======================================================")

    # 1. Preprocessing & Quality Check
    y, sr, dur = preprocess_audio(file_path, target_sr=22050)
    print(f"[Audio] Loaded {dur:.2f}s audio at {sr} Hz (Max amp: {np.max(np.abs(y)):.3f})")
    quality = validate_audio_quality(y, sr)
    print(f"[Quality Gate] Valid: {quality.get('is_valid')}, Status: {quality.get('status')}")

    # 2. Extract Pitch Contour & Tonic Sa (using our upgraded pYIN engine)
    pitch_res = extract_pitch_contour(y, sr=sr)
    tonic = pitch_res.get("tonic", {})
    sa_hz = tonic.get("estimated_sa_hz", 138.59)
    note_name = tonic.get("nearest_western_note", "Unknown")
    print(f"[Tonic Sa] Estimated Sa: {sa_hz} Hz ({note_name}) | Confidence: {tonic.get('confidence')}")

    # 3. Swara Segmentation
    swara_res = detect_swaras(pitch_res["pitch_contour"], sa_hz=sa_hz)
    events = swara_res.get("swara_timeline", [])
    print(f"[Swara Timeline] Detected {len(events)} discrete note events")
    
    unique_swaras = list(dict.fromkeys([e["swara"] for e in events]))
    # Calculate and display Swara prominence distribution
    total_dur = sum(e.get("duration", 0.5) for e in events) + 1e-6
    durs = {}
    for e in events:
        durs[e["swara"]] = durs.get(e["swara"], 0.0) + e.get("duration", 0.5)
    
    sorted_durs = sorted(durs.items(), key=lambda x: x[1], reverse=True)
    prominence_str = ", ".join([f"{sw} ({d/total_dur*100:.1f}%)" for sw, d in sorted_durs[:7]])
    print(f"[Swara Prominence Distribution] {prominence_str}")
    print(f"[Average Swara Accuracy] {swara_res.get('average_swara_accuracy')}%")

    # Sample top 5 note events with 22-Shruti microtones
    print("\n   --- Microtonal 22-Shruti Sample Events ---")
    for e in events[:5]:
        print(f"   Swara: {e['swara']} ({e['shruti_name']} - {e['delta_cents']:+.1f}¢) "
              f"| Start: {e['start_time']}s | Dur: {e['duration']}s | Status: {e['intonation_status']}")

    # 4. Raga Recognition with tradition preference
    raga_candidates = recognize_raga(events, tradition_preference=meta.get("tradition"))
    print("\n[Raga Candidate Predictions]")
    for idx, c in enumerate(raga_candidates[:3], 1):
        print(f"   #{idx}: Raga {c['raga_name']} (Confidence: {int(c['confidence']*100)}%) - Thaat: {c.get('thaat')}")
        if c.get("evidence"):
            print(f"        Evidence: {c['evidence'][0]}")

    top_predicted = raga_candidates[0]["raga_name"] if raga_candidates else "Unknown"
    is_match = (top_predicted.lower() == meta["ground_truth_raga"].lower())
    print(f"\n🎯 RESULT: Ground Truth = {meta['ground_truth_raga']} | Predicted = {top_predicted} | Match = {is_match}")
    print(f"=======================================================\n")

    return {
        "file": meta["name"],
        "ground_truth": meta["ground_truth_raga"],
        "predicted_raga": top_predicted,
        "is_match": is_match,
        "top_confidence": raga_candidates[0]["confidence"] if raga_candidates else 0.0,
        "swara_count": len(events),
        "accuracy_pct": swara_res.get("average_swara_accuracy")
    }

def main():
    results = []
    for meta in INTERNET_TEST_FILES:
        res = run_single_audio_benchmark(meta)
        if res:
            results.append(res)

    print("\n================== SUMMARY BENCHMARK REPORT ==================")
    for r in results:
        status_sym = "✅" if r["is_match"] else "⚠️"
        print(f"{status_sym} File: {r['file']} | Expected: {r['ground_truth']} | Detected: {r['predicted_raga']} ({int(r['top_confidence']*100)}% conf)")
    print("==============================================================")

if __name__ == "__main__":
    main()
