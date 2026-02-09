
import React, { useState, useMemo } from "react";
import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STATUS_COLORS = {
  Open: "#E63946",
  "On Hold": "#FB8500",
  Resolved: "#457B9D",
};


function generateWeekRanges() {
  const today = new Date();
  const weeks = [];

  for (let i = 0; i < 8; i++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (today.getDay() || 7) - i * 7);

    const dayName = DAYS_SHORT[weekStart.getDay() || 0];
    const monthName = weekStart.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const date = String(weekStart.getDate()).padStart(2, "0");
    const year = weekStart.getFullYear();

    const label = `${date}-${dayName}-${monthName}-${year}`;
    weeks.push({ label, startDate: new Date(weekStart) });
  }

  return weeks;
}

export default function HorizontalBarChart({ data = [] }) {
  const weeks = useMemo(() => generateWeekRanges(), []);
  const [selectedWeek, setSelectedWeek] = useState(weeks[0]?.label || "");

  
  const weekDateRange = useMemo(() => {
    const selected = weeks.find(w => w.label === selectedWeek);
    if (!selected) return { start: new Date(), end: new Date() };

    const start = new Date(selected.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6); 

    return { start, end };
  }, [selectedWeek, weeks]);

  
  const chartData = useMemo(() => {
    const days = [];
    const current = new Date(weekDateRange.start);

    for (let i = 0; i < 7; i++) {
      const dateStr = current.toISOString().split("T")[0]; 
      const dayName = DAYS_SHORT[current.getDay() || 0];
      const dayNum = current.getDate();

      
      const dayData = data.find(d => {
        if (!d.date) return false;
        return d.date.substring(0, 10) === dateStr;
      });

      days.push({
        label: `${dayName} ${dayNum}`,
        date: dateStr,
        Open: dayData?.Open || 0,
        "On Hold": dayData?.["On Hold"] || 0,
        Resolved: dayData?.Resolved || 0,
      });

      current.setDate(current.getDate() + 1);
    }

    
    return days.reverse();
  }, [weekDateRange, data]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#0B2341",
            fontFamily: "Urbanist",
            whiteSpace: "nowrap",
          }}
        >
          Week:
        </label>
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #ddd",
            fontSize: 13,
            fontFamily: "Urbanist",
            color: "#0B2341",
            cursor: "pointer",
            backgroundColor: "#fff",
            minWidth: 180,
          }}
        >
          {weeks.map(week => (
            <option key={week.label} value={week.label}>
              {week.label}
            </option>
          ))}
        </select>
      </div>

      {}
      <ResponsiveContainer width="100%" height={280}>
        <RBarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 80, bottom: 10 }}
        >
          <XAxis type="number" />
          <YAxis
            dataKey="label"
            type="category"
            width={75}
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
          />
          <Legend
            wrapperStyle={{ paddingTop: 12 }}
            verticalAlign="bottom"
            height={24}
          />

          <Bar
            dataKey="Open"
            stackId="status"
            fill={STATUS_COLORS.Open}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="On Hold"
            stackId="status"
            fill={STATUS_COLORS["On Hold"]}
            isAnimationActive={true}
            animationDuration={900}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="Resolved"
            stackId="status"
            fill={STATUS_COLORS.Resolved}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}
