import React from "react";

export default function HeroSection({
  habits,
  activeHabitId,
  onSelectHabit,
  onOpenAddModal,
  onScrollToAnalytics,
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      maxWidth: 580,
      padding: "20px 0",
    }}>
      {/* ── Pill Tag ── */}
      <div style={{ marginBottom: 20 }}>
        <span style={{
          fontSize: 12,
          fontFamily: "monospace",
          fontWeight: 600,
          color: "#94a3b8",
          background: "rgba(30, 41, 59, 0.7)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "6px 14px",
          borderRadius: 24,
          letterSpacing: "0.2px",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}>
          AI that keeps you compounding
        </span>
      </div>

      {/* ── Main Headline ── */}
      <h1 style={{
        fontSize: "clamp(34px, 4.5vw, 52px)",
        fontWeight: 800,
        lineHeight: 1.15,
        letterSpacing: "-1.8px",
        color: "#f8fafc",
        marginBottom: 20,
      }}>
        Your personal learning operator—plan smarter, stay in flow, and see momentum instantly.
      </h1>

      {/* ── Subtitle ── */}
      <p style={{
        fontSize: "clamp(15px, 1.8vw, 17px)",
        lineHeight: 1.6,
        color: "#94a3b8",
        marginBottom: 32,
        maxWidth: 520,
        fontWeight: 400,
      }}>
        Capture goals, shape the week, and let AI keep your streaks alive with timely nudges and real-time analytics.
      </p>

      {/* ── Action Buttons ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 30, flexWrap: "wrap" }}>
        <button
          onClick={onOpenAddModal}
          style={{
            background: "#0d1527",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            color: "#f8fafc",
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 10,
            padding: "12px 24px",
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#142240";
            e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
            e.currentTarget.style.boxShadow = "0 6px 24px rgba(14, 165, 233, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#0d1527";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.18)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.4)";
          }}
        >
          Start free — no card
        </button>

        <button
          onClick={onScrollToAnalytics}
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#cbd5e1",
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 10,
            padding: "12px 24px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(30, 41, 59, 0.8)";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(15, 23, 42, 0.6)";
            e.currentTarget.style.color = "#cbd5e1";
          }}
        >
          View demo
        </button>
      </div>

      {/* ── Social Proof Active Stat ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        color: "#94a3b8",
        fontWeight: 500,
        marginBottom: 28,
      }}>
        <span style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#22c55e",
          display: "inline-block",
          boxShadow: "0 0 10px #22c55e",
          animation: "pulse 2s infinite",
        }} />
        <span>
          200+ learners active <span style={{ opacity: 0.4 }}>•</span> Avg focus score 87%
        </span>
      </div>

      {/* ── Switch Habit / Goal in Live Demo ── */}
      <div>
        <div style={{
          fontSize: 11,
          fontFamily: "monospace",
          color: "#64748b",
          letterSpacing: 1,
          marginBottom: 10,
          textTransform: "uppercase",
        }}>
          Switch Goal In Live Operator:
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {habits.map((h) => {
            const isSelected = h.id === activeHabitId;
            return (
              <button
                key={h.id}
                onClick={() => onSelectHabit(h.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: isSelected
                    ? `1px solid ${h.color}`
                    : "1px solid rgba(255, 255, 255, 0.06)",
                  background: isSelected ? `${h.color}22` : "#0f172a",
                  color: isSelected ? "#ffffff" : "#94a3b8",
                  boxShadow: isSelected ? `0 0 12px ${h.color}33` : "none",
                }}
              >
                <span>{h.emoji}</span>
                <span>{h.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
