import { useState } from "react";
import CorrelationMatrix from "./CorrelationMatrix.jsx";

const COLORS  = ["#f97316","#38bdf8","#a78bfa","#34d399","#fb7185","#fbbf24","#e879f9","#22d3ee"];
const EMOJIS  = ["🏃","📚","🧘","🚿","💪","🎯","✍️","🥗","💤","🎸","🧪","🏋️","🏊"];

const Card = ({ children, style = {} }) => (
  <div style={{
    background: "#0d1117", border: "1px solid #1e293b",
    borderRadius: 14, padding: "16px 18px", ...style,
  }}>
    {children}
  </div>
);

export default function Sidebar({
  habits, activeId, onSelect, onToggleToday,
  onAdd, onDelete, onReset,
  synergy,
}) {
  const [addOpen, setAddOpen]       = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [newName, setNewName]       = useState("");
  const [newEmoji, setNewEmoji]     = useState("🎯");

  const today = new Date().toISOString().split("T")[0];

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const color = COLORS[habits.length % COLORS.length];
    await onAdd({ name: newName.trim(), emoji: newEmoji, color });
    setNewName(""); setNewEmoji("🎯"); setAddOpen(false);
  };

  const handleDelete = async (id) => {
    await onDelete(id);
    setConfirmDel(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Habit cards */}
      {habits.map((h) => {
        const todayLog = h.logs.find((l) => l.date === today);
        const done     = todayLog?.done ?? false;
        const recent   = h.logs.slice(-7);
        const consistency = recent.length
          ? recent.filter((l) => l.done).length / recent.length : 0;

        return (
          <div key={h.id} onClick={() => onSelect(h.id)} style={{
            padding: "14px 16px", borderRadius: 12, cursor: "pointer",
            border: `1px solid ${activeId === h.id ? h.color + "66" : "#1e293b"}`,
            background: activeId === h.id ? "#0d1117" : "#070c14",
            boxShadow: activeId === h.id ? `0 0 20px ${h.color}18` : "none",
            transition: "all 0.2s",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 22 }}>{h.emoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{h.name}</div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "#475569" }}>
                    {(consistency * 100).toFixed(0)}% last 7d · {h.logs.length} entries
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {/* Today toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleToday(h.id, today, done); }}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
                    background: done ? h.color : "#1e293b", color: "#fff",
                    fontSize: 14, fontWeight: 700,
                    boxShadow: done ? `0 0 12px ${h.color}88` : "none",
                    transition: "all 0.15s",
                  }}>
                  {done ? "✓" : "○"}
                </button>
                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDel(h.id); }}
                  style={{
                    width: 24, height: 24, borderRadius: 6, border: "none",
                    cursor: "pointer", background: "transparent",
                    color: "#334155", fontSize: 16, lineHeight: 1,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}>
                  ×
                </button>
              </div>
            </div>

            {/* Consistency bar */}
            <div style={{ marginTop: 8, height: 3, background: "#1e293b", borderRadius: 2 }}>
              <div style={{
                height: "100%", borderRadius: 2, background: h.color,
                width: `${consistency * 100}%`,
                boxShadow: `0 0 6px ${h.color}88`, transition: "width 0.5s",
              }} />
            </div>
          </div>
        );
      })}

      {/* Add form */}
      {addOpen ? (
        <Card>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {EMOJIS.map((e) => (
              <span key={e} onClick={() => setNewEmoji(e)} style={{
                fontSize: 18, cursor: "pointer", padding: "3px 5px", borderRadius: 6,
                background: newEmoji === e ? "#1e293b" : "transparent",
              }}>{e}</span>
            ))}
          </div>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Habit name…"
            autoFocus
            style={{
              width: "100%", marginBottom: 10,
              background: "#0f172a", border: "1px solid #1e293b",
              color: "#f1f5f9", borderRadius: 8, padding: "8px 12px",
              fontFamily: "Outfit, sans-serif", fontSize: 14, outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={handleAdd} style={{
              flex: 1, padding: "8px", borderRadius: 8, border: "none",
              background: "#3b82f6", color: "#fff", cursor: "pointer",
              fontFamily: "Outfit, sans-serif", fontWeight: 600, fontSize: 13,
            }}>Add</button>
            <button onClick={() => setAddOpen(false)} style={{
              padding: "8px 14px", borderRadius: 8, border: "none",
              background: "#1e293b", color: "#64748b", cursor: "pointer",
              fontFamily: "Outfit, sans-serif", fontSize: 13,
            }}>Cancel</button>
          </div>
        </Card>
      ) : (
        <button onClick={() => setAddOpen(true)} style={{
          background: "#0d1117", border: "1px dashed #1e293b",
          color: "#475569", padding: 12, borderRadius: 12,
          width: "100%", cursor: "pointer",
          fontFamily: "Outfit, sans-serif", fontSize: 13,
        }}>+ Add Habit</button>
      )}

      {/* Synergy matrix */}
      {habits.length >= 2 && (
        <Card style={{ marginTop: 4 }}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: "#475569",
            letterSpacing: 2, marginBottom: 12 }}>
            HABIT SYNERGY · PEARSON r
          </div>
          <CorrelationMatrix habits={habits} pairs={synergy || []} />
          <div style={{ fontSize: 10, color: "#334155", fontFamily: "monospace", marginTop: 10 }}>
            🟢 positive · 🔴 negative correlation
          </div>
        </Card>
      )}

      {/* Reset */}
      <button onClick={onReset} style={{
        background: "transparent", border: "1px solid #1e293b",
        color: "#334155", padding: "8px", borderRadius: 10,
        cursor: "pointer", fontFamily: "monospace", fontSize: 11,
        letterSpacing: 1, marginTop: 4,
      }}>RESET TO SEED DATA</button>

      {/* Delete confirmation modal */}
      {confirmDel && (
        <div style={{
          position: "fixed", inset: 0, background: "#000000bb",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
        }} onClick={() => setConfirmDel(null)}>
          <div style={{
            background: "#0d1117", border: "1px solid #1e293b",
            borderRadius: 16, padding: "28px 32px", maxWidth: 300, textAlign: "center",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>
              Delete habit?
            </div>
            <div style={{ fontSize: 12, color: "#475569", fontFamily: "monospace", marginBottom: 20 }}>
              "{habits.find((h) => h.id === confirmDel)?.name}" and all its<br />logs will be permanently deleted.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => handleDelete(confirmDel)} style={{
                padding: "8px 20px", borderRadius: 8, border: "none",
                background: "#ef4444", color: "#fff", cursor: "pointer",
                fontFamily: "Outfit, sans-serif", fontWeight: 600,
              }}>Delete</button>
              <button onClick={() => setConfirmDel(null)} style={{
                padding: "8px 20px", borderRadius: 8, border: "none",
                background: "#1e293b", color: "#94a3b8", cursor: "pointer",
                fontFamily: "Outfit, sans-serif",
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
