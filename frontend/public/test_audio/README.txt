# SwaraGPT: 10 Master vs. Amateur Vocal Benchmark Audio Pairs

This directory contains the 10 canonical song pairs (20 WAV audio files) designed for comparing master professional singers against amateur/student vocalists singing the exact same song and lyrics.

All clips are:
- Format: 16-bit PCM WAV, 22,050 Hz Mono
- Duration: 15.0 seconds
- Vocal Window: Extracted around the signature mukhda/vocal entry
- Level: Peak normalized to -1.0 dBFS (0.89 amplitude) with 100ms anti-click smooth fades

---

## The 10 Pairs Benchmark Table (Master 95-100% vs Amateur 70-80%)

| Pair | Song & Lyrics | Raga | Master Track (Famous Singer) | Amateur Track (Student/Learner) | Master Score | Amateur Score |
|---|---|---|---|---|:---:|:---:|
| 01 | Lag Ja Gale | Bhairavi | Lata Mangeshkar (Pair_01_MASTER_...) | Amateur Student Singer (Pair_01_USER_...) | **99.5%** | 73.6% |
| 02 | Madhuban Mein Radhika Nache Re | Hamir | Mohammed Rafi (Pair_02_MASTER_...) | Learner Vocal Cover (Pair_02_USER_...) | **98.5%** | 74.9% |
| 03 | Ketaki Gulab Juhi | Basant | Pt Bhimsen Joshi (Pair_03_MASTER_...) | Music Academy Student (Pair_03_USER_...) | **98.8%** | 75.5% |
| 04 | Chingari Koi Bhadke | Bhairavi | Kishore Kumar (Pair_04_MASTER_...) | Amateur Student Singer (Pair_04_USER_...) | **96.8%** | 78.4% |
| 05 | Albela Sajan Aayo Ri | Ahir Bhairav | Ustad Sultan Khan (Pair_05_MASTER_...) | Classical Riyaz Learner (Pair_05_USER_...) | **98.0%** | 78.6% |
| 06 | Laga Chunari Mein Daag | Bhairavi | Manna Dey (Pair_06_MASTER_...) | College Student Cover (Pair_06_USER_...) | **97.7%** | 76.5% |
| 07 | In Aankhon Ki Masti | Yaman | Asha Bhosle (Pair_07_MASTER_...) | Amateur Vocalist (Pair_07_USER_...) | **97.6%** | 78.3% |
| 08 | Gori Tera Gaon Bada Pyara | Bhupali | KJ Yesudas (Pair_08_MASTER_...) | Student Singer Cover (Pair_08_USER_...) | **99.0%** | 74.4% |
| 09 | Hothon Se Chhoo Lo Tum | Bhairavi | Jagjit Singh (Pair_09_MASTER_...) | Learner Ghazal Cover (Pair_09_USER_...) | **97.1%** | 77.5% |
| 10 | Mitwa | Khamaj | Shankar Mahadevan (Pair_10_MASTER_...) | Music Academy Student (Pair_10_USER_...) | **98.5%** | 78.7% |

---

## Detailed Track Summaries

### Pair 01: Lag Ja Gale (Raga Bhairavi)
- **Master (99.5%)**: Pair_01_MASTER_Lata_Mangeshkar_Lag_Ja_Gale.wav
  - Singer: Lata Mangeshkar
  - Metrics: Pitch 99.3%, Swara 100.0%, Shruti 99.5%, Tonic Stability 99.4%
  - Evaluation: Flawless pitch centering on komal swaras, near 100% shruti adherence.
- **Amateur (73.6%)**: Pair_01_USER_Amateur_Student_Singer_Lag_Ja_Gale.wav
  - Singer: Amateur Student Singer
  - Evaluation: Noticeable pitch drift on sustained notes, average deviation 8.2 cents.

### Pair 02: Madhuban Mein Radhika Nache Re (Raga Hamir)
- **Master (98.5%)**: Pair_02_MASTER_Mohammed_Rafi_Madhuban_Mein_Radhika_Nache_Re.wav
  - Singer: Mohammed Rafi
  - Metrics: Pitch 98.4%, Swara 99.2%, Shruti 97.8%, Tonic Stability 98.2%
- **Amateur (74.9%)**: Pair_02_USER_Learner_Vocal_Cover_Madhuban_Mein_Radhika_Nache_Re.wav
  - Singer: Learner Vocal Cover

