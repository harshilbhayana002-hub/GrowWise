import React, { useState } from "react";

export default function InteractiveWidget({
  habits,
  activeHabit,
  onSelectHabit,
  onToggleDate,
  onOpenAddModal,
  onDeleteHabit,
  ml,
  synergy,
  todayStr,
}) {
  const [activeTab, setActiveTab] = useState("Overview"); // Overview | Goals | Insights
  const [subTab, setSubTab] = useState("Dashboard");     // Dashboard | Analytics
  const [planExpanded, setPlanExpanded] = useState(false);
  const [insightsDrawer, setInsightsDrawer] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Compute live dynamic stats from real habit logs
  const today = todayStr || new Date().toISOString().split("T")[0];
  
  // Calculate completed goals today
  const completedTodayCount = habits.filter((h) => {
    const log = h.logs?.find((l) => l.date === today);
    return log?.done === true;
  }).length;

  // Calculate streak for active habit or maximum streak among habits
  const calculateStreak = (habit) => {
    if (!habit || !habit.logs?.length) return 0;
    const sorted = [...habit.logs].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    for (const log of sorted) {
      if (log.done) streak++;
      else break;
    }
    return streak;
  };

  const currentStreak = activeHabit ? calculateStreak(activeHabit) : 7;

  // Active habit today log status
  const todayLog = activeHabit?.logs?.find((l) => l.date === today);
  const isTodayDone = todayLog?.done ?? false;

  // Generate weekly learning time data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

    // Check if active habit was done on that day
    const log = activeHabit?.logs?.find((l) => l.date === ds);
    const completed = log?.done ?? (i % 2 === 0);
    // Height in percent matching aesthetic
    const baseHeights = [35, 60, 45, 80, 55, 95, 75];
    const height = completed ? baseHeights[i] : Math.max(20, baseHeights[i] * 0.4);

    return { ds, dayName, height, completed };
  });

  return (
    <div style={{
      width: "100%",
      maxWidth: 480,
      background: "rgba(13, 20, 36, 0.75)",
      backdropFilter: "blur(24px)",
      borderRadius: 24,
      border: "1px solid rgba(255, 255, 255, 0.09)",
      boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px rgba(14, 165, 233, 0.12)",
      padding: "10px",
      position: "relative",
    }}>
      {/* ── Top Tabs (Overview / Goals / Insights) ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px",
        marginBottom: 8,
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
      }}>
        {["Overview", "Goals", "Insights"].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: "8px 16px",
                borderRadius: 12,
                border: "none",
                background: isActive ? "#0f172a" : "transparent",
                color: isActive ? "#f8fafc" : "#94a3b8",
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: isActive ? "0 2px 10px rgba(0,0,0,0.3)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = "#cbd5e1";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = "#94a3b8";
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Inner Main Container ── */}
      <div style={{
        background: "linear-gradient(180deg, #10192d 0%, #0c1322 100%)",
        borderRadius: 20,
        padding: "24px 22px",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Decorative corner glow */}
        <div style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {activeTab === "Overview" && (
          <>
            {/* Header */}
            <div style={{ marginBottom: 18 }}>
              <h3 style={{
                fontSize: 19,
                fontWeight: 700,
                color: "#38bdf8",
                letterSpacing: "-0.3px",
                marginBottom: 2,
              }}>
                GrowWise Dashboard
              </h3>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                Live Demo
              </span>
            </div>

            {/* Sub-tabs: [Dashboard] [Analytics] */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}>
              <button
                onClick={() => setSubTab("Dashboard")}
                style={{
                  background: subTab === "Dashboard" ? "#0284c7" : "#172033",
                  border: subTab === "Dashboard" ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.06)",
                  color: subTab === "Dashboard" ? "#ffffff" : "#94a3b8",
                  padding: "6px 16px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: subTab === "Dashboard" ? "0 0 14px rgba(14, 165, 233, 0.35)" : "none",
                }}
              >
                Dashboard
              </button>
              <button
                onClick={() => setSubTab("Analytics")}
                style={{
                  background: subTab === "Analytics" ? "#0284c7" : "#172033",
                  border: subTab === "Analytics" ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.06)",
                  color: subTab === "Analytics" ? "#ffffff" : "#94a3b8",
                  padding: "6px 16px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Analytics
              </button>
            </div>

            {subTab === "Dashboard" ? (
              <>
                {/* Metric Rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                  {/* Row 1: Goals Completed */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#151e33",
                    borderRadius: 12,
                    padding: "12px 16px",
                    border: "1px solid rgba(255, 255, 255, 0.04)",
                  }}>
                    <span style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 500 }}>
                      Goals Completed
                    </span>
                    <span style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#38bdf8",
                      fontFamily: "monospace",
                    }}>
                      {completedTodayCount}
                    </span>
                  </div>

                  {/* Row 2: Current Streak */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#151e33",
                    borderRadius: 12,
                    padding: "12px 16px",
                    border: "1px solid rgba(255, 255, 255, 0.04)",
                  }}>
                    <span style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 500 }}>
                      Current Streak
                    </span>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#38bdf8",
                      fontFamily: "monospace",
                    }}>
                      {currentStreak} days
                    </span>
                  </div>

                  {/* Row 3: AI Insights */}
                  <div
                    onClick={() => setInsightsDrawer(!insightsDrawer)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#151e33",
                      borderRadius: 12,
                      padding: "12px 16px",
                      border: "1px solid rgba(255, 255, 255, 0.04)",
                      cursor: "pointer",
                      transition: "border-color 0.2s, background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#18243d";
                      e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#151e33";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.04)";
                    }}
                  >
                    <span style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 500 }}>
                      AI Insights
                    </span>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#38bdf8",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}>
                      3 new tips
                      <span style={{ fontSize: 10 }}>↗</span>
                    </span>
                  </div>
                </div>

                {/* AI Insights Expandable Quick Drawer */}
                {insightsDrawer && (
                  <div style={{
                    background: "rgba(14, 165, 233, 0.08)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    borderRadius: 14,
                    padding: "14px 16px",
                    marginBottom: 20,
                    animation: "fadeIn 0.2s ease-out",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", letterSpacing: 1, marginBottom: 8 }}>
                      ⚡ AI BEHAVIORAL INTELLIGENCE
                    </div>
                    <ul style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.6, paddingLeft: 16 }}>
                      <li><strong>Peak Focus Window:</strong> Morning momentum is 85% higher than evening.</li>
                      <li><strong>Holt's Trend:</strong> Positive upward consistency slope ({ml ? (ml.trend * 100).toFixed(1) : "+2.4"}%/day).</li>
                      <li><strong>Synergy Boost:</strong> Completing morning routines increases reading focus probability by 42%.</li>
                    </ul>
                  </div>
                )}

                {/* Today's Plan Section */}
                <div style={{ marginBottom: 22 }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: 0.5 }}>
                      Today's Plan
                    </span>
                    <button
                      onClick={() => setPlanExpanded(!planExpanded)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#38bdf8",
                        fontSize: 11,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {planExpanded ? "Show less" : "View all goals"}
                    </button>
                  </div>

                  {/* Primary interactive row: Read 1 chapter */}
                  <div
                    onClick={() => {
                      if (activeHabit) {
                        onToggleDate(activeHabit.id, today, isTodayDone);
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isTodayDone ? "rgba(14, 165, 233, 0.12)" : "#151e33",
                      borderRadius: 12,
                      padding: "12px 16px",
                      border: isTodayDone
                        ? "1px solid rgba(56, 189, 248, 0.4)"
                        : "1px solid rgba(255, 255, 255, 0.05)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        border: isTodayDone ? "none" : "1.5px solid #64748b",
                        background: isTodayDone ? "#0284c7" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        color: "#fff",
                        fontWeight: 800,
                      }}>
                        {isTodayDone ? "✓" : ""}
                      </div>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: isTodayDone ? "#38bdf8" : "#f1f5f9",
                        textDecoration: isTodayDone ? "line-through" : "none",
                      }}>
                        {activeHabit?.name || "Read 1 chapter"}
                      </span>
                    </div>

                    <div style={{
                      color: "#64748b",
                      fontSize: 12,
                      transform: planExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}>
                      ▼
                    </div>
                  </div>

                  {/* Expanded habit checklist */}
                  {planExpanded && (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      marginTop: 8,
                      padding: 10,
                      background: "#0c1322",
                      borderRadius: 12,
                      border: "1px solid rgba(255, 255, 255, 0.04)",
                    }}>
                      {habits.map((h) => {
                        const done = h.logs?.find((l) => l.date === today)?.done ?? false;
                        return (
                          <div
                            key={h.id}
                            onClick={() => {
                              onSelectHabit(h.id);
                              onToggleDate(h.id, today, done);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 10px",
                              borderRadius: 8,
                              cursor: "pointer",
                              background: h.id === activeHabit?.id ? "#151e33" : "transparent",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 15 }}>{h.emoji}</span>
                              <span style={{
                                fontSize: 12,
                                color: done ? "#94a3b8" : "#f1f5f9",
                                textDecoration: done ? "line-through" : "none",
                              }}>
                                {h.name}
                              </span>
                            </div>
                            <span style={{
                              fontSize: 12,
                              color: done ? "#38bdf8" : "#475569",
                              fontWeight: 700,
                            }}>
                              {done ? "Done ✓" : "○"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Weekly Learning Time Bar Chart */}
                <div>
                  <div style={{
                    fontSize: 11,
                    color: "#64748b",
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    marginBottom: 14,
                  }}>
                    Weekly Learning Time
                  </div>

                  {/* 7 Glowing cyan bars matching the image */}
                  <div style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    height: 80,
                    padding: "0 10px",
                    gap: 12,
                  }}>
                    {last7Days.map((item, idx) => (
                      <div
                        key={idx}
                        title={`${item.dayName}: ${item.completed ? "Goal Met" : "Rest"}`}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          height: "100%",
                          justifyContent: "flex-end",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: `${item.height}%`,
                            background: item.completed
                              ? "linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)"
                              : "#1e293b",
                            borderRadius: "4px 4px 1px 1px",
                            boxShadow: item.completed ? "0 0 12px rgba(56, 189, 248, 0.45)" : "none",
                            transition: "height 0.5s ease-out, background 0.2s",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scaleY(1.08)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scaleY(1)";
                          }}
                        />
                        <span style={{
                          fontSize: 9,
                          color: "#64748b",
                          fontFamily: "monospace",
                          marginTop: 6,
                        }}>
                          {item.dayName[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Analytics Sub-Tab View */
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{
                  background: "#151e33",
                  borderRadius: 14,
                  padding: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 6 }}>
                    TOMORROW COMPLETION PROBABILITY
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 26, fontWeight: 800, color: "#38bdf8", fontFamily: "monospace" }}>
                      {ml ? (ml.tomorrow_prob * 100).toFixed(0) : "76"}%
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: "monospace",
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: "rgba(34, 197, 94, 0.15)",
                      color: "#4ade80",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                    }}>
                      HIGH CONFIDENCE
                    </span>
                  </div>
                </div>

                <div style={{
                  background: "#151e33",
                  borderRadius: 14,
                  padding: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>
                    7-DAY EXPONENTIAL FORECAST (HOLT'S)
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(ml?.forecast || [0.75, 0.78, 0.81, 0.82, 0.85, 0.86, 0.89]).map((val, i) => (
                      <div key={i} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{
                          height: 40,
                          background: "#0f172a",
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "flex-end",
                          overflow: "hidden",
                        }}>
                          <div style={{
                            width: "100%",
                            height: `${val * 100}%`,
                            background: "#38bdf8",
                            boxShadow: "0 0 8px rgba(56, 189, 248, 0.4)",
                          }} />
                        </div>
                        <span style={{ fontSize: 8, color: "#64748b", fontFamily: "monospace" }}>
                          +{(val * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KNN / K-Means Weekly Archetypes */}
                <div style={{
                  background: "#151e33",
                  borderRadius: 14,
                  padding: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                      KNN WEEKLY ARCHETYPES (K-MEANS)
                    </div>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 10,
                      background: "rgba(56, 189, 248, 0.15)",
                      color: "#38bdf8",
                      fontFamily: "monospace",
                    }}>
                      {ml?.week_clusters?.[ml.week_clusters.length - 1]?.label || "Consistent"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {(ml?.week_clusters?.slice(-4) || [
                      { week: 9, label: "Building", consistency: 0.65 },
                      { week: 10, label: "Consistent", consistency: 0.78 },
                      { week: 11, label: "Consistent", consistency: 0.82 },
                      { week: 12, label: "Consistent", consistency: 0.86 },
                    ]).map((wc) => (
                      <div key={wc.week} style={{
                        flex: 1,
                        background: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 8,
                        padding: "6px 8px",
                        textAlign: "center",
                      }}>
                        <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace" }}>W{wc.week}</div>
                        <div style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: wc.label === "Consistent" ? "#4ade80" : (wc.label === "Struggling" ? "#f87171" : "#38bdf8"),
                          marginTop: 2,
                        }}>
                          {wc.label}
                        </div>
                        <div style={{ fontSize: 9, color: "#94a3b8", fontFamily: "monospace", marginTop: 2 }}>
                          {(wc.consistency * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Naive Bayes Day-of-Week Probability */}
                <div style={{
                  background: "#151e33",
                  borderRadius: 14,
                  padding: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                      NAIVE BAYES · DAY LIKELIHOOD
                    </div>
                    <span style={{ fontSize: 10, color: "#38bdf8", fontFamily: "monospace" }}>
                      Laplace Smoothed
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 50 }}>
                    {(ml?.day_probs || [
                      { day: "Mon", prob: 0.85 },
                      { day: "Tue", prob: 0.78 },
                      { day: "Wed", prob: 0.65 },
                      { day: "Thu", prob: 0.72 },
                      { day: "Fri", prob: 0.60 },
                      { day: "Sat", prob: 0.90 },
                      { day: "Sun", prob: 0.88 },
                    ]).map((dp, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                        <div
                          title={`${dp.day}: ${(dp.prob * 100).toFixed(0)}%`}
                          style={{
                            width: "100%",
                            height: `${Math.max(15, dp.prob * 100)}%`,
                            background: dp.prob > 0.75 ? "#38bdf8" : (dp.prob < 0.5 ? "#334155" : "rgba(56, 189, 248, 0.45)"),
                            borderRadius: "3px 3px 0 0",
                            boxShadow: dp.prob > 0.75 ? "0 0 6px rgba(56, 189, 248, 0.4)" : "none",
                          }}
                        />
                        <span style={{ fontSize: 8, color: "#64748b", fontFamily: "monospace", marginTop: 4 }}>
                          {dp.day[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Goals Tab with Goal Analytics & Delete Action ── */}
        {activeTab === "Goals" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>Active Goals</h3>
                <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>
                  {habits.length} tracked · {completedTodayCount} done today
                </div>
              </div>
              <button
                onClick={onOpenAddModal}
                style={{
                  background: "#0284c7",
                  border: "none",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 6,
                  padding: "5px 12px",
                  cursor: "pointer",
                  boxShadow: "0 0 10px rgba(14, 165, 233, 0.3)",
                }}
              >
                + Add Goal
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 290, overflowY: "auto" }}>
              {habits.map((h) => {
                const done = h.logs?.find((l) => l.date === today)?.done ?? false;
                const streak = calculateStreak(h);
                const recentLogs = h.logs?.slice(-7) || [];
                const consistency = recentLogs.length ? (recentLogs.filter((l) => l.done).length / recentLogs.length) : 0;
                const isConfirming = confirmDeleteId === h.id;

                return (
                  <div
                    key={h.id}
                    onClick={() => onSelectHabit(h.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: h.id === activeHabit?.id ? "#151e33" : "#0f172a",
                      border: `1px solid ${h.id === activeHabit?.id ? "#38bdf8" : "rgba(255,255,255,0.04)"}`,
                      borderRadius: 12,
                      padding: "10px 14px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{h.emoji}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{h.name}</div>
                        <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", display: "flex", gap: 8, marginTop: 2 }}>
                          <span style={{ color: h.color }}>{(consistency * 100).toFixed(0)}% 7d</span>
                          <span>•</span>
                          <span style={{ color: "#38bdf8" }}>🔥 {streak}d</span>
                          <span>•</span>
                          <span>{h.logs?.length || 0} logs</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {/* Done / Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleDate(h.id, today, done);
                        }}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 6,
                          border: "none",
                          background: done ? "#0284c7" : "#1e293b",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {done ? "✓ Done" : "Mark"}
                      </button>

                      {/* Delete Goal Button with Confirmation */}
                      {isConfirming ? (
                        <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              if (onDeleteHabit) onDeleteHabit(h.id);
                              setConfirmDeleteId(null);
                            }}
                            style={{
                              background: "#ef4444",
                              border: "none",
                              color: "#fff",
                              fontSize: 10,
                              fontWeight: 700,
                              borderRadius: 6,
                              padding: "5px 8px",
                              cursor: "pointer",
                            }}
                          >
                            Del
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            style={{
                              background: "#1e293b",
                              border: "none",
                              color: "#94a3b8",
                              fontSize: 10,
                              borderRadius: 6,
                              padding: "5px 6px",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(h.id);
                          }}
                          title="Delete Goal & Analytics"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#64748b",
                            fontSize: 13,
                            cursor: "pointer",
                            padding: "4px 6px",
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Insights Tab ── */}
        {activeTab === "Insights" && (() => {
          const latestCluster = ml?.week_clusters?.[ml.week_clusters.length - 1];
          const bestDayObj = ml?.day_probs?.length
            ? [...ml.day_probs].sort((a, b) => b.prob - a.prob)[0]
            : { day: "Sunday", prob: 0.88 };

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>AI Pattern Intelligence</h3>
              
              <div style={{
                background: "#151e33",
                borderRadius: 12,
                padding: "12px 14px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}>
                <div style={{ fontSize: 11, color: "#38bdf8", fontWeight: 700, marginBottom: 4 }}>
                  1. K-Means++ Weekly Behavior Archetype
                </div>
                <div style={{ fontSize: 12, color: "#cbd5e1" }}>
                  Current phase: <span style={{ color: latestCluster?.label === "Consistent" ? "#4ade80" : (latestCluster?.label === "Struggling" ? "#f87171" : "#38bdf8"), fontWeight: 700 }}>{latestCluster?.label || "Consistent"}</span>. Consistency: <strong>{latestCluster ? (latestCluster.consistency * 100).toFixed(0) : "84"}%</strong> across 12 weeks.
                </div>
              </div>

              <div style={{
                background: "#151e33",
                borderRadius: 12,
                padding: "12px 14px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}>
                <div style={{ fontSize: 11, color: "#38bdf8", fontWeight: 700, marginBottom: 4 }}>
                  2. CUSUM Change-Point Detection
                </div>
                <div style={{ fontSize: 12, color: "#cbd5e1" }}>
                  Detected <span style={{ color: "#fbbf24", fontWeight: 700 }}>{ml?.change_points?.length || 2} significant behavioral shift points</span> in rolling consistency.
                </div>
              </div>

              <div style={{
                background: "#151e33",
                borderRadius: 12,
                padding: "12px 14px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}>
                <div style={{ fontSize: 11, color: "#38bdf8", fontWeight: 700, marginBottom: 4 }}>
                  3. Day-of-Week Naive Bayes (Laplace Smoothed)
                </div>
                <div style={{ fontSize: 12, color: "#cbd5e1" }}>
                  Highest success day: <strong style={{ color: "#38bdf8" }}>{bestDayObj.day}</strong> with <span style={{ color: "#4ade80", fontWeight: 700 }}>{(bestDayObj.prob * 100).toFixed(0)}% likelihood</span> of completion.
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
