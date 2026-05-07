import { useFilter } from '../context/FilterContext';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchEscalations } from "../api/escalationsApi";
import { formatDisplayDate } from "../utils/dateFormat";
import { filterConfig } from "../config/filterConfig";
import useMonitoringExport from "../hooks/useMonitoringExport";


import { FiFilter, FiSearch } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import LayoutBuilder from "../components/LayoutBuilder";
import { getLayoutApi, saveLayoutApi } from "../api/layoutApi";
import { escalationsFormConfig } from "../config/formConfig";
import { Pen, DownloadSimple } from "phosphor-react";
import TruncatedCell from "../components/TruncatedCell";
import { exportToExcel } from "../utils/exportToExcel";


const getStatusMeta = (row) => {
  const raw = row.status || row.Status || row.current_status;
  if (!raw) return null;

  const s = String(raw).toLowerCase();
  const map = {
    open: { rowClass: "status-resolved", dotClass: "dot-resolved", label: "Resolved" }, // Open -> Resolved
    "in progress": { rowClass: "status-inprogress", dotClass: "dot-inprogress", label: "In Progress" },
    "on hold": { rowClass: "status-onhold", dotClass: "dot-onhold", label: "On Hold" },
    resolved: { rowClass: "status-resolved", dotClass: "dot-resolved", label: "Resolved" },
    "approved & closed": { rowClass: "status-approved", dotClass: "dot-approved", label: "Approved & Closed" },
    cancelled: { rowClass: "status-cancelled", dotClass: "dot-cancelled", label: "Cancelled" },
  };
  return map[s] || null;
};


const cleanParams = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== "" && v !== null && v !== undefined));


const MonitoringEscalationsPage = () => {

  const [showLayoutBuilder, setShowLayoutBuilder] = useState(false);
  const [layoutFields, setLayoutFields] = useState(escalationsFormConfig?.fields || []);


  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allRows, setAllRows] = useState([]);
  const { selectedManager } = useFilter();
  const [showToast, setShowToast] = useState(false);
  useMonitoringExport("escalations", rows);


  const [filters, setFilters] = useState({
    account: "",
    status: "",
    priority: "",
    category: "",
    search: "",
  });


  const [globalSearch, setGlobalSearch] = useState("");

  const escCfg = filterConfig.escalations.fields;
  const statusOptions = escCfg.find((f) => f.name === "status").options;
  const priorityOptions = escCfg.find((f) => f.name === "priority").options;
  const categoryOptions = escCfg.find((f) => f.name === "category").options;


  const applyFiltersAndSearch = React.useCallback((data) => {
    let filtered = [...data];


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


    if (pName) {
      filtered = filtered.filter((row) =>
        String(row.account ?? "").toLowerCase().includes(pName)
      );
    }


    if (globalSearch.trim()) {
      const term = globalSearch.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((v) =>
          v !== null && v !== undefined && String(v).toLowerCase().includes(term)
        )
      );
    }


    filtered.sort((a, b) => new Date(b.last_updated || b.updated_at || b.created_at || 0) - new Date(a.last_updated || a.updated_at || a.created_at || 0));

    setRows(filtered);
  }, [filters, globalSearch]);


  const loadData = async () => {
    try {
      setLoading(true);
      const q = cleanParams(filters);
      q.search = "";

      const res = await fetchEscalations({ manager: selectedManager });
      const list = Array.isArray(res) ? res : (res?.data || []);
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



  const loadLayout = async () => {
    try {
      const serverLayout = await getLayoutApi("escalations");
      if (serverLayout && Array.isArray(serverLayout)) {
        const filtered = serverLayout.filter(f => f.name?.toLowerCase() !== "comments");
        setLayoutFields(filtered);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (allRows.length > 0) {
      applyFiltersAndSearch(allRows);
    }

  }, [filters, globalSearch, allRows, applyFiltersAndSearch]);


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



  const getSortedColumns = () => {
    if (!rows[0]) return [];


    const keys = Object.keys(rows[0]).filter(c =>
      c !== "status" && c !== "id" && c !== "project_id" && c !== "comments"
    );

    const preferred = ["escalation_id", "created_by", "reported_by", "manual_project_id", "title", "account"];
    const creatorKeys = ["created_by", "reported_by"];

    const sorted = keys.sort((a, b) => {

      const idxA = preferred.indexOf(a);
      const idxB = preferred.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;


      const isCreatorA = creatorKeys.includes(a);
      const isCreatorB = creatorKeys.includes(b);
      if (isCreatorA && !isCreatorB) return -1;
      if (!isCreatorA && isCreatorB) return 1;

      return 0;
    });

    return ["status", ...sorted];
  };

  const columns = getSortedColumns();

  const handleExport = () => {
    const exportData = window.__EXPORT_DATA__?.["escalations"];

    if (!exportData || !exportData.rows?.length) {
      alert(`No data available to export for escalations`);
      return;
    }

    exportToExcel(exportData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <motion.div
      className="min-h-[calc(100vh-80px)] flex flex-col gap-4 bg-gray-50 p-4 sm:p-6 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Export Toast */}
      {showToast && (
        <div className="absolute top-4 right-1/2 translate-x-1/2 z-50
                      rounded-md bg-green-600 px-3 py-1.5
                      text-xs text-white shadow-lg
                      animate-fade">
          ✅ Downloaded successfully
        </div>
      )}

      { }
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <h1 className="font-marcellus font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight mb-1">Escalations</h1>
          <p className="text-xs sm:text-sm text-gray-500 italic">Table — Latest Updates</p>

        </div>

        { }
        <div className="flex gap-2">
          {rows.length > 0 && (
            <button
              type="button"
              onClick={handleExport}
              className="rounded-full h-10 w-10 flex items-center justify-center border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors bg-white shadow-sm"
              title="Export to Excel"
            >
              <DownloadSimple size={20} weight="duotone" />
            </button>
          )}
          <button
            onClick={() => setShowLayoutBuilder(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md transition-all active:scale-95"
            title="Customize Form Layout"
          >
            <Pen size={18} weight="bold" />
            Customize Form
          </button>
        </div>

      </motion.div>

      { }
      <motion.div
        className="w-full rounded-xl bg-white border shadow-sm px-4 py-4 flex flex-col lg:flex-row gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 flex-1">

          { }
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

      { }
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

      { }
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
                        <td key={c} className="px-6 py-4 min-w-[180px] align-top text-gray-700 leading-relaxed">
                          {c.toLowerCase() === "status" && m
                            ? <span className="inline-flex items-center gap-2">
                              <span className={`status-dot ${m.dotClass}`} />{m.label}
                            </span>
                            : c === "documents" && Array.isArray(row[c]) && row[c].length > 0
                              ? <div className="flex flex-col gap-1">
                                {row[c].map((doc, idx) => (
                                  <a
                                    key={idx}
                                    href={`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/${doc.file_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium bg-blue-50 px-2 py-1 rounded border border-blue-100 w-fit"
                                    title={doc.file_name}
                                  >
                                    📄 {doc.file_name?.length > 15 ? doc.file_name.substring(0, 12) + "..." : doc.file_name}
                                  </a>
                                ))}
                              </div>
                              : c.toLowerCase().includes("date") || c.toLowerCase().includes("_at")
                                ? formatDisplayDate(row[c], true)
                                : <TruncatedCell content={typeof row[c] === 'object' && row[c] !== null ? JSON.stringify(row[c]) : String(row[c] ?? "")} />}
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


      { }
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




