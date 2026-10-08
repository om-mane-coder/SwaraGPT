"""
SwaraGPT - The 22 Shrutis (श्रुति) Knowledge Base & Microtonal Calculator
Defines the canonical 22 microtonal intervals of Indian Classical Music based on
Bharata's Natya Shastra and Sarangadeva's Sangeeta Ratnakara.
"""
from typing import Dict, Any, List, Optional
import numpy as np

SHRUTIS: List[Dict[str, Any]] = [
    {
        "index": 1,
        "name": "Tivra",
        "sanskrit": "तीव्रा",
        "swara": "Sa",
        "swara_type": "Shadja (Achal)",
        "ratio_str": "1/1",
        "ratio": 1.0,
        "cents": 0.0,
        "rasa": "Peaceful, meditative (Shanta)",
        "description": "The fundamental cosmic tonic, unchanging foundation of all melody."
    },
    {
        "index": 2,
        "name": "Kumudvati",
        "sanskrit": "कुमुद्वती",
        "swara": "Sa+",
        "swara_type": "Microtone Sa",
        "ratio_str": "81/80",
        "ratio": 81.0 / 80.0,
        "cents": 21.5,
        "rasa": "Delicate, yearning",
        "description": "Syntonic comma elevation above Sa, heard in meditative alap glides."
    },
    {
        "index": 3,
        "name": "Manda",
        "sanskrit": "मन्दा",
        "swara": "re-",
        "swara_type": "Ati-Komal Re",
        "ratio_str": "25/24",
        "ratio": 25.0 / 24.0,
        "cents": 70.7,
        "rasa": "Solemn, dawn twilight (Sandhi Prakash)",
        "description": "Extremely low, trembling Komal Rishabh characteristic of dawn Sandhiprakash ragas."
    },
    {
        "index": 4,
        "name": "Chandovati",
        "sanskrit": "छन्दोवती",
        "swara": "re",
        "swara_type": "Komal Re",
        "ratio_str": "16/15",
        "ratio": 16.0 / 15.0,
        "cents": 111.7,
        "rasa": "Pathos, devotion (Karuna, Bhakti)",
        "description": "Standard Komal Rishabh with deep devotional resonance."
    },
    {
        "index": 5,
        "name": "Dayavati",
        "sanskrit": "दयावती",
        "swara": "Re-",
        "swara_type": "Trishruti Re (Laghu)",
        "ratio_str": "10/9",
        "ratio": 10.0 / 9.0,
        "cents": 182.4,
        "rasa": "Soft compassion",
        "description": "Minor whole tone Rishabh, slightly softer than standard Shuddha Re."
    },
    {
        "index": 6,
        "name": "Ranjani",
        "sanskrit": "रञ्जनी",
        "swara": "Re",
        "swara_type": "Chatushruti Re (Shuddha)",
        "ratio_str": "9/8",
        "ratio": 9.0 / 8.0,
        "cents": 203.9,
        "rasa": "Delight, heroic (Veera)",
        "description": "The authoritative Shuddha Rishabh of Yaman, Bilawal, and Kalyan."
    },
    {
        "index": 7,
        "name": "Raktika",
        "sanskrit": "रक्तिका",
        "swara": "ga-",
        "swara_type": "Ati-Komal Ga",
        "ratio_str": "32/27",
        "ratio": 32.0 / 27.0,
        "cents": 294.1,
        "rasa": "Grave melancholy",
        "description": "Darbari Kanada's slow oscillating, deep Komal Gandhar."
    },
    {
        "index": 8,
        "name": "Raudri",
        "sanskrit": "रौद्री",
        "swara": "ga",
        "swara_type": "Komal Ga",
        "ratio_str": "6/5",
        "ratio": 6.0 / 5.0,
        "cents": 315.6,
        "rasa": "Tender romantic longing (Sringara)",
        "description": "Classic Sadharana Gandhar found in Kafi and Bageshri."
    },
    {
        "index": 9,
        "name": "Krodha",
        "sanskrit": "क्रोधा",
        "swara": "Ga",
        "swara_type": "Shuddha Ga (Antara)",
        "ratio_str": "5/4",
        "ratio": 5.0 / 4.0,
        "cents": 386.3,
        "rasa": "Joyous illumination, warmth",
        "description": "Natural harmonic major third, central pillar of Raga Yaman and Bhupali."
    },
    {
        "index": 10,
        "name": "Vajrika",
        "sanskrit": "वज्रिका",
        "swara": "Ga+",
        "swara_type": "Tivra Ga",
        "ratio_str": "81/64",
        "ratio": 81.0 / 64.0,
        "cents": 407.8,
        "rasa": "Brilliant intensity",
        "description": "Pythagorean ditone Ga, piercing and resolute in Shankara."
    },
    {
        "index": 11,
        "name": "Prasarini",
        "sanskrit": "प्रसारिणी",
        "swara": "Ma",
        "swara_type": "Shuddha Ma",
        "ratio_str": "4/3",
        "ratio": 4.0 / 3.0,
        "cents": 498.0,
        "rasa": "Maternal tranquility, rest",
        "description": "The perfect fourth, stable anchor in Malkauns and Bhairavi."
    },
    {
        "index": 12,
        "name": "Priti",
        "sanskrit": "प्रीति",
        "swara": "Ma+",
        "swara_type": "Tivra Ma (Lower)",
        "ratio_str": "27/20",
        "ratio": 27.0 / 20.0,
        "cents": 519.5,
        "rasa": "Affectionate longing",
        "description": "Gentle elevation above Shuddha Ma, featured in Lalit."
    },
    {
        "index": 13,
        "name": "Marjani",
        "sanskrit": "मार्जनी",
        "swara": "ma'",
        "swara_type": "Tivra Ma (Prati)",
        "ratio_str": "45/32",
        "ratio": 45.0 / 32.0,
        "cents": 590.2,
        "rasa": "Twilight wonder (Adbhut)",
        "description": "The defining sharp fourth of Raga Yaman and Kalyan."
    },
    {
        "index": 14,
        "name": "Kshiti",
        "sanskrit": "क्षिति",
        "swara": "ma''",
        "swara_type": "Tivratara Ma",
        "ratio_str": "64/45",
        "ratio": 64.0 / 45.0,
        "cents": 609.8,
        "rasa": "Spiritual urgency",
        "description": "High tritone in Todi and Multani approaching Pancham."
    },
    {
        "index": 15,
        "name": "Rakta",
        "sanskrit": "रक्ता",
        "swara": "Pa",
        "swara_type": "Pancham (Achal)",
        "ratio_str": "3/2",
        "ratio": 3.0 / 2.0,
        "cents": 702.0,
        "rasa": "Universal stability, divine poise",
        "description": "The immutable pure fifth, cosmic counterpart to Shadja."
    },
    {
        "index": 16,
        "name": "Sandipani",
        "sanskrit": "संदीपनी",
        "swara": "Pa+",
        "swara_type": "Microtone Pa",
        "ratio_str": "243/160",
        "ratio": 243.0 / 160.0,
        "cents": 723.5,
        "rasa": "Kindled passion",
        "description": "Subtle elevation above Pa in expressive Dhrupad improvisations."
    },
    {
        "index": 17,
        "name": "Alapini",
        "sanskrit": "आलापिनी",
        "swara": "dha-",
        "swara_type": "Ati-Komal Dha",
        "ratio_str": "128/81",
        "ratio": 128.0 / 81.0,
        "cents": 792.2,
        "rasa": "Nocturnal gravity",
        "description": "Deep, solemn Komal Dhaivat of Darbari and Asavari."
    },
    {
        "index": 18,
        "name": "Madanti",
        "sanskrit": "मदन्ती",
        "swara": "dha",
        "swara_type": "Komal Dha",
        "ratio_str": "8/5",
        "ratio": 8.0 / 5.0,
        "cents": 813.7,
        "rasa": "Devotion, humility",
        "description": "Standard Komal Dhaivat, oscillating in Bhairav and resting in Malkauns."
    },
    {
        "index": 19,
        "name": "Rohini",
        "sanskrit": "रोहिणी",
        "swara": "Dha",
        "swara_type": "Chatushruti Dha (Shuddha)",
        "ratio_str": "5/3",
        "ratio": 5.0 / 3.0,
        "cents": 884.4,
        "rasa": "Auspicious grandeur",
        "description": "The pure major sixth of Yaman, Bilawal, and Bhupali."
    },
    {
        "index": 20,
        "name": "Ramya",
        "sanskrit": "रम्यास",
        "swara": "Dha+",
        "swara_type": "Tivra Dha",
        "ratio_str": "27/16",
        "ratio": 27.0 / 16.0,
        "cents": 905.9,
        "rasa": "Enchantment",
        "description": "Pythagorean sixth in Deshkar and Marwa."
    },
    {
        "index": 21,
        "name": "Ugra",
        "sanskrit": "उग्रा",
        "swara": "ni",
        "swara_type": "Komal Ni",
        "ratio_str": "9/5",
        "ratio": 9.0 / 5.0,
        "cents": 1017.6,
        "rasa": "Soulful yearning, surrender",
        "description": "Tender minor seventh of Kafi, Khamaj, and Bageshri."
    },
    {
        "index": 22,
        "name": "Kshobhini",
        "sanskrit": "क्षोभिणी",
        "swara": "Ni",
        "swara_type": "Shuddha Ni (Kakali)",
        "ratio_str": "15/8",
        "ratio": 15.0 / 8.0,
        "cents": 1088.3,
        "rasa": "Ecstatic surrender to Taar Sa",
        "description": "Leading seventh tone of Yaman, Bilawal, and Bhairav leading into upper Sa."
    }
]


