
import React, { useEffect, useState } from "react";
import { fetchDashboardMetrics } from "../api/metricsApi";

import KpiCard from "../components/KpiCard";
import GlobalPriorityDonut from "../components/GlobalPriorityDonut";
import StackedColumnChart from "../components/StackedColumnChart";
import DashboardTable from "../components/DashboardTable";
import RevealRow from "../components/RevealRow";
import TrendMetricCard from "../components/TrendMetricCard";
import SystemAnalytics from "../components/SystemAnalytics";


const MonitoringDashboardPage = () => {

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());


  const [analyticsYear, setAnalyticsYear] = useState(new Date().getFullYear());
  const [analyticsTrendCreated, setAnalyticsTrendCreated] = useState([]);
  const [analyticsTrendClosed, setAnalyticsTrendClosed] = useState([]);


  const [selectedRiskYear, setSelectedRiskYear] = useState(new Date().getFullYear());
  const [selectedActionYear, setSelectedActionYear] = useState(new Date().getFullYear());

  const [kpis, setKpis] = useState(null);
  const [moduleStatus, setModuleStatus] = useState([]);
  const [trendRisks, setTrendRisks] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  const [feeds, setFeeds] = useState({
    risks: [],
    dependencies: [],
    issues: [],
    actions: []
  });


  const [selectedActionWeek, setSelectedActionWeek] = useState(null);
  const [availableActionWeeks, setAvailableActionWeeks] = useState([]);
  const [weeklyActionStatus, setWeeklyActionStatus] = useState(null);


  const [selectedActionMonth, setSelectedActionMonth] = useState("");
  const [availableActionMonths, setAvailableActionMonths] = useState([]);


  const [selectedPriority, setSelectedPriority] = useState(null);


  const [selectedModule, setSelectedModule] = useState("Risk");
  const [priorityByModule, setPriorityByModule] = useState({});


  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchDashboardMetrics({
          year: selectedYear,
          risk_year: selectedRiskYear,
          week_start: selectedActionWeek,
          priority: selectedPriority
        });

        const data = res?.data || res;


        setKpis({
          totalOpen: Number(data.total_open ?? 0),
          totalInProgress: Number(data.total_on_hold ?? 0),
          totalClosed: Number(data.resolved ?? 0),
          totalApproved: Number(data.approved ?? 0),
          totalItems: Number(data.total_items ?? 0),
          totalCancelled: Number(data.cancelled ?? 0),
          action_completion_percent: Number(data.action_completion_percent ?? 0),

          trend_closed: data.trend_closed || [],
          trend_escalations: data.trend_escalations || [],
          prioritySplit: data.priority_split || []
        });


        setPriorityByModule(data.priority_by_module || {});


        const trends = (data.monthly_risk_trend || []).map(t => ({
          month: t.month,
          count: Number(t.count)
        }));
        setTrendRisks(trends);


        setWeeklyActionStatus(data.weekly_action_status || null);


        setFeeds({
          risks: data.latest_risks || [],
          dependencies: data.latest_dependencies || [],
          issues: data.latest_issues || [],
          actions: data.latest_actions || []
        });


        setModuleStatus(data.module_status || []);


        const years = data.available_years || [];
        setAvailableYears(years);


        const weeks = data.available_action_weeks || [];
        setAvailableActionWeeks(weeks);


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



        let currentWeek = selectedActionWeek;
        let currentMonth = selectedActionMonth;

        if (!currentWeek && data.selected_action_week) {
          currentWeek = data.selected_action_week;
        }

        if (currentWeek) {
          const d = new Date(currentWeek);
          if (!isNaN(d.getTime())) {
            const weekMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

            if (!currentMonth || currentMonth !== weekMonthKey) {
              currentMonth = weekMonthKey;
            }
          }
        }


        if (currentWeek !== selectedActionWeek) setSelectedActionWeek(currentWeek);
        if (currentMonth !== selectedActionMonth) setSelectedActionMonth(currentMonth);

      } finally {

      }
    };
    load();
  }, [selectedYear, selectedRiskYear, selectedActionWeek, selectedPriority, selectedActionMonth]);


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
        fontFamily: "Lato"
      }}
    >
      { }
      <RevealRow delay={0.0}>
        <section style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>

          { }
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", flex: "1 1 500px" }}>
            { }
            <div style={{ display: "flex", gap: "16px", justifyContent: "space-between", flexWrap: "wrap" }}>
              <KpiCard title="Open" value={kpis.totalOpen} />
              <KpiCard title="Resolved" value={kpis.totalClosed} />
              <KpiCard title="Approved" value={kpis.totalApproved} />
              <KpiCard title="Cancelled" value={kpis.totalCancelled} />
            </div>

            { }
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
                { }
                <div style={{ background: "#FEF2F2", padding: 12, borderRadius: 8, border: "1px solid #FEE2E2", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#991B1B", fontWeight: 700, textTransform: "uppercase" }}>Critical</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#DC2626", marginTop: 4 }}>{pCounts.Critical || 0}</div>
                </div>
                { }
                <div style={{ background: "#FFF7ED", padding: 12, borderRadius: 8, border: "1px solid #FFEDD5", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#9A3412", fontWeight: 700, textTransform: "uppercase" }}>High</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#EA580C", marginTop: 4 }}>{pCounts.High || 0}</div>
                </div>
                { }
                <div style={{ background: "#FFFBEB", padding: 12, borderRadius: 8, border: "1px solid #FEF3C7", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#92400E", fontWeight: 700, textTransform: "uppercase" }}>Medium</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#D97706", marginTop: 4 }}>{pCounts.Medium || 0}</div>
                </div>
                { }
                <div style={{ background: "#ECFDF5", padding: 12, borderRadius: 8, border: "1px solid #D1FAE5", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#065F46", fontWeight: 700, textTransform: "uppercase" }}>Low</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#059669", marginTop: 4 }}>{pCounts.Low || 0}</div>
                </div>
              </div>
            </div>
          </div>

          { }
          <div style={{
            background: "#fff", padding: 0, borderRadius: 12,
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            overflow: "hidden",
            flex: "1 1 400px"
          }}>
            <GlobalPriorityDonut
              onPrioritySelect={setSelectedPriority}
              selectedPriority={selectedPriority}
              data={kpis?.prioritySplit || []}
            />
          </div>
        </section>
      </RevealRow>

      { }
      <RevealRow delay={0.15}>
        <section style={{
          background: "#fff", padding: 24, borderRadius: 12,
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)", width: "100%"
        }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Status by Module</h3>
          <StackedColumnChart data={moduleStatus} />
        </section>
      </RevealRow>



      { }
      <RevealRow delay={0.45}>
        <section style={{
          display: "flex", gap: 16, width: '100%'
        }}>
          <TrendMetricCard title="Issues Closed" data={kpis.trend_closed} color="#457B9D" />
          <TrendMetricCard title="Escalations" data={kpis.trend_escalations} color="#E63946" />
        </section>
      </RevealRow>

      { }
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

      { }
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
            { }
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
