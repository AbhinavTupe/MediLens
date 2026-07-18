import re
from typing import Any, Dict, Iterable, List

from backend.app.medical_knowledge import PARAMETER_SPECS, ParameterSpec


class ExtractionService:
    def __init__(self) -> None:
        self.supported_parameters = list(PARAMETER_SPECS.values())
        self._unit_aliases = {
            "g/dl": "g/dL",
            "gm/dl": "g/dL",
            "mg/dl": "mg/dL",
            "ng/ml": "ng/mL",
            "pg/ml": "pg/mL",
            "u/l": "U/L",
            "iu/l": "U/L",
            "mmol/l": "mmol/L",
            "meq/l": "mEq/L",
            "million/ul": "million/uL",
            "million/µl": "million/uL",
            "/ul": "/uL",
            "/µl": "/uL",
            "fl": "fL",
            "pg": "pg",
            "%": "%",
            "uiu/ml": "uIU/mL",
            "miu/l": "mIU/L",
            "ml/min/1.73m2": "mL/min/1.73m2",
            "ml/min/1.73 m2": "mL/min/1.73m2",
        }

    def extract_parameters(self, text: str) -> Dict[str, Any]:
        normalized = self._normalize_text(text)
        parameters: List[Dict[str, Any]] = []
        seen: set[str] = set()

        for spec in self.supported_parameters:
            match = self._find_parameter_match(spec, normalized)
            if match:
                value = self._parse_value(match.group("value"))
                unit = self._extract_unit(match.group(0)) or spec.unit
                parameters.append(
                    {
                        "name": spec.name,
                        "value": value,
                        "unit": unit,
                        "normal_range": spec.normal_range,
                        "status": self._classify_status(spec, value),
                    }
                )
                seen.add(spec.name)

        return {"parameters": parameters}

    def _normalize_text(self, text: str) -> str:
        normalized = (text or "").replace("µ", "u").replace("μ", "u")
        normalized = re.sub(r"(?i)(mg|g|ng|pg|u|iu|mmol|meq)\s*/\s*(dl|ml|l|ul)", r"\1/\2", normalized)
        normalized = re.sub(r"\s+", " ", normalized)
        return normalized.strip()

    def _find_parameter_match(self, spec: ParameterSpec, normalized: str) -> re.Match[str] | None:
        candidates = sorted(self._aliases_for(spec), key=len, reverse=True)
        value_pattern = r"(?P<value>[<>]?\s*\d+(?:\.\d+)?)"
        separator = r"(?:\s*(?:count|level|value|result)?\s*[:=\-]?\s*)"
        unit_pattern = (
            r"(?:\s*(?:million/uL|mL/min/1\.73\s?m2|g/dL|gm/dL|mg/dL|ng/mL|pg/mL|"
            r"uIU/mL|mIU/L|mmol/L|mEq/L|U/L|IU/L|/uL|fL|pg|%))?"
        )

        for alias in candidates:
            alias_pattern = self._alias_pattern(alias)
            match = re.search(rf"\b{alias_pattern}\b{separator}{value_pattern}{unit_pattern}", normalized, re.IGNORECASE)
            if match:
                return match
        return None

    def _aliases_for(self, spec: ParameterSpec) -> Iterable[str]:
        return (spec.name, *spec.aliases)

    def _alias_pattern(self, alias: str) -> str:
        if alias.lower() in {"na", "k", "cl"}:
            return rf"{re.escape(alias)}\+?"
        if alias.lower() in {"na+", "k+", "cl-"}:
            return re.escape(alias).replace("\\+", r"\+").replace("\\-", r"\-")
        return re.escape(alias).replace(r"\ ", r"\s+")

    def _parse_value(self, raw: str) -> float:
        return float(raw.replace("<", "").replace(">", "").strip())

    def _extract_unit(self, snippet: str) -> str:
        unit_match = re.search(
            r"(million/uL|mL/min/1\.73\s?m2|g/dL|gm/dL|mg/dL|ng/mL|pg/mL|uIU/mL|mIU/L|"
            r"mmol/L|mEq/L|U/L|IU/L|/uL|fL|pg|%)",
            snippet,
            re.IGNORECASE,
        )
        if not unit_match:
            return ""
        unit = unit_match.group(1).replace(" ", "")
        return self._unit_aliases.get(unit.lower(), unit)

    def _classify_status(self, spec: ParameterSpec, value: float) -> str:
        low = spec.normal_min
        high = spec.normal_max

        if low is not None and value < low:
            borderline_floor = low * 0.9 if low else low - 0.1
            return "borderline" if value >= borderline_floor else "critical"
        if high is not None and value > high:
            borderline_ceiling = high * 1.1 if high else high + 0.1
            return "borderline" if value <= borderline_ceiling else "critical"
        return "normal"
