import sqlite3
from pathlib import Path

from backend.app.config.settings import DATABASE_PATH
from backend.app.medical_knowledge import DISEASE_KNOWLEDGE, iter_specs


def get_connection() -> sqlite3.Connection:
    Path(DATABASE_PATH).parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY,
                patient_name TEXT,
                hospital TEXT,
                report_date TEXT,
                report_type TEXT,
                status TEXT,
                risk_score INTEGER,
                total_parameters INTEGER,
                abnormal_parameters INTEGER,
                raw_text TEXT,
                extracted_data TEXT,
                prediction_summary TEXT,
                ai_explanation TEXT,
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS extracted_parameters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                report_id TEXT NOT NULL,
                name TEXT NOT NULL,
                value REAL NOT NULL,
                unit TEXT,
                normal_range TEXT,
                status TEXT,
                FOREIGN KEY(report_id) REFERENCES reports(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                report_id TEXT NOT NULL,
                name TEXT NOT NULL,
                probability REAL NOT NULL,
                confidence REAL NOT NULL,
                severity TEXT,
                summary TEXT,
                shap_summary TEXT,
                FOREIGN KEY(report_id) REFERENCES reports(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS medical_reference_ranges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                parameter_name TEXT UNIQUE NOT NULL,
                normal_min REAL NOT NULL,
                normal_max REAL NOT NULL,
                unit TEXT
            );

            CREATE TABLE IF NOT EXISTS disease_information (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                disease_name TEXT UNIQUE NOT NULL,
                description TEXT,
                risk_factors TEXT
            );

            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                report_id TEXT,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )

        for spec in iter_specs():
            normal_min = float(spec.normal_min if spec.normal_min is not None else 0.0)
            normal_max = float(spec.normal_max if spec.normal_max is not None else 9999.0)
            conn.execute(
                """
                INSERT OR IGNORE INTO medical_reference_ranges(parameter_name, normal_min, normal_max, unit)
                VALUES (?, ?, ?, ?)
                """,
                (spec.name, normal_min, normal_max, spec.unit),
            )

        for disease_name, knowledge in DISEASE_KNOWLEDGE.items():
            conn.execute(
                """
                INSERT OR IGNORE INTO disease_information(disease_name, description, risk_factors)
                VALUES (?, ?, ?)
                """,
                (
                    disease_name,
                    str(knowledge["description"]),
                    ", ".join(str(item) for item in knowledge["risk_factors"]),
                ),
            )
        conn.commit()