def find_nearest_shruti(cents_from_sa: float, target_swara: Optional[str] = None) -> Dict[str, Any]:
    """
    Find nearest canonical shruti for a cent value (normalized to 0 - 1200 cents).
    If target_swara is specified, evaluates intonation deviation relative to that swara.
    """
    # Octave wrap
    octave_offset = int(np.floor(cents_from_sa / 1200.0))
    normalized_cents = cents_from_sa - (octave_offset * 1200.0)

    # Filter candidate shrutis if target_swara requested
    pool = SHRUTIS
    if target_swara:
        filtered = [s for s in SHRUTIS if target_swara.lower() == s["swara"].lower()]
        if filtered:
            pool = filtered

    best_shruti = pool[0]
    min_dist = 999999.0

    for s in pool:
        dist = abs(normalized_cents - s["cents"])
        if dist < min_dist:
            min_dist = dist
            best_shruti = s

    # Check boundary wrap at 1200 (Taar Sa)
    if not target_swara or "sa" in target_swara.lower():
        wrap_dist = abs(normalized_cents - 1200.0)
        if wrap_dist < min_dist:
            min_dist = wrap_dist
            best_shruti = SHRUTIS[0]

    delta = normalized_cents - best_shruti["cents"]
    if delta > 600:
        delta -= 1200
    elif delta < -600:
        delta += 1200

    # Section 16 & 53 Intonation Classification
    abs_delta = abs(delta)
    if abs_delta <= 25.0:
        status = "In Tune (Sur)"
        is_in_tune = True
    elif abs_delta <= 50.0:
        status = "Mild Deviation"
        is_in_tune = False
    else:
        status = "Besur (Significant Deviation)"
        is_in_tune = False

    return {
        "shruti_index": best_shruti["index"],
        "shruti_name": best_shruti["name"],
        "sanskrit": best_shruti["sanskrit"],
        "swara": best_shruti["swara"],
        "swara_type": best_shruti["swara_type"],
        "ideal_cents": best_shruti["cents"],
        "actual_cents": round(normalized_cents, 1),
        "delta_cents": round(delta, 1),
        "is_in_tune": is_in_tune,
        "intonation_status": status,
        "rasa": best_shruti["rasa"],
    }


def get_all_shrutis() -> List[Dict[str, Any]]:
    """Return all 22 Shrutis with theoretical ratios and cent values."""
    return SHRUTIS
