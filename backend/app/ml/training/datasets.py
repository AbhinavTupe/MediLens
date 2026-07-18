from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from backend.app.ml.features import ANEMIA_FEATURES, CKD_FEATURES, DIABETES_FEATURES, add_engineered_features

DATA_DIR = Path(__file__).resolve().parent / "data"


def _with_missingness(frame: pd.DataFrame, columns: list[str], rate: float, seed: int) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    output = frame.copy()
    for column in columns:
        mask = rng.random(len(output)) < rate
        output.loc[mask, column] = np.nan
    return output


def _add_engineered_columns(frame: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for record in frame.to_dict(orient="records"):
        rows.append(add_engineered_features(record))
    return pd.DataFrame(rows)


def generate_anemia_dataset(rows: int = 1600, seed: int = 41) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    label = rng.binomial(1, 0.36, rows)
    female_pattern = rng.binomial(1, 0.48, rows)
    iron_deficiency = rng.binomial(1, np.where(label == 1, 0.7, 0.1), rows)
    macrocytic = rng.binomial(1, np.where(label == 1, 0.18, 0.04), rows)

    hemoglobin = np.where(label == 1, rng.normal(10.6, 1.25, rows), rng.normal(14.3 - female_pattern * 1.1, 0.85, rows))
    rbc = np.where(label == 1, rng.normal(3.85, 0.55, rows), rng.normal(4.95 - female_pattern * 0.25, 0.35, rows))
    mcv = rng.normal(89, 5.2, rows)
    mcv = np.where(iron_deficiency == 1, rng.normal(74, 6.5, rows), mcv)
    mcv = np.where(macrocytic == 1, rng.normal(104, 7.5, rows), mcv)
    mch = (mcv / 3.25) + rng.normal(0, 1.3, rows)
    mchc = rng.normal(33.5, 1.2, rows)
    rdw = np.where(label == 1, rng.normal(16.2, 2.1, rows), rng.normal(13.2, 0.8, rows))
    ferritin = np.where(iron_deficiency == 1, rng.lognormal(2.35, 0.45, rows), rng.lognormal(4.15, 0.55, rows))
    vitamin_b12 = np.where(macrocytic == 1, rng.normal(165, 55, rows), rng.normal(430, 125, rows))
    wbc = rng.normal(7200, 1850, rows)
    platelets = np.where(iron_deficiency == 1, rng.normal(385000, 70000, rows), rng.normal(260000, 55000, rows))

    frame = pd.DataFrame(
        {
            "hemoglobin": np.clip(hemoglobin, 5.5, 18.5),
            "rbc": np.clip(rbc, 2.2, 6.4),
            "mcv": np.clip(mcv, 55, 122),
            "mch": np.clip(mch, 17, 40),
            "mchc": np.clip(mchc, 27, 38),
            "rdw": np.clip(rdw, 10, 24),
            "ferritin": np.clip(ferritin, 3, 550),
            "vitamin_b12": np.clip(vitamin_b12, 70, 1100),
            "wbc": np.clip(wbc, 2200, 18000),
            "platelets": np.clip(platelets, 90000, 750000),
            "target": label,
        }
    )
    frame = _add_engineered_columns(frame)
    frame["target"] = label
    frame = _with_missingness(frame, [column for column in ANEMIA_FEATURES if column in frame.columns], 0.045, seed + 101)
    return frame[ANEMIA_FEATURES + ["target"]]


def generate_diabetes_dataset(rows: int = 1800, seed: int = 73) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    label = rng.binomial(1, 0.34, rows)
    insulin_resistance = rng.binomial(1, np.where(label == 1, 0.78, 0.18), rows)

    glucose = np.where(label == 1, rng.normal(151, 34, rows), rng.normal(91, 10, rows))
    hba1c = np.where(label == 1, rng.normal(7.2, 1.05, rows), rng.normal(5.25, 0.33, rows))
    triglycerides = np.where(insulin_resistance == 1, rng.normal(215, 72, rows), rng.normal(118, 38, rows))
    hdl = np.where(insulin_resistance == 1, rng.normal(39, 8, rows), rng.normal(53, 10, rows))
    ldl = np.where(label == 1, rng.normal(128, 31, rows), rng.normal(101, 26, rows))
    cholesterol = ldl + hdl + triglycerides / 5 + rng.normal(0, 12, rows)
    creatinine = np.where(label == 1, rng.normal(1.05, 0.22, rows), rng.normal(0.92, 0.18, rows))
    egfr = np.where(label == 1, rng.normal(78, 19, rows), rng.normal(94, 14, rows))

    frame = pd.DataFrame(
        {
            "glucose": np.clip(glucose, 55, 360),
            "hba1c": np.clip(hba1c, 4.1, 13.5),
            "triglycerides": np.clip(triglycerides, 45, 620),
            "hdl": np.clip(hdl, 20, 95),
            "ldl": np.clip(ldl, 35, 260),
            "cholesterol": np.clip(cholesterol, 90, 390),
            "creatinine": np.clip(creatinine, 0.45, 2.4),
            "egfr": np.clip(egfr, 25, 130),
            "target": label,
        }
    )
    frame = _add_engineered_columns(frame)
    frame["target"] = label
    frame = _with_missingness(frame, [column for column in DIABETES_FEATURES if column in frame.columns], 0.04, seed + 101)
    return frame[DIABETES_FEATURES + ["target"]]


def generate_ckd_dataset(rows: int = 1800, seed: int = 97) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    label = rng.binomial(1, 0.33, rows)
    diabetic = rng.binomial(1, np.where(label == 1, 0.46, 0.17), rows)

    creatinine = np.where(label == 1, rng.normal(2.05, 0.82, rows), rng.normal(0.93, 0.18, rows))
    egfr = np.where(label == 1, rng.normal(42, 17, rows), rng.normal(92, 15, rows))
    urea = np.where(label == 1, rng.normal(52, 18, rows), rng.normal(16, 5, rows))
    glucose = np.where(diabetic == 1, rng.normal(151, 38, rows), rng.normal(94, 11, rows))
    hba1c = np.where(diabetic == 1, rng.normal(7.2, 1.1, rows), rng.normal(5.3, 0.35, rows))
    hemoglobin = np.where(label == 1, rng.normal(11.2, 1.4, rows), rng.normal(14.0, 1.0, rows))
    potassium = np.where(label == 1, rng.normal(5.0, 0.55, rows), rng.normal(4.25, 0.35, rows))
    sodium = rng.normal(138.5, 3.1, rows)
    chloride = rng.normal(102.5, 3.4, rows)
    cholesterol = np.where(label == 1, rng.normal(205, 43, rows), rng.normal(178, 32, rows))

    frame = pd.DataFrame(
        {
            "creatinine": np.clip(creatinine, 0.4, 7.5),
            "urea": np.clip(urea, 5, 145),
            "egfr": np.clip(egfr, 6, 132),
            "glucose": np.clip(glucose, 58, 360),
            "hba1c": np.clip(hba1c, 4.0, 13.5),
            "hemoglobin": np.clip(hemoglobin, 6.8, 17.8),
            "potassium": np.clip(potassium, 2.8, 7.2),
            "sodium": np.clip(sodium, 125, 152),
            "chloride": np.clip(chloride, 86, 116),
            "cholesterol": np.clip(cholesterol, 85, 390),
            "target": label,
        }
    )
    frame = _add_engineered_columns(frame)
    frame["target"] = label
    frame = _with_missingness(frame, [column for column in CKD_FEATURES if column in frame.columns], 0.045, seed + 101)
    return frame[CKD_FEATURES + ["target"]]


def load_or_create_dataset(path: Path, generator, rows: int, seed: int) -> pd.DataFrame:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if path.exists():
        return pd.read_csv(path)
    frame = generator(rows=rows, seed=seed)
    frame.to_csv(path, index=False)
    return frame
