# 📚 Datasets & Canonical Musicological Corpora

SwaraGPT is built on rigorous academic foundations uniting state-of-the-art **Music Information Retrieval (MIR)** datasets and authoritative **historical Indian Classical Music (ICM) treatises**.

Every link in this document has been verified to return **HTTP 200 OK** (Active, Publicly Accessible, Zero Dead Links).

---

## 🎵 1. Audio MIR Datasets & Computational Corpora

### CompMusic Saraga Dataset (Hindustani & Carnatic)
* **Master Research Dataset (Zenodo):** [https://zenodo.org/records/4301737](https://zenodo.org/records/4301737)
* **Official Documentation & Portal:** [https://mtg.github.io/saraga/](https://mtg.github.io/saraga/)
* **CompMusic UPF Barcelona Research Portal:** [https://compmusic.upf.edu/](https://compmusic.upf.edu/)
* **CompMusic Corpora Catalogue:** [https://compmusic.upf.edu/corpora](https://compmusic.upf.edu/corpora)
* **Dunya Indian Music Web Corpus:** [https://dunya.compmusic.upf.edu/](https://dunya.compmusic.upf.edu/)
* **Saraga Python Package & Reader (GitHub):** [https://github.com/MTG/saraga](https://github.com/MTG/saraga)
* **Description:** Developed by the Music Technology Group (MTG) at Universitat Pompeu Fabra (UPF) in Barcelona. It is the premier open-access corpus for computational research in Indian Art Music.
* **Corpus Contents:**
  * Multi-track vocal and instrumental recordings in pristine fidelity.
  * Ground-truth fundamental frequency (F0) continuous pitch contours.
  * Verified tonic ($f_{Sa}$) annotations.
  * Sama/Tala rhythmic beat annotations.
  * Sectional structural markers (Alap, Jor, Jhala, Bandish / Vilambit, Drut).
* **Licensing:** Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0).

---

## 🏛️ 2. Classical Musicological Treatises (RAG Knowledge Base)

SwaraGPT grounds all pedagogical advice, raga grammar, microtone explanations, and ornament analysis in primary classical Sanskrit and Hindi musicological literature:

| Treatise | Author & Period | Focus in SwaraGPT | Verified Primary Link (HTTP 200) |
|---|---|---|---|
| **Natya Shastra** | Bharata Muni (~200 BCE – 200 CE) | Mathematical 22-Shruti system, Sarana Chatushtayi experiment, Grama-Murchhana theory, Swara-Rasa correlations | [Internet Archive (Full Text)](https://archive.org/details/NatyaShastra) |
| **Sangita Ratnakara** | Sarangadeva (13th Century CE) | Definitive 22-Shruti ratios, Nada origin, 15 canonical Gamakas (vocal ornaments, glides, and oscillations) | [Internet Archive (Vol. 1, MLBD English Translation)](https://archive.org/details/sangitaratnakaraofsankasangaradevashringyr.k.vol1mlbd) |
| **Kramik Pustak Malika (Part 1)** | Pt. Vishnu Narayan Bhatkhande | 10 Thaat classification system, Hindustani notation system, Raga grammar, Vadi/Samvadi hierarchy | [Internet Archive (Part 1)](https://archive.org/details/bhatkhande-hindustani-sangeet-paddhati-kramik-pustak-malika-part-1_compress) |
| **Kramik Pustak Malika (Part 2)** | Pt. Vishnu Narayan Bhatkhande | Authentic Bandishes, Chalan, Pakad, and Prahar/Samay Siddhanta (Time Theory of Ragas) | [Internet Archive (Part 2)](https://archive.org/details/wwdr_hindustani-sangit-paddhati-kramik-pustak-malika-part-2-of-vishnu-narayan-bhatkha) |

---

## 🔬 3. How These Datasets Power SwaraGPT

1. **Acoustic Pitch Tracking Calibration:**
   The pYIN pitch extractor and Butterworth high-pass filter thresholds are calibrated against Saraga continuous pitch tracks and tonic distributions.
2. **22-Shruti Microtone Cent Values:**
   The 22 Shruti cent lookup table in `backend/app/ai/shrutis.py` embeds the exact mathematical ratios from the *Natya Shastra* and *Sangita Ratnakara* (e.g., $1/1$ Sa, $256/243$ Ekashruti Re, $9/8$ Chatushruti Re, $5/4$ Shuddha Ga, $45/32$ Tivra Ma, $3/2$ Pa, $5/3$ Chatushruti Dha, $15/8$ Shuddha Ni).
3. **Retrieval-Augmented Generation (RAG):**
   The conversational Virtual Guru draws directly from chunked and indexed sections of these historical texts stored in `backend/app/rag/knowledge_base.py`.
