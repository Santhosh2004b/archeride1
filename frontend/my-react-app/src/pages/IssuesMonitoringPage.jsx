// ---------------- ISSUES MONITORING PAGE (UX CLONE ONLY, NO FUNCTIONALITY) ----------------

import React, { useState } from "react";
import { formatDisplayDate } from "../utils/dateFormat";
import { motion } from "framer-motion";
import { FiFilter, FiRotateCcw, FiSearch } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

const statusOptions = [
  "Open",
  "In Progress",
  "On Hold",
  "Resolved",
  "Approved & Closed",
  "Cancelled",
];

const priorityOptions = ["Low", "Medium", "High", "Critical"];

const categoryOptions = [
  "Technical",
  "Operational",
  "Resource",
  "Infrastructure",
  "Application",
  "Network",
  "Security",
  "Performance",
];


const IssuesMonitoringPage = () => {
  const [filters, setFilters] = useState({
    project_name: "",
    status: "",
    priority: "",
    category: "",
    // Add more if needed for UX
    probability: "",
    impact: "",
  });
  const [globalSearch, setGlobalSearch] = useState("");

  // Dummy table data
  const rows = [];
  const columns = [
    "project_name",
    "status",
    "id",
    "issue_id",
    "reported_date",
    "reported_by",
    "priority",
    "category",
    "probability",
    "impact",
  ];
  // Task 5: Edit/view workflow
  const [showToast, setShowToast] = useState(false);
  const [mode, setMode] = useState("view");
  const [editId, setEditId] = useState(null);
  // Simulate URL param parsing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    const idParam = params.get("id");
    setMode(modeParam || "view");
    setEditId(idParam);
  }, []);

  return (
    <motion.div className="min-h-[calc(100vh-80px)] flex flex-col gap-3 bg-brandBg p-3 sm:p-5 relative">
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-2 rounded-full shadow-lg animate-fade-in">
          Saved Successfully
        </div>
      )}
      {/* Animated Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <h1 className="font-marcellus font-bold text-3xl sm:text-4xl text-brandDark tracking-tight mb-1">Issues</h1>
          <p className="font-urbanist text-xs sm:text-sm text-brandMuted">Table — Latest Updates</p>
        </div>
      </motion.div>

      {/* Filter controls row */}
      <motion.div 
        className="w-full rounded-xl bg-white border border-gray-200 shadow-sm px-3 py-3 flex flex-col lg:flex-row gap-2 lg:items-end"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 flex-1">
          {/* project_name with filter icon */}
          <div className="relative">
            <input
              type="text"
              name="project_name"
              placeholder="Project Name"
              value={filters.project_name}
              onChange={e => setFilters({ ...filters, project_name: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-xs sm:text-sm pr-8 font-urbanist"
            />
            <FiFilter className="absolute right-3 top-2.5 text-gray-500" />
          </div>
          {/* other filters */}
          <select name="status" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-xs sm:text-sm font-urbanist">
            <option value="">Status (All)</option>
            {statusOptions.map(s => <option key={s}>{s}</option>)}
          </select>
          <select name="priority" value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-xs sm:text-sm font-urbanist">
            <option value="">Priority (All)</option>
            {priorityOptions.map(p => <option key={p}>{p}</option>)}
          </select>
          <select name="category" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-xs sm:text-sm font-urbanist">
            <option value="">Category (All)</option>
            {categoryOptions.map(c => <option key={c}>{c}</option>)}
          </select>
          <select name="probability" value={filters.probability} onChange={e => setFilters({ ...filters, probability: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-xs sm:text-sm font-urbanist">
            <option value="">Probability (All)</option>
            {/* Dummy options */}
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select name="impact" value={filters.impact} onChange={e => setFilters({ ...filters, impact: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-xs sm:text-sm font-urbanist">
            <option value="">Impact (All)</option>
            {/* Dummy options */}
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        {/* apply + clear */}
        <div className="flex gap-2 justify-end">
          <button 
            title="Apply filters"
            className="rounded-full bg-brandDark text-white p-2 hover:bg-black transition flex items-center justify-center shadow-sm"
          >
            <FiFilter size={18} />
          </button>
          <button 
            title="Clear all filters"
            className="rounded-full border border-gray-300 p-2 hover:bg-gray-100 transition flex items-center justify-center shadow-sm"
            onClick={() => setFilters({ project_name: "", status: "", priority: "", category: "", probability: "", impact: "" })}
          >
            <FiRotateCcw size={18} />
          </button>
        </div>
      </motion.div>

      {/* Global search row */}
      <motion.div 
        className="bg-white border border-gray-200 rounded-xl shadow-sm px-3 py-2 flex items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <label className="text-xs sm:text-sm font-semibold w-28 font-urbanist">Global Search</label>
        <div className="relative flex-1">
          <input
            type="text"
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            placeholder="Search across all fields"
            className="w-full rounded-lg border px-3 py-2 text-xs sm:text-sm pr-16 font-urbanist"
          />
          <FiSearch className="absolute right-10 top-2.5 text-gray-500" />
          {globalSearch && (
            <RxCross2
              onClick={() => setGlobalSearch("")}
              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer hover:text-black"
            />
          )}
        </div>
      </motion.div>

      {/* Table row */}
      {mode === "view" && (
        <motion.div 
          className="flex-1 rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="overflow-auto">
            <div className="mb-2 text-xs text-brandMuted font-urbanist">To update this record, click Edit</div>
            <table className="min-w-full text-left text-xs sm:text-sm font-urbanist">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-semibold text-brandMuted uppercase tracking-wide whitespace-nowrap">Edit</th>
                  <th className="px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-semibold text-brandMuted uppercase tracking-wide whitespace-nowrap w-12">S.No</th>
                  {columns.map((c) => (
                    <th key={c} className="px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-semibold text-brandMuted uppercase tracking-wide whitespace-nowrap">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Example row for date formatting demonstration */}
                {/* {rows.map((row, idx) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                    <td className="px-3 sm:px-4 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = `${window.location.pathname}?mode=edit&id=${row.id}`;
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-brandDark/20 px-3 py-1 text-[11px] font-urbanist text-brandDark hover:bg-brandDark hover:text-white transition"
                      >
                        Edit
                      </button>
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-[11px] sm:text-sm whitespace-nowrap">{idx + 1}</td>
                    {columns.map((c) => (
                      <td key={c} className="px-3 sm:px-4 py-2 text-[11px] sm:text-sm whitespace-nowrap">
                        {c.toLowerCase().includes("date") || c.toLowerCase().includes("_at")
                          ? formatDisplayDate(row[c])
                          : String(row[c] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))} */}
                <tr>
                  <td colSpan={columns.length + 2} className="px-3 sm:px-4 py-4 text-center text-xs sm:text-sm text-brandMuted">
                    No issues found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
      {mode === "edit" && editId && (
        <div className="mt-4 rounded-xl bg-white border border-gray-200 shadow-sm p-5">
          <h3 className="font-urbanist font-semibold text-lg mb-4 text-brandDark">Edit Issue</h3>
          {/* ...form fields here... */}
          <button
            className="mt-4 bg-brandDark text-white px-6 py-2 rounded-full font-urbanist font-semibold hover:bg-black transition"
            onClick={() => {
              setShowToast(true);
              setTimeout(() => setShowToast(false), 2000);
              window.location.href = `${window.location.pathname}?mode=view`;
            }}
          >
            Save
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default IssuesMonitoringPage;
