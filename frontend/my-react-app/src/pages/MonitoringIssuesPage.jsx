// ---------------- MONITORING ISSUES PAGE (UPDATED FOR MASTER FILTERS) ----------------

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MonitoringFilters from "../components/MonitoringFilters";
import { fetchIssues } from "../api/issuesApi";
import { filterConfig } from "../config/filterConfig";
import { useNavigate } from "react-router-dom";
import { FiFilter, FiRotateCcw, FiSearch, FiPlus } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

/* OPTION ARRAYS */
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

/* STATUS → UI META */
const getStatusMeta = (row) => {
  const raw = row.status || row.Status || row.current_status;
  if (!raw) return null;
  const s = String(raw).toLowerCase();
  const map = {
    open: { rowClass: "status-open", dotClass: "dot-open", label: "Open" },
    "in progress": { rowClass: "status-inprogress", dotClass: "dot-inprogress", label: "In Progress" },
    "on hold": { rowClass: "status-onhold", dotClass: "dot-onhold", label: "On Hold" },
    resolved: { rowClass: "status-resolved", dotClass: "dot-resolved", label: "Resolved" },
    "approved & closed": { rowClass: "status-approved", dotClass: "dot-approved", label: "Approved & Closed" },
    cancelled: { rowClass: "status-cancelled", dotClass: "dot-cancelled", label: "Cancelled" },
  };
  return map[s] || null;
};

