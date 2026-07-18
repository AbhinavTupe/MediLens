import json
from typing import Any, Dict
from backend.app.config.settings import UPLOADS_DIR


SETTINGS_FILE = UPLOADS_DIR / "settings.json"
DEFAULT_SETTINGS: Dict[str, Any] = {
    "theme": "system",
    "ai_provider": "groq",
    "notifications": {
        "email": True,
        "high_risk": True,
        "weekly": False,
        "updates": False,
    },
}
_PROVIDER_ALIASES = {
    "claude": "groq",
    "gemini": "groq",
    "gpt-4": "openai",
    "gpt4": "openai",
    "openai": "openai",
    "groq": "groq",
    "ollama": "ollama",
}


def _ensure_dir() -> None:
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


def _merge_settings(settings: Dict[str, Any]) -> Dict[str, Any]:
    merged = {
        "theme": settings.get("theme", DEFAULT_SETTINGS["theme"]),
        "ai_provider": _PROVIDER_ALIASES.get(str(settings.get("ai_provider", "")).lower(), "groq"),
        "notifications": {
            **DEFAULT_SETTINGS["notifications"],
            **(settings.get("notifications") or {}),
        },
    }
    return merged


def get_settings() -> Dict[str, Any]:
    _ensure_dir()
    if SETTINGS_FILE.exists():
        try:
            loaded = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
            if isinstance(loaded, dict):
                return _merge_settings(loaded)
        except Exception:
            pass
    return dict(DEFAULT_SETTINGS)


def save_settings(settings: Dict[str, Any]) -> None:
    _ensure_dir()
    SETTINGS_FILE.write_text(json.dumps(_merge_settings(settings), indent=2), encoding="utf-8")
