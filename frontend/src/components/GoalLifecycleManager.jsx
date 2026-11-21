import React, { useState } from "react";

export default function GoalLifecycleManager({
  habits,
  activeHabitId,
  onSelectHabit,
  onDeleteHabit,
  onOpenAddModal,
  todayStr,
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const today = todayStr || new Date().toISOString().split("T")[0];

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

  const calculateConsistency = (habit) => {
    if (!habit || !habit.logs?.length) return 0;
    const recent = habit.logs.slice(-7);
    if (!recent.length) return 0;
    const doneCount = recent.filter((l) => l.done).length;
    return doneCount / recent.length;
  };

  // Portfolio average consistency
  const avgConsistency = habits.length
    ? habits.reduce((acc, h) => acc + calculateConsistency(h), 0) / habits.length
    : 0;

  // Best habit
  const bestHabit = habits.length
    ? [...habits].sort((a, b) => calculateConsistency(b) - calculateConsistency(a))[0]
    : null;

  return (
    <div style={{
      background: "#0d1117",
      border: "1px solid #1e293b",
      borderRadius: 16,
      padding: "24px",
      marginTop: 24,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        paddingBottom: 16,
        marginBottom: 20,
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div>
          <div style={{
            fontSize: 10,
            fontFamily: "monospace",
            color: "#38bdf8",
            letterSpacing: 2,
            fontWeight: 700,
            marginBottom: 4,
          }}>
            GOAL MANAGEMENT & LIFECYCLE ANALYTICS
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc" }}>
            Active Goals Portfolio ({habits.length})
          </h3>
        </div>

        {/* Quick Portfolio Stats & Add Button */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "#151e33",
            padding: "8px 16px",
            borderRadius: 10,
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}>
            <div>
              <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace" }}>PORTFOLIO AVG</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#38bdf8" }}>
                {(avgConsistency * 100).toFixed(0)}%
              </div>
            </div>
            {bestHabit && (
              <div>
                <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace" }}>TOP PERFORMER</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#4ade80" }}>
                  {bestHabit.emoji} {bestHabit.name.slice(0, 10)}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onOpenAddModal}
            style={{
              background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
              border: "none",
              color: "#ffffff",
              padding: "10px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 0 16px rgba(14, 165, 233, 0.35)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>+</span> Add Goal
          </button>
        </div>
      </div>

      {/* Goals Table / Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16,
      }}>
        {habits.map((h) => {
          const streak = calculateStreak(h);
          const consistency = calculateConsistency(h);
          const isSelected = h.id === activeHabitId;
          const isConfirming = deleteConfirmId === h.id;

          const archetype =
            consistency >= 0.75
              ? { label: "Consistent", color: "#4ade80", bg: "rgba(34, 197, 94, 0.15)" }
              : consistency >= 0.45
              ? { label: "Building", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)" }
              : { label: "Struggling", color: "#f87171", bg: "rgba(239, 68, 68, 0.15)" };

          return (
            <div
              key={h.id}
              style={{
                background: isSelected ? "#151e33" : "#0c1322",
                border: `1px solid ${isSelected ? h.color : "rgba(255, 255, 255, 0.06)"}`,
                borderRadius: 14,
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                transition: "all 0.2s",
                boxShadow: isSelected ? `0 0 20px ${h.color}22` : "none",
              }}
            >
              {/* Top row */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{h.emoji}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>
                        {h.name}
                      </div>
                      <span style={{
                        fontSize: 9,
                        fontFamily: "monospace",
                        color: archetype.color,
                        background: archetype.bg,
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontWeight: 600,
                      }}>
                        {archetype.label}
                      </span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  {isConfirming ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button
                        onClick={() => {
                          onDeleteHabit(h.id);
                          setDeleteConfirmId(null);
                        }}
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "4px 8px",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        style={{
                          background: "#1e293b",
                          color: "#94a3b8",
                          border: "none",
                          fontSize: 10,
                          padding: "4px 6px",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(h.id)}
                      title="Delete goal & analytics"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#475569",
                        fontSize: 14,
                        cursor: "pointer",
                        padding: 4,
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
                    >
                      🗑️
                    </button>
                  )}
                </div>

                {/* Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  <div style={{
                    background: "#080d1a",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(255, 255, 255, 0.03)",
                  }}>
                    <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace" }}>CURRENT STREAK</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#38bdf8", marginTop: 2 }}>
                      🔥 {streak} days
                    </div>
                  </div>

                  <div style={{
                    background: "#080d1a",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(255, 255, 255, 0.03)",
                  }}>
                    <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace" }}>TOTAL ENTRIES</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginTop: 2 }}>
                      {h.logs.length} logged
                    </div>
                  </div>
                </div>

                {/* 7-Day Consistency Bar */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 4 }}>
                    <span>7-Day Consistency</span>
                    <span style={{ color: h.color, fontWeight: 700 }}>{(consistency * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ height: 6, background: "#0f172a", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      width: `${consistency * 100}%`,
                      height: "100%",
                      background: h.color,
                      borderRadius: 3,
                      transition: "width 0.4s",
                    }} />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <button
                onClick={() => onSelectHabit(h.id)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: 8,
                  border: isSelected ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                  background: isSelected ? "#0284c7" : "#1e293b",
                  color: isSelected ? "#ffffff" : "#cbd5e1",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {isSelected ? "● Viewing ML Analytics" : "Inspect ML Analytics"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
