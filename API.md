# SwaraGPT REST & WebSocket API Specification

The SwaraGPT backend is powered by FastAPI, exposing fully validated OpenAPI 3.0 schemas at `/docs` and `/redoc`.

---

## 1. Base URL & Authentication

* **Base URL:** `http://localhost:8000/api`
* **Authentication Scheme:** HTTP Bearer JSON Web Token (JWT)
* **Header:** `Authorization: Bearer <access_token>`

---

## 2. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Registers a new music student or teacher.
* **Request:**
  ```json
  {
    "name": "Om Mane",
    "email": "student@swaragpt.ai",
    "password": "SecurePassword123!",
    "role": "student",
    "experience_level": "intermediate",
    "tradition": "hindustani",
    "preferred_tonic": "C#3",
    "target_raga": "Yaman"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "name": "Om Mane",
      "email": "student@swaragpt.ai",
      "role": "student"
    }
  }
  ```

### `POST /api/auth/login`
Authenticates credentials and returns JWT bearer token.
* **Request:**
  ```json
  {
    "email": "student@swaragpt.ai",
    "password": "SecurePassword123!"
  }
  ```

### `GET /api/auth/me`
Retrieves current authenticated user's profile and riyaz preferences.

---

## 3. Audio & Practice Ingestion Endpoints (`/api/audio`)

### `POST /api/audio/analyze`
Executes complete 6-stage Music Information Retrieval (MIR) pipeline on an uploaded audio file.
* **Request:** `multipart/form-data`
  * `file`: Audio file (`.wav`, `.mp3`, `.webm`, `.flac`, `.ogg`)
  * `target_raga`: String (e.g. `"Yaman"`)
  * `manual_tonic_hz`: Optional float (e.g. `138.59`)
* **Response (200 OK):**
  ```json
  {
    "session_id": "sess_8f29d...",
    "target_raga": "Yaman",
    "detected_tonic_hz": 138.59,
    "duration_seconds": 12.4,
    "overall_score": 83.2,
    "pitch_accuracy": 86.5,
    "swara_accuracy": 81.0,
    "shruti_accuracy": 78.5,
    "raga_accuracy": 85.0,
    "tonic_stability": 92.1,
    "confidence": 0.94,
    "raga_candidates": [
      { "raga": "Yaman", "confidence": 0.84, "explanation": "Strong presence of Tivra Ma..." }
    ],
    "detected_ornaments": [
      { "type": "Meend", "swaras": "Pa → Ga", "start_time": 3.2, "duration": 1.1 }
    ],
    "strengths": ["Solid Sa stability", "Consistent Pancham intonation"],
    "issues": ["Gandhar drifted 28 cents sharp during sustained hold"],
    "recommendations": ["Practice sustaining Ga for 4 seconds", "Repeat Yaman pakad drill"],
    "pitch_points": [
      { "time": 0.0, "frequency": 138.6, "cents": 0.0, "swara": "Sa", "deviation": 0.0, "confidence": 0.96 }
    ]
  }
  ```

### `POST /api/audio/generate`
Synthesizes Sargam phrases into acoustic tones with optional Tanpura drone accompaniment.

---

## 4. MIR Feature Extraction Endpoints (`/api/analysis`)

### `POST /api/analysis/full`
Raw direct feature extraction returning F0 pitch contours, 22-shruti alignment, and intonation deviation without creating a practice session record.

### `GET /api/analysis/shrutis`
Returns the canonical catalog of all 22 Shrutis with Sanskrit names, mathematical frequency ratios, exact cent values, and traditional Rasas.

### `GET /api/analysis/session/{session_id}`
Retrieves detailed historical performance report and contour points.

---

## 5. Raga Knowledge Base Endpoints (`/api/ragas`)

### `GET /api/ragas`
Lists all seeded Hindustani and Carnatic ragas with optional filtering by query, tradition, or thaat.

### `GET /api/ragas/{id}`
Returns complete musicological metadata for a specific raga including Aroha, Avaroha, Vadi, Samvadi, Pakad, time of day, and practice drills.

---

## 6. Conversational Virtual Guru (`/api/chat`)

### `POST /api/chat`
Submits a musicology question with optional recent performance context for grounded pedagogical dialogue.
* **Request:**
  ```json
  {
    "message": "Why does my Gandhar drift sharp in Raga Yaman?",
    "performance_context": {
      "target_raga": "Yaman",
      "weak_swaras": ["Ga"],
      "overall_score": 83.2
    }
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "response": "In Raga Yaman, Gandhar (Ga) is the Vadi swara with a canonical ratio of 5/4 (386.3 cents)...",
    "citations": [
      { "title": "Bhatkhande Sangeet Shastra", "source": "Classical Treatises", "tradition": "Hindustani" }
    ],
    "grounded": true
  }
  ```

---

## 7. Real-Time WebSocket Intonation Feed (`/ws/pitch`)

Clients connect via WebSocket for low-latency live intonation telemetry during vocal practice.
* **URL:** `ws://localhost:8000/ws/pitch?tonic_hz=138.59`
* **Telemetry Message Frame:**
  ```json
  {
    "timestamp": 1.45,
    "frequency": 174.2,
    "confidence": 0.93,
    "swara": "Ga",
    "cent": 384.1,
    "deviation": -2.2,
    "status": "sur",
    "is_in_tune": true
  }
  ```

---

## 8. Progress & Longitudinal Analytics (`/api/progress`)

* `GET /api/progress/summary`: Returns total practice minutes, sessions completed, streak, and strongest/weakest swaras.
* `GET /api/progress/history`: Lists chronological practice sessions with scores.
* `GET /api/progress/compare?session_id_1=...&session_id_2=...`: Calculates Before-vs-After differential deltas between two sessions.

---

## 9. Observability & Health

### `GET /health`
* **Response:**
  ```json
  {
    "status": "ok",
    "version": "1.0.0",
    "environment": "development",
    "ai_provider": "offline",
    "database": "connected"
  }
  ```
