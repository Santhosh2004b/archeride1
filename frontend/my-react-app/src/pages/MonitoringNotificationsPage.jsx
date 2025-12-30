// src/pages/MonitoringNotificationsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  fetchRiskNotifications,
  fetchIssueNotifications,
  fetchDependencyNotifications,
  fetchEscalationNotifications,
  fetchActionNotifications,
  decideRiskNotification,
  decideIssueNotification,
  decideDependencyNotification,
  decideEscalationNotification,
  decideActionNotification,
} from "../api/notificationsApi";

const MODULES = [
  { key: "risk", label: "Risk" },
  { key: "issue", label: "Issue" },
  { key: "dependency", label: "Dependency" },
  { key: "escalation", label: "Escalation" },
  { key: "action", label: "Action" },
];

// resolve notifications by module
async function loadByModule(module) {
  switch (module) {
    case "risk":
      return await fetchRiskNotifications();
    case "issue":
      return await fetchIssueNotifications();
    case "dependency":
      return await fetchDependencyNotifications();
    case "escalation":
      return await fetchEscalationNotifications();
    case "action":
      return await fetchActionNotifications();
    default:
      return [];
  }
}

// module visual tokens (Tailwind utility classes)
const moduleColors = {
  all: {
    bg: "bg-gray-900",
    pill: "bg-gray-200",
    text: "text-gray-900",
  },
};

