import React, { useEffect, useState } from "react";
import { fetchBmNotifications } from "../api/notificationsApi";
import { formatDisplayDate } from "../utils/dateFormat";

const MODULES = [
  { key: "risk", label: "Risk" },
  { key: "issue", label: "Issue" },
  { key: "dependency", label: "Dependency" },
  { key: "escalation", label: "Escalation" },
  { key: "action", label: "Action" },
  /* Removed Appreciation and Collection as requested */
];

const COLUMN_CONFIG = {
  risk: [
    { label: "Risk ID", key: "risk_id" },
    { label: "Project ID", key: "manual_project_id" },
    { label: "Risk Title", key: "risk_title" },
    { label: "Priority", key: "priority" },
    { label: "Category", key: "category" },
  ],
  issue: [
    { label: "Issue ID", key: "issue_id" },
    { label: "Project ID", key: "manual_project_id" },
    { label: "Issue Title", key: "issue_title" },
    { label: "Priority", key: "priority" },
    { label: "Category", key: "category" },
    { label: "Assigned To", key: "assigned_to" },
  ],
  dependency: [
    { label: "Dependency ID", key: "dependency_id" },
    { label: "Project ID", key: "manual_project_id" },
    { label: "Dependency Title", key: "dependency_title" },
    { label: "Priority", key: "priority" },
    { label: "Type", key: "type" },
    { label: "Required By", key: "required_by_date", isDate: true },
  ],
  escalation: [
    { label: "Escalation ID", key: "escalation_id" },
    { label: "Project ID", key: "manual_project_id" },
    { label: "Title", key: "title" },
    { label: "Priority", key: "priority" },
    { label: "Category", key: "category" },
    { label: "Escalated To", key: "escalated_to" },
  ],
  action: [
    { label: "Action ID", key: "action_id" },
    { label: "Project ID", key: "manual_project_id" },
    { label: "Action Title", key: "action_title" },
    { label: "Priority", key: "priority" },
    { label: "Owner", key: "action_owner" },
    { label: "Due Date", key: "due_date", isDate: true },
    { label: "Comp %", key: "completion_percent" },
  ],
};

/* Helper to safely extract value from item or its payload */
const getValue = (item, key) => {
  // Check in root first (useful for flattened results from model)
  if (item[key] !== undefined && item[key] !== null && item[key] !== "") {
    return item[key];
  }

  // Check in payload snapshot
  const p = item.payload || {};
  const val = p[key];

  if (val !== undefined && val !== null && val !== "") return val;

  // Fallbacks for specific IDs or common naming mismatches
  if (key.endsWith("_id")) return p.id || item.item_code || "-";
  if (key.includes("title")) return p.title || p.risk_title || p.issue_title || p.dependency_title || p.action_title || "-";
  if (key === "description") return p.description || p.risk_description || p.issue_description || p.action_description || "-";

  return "-";
};

