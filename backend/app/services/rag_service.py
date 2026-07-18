from __future__ import annotations

from datetime import datetime
from typing import Any, Iterable

from backend.app.database.database import get_connection
from backend.app.ml.rag.pipeline import MedicalRAGPipeline


class RAGService:
    def __init__(self) -> None:
        self.pipeline = MedicalRAGPipeline()

    def answer(self, message: str, report_context: str, report_id: str | None = None) -> str:
        bundle = self._resolve_report_bundle(report_id=report_id, report_context=report_context)
        return self.pipeline.answer(
            question=message.strip(),
            report_context=bundle["report_context"],
            history=bundle["history"],
            report_summary=bundle["report_summary"],
        )

    def stream(self, message: str, report_context: str, report_id: str | None = None):
        bundle = self._resolve_report_bundle(report_id=report_id, report_context=report_context)
        yield from self.pipeline.stream_answer(
            question=message.strip(),
            report_context=bundle["report_context"],
            history=bundle["history"],
            report_summary=bundle["report_summary"],
        )

    def history_payload(self, report_id: str | None = None, report_context: str = "") -> dict[str, Any]:
        bundle = self._resolve_report_bundle(report_id=report_id, report_context=report_context)
        messages = self._load_chat_messages(bundle["report_id"])
        if not messages:
            messages = self._welcome_messages(bundle["report_summary"])
        return {
            "report_id": bundle["report_id"],
            "messages": messages,
            "suggested_questions": self.pipeline.suggested_questions(bundle["report_context"], bundle["report_summary"]),
        }

    def _resolve_report_bundle(self, *, report_id: str | None, report_context: str) -> dict[str, Any]:
        with get_connection() as conn:
            resolved_report_id = report_id
            report_row = None

            if resolved_report_id:
                report_row = conn.execute("SELECT * FROM reports WHERE id = ?", (resolved_report_id,)).fetchone()

            if report_row is None:
                report_row = conn.execute("SELECT * FROM reports ORDER BY created_at DESC LIMIT 1").fetchone()
                if report_row:
                    resolved_report_id = str(report_row["id"])

            if report_row is None:
                return {
                    "report_id": resolved_report_id,
                    "report_context": report_context or "",
                    "report_summary": "",
                    "history": [],
                }

            report_context_text = report_context or str(report_row["raw_text"] or "")
            parameter_rows = conn.execute(
                "SELECT name, value, unit, normal_range, status FROM extracted_parameters WHERE report_id = ? ORDER BY id ASC",
                (resolved_report_id,),
            ).fetchall()
            prediction_rows = conn.execute(
                "SELECT name, probability, confidence, severity, summary, shap_summary FROM predictions WHERE report_id = ? ORDER BY id ASC",
                (resolved_report_id,),
            ).fetchall()
            history_rows = conn.execute(
                "SELECT role, content, created_at FROM chat_history WHERE report_id = ? ORDER BY created_at ASC, id ASC LIMIT 12",
                (resolved_report_id,),
            ).fetchall()

            report_summary_parts = [
                f"Report type: {report_row['report_type'] or 'Uploaded Report'}",
                f"Status: {report_row['status'] or 'attention'}",
                f"Risk score: {int(report_row['risk_score'] or 0)}%",
            ]
            if parameter_rows:
                param_summary = ", ".join(
                    f"{row['name']} {row['value']} {row['unit']}".strip()
                    for row in parameter_rows[:8]
                )
                report_summary_parts.append(f"Parameters: {param_summary}")
            if prediction_rows:
                pred_summary = ", ".join(
                    f"{row['name']} {round(float(row['probability']), 1)}%"
                    for row in prediction_rows[:3]
                )
                report_summary_parts.append(f"Predictions: {pred_summary}")

            report_summary = "\n".join(report_summary_parts)
            history = [
                {"role": row["role"], "content": row["content"]}
                for row in history_rows
                if row["content"]
            ]
            if prediction_rows:
                top_prediction = max(prediction_rows, key=lambda row: float(row["probability"] or 0))
                report_summary += f"\nTop prediction: {top_prediction['name']} ({top_prediction['probability']}%)."

            return {
                "report_id": resolved_report_id,
                "report_context": report_context_text,
                "report_summary": report_summary,
                "history": history,
            }

    def _load_chat_messages(self, report_id: str | None) -> list[dict[str, str]]:
        if not report_id:
            return []
        with get_connection() as conn:
            rows = conn.execute(
                "SELECT id, role, content, created_at FROM chat_history WHERE report_id = ? ORDER BY created_at ASC, id ASC LIMIT 12",
                (report_id,),
            ).fetchall()
        return [
            {
                "id": f"chat-{row['id']}",
                "role": row["role"],
                "content": row["content"],
                "timestamp": self._format_timestamp(str(row["created_at"])),
            }
            for row in rows
        ]

    def _welcome_messages(self, report_summary: str) -> list[dict[str, str]]:
        message = "I can explain your uploaded report, summarize key findings, and answer follow-up questions using grounded medical context."
        if report_summary:
            message = f"I've loaded your latest report. {message}"
        return [
            {
                "id": "welcome",
                "role": "assistant",
                "content": message,
                "timestamp": datetime.utcnow().strftime("%H:%M"),
            }
        ]

    def _format_timestamp(self, value: str) -> str:
        try:
            return datetime.fromisoformat(value).strftime("%I:%M %p")
        except ValueError:
            return value
