import numpy as np

# 22-Shruti Canonical Intervals with Just Intonation ratios and exact cents
CANONICAL_22_SHRUTIS = [
    {"index": 1, "name": "Tivra", "swara": "Sa", "type": "Shuddha", "cents": 0.0, "ratio": "1/1"},
    {"index": 2, "name": "Kumudvati", "swara": "Sa", "type": "Microtone", "cents": 21.5, "ratio": "81/80"},
    {"index": 3, "name": "Manda", "swara": "Re", "type": "Komal", "cents": 70.7, "ratio": "25/24"},
    {"index": 4, "name": "Chandovati", "swara": "Re", "type": "Komal", "cents": 111.7, "ratio": "16/15"},
    {"index": 5, "name": "Dayavati", "swara": "Re", "type": "Shuddha", "cents": 182.4, "ratio": "10/9"},
    {"index": 6, "name": "Ranjani", "swara": "Re", "type": "Shuddha", "cents": 203.9, "ratio": "9/8"},
    {"index": 7, "name": "Raktika", "swara": "Ga", "type": "Komal", "cents": 294.1, "ratio": "32/27"},
    {"index": 8, "name": "Raudri", "swara": "Ga", "type": "Komal", "cents": 315.6, "ratio": "6/5"},
    {"index": 9, "name": "Krodha", "swara": "Ga", "type": "Shuddha", "cents": 386.3, "ratio": "5/4"},
    {"index": 10, "name": "Vajrika", "swara": "Ga", "type": "Shuddha", "cents": 407.8, "ratio": "81/64"},
    {"index": 11, "name": "Prasarini", "swara": "Ma", "type": "Shuddha", "cents": 498.0, "ratio": "4/3"},
    {"index": 12, "name": "Priti", "swara": "Ma", "type": "Tivra", "cents": 519.5, "ratio": "27/20"},
    {"index": 13, "name": "Marjani", "swara": "Ma", "type": "Tivra", "cents": 590.2, "ratio": "45/32"},
    {"index": 14, "name": "Kshiti", "swara": "Ma", "type": "Tivra", "cents": 609.8, "ratio": "64/45"},
    {"index": 15, "name": "Rakta", "swara": "Pa", "type": "Shuddha", "cents": 702.0, "ratio": "3/2"},
    {"index": 16, "name": "Sandipani", "swara": "Pa", "type": "Microtone", "cents": 723.5, "ratio": "243/160"},
    {"index": 17, "name": "Alapini", "swara": "Dha", "type": "Komal", "cents": 792.2, "ratio": "128/81"},
    {"index": 18, "name": "Madanti", "swara": "Dha", "type": "Komal", "cents": 813.7, "ratio": "8/5"},
    {"index": 19, "name": "Rohini", "swara": "Dha", "type": "Shuddha", "cents": 884.4, "ratio": "5/3"},
    {"index": 20, "name": "Ramya", "swara": "Dha", "type": "Shuddha", "cents": 905.9, "ratio": "27/16"},
    {"index": 21, "name": "Ugra", "swara": "Ni", "type": "Komal", "cents": 1017.6, "ratio": "9/5"},
    {"index": 22, "name": "Kshobhini", "swara": "Ni", "type": "Shuddha", "cents": 1088.3, "ratio": "15/8"}
]

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
    Maps a single F0 frequency in Hz to relative Indian Swara & 22-Shruti relative to base Sa tonic.
    """
    if f0_hz <= 0 or tonic_hz <= 0:
        return None

    # Continuous cents distance from tonic Sa
    total_cents = 1200.0 * np.log2(f0_hz / tonic_hz)
    octave_shift = int(np.floor(total_cents / 1200.0))
    norm_cents = total_cents - (octave_shift * 1200.0)

    # Nearest 12-semitone pitch class
    semitones_rounded = int(np.round(norm_cents / 100.0)) % 12
    swara_name, swara_type = SWARA_MAP.get(semitones_rounded, ("Sa", "Shuddha"))

    # Nearest 22-Shruti matching
    best_shruti = CANONICAL_22_SHRUTIS[0]
    min_dist = 99999.0
    for sh in CANONICAL_22_SHRUTIS:
        d = abs(norm_cents - sh["cents"])
        if d < min_dist:
            min_dist = d
            best_shruti = sh

    # Wrap boundary check near 1200c
    if abs(norm_cents - 1200.0) < min_dist:
        best_shruti = CANONICAL_22_SHRUTIS[0]
        min_dist = abs(norm_cents - 1200.0)

    delta_cents = norm_cents - best_shruti["cents"]
    if delta_cents > 600:
        delta_cents -= 1200
    elif delta_cents < -600:
        delta_cents += 1200

    if octave_shift < 0:
        saptak = "Mandra"
    elif octave_shift > 0:
        saptak = "Taar"
    else:
        saptak = "Madhya"

    if swara_type == "Komal":
        full_name = f"Komal {swara_name}"
    elif swara_type == "Tivra":
        full_name = f"Tivra {swara_name}"
    else:
        full_name = f"Shuddha {swara_name}" if swara_name not in ["Sa", "Pa"] else swara_name

    abs_delta = abs(delta_cents)
    if abs_delta <= 12.0:
        intonation = "Exact Sur"
    elif abs_delta <= 25.0:
        intonation = "In Tune (Sur)"
    elif abs_delta <= 50.0:
        intonation = "Mild Deviation"
    else:
        intonation = "Besur"

    return {
        "full_name": full_name,
        "swara": swara_name,
        "type": swara_type,
        "saptak": saptak,
        "shruti_name": best_shruti["name"],
        "shruti_index": best_shruti["index"],
        "ratio_str": best_shruti["ratio"],
        "ideal_cents": best_shruti["cents"],
        "cents_from_sa": round(norm_cents, 1),
        "cents_deviation": round(delta_cents, 1),
        "intonation_status": intonation,
        "f0_hz": round(f0_hz, 1)
    }

def analyze_swara_sequence(times, f0_array, tonic_hz):
    """
    Segments continuous pitch contour into distinct swara events over time.
    Calculates swara distribution, pitch stability, and timestamped errors.
    """
    swara_events = []
    swara_counts = {}
    pitch_deviations = []

    current_event = None

    for t, f in zip(times, f0_array):
        if f <= 0:
            if current_event:
                swara_events.append(current_event)
                current_event = None
            continue

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
                "shruti_name": swara_info["shruti_name"],
                "ratio_str": swara_info["ratio_str"],
                "start_time": round(float(t), 2),
                "end_time": round(float(t), 2),
                "duration": 0.1,
                "deviations": [dev],
                "avg_deviation": dev,
                "status": "stable" if abs(dev) < 20 else ("sharp" if dev > 0 else "flat")
            }
        elif current_event["swara"] == s_name:
            current_event["end_time"] = round(float(t), 2)
            current_event["duration"] = round(current_event["end_time"] - current_event["start_time"], 2)
            current_event["deviations"].append(dev)
            avg_dev = float(np.mean(current_event["deviations"]))
            current_event["avg_deviation"] = round(avg_dev, 1)
            current_event["status"] = "stable" if abs(avg_dev) < 20 else ("sharp" if avg_dev > 0 else "flat")
        else:
            swara_events.append(current_event)
            current_event = {
                "swara": s_name,
                "short": swara_info["swara"],
                "saptak": swara_info["saptak"],
                "shruti_name": swara_info["shruti_name"],
                "ratio_str": swara_info["ratio_str"],
                "start_time": round(float(t), 2),
                "end_time": round(float(t), 2),
                "duration": 0.1,
                "deviations": [dev],
                "avg_deviation": dev,
                "status": "stable" if abs(dev) < 20 else ("sharp" if dev > 0 else "flat")
            }

    if current_event:
        swara_events.append(current_event)

    # Filter out brief micro-artifacts (< 0.08s)
    swara_events = [e for e in swara_events if e["duration"] >= 0.08]

    # Calculate overall pitch accuracy score %
    if pitch_deviations:
        mean_abs_dev = float(np.mean(pitch_deviations))
        overall_accuracy = max(0.0, min(100.0, 100.0 - (mean_abs_dev * 1.4)))
    else:
        overall_accuracy = 85.0

    return {
        "events": swara_events,
        "swara_distribution": swara_counts,
        "overall_accuracy_pct": round(overall_accuracy, 1),
        "total_events": len(swara_events)
    }
