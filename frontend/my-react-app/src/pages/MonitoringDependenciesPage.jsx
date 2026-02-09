
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchDependencies } from "../api/dependenciesApi";
import { formatDateOnly } from "../utils/dateFormat"; // Keep only what is used? wait formatDisplayDate is NOT used.
import { dependenciesFormConfig } from "../config/formConfig";


// ...

import { getLayoutApi, saveLayoutApi } from "../api/layoutApi";
import useMonitoringExport from "../hooks/useMonitoringExport";
import LayoutBuilder from "../components/LayoutBuilder";
import { RxCross2 } from "react-icons/rx";
import { FiFilter, FiSearch } from "react-icons/fi";
import { Pen, DownloadSimple } from "phosphor-react";
import TruncatedCell from "../components/TruncatedCell";
import { exportToExcel } from "../utils/exportToExcel";

const statusOptions = ["Open", "In Progress", "Resolved", "Cancelled", "Approved & Closed"];
const priorityOptions = ["Low", "Medium", "High", "Critical"];
const typeOptions = ["Technical", "Resource", "External", "Financial"];

const getStatusMeta = (row) => {
  const raw = row.status || row.Status || row.current_status;
  if (!raw) return null;
  const s = String(raw).toLowerCase().trim();
  if (s.includes("open")) return { label: "Open", dotClass: "bg-red-500", rowClass: "bg-red-50" };
  if (s.includes("progress")) return { label: "In Progress", dotClass: "bg-orange-500", rowClass: "bg-orange-50" };
  if (s.includes("resolved")) return { label: "Resolved", dotClass: "bg-blue-500", rowClass: "bg-blue-50" };
  if (s.includes("cancel")) return { label: "Cancelled", dotClass: "bg-gray-400", rowClass: "bg-gray-50" };
  if (s.includes("approved") || s.includes("closed")) return { label: "Approved & Closed", dotClass: "bg-green-500", rowClass: "bg-green-50" };
  return { label: raw, dotClass: "bg-gray-300", rowClass: "" };
};

const MonitoringDependenciesPage = () => {

  const [showLayoutBuilder, setShowLayoutBuilder] = useState(false);
  const [layoutFields, setLayoutFields] = useState(dependenciesFormConfig?.fields || []);

  const [filters, setFilters] = useState({
    account: "",
    status: "",
    priority: "",
    type: "",
    dependent_on: "",
    search: "",
  });
  const [globalSearch, setGlobalSearch] = useState("");
  const [allRows, setAllRows] = useState([]); // Store full data for client-side filtering
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [showToast, setShowToast] = useState(false);

  useMonitoringExport("dependencies", rows);

  // Load implementation
  const loadData = async (currentFilters = filters) => {
    setLoading(true);
    try {
      // Build API params if server-side filtering is supported,
      // otherwise fetch all and filter client-side (preferred for smaller datasets)
      const res = await fetchDependencies();
      const data = Array.isArray(res) ? res : (res?.data || []);
      setAllRows(data);
      applyFiltersAndSearch(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLayout = async () => {
    try {
      const res = await getLayoutApi("dependencies");
      if (res?.success && res.data?.length > 0) {
        setLayoutFields(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };
  // ... 

  const applyFiltersAndSearch = React.useCallback((data) => {
    let filtered = [...data];

    const pName = filters.account?.trim().toLowerCase();
    if (pName) {
      filtered = filtered.filter((row) =>
        String(row.account ?? "").toLowerCase().includes(pName)
      );
    }

    const selectFilters = { ...filters };
    delete selectFilters.account;
    delete selectFilters.search;

    Object.entries(selectFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row) =>
          String(row[key] ?? "").toLowerCase() === String(value).toLowerCase()
        );
      }
    });

    if (globalSearch.trim()) {
      const term = globalSearch.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((v) =>
          v !== null && v !== undefined && String(v).toLowerCase().includes(term)
        )
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.last_updated || a.reported_date || a.created_at || 0);
      const dateB = new Date(b.last_updated || b.reported_date || b.created_at || 0);
      return dateB - dateA;
    });

    setRows(filtered);
  }, [filters, globalSearch]);


  // ... loadData ...

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
      type: "",
      dependent_on: "",
      search: "",
    };
    setFilters(cleared);
    loadData(cleared);
  };

  const clearGlobalSearch = () => {
    setGlobalSearch("");
  };

  const handleExport = () => {
    const exportData = window.__EXPORT_DATA__?.["dependencies"];

    if (!exportData || !exportData.rows?.length) {
      alert(`No data available to export for dependencies`);
      return;
    }

    exportToExcel(exportData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const columns = dependenciesFormConfig?.fields || [];

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
          <h1 className="font-marcellus font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight mb-1">Dependencies</h1>
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
        className="w-full rounded-xl bg-white border border-gray-200 shadow-sm px-4 py-4 flex flex-col lg:flex-row gap-4"
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

          <select name="type" value={filters.type} onChange={handleChange}
            className="rounded-lg border px-3 py-2 text-xs sm:text-sm">
            <option value="">Type (All)</option>
            {typeOptions.map((t) => <option key={t}>{t}</option>)}
          </select>

          <input
            type="text"
            name="dependent_on"
            placeholder="Dependent On"
            value={filters.dependent_on}
            onChange={handleChange}
            className="rounded-lg border px-3 py-2 text-xs sm:text-sm"
          />
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
        className="w-full rounded-xl bg-white border border-gray-200 shadow-sm px-4 py-3 flex flex-row gap-3 items-center"
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
                    <th key={c.name} className="px-4 py-2.5 text-xs font-semibold uppercase">{c.name === "manual_project_id" ? "Project ID" : c.label}</th>
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
                        <td key={c.name} className="px-4 py-2 min-w-[180px] align-top text-gray-700 leading-relaxed">
                          {c.name.toLowerCase() === "status" && m
                            ? <span className="inline-flex items-center gap-2">
                              <span className={`status-dot ${m.dotClass}`} />{m.label}
                            </span>
                            : (c.type === "date" || c.name.toLowerCase().includes("date") || c.name.toLowerCase().includes("_at"))
                              ? formatDateOnly(row[c.name])
                              : <TruncatedCell content={String(row[c.name] ?? "")} />}
                        </td>
                      ))}

                    </tr>
                  );
                })}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center py-4">
                      No dependencies found.
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
            await saveLayoutApi("dependencies", newLayout);
            setLayoutFields(newLayout);
            setShowLayoutBuilder(false);
          }}
        />
      )}
    </motion.div>
  );
};

export default MonitoringDependenciesPage;
