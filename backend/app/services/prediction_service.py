from __future__ import annotations

from typing import Any, Dict, List

from backend.app.ml.inference.prediction_engine import PredictionEngine


class PredictionService:
    def __init__(self) -> None:
        self.engine = PredictionEngine()

    def predict(self, parameters: List[Dict[str, Any]] | Any) -> List[Dict[str, Any]]:
        return self.engine.predict(parameters)
