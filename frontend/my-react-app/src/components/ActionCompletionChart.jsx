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

const COLORS = {
  Open: "#EF4444",
  "On Hold": "#F59E0B",
  Resolved: "#10B981",
};

export default function ActionCompletionChart({ data = null }) {
  if (!data) return (
    <div className="flex items-center justify-center h-64 text-gray-400 font-medium">
      Select a reporting week...
    </div>
  );

  const chartData = [
    { name: "Open", count: Number(data.Open || 0), fill: COLORS.Open },
    { name: "On Hold", count: Number(data["On Hold"] || 0), fill: COLORS["On Hold"] },
    { name: "Resolved", count: Number(data.Resolved || 0), fill: COLORS.Resolved },
  ];

  return (
    <div className="w-full h-80 pt-4">
      {data.week_label && (
        <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
          {data.week_label}
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: "#9CA3AF", fontSize: 11 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={85}
            tick={{ fill: "#4B5563", fontSize: 12, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "#F9FAFB" }}
            contentStyle={{
              background: "#FFFFFF",
              border: "1px solid #F3F4F6",
              borderRadius: "12px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              padding: "10px 14px",
              fontSize: "13px"
            }}
            itemStyle={{ fontWeight: 600 }}
          />
          <Bar
            dataKey="count"
            radius={[0, 8, 8, 0]}
            barSize={32}
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
