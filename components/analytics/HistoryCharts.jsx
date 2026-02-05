"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function HistoryCharts({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          stroke="#52525b"
          fontSize={12}
          tickFormatter={(str) => str.slice(5)} // Show MM-DD
        />
        <YAxis stroke="#52525b" fontSize={12} />
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <Tooltip
          contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }}
        />
        <Area
          type="monotone"
          dataKey="actualTime"
          stroke="#34d399"
          fillOpacity={1}
          fill="url(#colorAct)"
          name="Minutes Worked"
        />
        <Area
          type="monotone"
          dataKey="estimatedTime"
          stroke="#a1a1aa"
          strokeDasharray="5 5"
          fill="transparent"
          name="Estimated"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
