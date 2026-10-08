# SwaraGPT (स्वरGPT)
### AI-Powered Virtual Guru for Personalized Indian Classical Music Education

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black.svg?style=flat&logo=next.js)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg?style=flat&logo=python)](https://python.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

SwaraGPT is an AI-powered virtual music guru designed specifically for students, self-learners, and Indian Classical Music enthusiasts across both Hindustani and Carnatic traditions.

The application unites **Digital Signal Processing (DSP)**, **Music Information Retrieval (MIR)**, **Probabilistic YIN (pYIN) Pitch Tracking**, **22-Shruti Microtonal Analysis**, **Automated Raga Recognition**, and **Retrieval-Augmented Generation (RAG)** into an intuitive, real-time vocal Riyaz companion.

---

## 🎵 Dual Engine Architecture

```
PRACTICE & MIR FEEDBACK LOOP
-----------------------------
USER VOCAL PRACTICE
        ↓
AUDIO CAPTURE / UPLOAD (Web Audio API / 22.05 kHz)
        ↓
AUDIO PREPROCESSING (80 Hz HPF, -1dBFS Normalization, VAD)
        ↓
TONIC / SA DETECTION (Histogram Distribution Peak)
        ↓
pYIN PITCH EXTRACTION (F0 fundamental frequency contour)
        ↓
SWARA & 22-SHRUTI MAPPING (C = 1200 · log2(f / fSa))
        ↓
ORNAMENTATION SEGMENTATION (Meend, Gamak, Andolan, Kan-swar)
        ↓
RAGA ADHERENCE EVALUATION (Scale compliance, Vadi energy, Pakad n-grams)
        ↓
TRANSPARENT WEIGHTED SCORING (Pitch 35%, Swara 25%, Shruti 15%, Raga 15%, Tonic 10%)
        ↓
GURU CRITIQUE & DYNAMIC DRILLS
        ↓
LONGITUDINAL PROGRESS TRACKING


CONVERSATIONAL VIRTUAL GURU LOOP
--------------------------------
USER MUSICOLOGICAL QUERY
        ↓
INTENT CLASSIFICATION
        ↓
RAG VECTOR RETRIEVAL (ChromaDB + Cosine Semantic Search)
        ↓
VERIFIED CANONICAL CORPUS (Natya Shastra, Sangeet Ratnakara, Bhatkhande)
        ↓
PERFORMANCE CONTEXT INJECTION (Optional recent session metrics)
        ↓
AI PROVIDER ABSTRACTION (Gemini 1.5 / OpenAI GPT-4o / Offline Guru)
        ↓
GROUNDED RESPONSE WITH ACADEMIC CITATIONS & ANTI-HALLUCINATION GUARDRAILS
```

---

## 🏛️ Musicological Formulation & Mathematical Rigor

### 1. Relative Cent Calculation
Indian Classical Music employs a variable tonic (**Sa**). Frequencies are dynamically evaluated relative to the user's fundamental Sa frequency ($f_{Sa}$):

$$C = 1200 \cdot \log_2\left(\frac{f}{f_{Sa}}\right) \pmod{1200}$$

### 2. Intonation Tolerance Zones
* **Sur (In Tune):** $|C - C_{\text{target}}| \le 25\text{ cents}$
* **Mild Deviation:** $25 < |C - C_{\text{target}}| \le 50\text{ cents}$
* **Besur (Significant Deviation):** $|C - C_{\text{target}}| > 50\text{ cents}$

### 3. Canonical 22 Shrutis of Indian Music
All 22 microtonal shrutis from the *Natya Shastra* and *Sangeet Ratnakara* are embedded with exact mathematical ratios and traditional rasas:
* **Tivra (Sa):** $1/1$ ($0.0\text{ cents}$) — *Shanta Rasa*
* **Ranjani (Chatushruti Re):** $9/8$ ($203.9\text{ cents}$) — *Veera Rasa*
* **Krodha (Shuddha Ga):** $5/4$ ($386.3\text{ cents}$) — *Joyous Light*
* **Marjani (Tivra Ma):** $45/32$ ($590.2\text{ cents}$) — *Twilight Wonder*
* **Rakta (Pa):** $3/2$ ($702.0\text{ cents}$) — *Cosmic Balance*
* **Rohini (Chatushruti Dha):** $5/3$ ($884.4\text{ cents}$) — *Auspicious Grandeur*
* **Kshobhini (Shuddha Ni):** $15/8$ ($1088.3\text{ cents}$) — *Ecstatic Surrender*

### 4. Transparent Multi-Factor Performance Formula
$$\text{Score} = (0.35 \times P) + (0.25 \times S) + (0.15 \times Sh) + (0.15 \times R) + (0.10 \times T)$$

Where:
* $P$ = Pitch Accuracy & frame stability
* $S$ = Swara interval adherence
* $Sh$ = 22-Shruti microtonal precision
* $R$ = Raga scale compliance & Vadi emphasis
* $T$ = Tonic (Sa) stability across phrase boundaries

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Zustand, Recharts, Lucide Icons |
| **Audio Capture & DSP** | Web Audio API, MediaRecorder API, AnalyserNode, Synthetic Tanpura Drone Oscillator |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy, Uvicorn, Passlib (PBKDF2-SHA256) |
| **MIR & Signal Processing**| Librosa, NumPy, SciPy (Butterworth HPF), SoundFile, pYIN Fundamental Pitch Tracking |
| **Databases** | PostgreSQL (Relational master data, users, sessions) with SQLite automatic fallback |
| **Document Store** | MongoDB (High-frequency pitch contours) with relational JSON fallback |
| **Vector DB & RAG** | ChromaDB, Cosine similarity embeddings, verified musicology knowledge base |
| **AI Providers** | Google Gemini API, OpenAI API, and Offline Pedagogical Guru Provider |
| **DevOps** | Docker, Docker Compose, Multi-stage builds |

---

## 🚀 Quickstart Guide

### Option 1: Docker Compose (All Services)

```bash
# Clone the repository
git clone https://github.com/your-username/swara-gpt.git
cd swara-gpt

# Copy environment template
cp .env.example .env

# Build and start all services
docker compose up --build
```
* Frontend: `http://localhost:3000`
* Backend API & Swagger Docs: `http://localhost:8000/docs`

---

### Option 2: Local Development

#### Prerequisites
* Node.js v18+ (tested on Node v20/v24)
* Python 3.11+
* FFmpeg installed on system PATH

#### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup
```bash
cd frontend

# Install npm dependencies
npm install

# Start Next.js development server
npm run dev
```

---

## 🧪 Testing & Quality Assurance

Run the comprehensive MIR and API test suite:

```bash
cd backend
python -m pytest app/tests -v
```

### Verified Test Cases (13/13 Passing Cleanly):
* `test_synthetic_audio_generation`: Deterministic acoustic sine tone synthesis.
* `test_audio_preprocessing_pipeline`: Resampling (22.05 kHz), 80 Hz HPF, -1dBFS normalization, VAD silence trimming.
* `test_pitch_detection_pyin`: pYIN fundamental frequency extraction and octave verification.
* `test_swara_detector_cents_and_mapping`: Relative cent calculation $C = 1200 \log_2(f / f_{Sa})$ and Sur/Mild/Besur intonation thresholds.
* `test_22_shrutis_exact_matching`: Microtonal matching against canonical 22 shrutis.
* `test_ornament_detection`: Differential derivative segmentation of Meend glides vs Gamak vibrato.
* `test_raga_recognition_ari`: Automated 3-factor Raga Recognition Index.
* `test_health_endpoint`: Observability and service health checks.
* `test_auth_registration_and_login`: JWT token creation, password hashing, and role assignment.
* `test_ragas_catalog_endpoints`: Master raga data retrieval and detail views.
* `test_rag_grounded_assistant_known_and_unknown`: RAG verified document citation vs anti-hallucination guardrail response.
* `test_transparent_scoring_formula`: Multi-factor weighted performance calculation.
* `test_recommendation_engine`: Dynamic practice regimen generation.

---

## 👤 Development Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Virtual Guru** | `guru@swaragpt.ai` | `SwaraGuru#2026` |
| **Classical Student** | `student@swaragpt.ai` | `SadhakRiyaz#2026` |

*Note: SwaraGPT includes a fully resilient Offline Demo Mode. If no OpenAI or Gemini API key is configured, the application functions seamlessly without error.*

---

## 📜 Documentation Index

* [`ARCHITECTURE.md`](ARCHITECTURE.md): System design, dataflow diagrams, and service interactions.
* [`API.md`](API.md): Detailed REST endpoints, request/response schemas, and WebSocket intonation feed.
* [`AI_PIPELINE.md`](AI_PIPELINE.md): MIR algorithms, pYIN pitch extraction, and ornament detection.
* [`RAG.md`](RAG.md): Document ingestion, chunking, embeddings, and grounding architecture.
* [`DATABASE.md`](DATABASE.md): Relational and document store schemas and migrations.
* [`DEPLOYMENT.md`](DEPLOYMENT.md): Production deployment guidelines for Vercel, Render, and AWS.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
