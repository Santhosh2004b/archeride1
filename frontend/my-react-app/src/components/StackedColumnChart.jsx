// stagger bar-rise
import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const STATUS_ORDER = ["Open", "On Hold", "Resolved", "Cancelled", "Approved & Closed"];

const COLORS = {
  Open: "#E63946",
  "On Hold": "#FB8500",
  Resolved: "#457B9D",
  Cancelled: "#8D99AE",
  "Approved & Closed": "#1EA896",
};

export default function StackedColumnChart({ data = [] }) {
  // 📌 hooks must always run — no early return before this line

  // sort modules alphabetically
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) =>
      String(a.module || "").localeCompare(String(b.module || ""))
    );
  }, [data]);

  // grab & order status keys
  const statusKeys = useMemo(() => {
    const keys = [...new Set(sortedData.flatMap(row =>
      Object.keys(row).filter(k => k !== "module")
    ))];

    return keys.sort((a, b) => {
      const idxA = STATUS_ORDER.indexOf(a);
      const idxB = STATUS_ORDER.indexOf(b);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
  }, [sortedData]);

  // max stacked value for autoscale
  const maxValue = useMemo(() => {
    let max = 0;
    sortedData.forEach(row => {
      let sum = 0;
      statusKeys.forEach(key => {
        sum += Number(row[key] || 0);
      });
      max = Math.max(max, sum);
    });
    return max;
  }, [sortedData, statusKeys]);

  // 📌 now return conditionally
  if (!data.length) {
    return (
      <div style={{ padding: 20, color: "#999" }}>
        No module data available
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 480, display: "flex", flexDirection: "column" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
        >
          <XAxis
            dataKey="module"
            angle={0}
            textAnchor="middle"
            height={40}
            tick={{ fontSize: 13, fontWeight: 500 }}
          />
          <YAxis
            domain={[0, 'auto']}
            allowDecimals={false}
            label={{ value: "Count", angle: -90, position: "insideLeft", offset: 10 }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 10,
            }}
            formatter={(value) => Number(value).toLocaleString()}
            labelFormatter={(label) => `${label}`}
          />
          <Legend
            wrapperStyle={{ paddingTop: 20 }}
            verticalAlign="bottom"
            height={36}
          />
          {statusKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="status-stack"
              fill={COLORS[key] || "#ccc"}
              isAnimationActive={true}
              animationBegin={idx * 150}
              animationDuration={800}
              animationEasing="ease-out"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
