from __future__ import annotations

from backend.app.ml.vectorstore.service import RetrievedChunk, VectorStoreService


class RetrieverService:
    def __init__(self, vectorstore: VectorStoreService) -> None:
        self.vectorstore = vectorstore

    def retrieve(self, query: str, top_k: int = 4) -> list[RetrievedChunk]:
        return self.vectorstore.search(query, top_k=top_k)

