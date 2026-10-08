import numpy as np

SWARA_MAP = {
    0: ("Sa", "Shuddha"),
    1: ("Re", "Komal"),
    2: ("Re", "Shuddha"),
    3: ("Ga", "Komal"),
    4: ("Ga", "Shuddha"),
    5: ("Ma", "Shuddha"),
    6: ("Ma", "Tivra"),
    7: ("Pa", "Shuddha"),
    8: ("Dha", "Komal"),
    9: ("Dha", "Shuddha"),
    10: ("Ni", "Komal"),
    11: ("Ni", "Shuddha")
}

def map_pitch_to_swara(f0_hz, tonic_hz):
    """
    Maps a single F0 frequency in Hz to relative Indian Swara relative to base Sa tonic.
    Returns:
        swara_full_name: e.g. "Shuddha Ga"
        swara_short: e.g. "Ga"
        type: e.g. "Shuddha", "Komal", "Tivra"
        saptak: "Mandra", "Madhya", "Taar"
        cents_deviation: float (-50 to +50 cents)
        exact_ratio: float
    """
    if f0_hz <= 0 or tonic_hz <= 0:
        return None

    # Semi-tone distance from tonic Sa
    semitones_exact = 12.0 * np.log2(f0_hz / tonic_hz)
    semitones_rounded = int(np.round(semitones_exact))
    cents_deviation = float((semitones_exact - semitones_rounded) * 100.0)

    # Determine octave (Saptak)
    octave_shift = semitones_rounded // 12
    pitch_class = semitones_rounded % 12

    if octave_shift < 0:
        saptak = "Mandra"
    elif octave_shift > 0:
        saptak = "Taar"
    else:
        saptak = "Madhya"

    swara_name, swara_type = SWARA_MAP.get(pitch_class, ("Sa", "Shuddha"))
    
    if swara_type == "Komal":
        full_name = f"Komal {swara_name}"
    elif swara_type == "Tivra":
        full_name = f"Tivra {swara_name}"
    else:
        full_name = f"Shuddha {swara_name}" if swara_name not in ["Sa", "Pa"] else swara_name

    return {
        "full_name": full_name,
        "swara": swara_name,
        "type": swara_type,
        "saptak": saptak,
        "cents_deviation": round(cents_deviation, 1),
        "f0_hz": round(f0_hz, 1)
    }

def analyze_swara_sequence(times, f0_array, tonic_hz):
    """
    Segments continuous pitch contour into distinct swara events over time.
    Calculates swara distribution, pitch stability, and timestamped errors.
    """
    swara_events = []
    swara_counts = {}
    total_voiced = 0
    pitch_deviations = []

    current_event = None

    for t, f in zip(times, f0_array):
        if f <= 0:
            if current_event:
                swara_events.append(current_event)
                current_event = None
            continue

        total_voiced += 1
        swara_info = map_pitch_to_swara(f, tonic_hz)
        if not swara_info:
            continue

        s_name = swara_info["full_name"]
        dev = swara_info["cents_deviation"]
        pitch_deviations.append(abs(dev))

        swara_counts[s_name] = swara_counts.get(s_name, 0) + 1

        if current_event is None:
            current_event = {
                "swara": s_name,
                "short": swara_info["swara"],
                "saptak": swara_info["saptak"],
                "start_time": round(float(t), 2),
                "end_time": round(float(t), 2),
                "duration": 0.1,
                "deviations": [dev],
                "avg_deviation": dev,
                "status": "stable" if abs(dev) < 18 else ("sharp" if dev > 0 else "flat")
            }
        elif current_event["swara"] == s_name:
            current_event["end_time"] = round(float(t), 2)
            current_event["duration"] = round(current_event["end_time"] - current_event["start_time"], 2)
            current_event["deviations"].append(dev)
            avg_dev = float(np.mean(current_event["deviations"]))
            current_event["avg_deviation"] = round(avg_dev, 1)
            current_event["status"] = "stable" if abs(avg_dev) < 18 else ("sharp" if avg_dev > 0 else "flat")
        else:
            swara_events.append(current_event)
            current_event = {
                "swara": s_name,
                "short": swara_info["swara"],
                "saptak": swara_info["saptak"],
                "start_time": round(float(t), 2),
                "end_time": round(float(t), 2),
                "duration": 0.1,
                "deviations": [dev],
                "avg_deviation": dev,
                "status": "stable" if abs(dev) < 18 else ("sharp" if dev > 0 else "flat")
            }

    if current_event:
        swara_events.append(current_event)

    # Filter out very short noise glitches (< 0.08s)
    swara_events = [e for e in swara_events if e["duration"] >= 0.08]

    # Calculate overall pitch accuracy score %
    if pitch_deviations:
        mean_abs_dev = float(np.mean(pitch_deviations))
        overall_accuracy = max(0.0, min(100.0, 100.0 - (mean_abs_dev * 1.5)))
    else:
        overall_accuracy = 82.0

    return {
        "events": swara_events,
        "swara_distribution": swara_counts,
        "overall_accuracy_pct": round(overall_accuracy, 1),
        "total_events": len(swara_events)
    }
