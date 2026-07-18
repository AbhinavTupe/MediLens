from __future__ import annotations

import os
import re
from typing import Iterable

import requests

from backend.app.config.settings import GROQ_API_KEY
from backend.app.services.settings_service import get_settings
from backend.app.ml.prompts.templates import (
    BASE_SYSTEM_PROMPT,
    build_chat_messages,
    build_lifestyle_prompt,
    build_report_explanation_prompt,
)


class LLMService:
    def __init__(self, provider: str | None = None) -> None:
        settings = get_settings()
        self.provider = (provider or settings.get("ai_provider") or "groq").lower()
        self.groq_model = os.getenv("MEDILENS_GROQ_MODEL", "llama-3.1-70b-versatile")
        self.openai_model = os.getenv("MEDILENS_OPENAI_MODEL", "gpt-4o-mini")
        self.ollama_model = os.getenv("MEDILENS_OLLAMA_MODEL", "llama3.1")
        self.temperature = float(os.getenv("MEDILENS_LLM_TEMPERATURE", "0.2"))

    def explain_report(
        self,
        *,
        disease_name: str,
        probability: float,
        top_features: list[dict[str, object]],
        report_context: str,
        history: Iterable[dict[str, str]] | None = None,
    ) -> str:
        prompt = build_report_explanation_prompt(
            disease_name=disease_name,
            probability=probability,
            top_features=top_features,
            report_context=report_context,
        )
        messages = build_chat_messages(
            user_message=prompt,
            report_context=report_context,
            knowledge_context=self._feature_context(top_features),
            history=history,
        )
        return self.generate(messages, fallback_context=prompt)

    def lifestyle_recommendations(
        self,
        *,
        disease_name: str,
        report_context: str,
        top_features: list[dict[str, object]],
    ) -> list[str]:
        prompt = build_lifestyle_prompt(
            disease_name=disease_name,
            report_context=report_context,
            top_features=top_features,
        )
        messages = build_chat_messages(
            user_message=prompt,
            report_context=report_context,
            knowledge_context=self._feature_context(top_features),
            history=None,
        )
        response = self.generate(messages, fallback_context=prompt)
        return self._bullet_list(response, fallback=self._fallback_lifestyle(disease_name, top_features))

    def summarize_report(self, *, report_context: str, top_features: list[dict[str, object]]) -> str:
        prompt = (
            "Summarize the uploaded report in plain language for a patient. "
            "Only use the supplied clinical context and feature details."
        )
        messages = build_chat_messages(
            user_message=prompt,
            report_context=report_context,
            knowledge_context=self._feature_context(top_features),
            history=None,
        )
        return self.generate(messages, fallback_context=f"{prompt}\n{report_context}")

    def answer_question(
        self,
        *,
        user_message: str,
        report_context: str,
        knowledge_context: str,
        history: Iterable[dict[str, str]] | None = None,
    ) -> str:
        messages = build_chat_messages(
            user_message=user_message,
            report_context=report_context,
            knowledge_context=knowledge_context,
            history=history,
        )
        fallback_context = "\n\n".join([report_context, knowledge_context, user_message])
        return self.generate(messages, fallback_context=fallback_context)

    def stream_text(self, text: str, chunk_size: int = 96):
        buffer = text.strip()
        if not buffer:
            yield ""
            return
        for start in range(0, len(buffer), chunk_size):
            yield buffer[start : start + chunk_size]

    def generate(self, messages: list[dict[str, str]], fallback_context: str = "") -> str:
        providers = self._provider_chain()
        last_error: Exception | None = None
        for provider in providers:
            try:
                return self._generate_with_provider(provider, messages)
            except Exception as exc:  # pragma: no cover - provider fallback path
                last_error = exc
        return self._grounded_fallback(messages, fallback_context=fallback_context, error=last_error)

    def _provider_chain(self) -> list[str]:
        preferred = self.provider
        chain = {
            "groq": ["groq", "openai", "ollama"],
            "openai": ["openai", "groq", "ollama"],
            "ollama": ["ollama", "groq", "openai"],
        }
        return chain.get(preferred, ["groq", "openai", "ollama"])

    def _generate_with_provider(self, provider: str, messages: list[dict[str, str]]) -> str:
        if provider == "groq":
            return self._generate_with_groq(messages)
        if provider == "openai":
            return self._generate_with_openai(messages)
        if provider == "ollama":
            return self._generate_with_ollama(messages)
        raise ValueError(f"Unsupported provider: {provider}")

    def _generate_with_groq(self, messages: list[dict[str, str]]) -> str:
        if not GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is not configured")
        try:
            from groq import Groq
        except Exception as exc:  # pragma: no cover - optional dependency
            raise RuntimeError("Groq client is unavailable") from exc

        client = Groq(api_key=GROQ_API_KEY)
        completion = client.chat.completions.create(
            model=self.groq_model,
            messages=messages,
            temperature=self.temperature,
            max_tokens=700,
        )
        return (completion.choices[0].message.content or "").strip()

    def _generate_with_openai(self, messages: list[dict[str, str]]) -> str:
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not configured")
        try:
            from openai import OpenAI
        except Exception as exc:  # pragma: no cover - optional dependency
            raise RuntimeError("OpenAI client is unavailable") from exc

        client = OpenAI(api_key=api_key)
        completion = client.chat.completions.create(
            model=self.openai_model,
            messages=messages,
            temperature=self.temperature,
            max_tokens=700,
        )
        return (completion.choices[0].message.content or "").strip()

    def _generate_with_ollama(self, messages: list[dict[str, str]]) -> str:
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        response = requests.post(
            f"{base_url.rstrip('/')}/api/chat",
            json={
                "model": self.ollama_model,
                "messages": messages,
                "stream": False,
                "options": {"temperature": self.temperature},
            },
            timeout=60,
        )
        response.raise_for_status()
        payload = response.json()
        if isinstance(payload, dict):
            if "message" in payload and isinstance(payload["message"], dict):
                return str(payload["message"].get("content", "")).strip()
            if "response" in payload:
                return str(payload["response"]).strip()
        return ""

    def _grounded_fallback(self, messages: list[dict[str, str]], *, fallback_context: str, error: Exception | None) -> str:
        user_message = ""
        for message in reversed(messages):
            if message.get("role") == "user":
                user_message = message.get("content", "")
                break
        context_sentences = self._first_sentences(fallback_context, limit=4)
        if context_sentences:
            return (
                f"Based on the available clinical context, {self._compact_sentence(user_message)} "
                f"{' '.join(context_sentences)} "
                "Please review important findings with a licensed clinician."
            ).strip()
        return (
            "I can only answer using the uploaded report and retrieved medical references. "
            "Please upload a report or ask about a known laboratory finding."
        )

    def _feature_context(self, top_features: list[dict[str, object]]) -> str:
        if not top_features:
            return ""
        return "\n".join(
            f"{item.get('parameter', item.get('feature', 'Feature'))}: {item.get('contribution_score', item.get('contribution', 0))}"
            for item in top_features[:5]
        )

    def _fallback_lifestyle(self, disease_name: str, top_features: list[dict[str, object]]) -> list[str]:
        drivers = [str(item.get("parameter", item.get("feature", "feature"))) for item in top_features[:3]]
        base = {
            "Anemia": [
                "Include iron-rich foods with vitamin C sources.",
                "Discuss ferritin and B12 follow-up if symptoms persist.",
                "Avoid self-starting iron supplements without clinician guidance.",
            ],
            "Diabetes": [
                "Choose high-fiber meals and minimize sugary drinks.",
                "Stay physically active if your clinician says it is safe.",
                "Repeat glucose or HbA1c testing as recommended.",
            ],
            "Chronic Kidney Disease": [
                "Follow blood-pressure and hydration guidance from your clinician.",
                "Review salt intake and avoid unnecessary NSAID use.",
                "Monitor kidney markers and electrolytes on follow-up testing.",
            ],
        }.get(disease_name, [])
        if drivers:
            base.insert(0, f"Discuss the following signals with your clinician: {', '.join(drivers)}.")
        return base or ["Review the report with a licensed clinician."]

    def _bullet_list(self, text: str, fallback: list[str]) -> list[str]:
        lines = [line.strip("-• \t") for line in text.splitlines() if line.strip()]
        bullets = [line for line in lines if len(line) > 3]
        return bullets[:4] if bullets else fallback[:4]

    def _first_sentences(self, text: str, limit: int = 3) -> list[str]:
        sentences = [sentence.strip() for sentence in re.split(r"(?<=[.!?])\s+", text or "") if sentence.strip()]
        return sentences[:limit]

    def _compact_sentence(self, text: str) -> str:
        stripped = text.strip()
        if not stripped:
            return ""
        return stripped[0].upper() + stripped[1:] if len(stripped) > 1 else stripped
