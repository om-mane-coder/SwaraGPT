# SwaraGPT System Architecture

SwaraGPT is an end-to-end intelligent platform engineered specifically for Indian Classical Music (ICM) pedagogy, performance evaluation, and musicological scholarship.

---

## 1. High-Level Architectural Topology

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 CLIENT APPLICATION                     │
                  │   Next.js 16 (App Router) + React 19 + TypeScript      │
                  │   Tailwind CSS + Zustand Store + Recharts              │
                  │   Web Audio API (Capture, Analyser, Tanpura Synth)     │
                  └──────────────────────────┬─────────────────────────────┘
                                             │ HTTP / REST / WebSocket
                                             ▼
                  ┌────────────────────────────────────────────────────────┐
                  │                   API GATEWAY / REVERSE PROXY          │
                  │                   FastAPI Application (ASGI)           │
                  │   CORS Middleware, JWT Authentication, Logging         │
                  └───────┬───────────────────────────────┬────────────────┘
                          │                               │
            REST / Audio Processing               WebSocket Intonation Feed
                          ▼                               ▼
       ┌──────────────────────────────────────┐  ┌───────────────────────────────────┐
       │         AUDIO & MIR PIPELINE         │  │     LIVE /ws/pitch INTONATION     │
       │  • Resampling (22.05 kHz)            │  │  • Short-time buffer evaluation   │
       │  • 80 Hz Butterworth HPF             │  │  • Real-time cent deviation       │
       │  • -1dBFS Normalization & VAD        │  │  • Sur / Mild / Besur status      │
       │  • pYIN / YIN Pitch Tracking         │  └───────────────────────────────────┘
       │  • Cent & 22-Shruti Mapping          │
       │  • Ornamentation Segmentation        │
       │  • Automated Raga Recognition (ARI)  │
       │  • Multi-Factor Weighted Scoring     │
       └──────────────────┬───────────────────┘
                          │
       ┌──────────────────┴───────────────────┐
       │       CONVERSATIONAL RAG ENGINE      │
       │  • ChromaDB Vector Store             │
       │  • Cosine Similarity Embeddings      │
       │  • Grounded Musicology Corpus        │
       │  • Anti-Hallucination Guardrails     │
       │  • Multi-Provider LLM Abstraction    │
       │    (Gemini / OpenAI / Offline)       │
       └──────────────────┬───────────────────┘
                          │
         ┌────────────────┴────────────────────────┐
         │              DATA PERSISTENCE           │
         │  PostgreSQL (Relational core data)      │
         │  SQLite (Zero-config local fallback)    │
         │  MongoDB (High-frequency pitch data)    │
         │  Redis (Caching & ephemeral jobs)       │
         └─────────────────────────────────────────┘