const BmNotificationsPage = () => {
  const [selectedModule, setSelectedModule] = useState("risk");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const load = async (module = selectedModule) => {
    try {
      setLoading(true);
      const data = await fetchBmNotifications(module);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(selectedModule);
  }, [selectedModule]);

  const columns = COLUMN_CONFIG[selectedModule] || [];

  return (
    <div className="p-8">
      <h2 className="text-3xl font-montserrat font-bold mb-2">BM Notifications</h2>
      <p className="text-sm text-gray-500 mb-8 font-urbanist">
        Track status changes and history across all modules.
      </p>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {MODULES.map((m) => (
          <button
            key={m.key}
            onClick={() => setSelectedModule(m.key)}
            className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-all ${selectedModule === m.key
              ? "bg-black text-white shadow-lg"
              : "bg-white border text-gray-500 hover:bg-gray-50"
              }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-20 text-center text-gray-500 animate-pulse">Loading notifications...</div>
        ) : items.length === 0 ? (
          <div className="p-20 text-center text-gray-400 flex flex-col items-center">
            <span className="text-4xl mb-2">📭</span>
            <span>No notifications found for {selectedModule}.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0 border-r border-gray-200">
                    Status Change
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0 border-r border-gray-200">
                    Admin Feedback
                  </th>
                  {columns.map((col) => (
                    <th key={col.key} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap border-r border-gray-200 last:border-r-0">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((n) => {
                  // Special handling for Status Change column which combines before/after
                  const statusChange = (
                    <div className="flex flex-col text-xs">
                      <span className="text-gray-400 line-through">{n.status_before || "OPEN"}</span>
                      <span className="font-bold text-blue-600">↓ {n.status_after}</span>
                    </div>
                  );

                  return (
                    <React.Fragment key={n.id}>
                      <tr
                        className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${expandedId === n.id ? "bg-blue-50/50" : ""}`}
                        onClick={() => toggleExpand(n.id)}
                      >
                        <td className="px-6 py-4 border-r border-gray-100 bg-gray-50/10">
                          {statusChange}
                        </td>
                        <td className="px-6 py-4 border-r border-gray-100">
                          {n.decision ? (
                            <div className="flex flex-col">
                              <span className={`text-[10px] font-bold uppercase ${n.decision === 'Closed' ? 'text-green-600' : 'text-orange-600'}`}>
                                {n.decision === 'Closed' ? 'Approved' : n.decision}
                              </span>
                              <span className="text-xs text-gray-500 line-clamp-1 italic">{n.comment || "No comment."}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-blue-500 font-bold animate-pulse uppercase tracking-tight">Pending Admin Review</span>
                          )}
                        </td>
                        {columns.map((col) => {
                          const val = getValue(n, col.key);
                          let displayVal = val;

                          if (col.isDate && val !== "-") {
                            displayVal = formatDisplayDate(val, true);
                          }

                          return (
                            <td key={col.key} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap border-r border-gray-100 last:border-r-0">
                              {displayVal}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Expansion Row */}
                      {expandedId === n.id && (
                        <tr className="bg-gray-50/80 animate-fadeIn">
                          <td colSpan={columns.length + 2} className="px-8 py-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                              <div className="flex justify-between items-start mb-6">
                                <h4 className="text-sm font-bold uppercase text-gray-400 tracking-widest">Notification Details</h4>
                                <span className="text-[10px] text-gray-400">Created: {formatDisplayDate(n.created_at, true)}</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Status Section */}
                                <div className="space-y-4">
                                  <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                    <span className="block text-[10px] font-bold text-blue-400 uppercase mb-2">Governance Status</span>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm font-medium text-gray-500 line-through">{n.status_before || "OPEN"}</span>
                                      <span className="text-gray-300">→</span>
                                      <span className="text-sm font-bold text-blue-600">{n.status_after || "RESOLVED"}</span>
                                    </div>
                                    <div className="pt-2 border-t border-blue-200/50">
                                      <span className="block text-[10px] font-bold text-blue-400 uppercase mb-1">Admin Decision</span>
                                      <span className={`text-xs font-bold ${n.decision === 'Closed' ? 'text-green-600' : 'text-orange-600'}`}>
                                        {n.decision ? (n.decision === 'Closed' ? 'APPROVED & CLOSED' : n.decision.toUpperCase()) : 'PENDING'}
                                      </span>
                                    </div>
                                  </div>

                                  {n.comment && (
                                    <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100">
                                      <span className="block text-[10px] font-bold text-orange-400 uppercase mb-1">Admin Comment</span>
                                      <p className="text-sm text-gray-700 italic">"{n.comment}"</p>
                                    </div>
                                  )}
                                </div>

                                {/* Payload Section */}
                                <div className="lg:col-span-2">
                                  <span className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Full Record Data</span>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs text-gray-600">
                                    {Object.entries(n.payload || {}).map(([k, v]) => (
                                      <div key={k} className="flex flex-col border-b border-gray-200/50 pb-1 last:border-0 truncate">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">{k.replace(/_/g, ' ')}</span>
                                        <span className="font-medium text-gray-900 truncate" title={String(v)}>{String(v ?? '-')}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BmNotificationsPage;
