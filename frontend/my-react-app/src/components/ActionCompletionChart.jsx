// Action Completion Horizontal Bar Chart (Last 7 Days)
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const COLORS = {
  Open: "#E63946",
  Inholding: "#FB8500",
  Resolved: "#2A9D8F",
};

export default function ActionCompletionChart({ data = null }) {
  if (!data) return <div style={{ padding: 20, color: "#999" }}>Select a week</div>;

  const chartData = [
    { name: "Open", count: Number(data.Open || 0), fill: COLORS.Open },
    { name: "Inholding", count: Number(data.Inholding || 0), fill: COLORS.Inholding },
    { name: "Resolved", count: Number(data.Resolved || 0), fill: COLORS.Resolved },
  ];

  return (
    <div style={{ width: "100%", height: 320 }}>
      {data.week_label && (
        <div style={{
          marginBottom: 10, fontSize: 13, fontWeight: 600, color: "#4B5563", fontFamily: "Urbanist"
        }}>
          {data.week_label}
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={70}
            tick={{ fill: "#374151", fontSize: 12, fontWeight: 600 }}
          />
          <Tooltip
            formatter={(value) => value}
            contentStyle={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 6,
              padding: "8px 12px",
            }}
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
          />
          <Bar
            dataKey="count"
            radius={[0, 4, 4, 0]}
            barSize={40}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
