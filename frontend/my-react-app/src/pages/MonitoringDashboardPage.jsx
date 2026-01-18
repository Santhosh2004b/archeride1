// PHASE-11 — FULL REAL DASHBOARD + STATUS BY MODULE FIX
import React, { useEffect, useState } from "react";
import { fetchDashboardMetrics } from "../api/metricsApi";

import KpiCard from "../components/KpiCard";
import GlobalPriorityDonut from "../components/GlobalPriorityDonut";
import StackedColumnChart from "../components/StackedColumnChart";
import DashboardTable from "../components/DashboardTable";
import RevealRow from "../components/RevealRow";
import TrendMetricCard from "../components/TrendMetricCard"; // [NEW]
import SystemAnalytics from "../components/SystemAnalytics"; // [NEW]


const MonitoringDashboardPage = () => {
  // Dashboard Global State (for KPIs/Trends that are shared)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Isolated state for System Analytics section
  const [analyticsYear, setAnalyticsYear] = useState(new Date().getFullYear());
  const [analyticsTrendCreated, setAnalyticsTrendCreated] = useState([]);
  const [analyticsTrendClosed, setAnalyticsTrendClosed] = useState([]);

  // Independent Widget State
  const [selectedRiskYear, setSelectedRiskYear] = useState(new Date().getFullYear());
  const [selectedActionYear, setSelectedActionYear] = useState(new Date().getFullYear());

  const [kpis, setKpis] = useState(null);
  const [moduleStatus, setModuleStatus] = useState([]);
  const [trendRisks, setTrendRisks] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  const [feeds, setFeeds] = useState({
    risks: [],
    collections: [],
    dependencies: [],
    issues: [],
    actions: []
  });

  // Action / Accident Filter State
  const [selectedActionWeek, setSelectedActionWeek] = useState(null);
  const [availableActionWeeks, setAvailableActionWeeks] = useState([]);
  const [weeklyActionStatus, setWeeklyActionStatus] = useState(null);

  // New states for month filter
  const [selectedActionMonth, setSelectedActionMonth] = useState("");
  const [availableActionMonths, setAvailableActionMonths] = useState([]);

  // Priority Filter State (For Global Donut Controller)
  const [selectedPriority, setSelectedPriority] = useState(null);

  // [NEW] Task 2: Module Dropdown for Priority Boxes
  const [selectedModule, setSelectedModule] = useState("Risk"); // Default to Risk or just first in list
  const [priorityByModule, setPriorityByModule] = useState({});

  // Fetch metrics when component mounts or state changes
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchDashboardMetrics({
          year: selectedYear,         // Global context for KPIs
          risk_year: selectedRiskYear,// Specific for Risk Chart
          week_start: selectedActionWeek,
          priority: selectedPriority
        });

        const data = res?.data || res;

        // ---- KPI ROW ----
        setKpis({
          totalOpen: Number(data.total_open ?? 0),
          totalInProgress: Number(data.total_on_hold ?? 0),
          totalClosed: Number(data.resolved ?? 0),
          totalItems: Number(data.total_items ?? 0),
          action_completion_percent: Number(data.action_completion_percent ?? 0),

          trend_collections: data.trend_collections || [],
          trend_closed: data.trend_closed || [],
          trend_escalations: data.trend_escalations || [],
          prioritySplit: data.priority_split || []
        });

        // ---- PRIORITY BY MODULE (Task 2) ----
        setPriorityByModule(data.priority_by_module || {});

        // ---- MONTHLY TREND (Now respects risk_year) ----
        const trends = (data.monthly_risk_trend || []).map(t => ({
          month: t.month,
          count: Number(t.count)
        }));
        setTrendRisks(trends);

        // ---- WEEKLY ACTION COMPLETION ----
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
        const modStatusData = (data.module_status || []).filter(
          m => m.module !== "Collection"
        );
        setModuleStatus(modStatusData);

        // ---- AVAILABLE YEARS ----
        const years = data.available_years || [];
        setAvailableYears(years);

        // ---- AVAILABLE ACTION WEEKS ----
        const weeks = data.available_action_weeks || [];
        setAvailableActionWeeks(weeks);

        // Derive unique months from weeks
        const monthsSet = new Set();
        const monthOptions = [];

        weeks.forEach(w => {
          const d = new Date(w.value);
          if (!isNaN(d.getTime())) {
            const mStr = d.toLocaleString('default', { month: 'short', year: 'numeric' });
            const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

            if (!monthsSet.has(mKey)) {
              monthsSet.add(mKey);
              monthOptions.push({ value: mKey, label: mStr });
            }
          }
        });
        setAvailableActionMonths(monthOptions);

        // Initial Selection Logic / Drilldown Helper
        // Only run this if we have weeks and haven't selected anything yet, or if weeks change significantly
        let currentWeek = selectedActionWeek;
        let currentMonth = selectedActionMonth;

        if (!currentWeek && data.selected_action_week) {
          currentWeek = data.selected_action_week;
        }

        if (currentWeek) {
          const d = new Date(currentWeek);
          if (!isNaN(d.getTime())) {
            const weekMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            // If the selected week's month doesn't match current month filter, update month filter
            if (!currentMonth || currentMonth !== weekMonthKey) {
              currentMonth = weekMonthKey;
            }
          }
        }

        // Update states if they changed during initialization logic
        if (currentWeek !== selectedActionWeek) setSelectedActionWeek(currentWeek);
        if (currentMonth !== selectedActionMonth) setSelectedActionMonth(currentMonth);

      } finally {
        // loading state removed
      }
    };
    load();
  }, [selectedYear, selectedRiskYear, selectedActionWeek, selectedPriority, selectedActionMonth]);

  // Fetch isolated data for System Analytics when its specific year changes
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const res = await fetchDashboardMetrics({ year: analyticsYear });
        const data = res?.data || res;
        setAnalyticsTrendCreated(data.trend_created || []);
        setAnalyticsTrendClosed(data.trend_closed || []);
      } catch (error) {
        console.error("Failed to load analytics data", error);
      }
    };
    loadAnalyticsData();
  }, [analyticsYear]);


  // Helper for Priority Boxes
  const getPriorityCounts = () => {
    if (!selectedModule || !priorityByModule[selectedModule]) return { Critical: 0, High: 0, Medium: 0, Low: 0 };
    return priorityByModule[selectedModule];
  };
  const pCounts = getPriorityCounts();

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
      {/* ROW 1 — KPIs + Donut + Priority Boxes */}
      <RevealRow delay={0.0}>
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* LEFT COLUMN: KPIs + BOXES */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* KPIs */}
            <div style={{ display: "flex", gap: "16px", justifyContent: "space-between" }}>
              <KpiCard title="Total Open" value={kpis.totalOpen} />
              <KpiCard title="On Hold" value={kpis.totalInProgress} />
              <KpiCard title="Closed" value={kpis.totalClosed} />
              <KpiCard title="Total Items" value={kpis.totalItems} />
            </div>

            {/* PRIORITY BOXES (Task 2) */}
            <div style={{
              background: "#fff", padding: "20px", borderRadius: 12,
              boxShadow: "0 6px 16px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 16
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>Priority Breakdown</h3>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid #E5E7EB",
                    fontSize: 13,
                    fontWeight: 600,
                    outline: "none",
                    cursor: "pointer",
                    background: "#F9FAFB"
                  }}
                >
                  <option value="Action">Action</option>
                  <option value="Dependency">Dependency</option>
                  <option value="Issue">Issue</option>
                  <option value="Risk">Risk</option>
                  <option value="Escalation">Escalation</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                {/* Critical */}
                <div style={{ background: "#FEF2F2", padding: 12, borderRadius: 8, border: "1px solid #FEE2E2", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#991B1B", fontWeight: 700, textTransform: "uppercase" }}>Critical</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#DC2626", marginTop: 4 }}>{pCounts.Critical || 0}</div>
                </div>
                {/* High */}
                <div style={{ background: "#FFF7ED", padding: 12, borderRadius: 8, border: "1px solid #FFEDD5", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#9A3412", fontWeight: 700, textTransform: "uppercase" }}>High</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#EA580C", marginTop: 4 }}>{pCounts.High || 0}</div>
                </div>
                {/* Medium */}
                <div style={{ background: "#FFFBEB", padding: 12, borderRadius: 8, border: "1px solid #FEF3C7", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#92400E", fontWeight: 700, textTransform: "uppercase" }}>Medium</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#D97706", marginTop: 4 }}>{pCounts.Medium || 0}</div>
                </div>
                {/* Low */}
                <div style={{ background: "#ECFDF5", padding: 12, borderRadius: 8, border: "1px solid #D1FAE5", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#065F46", fontWeight: 700, textTransform: "uppercase" }}>Low</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#059669", marginTop: 4 }}>{pCounts.Low || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DONUT */}
          <div style={{
            background: "#fff", padding: 0, borderRadius: 12,
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            overflow: "hidden"
          }}>
            <GlobalPriorityDonut
              onPrioritySelect={setSelectedPriority}
              selectedPriority={selectedPriority}
              data={kpis?.prioritySplit || []}
            />
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



      {/* ROW 4 — TREND METRICS (Task 5) */}
      <RevealRow delay={0.45}>
        <section style={{
          display: "flex", gap: 16, width: '100%'
        }}>
          <TrendMetricCard title="Collections Trend" data={kpis.trend_collections} color="#2A9D8F" />
          <TrendMetricCard title="Issues Closed" data={kpis.trend_closed} color="#457B9D" />
          <TrendMetricCard title="Escalations" data={kpis.trend_escalations} color="#E63946" />
        </section>
      </RevealRow>

      {/* ROW 4.5 — SYSTEM ANALYTICS (New) */}
      <RevealRow delay={0.55}>
        <SystemAnalytics
          kpis={kpis}
          feeds={feeds}
          moduleStatus={moduleStatus}
          trendRisks={trendRisks}
          trendCreated={analyticsTrendCreated}
          trendClosed={analyticsTrendClosed}
          matrixYear={analyticsYear}
          setMatrixYear={setAnalyticsYear}
          availableYears={availableYears}
        />
      </RevealRow>

      {/* ROW 5 — TABLE FEEDS (Task 5 - Scrolling) */}
      <RevealRow delay={0.60}>
        <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>

          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}>
            <h3 style={{ marginBottom: 12, fontWeight: 700 }}>Latest Risks</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <DashboardTable
                data={feeds.risks}
                columns={["risk_id", "risk_title", "priority", "status", "account", "identified_date"]}
              />
            </div>
          </div>

          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}>
            <h3 style={{ marginBottom: 12, fontWeight: 700 }}>Collections Due</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <DashboardTable
                data={feeds.collections}
                columns={["invoice_id", "customer_name", "outstanding_amount", "status", "days_overdue", "account"]}
              />
            </div>
          </div>

          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}>
            {/* Task 5: Showing all items with vertical scrolling - ensured by maxHeight container */}
            <h3 style={{ marginBottom: 12, fontWeight: 700 }}>Latest Issues</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <DashboardTable
                data={feeds.issues}
                columns={["issue_id", "issue_title", "priority", "status", "account", "identified_date"]}
              />
            </div>
          </div>
        </section>
      </RevealRow>
    </div>
  );
};

export default MonitoringDashboardPage;
