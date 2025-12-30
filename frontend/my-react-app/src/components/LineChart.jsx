// Risk Trend with Year Selector
import React, { useState, useMemo } from "react";
import {
  LineChart as RLineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function LineChart({ data = [] }) {
  // Extract available years from data (if year field exists)
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    data.forEach(item => {
      if (item.year) {
        yearsSet.add(item.year);
      }
    });
    // If no year data, assume current year
    if (yearsSet.size === 0) {
      yearsSet.add(new Date().getFullYear());
    }
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [data]);

  const [selectedYear, setSelectedYear] = useState(availableYears[0] || new Date().getFullYear());

  // Filter data by selected year
  const filteredData = useMemo(() => {
    if (!data.length) return [];
    
    // If data has year field, filter by it
    if (data[0]?.year !== undefined) {
      return data.filter(item => item.year === selectedYear);
    }
    
    // Otherwise, assume all data is for selected year
    return data;
  }, [data, selectedYear]);

  // Ensure months are in correct order
  const sortedData = useMemo(() => {
    const monthMap = new Map();
    filteredData.forEach(item => {
      const monthName = item.month || "";
      monthMap.set(monthName, item.count || 0);
    });
    
    // Build array in month order
    return MONTHS.map(month => ({
      month,
      count: monthMap.get(month) || 0,
    }));
  }, [filteredData]);

  // Auto-scale Y-axis
  const maxCount = useMemo(() => {
    const max = Math.max(...sortedData.map(d => Number(d.count || 0)));
    return Math.max(max * 1.15, 10);
  }, [sortedData]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Year Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <label 
          style={{ 
            fontSize: 13, 
            fontWeight: 600, 
            color: "#0B2341",
            fontFamily: "Urbanist"
          }}
        >
          Year:
        </label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #ddd",
            fontSize: 13,
            fontFamily: "Urbanist",
            color: "#0B2341",
            cursor: "pointer",
            backgroundColor: "#fff",
          }}
        >
          {availableYears.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <RLineChart data={sortedData}>
          <CartesianGrid stroke="#e6e6e6" strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            stroke="#888"
            style={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[0, maxCount]}
            label={{ value: "Risk Count", angle: -90, position: "insideLeft" }}
            stroke="#888"
            style={{ fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 10,
            }}
            formatter={(value) => [Number(value).toLocaleString(), "Risks"]}
            labelFormatter={(label) => `${label} ${selectedYear}`}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#1A73E8"
            strokeWidth={3}
            dot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: "#1A73E8" }}
            activeDot={{ r: 8, fill: "#1A73E8" }}
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}
