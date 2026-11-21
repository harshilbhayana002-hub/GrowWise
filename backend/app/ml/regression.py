"""
regression.py — Logistic Regression: tomorrow completion predictor.

Features (per day):
  - 7-day rolling consistency
  - 3-day momentum
  - Current streak length (normalised)
  - Day-of-week sin encoding
  - Day-of-week cos encoding

Uses scikit-learn LogisticRegression with L2 regularisation.
"""
import numpy as np
from datetime import date
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

FEATURE_NAMES = ["7d_avg", "3d_momentum", "streak", "dow_sin", "dow_cos"]


def _extract_features(series: list[int], dates: list[str], idx: int) -> list[float] | None:
    if idx < 7:
        return None
    window7 = series[idx - 7: idx]
    window3 = series[idx - 3: idx]
    streak = 0
    for j in range(idx - 1, -1, -1):
        if series[j] == 1:
            streak += 1
        else:
            break
    clean_ds = str(dates[idx])[:10]
    try:
        dow = date.fromisoformat(clean_ds).weekday()  # 0=Mon … 6=Sun
    except Exception:
        dow = 0
    return [
        float(np.mean(window7)),
        float(np.mean(window3)),
        streak / 10.0,
        np.sin(2 * np.pi * dow / 7),
        np.cos(2 * np.pi * dow / 7),
    ]


def train_and_predict(
    series: list[int],
    dates: list[str],
) -> dict:
    """
    Returns:
      {
        "tomorrow_prob": 0.73,
        "weights": [{"feature": "7d_avg", "weight": 1.2}, ...]
      }
    """
    X, y = [], []
    for i in range(7, len(series) - 1):
        feat = _extract_features(series, dates, i)
        if feat:
            X.append(feat)
            y.append(series[i + 1])

    if len(X) < 10 or len(set(y)) < 2:
        return {"tomorrow_prob": 0.5, "weights": []}

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = LogisticRegression(C=1.0, max_iter=500, random_state=42)
    model.fit(X_scaled, y)

    # Predict for tomorrow using today's window
    today_feat = _extract_features(series, dates, len(series) - 1)
    if today_feat is None:
        tomorrow_prob = 0.5
    else:
        today_scaled = scaler.transform([today_feat])
        tomorrow_prob = float(model.predict_proba(today_scaled)[0][1])

    weights = [
        {"feature": FEATURE_NAMES[i], "weight": float(model.coef_[0][i])}
        for i in range(len(FEATURE_NAMES))
    ]

    return {"tomorrow_prob": tomorrow_prob, "weights": weights}
