import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[3]
APP_DIR = ROOT_DIR / "backend" / "app"

DATABASE_PATH = Path(os.getenv("MEDILENS_DB_PATH", str(APP_DIR / "database" / "medilens.db")))
UPLOADS_DIR = Path(os.getenv("MEDILENS_UPLOAD_DIR", str(APP_DIR / "uploads")))
MODEL_DIR = Path(os.getenv("MEDILENS_MODEL_DIR", str(APP_DIR / "ml" / "models")))
REFERENCE_DOCS_PATH = Path(os.getenv("MEDILENS_REFERENCE_DOCS", str(APP_DIR / "rag" / "reference_docs.txt")))
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
API_TITLE = os.getenv("MEDILENS_API_TITLE", "MediLens AI Healthcare API")
API_VERSION = os.getenv("MEDILENS_API_VERSION", "1.0.0")
