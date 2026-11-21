import React, { useState } from "react";

const EMOJIS = ["🎯", "📚", "🏃", "🧘", "🚿", "💪", "✍️", "🥗", "💤", "🎸", "🧪", "💻"];
const COLORS = ["#38bdf8", "#0ea5e9", "#2563eb", "#a78bfa", "#34d399", "#f97316", "#fb7185", "#fbbf24"];

export default function AddGoalModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [color, setColor] = useState("#38bdf8");
  const [seedHistory, setSeedHistory] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), emoji, color, seedHistory });
    setName("");
    onClose();
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 16,
    }}>
      <div style={{
        background: "#0c1322",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 20,
        padding: "26px",
        width: "100%",
        maxWidth: 440,
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>Create New Goal</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 6 }}>
              Goal Name
            </label>
            <input
              type="text"
              placeholder="e.g. Read 1 chapter, Morning Run"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "#151e33",
                color: "#f8fafc",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 6 }}>
              Choose Icon
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  style={{
                    fontSize: 20,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: emoji === em ? "#1e293b" : "transparent",
                    border: emoji === em ? "1px solid #38bdf8" : "1px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 6 }}>
              Theme Accent
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              {COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: c,
                    cursor: "pointer",
                    boxShadow: color === c ? `0 0 10px ${c}` : "none",
                    border: color === c ? "2px solid #ffffff" : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Seed History Toggle */}
          <div style={{
            background: "rgba(14, 165, 233, 0.08)",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            borderRadius: 12,
            padding: "12px 14px",
          }}>
            <label style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: "pointer",
            }}>
              <input
                type="checkbox"
                checked={seedHistory}
                onChange={(e) => setSeedHistory(e.target.checked)}
                style={{ marginTop: 2, accentColor: "#0284c7", width: 16, height: 16 }}
              />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#f8fafc" }}>
                  Pre-populate 90-day learning analytics
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, lineHeight: 1.4 }}>
                  Generates realistic behavioral history so ML patterns, forecast trends, and Pearson synergy are active immediately.
                </div>
              </div>
            </label>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 10,
                background: "#1e293b",
                border: "none",
                color: "#94a3b8",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 10,
                background: "#0284c7",
                border: "none",
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 0 16px rgba(14, 165, 233, 0.4)",
              }}
            >
              Add Goal & Activate ML
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
