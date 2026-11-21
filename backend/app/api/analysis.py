"""
api/analysis.py — ML analysis endpoints.
"""
from fastapi import APIRouter, HTTPException
from typing import Union
from app.models.schemas import Habit, MLResult, SynergyMatrix, CorrelationPair
from app.ml.pipeline import run_pipeline
from app.ml.correlation import synergy_matrix
from app import db

router = APIRouter(prefix="/analysis", tags=["ml"])


@router.get("/synergy/matrix", response_model=SynergyMatrix)
def get_synergy_matrix():
    """Compute Pearson correlation between all habit pairs in local storage."""
    habits = db.load_habits()
    raw = synergy_matrix([{"id": h.id, "logs": [l.model_dump() for l in h.logs]} for h in habits])
    return SynergyMatrix(pairs=[CorrelationPair(**p) for p in raw])


@router.post("/synergy/run", response_model=SynergyMatrix)
def run_synergy_matrix(habits: list[Habit]):
    """Compute Pearson correlation for any user's habits (Supabase or Cloud)."""
    raw = synergy_matrix([{"id": h.id, "logs": [l.model_dump() for l in h.logs]} for h in habits])
    return SynergyMatrix(pairs=[CorrelationPair(**p) for p in raw])


@router.post("/run", response_model=MLResult)
def run_analysis_payload(habit: Habit):
    """Run full ML pipeline on the provided habit and logs directly."""
    return run_pipeline(habit)


@router.get("/{habit_id}", response_model=MLResult)
def analyse_habit(habit_id: Union[int, str]):
    """Run the full ML pipeline for a single habit from local db."""
    habit = db.get_habit(int(habit_id)) if str(habit_id).isdigit() else None
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found in local db, use POST /analysis/run")
    return run_pipeline(habit)