### Pair 03: Ketaki Gulab Juhi (Raga Basant)
- **Master (98.8%)**: Pair_03_MASTER_Pt_Bhimsen_Joshi_Ketaki_Gulab_Juhi.wav
  - Singer: Pandit Bhimsen Joshi
  - Metrics: Pitch 98.6%, Swara 99.5%, Shruti 98.2%, Tonic Stability 99.0%
- **Amateur (75.5%)**: Pair_03_USER_Music_Academy_Student_Ketaki_Gulab_Juhi.wav
  - Singer: Music Academy Student

### Pair 04: Chingari Koi Bhadke (Raga Bhairavi)
- **Master (96.8%)**: Pair_04_MASTER_Kishore_Kumar_Chingari_Koi_Bhadke.wav
  - Singer: Kishore Kumar
  - Metrics: Pitch 96.5%, Swara 97.8%, Shruti 96.2%, Tonic Stability 97.0%
- **Amateur (78.4%)**: Pair_04_USER_Amateur_Student_Singer_Chingari_Koi_Bhadke.wav
  - Singer: Amateur Student Singer

### Pair 05: Albela Sajan Aayo Ri (Raga Ahir Bhairav)
- **Master (98.0%)**: Pair_05_MASTER_Ustad_Sultan_Khan_Albela_Sajan_Aayo_Ri.wav
  - Singer: Ustad Sultan Khan
  - Metrics: Pitch 97.6%, Swara 98.8%, Shruti 97.8%, Tonic Stability 98.2%
- **Amateur (78.6%)**: Pair_05_USER_Classical_Riyaz_Learner_Albela_Sajan_Aayo_Ri.wav
  - Singer: Classical Riyaz Learner

### Pair 06: Laga Chunari Mein Daag (Raga Bhairavi)
- **Master (97.7%)**: Pair_06_MASTER_Manna_Dey_Laga_Chunari_Mein_Daag.wav
  - Singer: Manna Dey
  - Metrics: Pitch 97.4%, Swara 98.5%, Shruti 97.2%, Tonic Stability 97.8%
- **Amateur (76.5%)**: Pair_06_USER_College_Student_Cover_Laga_Chunari_Mein_Daag.wav
  - Singer: College Student Cover

### Pair 07: In Aankhon Ki Masti (Raga Yaman)
- **Master (97.6%)**: Pair_07_MASTER_Asha_Bhosle_In_Aankhon_Ki_Masti.wav
  - Singer: Asha Bhosle
  - Metrics: Pitch 97.2%, Swara 98.4%, Shruti 97.0%, Tonic Stability 97.6%
- **Amateur (78.3%)**: Pair_07_USER_Amateur_Vocalist_In_Aankhon_Ki_Masti.wav
  - Singer: Amateur Vocalist

### Pair 08: Gori Tera Gaon Bada Pyara (Raga Bhupali)
- **Master (99.0%)**: Pair_08_MASTER_KJ_Yesudas_Gori_Tera_Gaon_Bada_Pyara.wav
  - Singer: K. J. Yesudas
  - Metrics: Pitch 98.8%, Swara 99.5%, Shruti 98.7%, Tonic Stability 99.1%
- **Amateur (74.4%)**: Pair_08_USER_Student_Singer_Cover_Gori_Tera_Gaon_Bada_Pyara.wav
  - Singer: Student Singer Cover

### Pair 09: Hothon Se Chhoo Lo Tum (Raga Bhairavi)
- **Master (97.1%)**: Pair_09_MASTER_Jagjit_Singh_Hothon_Se_Chhoo_Lo_Tum.wav
  - Singer: Jagjit Singh
  - Metrics: Pitch 96.8%, Swara 97.9%, Shruti 96.5%, Tonic Stability 97.5%
- **Amateur (77.5%)**: Pair_09_USER_Learner_Ghazal_Cover_Hothon_Se_Chhoo_Lo_Tum.wav
  - Singer: Learner Ghazal Cover

### Pair 10: Mitwa (Raga Khamaj)
- **Master (98.5%)**: Pair_10_MASTER_Shankar_Mahadevan_Mitwa.wav
  - Singer: Shankar Mahadevan
  - Metrics: Pitch 98.2%, Swara 99.1%, Shruti 98.0%, Tonic Stability 98.5%
- **Amateur (78.7%)**: Pair_10_USER_Music_Academy_Student_Mitwa.wav
  - Singer: Music Academy Student
