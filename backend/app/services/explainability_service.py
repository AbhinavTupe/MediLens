from __future__ import annotations

from typing import Any, Dict, List

from backend.app.medical_knowledge import DISEASE_KNOWLEDGE
from backend.app.ml.features import normalize_parameter_records
from backend.app.ml.inference.prediction_engine import PredictionEngine
from backend.app.ml.llm.service import LLMService


class ExplainabilityService:
    def __init__(self) -> None:
        self.engine = PredictionEngine()
        self.llm = LLMService()

    def explain(self, parameters: List[Dict[str, Any]] | Any, predictions: List[Dict[str, Any]] | Any, report_id: str | None = None) -> Dict[str, Any]:
        normalized_parameters = normalize_parameter_records(parameters)
        normalized_predictions = self._normalize_predictions(predictions)
        if not normalized_predictions:
            normalized_predictions = self.engine.predict(normalized_parameters)

        top_prediction = max(normalized_predictions, key=lambda item: float(item.get("probability", 0)), default=None)
        if top_prediction is None:
            return self._empty_explanation()

        top_features = top_prediction.get("top_features") or []
        feature_visualization = top_prediction.get("feature_importance_visualization_data") or []
        shap_values = top_prediction.get("shap_values") or {}
        report_context = self._build_report_context(normalized_parameters, top_prediction, report_id)

        explanation = self.llm.explain_report(
            disease_name=str(top_prediction.get("name", "Prediction")),
            probability=float(top_prediction.get("probability", 0.0)),
            top_features=top_features,
            report_context=report_context,
        )
        lifestyle_suggestions = self.llm.lifestyle_recommendations(
            disease_name=str(top_prediction.get("name", "Prediction")),
            report_context=report_context,
            top_features=top_features,
        )
        recommendations = self._recommendations(str(top_prediction.get("name", "Prediction")), normalized_parameters, top_features)

        return {
            "explanation": explanation,
            "contributions": self._contributions(top_features),
            "lifestyle_suggestions": lifestyle_suggestions,
            "recommendations": recommendations,
            "shap_values": shap_values,
            "top_features": top_features,
            "feature_importance_visualization_data": feature_visualization,
        }

    def _normalize_predictions(self, predictions: List[Dict[str, Any]] | Any) -> list[dict[str, Any]]:
        normalized: list[dict[str, Any]] = []
        for item in predictions or []:
            if hasattr(item, "model_dump"):
                normalized.append(item.model_dump())
            elif isinstance(item, dict):
                normalized.append(item)
        return normalized

    def _build_report_context(self, parameters: list[dict[str, Any]], top_prediction: dict[str, Any], report_id: str | None) -> str:
        parameter_lines = []
        for item in parameters:
            name = item.get("name", "Parameter")
            value = item.get("value", "")
            unit = item.get("unit", "")
            status = item.get("status", "normal")
            parameter_lines.append(f"- {name}: {value} {unit} ({status})")

        knowledge = DISEASE_KNOWLEDGE.get(top_prediction.get("name", ""), {})
        knowledge_text = str(knowledge.get("reference_text", ""))
        return (
            f"Report ID: {report_id or 'unknown'}\n"
            f"Top prediction: {top_prediction.get('name', 'Prediction')} ({top_prediction.get('probability', 0)}%)\n"
            f"Laboratory parameters:\n" + "\n".join(parameter_lines) +
            (f"\n\nClinical reference:\n{knowledge_text}" if knowledge_text else "")
        )

    def _contributions(self, top_features: list[dict[str, Any]]) -> list[dict[str, Any]]:
        contributions: list[dict[str, Any]] = []
        for item in top_features:
            contributions.append(
                {
                    "parameter": item.get("parameter") or item.get("feature", "Parameter"),
                    "contribution": item.get("contribution_score", item.get("contribution", 0)),
                }
            )
        return contributions

    def _recommendations(self, disease_name: str, parameters: list[dict[str, Any]], top_features: list[dict[str, Any]]) -> list[str]:
        spec_names = {str(item.get("name", "")).lower() for item in parameters}
        suggestions: list[str] = []
        knowledge = DISEASE_KNOWLEDGE.get(disease_name, {})
        if knowledge:
            suggestions.extend(str(item) for item in knowledge.get("lifestyle_suggestions", ()))
            consult_text = str(knowledge.get("when_to_consult", ""))
            if consult_text:
                suggestions.append(consult_text)

        if {"hemoglobin", "ferritin", "mcv", "rdw"} & spec_names:
            suggestions.append("Discuss a repeat CBC and iron studies if symptoms persist.")
        if {"glucose", "hba1c"} & spec_names:
            suggestions.append("Confirm glycemic status with follow-up glucose or HbA1c testing.")
        if {"creatinine", "egfr", "urea"} & spec_names:
            suggestions.append("Review kidney function, medication use, and blood pressure with a clinician.")

        drivers = [str(item.get("parameter", "")) for item in top_features[:3] if item.get("parameter")]
        if drivers:
            suggestions.append(f"Discuss the strongest contributing findings: {', '.join(drivers)}.")

        deduped: list[str] = []
        for suggestion in suggestions:
            cleaned = suggestion.strip()
            if cleaned and cleaned not in deduped:
                deduped.append(cleaned)
        return deduped[:4] or ["Review the report with a licensed clinician."]

    def _empty_explanation(self) -> Dict[str, Any]:
        return {
            "explanation": "No prediction could be generated from the supplied report data.",
            "contributions": [],
            "lifestyle_suggestions": [],
            "recommendations": [],
            "shap_values": {},
            "top_features": [],
            "feature_importance_visualization_data": [],
        }
