# SwaraGPT Retrieval-Augmented Generation (RAG) Architecture

SwaraGPT does not rely on generic large language model hallucinations for authoritative musicological facts. It implements a grounded, citation-backed RAG architecture backed by ChromaDB and academic ICM literature.

---

## 1. RAG Query Lifecycle

```
[User Question]
       │
       ▼
[Intent Detection & Keyword Tokenizer]
       │
       ▼
[Cosine Vector Similarity Query in ChromaDB]
       │
       ├── Similarity Score >= 0.25 ──► [Retrieve Top-K Verified Passages]
       │                                            │
       │                                            ▼
       │                               [Inject Performance Context (if available)]
       │                                            │
       │                                            ▼
       │                               [LLM Context Augmentation]
       │                                            │
       │                                            ▼
       │                               [Grounded Virtual Guru Response + Citations]
       │
       └── Similarity Score < 0.25 ───► [Anti-Hallucination Guardrail Fallback]
                                       "I don't have enough verified information
                                        in my musicology knowledge base to answer
                                        that confidently."
```

---

## 2. Ingested Canonical Musicology Corpus

The knowledge base is built from classical treatises and musicological scholarship:
* **Natya Shastra (Bharata Muni, ~200 BCE - 200 CE):** Foundations of Shruti, Grama, and Murchhana systems.
* **Sangeet Ratnakara (Sarangadeva, 13th Century):** The authoritative exposition of the 22 Shrutis, Nada, and Gamaka types.
* **Hindustani Sangeet Paddhati (Pt. Vishnu Narayan Bhatkhande):** Classification of Ragas into 10 Parent Thaats.
* **Swara Melakalanidhi (Ramamatya, 16th Century):** Foundations of Carnatic Raga classification.
* **Sangita Sampradaya Pradarsini (Subbarama Dikshitar, 1904):** Detailed notations of Carnatic Ragas and Gamakas.

---

## 3. Grounding & Anti-Hallucination Guardrails

To prevent LLM invention of unauthorized raga rules:
1. Every retrieved document chunk preserves metadata: `title`, `source`, `tradition`, `topic`.
2. When the user queries an unverified or invented raga, the retriever rejects low-confidence matches.
3. System prompt strictly constrains the assistant:
   > *"You are the SwaraGPT Virtual Guru. Ground your explanations strictly in the verified context provided. Cite traditional treatises by name. If the query asks for rules of a raga not contained in your verified context, state clearly that you do not have verified material rather than guessing."*

---

## 4. Ingestion CLI

To ingest custom PDF, TXT, or Markdown treatises into the vector store:

```bash
cd backend
python -m app.rag.ingest --input-dir ../data/knowledge
```
