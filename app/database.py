import sqlite3
from pathlib import Path
from typing import List, Dict, Any

DB_PATH = Path(__file__).resolve().parent.parent / "hire_sense.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS candidates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            candidate_name TEXT NOT NULL,
            resume_score INTEGER NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            resume_filename TEXT,
            skills TEXT,
            weak_areas TEXT,
            suggestions TEXT
        )
        """
    )
    conn.commit()

    columns = {row[1] for row in conn.execute("PRAGMA table_info(candidates)").fetchall()}
    for column_name, column_type in {
        "skills": "TEXT",
        "weak_areas": "TEXT",
        "suggestions": "TEXT",
    }.items():
        if column_name not in columns:
            conn.execute(f"ALTER TABLE candidates ADD COLUMN {column_name} {column_type}")

    conn.commit()
    conn.close()


def save_candidate(
    candidate_name: str,
    resume_score: int,
    date: str,
    status: str,
    resume_filename: str | None = None,
    skills: str | None = None,
    weak_areas: str | None = None,
    suggestions: str | None = None,
) -> int:
    conn = get_connection()
    cursor = conn.execute(
        """
        INSERT INTO candidates (candidate_name, resume_score, date, status, resume_filename, skills, weak_areas, suggestions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (candidate_name, resume_score, date, status, resume_filename, skills, weak_areas, suggestions),
    )
    candidate_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return candidate_id


def get_candidate_history() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute(
        """
        SELECT id, candidate_name, resume_score, date, status, resume_filename, skills, weak_areas, suggestions
        FROM candidates
        ORDER BY id DESC
        """
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_all_candidates() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute(
        """
        SELECT id, candidate_name, resume_score, date, status, resume_filename, skills, weak_areas, suggestions
        FROM candidates
        ORDER BY id DESC
        """
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_candidate_by_id(candidate_id: int) -> Dict[str, Any] | None:
    conn = get_connection()
    row = conn.execute(
        """
        SELECT id, candidate_name, resume_score, date, status, resume_filename, skills, weak_areas, suggestions
        FROM candidates
        WHERE id = ?
        """,
        (candidate_id,),
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def update_candidate_status(candidate_id: int, status: str) -> None:
    conn = get_connection()
    conn.execute(
        "UPDATE candidates SET status = ? WHERE id = ?",
        (status, candidate_id),
    )
    conn.commit()
    conn.close()


def delete_candidate(candidate_id: int) -> None:
    conn = get_connection()
    conn.execute("DELETE FROM candidates WHERE id = ?", (candidate_id,))
    conn.commit()
    conn.close()


init_db()
