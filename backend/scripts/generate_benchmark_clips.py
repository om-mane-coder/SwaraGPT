import os
import numpy as np
import soundfile as sf

def generate_voice_phrase(
    frequencies,
    durations,
    sr=22050,
    vibrato_rate=5.2,
    vibrato_depth_cents=12.0,
    glide_pairs=None
):
    """
    Synthesizes vocal acoustic melody with natural glottal harmonic richness,
    continuous meends (portamento glides), and natural vocal vibrato.
    """
    total_audio = []
    
    for idx, (freq, dur) in enumerate(zip(frequencies, durations)):
        num_samples = int(sr * dur)
        t = np.linspace(0, dur, num_samples, endpoint=False)
        
        # Check if this note glides to or from another note
        if glide_pairs and idx in glide_pairs:
            start_f, end_f = glide_pairs[idx]
            f_contour = np.linspace(start_f, end_f, num_samples)
        else:
            f_contour = np.full(num_samples, freq)
            
        # Vocal vibrato
        vib_factor = 2.0 ** ((vibrato_depth_cents / 1200.0) * np.sin(2 * np.pi * vibrato_rate * t))
        f_instant = f_contour * vib_factor
        
        phase = 2 * np.pi * np.cumsum(f_instant) / sr
        
        # Human vocal harmonic formants (Fundamental + 2nd, 3rd, 4th, 5th harmonics)
        voice = (
            1.00 * np.sin(phase) +
            0.45 * np.sin(2 * phase) +
            0.22 * np.sin(3 * phase) +
            0.12 * np.sin(4 * phase) +
            0.05 * np.sin(5 * phase)
        )
        
        # Smooth amplitude envelope (gentle attack, sustained core, gentle release)
        attack_len = min(int(0.08 * sr), num_samples // 4)
        release_len = min(int(0.08 * sr), num_samples // 4)
        env = np.ones(num_samples)
        if attack_len > 0:
            env[:attack_len] = 0.5 * (1 - np.cos(np.pi * np.arange(attack_len) / attack_len))
        if release_len > 0:
            env[-release_len:] = 0.5 * (1 + np.cos(np.pi * np.arange(release_len) / release_len))
            
        note_audio = voice * env
        total_audio.append(note_audio)
        
    full_signal = np.concatenate(total_audio).astype(np.float32)
    # Normalize to -1.5 dBFS
    max_amp = np.max(np.abs(full_signal)) + 1e-6
    return (full_signal / max_amp) * 0.85

def make_test_clips():
    out_dirs = [
        r"C:\Users\OM\.gemini\antigravity-ide\scratch\swara-gpt\frontend\public\test_audio",
        r"C:\Users\OM\.gemini\antigravity-ide\scratch\swara-gpt\test_clips"
    ]
    for d in out_dirs:
        os.makedirs(d, exist_ok=True)
        
    sr = 22050
    
    # ─── 1. Ustad Sultan Khan: Albela Sajan Aayo Ri (Ahir Bhairav, Sa = C#3 = 138.59 Hz)
    tonic_ahir = 138.59
    # Ahir Bhairav notes: Sa, re (16/15), Ga (5/4), Ma (4/3), Pa (3/2), Dha (5/3), ni (9/5), Sa' (2.0)
    ahir_swaras = [
        tonic_ahir * 1.0,      # Sa
        tonic_ahir * (16/15),  # Komal Re
        tonic_ahir * (5/4),    # Shuddha Ga
        tonic_ahir * (4/3),    # Shuddha Ma
        tonic_ahir * (3/2),    # Pancham
        tonic_ahir * (5/4),    # Ga (glide to re)
        tonic_ahir * (16/15),  # re
        tonic_ahir * 1.0       # Sa (cadence)
    ]
    ahir_durs = [0.65, 0.65, 0.70, 0.65, 0.80, 0.60, 0.60, 1.20]
    glides_ahir = {
        5: (tonic_ahir * (5/4), tonic_ahir * (16/15)), # Ga -> re meend
        6: (tonic_ahir * (16/15), tonic_ahir * 1.0)    # re -> Sa meend
    }
    audio_ahir = generate_voice_phrase(ahir_swaras, ahir_durs, sr=sr, glide_pairs=glides_ahir)
    
    # ─── 2. Pt. Bhimsen Joshi: Ketaki Gulab Juhi (Basant, Sa = D3 = 146.83 Hz)
    tonic_basant = 146.83
    # Basant notes: Sa, Ga (5/4), Tivra Ma (45/32), Komal Dha (8/5), Shuddha Ni (15/8), Sa' (2.0)
    basant_swaras = [
        tonic_basant * 1.0,      # Sa
        tonic_basant * (5/4),    # Ga
        tonic_basant * (45/32),  # Tivra Ma'
        tonic_basant * (8/5),    # Komal Dha
        tonic_basant * (15/8),   # Shuddha Ni
        tonic_basant * 2.0,      # Taar Sa
        tonic_basant * (45/32),  # Tivra Ma'
        tonic_basant * (5/4)     # Ga (Basant signature)
    ]
    basant_durs = [0.55, 0.55, 0.60, 0.60, 0.65, 0.90, 0.60, 1.10]
    glides_basant = {
        6: (tonic_basant * (45/32), tonic_basant * (5/4)) # Tivra Ma' -> Ga meend
    }
    audio_basant = generate_voice_phrase(basant_swaras, basant_durs, sr=sr, glide_pairs=glides_basant)
    
    # ─── 3. Mohammed Rafi: Madhuban Mein Radhika Nache Re (Hamir, Sa = C#3 = 138.59 Hz)
    tonic_hamir = 138.59
    # Hamir notes: Sa, Ga, Ma, Pa, Dha, Ni, Sa', Pa -> Dha -> Pa -> Ga
    hamir_swaras = [
        tonic_hamir * 1.0,     # Sa
        tonic_hamir * (5/4),   # Ga
        tonic_hamir * (4/3),   # Shuddha Ma
        tonic_hamir * (3/2),   # Pa
        tonic_hamir * (5/3),   # Dha
        tonic_hamir * (15/8),  # Ni
        tonic_hamir * 2.0,     # Taar Sa
        tonic_hamir * (3/2),   # Pa
        tonic_hamir * (5/4)    # Ga
    ]
    hamir_durs = [0.50, 0.50, 0.50, 0.60, 0.55, 0.60, 0.85, 0.50, 1.0]
    audio_hamir = generate_voice_phrase(hamir_swaras, hamir_durs, sr=sr)
    
    # ─── 4. Lata Mangeshkar: Payoji Maine Ram Ratan Dhan Payo (Bhoopali, Sa = A3 = 220.00 Hz)
    tonic_bhoop = 220.00
    # Bhoopali pentatonic: Sa, Re, Ga, Pa, Dha, Sa'
    bhoop_swaras = [
        tonic_bhoop * 1.0,     # Sa
        tonic_bhoop * (9/8),   # Re (Chatushruti)
        tonic_bhoop * (5/4),   # Ga (Krodha pure 5/4)
        tonic_bhoop * (3/2),   # Pa
        tonic_bhoop * (5/3),   # Dha
        tonic_bhoop * 2.0,     # Taar Sa
        tonic_bhoop * (5/3),   # Dha
        tonic_bhoop * (3/2),   # Pa
        tonic_bhoop * (5/4)    # Ga
    ]
    bhoop_durs = [0.55, 0.55, 0.70, 0.65, 0.60, 0.95, 0.55, 0.60, 1.20]
    glides_bhoop = {
        2: (tonic_bhoop * (5/4), tonic_bhoop * (3/2)), # Ga -> Pa meend
        5: (tonic_bhoop * 2.0, tonic_bhoop * (5/3))    # Sa' -> Dha meend
    }
    audio_bhoop = generate_voice_phrase(bhoop_swaras, bhoop_durs, sr=sr, glide_pairs=glides_bhoop)
    
    # ─── 5. Silent Audio (for Quality Gate Testing)
    audio_silent = np.zeros(int(sr * 2.5), dtype=np.float32)
    
    clips = {
        "albela_sajan_ustad_sultan_khan.wav": audio_ahir,
        "ketaki_gulab_bhimsen_joshi.wav": audio_basant,
        "madhuban_mein_radhika_mohammed_rafi.wav": audio_hamir,
        "payoji_maine_lata_mangeshkar.wav": audio_bhoop,
        "silent_test_audio.wav": audio_silent
    }
    
    for filename, audio in clips.items():
        for d in out_dirs:
            filepath = os.path.join(d, filename)
            sf.write(filepath, audio, sr, subtype='PCM_16')
            print(f"Created: {filepath} ({len(audio)/sr:.2f}s, {os.path.getsize(filepath)} bytes)")

if __name__ == "__main__":
    make_test_clips()
    print("\nAll benchmark test audio clips generated successfully!")
