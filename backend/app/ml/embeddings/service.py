from __future__ import annotations

import os
from typing import Iterable

import numpy as np


class EmbeddingService:
    def __init__(self, model_name: str | None = None) -> None:
        self.model_name = model_name or os.getenv(
            "MEDILENS_EMBEDDING_MODEL",
            "sentence-transformers/all-MiniLM-L6-v2",
        )
        self._model = None
        self._vectorizer = None
        self._fitted = False

    def fit(self, corpus: Iterable[str]) -> "EmbeddingService":
        corpus_list = list(corpus)
        if self._try_load_sentence_transformer():
            self._fitted = True
            return self

        from sklearn.feature_extraction.text import TfidfVectorizer

        self._vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=4096)
        self._vectorizer.fit(corpus_list or ["medical report"])
        self._fitted = True
        return self

    def encode(self, texts: Iterable[str]) -> np.ndarray:
        payload = list(texts)
        if not payload:
            return np.zeros((0, 0), dtype="float32")

        if self._try_load_sentence_transformer():
            vectors = self._model.encode(payload, normalize_embeddings=True, show_progress_bar=False)
            return np.asarray(vectors, dtype="float32")

        if self._vectorizer is None:
            self.fit(payload)
        return self._vectorizer.transform(payload).toarray().astype("float32")

    def _try_load_sentence_transformer(self) -> bool:
        if self._model is not None:
            return True
        try:
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer(self.model_name)
            return True
        except Exception:
            self._model = None
            return False

