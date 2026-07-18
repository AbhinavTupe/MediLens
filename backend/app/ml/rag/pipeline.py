from __future__ import annotations

from pathlib import Path
from typing import Iterable

from backend.app.config.settings import REFERENCE_DOCS_PATH
from backend.app.medical_knowledge import build_reference_corpus
from backend.app.ml.embeddings.service import EmbeddingService
from backend.app.ml.pdf.chunker import chunk_text
from backend.app.ml.prompts.templates import BASE_SYSTEM_PROMPT, build_chat_messages
from backend.app.ml.retriever.service import RetrieverService
from backend.app.ml.vectorstore.service import DocumentChunk, VectorStoreService
from backend.app.ml.llm.service import LLMService


class MedicalRAGPipeline:
    def __init__(self, reference_docs_path: Path | None = None, provider: str | None = None) -> None:
        self.reference_docs_path = reference_docs_path or REFERENCE_DOCS_PATH
        self.embedding_service = EmbeddingService()
        self.vectorstore = VectorStoreService(self.embedding_service)
        self.retriever = RetrieverService(self.vectorstore)
        self.llm = LLMService(provider=provider)
        self._initialized = False

    def ensure_index(self) -> None:
        if self._initialized:
            return
        documents = self._load_documents()
        self.vectorstore.build(documents)
        self._initialized = True

    def retrieve(self, query: str, top_k: int = 4):
        self.ensure_index()
        return self.retriever.retrieve(query, top_k=top_k)

    def answer(
        self,
        *,
        question: str,
        report_context: str,
        history: Iterable[dict[str, str]] | None = None,
        report_summary: str = "",
    ) -> str:
        self.ensure_index()
        query = "\n".join(filter(None, [question, report_context, report_summary]))
        retrieved = self.retrieve(query, top_k=4)
        knowledge_context = "\n\n".join(chunk.text for chunk in retrieved)
        messages = build_chat_messages(
            user_message=question,
            report_context=report_context or report_summary,
            knowledge_context=knowledge_context,
            history=history,
        )
        fallback_context = "\n\n".join(filter(None, [report_context, report_summary, knowledge_context, question]))
        return self.llm.generate(messages, fallback_context=fallback_context)

    def stream_answer(
        self,
        *,
        question: str,
        report_context: str,
        history: Iterable[dict[str, str]] | None = None,
        report_summary: str = "",
    ):
        response = self.answer(
            question=question,
            report_context=report_context,
            history=history,
            report_summary=report_summary,
        )
        yield from self.llm.stream_text(response)

    def suggested_questions(self, report_context: str, report_summary: str = "") -> list[str]:
        questions = [
            "What do the abnormal values mean for me?",
            "Which results should I discuss with my doctor?",
            "What lifestyle changes are most relevant here?",
            "Do I need any follow-up tests?",
            "How does this compare to normal ranges?",
        ]
        top_prediction = self._extract_top_prediction_name(report_context, report_summary)
        if top_prediction == "Anemia":
            questions.insert(0, "Could this pattern suggest anemia?")
        elif top_prediction == "Diabetes":
            questions.insert(0, "Do these glucose markers suggest diabetes risk?")
        elif top_prediction == "Chronic Kidney Disease":
            questions.insert(0, "Is my kidney function changing?")
        return questions[:5]

    def _load_documents(self) -> list[DocumentChunk]:
        chunks: list[DocumentChunk] = []
        for index, text in enumerate(build_reference_corpus()):
            for chunk_index, chunk in enumerate(chunk_text(text)):
                chunks.append(
                    DocumentChunk(
                        text=chunk,
                        source=f"knowledge-{index}",
                        metadata={"chunk_index": str(chunk_index), "source": "medical_knowledge"},
                    )
                )

        if self.reference_docs_path.exists():
            raw_text = self.reference_docs_path.read_text(encoding="utf-8")
            for index, chunk in enumerate(chunk_text(raw_text)):
                chunks.append(
                    DocumentChunk(
                        text=chunk,
                        source=f"reference-doc-{index}",
                        metadata={"chunk_index": str(index), "source": "reference_docs"},
                    )
                )
        return chunks

    def _extract_top_prediction_name(self, report_context: str, report_summary: str) -> str:
        text = "\n".join(filter(None, [report_context, report_summary]))
        for line in text.splitlines():
            if line.lower().startswith("top prediction:"):
                candidate = line.split(":", 1)[1].strip()
                if "(" in candidate:
                    candidate = candidate.split("(", 1)[0].strip()
                return candidate
        return ""
