import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

export default function TrendChart({ rolling, smoothed, changePoints, color }) {
  const data = rolling.map((v, i) => ({
    i,
    raw:    parseFloat(v.toFixed(3)),
    smooth: smoothed?.[i] !== undefined ? parseFloat(smoothed[i].toFixed(3)) : undefined,
  }));

  const cpIndices = new Set((changePoints || []).map((cp) => cp.index));

  return (
    <ResponsiveContainer width="100%" height={110}>
      <LineChart data={data}>
        <XAxis dataKey="i" hide />
        <YAxis domain={[0, 1]} hide />
        <Tooltip
          formatter={(v) => `${(v * 100).toFixed(0)}%`}
          contentStyle={{
            background: "#0d1117", border: "1px solid #1e293b",
            borderRadius: 8, fontSize: 11,
          }}
        />
        {[...cpIndices].map((idx) => (
          <ReferenceLine
            key={idx} x={idx}
            stroke="#fbbf24" strokeDasharray="3 3" strokeOpacity={0.7}
          />
        ))}
        <Line type="monotone" dataKey="raw" stroke={color + "44"} dot={false} strokeWidth={1.5} />
        <Line type="monotone" dataKey="smooth" stroke={color} dot={false} strokeWidth={2.5} strokeLinecap="round" />
      </LineChart>
    </ResponsiveContainer>
  );
}
