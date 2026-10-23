# 🛡️ SwaraGPT — Quality Assurance & Testing Report (CO4 & CO3)
### Comprehensive Verification: Unit, Integration, System Testing & Defect Tracking Log

- **Project:** SwaraGPT (AI Virtual Guru for Indian Classical Music)
- **Author:** Om Mane (`om-mane-coder`)
- **Repository:** `https://github.com/om-mane-coder/SwaraGPT`
- **Framework:** Pytest 9.1.1, Python 3.13, FastAPI TestClient, AnyIO
- **Overall Status:** **13/13 Test Cases PASSED (100% Success Rate)**

---

## 📊 1. Test Summary Dashboard

| Test Category | Total Tests | Passed | Failed | Execution Time | Pass Rate |
|---|---|---|---|---|---|
| **Unit Testing (MIR, DSP, RAG)** | 7 | 7 | 0 | 12.18s | **100%** |
| **Integration Testing (API Routers)** | 5 | 5 | 0 | 9.85s | **100%** |
| **End-to-End System Testing** | 1 | 1 | 0 | 3.44s | **100%** |
| **Total** | **13** | **13** | **0** | **25.47s** | **100%** |

---

## 🧪 2. Detailed Test Cases & Execution Matrix

### A. Unit Testing (Core Algorithms & MIR Signal Processing)

| Test ID | Module | Test Function | Input / Scenario | Expected Outcome | Actual Result | Status |
|---|---|---|---|---|---|---|
| **UT-01** | `ai/shrutis.py` | `test_22_shrutis_catalog` | Query 22 shruti lookup table | Exact 22 canonical ratios (Sa 1/1 to Ni 15/8) | 22 shrutis mapped with names and ratios | **PASSED** |
| **UT-02** | `ai/shrutis.py` | `test_cent_calculation` | Freq 138.59 Hz (Sa=138.59 Hz) | Cent deviation = 0.0, Sur classification (<= 25c) | C = 0.0 cents, intonation zone = Sur | **PASSED** |
| **UT-03** | `ai/dsp.py` | `test_synthetic_sine_audio` | Synthesize 220Hz tone at 22.05 kHz | Valid float array, no clipping, correct duration | Generated 22.05kHz sine waveform cleanly | **PASSED** |
| **UT-04** | `ai/pitch.py` | `test_tonic_estimation` | Synthetic multi-harmonic tonic tone | Histogram distribution peak identifies fundamental Sa | Correctly detected Sa fundamental frequency | **PASSED** |
| **UT-05** | `ai/raga.py` | `test_raga_recognition_pakad` | Scale vector for Raga Yaman (Tivra Ma, Shuddha Ni) | Automated Raga Index identifies Yaman (>0.85 score) | Raga Yaman classified with 92% confidence | **PASSED** |
| **UT-06** | `ai/scoring.py` | `test_feedback_weighted_formula` | Metrics: P=90, S=85, Sh=80, R=90, T=95 | Formula: 0.35P + 0.25S + 0.15Sh + 0.15R + 0.10T | Score = 87.75/100, correct grade assigned | **PASSED** |
| **UT-07** | `rag/knowledge.py` | `test_rag_musicology_retriever` | Query: "How does Natya Shastra divide shrutis?" | Grounded citations from Natya Shastra Ch. 28 | Returned canonical text without hallucination | **PASSED** |

### B. Integration Testing (API Endpoints & Database Layer)

| Test ID | Endpoint | Method | Input Payload | Expected HTTP & Schema | Actual HTTP & Status | Status |
|---|---|---|---|---|---|---|
| **IT-01** | `/api/health` | `GET` | None | HTTP 200, status="healthy", service="SwaraGPT" | HTTP 200 OK, healthy payload | **PASSED** |
| **IT-02** | `/api/audio/shrutis` | `GET` | None | HTTP 200, array of 22 microtonal definitions | HTTP 200 OK, 22 items with cents/ratios | **PASSED** |
| **IT-03** | `/api/ragas` | `GET` | None | HTTP 200, master raga catalog (Yaman, Bhairav, etc.) | HTTP 200 OK, full catalog retrieved | **PASSED** |
| **IT-04** | `/api/practice/drills` | `GET` | `experience_level=beginner` | HTTP 200, tailored alankars and Riyaz regimen | HTTP 200 OK, targeted drills generated | **PASSED** |
| **IT-05** | `/api/chat` | `POST` | `{"message": "What is Meend?"}` | HTTP 200, grounded response with Sangita Ratnakara Gamak cite | HTTP 200 OK, citation included | **PASSED** |

### C. System Testing (End-to-End Workflow)

| Test ID | Flow | Steps Executed | Expected Outcome | Actual Result | Status |
|---|---|---|---|---|---|---|
| **ST-01** | Full Analysis Pipeline | Upload Audio ➔ 80Hz HPF ➔ pYIN Pitch Tracking ➔ Swara Alignment ➔ 22-Shruti Deviation ➔ Weighted Scoring ➔ AI Critique | Full JSON response with pitch contour, score (0-100), sur/besur classification, and dynamic practice drill | End-to-end pipeline computed metrics and returned recommendations seamlessly | **PASSED** |

---

## 🐞 3. Defect Tracking & Resolution Log

During the development and testing lifecycle, defects were systematically identified, documented, and resolved:

| Defect ID | Severity | Module | Description of Defect | Root Cause | Resolution Applied | Verification |
|---|---|---|---|---|---|---|
| **DEF-01** | **High** | Audio Ingestion | MediaRecorder WebM files failed in standard WAV decoders | Browser audio chunks sent in proprietary Opus/WebM container | Added `frontend/lib/mir/audioDecoder.ts` with Web Audio API AudioContext decodeAudioData fallback | **RESOLVED & PASSED** |
| **DEF-02** | **Medium** | DSP Preprocessing | Low-frequency microphone rumble distorted fundamental Sa detection | DC offset and sub-80Hz environmental room noise | Built second-order Butterworth High-Pass Filter (80Hz cutoff) in `scipy.signal` before pYIN execution | **RESOLVED & PASSED** |
| **DEF-03** | **Medium** | Virtual Guru Chat | LLM hallucinated non-existent raga rules when API timed out | Remote LLM latency or missing third-party API key | Implemented deterministic Offline Classical Pedagogical Guru fallback in `backend/app/ai/providers.py` | **RESOLVED & PASSED** |
| **DEF-04** | **Low** | CORS Policy | Cross-origin resource errors when frontend contacted port 8000 | Strict CORS middleware whitelist omitted Next.js dev server origins | Configured regex `allow_origin_regex=r"https?://(localhost\|127\.0\.0\.1)(:[0-9]+)?"` | **RESOLVED & PASSED** |

---

## 💻 4. Command to Re-run Tests for Assessment Live Demo

To demonstrate live test execution in front of the lab examiner, run:

```bash
cd backend
python -m pytest app/tests -v
```
Output:
```
======================= 13 passed, 1 warning in 25.47s ========================
```
