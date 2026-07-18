from __future__ import annotations

from backend.app.config.settings import MODEL_DIR
from backend.app.ml.features import DIABETES_FEATURES
from backend.app.ml.training.common import train_and_serialize_model
from backend.app.ml.training.datasets import DATA_DIR, generate_diabetes_dataset, load_or_create_dataset


def train(model_path=None):
    path = model_path or MODEL_DIR / "diabetes_model.joblib"
    dataset_path = DATA_DIR / "diabetes_dataset.csv"
    frame = load_or_create_dataset(dataset_path, generate_diabetes_dataset, rows=1800, seed=73)
    return train_and_serialize_model(
        disease_name="Diabetes",
        dataset_name=str(dataset_path),
        frame=frame,
        feature_names=DIABETES_FEATURES,
        model_path=path,
        random_state=73,
    )


if __name__ == "__main__":
    artifact = train()
    print({"model": "Diabetes", "metrics": artifact["metrics"]})
