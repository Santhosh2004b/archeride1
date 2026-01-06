// ---------------- MODIFIED MonitoringRisksPage.jsx (as requested) ----------------

import React, { useEffect, useState } from "react";
import { formatDisplayDate } from "../utils/dateFormat";
import { motion } from "framer-motion";
import { fetchRisks } from "../api/risksApi";
import { filterConfig } from "../config/filterConfig";
import useMonitoringExport from "../hooks/useMonitoringExport";

import { useNavigate } from "react-router-dom";
import { FiSearch, FiFilter, FiX, FiPlus, FiRotateCcw } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

/* ===================================================
   STATUS → UI META (unchanged)
====================================================== */
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

const MonitoringRisksPage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  useMonitoringExport("risks", rows);

  const [loading, setLoading] = useState(false);
  const [allRows, setAllRows] = useState([]); // Store unfiltered data

  // only fields you requested
  const [filters, setFilters] = useState({
    project_name: "",
    status: "",
    priority: "",
    category: "",
    probability: "",
    impact: "",
  });

  // second row global search
  const [globalSearch, setGlobalSearch] = useState("");

  /* ======================================================
     LOAD DATA (initial load only)
  ====================================================== */
  const loadData = async () => {
    try {
      setLoading(true);

      const res = await fetchRisks(filters);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      setAllRows(list);
      applyFiltersAndSearch(list);
    } catch (err) {
      console.error("Failed to load risks", err);
      alert("Failed to load risks");
      setAllRows([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     APPLY FILTERS + LIVE SEARCH (matches to top)
  ====================================================== */
  const applyFiltersAndSearch = (data) => {
    let filtered = [...data];

    // 1. Apply Select Filters
    const activeFilters = { ...filters };
    const pName = activeFilters.project_name?.trim().toLowerCase();
    delete activeFilters.project_name;

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row) =>
          String(row[key] ?? "").toLowerCase() === String(value).toLowerCase()
        );
      }
    });

    // 2. Apply Project Name Filter
    if (pName) {
      filtered = filtered.filter((row) =>
        String(row.project_name ?? "").toLowerCase().includes(pName)
      );
    }

    // 3. Apply Global Search
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

  useEffect(() => {
    loadData();
  }, []);

  // Re-filter when filters or global search change (live)
  useEffect(() => {
    if (allRows.length > 0) {
      applyFiltersAndSearch(allRows);
    }
  }, [filters, globalSearch]);

  /* ======================================================
     FILTER ACTIONS
  ====================================================== */
  const handleApply = () => loadData();

  const handleClear = () => {
    const cleared = {
      project_name: "",
      status: "",
      priority: "",
      category: "",
      probability: "",
      impact: "",
    };
    setFilters(cleared);
    setGlobalSearch("");
  };

  const handleGlobalClear = () => {
    setGlobalSearch("");
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };



  /* ======================================================
     TABLE COLUMNS
  ====================================================== */
  const columns = rows[0]
    ? ["project_name", "status", ...Object.keys(rows[0]).filter((c) => !["project_name", "status"].includes(c))]
    : [];

  const cfg = filterConfig.risks.fields;

  return (
    <motion.div
      className="min-h-[calc(100vh-80px)] flex flex-col gap-3 bg-brandBg p-3 sm:p-5"
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
          <h1 className="font-marcellus font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight mb-1">Risk</h1>
          <p className="text-xs sm:text-sm text-gray-500 italic">Table — Latest Updates</p>
        </div>

      </motion.div>

      {/* ======================================================
          ROW 1 — filters + icon buttons
      ====================================================== */}
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
              onChange={handleFilterChange}
              className="w-full rounded-lg border px-3 py-2 text-xs sm:text-sm pr-8 font-urbanist"
            />
            <FiFilter className="absolute right-3 top-2.5 text-gray-500" />
          </div>

          {/* other filters */}
          {cfg.filter((f) => f.name !== "project_name").map((f) => (
            f.type === "select" && (
              <select
                key={f.name}
                name={f.name}
                value={filters[f.name]}
                onChange={handleFilterChange}
                className="w-full rounded-lg border px-3 py-2 text-xs sm:text-sm"
              >
                <option value="">{f.label} (All)</option>
                {f.options?.map((opt) => (
                  opt && <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )
          ))}
        </div>

        {/* apply + clear */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleApply}
            title="Apply filters"
            className="rounded-full bg-brandDark text-white p-2 hover:bg-black transition flex items-center justify-center shadow-sm"
          >
            <FiFilter size={18} />
          </button>
          <button
            onClick={handleClear}
            title="Clear all filters"
            className="rounded-full border border-gray-300 p-2 hover:bg-gray-100 transition flex items-center justify-center shadow-sm"
          >
            <FiRotateCcw size={18} />
          </button>
        </div>
      </motion.div>

      {/* ======================================================
          ROW 2 — global search
      ====================================================== */}
      <motion.div
        className="bg-white border border-gray-200 rounded-xl shadow-sm px-3 py-2 flex items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 w-28">Global Search</label>
        <div className="relative flex-1">
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search across all fields"
            className="w-full rounded-lg border px-3 py-2 text-xs sm:text-sm pr-16 font-urbanist"
          />
          <FiSearch className="absolute right-10 top-2.5 text-gray-500" />
          {globalSearch && (
            <RxCross2
              onClick={handleGlobalClear}
              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer hover:text-black"
            />
          )}
        </div>
      </motion.div>

      {/* ======================================================
          TABLE
      ====================================================== */}
      <motion.div
        className="flex-1 rounded-xl bg-white border border-gray-200 shadow-sm overflow-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >

        {loading ? (
          <div className="p-6 text-sm text-brandMuted">Loading...</div>
        ) : (
          <table className="monitoring-table min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2.5 text-xs font-semibold text-brandMuted uppercase w-12">S.No</th>
                {columns.map((c) => (
                  <th key={c} className="px-4 py-2.5 text-xs font-semibold text-brandMuted uppercase">{c}</th>
                ))}

              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const meta = getStatusMeta(row);
                return (
                  <tr key={row.id} className={`${meta?.rowClass || ""} border-b`}>
                    <td className="px-4 py-2 whitespace-nowrap font-semibold text-brandMuted w-12">{idx + 1}</td>
                    {columns.map((c) => (
                      <td key={c} className="px-4 py-2 whitespace-nowrap">
                        {c.toLowerCase() === "status" && meta ? (
                          <span className="inline-flex items-center gap-2">
                            <span className={`status-dot ${meta.dotClass}`} />
                            {meta.label}
                          </span>
                        ) : c.toLowerCase().includes("date") || c.toLowerCase().includes("_at") ? (
                          formatDisplayDate(row[c], true)
                        ) : (
                          String(row[c] ?? "")
                        )}
                      </td>
                    ))}

                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-4 text-center text-sm text-brandMuted">
                    No risks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MonitoringRisksPage;
