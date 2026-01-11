// src/components/TrendMetricCard.jsx
import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "phosphor-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

/**
 * Modern card to display a metric trend.
 * - Displays the current count (last month's value)
 * - Indicates trend direction compared to previous month
 * - Displays a small sparkline chart (Lines)
 */
const TrendMetricCard = ({ title, data = [], color = "#3b82f6" }) => {
    const currentMonthIndex = new Date().getMonth(); // 0-11
    const currentVal = data[currentMonthIndex]?.value || 0;
    const prevVal = currentMonthIndex > 0 ? (data[currentMonthIndex - 1]?.value || 0) : 0;

    let trend = "neutral";
    if (currentVal > prevVal) trend = "up";
    if (currentVal < prevVal) trend = "down";

    const diff = currentVal - prevVal;
    const diffStr = diff > 0 ? `+${diff}` : `${diff}`;

    // Process data for charts: just need [{value: x}, ...] which we have.
    // We might want to add 'name' effectively being index
    const chartData = data.map((d, i) => ({ i, value: d.value }));

    return (
        <div style={{
            background: "#fff",
            borderRadius: 12,
            padding: "16px 20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderLeft: `4px solid ${color}`,
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: 'relative', zIndex: 10 }}>
                <div>
                    <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {title}
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: "#111827", lineHeight: 1, marginTop: 12 }}>
                        {currentVal}
                    </div>
                </div>

                {/* Trend Indicator */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontSize: 13, fontWeight: 600,
                    color: trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#9CA3AF"
                }}>
                    {trend === "up" && <ArrowUpRight size={16} weight="bold" />}
                    {trend === "down" && <ArrowDownRight size={16} weight="bold" />}
                    {trend === "neutral" && <Minus size={16} weight="bold" />}
                    <span>{trend === "neutral" ? "No Change" : `${diffStr}`}</span>
                </div>
            </div>

            {/* Sparkline Chart */}
            <div style={{ height: 60, width: '100%', marginTop: 8 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={3}
                            dot={false}
                            isAnimationActive={true}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TrendMetricCard;
