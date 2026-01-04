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

async function loadByModule(module) {
  switch (module) {
    case "risk": return await fetchRiskNotifications();
    case "issue": return await fetchIssueNotifications();
    case "dependency": return await fetchDependencyNotifications();
    case "escalation": return await fetchEscalationNotifications();
    case "action": return await fetchActionNotifications();
    default: return [];
  }
}

const MonitoringNotificationsPage = () => {
  const navigate = useNavigate();

  const [selectedModule, setSelectedModule] = useState("risk");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentById, setCommentById] = useState({});
  const [expandedId, setExpandedId] = useState(null);

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
    setExpandedId(null);
    load(selectedModule);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule]);

  const handleDecision = async (id, decision) => {
    const comment = commentById[id] || "";
    try {
      switch (selectedModule) {
        case "risk": await decideRiskNotification(id, decision, comment); break;
        case "issue": await decideIssueNotification(id, decision, comment); break;
        case "dependency": await decideDependencyNotification(id, decision, comment); break;
        case "escalation": await decideEscalationNotification(id, decision, comment); break;
        case "action": await decideActionNotification(id, decision, comment); break;
        default: return;
      }
      await load();
      setExpandedId(null);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to update");
    }
  };

  const getLabel = () => MODULES.find((m) => m.key === selectedModule)?.label || "Risk";

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <motion.div
      className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 sm:px-8 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto font-urbanist">
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-medium text-gray-900">
            {getLabel()} Approval Inbox
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and approve pending status changes.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex flex-wrap gap-2">
          {MODULES.map((m) => {
            const active = selectedModule === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelectedModule(m.key)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${active
                  ? "bg-black text-white shadow-lg transform scale-105"
                  : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100"
                  }`}
              >
                {m.label} Inbox
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-gray-400">
            <span className="text-4xl mb-4">✨</span>
            <p>No pending approvals for {getLabel()}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...items]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((n) => {
                const p = n.payload || {};
                // Extract meaningful data
                const title = p.risk_title || p.issue_title || p.dependency_title || p.action_title || p.title || "(No Title)";
                const project = p.project_name || p.project || "Unknown Project";
                const priority = p.priority || "Medium";
                const idField = n.risk_id || n.issue_id || n.dependency_id || n.escalation_id || n.action_id || n.item_code || n.id?.substring(0, 8);
                const fromUser = p.from || p.bm_user || p.created_by || "BM User";

                const isExpanded = expandedId === n.id;

                return (
                  <div
                    key={n.id}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${isExpanded ? "ring-2 ring-blue-500 shadow-md transform scale-[1.01]" : "hover:shadow-md"
                      }`}
                  >
                    {/* Card Header (Clickable) */}
                    <div className="p-5 cursor-pointer" onClick={() => toggleExpand(n.id)}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 truncate max-w-[60%]">
                          {project}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${(priority === "Critical" || priority === "High") ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                          }`}>
                          {priority}
                        </span>
                      </div>

                      <h3 className="font-montserrat font-bold text-lg text-gray-900 mb-1 truncate">
                        {idField}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-1 h-5">{title}</p>

                      <div className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-gray-400 mb-1 text-[10px] uppercase">Status Change</span>
                          <div className="flex items-center gap-2 font-medium">
                            <span className="line-through text-gray-400">{n.status_before || "Open"}</span>
                            <span className="text-gray-300">→</span>
                            <span className={`
                                   ${(n.status_after || "").toLowerCase().includes("resolved") ? "text-blue-600" :
                                (n.status_after || "").toLowerCase().includes("closed") ? "text-green-600" : "text-gray-800"}
                                `}>
                              {n.status_after}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-gray-400 mb-1 text-[10px] uppercase">Updated</span>
                          <span className="text-gray-700">{new Date(n.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600">
                            {fromUser.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-500 truncate max-w-[100px]">{fromUser}</span>
                        </div>
                        <span className="text-xs text-blue-500 font-bold hover:underline">
                          {isExpanded ? "Hide Details" : "View Details"}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-0 animate-fadeIn bg-white border-t border-gray-100">
                        <div className="mt-4 space-y-3">
                          {/* Mini Data Table */}
                          <div className="grid grid-cols-2 gap-2 text-xs mb-4 p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="block text-gray-400 text-[10px] uppercase">BM User</span>
                              <span className="font-medium text-gray-700 break-words">{fromUser}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-[10px] uppercase">Module</span>
                              <span className="font-medium text-gray-700 capitalize">{selectedModule}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-[10px] uppercase">Item Code</span>
                              <span className="font-medium text-gray-700">{n.item_code || idField}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-[10px] uppercase">Created At</span>
                              <span className="font-medium text-gray-700">{new Date(n.created_at).toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Payload Dump (Styled) */}
                          <div className="mb-4">
                            <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Payload Data</span>
                            <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto max-h-40 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                              <pre className="text-[10px] font-mono text-green-400 whitespace-pre-wrap">
                                {JSON.stringify(p, null, 2)}
                              </pre>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="space-y-3 pt-2 border-t border-gray-100">
                            <input
                              type="text"
                              value={commentById[n.id] || ""}
                              onChange={(e) => setCommentById((prev) => ({ ...prev, [n.id]: e.target.value }))}
                              placeholder="Admin comment..."
                              className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDecision(n.id, "Closed")}
                                className="flex-1 py-2 bg-black text-white text-xs font-bold uppercase rounded hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                              >
                                Approve & Close
                              </button>
                              <button
                                onClick={() => handleDecision(n.id, "On Hold")}
                                className="flex-1 py-2 border border-gray-300 text-gray-700 text-xs font-bold uppercase rounded hover:bg-gray-50 transition-colors"
                              >
                                Keep Open
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                const base = `${selectedModule}s`;
                                navigate(`/monitoring/${base}?id=${encodeURIComponent(n.item_code || n.risk_id || n.id)}`); // Try to link via code if possible
                              }}
                              className="w-full py-2 text-blue-600 text-xs font-bold uppercase hover:bg-blue-50 rounded transition-colors"
                            >
                              Open Item View
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MonitoringNotificationsPage;
