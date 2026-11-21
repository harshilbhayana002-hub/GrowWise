const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ForecastStrip({ forecast, color }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {forecast.slice(0, 7).map((p, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            height: 52, background: "#0f172a", borderRadius: 8,
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            overflow: "hidden",
          }}>
            <div style={{
              width: "100%", borderRadius: "6px 6px 0 0",
              background: color, height: `${p * 100}%`,
              opacity: 0.65 + p * 0.35,
              boxShadow: p > 0.6 ? `0 0 10px ${color}88` : "none",
              transition: "height 0.5s",
            }} />
          </div>
          <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", marginTop: 4 }}>
            {DAYS[i]}
          </div>
          <div style={{ fontSize: 9, color, fontFamily: "monospace" }}>
            {(p * 100).toFixed(0)}%
          </div>
        </div>
      ))}
    </div>
  );
}
