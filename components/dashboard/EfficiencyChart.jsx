"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function EfficiencyChart({ data }) {
  // Transform prisma data for the chart
  // Filter out tasks with no actual time (unless you want to show 0)
  const chartData = data
    .filter((t) => t.status || t.actualTime > 0)
    .map((t) => ({
      name:
        t.description.substring(0, 15) +
        (t.description.length > 15 ? "..." : ""),
      Estimated: t.estimatedTime,
      Actual: t.actualTime || 0,
    }))
    .reverse(); // Oldest first for timeline view

  if (chartData.length === 0) {
    return (
      <div className="h-[200px] w-full flex items-center justify-center text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-lg">
        Not enough data to display chart
      </div>
    );
  }

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
        >
          <XAxis
            dataKey="name"
            stroke="#52525b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#52525b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "#27272a" }}
            contentStyle={{
              backgroundColor: "#18181b",
              borderColor: "#27272a",
              color: "#f4f4f5",
            }}
          />
          <Bar
            dataKey="Estimated"
            fill="#3f3f46"
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
          {/* Use Cell to conditionally color the Actual bar */}
          <Bar dataKey="Actual" radius={[4, 4, 0, 0]} barSize={20}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.Actual > entry.Estimated ? "#f87171" : "#34d399"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
