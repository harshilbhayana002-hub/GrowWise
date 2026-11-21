"""
correlation.py — Pearson correlation between habits (synergy matrix).

Aligns habits by shared dates, then computes pairwise Pearson r.
A positive r means habits tend to be completed on the same days.
A negative r means they compete (doing one means skipping the other).
"""
import numpy as np
from collections import defaultdict


def _align_series(
    logs_a: list[dict],
    logs_b: list[dict],
) -> tuple[np.ndarray, np.ndarray]:
    """Return two arrays aligned on shared dates."""
    map_a = {l["date"]: int(l["done"]) for l in logs_a}
    map_b = {l["date"]: int(l["done"]) for l in logs_b}
    shared = sorted(set(map_a) & set(map_b))
    if len(shared) < 5:
        return np.array([]), np.array([])
    a = np.array([map_a[d] for d in shared], dtype=float)
    b = np.array([map_b[d] for d in shared], dtype=float)
    return a, b


def pearson(a: np.ndarray, b: np.ndarray) -> float:
    if len(a) < 5:
        return 0.0
    # np.corrcoef returns a 2x2 matrix; [0,1] is the cross-correlation
    mat = np.corrcoef(a, b)
    val = mat[0, 1]
    return float(val) if not np.isnan(val) else 0.0


def synergy_matrix(habits: list[dict]) -> list[dict]:
    """
    habits: list of {"id": int, "logs": [{"date": str, "done": bool}]}

    Returns all pairwise correlations:
      [{"habit_a": 1, "habit_b": 2, "correlation": 0.42}, ...]
    """
    pairs = []
    n = len(habits)
    for i in range(n):
        for j in range(i + 1, n):
            a, b = _align_series(habits[i]["logs"], habits[j]["logs"])
            r = pearson(a, b)
            pairs.append({
                "habit_a":     habits[i]["id"],
                "habit_b":     habits[j]["id"],
                "correlation": round(r, 4),
            })
    return pairs
