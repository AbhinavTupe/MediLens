from __future__ import annotations

import math
import re
from typing import Any, Dict, Iterable

from backend.app.medical_knowledge import PARAMETER_SPECS


RAW_FEATURE_DISPLAY_NAMES = {
    "hemoglobin": "Hemoglobin",
    "rbc": "RBC",
    "wbc": "WBC",
    "platelets": "Platelets",
    "mcv": "MCV",
    "mch": "MCH",
    "mchc": "MCHC",
    "rdw": "RDW",
    "ferritin": "Ferritin",
    "vitamin_d": "Vitamin D",
    "vitamin_b12": "Vitamin B12",
    "creatinine": "Creatinine",
    "urea": "Urea",
    "egfr": "eGFR",
    "glucose": "Glucose",
    "hba1c": "HbA1c",
    "cholesterol": "Cholesterol",
    "triglycerides": "Triglycerides",
    "hdl": "HDL",
    "ldl": "LDL",
    "tsh": "TSH",
    "alt": "ALT",
    "ast": "AST",
    "alp": "ALP",
    "bilirubin": "Bilirubin",
    "sodium": "Sodium",
    "potassium": "Potassium",
    "chloride": "Chloride",
}

ENGINEERED_FEATURE_DISPLAY_NAMES = {
    "hb_mcv_index": "Hemoglobin-MCV index",
    "mcv_mch_ratio": "MCV/MCH ratio",
    "rdw_mcv_index": "RDW-MCV index",
    "glucose_hba1c_index": "Glucose-HbA1c index",
    "triglyceride_hdl_ratio": "Triglyceride/HDL ratio",
    "ldl_hdl_ratio": "LDL/HDL ratio",
    "creatinine_egfr_index": "Creatinine-eGFR index",
    "urea_creatinine_ratio": "Urea/Creatinine ratio",
    "electrolyte_balance": "Sodium-Potassium balance",
}

FEATURE_DISPLAY_NAMES = {
    **RAW_FEATURE_DISPLAY_NAMES,
    **ENGINEERED_FEATURE_DISPLAY_NAMES,
}

ANEMIA_FEATURES = [
    "hemoglobin",
    "rbc",
    "mcv",
    "mch",
    "mchc",
    "rdw",
    "ferritin",
    "vitamin_b12",
    "wbc",
    "platelets",
    "hb_mcv_index",
    "mcv_mch_ratio",
    "rdw_mcv_index",
]

DIABETES_FEATURES = [
    "glucose",
    "hba1c",
    "triglycerides",
    "hdl",
    "ldl",
    "cholesterol",
    "creatinine",
    "egfr",
    "glucose_hba1c_index",
    "triglyceride_hdl_ratio",
    "ldl_hdl_ratio",
]

CKD_FEATURES = [
    "creatinine",
    "urea",
    "egfr",
    "glucose",
    "hba1c",
    "hemoglobin",
    "potassium",
    "sodium",
    "chloride",
    "cholesterol",
    "creatinine_egfr_index",
    "urea_creatinine_ratio",
    "electrolyte_balance",
]


def _normalize_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def _build_alias_map() -> dict[str, str]:
    aliases: dict[str, str] = {}
    explicit = {
        "hb": "hemoglobin",
        "hgb": "hemoglobin",
        "haemoglobin": "hemoglobin",
        "redbloodcell": "rbc",
        "redbloodcells": "rbc",
        "rbccount": "rbc",
        "whitebloodcell": "wbc",
        "whitebloodcells": "wbc",
        "totalleukocytecount": "wbc",
        "tlc": "wbc",
        "plateletcount": "platelets",
        "plt": "platelets",
        "serumcreatinine": "creatinine",
        "scr": "creatinine",
        "bloodurea": "urea",
        "bun": "urea",
        "estimatedgfr": "egfr",
        "fastingglucose": "glucose",
        "bloodglucose": "glucose",
        "fastingbloodsugar": "glucose",
        "fbs": "glucose",
        "hba1c": "hba1c",
        "hba1cpercent": "hba1c",
        "glycatedhemoglobin": "hba1c",
        "a1c": "hba1c",
        "totalcholesterol": "cholesterol",
        "tc": "cholesterol",
        "triglyceride": "triglycerides",
        "tg": "triglycerides",
        "hdlcholesterol": "hdl",
        "ldlcholesterol": "ldl",
        "thyroidstimulatinghormone": "tsh",
        "sgpt": "alt",
        "alanineaminotransferase": "alt",
        "sgot": "ast",
        "aspartateaminotransferase": "ast",
        "alkalinephosphatase": "alp",
        "totalbilirubin": "bilirubin",
        "na": "sodium",
        "na+": "sodium",
        "k": "potassium",
        "k+": "potassium",
        "cl": "chloride",
        "cl-": "chloride",
    }
    aliases.update(explicit)
    for spec in PARAMETER_SPECS.values():
        canonical = _normalize_key(spec.name)
        if canonical in {"vitamind", "vitaminb12"}:
            canonical = "vitamin_d" if canonical == "vitamind" else "vitamin_b12"
        elif canonical == "egfr":
            canonical = "egfr"
        aliases[_normalize_key(spec.name)] = canonical
        for alias in spec.aliases:
            aliases[_normalize_key(alias)] = canonical
    return aliases


