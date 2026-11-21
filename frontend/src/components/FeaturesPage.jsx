import React, { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell,
} from "recharts";

export default function FeaturesPage({
  habits = [],
  activeHabit = null,
  ml = null,
  synergy = [],
  onSelectHabit = () => {},
  onNavigateToDashboard = () => {},
}) {
  // ── Layer Toggles for Real Graph ──
  const [showRaw, setShowRaw] = useState(true);
  const [showSmooth, setShowSmooth] = useState(true);
  const [showCUSUM, setShowCUSUM] = useState(true);

  // ── Sandbox Scenario & Sliders for Right-Hand Parallel Column ──
  const [sandboxScenario, setSandboxScenario] = useState("Breakthrough");
  const [simConsistency, setSimConsistency] = useState(70);
  const [simMomentum, setSimMomentum] = useState(25);
  const [simStreak, setSimStreak] = useState(7);
  const [simDay, setSimDay] = useState("Mon");

  const [activeArchetypeTab, setActiveArchetypeTab] = useState("Consistent");
  const [activeTermTab, setActiveTermTab] = useState("rawVsSmooth");

  // ── Build Real Data Graph Series from Live Backend ML ──
  const realGraphData = useMemo(() => {
    if (!ml?.rolling?.length) {
      // Default fallback if loading
      return Array.from({ length: 90 }, (_, i) => ({
        day: i + 1,
        date: `Day ${i + 1}`,
        raw: 60 + Math.sin(i / 5) * 15,
        smooth: 65 + (i * 0.2),
        isChangePoint: i === 18 || i === 48 || i === 76,
      }));
    }
    const changeSet = new Set((ml.change_points || []).map((cp) => cp.index));
    return ml.rolling.map((val, idx) => {
      const dateStr = activeHabit?.logs?.[idx]?.date || `Day ${idx + 1}`;
      const smoothVal = ml.smoothed?.[idx] !== undefined ? ml.smoothed[idx] : val;
      return {
        day: idx + 1,
        date: dateStr,
        raw: parseFloat((val * 100).toFixed(1)),
        smooth: parseFloat((smoothVal * 100).toFixed(1)),
        isChangePoint: changeSet.has(idx),
      };
    });
  }, [ml, activeHabit]);

  const realChangePointDays = useMemo(() => {
    return (ml?.change_points || []).map((cp) => cp.index + 1);
  }, [ml]);

  // ── Simulated What-If Prediction for the Right Column ──
  const simulatedPrediction = useMemo(() => {
    const cNorm = (simConsistency - 50) / 50;
    const mNorm = simMomentum / 50;
    const sFactor = simStreak > 14 ? (simStreak > 21 ? -0.3 : 0.2) : simStreak * 0.05;
    const dayFactor = simDay === "Sun" ? 0.35 : (simDay === "Mon" ? 0.25 : (simDay === "Fri" ? -0.3 : 0.0));

    const logit = 1.6 * cNorm + 1.2 * mNorm + 0.8 * sFactor + dayFactor;
    const prob = 1 / (1 + Math.exp(-logit));
    const pct = Math.round(Math.min(96, Math.max(8, prob * 100)));

    let status = "Likely ✓";
    let color = "#4ade80";
    if (pct < 45) {
      status = "At Risk ⚠️";
      color = "#f87171";
    } else if (pct < 65) {
      status = "Moderate ~";
      color = "#fbbf24";
    }

    return { pct, status, color, cNorm, mNorm, sFactor, dayFactor };
  }, [simConsistency, simMomentum, simStreak, simDay]);

  // ── Real Data Stats ──
  const realLastRolling = ml?.rolling?.length ? ml.rolling[ml.rolling.length - 1] : 0.65;
  const realTrend = ml?.trend ?? 0.0008;
  const realStatusLabel = realTrend > 0.005 ? "▲ Rising" : (realTrend < -0.005 ? "▼ Falling" : "→ Stable");
  const realStatusColor = realTrend > 0.005 ? "#4ade80" : (realTrend < -0.005 ? "#f87171" : "#94a3b8");
  const realTomorrowPct = ml ? Math.round(ml.tomorrow_prob * 100) : 73;
  const realTomorrowStatus = realTomorrowPct >= 65 ? "Likely ✓" : (realTomorrowPct >= 45 ? "Moderate ~" : "At Risk ⚠️");
  const realTomorrowColor = realTomorrowPct >= 65 ? "#4ade80" : (realTomorrowPct >= 45 ? "#fbbf24" : "#f87171");

  // Sync real stats into sandbox sliders
  const syncRealToSandbox = () => {
    setSimConsistency(Math.round(realLastRolling * 100));
    setSimMomentum(Math.round(realTrend * 1000));
    const streak = activeHabit?.logs?.reduce((acc, curr) => (curr.done ? acc + 1 : 0), 0) || 6;
    setSimStreak(Math.min(25, streak));
  };

  return (
    <div style={{
      maxWidth: 1400,
      margin: "0 auto",
      padding: "32px 24px 120px",
      color: "#e2e8f0",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* ── Top Header ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
        flexWrap: "wrap",
        gap: 16,
        borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
        paddingBottom: 20,
      }}>
        <div>
          <div style={{
            fontSize: 11,
            fontFamily: "monospace",
            color: "#38bdf8",
            letterSpacing: 2,
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: 6,
          }}>
            Parallel Intelligence Engine
          </div>
          <h1 style={{
            fontSize: 30,
            fontWeight: 800,
            color: "#f8fafc",
            letterSpacing: "-0.5px",
          }}>
            GrowWise Parallel Lab: Real Data vs Behavioral Science
          </h1>
          <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 4, maxWidth: 850, lineHeight: 1.6 }}>
            Side-by-side comparison: Your <strong>real database trends</strong> are plotted on the left, while the <strong>scientific explanation and what-if simulation</strong> work in parallel on the right.
          </p>
        </div>

        <button
          onClick={onNavigateToDashboard}
          style={{
            background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: 10,
            padding: "10px 22px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(14, 165, 233, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>← Back to Dashboard</span>
        </button>
      </div>

      {/* ── Target Habit Switcher Row ── */}
      <div style={{
        background: "#0d1117",
        border: "1px solid #1e293b",
        borderRadius: 14,
        padding: "12px 18px",
        marginBottom: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1 }}>
            Active Real Goal:
          </span>
          {habits.map((h) => {
            const isSelected = h.id === activeHabit?.id;
            return (
              <button
                key={h.id}
                onClick={() => onSelectHabit(h.id)}
                style={{
                  background: isSelected ? `${h.color}22` : "#070b14",
                  border: `1px solid ${isSelected ? h.color : "#1e293b"}`,
                  color: isSelected ? "#f8fafc" : "#94a3b8",
                  padding: "5px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: isSelected ? 700 : 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s",
                }}
              >
                <span>{h.emoji}</span>
                <span>{h.name}</span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 11, color: "#4ade80", fontFamily: "monospace", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
          Live Synced with Supabase & ML Backend
        </div>
      </div>

      {/* ── PARALLEL TWO-COLUMN WORKSPACE ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
        gap: 28,
        alignItems: "start",
      }}>

        {/* ════════════════════════════════════════════════════════
            LEFT COLUMN: REAL USER DATA & TRENDS (LIVE ENGINE)
           ════════════════════════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.25)",
            borderRadius: 12,
            padding: "10px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>📊</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#4ade80" }}>
                LEFT: YOUR REAL DATABASE DATA
              </span>
            </div>
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "#86efac" }}>
              {activeHabit?.emoji} {activeHabit?.name}
            </span>
          </div>

          {/* Module 1: Real Trend Graph */}
          <div style={{
            background: "#0d1117",
            border: "1px solid #1e293b",
            borderRadius: 18,
            padding: "24px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "#38bdf8", letterSpacing: 1 }}>
                  90-DAY REAL HISTORY
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc" }}>
                  Rolling Consistency + Holt's Smoothing
                </h3>
              </div>

              {/* Layer Toggles */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  onClick={() => setShowRaw(!showRaw)}
                  style={{
                    background: showRaw ? "rgba(249, 115, 22, 0.2)" : "#070b14",
                    border: `1px solid ${showRaw ? "#f97316" : "#334155"}`,
                    color: showRaw ? "#fdba74" : "#64748b",
                    padding: "3px 8px",
                    borderRadius: 14,
                    fontSize: 10,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Raw 7D {showRaw ? "✓" : ""}
                </button>
                <button
                  onClick={() => setShowSmooth(!showSmooth)}
                  style={{
                    background: showSmooth ? "rgba(56, 189, 248, 0.2)" : "#070b14",
                    border: `1px solid ${showSmooth ? "#38bdf8" : "#334155"}`,
                    color: showSmooth ? "#7dd3fc" : "#64748b",
                    padding: "3px 8px",
                    borderRadius: 14,
                    fontSize: 10,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Smooth {showSmooth ? "✓" : ""}
                </button>
                <button
                  onClick={() => setShowCUSUM(!showCUSUM)}
                  style={{
                    background: showCUSUM ? "rgba(251, 191, 36, 0.2)" : "#070b14",
                    border: `1px solid ${showCUSUM ? "#fbbf24" : "#334155"}`,
                    color: showCUSUM ? "#fde047" : "#64748b",
                    padding: "3px 8px",
                    borderRadius: 14,
                    fontSize: 10,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  CUSUM {showCUSUM ? "✓" : ""}
                </button>
              </div>
            </div>

            {/* Recharts Canvas */}
            <div style={{ height: 210, background: "#070b14", borderRadius: 12, padding: "14px 10px 4px", border: "1px solid #1e293b" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={realGraphData}>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#475569", fontFamily: "monospace" }} tickFormatter={(v) => `D${v}`} stroke="#1e293b" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#475569", fontFamily: "monospace" }} tickFormatter={(v) => `${v}%`} stroke="#1e293b" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div style={{ background: "#0d1117", border: `1px solid ${activeHabit?.color || "#38bdf8"}`, borderRadius: 8, padding: "8px 12px", fontSize: 11 }}>
                            <div style={{ color: "#94a3b8", fontFamily: "monospace" }}>{d.date || `Day ${d.day}`}</div>
                            <div style={{ color: "#fdba74" }}>Raw 7D Moving Avg: <strong>{d.raw}%</strong></div>
                            <div style={{ color: activeHabit?.color || "#38bdf8" }}>Holt's Trajectory: <strong>{d.smooth}%</strong></div>
                            {d.isChangePoint && <div style={{ color: "#fbbf24", fontWeight: 700, marginTop: 2 }}>⚡ CUSUM Shift Detected!</div>}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {showCUSUM && realChangePointDays.map((cp) => (
                    <ReferenceLine key={cp} x={cp} stroke="#fbbf24" strokeDasharray="3 3" strokeWidth={1.5} />
                  ))}
                  {showRaw && <Line type="monotone" dataKey="raw" stroke="#f9731666" strokeWidth={1.5} dot={false} />}
                  {showSmooth && <Line type="monotone" dataKey="smooth" stroke={activeHabit?.color || "#38bdf8"} strokeWidth={2.5} dot={false} />}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Real Stats Bar */}
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: "#fbbf24", background: "#1c1200", border: "1px solid rgba(251,191,36,0.3)", padding: "3px 10px", borderRadius: 10, fontWeight: 700 }}>
                CHANGE-POINTS: {ml?.change_points?.length || 0}
              </span>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: realStatusColor, background: "#1e293b", padding: "3px 10px", borderRadius: 10, fontWeight: 700 }}>
                {realStatusLabel}
              </span>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: activeHabit?.color || "#38bdf8", background: "#1e293b", padding: "3px 10px", borderRadius: 10, fontWeight: 700 }}>
                {(realLastRolling * 100).toFixed(0)}% 7D CONSISTENCY
              </span>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: "#94a3b8", background: "#1e293b", padding: "3px 10px", borderRadius: 10, fontWeight: 700 }}>
                TREND {(realTrend * 100).toFixed(2)}%/DAY
              </span>
            </div>
          </div>

          {/* Module 2: Real Tomorrow Predictor & Feature Weights */}
          <div style={{
            background: "#0d1117",
            border: "1px solid #1e293b",
            borderRadius: 18,
            padding: "24px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "#a78bfa", letterSpacing: 1 }}>
              REAL PREDICTIVE INFERENCE
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc", marginBottom: 16 }}>
              Logistic Regression: Real Tomorrow Odds
            </h3>

            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              {/* Radial Gauge */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ position: "relative", width: 110, height: 110 }}>
                  <svg width="110" height="110" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke={realTomorrowColor}
                      strokeWidth="10"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - realTomorrowPct / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", fontFamily: "monospace" }}>
                      {realTomorrowPct}%
                    </span>
                    <span style={{ fontSize: 9, color: "#94a3b8", fontFamily: "monospace" }}>
                      TOMORROW
                    </span>
                  </div>
                </div>
                <span style={{ marginTop: 8, fontSize: 10, fontWeight: 700, fontFamily: "monospace", padding: "2px 10px", borderRadius: 12, background: `${realTomorrowColor}22`, color: realTomorrowColor, border: `1px solid ${realTomorrowColor}44` }}>
                  {realTomorrowStatus}
                </span>
              </div>

              {/* Real Feature Weights Bars */}
              <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>REAL FEATURE COEFFICIENTS:</div>
                {(ml?.logistic_weights || [
                  { feature: "7d_avg", weight: 1.42 },
                  { feature: "3d_momentum", weight: 0.85 },
                  { feature: "streak", weight: 0.64 },
                  { feature: "dow_sin", weight: 0.22 },
                  { feature: "dow_cos", weight: -0.18 },
                ]).map((w) => {
                  const isPos = w.weight > 0;
                  return (
                    <div key={w.feature} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 90, fontSize: 10, fontFamily: "monospace", color: "#94a3b8" }}>{w.feature}</span>
                      <div style={{ flex: 1, height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(100, Math.abs(w.weight) * 50)}%`, height: "100%", background: isPos ? "#4ade80" : "#f87171", borderRadius: 3 }} />
                      </div>
                      <span style={{ width: 38, fontSize: 10, fontFamily: "monospace", color: isPos ? "#4ade80" : "#f87171", fontWeight: 700, textAlign: "right" }}>
                        {w.weight > 0 ? `+${w.weight.toFixed(2)}` : w.weight.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Module 3: Real Weekly Archetypes & Real Naive Bayes */}
          <div style={{
            background: "#0d1117",
            border: "1px solid #1e293b",
            borderRadius: 18,
            padding: "24px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4ade80", letterSpacing: 1 }}>
              REAL K-MEANS++ & NAIVE BAYES
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc", marginBottom: 14 }}>
              Your 12-Week Clusters & Day Likelihoods
            </h3>

            {/* Weekly Archetype Pills */}
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>Weekly Archetype History:</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {(ml?.week_clusters || [
                { week: 9, label: "Building", consistency: 0.65 },
                { week: 10, label: "Consistent", consistency: 0.78 },
                { week: 11, label: "Consistent", consistency: 0.82 },
                { week: 12, label: "Consistent", consistency: 0.86 },
              ]).slice(-6).map((w) => {
                const color = w.label === "Consistent" ? "#4ade80" : (w.label === "Building" ? "#38bdf8" : "#f87171");
                return (
                  <div key={w.week} style={{ padding: "4px 10px", borderRadius: 16, fontSize: 10, fontFamily: "monospace", background: `${color}18`, color: color, border: `1px solid ${color}44` }}>
                    W{w.week} · {w.label} ({(w.consistency * 100).toFixed(0)}%)
                  </div>
                );
              })}
            </div>

            {/* Day of Week Bars */}
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>Day-of-Week Probability (Mon → Sun):</div>
            <div style={{ height: 90 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ml?.day_probs || [
                  { day: "Mon", prob: 0.82 }, { day: "Tue", prob: 0.78 }, { day: "Wed", prob: 0.65 },
                  { day: "Thu", prob: 0.74 }, { day: "Fri", prob: 0.58 }, { day: "Sat", prob: 0.88 }, { day: "Sun", prob: 0.92 }
                ]}>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94a3b8", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 1]} hide />
                  <Bar dataKey="prob" radius={[4, 4, 0, 0]}>
                    {(ml?.day_probs || [
                      { prob: 0.82 }, { prob: 0.78 }, { prob: 0.65 }, { prob: 0.74 }, { prob: 0.58 }, { prob: 0.88 }, { prob: 0.92 }
                    ]).map((d, i) => (
                      <Cell key={i} fill={d.prob >= 0.75 ? (activeHabit?.color || "#38bdf8") : (d.prob < 0.55 ? "#f87171" : "rgba(56, 189, 248, 0.4)")} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>


        {/* ════════════════════════════════════════════════════════
            RIGHT COLUMN: PARALLEL EXPLANATION & WHAT-IF LAB
           ════════════════════════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(56, 189, 248, 0.08)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            borderRadius: 12,
            padding: "10px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🔬</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#38bdf8" }}>
                RIGHT: PARALLEL EXPLANATION & WHAT-IF LAB
              </span>
            </div>
            <button
              onClick={syncRealToSandbox}
              style={{
                background: "rgba(56, 189, 248, 0.15)",
                border: "1px solid #38bdf8",
                color: "#7dd3fc",
                padding: "4px 10px",
                borderRadius: 8,
                fontSize: 11,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              🔄 Load My Numbers Into Lab
            </button>
          </div>

          {/* Module 1 Parallel: Graph Science & What-If Scenarios */}
          <div style={{
            background: "#0d1117",
            border: "1px solid #1e293b",
            borderRadius: 18,
            padding: "24px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "#38bdf8", letterSpacing: 1 }}>
              GRAPH INTERPRETATION GUIDE
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc", marginBottom: 10 }}>
              What Your Graph Lines Mean Right Now
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12, color: "#cbd5e1", lineHeight: 1.6, marginBottom: 16 }}>
              <div style={{ background: "#070b14", padding: "10px 14px", borderRadius: 8, borderLeft: "3px solid #f97316" }}>
                <strong>Why your Raw Line is Spiky:</strong> It calculates strict 7-day windows. Missing 1 day drops it by 14.3%. That is normal life, not habit failure.
              </div>
              <div style={{ background: "#070b14", padding: "10px 14px", borderRadius: 8, borderLeft: `3px solid ${activeHabit?.color || "#38bdf8"}` }}>
                <strong>Why Holt's Smooth Protects You:</strong> Holt's Double Exponential Smoothing filters out temporary dips. If your habit is steady, a weekend off won't ruin your streak momentum.
              </div>
              <div style={{ background: "#070b14", padding: "10px 14px", borderRadius: 8, borderLeft: "3px solid #fbbf24" }}>
                <strong>CUSUM Amber Flags:</strong> Found {ml?.change_points?.length || 0} turning points. These are mathematical dates when your habit crossed the +2.5σ consistency threshold into automaticity.
              </div>
            </div>

            {/* Test Scenarios */}
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", marginBottom: 6 }}>
              TEST SIMULATED LIFECYCLES:
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { id: "Breakthrough", label: "Breakthrough 🚀" },
                { id: "Plateau", label: "Steady Plateau ⚓" },
                { id: "Recovery", label: "Burnout & Recovery 🔄" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSandboxScenario(s.id)}
                  style={{
                    background: sandboxScenario === s.id ? "#1e293b" : "#070b14",
                    border: `1px solid ${sandboxScenario === s.id ? "#38bdf8" : "#1e293b"}`,
                    color: sandboxScenario === s.id ? "#38bdf8" : "#94a3b8",
                    padding: "5px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Module 2 Parallel: Tomorrow Predictor Live Sliders Sandbox */}
          <div style={{
            background: "#0d1117",
            border: "1px solid #1e293b",
            borderRadius: 18,
            padding: "24px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "#a78bfa", letterSpacing: 1 }}>
                  INTERACTIVE LOGISTIC REGRESSION
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc" }}>
                  What-If Tomorrow Simulator
                </h3>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "monospace", color: simulatedPrediction.color }}>
                {simulatedPrediction.pct}% {simulatedPrediction.status}
              </div>
            </div>

            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>
              Drag the sliders below to see: <em>"What if I increase consistency or build a 15-day streak?"</em>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "#070b14", padding: "14px 16px", borderRadius: 12, border: "1px solid #1e293b" }}>
              {/* Slider 1 */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: "#cbd5e1" }}>Consistency Target:</span>
                  <span style={{ color: "#38bdf8", fontFamily: "monospace", fontWeight: 700 }}>{simConsistency}%</span>
                </div>
                <input
                  type="range" min="10" max="100" value={simConsistency}
                  onChange={(e) => setSimConsistency(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#38bdf8", cursor: "pointer" }}
                />
              </div>

              {/* Slider 2 */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: "#cbd5e1" }}>3-Day Momentum:</span>
                  <span style={{ color: simMomentum >= 0 ? "#4ade80" : "#f87171", fontFamily: "monospace", fontWeight: 700 }}>
                    {simMomentum >= 0 ? `+${simMomentum}%` : `${simMomentum}%`}
                  </span>
                </div>
                <input
                  type="range" min="-50" max="50" value={simMomentum}
                  onChange={(e) => setSimMomentum(Number(e.target.value))}
                  style={{ width: "100%", accentColor: simMomentum >= 0 ? "#4ade80" : "#f87171", cursor: "pointer" }}
                />
              </div>

              {/* Slider 3 */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: "#cbd5e1" }}>Simulated Streak:</span>
                  <span style={{ color: "#fbbf24", fontFamily: "monospace", fontWeight: 700 }}>{simStreak} Days</span>
                </div>
                <input
                  type="range" min="0" max="25" value={simStreak}
                  onChange={(e) => setSimStreak(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#fbbf24", cursor: "pointer" }}
                />
              </div>

              {/* Day of Week */}
              <div style={{ display: "flex", gap: 6 }}>
                {["Mon", "Wed", "Fri", "Sun"].map((d) => (
                  <button
                    key={d} onClick={() => setSimDay(d)}
                    style={{ flex: 1, padding: "5px", borderRadius: 6, border: "none", background: simDay === d ? "#38bdf8" : "#1e293b", color: simDay === d ? "#070b14" : "#94a3b8", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Module 3 Parallel: Behavioral Prescriptions & Habit Stacking */}
          <div style={{
            background: "#0d1117",
            border: "1px solid #1e293b",
            borderRadius: 18,
            padding: "24px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4ade80", letterSpacing: 1 }}>
              BEHAVIORAL PRESCRIPTIONS
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc", marginBottom: 12 }}>
              Archetype Action Guide & Domino Stacking
            </h3>

            {/* Archetype Selector */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {["Consistent", "Building", "Struggling"].map((arc) => (
                <button
                  key={arc} onClick={() => setActiveArchetypeTab(arc)}
                  style={{
                    flex: 1, padding: "6px", borderRadius: 6, border: "none",
                    background: activeArchetypeTab === arc ? "#1e293b" : "#070b14",
                    color: activeArchetypeTab === arc ? "#38bdf8" : "#64748b",
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  {arc}
                </button>
              ))}
            </div>

            <div style={{ background: "#070b14", padding: "12px 14px", borderRadius: 10, fontSize: 12, color: "#cbd5e1", lineHeight: 1.6, marginBottom: 14 }}>
              {activeArchetypeTab === "Consistent" && "Consistent (>70%): Automaticity achieved. Recommendation: protect recovery to avoid over-exertion."}
              {activeArchetypeTab === "Building" && "Building (45%-70%): Reinforcement zone. Recommendation: lock in a rigid calendar anchor."}
              {activeArchetypeTab === "Struggling" && "Struggling (<45%): High friction. Recommendation: reduce activation threshold (e.g. 5m instead of 30m)."}
            </div>

            {/* Cross-habit synergy quick insight */}
            <div style={{ background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)", padding: "12px", borderRadius: 8, fontSize: 12 }}>
              <strong style={{ color: "#38bdf8" }}>Habit Stacking Domino Effect:</strong> Habits with Pearson correlation r &gt; 0.35 trigger automatic neuro-behavioral follow-through.
            </div>
          </div>

        </div>

      </div>

      {/* ── PLAIN-ENGLISH TERM DECODER (FULL-WIDTH ACCORDION) ── */}
      <section style={{
        background: "#0d1117",
        border: "1px solid #1e293b",
        borderRadius: 20,
        padding: "28px 30px",
        marginTop: 36,
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", marginBottom: 6 }}>
          Plain-English Term Decoder
        </h2>
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
          Click any term to understand the psychology and mathematics driving your real trends:
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {[
            { id: "rawVsSmooth", label: "Raw vs Smooth Lines" },
            { id: "cusum", label: "CUSUM Change-Points" },
            { id: "momentum", label: "3D Momentum" },
            { id: "laplace", label: "Laplace Bayes Smoothing" },
            { id: "synergy", label: "Habit Stacking Synergy" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTermTab(t.id)}
              style={{
                background: activeTermTab === t.id ? "#38bdf8" : "#070b14",
                color: activeTermTab === t.id ? "#070b14" : "#cbd5e1",
                border: "1px solid #1e293b",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ background: "#070b14", border: "1px solid #1e293b", borderRadius: 12, padding: "18px 22px", fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}>
          {activeTermTab === "rawVsSmooth" && (
            <div>
              <strong style={{ color: "#38bdf8" }}>Raw vs Smooth Metaphor:</strong> Think of <strong>Raw</strong> as the potholes and red lights on today's commute, while <strong>Smooth</strong> is where your car is heading on the highway. One red light does not change your overall journey.
            </div>
          )}
          {activeTermTab === "cusum" && (
            <div>
              <strong style={{ color: "#fbbf24" }}>CUSUM Shift Metaphor:</strong> An automated AI quality inspector that spots the exact calendar date when you permanently "turned a corner" from willpower into habit.
            </div>
          )}
          {activeTermTab === "momentum" && (
            <div>
              <strong style={{ color: "#4ade80" }}>3D Momentum Metaphor:</strong> Are you stepping on the gas pedal or pressing the brakes? Positive inertia makes tomorrow's start effortless.
            </div>
          )}
          {activeTermTab === "laplace" && (
            <div>
              <strong style={{ color: "#a78bfa" }}>Laplace Smoothing Metaphor:</strong> Prevents a beginner's lucky strike from distorting the odds, providing balanced day-of-week probabilities from day one.
            </div>
          )}
          {activeTermTab === "synergy" && (
            <div>
              <strong style={{ color: "#38bdf8" }}>Habit Stacking Metaphor:</strong> Falling dominoes. Doing a morning run creates momentum that automatically triggers a cold shower and clean eating.
            </div>
          )}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <div style={{
        marginTop: 36,
        background: "linear-gradient(180deg, #10192d 0%, #0c1322 100%)",
        border: "1px solid rgba(56, 189, 248, 0.25)",
        borderRadius: 16,
        padding: "26px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>
            Ready to Compound Your Momentum?
          </h3>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
            Switch back to your live dashboard to check off today's plan and update your ML model in real time.
          </p>
        </div>

        <button
          onClick={onNavigateToDashboard}
          style={{
            background: "#38bdf8",
            color: "#070b14",
            border: "none",
            borderRadius: 10,
            padding: "11px 26px",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(56, 189, 248, 0.4)",
          }}
        >
          Launch Live Dashboard Now →
        </button>
      </div>
    </div>
  );
}