const MonitoringNotificationsPage = () => {
  const navigate = useNavigate();

  const [selectedModule, setSelectedModule] = useState("risk");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentById, setCommentById] = useState({});
  const [openId, setOpenId] = useState(null); // expanded row id

  // load items
  const load = async (module = selectedModule) => {
    try {
      setLoading(true);
      const data = await loadByModule(module);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOpenId(null);
    load(selectedModule);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule]);

  const handleDecision = async (id, decision) => {
    const comment = commentById[id] || "";
    try {
      switch (selectedModule) {
        case "risk":
          await decideRiskNotification(id, decision, comment);
          break;
        case "issue":
          await decideIssueNotification(id, decision, comment);
          break;
        case "dependency":
          await decideDependencyNotification(id, decision, comment);
          break;
        case "escalation":
          await decideEscalationNotification(id, decision, comment);
          break;
        case "action":
          await decideActionNotification(id, decision, comment);
          break;
        default:
          return;
      }
      // reload list after decision
      await load();
      // collapse the row (optional)
      setOpenId(null);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to update");
    }
  };

  const buildTitleAndProject = (p) => {
    let title = "";
    switch (selectedModule) {
      case "risk":
        title = p.risk_title || p.title || "";
        break;
      case "issue":
        title = p.issue_title || p.title || "";
        break;
      case "dependency":
        title = p.dependency_title || p.title || "";
        break;
      case "action":
        title = p.action_title || p.title || "";
        break;
      default:
        title = p.title || "";
    }
    const project = p.project_name || p.project || "-";
    return { title, project };
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const label = MODULES.find((m) => m.key === selectedModule)?.label || "Risk";
  const colorFor = moduleColors.all;

  // row click behaviour (dependency navigates to module page)
  const handleRowClick = (n) => {
    

    setOpenId((prev) => (prev === n.id ? null : n.id));
  };


  return (
    <motion.div 
      className="min-h-[calc(100vh-80px)] bg-gray-50 px-3 sm:px-6 py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto font-urbanist">
        <h2 className="font-marcellus text-2xl text-gray-900 mb-4">
          {label} Approval Inbox
        </h2>

        {/* Tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {MODULES.map((m) => {
            const active = selectedModule === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelectedModule(m.key)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm border flex items-center gap-2 transition ${active
                  ? "bg-gray-900 text-white border-gray-900 shadow"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden">
          {loading ? (
            <div className="p-4 text-sm text-slate-400">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-sm text-slate-400">No pending notifications.</div>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full text-left text-xs font-urbanist">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-2 font-extrabold text-xs uppercase tracking-wide text-gray-800 whitespace-nowrap">Project Name</th>
                    <th className="px-2 py-2 font-extrabold text-xs uppercase tracking-wide text-gray-800 whitespace-nowrap">ID</th>
                    <th className="px-2 py-2 font-extrabold text-xs uppercase tracking-wide text-gray-800 whitespace-nowrap">Priority</th>
                    <th className="px-2 py-2 font-extrabold text-xs uppercase tracking-wide text-gray-800 whitespace-nowrap">Status Before</th>
                    <th className="px-2 py-2 font-extrabold text-xs uppercase tracking-wide text-gray-800 whitespace-nowrap">Status After</th>
                    <th className="px-2 py-2 font-extrabold text-xs uppercase tracking-wide text-gray-800 whitespace-nowrap">Recent Update Time</th>
                  </tr>
                </thead>
                <tbody>
                  {[...items]
                    .sort((a, b) => {
                      // Resolved first, then by created_at desc
                      const aResolved = (a.status_after || "").toLowerCase().includes("resolved");
                      const bResolved = (b.status_after || "").toLowerCase().includes("resolved");
                      if (aResolved && !bResolved) return -1;
                      if (!aResolved && bResolved) return 1;
                      return new Date(b.created_at) - new Date(a.created_at);
                    })
                    .map((n) => {
                      const p = n.payload || {};
                      const { title, project } = buildTitleAndProject(p);
                      const idField = n.risk_id || n.issue_id || n.dependency_id || n.escalation_id || n.action_id || n.id;
                      const priority = p.priority || "NA";
                      const statusBadge = (status) => {
                        const s = (status || "").toLowerCase();
                        if (s.includes("approved")) return "bg-green-100 text-green-700 border-green-300";
                        if (s.includes("resolved")) return "bg-blue-100 text-blue-700 border-blue-300";
                        if (s.includes("inholding")) return "bg-yellow-100 text-yellow-700 border-yellow-300";
                        if (s.includes("open")) return "bg-gray-100 text-gray-700 border-gray-300";
                        if (s.includes("cancelled")) return "bg-gray-200 text-gray-500 border-gray-300";
                        return "bg-gray-100 text-gray-700 border-gray-300";
                      };
                      // Helper variables for summary/detail row
                      const from = p.from || p.bm_user || p.created_by || "-";
                      const timeText = n.created_at ? new Date(n.created_at).toLocaleString() : "-";
                      const isOpen = openId === n.id;
                      return (
                        <React.Fragment key={n.id}>
                          {/* Table Row */}
                          <tr className="border-b border-gray-100">
                            <td className="px-2 py-2 whitespace-nowrap text-xs font-semibold">{project}</td>
                            <td className="px-2 py-2 whitespace-nowrap text-xs">{idField}</td>
                            <td className="px-2 py-2 whitespace-nowrap text-xs font-semibold">{priority}</td>
                            <td className="px-2 py-2 whitespace-nowrap text-xs">
                              <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${statusBadge(n.status_before)}`}>{n.status_before || "-"}</span>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-xs">
                              <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${statusBadge(n.status_after)}`}>{n.status_after || "-"}</span>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-xs">{n.created_at ? new Date(n.created_at).toLocaleString() : "-"}</td>
                          </tr>
                          {/* Summary/Detail Row (collapsible) */}
                          <tr>
                            <td colSpan={6} className="p-0">
                              <div className="relative">
                                {/* summary row */}
                                <button
                                  type="button"
                                  onClick={() => handleRowClick(n)}
                                  className={`w-full flex items-start sm:items-center gap-3 px-3 sm:px-5 py-3 hover:bg-slate-800/70 transition text-left`}
                                >
                                  {/* left controls */}
                                  <div className="flex items-start sm:items-center gap-3 text-slate-400 pt-1 sm:pt-0">
                                    <div className="h-4 w-4 border border-slate-600 rounded-sm" />
                                    <div className="h-3 w-3 rounded-full bg-amber-400 mt-1 sm:mt-0" />
                                  </div>
                                  {/* main */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                        <span className="text-sm sm:text-base text-slate-50 truncate max-w-[45vw] sm:max-w-xs">
                                          {title || "(No title)"}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${colorFor.pill} ${colorFor.text} border border-slate-200/10`}>
                                          {n.item_code || "-"}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-900 border border-slate-200">
                                          {project}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-600/10 text-amber-300 border border-amber-400/60">
                                          {priority}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-slate-400">{timeText}</span>
                                        <span className="text-[11px] text-slate-400">{isOpen ? "Hide details" : "View details"}</span>
                                      </div>
                                    </div>
                                    <div className="mt-1">
                                      <span className="text-xs text-slate-400 block truncate max-w-full">
                                        From {from} • Status set to {n.status_after || "Completed"} • Awaiting admin decision
                                      </span>
                                    </div>
                                  </div>
                                </button>
                                {/* detail row (collapsible) */}
                                {isOpen && (
                                  <div className="px-3 sm:px-5 pb-4 bg-gray-50 transition-all duration-300 ease-out">
                                    <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm">
                                      <table className="min-w-full text-sm">
                                        <tbody>
                                          <tr className="border-b border-slate-100">
                                            <td className="px-3 py-3 font-semibold w-1/4">BM User</td>
                                            <td className="px-3 py-3 w-1/4">{from}</td>
                                            <td className="px-3 py-3 font-semibold w-1/4">Module</td>
                                            <td className="px-3 py-3 w-1/4 capitalize">{selectedModule}</td>
                                          </tr>
                                          <tr className="border-b border-slate-100">
                                            <td className="px-3 py-3 font-semibold">Item Code</td>
                                            <td className="px-3 py-3">{n.item_code || "-"}</td>
                                            <td className="px-3 py-3 font-semibold">Project</td>
                                            <td className="px-3 py-3">{project}</td>
                                          </tr>
                                          <tr className="border-b border-slate-100">
                                            <td className="px-3 py-3 font-semibold">Priority</td>
                                            <td className="px-3 py-3">{priority}</td>
                                            <td className="px-3 py-3 font-semibold">Status Before</td>
                                            <td className="px-3 py-3">{n.status_before || "-"}</td>
                                          </tr>
                                          <tr className="border-b border-slate-100">
                                            <td className="px-3 py-3 font-semibold">Status After</td>
                                            <td className="px-3 py-3">{n.status_after || "-"}</td>
                                            <td className="px-3 py-3 font-semibold">Created At</td>
                                            <td className="px-3 py-3">{n.created_at ? new Date(n.created_at).toLocaleString() : "-"}</td>
                                          </tr>
                                          <tr>
                                            <td className="px-3 py-3 font-semibold align-top">Payload</td>
                                            <td colSpan={3} className="px-3 py-3">
                                              <pre className="text-[12px] text-slate-600 whitespace-pre-wrap break-all">
                                                {JSON.stringify(p, null, 2)}
                                              </pre>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                    {/* approval area */}
                                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 py-3">
                                      <input
                                        type="text"
                                        value={commentById[n.id] || ""}
                                        onChange={(e) =>
                                          setCommentById((prev) => ({ ...prev, [n.id]: e.target.value }))
                                        }
                                        className="w-full sm:w-80 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                        placeholder="Admin comment"
                                      />
                                      <div className="flex gap-2 items-center">
                                        <button
                                          type="button"
                                          onClick={() => handleDecision(n.id, "Closed")}
                                          className={`inline-flex items-center rounded-full px-4 py-2 text-sm text-white bg-gray-900 shadow\n`}
                                        >
                                          Approve & Close
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDecision(n.id, "On Hold")}
                                          className="inline-flex items-center rounded-full px-4 py-2 text-sm text-white bg-gray-600 shadow"
                                        >
                                          Keep Open
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            // quick navigate to edit / view page for this item (module-aware)
                                            const base = `${selectedModule}s`;
                                            navigate(`/monitoring/${base}?id=${encodeURIComponent(n.id)}`);
                                          }}
                                          className="inline-flex items-center rounded-full px-3 py-2 text-sm text-slate-700 bg-slate-100 border"
                                        >
                                          Open Item
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default MonitoringNotificationsPage;
