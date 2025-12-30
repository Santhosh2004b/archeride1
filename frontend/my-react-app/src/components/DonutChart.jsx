// filepath: src/components/DonutChart.jsx
import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#E63946", "#FB8500", "#FFCA3A", "#2A9D8F"];

export default function DonutChart({ data = [] }) {
  if (!data.length) return <div style={{ padding: 20, color: "#999" }}>No priority data available</div>;

  const total = data.reduce((acc, d) => acc + Number(d.value), 0);

  // Safe division
  const getPercent = (val) => {
    if (total === 0) return 0;
    return ((Number(val) / total) * 100).toFixed(1);
  };

  return (
    <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
      {/* donut chart */}
      <div style={{ position: "relative" }}>
        <PieChart width={300} height={260}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={3}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => `${value} (${getPercent(value)}%)`}
          />
        </PieChart>

        {/* total count in center */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontFamily: "Montserrat",
              fontWeight: 700,
              color: "#0B2341",
            }}
          >
            {total}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#888",
              fontFamily: "Urbanist",
            }}
          >
            Total
          </div>
        </div>
      </div>

      {/* priority breakdown table */}
      <div
        style={{
          background: "#f9fafb",
          borderRadius: 12,
          padding: "16px 18px",
          border: "1px solid #E1E6EB",
          fontFamily: "Urbanist",
          minWidth: 200,
        }}
      >
        <h4 style={{ 
          marginBottom: 10, 
          fontFamily: "Montserrat", 
          color: "#0B2341",
          fontSize: 14,
          fontWeight: 600
        }}>
          Priority Breakdown
        </h4>

        {data.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 0",
              fontSize: 13,
              color: "#0B2341",
              borderBottom: idx < data.length - 1 ? "1px solid #e0e0e0" : "none",
            }}
          >
            <span style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: COLORS[idx % COLORS.length],
                  flexShrink: 0,
                }}
              />
              <span style={{ fontWeight: 500 }}>{item.name}</span>
            </span>

            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <span style={{ fontWeight: 600, minWidth: 30, textAlign: "right" }}>
                {item.value}
              </span>
              <span style={{ color: "#888", fontSize: 12, minWidth: 35, textAlign: "right" }}>
                {getPercent(item.value)}%
              </span>
            </div>
          </div>
        ))}

        {/* total row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 0",
            marginTop: 8,
            paddingTop: 10,
            borderTop: "2px solid #E1E6EB",
            fontSize: 13,
            color: "#0B2341",
            fontWeight: 700,
          }}
        >
          <span>Total</span>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ minWidth: 30, textAlign: "right" }}>{total}</span>
            <span style={{ minWidth: 35, textAlign: "right" }}>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
