from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import numpy as np

from backend.app.ml.embeddings.service import EmbeddingService


@dataclass(frozen=True)
class DocumentChunk:
    text: str
    source: str
    metadata: dict[str, str]


@dataclass(frozen=True)
class RetrievedChunk:
    text: str
    source: str
    score: float
    metadata: dict[str, str]


class VectorStoreService:
    def __init__(self, embedding_service: EmbeddingService | None = None) -> None:
        self.embedding_service = embedding_service or EmbeddingService()
        self._documents: list[DocumentChunk] = []
        self._matrix: np.ndarray | None = None
        self._faiss_index = None

    def build(self, documents: Iterable[DocumentChunk]) -> "VectorStoreService":
        self._documents = [doc for doc in documents if doc.text.strip()]
        corpus = [doc.text for doc in self._documents]
        self.embedding_service.fit(corpus)
        matrix = self.embedding_service.encode(corpus)
        if matrix.size == 0:
            self._matrix = np.zeros((0, 0), dtype="float32")
            self._faiss_index = None
            return self

        matrix = self._normalize(matrix)
        self._matrix = matrix
        try:
            import faiss

            self._faiss_index = faiss.IndexFlatIP(matrix.shape[1])
            self._faiss_index.add(matrix.astype("float32"))
        except Exception:
            self._faiss_index = None
        return self

    def search(self, query: str, top_k: int = 4) -> list[RetrievedChunk]:
        if not self._documents:
            return []

        query_vector = self.embedding_service.encode([query])
        if query_vector.size == 0:
            return []
        query_vector = self._normalize(query_vector)

        if self._faiss_index is not None:
            import faiss

            scores, indices = self._faiss_index.search(query_vector.astype("float32"), min(top_k, len(self._documents)))
            return self._build_results(indices[0], scores[0])

        assert self._matrix is not None
        scores = np.dot(self._matrix, query_vector[0])
        ranked = np.argsort(scores)[::-1][:top_k]
        return self._build_results(ranked, scores[ranked])

    def _build_results(self, indices: Iterable[int], scores: Iterable[float]) -> list[RetrievedChunk]:
        results: list[RetrievedChunk] = []
        for index, score in zip(indices, scores):
            if index < 0 or index >= len(self._documents):
                continue
            doc = self._documents[int(index)]
            results.append(
                RetrievedChunk(
                    text=doc.text,
                    source=doc.source,
                    score=float(score),
                    metadata=doc.metadata,
                )
            )
        return results

    def _normalize(self, matrix: np.ndarray) -> np.ndarray:
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return matrix / norms

