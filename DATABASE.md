# SwaraGPT Database Architecture & Schemas

SwaraGPT implements a polyglot persistence design, combining relational transactional consistency for user profiles and practice sessions with a flexible document store for high-frequency acoustic time-series and vector embeddings for semantic retrieval.

---

## 1. Relational Database (PostgreSQL / SQLite Fallback)

The relational schema is managed via SQLAlchemy ORM. In environments without an active PostgreSQL cluster, SwaraGPT automatically defaults to a zero-configuration local SQLite database (`swaragpt.db`), preserving complete functional parity.

### Entity Relationship Diagram (ERD)

```
       ┌────────────────────────┐
       │         users          │
       │────────────────────────│
       │ id (PK, Integer)       │◄─────────────┐
       │ name (String)          │              │
       │ email (String, Unique) │              │
       │ password_hash (String) │              │
       │ role (String)          │              │
       │ created_at (DateTime)  │              │
       └───────────┬────────────┘              │
                   │ 1:1                       │
                   ▼                           │
       ┌────────────────────────┐              │ 1:N
       │      user_profiles     │              │
       │────────────────────────│              │
       │ id (PK, Integer)       │              │
       │ user_id (FK, Unique)   │              │
       │ experience_level       │              │
       │ tradition              │              │
       │ preferred_tonic_hz     │              │
       │ daily_goal_minutes     │              │
       │ target_ragas (JSON)    │              │
       └────────────────────────┘              │
                                               │
       ┌────────────────────────┐              │
       │      raga_master       │              │
       │────────────────────────│              │
       │ id (PK, Integer)       │              │
       │ name (String, Unique)  │              │
       │ tradition (String)     │              │
       │ thaat (String)         │              │
       │ aroha (String)         │              │
       │ avaroha (String)       │              │
       │ vadi (String)          │              │
       │ samvadi (String)       │              │
       │ pakad (String)         │              │
       └───────────┬────────────┘              │
                   │ 1:N                       │
                   ▼                           ▼
       ┌──────────────────────────────────────────────┐
       │              practice_sessions               │
       │──────────────────────────────────────────────│
       │ id (PK, Integer)                             │
       │ user_id (FK -> users.id)                     │
       │ raga_id (FK -> raga_master.id, Nullable)     │
       │ target_raga_name (String)                    │
       │ audio_url (String)                           │
       │ duration_seconds (Float)                     │
       │ tonic_hz (Float)                             │
       │ overall_score (Float)                        │
       │ pitch_accuracy (Float)                       │
       │ swara_accuracy (Float)                       │
       │ shruti_accuracy (Float)                      │
       │ raga_accuracy (Float)                        │
       │ tonic_stability (Float)                      │
       │ confidence (Float)                           │
       │ created_at (DateTime)                        │
       └──────────────────────┬───────────────────────┘
                              │ 1:1
                              ▼
       ┌──────────────────────────────────────────────┐
       │               audio_analyses                 │
       │──────────────────────────────────────────────│
       │ id (PK, Integer)                             │
       │ session_id (FK -> practice_sessions.id)      │
       │ pitch_contour (JSON)                         │
       │ detected_swaras (JSON)                       │
       │ detected_ornaments (JSON)                    │
       │ raga_candidates (JSON)                       │
       │ feedback_report (JSON)                       │
       └──────────────────────────────────────────────┘
```

---

## 2. Document Store (MongoDB / Relational JSON Fallback)

For high-resolution acoustic data (e.g. 100 Hz F0 samples over 10-minute Alaps), SwaraGPT uses MongoDB:

### Collection: `pitch_contours`
```json
{
  "_id": "ObjectId('65f2a1b9...')",
  "session_id": "sess_8f29d...",
  "user_id": 1,
  "tonic_hz": 138.59,
  "sample_rate": 22050,
  "frames": [
    {
      "time": 0.00,
      "frequency": 138.6,
      "confidence": 0.96,
      "cents": 0.0,
      "swara": "Sa",
      "shruti": "Tivra",
      "deviation": 0.0,
      "status": "sur"
    }
  ]
}
```

### Collection: `performance_feedback`
```json
{
  "_id": "ObjectId('65f2a2c1...')",
  "session_id": "sess_8f29d...",
  "overall_score": 83.2,
  "strengths": ["Solid Sa stability", "Consistent Pancham intonation"],
  "issues": ["Gandhar drifted 28 cents sharp during sustained hold"],
  "recommendations": ["Practice sustaining Ga for 4 seconds", "Repeat Yaman pakad drill"]
}
```

*Note: If MongoDB is unavailable during local development, `repository.py` stores these documents within `audio_analyses` JSON columns with zero degradation in UI capabilities.*

---

## 3. Vector Database (ChromaDB)

SwaraGPT stores chunked excerpts of musicological treatises in ChromaDB:
* **Collection:** `swaragpt_knowledge_base`
* **Embedding Model:** Cosine-similarity vectorizer
* **Metadata Schema:**
  * `title`: Treatise or book name
  * `source`: Historical author/treatise
  * `tradition`: Hindustani / Carnatic
  * `topic`: Raga grammar, shruti theory, riyaz technique
  * `grounded`: boolean flag