const MonitoringIssuesPage = () => {
  const navigate = useNavigate();
  // Re-applies filters and search to the current data when global search Apply is clicked
  const handleGlobalApply = () => {
    applyFiltersAndSearch(allRows);
  };
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allRows, setAllRows] = useState([]); // Store unfiltered data

  const initialFilters = Object.fromEntries((filterConfig.issues.fields || []).map(f => [f.name, ""]));
  const [filters, setFilters] = useState(initialFilters);
  const [globalSearch, setGlobalSearch] = useState("");

  /* input handler */
  const handleChange = (e) => {
    const { name, value } = e.target || {};
    if (!name) return;

    if (name === "globalSearch" || name === "search") {
      setGlobalSearch(value);
      return;
    }
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  /* clear global search */
  const clearGlobalSearch = () => {
    setGlobalSearch("");
  };

  /* ======================================================
     APPLY FILTERS + LIVE SEARCH (matches to top)
  ====================================================== */
  const applyFiltersAndSearch = (data) => {
    let filtered = [...data];

    // 1. Apply all filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim()) {
        const q = value.toLowerCase();
        if (key === "project_name") {
          filtered = filtered.filter((row) =>
            String(row.project_name ?? "").toLowerCase().includes(q)
          );
        } else {
          filtered = filtered.filter((row) =>
            String(row[key] ?? "").toLowerCase() === q
          );
        }
      }
    });

    // 2. Apply global search
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((v) =>
          v !== null && v !== undefined && String(v).toLowerCase().includes(q)
        )
      );
    }

    setRows(filtered);
  };

  /* load API (initial load only) */
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchIssues(filters);
      const data = (res && res.data) ? res.data : res;
      const fullData = Array.isArray(data) ? data : [];
      setAllRows(fullData);
      applyFiltersAndSearch(fullData);
    } catch (err) {
      console.error("Failed to load issues", err);
      alert("Failed to load issues");
      setAllRows([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  // Re-filter when filters or global search change (live)
  useEffect(() => {
    if (allRows.length > 0) {
      applyFiltersAndSearch(allRows);
    }
  }, [filters, globalSearch]);

  const handleApply = () => {
    loadData();
  };



  const handleClearAll = () => {
    const reset = Object.fromEntries((filterConfig.issues.fields || []).map(f => [f.name, ""]));
    setFilters(reset);
    setGlobalSearch("");
  };

  /* TABLE COLS */
  const columns = rows[0]
    ? ["status", ...Object.keys(rows[0]).filter(c => c !== "status")]
    : [];

  return (
    <motion.div
      className="min-h-[calc(100vh-80px)] flex flex-col gap-4 bg-gray-50 p-4 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >

      {/* Animated Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <h1 className="font-marcellus font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight mb-1">Issue</h1>
          <p className="text-xs sm:text-sm text-gray-500 italic">Table — Latest Updates</p>
        </div>

      </motion.div>

      {/* =============================
           ROW 1 — filter controls
      ============================== */}
      <motion.div
        className="w-full rounded-xl bg-white border border-gray-200 shadow-sm px-4 py-4 flex flex-col lg:flex-row gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 flex-1">
          <div className="relative">
            <input
              type="text"
              name="project_name"
              placeholder="Project Name"
              value={filters.project_name}
              onChange={handleChange}
              className="rounded-lg border w-full px-3 py-2 text-xs sm:text-sm pr-9"
            />
            <FiFilter className="absolute right-3 top-2.5 text-gray-500" />
          </div>

          <select name="status" value={filters.status} onChange={handleChange}
            className="rounded-lg border px-3 py-2 text-xs sm:text-sm">
            <option value="">Status (All)</option>
            {statusOptions.map(s => <option key={s}>{s}</option>)}
          </select>

          <select name="priority" value={filters.priority} onChange={handleChange}
            className="rounded-lg border px-3 py-2 text-xs sm:text-sm">
            <option value="">Priority (All)</option>
            {priorityOptions.map(p => <option key={p}>{p}</option>)}
          </select>

          <select name="category" value={filters.category} onChange={handleChange}
            className="rounded-lg border px-3 py-2 text-xs sm:text-sm">
            <option value="">Category (All)</option>
            {categoryOptions.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={handleApply}
            className="rounded-full bg-brandDark text-white px-4 py-2 text-xs sm:text-sm">
            Apply
          </button>
          <button onClick={handleClearAll}
            className="rounded-full border px-4 py-2 text-xs sm:text-sm">
            Clear All
          </button>
        </div>
      </motion.div>

      {/* =============================
           ROW 2 — Global search
      ============================== */}
      <motion.div
        className="w-full rounded-xl bg-white border border-gray-200 shadow-sm px-4 py-3 flex flex-row gap-3 items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >

        <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 w-28">Global Search</label>

        <div className="relative flex-1">
          <input
            type="text"
            name="search"
            placeholder="Search all fields"
            value={globalSearch}
            onChange={handleChange}
            className="rounded-lg border w-full px-3 py-2 text-xs sm:text-sm pr-16"
          />
          <FiSearch className="absolute right-10 top-2.5 text-gray-500" />
          {globalSearch && (
            <RxCross2
              onClick={clearGlobalSearch}
              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
            />
          )}
        </div>

        <button
          onClick={handleGlobalApply}
          className="rounded-full bg-brandDark text-white px-4 py-2 text-xs sm:text-sm">
          Apply
        </button>
      </motion.div>

      {/* =========================
          TABLE
      ========================== */}
      <motion.div
        className="flex-1 rounded-xl bg-white border shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        {loading ? (
          <div className="p-6 text-sm">Loading...</div>
        ) : (
          <div className="overflow-auto">
            <table className="monitoring-table min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase w-12">S.No</th>
                  {columns.map(c => (
                    <th key={c} className="px-4 py-2.5 text-xs font-semibold uppercase">{c}</th>
                  ))}

                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const m = getStatusMeta(row);
                  return (
                    <tr key={row.id} className={`${m?.rowClass || ""} border-b`}>
                      <td className="px-4 py-2 whitespace-nowrap font-semibold w-12">{idx + 1}</td>
                      {columns.map(c => (
                        <td key={c} className="px-4 py-2 whitespace-nowrap">
                          {c.toLowerCase() === "status" && m
                            ? <span className="inline-flex items-center gap-2">
                              <span className={`status-dot ${m.dotClass}`} />{m.label}
                            </span>
                            : String(row[c] ?? "")}
                        </td>
                      ))}

                    </tr>
                  );
                })}

                {rows.length === 0 && (
                  <tr><td colSpan={columns.length + 1} className="py-4 text-center">No issues found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MonitoringIssuesPage;
