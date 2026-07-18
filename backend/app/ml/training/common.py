from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, average_precision_score, classification_report, f1_score, roc_auc_score
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split


def clean_dataset(frame: pd.DataFrame, feature_names: list[str]) -> tuple[pd.DataFrame, pd.Series]:
    cleaned = frame.copy()
    cleaned = cleaned.drop_duplicates()
    for column in feature_names:
        cleaned[column] = pd.to_numeric(cleaned[column], errors="coerce")
    cleaned["target"] = pd.to_numeric(cleaned["target"], errors="coerce")
    cleaned = cleaned.dropna(subset=["target"])
    cleaned["target"] = cleaned["target"].astype(int)
    return cleaned[feature_names], cleaned["target"]


def train_and_serialize_model(
    *,
    disease_name: str,
    dataset_name: str,
    frame: pd.DataFrame,
    feature_names: list[str],
    model_path: Path,
    random_state: int,
) -> dict[str, Any]:
    X, y = clean_dataset(frame, feature_names)
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.22,
        random_state=random_state,
        stratify=y,
    )

    imputer = SimpleImputer(strategy="median")
    X_train_imputed = imputer.fit_transform(X_train)
    X_test_imputed = imputer.transform(X_test)

    estimator = RandomForestClassifier(
        random_state=random_state,
        class_weight="balanced_subsample",
        n_jobs=-1,
    )
    grid = {
        "n_estimators": [220, 360],
        "max_depth": [4, 7, None],
        "min_samples_leaf": [2, 5],
        "max_features": ["sqrt", 0.75],
    }
    search = GridSearchCV(
        estimator,
        grid,
        scoring="roc_auc",
        cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state),
        n_jobs=-1,
        refit=True,
    )
    search.fit(X_train_imputed, y_train)
    model = search.best_estimator_

    probabilities = model.predict_proba(X_test_imputed)[:, 1]
    predictions = (probabilities >= 0.5).astype(int)
    metrics = {
        "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
        "f1": round(float(f1_score(y_test, predictions)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, probabilities)), 4),
        "average_precision": round(float(average_precision_score(y_test, probabilities)), 4),
        "classification_report": classification_report(y_test, predictions, output_dict=True),
        "best_params": search.best_params_,
        "train_rows": int(len(X_train)),
        "test_rows": int(len(X_test)),
    }

    background_size = min(200, len(X_train_imputed))
    rng = np.random.default_rng(random_state)
    background_indices = rng.choice(len(X_train_imputed), size=background_size, replace=False)
    artifact = {
        "disease_name": disease_name,
        "dataset_name": dataset_name,
        "feature_names": feature_names,
        "imputer": imputer,
        "model": model,
        "threshold": 0.5,
        "metrics": metrics,
        "shap_background": X_train_imputed[background_indices],
    }
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, model_path)
    return artifact
