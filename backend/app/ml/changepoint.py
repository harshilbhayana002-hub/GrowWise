"""
changepoint.py — CUSUM (Cumulative Sum) change-point detection.

Detects the exact indices where the habit's behavioral pattern
shifted significantly. Both positive (improvement) and negative
(degradation) changes are detected.

Reference: Page, E.S. (1954) "Continuous inspection schemes"
"""
import numpy as np
from datetime import date, timedelta


def cusum_detect(
    series: list[float],
    dates: list[str],
    threshold: float = 2.5,
    drift: float = 0.5,
) -> list[dict]:
    """
    Run CUSUM on the rolling consistency series.

    Returns a list of change-points:
      [{"index": 45, "date": "2024-12-01"}, ...]
    """
    arr = np.array(series, dtype=float)
    if len(arr) < 6:
        return []

    mean = np.mean(arr)
    std  = np.std(arr) or 0.01

    cp, cn = 0.0, 0.0
    change_points = []

    for i, v in enumerate(arr):
        z = (v - mean) / std
        cp = max(0.0, cp + z - drift)
        cn = max(0.0, cn - z - drift)

        if cp > threshold or cn > threshold:
            change_points.append({
                "index": i,
                "date":  dates[i] if i < len(dates) else "",
            })
            cp, cn = 0.0, 0.0  # reset after detection

    return change_points
