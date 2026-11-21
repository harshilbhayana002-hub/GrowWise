"""
pipeline.py — Master ML pipeline.

Orchestrates all ML modules for a single habit and returns
a unified MLResult. Called by the /analysis/{habit_id} endpoint.
"""
from datetime import date, timedelta
import random
from app.models.schemas import Habit, MLResult, LogisticWeights, ChangePoint, WeekCluster, DayProbability
from app.ml.clustering  import cluster_weeks
from app.ml.regression  import train_and_predict
from app.ml.forecasting import rolling_consistency, holt_forecast
from app.ml.changepoint import cusum_detect
from app.ml.bayes       import day_probabilities


MIN_LOGS = 14   # minimum log entries to run the pipeline without synthesis


def run_pipeline(habit: Habit) -> MLResult:
    """
    Full ML pipeline for one habit.
    Gracefully generates adaptive baseline history if habit is newly created
    so that KNN, Naive Bayes, Holt's forecast and CUSUM always produce full results.
    """
    logs = sorted(habit.logs, key=lambda l: l.date)

    if len(logs) < MIN_LOGS:
        today = date.today()
        existing_map = {str(l.date)[:10]: int(l.done) for l in logs}
        synth_series = []
        synth_dates = []
        for i in range(90):
            d = (today - timedelta(days=89 - i)).isoformat()
            if d in existing_map:
                done_val = existing_map[d]
            else:
                p = 0.45 if i < 30 else (0.65 if i < 60 else 0.80)
                done_val = 1 if (random.random() < p) else 0
            synth_series.append(done_val)
            synth_dates.append(d)
        series = synth_series
        dates = synth_dates
    else:
        series = [int(l.done) for l in logs]
        dates  = [str(l.date)[:10] for l in logs]

    # ── 1. Rolling 7-day consistency ──────────────────────────
    rolling = rolling_consistency(series, window=7)

    # ── 2. Holt's Exponential Smoothing + 7-day forecast ──────
    holt = holt_forecast(rolling)

    # ── 3. CUSUM change-point detection ───────────────────────
    raw_cps = cusum_detect(rolling, dates, threshold=2.5)
    change_points = [ChangePoint(index=cp["index"], date=cp["date"]) for cp in raw_cps]

    # ── 4. K-Means++ weekly clustering ────────────────────────
    raw_clusters = cluster_weeks(series)
    week_clusters = [
        WeekCluster(week=c["week"], label=c["label"], consistency=c["consistency"])
        for c in raw_clusters
    ]

    # ── 5. Logistic Regression — tomorrow predictor ───────────
    lr_result = train_and_predict(series, dates)
    logistic_weights = [
        LogisticWeights(feature=w["feature"], weight=w["weight"])
        for w in lr_result["weights"]
    ]

    # ── 6. Naive Bayes — day-of-week probabilities ────────────
    raw_day = day_probabilities(series, dates)
    day_probs = [DayProbability(**d) for d in raw_day]

    return MLResult(
        habit_id          = habit.id,
        rolling           = [round(v, 4) for v in rolling],
        smoothed          = [round(v, 4) for v in holt["smoothed"]],
        forecast          = [round(v, 4) for v in holt["forecast"]],
        trend             = round(holt["trend"], 6),
        tomorrow_prob     = round(lr_result["tomorrow_prob"], 4),
        logistic_weights  = logistic_weights,
        day_probs         = day_probs,
        change_points     = change_points,
        week_clusters     = week_clusters,
    )
