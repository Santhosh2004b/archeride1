import React, { useEffect, useState } from "react";
import { fetchDashboardMetrics } from "../api/metricsApi";
import { motion } from "framer-motion";

import KpiCard from "../components/KpiCard";
import GlobalPriorityDonut from "../components/GlobalPriorityDonut";
import StackedColumnChart from "../components/StackedColumnChart";
import DashboardTable from "../components/DashboardTable";
import RevealRow from "../components/RevealRow";
import TrendMetricCard from "../components/TrendMetricCard";
import SystemAnalytics from "../components/SystemAnalytics";
import ResponsibleActionsChart from "../components/ResponsibleActionsChart";
import { useFilter } from "../context/FilterContext";

const MonitoringDashboardPage = () => {
  const { selectedManager } = useFilter();

  const [analyticsYear, setAnalyticsYear] = useState(new Date().getFullYear());
  const [analyticsTrendCreated, setAnalyticsTrendCreated] = useState([]);
  const [analyticsTrendClosed, setAnalyticsTrendClosed] = useState([]);

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
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [selectedModule, setSelectedModule] = useState("Action");
  const [priorityByModule, setPriorityByModule] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchDashboardMetrics({
          week_start: selectedActionWeek,
          priority: selectedPriority,
          manager: selectedManager
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
          prioritySplit: data.priority_split || [],
          action_responsible_counts: data.action_responsible_counts || [],
          action_responsible_details: data.action_responsible_details || []
        });

        setPriorityByModule(data.priority_by_module || {});
        setTrendRisks((data.monthly_risk_trend || []).map(t => ({ month: t.month, count: Number(t.count) })));

        setFeeds({
          risks: data.latest_risks || [],
          dependencies: data.latest_dependencies || [],
          issues: data.latest_issues || [],
          actions: data.latest_actions || []
        });

        setModuleStatus(data.module_status || []);
        setAvailableYears(data.available_years || []);
      } catch (err) {
        console.error("Dashboard Load Error", err);
      }
    };
    load();
  }, [selectedActionWeek, selectedPriority, selectedManager]);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const res = await fetchDashboardMetrics({ year: analyticsYear, manager: selectedManager });
        const data = res?.data || res;
        setAnalyticsTrendCreated(data.trend_created || []);
        setAnalyticsTrendClosed(data.trend_closed || []);
      } catch (error) {
        console.error("Analytics Load Error", error);
      }
    };
    loadAnalyticsData();
  }, [analyticsYear, selectedManager]);

  const pCounts = selectedModule && priorityByModule[selectedModule] ? priorityByModule[selectedModule] : { Critical: 0, High: 0, Medium: 0, Low: 0 };

  if (!kpis) return <div className="flex h-screen items-center justify-center bg-white"><p className="text-lg font-urbanist animate-pulse">Loading dashboard...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 sm:p-8 flex flex-col gap-8 font-urbanist">
      
      {/* Top Row: KPIs and Donut Chart */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: KPIs and Priority Breakdown */}
        <div className="flex-[2] flex flex-col gap-6">
          
          {/* KPI Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard title="Open" value={kpis.totalOpen} delay={0} icon="warning" />
            <KpiCard title="Resolved" value={kpis.totalClosed} delay={0.1} icon="check" />
            <KpiCard title="Approved" value={kpis.totalApproved} delay={0.2} icon="shield" />
            <KpiCard title="Cancelled" value={kpis.totalCancelled} delay={0.3} icon="x" />
          </div>

          {/* Priority Breakdown Card */}
          <RevealRow delay={0.4}>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-marcellus font-bold text-gray-900">Priority Breakdown</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Distribution by Module Type</p>
                </div>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 outline-none cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                >
                  <option value="Action">Action</option>
                  <option value="Dependency">Dependency</option>
                  <option value="Issue">Issue</option>
                  <option value="Risk">Risk</option>
                  <option value="Escalation">Escalation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "CRITICAL", count: pCounts.Critical, bg: "bg-red-50/50", text: "text-red-600", border: "border-red-100" },
                  { label: "HIGH", count: pCounts.High, bg: "bg-orange-50/50", text: "text-orange-600", border: "border-orange-100" },
                  { label: "MEDIUM", count: pCounts.Medium, bg: "bg-amber-50/50", text: "text-amber-600", border: "border-amber-100" },
                  { label: "LOW", count: pCounts.Low, bg: "bg-emerald-50/50", text: "text-emerald-600", border: "border-emerald-100" }
                ].map((p, idx) => (
                  <motion.div 
                    key={p.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (idx * 0.05) }}
                    className={`${p.bg} ${p.border} border p-4 rounded-2xl text-center shadow-sm hover:shadow-md transition-all cursor-default`}
                  >
                    <div className={`text-[10px] font-black uppercase tracking-widest ${p.text}`}>{p.label}</div>
                    <div className={`text-2xl font-black mt-1 ${p.text}`}>{p.count}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </RevealRow>
        </div>

        {/* Right Column: Global Priority Donut */}
        <div className="flex-1 min-h-[450px]">
          <RevealRow delay={0.2} className="h-full">
            <GlobalPriorityDonut
              onPrioritySelect={setSelectedPriority}
              selectedPriority={selectedPriority}
              data={kpis?.prioritySplit || []}
            />
          </RevealRow>
        </div>
      </div>

      {/* Second Section: Top Action Owners */}
      <RevealRow delay={0.6}>
        <ResponsibleActionsChart 
          data={kpis?.action_responsible_counts || []} 
          details={kpis?.action_responsible_details || []} 
        />
      </RevealRow>

      {/* Third Section: Module Stats and Trends */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl">
          <h3 className="text-lg font-marcellus font-bold text-gray-900 mb-6 flex items-center gap-2">
             Status by Module
          </h3>
          <StackedColumnChart data={moduleStatus} />
        </div>
        <div className="flex flex-col gap-6">
          <TrendMetricCard title="Issues Closed" data={kpis.trend_closed} color="#4F46E5" />
          <TrendMetricCard title="Escalations" data={kpis.trend_escalations} color="#DC2626" />
        </div>
      </div>

      {/* Fourth Section: Analytics Matrix */}
      <RevealRow delay={0.8}>
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

      {/* Fifth Section: Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl">
          <h3 className="text-lg font-marcellus font-bold text-gray-900 mb-4">Latest Risks</h3>
          <div className="max-h-[400px] overflow-auto">
            <DashboardTable
              data={feeds.risks}
              columns={["risk_id", "risk_title", "priority", "status", "account", "identified_date"]}
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl">
          <h3 className="text-lg font-marcellus font-bold text-gray-900 mb-4">Latest Issues</h3>
          <div className="max-h-[400px] overflow-auto">
            <DashboardTable
              data={feeds.issues}
              columns={["issue_id", "issue_title", "priority", "status", "account", "identified_date"]}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default MonitoringDashboardPage;
