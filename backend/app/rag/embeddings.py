"""
Embedding utilities - lightweight fallback (no torch/sentence-transformers needed).
In production, plug in Google or OpenAI embeddings via langchain.
"""
from typing import List
import hashlib


class EmbeddingEngine:
    """Lightweight embedding engine using hash-based vectors as fallback."""

    def embed(self, texts: List[str]) -> List[List[float]]:
        return [self._hash_embed(t) for t in texts]

    def embed_query(self, query: str) -> List[float]:
        return self._hash_embed(query)

    def _hash_embed(self, text: str) -> List[float]:
        """Simple deterministic embedding using hash (for development only)."""
        h = hashlib.sha256(text.encode()).digest()
        return [b / 255.0 for b in h[:64]]  # 64-dim vector


embedding_engine = EmbeddingEngine()
