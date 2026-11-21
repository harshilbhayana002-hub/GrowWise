"""
bayes.py — Naive Bayes day-of-week completion probability.

Models P(done | day_of_week) from observed frequencies.
Uses Laplace (add-1) smoothing to handle days with no observations.

This is Categorical Naive Bayes applied to a single categorical feature.
"""
import numpy as np
from datetime import date

DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def day_probabilities(
    series: list[int],
    dates: list[str],
    laplace: float = 1.0,
) -> list[dict]:
    """
    Returns P(done=1 | day) for each day of the week.

    Laplace smoothing: P(done | day) = (count_done + α) / (count_total + 2α)

    Returns:
      [{"day": "Mon", "prob": 0.72, "n": 13}, ...]  — length 7
    """
    counts = np.zeros(7, dtype=float)   # total observations per day
    done   = np.zeros(7, dtype=float)   # done=1 observations per day

    for val, ds in zip(series, dates):
        clean_ds = str(ds)[:10]
        try:
            dow = date.fromisoformat(clean_ds).weekday()  # 0=Mon … 6=Sun
        except Exception:
            dow = 0
        counts[dow] += 1
        if val == 1:
            done[dow] += 1

    result = []
    for i in range(7):
        prob = (done[i] + laplace) / (counts[i] + 2 * laplace)
        result.append({
            "day":  DAY_NAMES[i],
            "prob": float(np.clip(prob, 0, 1)),
            "n":    int(counts[i]),
        })

    return result
