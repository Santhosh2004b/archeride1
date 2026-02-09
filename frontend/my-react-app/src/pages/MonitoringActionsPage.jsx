
import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { fetchActions } from "../api/actionsApi";
import { formatDisplayDate } from "../utils/dateFormat";
import { filterConfig } from "../config/filterConfig";
import useMonitoringExport from "../hooks/useMonitoringExport";

import { useNavigate } from "react-router-dom";
import { FiFilter, FiSearch } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import LayoutBuilder from "../components/LayoutBuilder";
import { getLayoutApi, saveLayoutApi } from "../api/layoutApi";
import { actionsFormConfig } from "../config/formConfig";
import { Pen, DownloadSimple } from "phosphor-react";
import TruncatedCell from "../components/TruncatedCell";
import { exportToExcel } from "../utils/exportToExcel";


const getStatusMeta = (row) => {
  const raw = row.status || row.current_status;
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


const COLUMNS = [
  { key: "status", label: "Status" },
  { key: "action_id", label: "Action ID" },
  { key: "account", label: "Project" },
  { key: "action_title", label: "Title" },
  { key: "action_description", label: "Description" },
  { key: "priority", label: "Priority" },
  { key: "action_owner", label: "Owner" },
  { key: "created_by", label: "Created By" },
  { key: "created_date", label: "Created Date" },
  { key: "due_date", label: "Due Date" },
  { key: "completion_date", label: "Completion Date" },
  { key: "completion_percent", label: "Completion %" },
  { key: "related_to_type", label: "Related To Type" },
  { key: "related_to_id", label: "Related To ID" },
  { key: "dependencies", label: "Dependencies" },
  { key: "comments", label: "Comments" },
  { key: "last_updated", label: "Last Updated" },
  { key: "created_at", label: "Created At" },
  { key: "updated_at", label: "Updated At" },

];

const MonitoringActionsPage = () => {

  const [showLayoutBuilder, setShowLayoutBuilder] = useState(false);
  const [layoutFields, setLayoutFields] = useState(actionsFormConfig?.fields || []);

  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allRows, setAllRows] = useState([]);
  const [showToast, setShowToast] = useState(false);

  useMonitoringExport("actions", rows);


  const [filters, setFilters] = useState({
    account: "",
    status: "",
    priority: "",
    related_to_type: "",
    search: "",
  });


  const [globalSearch, setGlobalSearch] = useState("");

  const actCfg = filterConfig.actions.fields;


  const applyFiltersAndSearch = useCallback((data) => {
    let filtered = [...data];


    const selectFilters = { ...filters };
    const pName = selectFilters.account?.trim().toLowerCase();
    delete selectFilters.account;
    delete selectFilters.search;

    Object.entries(selectFilters).forEach(([key, value]) => {
      if (value) {
        const fieldToCheck = key === "status" ? "status" : key;
        filtered = filtered.filter((row) =>
          String(row[fieldToCheck] ?? "").toLowerCase() === String(value).toLowerCase()
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

      const raw = filters;
      const params = Object.fromEntries(
        Object.entries(raw).filter(([k, v]) => v !== "" && v !== null && k !== "search")
      );


      if (params.status) {
        params.current_status = params.status;
        delete params.status;
      }

      const res = await fetchActions();
      const list = Array.isArray(res) ? res : (res?.data || []);

      setAllRows(list);
      applyFiltersAndSearch(list);
    } catch (err) {
      console.error("Failed to load actions", err);
      alert("Failed to load actions");
      setAllRows([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };



  const loadLayout = async () => {
    try {
      const serverLayout = await getLayoutApi("actions");
      if (serverLayout && Array.isArray(serverLayout)) {
        setLayoutFields(serverLayout);
      } else {
        setLayoutFields(actionsFormConfig?.fields || []);
      }
    } catch (err) {
      console.warn("No custom layout found, using default");
      setLayoutFields(actionsFormConfig?.fields || []);
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

  const handleFilterChange = (e) => {
    setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleApply = () => loadData();

  const handleClear = () => {
    const cleared = {
      account: "",
      status: "",
      priority: "",
      related_to_type: "",
    };
    setFilters(cleared);
    loadData(cleared);
  };

  const clearGlobal = () => {
    setGlobalSearch("");
  };



  const statusOptions = actCfg.find((f) => f.name === "status").options;
  const priorityOptions = actCfg.find((f) => f.name === "priority").options;
  const relatedOptions = actCfg.find((f) => f.name === "related_to_type").options;

  const handleExport = () => {
    const exportData = window.__EXPORT_DATA__?.["actions"];

    if (!exportData || !exportData.rows?.length) {
      alert(`No data available to export for actions`);
      return;
    }

    exportToExcel(exportData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <motion.div
      className="min-h-[calc(100vh-80px)] bg-gray-50 p-4 sm:p-6 flex flex-col gap-4 relative"
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
          <h1 className="font-marcellus font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight mb-1">Actions</h1>
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
        className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          <div className="relative">
            <input
              type="text"
              name="account"
              placeholder="Account"
              value={filters.account}
              onChange={handleFilterChange}
              className="border rounded-lg px-3 py-2 text-xs sm:text-sm pr-9"
            />
            <FiFilter className="absolute right-3 top-2.5 text-gray-500" />
          </div>

          <select name="status" value={filters.status} onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-xs sm:text-sm">
            <option value="">Status (All)</option>
            {statusOptions.map((s) => <option key={s}>{s}</option>)}
          </select>

          <select name="priority" value={filters.priority} onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-xs sm:text-sm">
            <option value="">Priority (All)</option>
            {priorityOptions.map((p) => <option key={p}>{p}</option>)}
          </select>

          <select name="related_to_type" value={filters.related_to_type} onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-xs sm:text-sm">
            <option value="">Related To (All)</option>
            {relatedOptions.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={handleApply} className="bg-brandDark text-white rounded-full px-4 py-2 text-xs sm:text-sm">
            Apply
          </button>
          <button onClick={handleClear} className="border rounded-full px-4 py-2 text-xs sm:text-sm">
            Clear
          </button>
        </div>
      </motion.div>

      { }
      <motion.div
        className="bg-white border rounded-xl shadow-sm px-4 py-3 flex items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 w-28">Global Search</label>

        <div className="relative flex-1">
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search across all fields"
            className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm pr-16"
          />
          <FiSearch className="absolute right-10 top-2.5 text-gray-500" />
          {globalSearch && (
            <RxCross2
              onClick={clearGlobal}
              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
            />
          )}
        </div>
      </motion.div>

      { }
      <motion.div
        className="bg-white border rounded-xl shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        {loading ? (
          <div className="p-6 text-sm">Loading…</div>
        ) : (
          <div className="overflow-auto">
            <table className="monitoring-table min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase w-12">S.No</th>
                  {COLUMNS.map((c) => (
                    <th key={c.key} className="px-4 py-2.5 text-xs font-semibold uppercase">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const meta = getStatusMeta(row);
                  return (
                    <tr key={row.id} className={`${meta?.rowClass || ""} border-b`}>
                      <td className="px-4 py-2 whitespace-nowrap font-semibold w-12">{idx + 1}</td>
                      {COLUMNS.map((c) => (
                        <td key={c.key} className="px-4 py-2 min-w-[180px] align-top text-gray-700 leading-relaxed">
                          {c.key === "status" && meta
                            ? <span className="inline-flex items-center gap-2"><span className={`status-dot ${meta.dotClass}`} />{meta.label}</span>
                            : c.key === "actions"
                              ? <button
                                onClick={() => navigate(`/modules/actions?mode=edit&id=${row.id}`)}
                                className="inline-flex items-center justify-center rounded-full border border-brandDark/20 px-3 py-1 text-xs font-urbanist text-brandDark hover:bg-brandDark hover:text-white transition"
                              >
                                Edit
                              </button>
                              : (c.key.toLowerCase().includes("date") || c.key.toLowerCase().includes("_at"))
                                ? formatDisplayDate(row[c.key], true)
                                : <TruncatedCell content={String(row[c.key] ?? "")} />
                          }
                        </td>
                      ))}
                    </tr>
                  );
                })}

                {rows.length === 0 && (
                  <tr><td colSpan={COLUMNS.length + 1} className="text-center py-6">No actions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}


        { }
        {showLayoutBuilder && (
          <LayoutBuilder
            fields={layoutFields}
            onClose={() => setShowLayoutBuilder(false)}
            onSave={async (newLayout) => {
              await saveLayoutApi("actions", newLayout);
              setLayoutFields(newLayout);
              setShowLayoutBuilder(false);
            }}
          />
        )}
      </motion.div>
    </motion.div >
  );
};

export default MonitoringActionsPage;
