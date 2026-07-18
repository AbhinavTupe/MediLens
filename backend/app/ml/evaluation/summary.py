from __future__ import annotations

from typing import Any


def summarize_metrics(metrics: dict[str, Any]) -> str:
    accuracy = metrics.get("accuracy")
    roc_auc = metrics.get("roc_auc")
    f1 = metrics.get("f1")
    return f"accuracy={accuracy}, roc_auc={roc_auc}, f1={f1}"

