import React, { useState } from "react";
import ProbRing       from "./ProbRing.jsx";
import TrendChart     from "./TrendChart.jsx";
import ForecastStrip  from "./ForecastStrip.jsx";
import DayBars        from "./DayBars.jsx";
import ClusterBadges  from "./ClusterBadges.jsx";
import Heatmap        from "./Heatmap.jsx";

const Card = ({ children, style = {} }) => (
  <div style={{
    background: "#0d1117", border: "1px solid #1e293b",
    borderRadius: 14, padding: "20px 22px", ...style,
  }}>
    {children}
  </div>
);

const Label = ({ children }) => (
  <div style={{
    fontSize: 10, fontFamily: "monospace", color: "#475569",
    letterSpacing: 2, marginBottom: 14, textTransform: "uppercase",
  }}>
    {children}
  </div>
);

const Tag = ({ label, color, bg }) => (
  <span style={{
    fontSize: 10, fontFamily: "monospace", padding: "2px 9px",
    borderRadius: 20, background: bg || "#1e293b",
    color: color || "#94a3b8", letterSpacing: 1, whiteSpace: "nowrap",
  }}>
    {label}
  </span>
);

function WeightBars({ weights }) {
  if (!weights?.length) return null;
  const max = Math.max(...weights.map((w) => Math.abs(w.weight)), 0.01);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {weights.map((w) => (
        <div key={w.feature} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 90, fontSize: 10, color: "#64748b",
            fontFamily: "monospace", textAlign: "right", flexShrink: 0 }}>
            {w.feature}
          </div>
          <div style={{ flex: 1, height: 10, background: "#0f172a", borderRadius: 5, overflow: "hidden" }}>
            <div style={{
              width: `${(Math.abs(w.weight) / max) * 100}%`, height: "100%",
              background: w.weight > 0 ? "#22c55e" : "#ef4444",
              borderRadius: 5, transition: "width 0.5s",
            }} />
          </div>
          <div style={{
            width: 40, fontSize: 10, fontFamily: "monospace",
            color: w.weight > 0 ? "#22c55e" : "#ef4444",
          }}>
            {w.weight.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MLDashboard({ habit, ml, mlLoading, mlError, onToggleDate, onDeleteHabit }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (mlLoading) return (
    <Card style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
      <div style={{ textAlign: "center", color: "#475569", fontFamily: "monospace", fontSize: 12 }}>
        Running ML pipeline…
      </div>
    </Card>
  );

  if (mlError) return (
    <Card style={{ display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: 320, gap: 16 }}>
      <div style={{ textAlign: "center", color: "#475569", fontFamily: "monospace", fontSize: 12 }}>
        {mlError}
      </div>
      <div style={{ fontSize: 10, color: "#334155", fontFamily: "monospace" }}>
        Click past dates below to add logs and activate the pipeline.
      </div>
      <Heatmap
        logs={habit.logs} color={habit.color}
        changePoints={[]}
        onToggleDate={onToggleDate}
      />
    </Card>
  );

  if (!ml) return null;

  const trendLabel = ml.trend > 0.01 ? "▲ Rising" : ml.trend < -0.01 ? "▼ Falling" : "→ Stable";
  const trendColor = ml.trend > 0.01 ? "#4ade80" : ml.trend < -0.01 ? "#f87171" : "#94a3b8";
  const lastRolling = ml.rolling[ml.rolling.length - 1] ?? 0;

  const bestDay  = ml.day_probs?.length ? ml.day_probs.reduce((a, b) => b.prob > a.prob ? b : a) : null;
  const filteredWorst = ml.day_probs?.filter((d) => d.n > 2) ?? [];
  const worstDay = filteredWorst.length ? filteredWorst.reduce((a, b) => b.prob < a.prob ? b : a) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Active Goal Analytics Banner & Delete Action */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#0d1117",
        border: `1px solid ${habit.color}33`,
        borderRadius: 14,
        padding: "16px 20px",
        boxShadow: `0 0 24px ${habit.color}12`,
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 30 }}>{habit.emoji}</span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 19, fontWeight: 800, color: "#f8fafc" }}>
                {habit.name}
              </span>
              <span style={{
                fontSize: 10,
                fontFamily: "monospace",
                color: habit.color,
                background: `${habit.color}18`,
                border: `1px solid ${habit.color}44`,
                padding: "2px 8px",
                borderRadius: 12,
                fontWeight: 600,
              }}>
                Active Target
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", marginTop: 2 }}>
              {habit.logs?.length || 0} historical entries analyzed across 6 ML algorithms
            </div>
          </div>
        </div>

        {onDeleteHabit && (
          <div>
            {confirmDelete ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#fca5a5", fontFamily: "monospace" }}>
                  Permanently delete goal & all analytics?
                </span>
                <button
                  onClick={() => onDeleteHabit(habit.id)}
                  style={{
                    background: "#ef4444",
                    border: "none",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 12,
                    padding: "6px 14px",
                    borderRadius: 8,
                    cursor: "pointer",
                    boxShadow: "0 0 12px rgba(239, 68, 68, 0.4)",
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    background: "#1e293b",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: 12,
                    padding: "6px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                title="Delete this habit and all its analytics"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#fca5a5",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "8px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                  e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.25)";
                }}
              >
                <span>🗑️</span>
                <span>Delete Goal & Analytics</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Row 1: Prob ring + trend chart + weights */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "start" }}>

        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 20px" }}>
          <Label>Logistic Regression</Label>
          <ProbRing prob={ml.tomorrow_prob} color={habit.color} />
        </Card>

        <Card>
          <Label>Rolling Consistency + Holt's Smoothing · amber = CUSUM change-point</Label>
          <TrendChart
            rolling={ml.rolling} smoothed={ml.smoothed}
            changePoints={ml.change_points} color={habit.color}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <Tag label={`CHANGE-POINTS: ${ml.change_points.length}`} color="#fbbf24" bg="#1c1200" />
            <Tag label={trendLabel} color={trendColor} />
            <Tag label={`${(lastRolling * 100).toFixed(0)}% 7D CONSISTENCY`} color={habit.color} />
            <Tag label={`TREND ${(ml.trend * 100).toFixed(2)}%/DAY`} color="#64748b" />
          </div>
        </Card>

        <Card style={{ padding: "16px 18px", minWidth: 220 }}>
          <Label>Logistic Reg · Feature Weights</Label>
          <WeightBars weights={ml.logistic_weights} />
          <div style={{ fontSize: 10, color: "#334155", fontFamily: "monospace", marginTop: 10 }}>
            🟢 positive predictor · 🔴 negative
          </div>
        </Card>
      </div>

      {/* Row 2: Heatmap */}
      <Card>
        <Label>90-Day Heatmap · click any cell to edit log</Label>
        <Heatmap
          logs={habit.logs} color={habit.color}
          changePoints={ml.change_points}
          onToggleDate={onToggleDate}
        />
      </Card>

      {/* Row 3: Forecast + Naive Bayes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <Label>Holt's Double Exp. Smoothing — 7-Day Forecast</Label>
          <ForecastStrip forecast={ml.forecast} color={habit.color} />
          <div style={{ fontSize: 10, color: "#334155", fontFamily: "monospace", marginTop: 10 }}>
            statsmodels ExponentialSmoothing with damped trend
          </div>
        </Card>

        <Card>
          <Label>Naive Bayes · Day-of-Week Probability (Laplace smoothed)</Label>
          <DayBars dayProbs={ml.day_probs} color={habit.color} />
          <div style={{ fontSize: 10, color: "#334155", fontFamily: "monospace", marginTop: 6 }}>
            {bestDay ? <>Best: <span style={{ color: habit.color }}>{bestDay.day}</span></> : null}
            {worstDay?.day ? <> · Worst: <span style={{ color: "#f87171" }}>{worstDay.day}</span></> : null}
          </div>
        </Card>
      </div>

      {/* Row 4: K-Means clusters */}
      <Card>
        <Label>K-Means++ Weekly Archetypes (k=3) · scikit-learn · features: consistency, momentum, end-score</Label>
        <ClusterBadges weekClusters={ml.week_clusters} />
      </Card>

    </div>
  );
}
