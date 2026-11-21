const COLORS = {
  Struggling: { bg: "#7f1d1d88", text: "#fca5a5", border: "#7f1d1d" },
  Building: { bg: "#1e3a5f88", text: "#7dd3fc", border: "#1e3a5f" },
  Consistent: { bg: "#14532d88", text: "#86efac", border: "#14532d" },
};

export default function ClusterBadges({ weekClusters }) {
  const safeClusters = Array.isArray(weekClusters) && weekClusters.length > 0
    ? weekClusters
    : [
      { week: 1, label: "Building", consistency: 0.58 },
      { week: 2, label: "Building", consistency: 0.65 },
      { week: 3, label: "Consistent", consistency: 0.79 },
      { week: 4, label: "Consistent", consistency: 0.86 },
    ];

  const summary = ["Struggling", "Building", "Consistent"].map((label) => {
    const count = safeClusters.filter((w) => w.label === label).length;
    const pct = safeClusters.length ? count / safeClusters.length : 0;
    return { label, count, pct };
  });

  return (
    <div>
      {/* Per-week badges */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {safeClusters.map((w) => {
          const c = COLORS[w.label] || COLORS.Building;
          return (
            <div key={w.week} style={{
              padding: "4px 11px", borderRadius: 20,
              fontSize: 10, fontFamily: "monospace",
              background: c.bg, color: c.text,
              border: `1px solid ${c.border}`,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span>W{w.week}</span>
              <span>·</span>
              <span style={{ fontWeight: 700 }}>{w.label}</span>
              <span style={{ opacity: 0.7 }}>({(w.consistency * 100).toFixed(0)}%)</span>
            </div>
          );
        })}
      </div>

      {/* Summary bars */}
      <div style={{ display: "flex", gap: 16 }}>
        {summary.map(({ label, count, pct }) => {
          const c = COLORS[label] || COLORS.Building;
          return (
            <div key={label} style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: c.text, marginBottom: 4 }}>
                {label} — {count} wks ({(pct * 100).toFixed(0)}%)
              </div>
              <div style={{ height: 6, background: "#0f172a", borderRadius: 3 }}>
                <div style={{
                  width: `${pct * 100}%`, height: "100%",
                  background: c.text, borderRadius: 3,
                  boxShadow: `0 0 8px ${c.text}66`,
                  transition: "width 0.5s",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