```

---

## 2. Directory Monorepo Layout

```
swara-gpt/
├── frontend/                   # Next.js 16 Web Application
│   ├── app/                    # App Router routes
│   │   ├── page.tsx            # Landing Page with animated pitch curve
│   │   ├── login/              # Authentication login
│   │   ├── register/           # Registration
│   │   ├── onboarding/         # 3-Step student onboarding
│   │   ├── dashboard/          # Daily Riyaz, metrics, quick actions
│   │   ├── practice/           # Real-time microphone practice studio
│   │   ├── analyze/            # 6-Stage MIR audio evaluation
│   │   │   └── [id]/           # Full Performance Report with charts
│   │   ├── chat/               # Grounded AI Guru conversation
│   │   ├── ragas/              # Raga catalog & explorer
│   │   │   └── [id]/           # Detailed Raga page with scale playback
│   │   ├── progress/           # Longitudinal Riyaz trends & swara stats
│   │   ├── history/            # Session archive & comparison modal
│   │   ├── profile/            # Sadhak profile management
│   │   └── settings/           # Hardware input, sensitivity, privacy
│   ├── components/             # Reusable UI & Audio components
│   │   ├── audio/AudioRecorder.tsx     # Mic capture & Tanpura synth
│   │   ├── pitch/PitchGraph.tsx        # Recharts F0 contour visualizer
│   │   ├── swara/SwaraIndicator.tsx    # Note intonation & deviation gauge
│   │   ├── swara/ShrutiDial.tsx        # 22-Shruti radial dial
│   │   ├── feedback/PerformanceScore.tsx # Multi-factor score breakdown
│   │   └── raga/RagaCard.tsx           # Raga summary card
│   ├── lib/api.ts              # Axios API client
│   └── lib/store.ts            # Zustand client persistence
│
├── backend/                    # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py             # FastAPI lifespan, routes, websockets
│   │   ├── config.py           # Pydantic v2 configuration & thresholds
│   │   ├── database/           # PostgreSQL/SQLite & MongoDB connections
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── routers/            # Modular endpoint routers
│   │   ├── ai/                 # MIR algorithms & AI providers
│   │   │   ├── pitch_detector.py       # pYIN & YIN pitch extraction
│   │   │   ├── tonic_detector.py       # Long-term Sa peak estimation
│   │   │   ├── swara_detector.py       # Cent conversion & note segmentation
│   │   │   ├── shrutis.py              # Canonical 22-Shruti database
│   │   │   ├── ornament_detector.py    # Meend / Gamak / Andolan detection
│   │   │   ├── raga_recognizer.py      # Automated Raga Index (ARI)
│   │   │   ├── feedback_engine.py      # Pedagogical critique generator
│   │   │   ├── recommendation_engine.py# Dynamic practice drill generator
│   │   │   └── providers.py            # Gemini / OpenAI / Offline abstraction
│   │   ├── rag/                # Grounded RAG knowledge base
│   │   │   ├── knowledge_base.py       # Classical treatise corpus
│   │   │   ├── embeddings.py           # Semantic similarity vectorizer
│   │   │   ├── retriever.py            # Guardrailed document retriever
│   │   │   └── ingest.py               # CLI document ingestion tool
│   │   └── tests/              # Pytest test suite (13/13 passing)
│   └── requirements.txt
│
├── data/                       # Seeds, knowledge base, and exercises
├── docker/                     # Multi-stage Dockerfiles
├── docker-compose.yml          # Full multi-container orchestration
└── .env.example
```

---

## 3. Data Flow Lifecycles

### Lifecycle A: Singing Audio Ingestion & Performance Analysis
1. User sings through the browser (`AudioRecorder.tsx`) accompanied by synthetic Tanpura harmonics.
2. Compressed `audio/webm` or uncompressed `audio/wav` is uploaded to `POST /api/audio/analyze`.
3. Server resamples audio to **22.05 kHz**, applies an **80 Hz 4th-order Butterworth High-Pass Filter** to eliminate sub-bass rumble, normalizes amplitude to **-1 dBFS**, and trims unvoiced lead/tail silence using Voice Activity Detection (VAD).
4. Tonic estimator analyzes the long-term pitch distribution histogram. If user specified a manual tonic, manual tonic is enforced as reference $f_{Sa}$.
5. Probabilistic YIN (`pYIN`) algorithm calculates fundamental frequencies (F0) at 10ms frame steps, masking frames below confidence threshold ($<0.15$).
6. Cent calculation converts raw Hertz to octave-normalized cents relative to $f_{Sa}$: $C = 1200 \log_2(f / f_{Sa}) \pmod{1200}$.
7. Swara mapper assigns nominal note values and 22-Shruti microtonal classifications, evaluating Sur/Mild/Besur intonation states.
8. Differential pitch derivative $|dC/dt|$ segments steady sustaining notes from intentional microtonal expressive ornaments (Meend continuous glides, Gamak oscillations, Kan-swar grace notes).
9. Automated Raga Recognition Index evaluates candidate ragas using scale adherence (0.40), Vadi energy (0.35), and Pakad sequence matching (0.25).
10. Transparent multi-factor performance formula computes overall score and structured constructive feedback.
11. Data is persisted in PostgreSQL/SQLite and MongoDB, and the client is redirected to `/analyze/[id]`.

### Lifecycle B: Grounded RAG Virtual Guru Dialogue
1. User submits a musicological or practice question via text or voice input (`/chat`).
2. Server detects intent and queries ChromaDB vector embeddings for verified document chunks from classical treatises (*Natya Shastra*, *Sangeet Ratnakara*, *Bhatkhande Sangeet Shastra*).
3. If recent performance metrics exist (`performance_context`), structured pitch accuracies and weak swara summaries are attached to the prompt.
4. If retrieved cosine similarity exceeds the verification threshold, the context is synthesized through the active AI Provider (`GeminiProvider`, `OpenAIProvider`, or `OfflineGuruProvider`).
5. If verified material is insufficient, the anti-hallucination guardrail gracefully responds: *"I don't have enough verified information in my musicology knowledge base to answer that confidently."*
6. Markdown response with verified citations is rendered in the chat UI.
