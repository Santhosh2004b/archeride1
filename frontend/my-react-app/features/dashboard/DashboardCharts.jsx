import React, { useMemo } from "react";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";

//
const defaultSales = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
        {
            label: "Sales",
            data: [120, 200, 150, 220, 300, 250, 280],
            borderColor: "rgba(54,162,235,1)",
            backgroundColor: "rgba(54,162,235,0.2)",
            tension: 0.3,
            fill: true,
            pointRadius: 3,
        },
    ],
};

const defaultVisitors = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
        {
            label: "Visitors",
            data: [400, 520, 480, 610],
            backgroundColor: "rgba(255,99,132,0.6)",
            borderColor: "rgba(255,99,132,1)",
        },
    ],
};

export default function DashboardCharts({ sales = defaultSales, visitors = defaultVisitors }) {
    const lineOptions = useMemo(
        () => ({
            responsive: true,
            plugins: {
                legend: { display: true, position: "top" },
                tooltip: { mode: "index", intersect: false },
            },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
            },
        }),
        []
    );

    const barOptions = useMemo(
        () => ({
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true },
            },
        }),
        []
    );

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ padding: 12, background: "#fff", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <h4 style={{ margin: "0 0 12px 0" }}>Weekly Sales</h4>
                <Line data={sales} options={lineOptions} />
            </div>

            <div style={{ padding: 12, background: "#fff", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <h4 style={{ margin: "0 0 12px 0" }}>Monthly Visitors</h4>
                <Bar data={visitors} options={barOptions} />
            </div>
        </div>
    );
}