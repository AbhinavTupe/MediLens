from __future__ import annotations

from pathlib import Path
from typing import Any

from backend.app.config.settings import MODEL_DIR
from backend.app.ml.training.train_all import train_all


def ensure_models(force: bool = False) -> dict[str, Any]:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    model_files = {
        "anemia": MODEL_DIR / "anemia_model.joblib",
        "diabetes": MODEL_DIR / "diabetes_model.joblib",
        "ckd": MODEL_DIR / "ckd_model.joblib",
    }
    missing = [name for name, path in model_files.items() if force or not path.exists()]
    if missing:
        return train_all()
    return {"status": "ready", "models": {name: str(path) for name, path in model_files.items()}}

