"""
clustering.py — K-Means++ weekly behavior archetypes.

Uses scikit-learn's KMeans with k-means++ initialisation.
Input features per week: [consistency, momentum, end_score]
Output labels: "Struggling" | "Building" | "Consistent"
"""
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

K = 3
CLUSTER_NAMES = ["Struggling", "Building", "Consistent"]


def build_week_features(series: list[int]) -> np.ndarray:
    """
    Split a binary series into non-overlapping 7-day windows and
    extract [consistency, momentum, end_score] per week.
    """
    features = []
    for i in range(0, len(series), 7):
        week = series[i: i + 7]
        if len(week) < 4:
            continue
        consistency = np.mean(week)
        start_score = np.mean(week[:3])
        end_score   = np.mean(week[-3:])
        momentum    = float(end_score - start_score)
        features.append([consistency, momentum, end_score])
    return np.array(features, dtype=float)


def cluster_weeks(series: list[int]) -> list[dict]:
    """
    Returns a list of dicts:
      [{"week": 1, "label": "Consistent", "consistency": 0.85}, ...]
    """
    feats = build_week_features(series)
    if len(feats) < 1:
        return []

    # If we have 1 or 2 weeks, categorize by consistency & momentum thresholds
    if len(feats) < K:
        result = []
        for idx in range(len(feats)):
            consistency = float(feats[idx, 0])
            momentum = float(feats[idx, 1])
            if consistency >= 0.7:
                label = "Consistent"
            elif consistency < 0.45 and momentum <= 0:
                label = "Struggling"
            else:
                label = "Building"
            result.append({
                "week": idx + 1,
                "label": label,
                "consistency": consistency,
            })
        return result

    try:
        scaler = StandardScaler()
        feats_scaled = scaler.fit_transform(feats)

        km = KMeans(n_clusters=K, init="k-means++", n_init=10, random_state=42)
        raw_labels = km.fit_predict(feats_scaled)

        # Map cluster indices → meaningful names by average consistency rank
        cluster_means = [
            feats[raw_labels == ci, 0].mean() if np.any(raw_labels == ci) else 0.0
            for ci in range(K)
        ]
        rank_order = np.argsort(cluster_means)          # lowest → highest consistency
        remap = {int(ci): CLUSTER_NAMES[rank] for rank, ci in enumerate(rank_order)}

        return [
            {
                "week": idx + 1,
                "label": remap.get(int(raw_labels[idx]), "Building"),
                "consistency": float(feats[idx, 0]),
            }
            for idx in range(len(feats))
        ]
    except Exception:
        # Fallback to deterministic classification if KMeans hits degenerate variance
        result = []
        for idx in range(len(feats)):
            c = float(feats[idx, 0])
            m = float(feats[idx, 1])
            label = "Consistent" if c >= 0.7 else ("Struggling" if (c < 0.45 and m <= 0) else "Building")
            result.append({"week": idx + 1, "label": label, "consistency": c})
        return result
