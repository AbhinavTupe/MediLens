from __future__ import annotations

from typing import Iterable

try:  # pragma: no cover - optional dependency
    from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
    from langchain_core.prompts import ChatPromptTemplate
except Exception:  # pragma: no cover - optional dependency
    AIMessage = HumanMessage = SystemMessage = None
    ChatPromptTemplate = None


BASE_SYSTEM_PROMPT = (
    "You are MediLens, a careful medical report assistant. "
    "Answer only using the supplied clinical context and retrieved references. "
    "Do not invent values, diagnoses, or treatment plans. "
    "If the context is insufficient, say what is missing and recommend clinician review."
)


def build_chat_messages(
    *,
    user_message: str,
    report_context: str,
    knowledge_context: str,
    history: Iterable[dict[str, str]] | None = None,
) -> list[dict[str, str]]:
    message_specs: list[tuple[str, str]] = [("system", BASE_SYSTEM_PROMPT)]
    if history:
        for item in history:
            role = item.get("role", "user")
            content = item.get("content", "").strip()
            if content:
                message_specs.append(("ai" if role == "assistant" else "human", content))
    context_message = (
        "Use the following context only. "
        f"Uploaded report context:\n{report_context or 'No report provided.'}\n\n"
        f"Retrieved medical references:\n{knowledge_context or 'No medical references retrieved.'}"
    )

    if ChatPromptTemplate is not None and SystemMessage is not None and HumanMessage is not None and AIMessage is not None:
        langchain_messages = [SystemMessage(content=BASE_SYSTEM_PROMPT)]
        for role, content in message_specs[1:]:
            langchain_messages.append(AIMessage(content=content) if role == "ai" else HumanMessage(content=content))
        langchain_messages.append(SystemMessage(content=context_message))
        langchain_messages.append(HumanMessage(content=user_message))
        prompt = ChatPromptTemplate.from_messages(langchain_messages)
        formatted_messages = prompt.format_messages()
        return [
            {
                "role": "assistant" if message.type == "ai" else "user" if message.type == "human" else "system",
                "content": message.content,
            }
            for message in formatted_messages
        ]

    messages = [{"role": "system", "content": BASE_SYSTEM_PROMPT}]
    messages.extend(
        {"role": "assistant" if role == "ai" else "user", "content": content}
        for role, content in message_specs[1:]
    )
    messages.append({"role": "system", "content": context_message})
    messages.append({"role": "user", "content": user_message})
    return messages


def build_report_explanation_prompt(
    *,
    disease_name: str,
    probability: float,
    top_features: list[dict[str, object]],
    report_context: str,
) -> str:
    feature_lines = "\n".join(
        f"- {item.get('parameter', 'Feature')}: contribution {item.get('contribution_score', 0)}"
        for item in top_features
    )
    return (
        f"Explain the {disease_name} risk in patient-friendly language.\n"
        f"Probability: {probability:.1f}%\n"
        f"Top features:\n{feature_lines or '- No feature details available'}\n\n"
        f"Clinical context:\n{report_context or 'No report context available'}"
    )


def build_lifestyle_prompt(*, disease_name: str, report_context: str, top_features: list[dict[str, object]]) -> str:
    feature_lines = ", ".join(item.get("parameter", "Feature") for item in top_features[:5]) or "none"
    return (
        f"Provide concise lifestyle recommendations for {disease_name}. "
        f"Focus only on this report context and the following features: {feature_lines}. "
        f"Report context: {report_context or 'No report context available'}"
    )
