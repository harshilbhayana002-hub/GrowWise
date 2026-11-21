export default function ProbRing({ prob, color }) {
  const r = 44, cx = 52, cy = 52, stroke = 7;
  const circ = 2 * Math.PI * r;
  const dash = prob * circ;

  const label =
    prob > 0.65 ? "LIKELY ✓"
    : prob < 0.4 ? "AT RISK"
    : "UNCERTAIN";
  const labelColor =
    prob > 0.65 ? "#4ade80"
    : prob < 0.4 ? "#f87171"
    : "#fbbf24";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={104} height={104}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 0.6s" }}
        />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#f1f5f9"
          style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace" }}>
          {(prob * 100).toFixed(0)}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#475569"
          style={{ fontSize: 9, fontFamily: "monospace" }}>
          TOMORROW
        </text>
      </svg>
      <span style={{
        fontSize: 10, fontFamily: "monospace", padding: "2px 10px",
        borderRadius: 20, color: labelColor,
        background: labelColor + "18",
        border: `1px solid ${labelColor}44`,
      }}>
        {label}
      </span>
    </div>
  );
}
