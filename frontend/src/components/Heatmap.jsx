import { useState } from "react";

export default function Heatmap({ logs, color, changePoints = [], onToggleDate }) {
  const [hovered, setHovered] = useState(null);

  const today = new Date();
  const cells = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (89 - i));
    const ds = d.toISOString().split("T")[0];
    const log = logs.find((l) => l.date === ds);
    const isCP = changePoints.some((cp) => cp.date === ds);
    return { ds, done: log?.done ?? false, isCP };
  });

  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - 89);
  const startDayOfWeek = firstDay.getDay();

  const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        <div style={{
          display: "grid", gridTemplateRows: "repeat(7, 13px)", gap: 3,
          fontSize: 10, color: "#64748b", fontFamily: "monospace",
          textAlign: "right", lineHeight: "13px"
        }}>
          {DAYS.map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div style={{
          display: "grid", gridTemplateRows: "repeat(7, 13px)", gridAutoFlow: "column", gap: 3,
        }}>
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} style={{ width: 13, height: 13 }} />
          ))}
          {cells.map(({ ds, done, isCP }) => (
            <div
              key={ds}
              title={`${ds} — click to toggle`}
              onClick={() => onToggleDate(ds, done)}
              onMouseEnter={() => setHovered(ds)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: 13, height: 13, borderRadius: 3, cursor: "pointer",
                background: done ? color : "#0f172a",
                border: isCP
                  ? "1.5px solid #fbbf24"
                  : `1px solid ${done ? color + "55" : "#1e293b"}`,
                transform: hovered === ds ? "scale(1.5)" : "scale(1)",
                transition: "transform 0.1s, background 0.15s",
                boxShadow: hovered === ds && done ? `0 0 6px ${color}` : "none",
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ fontSize: 10, color: "#334155", fontFamily: "monospace", marginTop: 8 }}>
        Click any cell to toggle · 🟡 = CUSUM change-point detected
      </div>
    </div>
  );
}
