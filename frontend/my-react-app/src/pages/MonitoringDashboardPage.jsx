// PHASE-11 — FULL REAL DASHBOARD + STATUS BY MODULE FIX
import React, { useEffect, useState } from "react";
import { fetchDashboardMetrics } from "../api/metricsApi";

import KpiCard from "../components/KpiCard";
import RiskPie from "../components/DonutChart";
import PrioritySplitTable from "../components/PrioritySplitTable";
import StackedColumnChart from "../components/StackedColumnChart";
import LineChart from "../components/LineChart";
import GaugeChart from "../components/GaugeChart";
import ActionCompletionChart from "../components/ActionCompletionChart";
import SparklineCard from "../components/SparklineCard";
import DashboardTable from "../components/DashboardTable";
import RevealRow from "../components/RevealRow";

const STATUS_BUCKETS = ["Open", "on-holding", "Resolved", "Cancelled"];
// NOTE: “Approved & Closed” merged into “Resolved” (Option-A decision)

const MODULES = ["Risk", "Issue", "Dependency", "Action", "Collection"];

const normalizeStatus = (raw) => {
  if (!raw) return "Open";
  const s = raw.trim().toLowerCase();

  if (s.includes("hold")) return "on-holding";
  if (s === "approved & closed" || s === "closed" || s === "completed") return "Resolved";
  if (s === "resolved") return "Resolved";
  if (s === "cancelled") return "Cancelled";
  return "Open";
};

