// ---------------- MONITORING ESCALATIONS PAGE (MASTER FILTER PATTERN) ----------------

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchEscalations } from "../api/escalationsApi";
import { formatDisplayDate } from "../utils/dateFormat";
import { filterConfig } from "../config/filterConfig";
import useMonitoringExport from "../hooks/useMonitoringExport";

import { useNavigate } from "react-router-dom";
import { FiFilter, FiSearch, FiPlus } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import LayoutBuilder from "../components/LayoutBuilder";
import { getLayoutApi, saveLayoutApi } from "../api/layoutApi";
import { escalationsFormConfig } from "../config/formConfig";
import { Pen } from "phosphor-react";

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

/* CLEAN PARAMS */
const cleanParams = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== "" && v !== null && v !== undefined));

/* MAIN */
const MonitoringEscalationsPage = () => {
  // Layout Builder state
  const [showLayoutBuilder, setShowLayoutBuilder] = useState(false);
  const [layoutFields, setLayoutFields] = useState(escalationsFormConfig?.fields || []);

  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allRows, setAllRows] = useState([]); // Store unfiltered data
  useMonitoringExport("escalations", rows);

  // aligned filter set
  const [filters, setFilters] = useState({
    account: "",
    status: "",
    priority: "",
    category: "",
    search: "",
  });

  // second row global search
  const [globalSearch, setGlobalSearch] = useState("");

  const escCfg = filterConfig.escalations.fields;
  const statusOptions = escCfg.find((f) => f.name === "status").options;
  const priorityOptions = escCfg.find((f) => f.name === "priority").options;
  const categoryOptions = escCfg.find((f) => f.name === "category").options;

  /* ======================================================
     APPLY FILTERS + LIVE SEARCH (matches to top)
  ====================================================== */
  const applyFiltersAndSearch = (data) => {
    let filtered = [...data];

    // 1. Apply select filters
    const selectFilters = { ...filters };
    const pName = selectFilters.account?.trim().toLowerCase();
    delete selectFilters.account;
    delete selectFilters.search;

    Object.entries(selectFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row) =>
          String(row[key] ?? "").toLowerCase() === String(value).toLowerCase()
        );
      }
    });

    // 2. Account Filter
    if (pName) {
      filtered = filtered.filter((row) =>
        String(row.account ?? "").toLowerCase().includes(pName)
      );
    }

    // 3. Global Search
    if (globalSearch.trim()) {
      const term = globalSearch.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((v) =>
          v !== null && v !== undefined && String(v).toLowerCase().includes(term)
        )
      );
    }

    // Sort by latest updated
    filtered.sort((a, b) => new Date(b.last_updated || b.updated_at || b.created_at || 0) - new Date(a.last_updated || a.updated_at || a.created_at || 0));

    setRows(filtered);
  };

  /* LOAD */
  const loadData = async () => {
    try {
      setLoading(true);
      const q = cleanParams(filters);
      q.search = ""; // Don't send search to backend

      let res = await fetchEscalations(q);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      setAllRows(list);
      applyFiltersAndSearch(list);
    } catch (err) {
      console.error("Failed to load escalations", err);
      alert("Failed to load escalations");
      setAllRows([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };


  // Load layout configuration
  const loadLayout = async () => {
    try {
      const serverLayout = await getLayoutApi("escalations");
      if (serverLayout && Array.isArray(serverLayout)) {
        setLayoutFields(serverLayout);
      } else {
        setLayoutFields(escalationsFormConfig?.fields || []);
      }
    } catch (err) {
      console.warn("No custom layout found, using default");
      setLayoutFields(escalationsFormConfig?.fields || []);
    }
  };

  useEffect(() => {
    loadData();
    loadLayout();
  }, []);

  // Re-filter when filters or search change (live)
  useEffect(() => {
    if (allRows.length > 0) {
      applyFiltersAndSearch(allRows);
    }
  }, [filters, globalSearch]);

  /* FILTER CHANGE */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => loadData();

  const handleClear = () => {
    const cleared = {
      account: "",
      status: "",
      priority: "",
      category: "",
      search: "",
    };
    setFilters(cleared);
    loadData(cleared);
  };

  const clearGlobalSearch = () => {
    setGlobalSearch("");
  };



  /* COLUMNS */
  const columns = rows[0]
    ? ["status", ...Object.keys(rows[0]).filter(c =>
      c !== "status" && c !== "id" && c !== "project_id"
    )]
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
          <h1 className="font-marcellus font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight mb-1">Escalation</h1>
          <p className="text-xs sm:text-sm text-gray-500 italic">Table — Latest Updates</p>

        </div>

        {/* Customize Form Button */}
        <button
          onClick={() => setShowLayoutBuilder(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md transition-all active:scale-95"
          title="Customize Form Layout"
        >
          <Pen size={18} weight="bold" />
          Customize Form
        </button>

      </motion.div>

      {/* ROW 1 — filters */}
      <motion.div
        className="w-full rounded-xl bg-white border shadow-sm px-4 py-4 flex flex-col lg:flex-row gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 flex-1">

          {/* Account */}
          <div className="relative">
            <input
              type="text"
              name="account"
              placeholder="Account"
              value={filters.account}
              onChange={handleChange}
              className="rounded-lg border w-full px-3 py-2 text-xs sm:text-sm pr-9"
            />
            <FiFilter className="absolute right-3 top-2.5 text-gray-500" />
          </div>

          <select name="status" value={filters.status} onChange={handleChange}
            className="rounded-lg border px-3 py-2 text-xs sm:text-sm">
            <option value="">Status (All)</option>
            {statusOptions.map((s) => <option key={s}>{s}</option>)}
          </select>

          <select name="priority" value={filters.priority} onChange={handleChange}
            className="rounded-lg border px-3 py-2 text-xs sm:text-sm">
            <option value="">Priority (All)</option>
            {priorityOptions.map((p) => <option key={p}>{p}</option>)}
          </select>

          <select name="category" value={filters.category} onChange={handleChange}
            className="rounded-lg border px-3 py-2 text-xs sm:text-sm">
            <option value="">Category (All)</option>
            {categoryOptions.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={handleApply}
            className="rounded-full bg-brandDark text-white px-4 py-2 text-xs sm:text-sm">
            Apply
          </button>
          <button onClick={handleClear}
            className="rounded-full border px-4 py-2 text-xs sm:text-sm">
            Clear
          </button>
        </div>
      </motion.div>

      {/* ROW 2 — global search */}
      <motion.div
        className="w-full rounded-xl bg-white border shadow-sm px-4 py-3 flex items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 w-28">Global Search</label>

        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search all fields"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
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
      </motion.div>

      {/* TABLE */}
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
                  {columns.map((c) => (
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
                      {columns.map((c) => (
                        <td key={c} className="px-4 py-2 whitespace-nowrap">
                          {c.toLowerCase() === "status" && m
                            ? <span className="inline-flex items-center gap-2">
                              <span className={`status-dot ${m.dotClass}`} />{m.label}
                            </span>
                            : c.toLowerCase().includes("date") || c.toLowerCase().includes("_at")
                              ? formatDisplayDate(row[c], true)
                              : String(row[c] ?? "")}
                        </td>
                      ))}

                    </tr>
                  );
                })}


                {rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center py-4">
                      No escalations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>


      {/* Layout Builder Modal */}
      {showLayoutBuilder && (
        <LayoutBuilder
          fields={layoutFields}
          onClose={() => setShowLayoutBuilder(false)}
          onSave={async (newLayout) => {
            await saveLayoutApi("escalations", newLayout);
            setLayoutFields(newLayout);
            setShowLayoutBuilder(false);
          }}
        />
      )}
    </motion.div>
  );
};

export default MonitoringEscalationsPage;
