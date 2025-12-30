// src/pages/BmNotificationsPage.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchBmNotifications } from "../api/notificationsApi";
import { formatDisplayDate } from "../utils/dateFormat";

const MODULES = [
  { key: "risk", label: "Risk" },
  { key: "issue", label: "Issue" },
  { key: "dependency", label: "Dependency" },
  { key: "escalation", label: "Escalation" },
  { key: "action", label: "Action" },   // ← add this
];


const BmNotificationsPage = () => {
  const [selectedModule, setSelectedModule] = useState("risk");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState(null); // which row is expanded

  const load = async (module = selectedModule) => {
    try {
      setLoading(true);
      const data = await fetchBmNotifications(module);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOpenId(null);
    load(selectedModule);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule]);

  const formatDateTime = (iso) => formatDisplayDate(iso);

  const renderHeader = () => {
    return (
      <>
        <th className="px-2 py-2 font-extrabold text-xs uppercase tracking-wide text-gray-800 whitespace-nowrap">Project Name</th>
        <th className="px-2 py-2 font-extrabold text-xs uppercase tracking-wide text-gray-800 whitespace-nowrap">ID</th>
        <th className="px-2 py-2 font-extrabold text-xs uppercase tracking-wide text-gray-800 whitespace-nowrap">Priority</th>
        <th className="px-2 py-2 font-extrabold text-xs uppercase tracking-wide text-gray-800 whitespace-nowrap">Status Before</th>
        <th className="px-2 py-2 font-extrabold text-xs uppercase tracking-wide text-gray-800 whitespace-nowrap">Status After</th>
        <th className="px-2 py-2 font-extrabold text-xs uppercase tracking-wide text-gray-800 whitespace-nowrap">Recent Update Time</th>
        <th className="px-2 py-2 font-extrabold text-xs uppercase tracking-wide text-gray-800 whitespace-nowrap text-right">Action</th>
      </>
    );
  };

const renderRow = (n, idx) => {
    // Determine module id field
    const idField =
      selectedModule === "risk"
        ? n.risk_id
        : selectedModule === "issue"
          ? n.issue_id
          : selectedModule === "dependency"
            ? n.dependency_id
          : selectedModule === "escalation"
            ? n.escalation_id
          : selectedModule === "action"
            ? n.action_id
          : n.id;

    const isOpen = openId === n.id;
    // Highlight approved & closed for BM
    const highlightApproved = (n.status_after || "").toLowerCase().includes("approved");
    // Badge color for status
    const statusBadge = (status) => {
      const s = (status || "").toLowerCase();
      if (s.includes("approved")) return "bg-green-100 text-green-700 border-green-300";
      if (s.includes("resolved")) return "bg-blue-100 text-blue-700 border-blue-300";
      if (s.includes("inholding")) return "bg-yellow-100 text-yellow-700 border-yellow-300";
      if (s.includes("open")) return "bg-gray-100 text-gray-700 border-gray-300";
      if (s.includes("cancelled")) return "bg-gray-200 text-gray-500 border-gray-300";
      return "bg-gray-100 text-gray-700 border-gray-300";
    };

    return (
      <React.Fragment key={n.id}>
        <tr className={`border-b border-gray-100 ${highlightApproved ? "bg-green-50 font-bold" : ""}`}>
          <td className="px-2 py-2 whitespace-nowrap text-xs font-semibold">{n.project_name || n.payload?.project_name || "-"}</td>
          <td className="px-2 py-2 whitespace-nowrap text-xs">{idField}</td>
          <td className="px-2 py-2 whitespace-nowrap text-xs font-semibold">{n.priority || "-"}</td>
          <td className="px-2 py-2 whitespace-nowrap text-xs">
            <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${statusBadge(n.status_before)}`}>{n.status_before || "-"}</span>
          </td>
          <td className="px-2 py-2 whitespace-nowrap text-xs">
            <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${statusBadge(n.status_after)}`}>{n.status_after || "-"}</span>
          </td>
          <td className="px-2 py-2 whitespace-nowrap text-xs">{formatDateTime(n.created_at)}</td>
          <td className="px-2 py-2 whitespace-nowrap text-xs text-right">
            <button
              type="button"
              onClick={() => setOpenId((prev) => (prev === n.id ? null : n.id))}
              className="inline-flex items-center rounded-full border border-brand text-brand px-3 py-1 text-xs hover:bg-brand hover:text-white transition"
            >
              {isOpen ? "Hide" : "View"}
            </button>
          </td>
        </tr>

        {isOpen && (
          <tr className="bg-gray-50 border-b border-gray-100">
            <td colSpan={7} className="px-4 py-3">
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <table className="min-w-full text-xs">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-2 font-semibold">ID</td>
                      <td className="px-3 py-2">{idField}</td>
                      <td className="px-3 py-2 font-semibold">Status</td>
                      <td className="px-3 py-2">{n.status_after || "-"}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-2 font-semibold">Engagement</td>
                      <td className="px-3 py-2" colSpan={3}>
                        {n.decision || "Pending"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-semibold">Created_At</td>
                      <td className="px-3 py-2" colSpan={3}>
                        {formatDateTime(n.created_at)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  const title =
    MODULES.find((m) => m.key === selectedModule)?.label || "Risk";

  return (
    <motion.div 
      className="min-h-[calc(100vh-80px)] bg-brandBg px-3 sm:px-5 py-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h2 className="font-marcellus font-bold text-3xl sm:text-4xl text-brandDark tracking-tight mb-3">
        My {title} Notifications
      </h2>

      <div className="mb-4 flex flex-wrap gap-2">
        {MODULES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setSelectedModule(m.key)}
            className={`px-3 py-1 rounded-full text-xs sm:text-sm border ${selectedModule === m.key
                ? "bg-brand text-white border-brand"
                : "bg-white text-gray-700 border-gray-200"
              }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 text-xs text-brandMuted">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-xs text-brandMuted">No notifications yet.</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-left text-xs font-urbanist">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{renderHeader()}</tr>
              </thead>
              <tbody>{[...items].sort((a, b) => {
                // Resolved first, then by created_at desc
                const aResolved = (a.status_after || "").toLowerCase().includes("resolved");
                const bResolved = (b.status_after || "").toLowerCase().includes("resolved");
                if (aResolved && !bResolved) return -1;
                if (!aResolved && bResolved) return 1;
                return new Date(b.created_at) - new Date(a.created_at);
              }).map(renderRow)}</tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BmNotificationsPage;
