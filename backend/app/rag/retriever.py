"""
SwaraGPT - Grounded Musicological Retriever with Anti-Hallucination Guardrails
Retrieves top-k verified literature chunks with complete citations.
Combines semantic vector projection with token relevance filters to prevent hallucination.
"""
from typing import List, Dict, Any, Tuple
import re
import numpy as np
from app.rag.knowledge_base import get_all_knowledge_docs
from app.rag.embeddings import vectorizer

STOPWORDS = {"what", "is", "the", "and", "or", "of", "in", "for", "with", "a", "an", "give", "me", "how", "to", "about", "can", "tell"}


class MusicologyRetriever:
    """Retrieves verified classical documents with author, source, and chapter citations."""

    def __init__(self):
        self.docs = get_all_knowledge_docs()
        self.doc_vectors = [
            vectorizer.compute_embedding(f"{d['title']} {d['topic']} {d['content']}")
            for d in self.docs
        ]

    def retrieve(self, query: str, top_k: int = 3) -> Tuple[List[Dict[str, Any]], bool]:
        """
        Search verified knowledge base.
        Returns:
            (list_of_matched_docs_with_citations, has_sufficient_context_boolean)
        """
        q_tokens = set(re.findall(r'\b[a-zA-Z\']+\b', query.lower()))
        content_tokens = q_tokens - STOPWORDS

        query_vec = vectorizer.compute_embedding(query)
        scored_docs = []

        for i, doc in enumerate(self.docs):
            sim = vectorizer.cosine_similarity(query_vec, self.doc_vectors[i])
            doc_text = f"{doc['title']} {doc['topic']} {doc['content']}".lower()
            
            # Count how many meaningful query tokens appear in doc
            matched_tokens = [t for t in content_tokens if t in doc_text]
            token_ratio = len(matched_tokens) / max(1, len(content_tokens))

            # Composite score combining vector similarity and keyword presence
            composite_score = (0.5 * sim) + (0.5 * token_ratio)
            scored_docs.append((composite_score, doc, token_ratio))

        scored_docs.sort(key=lambda x: x[0], reverse=True)

        top_matches = []
        max_score = scored_docs[0][0] if scored_docs else 0.0
        best_token_ratio = scored_docs[0][2] if scored_docs else 0.0

        for score, doc, t_ratio in scored_docs[:top_k]:
            if score > 0.15:
                entry = dict(doc)
                entry["relevance_score"] = round(float(score), 3)
                top_matches.append(entry)

        # Context is sufficient only if composite score >= 0.40 and at least 30% of query keywords matched
        has_sufficient_context = (max_score >= 0.40 and best_token_ratio >= 0.30 and len(top_matches) > 0)
        return top_matches, has_sufficient_context

    def format_citations(self, matched_docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract clean citation objects for API response."""
        citations = []
        for d in matched_docs:
            citations.append({
                "title": d.get("title", ""),
                "source": d.get("source", ""),
                "author": d.get("author", "Traditional"),
                "tradition": d.get("tradition", "Indian Classical"),
                "topic": d.get("topic", ""),
                "relevance_score": d.get("relevance_score", 0.0),
            })
        return citations


retriever = MusicologyRetriever()
