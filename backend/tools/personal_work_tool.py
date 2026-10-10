
import sqlite3
from pathlib import Path
from datetime import datetime

# Store the database inside the backend folder
BASE_DIR = Path(__file__).resolve().parents[1]
DB_PATH = BASE_DIR / "personal_work.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("""
        CREATE TABLE IF NOT EXISTS personal_work (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            deadline TEXT,
            priority TEXT NOT NULL DEFAULT 'Medium',
            status TEXT NOT NULL DEFAULT 'Pending',
            created_at TEXT NOT NULL
        )
    """)
    return conn


def add_personal_work(title, deadline=None, priority="Medium"):
    title = title.strip()

    if not title:
        return {"success": False, "message": "Task title is required."}

    if priority not in {"Low", "Medium", "High"}:
        return {"success": False, "message": "Invalid priority."}

    if deadline:
        try:
            datetime.strptime(deadline, "%Y-%m-%d")
        except ValueError:
            return {
                "success": False,
                "message": "Deadline must use YYYY-MM-DD format."
            }

    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO personal_work
            (title, deadline, priority, status, created_at)
            VALUES (?, ?, ?, 'Pending', ?)
            """,
            (title, deadline, priority, datetime.now().isoformat())
        )
        task_id = cursor.lastrowid

    return {
        "success": True,
        "message": "Personal work saved successfully.",
        "task": {
            "id": task_id,
            "title": title,
            "deadline": deadline,
            "priority": priority,
            "status": "Pending"
        }
    }


def get_personal_work(status=None):
    with get_connection() as conn:
        if status:
            rows = conn.execute(
                """
                SELECT * FROM personal_work
                WHERE status = ?
                ORDER BY
                    CASE WHEN deadline IS NULL THEN 1 ELSE 0 END,
                    deadline ASC, id DESC
                """,
                (status,)
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT * FROM personal_work
                ORDER BY
                    CASE WHEN deadline IS NULL THEN 1 ELSE 0 END,
                    deadline ASC, id DESC
                """
            ).fetchall()

    return {
        "success": True,
        "count": len(rows),
        "tasks": [dict(row) for row in rows]
    }


def complete_personal_work(task_id):
    with get_connection() as conn:
        cursor = conn.execute(
            """
            UPDATE personal_work
            SET status = 'Completed'
            WHERE id = ? AND status = 'Pending'
            """,
            (task_id,)
        )

    if cursor.rowcount == 0:
        return {
            "success": False,
            "message": "Pending task not found."
        }

    return {
        "success": True,
        "message": f"Personal work {task_id} marked as completed."
    }