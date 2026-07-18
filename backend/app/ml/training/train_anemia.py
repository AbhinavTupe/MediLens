from __future__ import annotations

from backend.app.config.settings import MODEL_DIR
from backend.app.ml.features import ANEMIA_FEATURES
from backend.app.ml.training.common import train_and_serialize_model
from backend.app.ml.training.datasets import DATA_DIR, generate_anemia_dataset, load_or_create_dataset


def train(model_path=None):
    path = model_path or MODEL_DIR / "anemia_model.joblib"
    dataset_path = DATA_DIR / "anemia_dataset.csv"
    frame = load_or_create_dataset(dataset_path, generate_anemia_dataset, rows=1600, seed=41)
    return train_and_serialize_model(
        disease_name="Anemia",
        dataset_name=str(dataset_path),
        frame=frame,
        feature_names=ANEMIA_FEATURES,
        model_path=path,
        random_state=41,
    )


if __name__ == "__main__":
    artifact = train()
    print({"model": "Anemia", "metrics": artifact["metrics"]})