const MonitoringDashboardPage = () => {
  const [kpis, setKpis] = useState(null);
  const [moduleStatus, setModuleStatus] = useState([]);
  const [trendRisks, setTrendRisks] = useState([]);
  const [weeklyActionCompletion, setWeeklyActionCompletion] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [feeds, setFeeds] = useState({
    risks: [],
    collections: [],
    dependencies: [],
    issues: [],
    actions: []
  });
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  // New states for weekly action filter
  const [selectedActionWeek, setSelectedActionWeek] = useState(null);
  const [availableActionWeeks, setAvailableActionWeeks] = useState([]);
  const [weeklyActionStatus, setWeeklyActionStatus] = useState(null);

  // New states for month filter
  const [selectedActionMonth, setSelectedActionMonth] = useState("");
  const [availableActionMonths, setAvailableActionMonths] = useState([]);

  // Fetch metrics when component mounts or year changes
  // Fetch metrics when component mounts or year changes
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchDashboardMetrics({
          year: selectedYear,
          week_start: selectedActionWeek
        });

        const data = res?.data || res;

        // ---- KPI ROW ----
        setKpis({
          totalOpen: Number(data.total_open ?? 0),
          totalInProgress: Number(data.inholding ?? 0),
          totalClosed: Number(data.resolved ?? 0),
          totalItems: Number(data.total_items ?? 0),
          action_completion_percent: Number(data.action_completion_percent ?? 0),

          trend_collections: data.trend_collections || [],
          trend_closed: data.trend_closed || [],
          trend_escalations: data.trend_escalations || []
        });

        // ---- PIE DATA ----
        const formattedPie = (data.priority_split || []).map(p => ({
          name: p.priority,
          value: Number(p.count || p.value || 0),
        }));
        setPieData(formattedPie);

        // ---- MONTHLY TREND ----
        const trends = (data.monthly_risk_trend || []).map(t => ({
          month: t.month,
          count: Number(t.count)
        }));
        setTrendRisks(trends);

        // ---- WEEKLY ACTION COMPLETION ----
        // NOW STATUS COUNTS
        setWeeklyActionStatus(data.weekly_action_status || null);

        // ---- FEEDS ----
        setFeeds({
          risks: data.latest_risks || [],
          collections: data.latest_collections || [],
          dependencies: data.latest_dependencies || [],
          issues: data.latest_issues || [],
          actions: data.latest_actions || []
        });

        // ---- STATUS BY MODULE ----
        // Use accurate counts from backend instead of building from 6 latest records
        const modStatusData = (data.module_status || []).filter(
          m => m.module !== "Collection"
        );
        setModuleStatus(modStatusData);

        // ---- AVAILABLE YEARS ----
        const years = data.available_years || [];
        setAvailableYears(years);

        // ---- AVAILABLE ACTION WEEKS ----
        // ---- AVAILABLE ACTION WEEKS ----
        const weeks = data.available_action_weeks || [];
        setAvailableActionWeeks(weeks);

        // Derive unique months from weeks
        // Week Label format: "Week X — Month"
        // But we want "Month Year". 
        // Best to parse from 'value' (YYYY-MM-DD)
        const monthsSet = new Set();
        const monthOptions = [];

        weeks.forEach(w => {
          const d = new Date(w.value);
          if (!isNaN(d.getTime())) {
            const mStr = d.toLocaleString('default', { month: 'short', year: 'numeric' }); // "Nov 2024"
            const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // "2024-11" for sorting/value

            if (!monthsSet.has(mKey)) {
              monthsSet.add(mKey);
              monthOptions.push({ value: mKey, label: mStr });
            }
          }
        });
        setAvailableActionMonths(monthOptions);

        // Initial Selection Logic
        let currentWeek = selectedActionWeek;
        let currentMonth = selectedActionMonth;

        // If no week selected, use backend default
        if (!currentWeek && data.selected_action_week) {
          currentWeek = data.selected_action_week;
        }

        // Sync Month with Week if needed
        if (currentWeek) {
          const d = new Date(currentWeek);
          if (!isNaN(d.getTime())) {
            const weekMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            // Only update month if it doesn't match current selection or if selection is empty
            if (!currentMonth || currentMonth !== weekMonthKey) {
              currentMonth = weekMonthKey;
            }
          }
        } else if (monthOptions.length > 0 && !currentMonth) {
          // Fallback to first available month
          currentMonth = monthOptions[0].value;
        }

        if (currentWeek !== selectedActionWeek) setSelectedActionWeek(currentWeek);
        if (currentMonth !== selectedActionMonth) setSelectedActionMonth(currentMonth);

      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedYear, selectedActionWeek]);

  if (!kpis) return <div className="flex h-screen items-center justify-center bg-white"><p className="text-lg font-urbanist animate-pulse">Loading dashboard...</p></div>;

  return (
    <div
      style={{
        background: "#ffffff",
        minHeight: "100vh",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        fontFamily: "Urbanist"
      }}
    >
      {/* ROW 1 — KPIs + Donut */}
      <RevealRow delay={0.0}>
        <section style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "24px" }}>
          <div style={{ display: "flex", gap: "16px", justifyContent: "space-between" }}>
            <KpiCard title="Total Open" value={kpis.totalOpen} />
            <KpiCard title="On Hold" value={kpis.totalInProgress} />
            <KpiCard title="Closed" value={kpis.totalClosed} />
            <KpiCard title="Total Items" value={kpis.totalItems} />
          </div>

          <div style={{
            background: "#fff", padding: 20, borderRadius: 12,
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)"
          }}>
            <h3 style={{ marginBottom: 12, fontWeight: 700 }}>Priority Split</h3>
            <RiskPie data={pieData} />
          </div>
        </section>
      </RevealRow>

      {/* ROW 2 — MODULE STATUS (Full Width) */}
      <RevealRow delay={0.15}>
        <section style={{
          background: "#fff", padding: 24, borderRadius: 12,
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)", width: "100%"
        }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Status by Module</h3>
          <StackedColumnChart data={moduleStatus} />
        </section>
      </RevealRow>

      {/* ROW 3 — RISK TREND + WEEKLY ACTION COMPLETION */}
      <RevealRow delay={0.30}>
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Risk Trend</h3>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #D1D5DB",
                  backgroundColor: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  color: "#374151",
                  fontFamily: "Urbanist"
                }}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <LineChart data={trendRisks} />
          </div>

          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Action Status (Weekly)</h3>
              <div style={{ display: "flex", gap: 8 }}>
                {/* YEAR SELECTOR FOR ACTIONS */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #D1D5DB",
                    backgroundColor: "#fff",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    color: "#374151",
                    fontFamily: "Urbanist",
                    maxWidth: 80
                  }}
                >
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                {/* MONTH SELECTOR */}
                {availableActionMonths.length > 0 && (
                  <select
                    value={selectedActionMonth}
                    onChange={(e) => {
                      const newMonth = e.target.value;
                      setSelectedActionMonth(newMonth);
                      // Auto-select first week of new month
                      const relevantWeeks = availableActionWeeks.filter(w => {
                        const d = new Date(w.value);
                        const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                        return mKey === newMonth;
                      });
                      if (relevantWeeks.length > 0) {
                        setSelectedActionWeek(relevantWeeks[0].value);
                      } else {
                        setSelectedActionWeek("");
                      }
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #D1D5DB",
                      backgroundColor: "#fff",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      color: "#374151",
                      fontFamily: "Urbanist",
                      maxWidth: 110
                    }}
                  >
                    {availableActionMonths.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                )}

                {/* WEEK SELECTOR */}
                {availableActionWeeks.length > 0 && (
                  <select
                    value={selectedActionWeek || ""}
                    onChange={(e) => setSelectedActionWeek(e.target.value)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #D1D5DB",
                      backgroundColor: "#fff",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      color: "#374151",
                      fontFamily: "Urbanist",
                      maxWidth: 140
                    }}
                  >
                    {/* Filter weeks by selected month */}
                    {availableActionWeeks
                      .filter(w => {
                        if (!selectedActionMonth) return true;
                        const d = new Date(w.value);
                        const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                        return mKey === selectedActionMonth;
                      })
                      .map(w => (
                        <option key={w.value} value={w.value}>{w.label}</option>
                      ))}
                  </select>
                )}
              </div>
            </div>
            <ActionCompletionChart data={weeklyActionStatus} />
          </div>
        </section>
      </RevealRow>

      {/* ROW 4 — SPARKLINES */}
      <RevealRow delay={0.45}>
        <section style={{
          display: "flex", gap: 16, background: "#fff", padding: 20,
          borderRadius: 12, boxShadow: "0 6px 16px rgba(0,0,0,0.08)"
        }}>
          <SparklineCard title="Collections Trend" data={kpis.trend_collections} color="#2A9D8F" />
          <SparklineCard title="Issues Closed" data={kpis.trend_closed} color="#457B9D" />
          <SparklineCard title="Escalations" data={kpis.trend_escalations} color="#E63946" />
        </section>
      </RevealRow>

      {/* ROW 5 — TABLE FEEDS */}
      <RevealRow delay={0.60}>
        <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}>
            <h3 style={{ marginBottom: 12, fontWeight: 700 }}>Latest Risks</h3>
            <DashboardTable
              data={feeds.risks}
              columns={["risk_id", "risk_title", "priority", "status", "project_name", "identified_date"]}
            />
          </div>

          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}>
            <h3 style={{ marginBottom: 12, fontWeight: 700 }}>Collections Due</h3>
            <DashboardTable
              data={feeds.collections}
              columns={["invoice_id", "customer_name", "outstanding_amount", "status", "days_overdue", "project_name"]}
            />
          </div>

          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}>
            <h3 style={{ marginBottom: 12, fontWeight: 700 }}>Latest Issues</h3>
            <DashboardTable
              data={feeds.issues}
              columns={["issue_id", "issue_title", "priority", "status", "project_name", "identified_date"]}
            />
          </div>
        </section>
      </RevealRow>
    </div>
  );
};

export default MonitoringDashboardPage;
