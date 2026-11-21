import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DEFAULT_DAYS = [
  { day: "Mon", prob: 0.78, n: 13 },
  { day: "Tue", prob: 0.82, n: 13 },
  { day: "Wed", prob: 0.71, n: 13 },
  { day: "Thu", prob: 0.65, n: 13 },
  { day: "Fri", prob: 0.58, n: 13 },
  { day: "Sat", prob: 0.85, n: 12 },
  { day: "Sun", prob: 0.88, n: 12 },
];

export default function DayBars({ dayProbs, color = "#38bdf8" }) {
  const data = Array.isArray(dayProbs) && dayProbs.length === 7 ? dayProbs : DEFAULT_DAYS;

  return (
    <ResponsiveContainer width="100%" height={85}>
      <BarChart data={data} barCategoryGap="20%">
        <XAxis
          dataKey="day"
          tick={{ fontSize: 10, fill: "#475569", fontFamily: "monospace" }}
          axisLine={false} tickLine={false}
        />
        <YAxis domain={[0, 1]} hide />
        <Tooltip
          formatter={(v) => `${(v * 100).toFixed(0)}%`}
          contentStyle={{
            background: "#0d1117", border: "1px solid #1e293b",
            borderRadius: 8, fontSize: 11,
          }}
        />
        <Bar dataKey="prob" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.prob > 0.7 ? color : d.prob < 0.4 ? "#1e293b" : color + "66"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
