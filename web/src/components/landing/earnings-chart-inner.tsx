"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { label: "Year 1", traditional: 42, venshares: 58 },
  { label: "Year 2", traditional: 48, venshares: 72 },
  { label: "Year 3", traditional: 55, venshares: 88 },
];

export function EarningsChartInner() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="label" tick={{ fill: "var(--foreground)" }} />
        <YAxis tick={{ fill: "var(--foreground)" }} />
        <Tooltip
          contentStyle={{
            borderRadius: "0.5rem",
            border: "1px solid var(--border)",
          }}
        />
        <Legend />
        <Bar
          dataKey="traditional"
          name="Traditional freelance"
          fill="oklch(0.75 0.02 260)"
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="venshares"
          name="VenShares-aligned projects"
          fill="oklch(0.72 0.19 145)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
