"""
forecasting.py — Holt's Double Exponential Smoothing (trend model).

Fits a level + trend model on the rolling 7-day consistency series,
then projects 7 days forward.

Uses statsmodels ExponentialSmoothing for proper Holt's method.
Falls back to manual numpy implementation if statsmodels unavailable.
"""
import numpy as np

try:
    from statsmodels.tsa.holtwinters import ExponentialSmoothing as HW
    USE_STATSMODELS = True
except ImportError:
    USE_STATSMODELS = False


def rolling_consistency(series: list[int], window: int = 7) -> list[float]:
    """Compute rolling mean with the given window size."""
    arr = np.array(series, dtype=float)
    result = []
    for i in range(len(arr)):
        w = arr[max(0, i - window + 1): i + 1]
        result.append(float(np.mean(w)))
    return result


def _holt_manual(series: list[float], alpha: float = 0.25, beta: float = 0.1) -> dict:
    """Pure-numpy Holt's linear trend smoothing."""
    if len(series) < 3:
        return {"smoothed": series, "forecast": [], "trend": 0.0}

    l = series[0]
    b = series[1] - series[0]
    smoothed = [float(l)]

    for v in series[1:]:
        prev_l = l
        l = alpha * v + (1 - alpha) * (l + b)
        b = beta * (l - prev_l) + (1 - beta) * b
        smoothed.append(float(np.clip(l, 0, 1)))

    forecast = [float(np.clip(l + (h + 1) * b, 0, 1)) for h in range(7)]
    return {"smoothed": smoothed, "forecast": forecast, "trend": float(b)}


def holt_forecast(series: list[float]) -> dict:
    """
    Returns:
      {
        "smoothed": [...],     # same length as input
        "forecast": [...],     # 7 future values
        "trend": float         # daily trend direction
      }
    """
    if len(series) < 5:
        return {"smoothed": series, "forecast": [series[-1]] * 7 if series else [], "trend": 0.0}

    if USE_STATSMODELS:
        try:
            arr = np.array(series, dtype=float)
            model = HW(arr, trend="add", damped_trend=True)
            fit = model.fit(optimized=True, remove_bias=True)
            smoothed = [float(np.clip(v, 0, 1)) for v in fit.fittedvalues]
            forecast_vals = fit.forecast(7)
            forecast = [float(np.clip(v, 0, 1)) for v in forecast_vals]
            # Approximate trend as slope of last smoothed values
            trend = float(np.polyfit(range(len(smoothed[-7:])), smoothed[-7:], 1)[0])
            return {"smoothed": smoothed, "forecast": forecast, "trend": trend}
        except Exception:
            pass  # fall through to manual

    return _holt_manual(series)
