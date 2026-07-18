from __future__ import annotations

from typing import Any

import numpy as np

from backend.app.ml.features import feature_label


def _positive_class_values(raw_values: Any) -> np.ndarray:
    values = raw_values
    if isinstance(values, list):
        values = values[1] if len(values) > 1 else values[0]
    values = np.asarray(values)
    if values.ndim == 3:
        values = values[:, :, 1]
    if values.ndim == 2:
        return values[0]
    return values


def compute_shap_explanation(artifact: dict[str, Any], transformed_row: np.ndarray, raw_feature_row: dict[str, float]) -> dict[str, Any]:
    feature_names = artifact["feature_names"]
    shap_values: np.ndarray
    base_value: float | None = None
    method = "shap_tree_explainer"

    try:
        import shap

        explainer = shap.TreeExplainer(artifact["model"], data=artifact.get("shap_background"))
        raw_values = explainer.shap_values(transformed_row)
        shap_values = _positive_class_values(raw_values)
        expected_value = explainer.expected_value
        if isinstance(expected_value, (list, tuple, np.ndarray)):
            expected = np.asarray(expected_value)
            base_value = float(expected[1] if expected.ndim == 1 and len(expected) > 1 else expected.flatten()[0])
        else:
            base_value = float(expected_value)
    except Exception:
        importances = getattr(artifact["model"], "feature_importances_", None)
        if importances is None:
            importances = np.ones(len(feature_names)) / len(feature_names)
        centered = transformed_row[0] - np.nanmean(artifact.get("shap_background", transformed_row), axis=0)
        shap_values = np.asarray(importances) * centered
        method = "model_importance_fallback"

    total_abs = float(np.sum(np.abs(shap_values))) or 1.0
    rows = []
    shap_map = {}
    for feature_name, shap_value in zip(feature_names, shap_values):
        contribution_score = round(float(shap_value / total_abs * 100), 2)
        display = feature_label(feature_name)
        raw_value = raw_feature_row.get(feature_name)
        rows.append(
            {
                "feature": feature_name,
                "parameter": display,
                "contribution_score": contribution_score,
                "contribution": contribution_score,
                "shap_value": round(float(shap_value), 6),
                "value": None if raw_value is None or np.isnan(raw_value) else round(float(raw_value), 4),
            }
        )
        shap_map[feature_name] = round(float(shap_value), 6)

    rows.sort(key=lambda item: abs(item["contribution_score"]), reverse=True)
    return {
        "method": method,
        "base_value": base_value,
        "shap_values": shap_map,
        "top_features": rows[:6],
        "feature_importance_visualization_data": [
            {
                "feature": row["parameter"],
                "importance": abs(row["contribution_score"]),
                "direction": "risk" if row["contribution_score"] > 0 else "protective",
            }
            for row in rows[:8]
        ],
    }
