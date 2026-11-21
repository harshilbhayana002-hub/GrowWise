import React from "react";

function corrColor(v) {
  if (v >  0.5) return "#22c55e";
  if (v >  0.2) return "#84cc16";
  if (v < -0.3) return "#ef4444";
  return "#475569";
}

export default function CorrelationMatrix({ habits, pairs }) {
  if (!habits?.length || !pairs?.length) return (
    <div style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}>
      Add 2+ habits with data to see synergy.
    </div>
  );

  // Build lookup
  const get = (a, b) => {
    const p = pairs.find(
      (p) => (p.habit_a === a && p.habit_b === b) || (p.habit_a === b && p.habit_b === a)
    );
    return p?.correlation ?? null;
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `72px ${habits.map(() => "1fr").join(" ")}`,
      gap: 3,
    }}>
      {/* Header row */}
      <div />
      {habits.map((h) => (
        <div key={h.id} style={{
          fontSize: 16, textAlign: "center", paddingBottom: 4,
        }}>{h.emoji}</div>
      ))}

      {/* Data rows */}
      {habits.map((ha) => (
        <React.Fragment key={ha.id}>
          <div key={`lbl-${ha.id}`} style={{
            fontSize: 10, color: "#64748b", fontFamily: "monospace",
            display: "flex", alignItems: "center", paddingRight: 4,
          }}>
            {ha.name.slice(0, 9)}
          </div>
          {habits.map((hb) => {
            const v = ha.id === hb.id ? null : get(ha.id, hb.id);
            const col = v !== null ? corrColor(v) : "#475569";
            return (
              <div key={hb.id} style={{
                aspectRatio: "1", borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontFamily: "monospace",
                background: "#0f172a",
                color: col, border: `1px solid ${col}33`,
                opacity: ha.id === hb.id ? 0.3 : 1,
              }}>
                {ha.id === hb.id ? "—" : v !== null ? v.toFixed(2) : "?"}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
