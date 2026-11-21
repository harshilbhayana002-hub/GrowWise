from pydantic import BaseModel, Field
from typing import Optional, Union
from datetime import date


class LogEntry(BaseModel):
    date: str          # ISO format: "2025-03-01"
    done: bool


class HabitCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    emoji: str = Field(default="⭐")
    color: str = Field(default="#38bdf8")
    seed_history: bool = Field(default=True)


class HabitUpdate(BaseModel):
    name: Optional[str] = None
    emoji: Optional[str] = None
    color: Optional[str] = None


class Habit(BaseModel):
    id: Union[int, str]
    name: str
    emoji: str
    color: str
    logs: list[LogEntry] = []


# ── ML Response Schemas ────────────────────────────────────────

class DayProbability(BaseModel):
    day: str
    prob: float
    n: int


class WeekCluster(BaseModel):
    week: int           # 1-indexed
    label: str          # "Struggling" | "Building" | "Consistent"
    consistency: float


class ChangePoint(BaseModel):
    index: int
    date: str


class LogisticWeights(BaseModel):
    feature: str
    weight: float


class MLResult(BaseModel):
    habit_id: Union[int, str]
    rolling: list[float]
    smoothed: list[float]
    forecast: list[float]           # 7 days
    trend: float
    tomorrow_prob: float
    logistic_weights: list[LogisticWeights]
    day_probs: list[DayProbability]
    change_points: list[ChangePoint]
    week_clusters: list[WeekCluster]


class CorrelationPair(BaseModel):
    habit_a: Union[int, str]
    habit_b: Union[int, str]
    correlation: float


class SynergyMatrix(BaseModel):
    pairs: list[CorrelationPair]