PARAMETER_ALIAS_MAP = _build_alias_map()


def normalize_parameter_name(name: str) -> str | None:
    key = _normalize_key(name)
    return PARAMETER_ALIAS_MAP.get(key)


def normalize_parameter_records(parameters: Iterable[Dict[str, Any] | Any]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for item in parameters or []:
        if hasattr(item, "model_dump"):
            payload = item.model_dump()
        elif isinstance(item, dict):
            payload = item
        else:
            payload = {
                "name": getattr(item, "name", ""),
                "value": getattr(item, "value", None),
                "unit": getattr(item, "unit", ""),
                "normal_range": getattr(item, "normal_range", ""),
                "status": getattr(item, "status", "normal"),
            }
        normalized.append(payload)
    return normalized


def parameters_to_values(parameters: Iterable[Dict[str, Any] | Any]) -> dict[str, float]:
    values: dict[str, float] = {}
    for item in normalize_parameter_records(parameters):
        canonical = normalize_parameter_name(str(item.get("name", "")))
        if canonical is None:
            continue
        try:
            value = float(item.get("value"))
        except (TypeError, ValueError):
            continue
        values[canonical] = value
    return values


def add_engineered_features(values: dict[str, float]) -> dict[str, float]:
    enriched = dict(values)

    def ratio(numerator: str, denominator: str) -> float:
        top = enriched.get(numerator)
        bottom = enriched.get(denominator)
        if top is None or bottom in (None, 0):
            return math.nan
        return top / bottom

    def product_scaled(left: str, right: str, scale: float) -> float:
        left_value = enriched.get(left)
        right_value = enriched.get(right)
        if left_value is None or right_value is None:
            return math.nan
        return (left_value * right_value) / scale

    enriched["hb_mcv_index"] = product_scaled("hemoglobin", "mcv", 100.0)
    enriched["mcv_mch_ratio"] = ratio("mcv", "mch")
    enriched["rdw_mcv_index"] = product_scaled("rdw", "mcv", 100.0)
    enriched["glucose_hba1c_index"] = product_scaled("glucose", "hba1c", 100.0)
    enriched["triglyceride_hdl_ratio"] = ratio("triglycerides", "hdl")
    enriched["ldl_hdl_ratio"] = ratio("ldl", "hdl")
    enriched["creatinine_egfr_index"] = ratio("creatinine", "egfr")
    enriched["urea_creatinine_ratio"] = ratio("urea", "creatinine")

    sodium = enriched.get("sodium")
    potassium = enriched.get("potassium")
    chloride = enriched.get("chloride")
    if sodium is None or potassium is None:
        enriched["electrolyte_balance"] = math.nan
    elif chloride is None:
        enriched["electrolyte_balance"] = sodium - potassium
    else:
        enriched["electrolyte_balance"] = sodium - chloride - potassium

    return enriched


def build_feature_vector(values: dict[str, float], feature_names: list[str]) -> dict[str, float]:
    enriched = add_engineered_features(values)
    return {name: enriched.get(name, math.nan) for name in feature_names}


def feature_label(feature_name: str) -> str:
    return FEATURE_DISPLAY_NAMES.get(feature_name, feature_name.replace("_", " ").title())
