"""
db.py — Simple JSON file-based persistence.
Swap this out for SQLAlchemy + Postgres/SQLite with zero changes to the ML layer.
"""
import json
import os
import random
from datetime import date, timedelta
from pathlib import Path

from app.models.schemas import Habit, LogEntry

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_FILE = DATA_DIR / "habits.json"


def _ensure_data_dir():
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def _seed_logs(profile: str = "default") -> list[dict]:
    """Generate 90 days of realistic seed data for demo."""
    today = date.today()
    logs = []
    for i in range(90):
        d = today - timedelta(days=89 - i)
        p = 0.65
        if profile == "dropper":
            p = 0.8 if i < 40 else (0.2 if i < 60 else 0.6)
        elif profile == "riser":
            p = 0.3 if i < 30 else (0.6 if i < 60 else 0.85)
        elif profile == "weekend":
            p = 0.9 if d.weekday() >= 5 else 0.25
        logs.append({"date": d.isoformat(), "done": random.random() < p})
    return logs


def _default_habits() -> list[dict]:
    return [
        {"id": 1, "name": "Morning Run",  "emoji": "🏃", "color": "#f97316", "logs": _seed_logs("dropper")},
        {"id": 2, "name": "Read 30 min",  "emoji": "📚", "color": "#38bdf8", "logs": _seed_logs("riser")},
        {"id": 3, "name": "Meditate",     "emoji": "🧘", "color": "#a78bfa", "logs": _seed_logs("weekend")},
        {"id": 4, "name": "Cold Shower",  "emoji": "🚿", "color": "#34d399", "logs": _seed_logs("default")},
    ]


def load_habits() -> list[Habit]:
    _ensure_data_dir()
    if not DATA_FILE.exists():
        raw = _default_habits()
        _write_raw(raw)
        return [Habit(**h) for h in raw]
    with open(DATA_FILE, encoding="utf-8") as f:
        raw = json.load(f)
    return [Habit(**h) for h in raw]


def _write_raw(data: list[dict]):
    _ensure_data_dir()
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def _save_habits(habits: list[Habit]):
    _write_raw([h.model_dump() for h in habits])


def get_habit(habit_id: int) -> Habit | None:
    habits = load_habits()
    return next((h for h in habits if h.id == habit_id), None)


def create_habit(name: str, emoji: str, color: str, seed_history: bool = True) -> Habit:
    habits = load_habits()
    new_id = max((h.id for h in habits), default=0) + 1
    logs = [LogEntry(**l) for l in _seed_logs("riser")] if seed_history else []
    habit = Habit(id=new_id, name=name, emoji=emoji, color=color, logs=logs)
    habits.append(habit)
    _save_habits(habits)
    return habit


def update_habit(habit_id: int, name: str | None, emoji: str | None, color: str | None) -> Habit | None:
    habits = load_habits()
    for h in habits:
        if h.id == habit_id:
            if name:  h.name  = name
            if emoji: h.emoji = emoji
            if color: h.color = color
            _save_habits(habits)
            return h
    return None


def delete_habit(habit_id: int) -> bool:
    habits = load_habits()
    new_habits = [h for h in habits if h.id != habit_id]
    if len(new_habits) == len(habits):
        return False
    _save_habits(new_habits)
    return True


def toggle_log(habit_id: int, log_date: str, done: bool) -> Habit | None:
    habits = load_habits()
    for h in habits:
        if h.id == habit_id:
            existing = next((l for l in h.logs if l.date == log_date), None)
            if existing:
                existing.done = done
            else:
                h.logs.append(LogEntry(date=log_date, done=done))
            _save_habits(habits)
            return h
    return None


def reset_to_seed() -> list[Habit]:
    raw = _default_habits()
    _write_raw(raw)
    return [Habit(**h) for h in raw]
