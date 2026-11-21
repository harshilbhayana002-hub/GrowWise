"""
api/habits.py — CRUD endpoints for habits and log entries.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import Habit, HabitCreate, HabitUpdate, LogEntry
from app import db

router = APIRouter(prefix="/habits", tags=["habits"])


@router.get("/", response_model=list[Habit])
def list_habits():
    return db.load_habits()


@router.post("/", response_model=Habit, status_code=201)
def create_habit(body: HabitCreate):
    return db.create_habit(body.name, body.emoji, body.color, body.seed_history)


@router.get("/{habit_id}", response_model=Habit)
def get_habit(habit_id: int):
    habit = db.get_habit(habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit


@router.patch("/{habit_id}", response_model=Habit)
def update_habit(habit_id: int, body: HabitUpdate):
    habit = db.update_habit(habit_id, body.name, body.emoji, body.color)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit


@router.delete("/{habit_id}", status_code=204)
def delete_habit(habit_id: int):
    if not db.delete_habit(habit_id):
        raise HTTPException(status_code=404, detail="Habit not found")


@router.put("/{habit_id}/logs/{log_date}", response_model=Habit)
def toggle_log(habit_id: int, log_date: str, entry: LogEntry):
    """Set the done status for a specific date."""
    habit = db.toggle_log(habit_id, log_date, entry.done)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit


@router.post("/reset", response_model=list[Habit])
def reset_habits():
    """Reset all habits to seed data (dev/demo use)."""
    return db.reset_to_seed()
