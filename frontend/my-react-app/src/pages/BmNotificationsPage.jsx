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
    { label: "Project Name", key: "project_name" },
    { label: "Reported Date", key: "reported_date", isDate: true },
    { label: "Reported By", key: "reported_by" },
    { label: "Status Before", key: "status_before", status: true },
    { label: "Status After", key: "status_after", status: true },
    { label: "Priority", key: "priority" },
    { label: "Category", key: "category" },
    { label: "Risk Title", key: "title" },
  ],
  issue: [
    { label: "Issue ID", key: "issue_id" },
    { label: "Project Name", key: "project_name" },
    { label: "Reported Date", key: "reported_date", isDate: true },
    { label: "Reported By", key: "reported_by" },
    { label: "Status Before", key: "status_before", status: true },
    { label: "Status After", key: "status_after", status: true },
    { label: "Priority", key: "priority" },
    { label: "Category", key: "category" },
    { label: "Issue Title", key: "title" },
  ],
  dependency: [
    { label: "Dependency ID", key: "dependency_id" },
    { label: "Project Name", key: "project_name" },
    { label: "Reported Date", key: "reported_date", isDate: true },
    { label: "Reported By", key: "raised_by" },
    { label: "Status Before", key: "status_before", status: true },
    { label: "Status After", key: "status_after", status: true },
    { label: "Priority", key: "priority" },
    { label: "Type", key: "type" },
    { label: "Dependency Title", key: "title" },
  ],
  escalation: [
    { label: "Escalation ID", key: "escalation_id" },
    { label: "Project Name", key: "project_name" },
    { label: "Reported Date", key: "reported_date", isDate: true },
    { label: "Reported By", key: "reported_by" },
    { label: "Status Before", key: "status_before", status: true },
    { label: "Status After", key: "status_after", status: true },
    { label: "Priority", key: "priority" },
    { label: "Category", key: "category" },
    { label: "Title", key: "title" },
    { label: "Description", key: "description" },
  ],
  action: [
    { label: "Action ID", key: "action_id" },
    { label: "Created Date", key: "created_at", isDate: true },
    { label: "Created By", key: "created_by" },
    { label: "Status Before", key: "status_before", status: true },
    { label: "Status After", key: "status_after", status: true },
    { label: "Priority", key: "priority" },
    { label: "Action Title", key: "title" },
    { label: "Action Description", key: "description" },
    { label: "Action Owner", key: "owner" },
    { label: "Due Date", key: "due_date", isDate: true },
    { label: "Completion Date", key: "completion_date", isDate: true },
  ],
};

/* Helper to safely extract value from item or its payload */
const getValue = (item, key) => {
  // First check root, then payload, then try constructing fallback
  // The notification item usually has: id, message, status_before, status_after, created_at, payload(JSON)
  // We want to prefer the current live data if possible, but the notification snapshot (payload) is often what's available.

  if (key === "status_before") return item.status_before;
  if (key === "status_after") return item.status_after;

  const val = item[key] || item.payload?.[key];
  if (val !== undefined && val !== null) return val;

  // Fallbacks for specific IDs if not strictly named in payload
  if (key.endsWith("_id")) {
    // e.g. risk_id might be stored as simply 'id' in the payload
    return item.payload?.id || item.id;
  }
  if (key === "title") return item.payload?.title || item.payload?.risk_title || item.payload?.issue_title;
  if (key === "description") return item.payload?.description;

  return "-";
};

const BmNotificationsPage = () => {
  const [selectedModule, setSelectedModule] = useState("risk");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

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
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0 border-r border-gray-200 last:border-r-0">
                    Status Change
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
                    <tr key={n.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 border-r border-gray-100 bg-gray-50/30">
                        {statusChange}
                      </td>
                      {columns.map((col) => {
                        const val = getValue(n, col.key);
                        let displayVal = val;

                        // If user specifically asked for status column, we use the CURRENT (after) status
                        if (col.key === 'status') {
                          displayVal = <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium border">{n.status_after || val}</span>;
                        } else if (col.isDate) {
                          displayVal = formatDisplayDate(val);
                        }

                        return (
                          <td key={col.key} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap border-r border-gray-100 last:border-r-0">
                            {displayVal}
                          </td>
                        );
                      })}
                    </tr>
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
