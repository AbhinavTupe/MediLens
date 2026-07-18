from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from backend.app.config.settings import MODEL_DIR
from backend.app.ml.features import build_feature_vector, parameters_to_values
from backend.app.ml.shap.explainer import compute_shap_explanation


@dataclass(frozen=True)
class DiseaseModelConfig:
    key: str
    display_name: str
    file_name: str


MODEL_CONFIGS = (
    DiseaseModelConfig("anemia", "Anemia", "anemia_model.joblib"),
    DiseaseModelConfig("diabetes", "Diabetes", "diabetes_model.joblib"),
    DiseaseModelConfig("ckd", "Chronic Kidney Disease", "ckd_model.joblib"),
)


class PredictionEngine:
    def __init__(self, model_dir: Path | None = None) -> None:
        self.model_dir = model_dir or MODEL_DIR
        self._artifacts: dict[str, dict[str, Any]] = {}

    def predict(self, parameters: list[dict[str, Any]] | Any) -> list[dict[str, Any]]:
        values = parameters_to_values(parameters)
        return [self._predict_one(config, values) for config in MODEL_CONFIGS]

    def _predict_one(self, config: DiseaseModelConfig, values: dict[str, float]) -> dict[str, Any]:
        artifact = self._load_artifact(config)
        feature_names = artifact["feature_names"]
        raw_row = build_feature_vector(values, feature_names)
        frame = pd.DataFrame([raw_row], columns=feature_names)
        transformed = artifact["imputer"].transform(frame)

        probability = self._positive_class_probability(artifact["model"], transformed) * 100.0
        predicted_class = "elevated_risk" if probability >= 50.0 else "low_risk"
        confidence = round(max(probability, 100.0 - probability), 1)
        severity = "high" if probability >= 70 else "moderate" if probability >= 40 else "low"
        shap_payload = compute_shap_explanation(artifact, transformed, raw_row)
        coverage = self._feature_coverage(raw_row)
        model_metrics = artifact.get("metrics", {})

        return {
            "name": config.display_name,
            "probability": round(float(probability), 1),
            "confidence": confidence,
            "predicted_class": predicted_class,
            "severity": severity,
            "summary": self._summary(config.display_name, probability, shap_payload["top_features"], coverage),
            "model_metrics": model_metrics,
            "shap_values": shap_payload["shap_values"],
            "top_features": shap_payload["top_features"],
            "feature_importance_visualization_data": shap_payload["feature_importance_visualization_data"],
            "human_readable_explanation": self._human_explanation(config.display_name, probability, shap_payload["top_features"]),
        }

    def _load_artifact(self, config: DiseaseModelConfig) -> dict[str, Any]:
        if config.key in self._artifacts:
            return self._artifacts[config.key]

        model_path = self.model_dir / config.file_name
        if not model_path.exists():
            raise FileNotFoundError(
                f"Missing trained model artifact: {model_path}. Run backend.app.ml.training.train_all.bootstrap_models() first."
            )

        artifact = joblib.load(model_path)
        self._artifacts[config.key] = artifact
        return artifact

    def _positive_class_probability(self, model: Any, transformed: np.ndarray) -> float:
        if not hasattr(model, "predict_proba"):
            raise AttributeError("Loaded model does not expose predict_proba().")

        probabilities = np.asarray(model.predict_proba(transformed))[0]
        classes = list(getattr(model, "classes_", []))
        if 1 in classes:
            return float(probabilities[classes.index(1)])
        if len(probabilities) == 1:
            return float(probabilities[0])
        return float(probabilities[-1])

    def _feature_coverage(self, raw_row: dict[str, float]) -> float:
        known = [value for value in raw_row.values() if value is not None and not np.isnan(value)]
        return round(len(known) / max(len(raw_row), 1), 3)

    def _summary(self, disease_name: str, probability: float, top_features: list[dict[str, Any]], coverage: float) -> str:
        risk_text = "elevated" if probability >= 70 else "moderate" if probability >= 40 else "lower"
        if top_features:
            driver_text = ", ".join(item["parameter"] for item in top_features[:3])
            return f"{disease_name} model indicates {risk_text} risk. Main drivers: {driver_text}. Feature coverage: {round(coverage * 100)}%."
        return f"{disease_name} model indicates {risk_text} risk. Feature coverage: {round(coverage * 100)}%."

    def _human_explanation(self, disease_name: str, probability: float, top_features: list[dict[str, Any]]) -> str:
        risk_text = "high" if probability >= 70 else "moderate" if probability >= 40 else "low"
        if not top_features:
            return f"The trained {disease_name} model estimates a {risk_text} risk pattern from the available laboratory values."
        risk_drivers = [item["parameter"] for item in top_features if item["contribution_score"] > 0][:3]
        protective = [item["parameter"] for item in top_features if item["contribution_score"] < 0][:2]
        segments = [f"The trained {disease_name} model estimates a {risk_text} risk pattern."]
        if risk_drivers:
            segments.append(f"Risk-increasing signals include {', '.join(risk_drivers)}.")
        if protective:
            segments.append(f"Protective signals include {', '.join(protective)}.")
        return " ".join(segments)
