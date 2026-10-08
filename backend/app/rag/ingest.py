"""
SwaraGPT - RAG Knowledge Base Ingestion CLI
Processes and ingests Indian Classical Music treatises (PDF, TXT, DOCX).
Run: python -m app.rag.ingest [optional_dir]
"""
import os
import sys
import argparse
from typing import List, Dict, Any
from app.rag.knowledge_base import VERIFIED_KNOWLEDGE_DOCS


def extract_text_from_file(file_path: str) -> str:
    """Extract raw text from TXT, PDF, or DOCX."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    elif ext == ".docx":
        try:
            import docx
            doc = docx.Document(file_path)
            return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        except ImportError:
            print("python-docx not installed; skipping docx parsing.")
            return ""
    elif ext == ".pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            return "\n".join([page.extract_text() or "" for page in reader.pages])
        except Exception:
            return ""
    return ""


def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> List[str]:
    """Split text into overlapping passage chunks."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


def ingest_directory(data_dir: str):
    """Scan and ingest all musicology files into memory/vector storage."""
    print(f"📖 Starting ingestion from: {data_dir}")
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)
        print(f"Created {data_dir} directory.")

    files = [os.path.join(data_dir, f) for f in os.listdir(data_dir) if os.path.isfile(os.path.join(data_dir, f))]
    ingested_count = 0

    for fp in files:
        fname = os.path.basename(fp)
        content = extract_text_from_file(fp)
        if content:
            chunks = chunk_text(content)
            for idx, c in enumerate(chunks):
                VERIFIED_KNOWLEDGE_DOCS.append({
                    "id": f"ingested_{fname}_{idx}",
                    "title": f"Custom Literature: {fname} (Part {idx+1})",
                    "author": "Ingested Classical Source",
                    "source": fname,
                    "tradition": "Indian Classical Music",
                    "topic": "Literature Ingestion",
                    "content": c
                })
            ingested_count += 1
            print(f"✔ Ingested '{fname}' ({len(chunks)} chunks).")

    print(f" Total verified knowledge entries now active: {len(VERIFIED_KNOWLEDGE_DOCS)}")


def main():
    parser = argparse.ArgumentParser(description="SwaraGPT RAG Ingestion CLI")
    parser.add_argument("--dir", default="./data/knowledge", help="Directory containing musicology files")
    args = parser.parse_args()
    ingest_directory(args.dir)


if __name__ == "__main__":
    main()
