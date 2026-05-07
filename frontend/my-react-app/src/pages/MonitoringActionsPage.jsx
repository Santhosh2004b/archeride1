import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { fetchActions } from "../api/actionsApi";
import { formatDisplayDate } from "../utils/dateFormat";
import useMonitoringExport from "../hooks/useMonitoringExport";

import { useNavigate } from "react-router-dom";
import { FiFilter, FiSearch } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { actionsFormConfig } from "../config/formConfig";
import { DownloadSimple, Plus, ClockCounterClockwise } from "phosphor-react";
import { useFilter } from "../context/FilterContext";
import TruncatedCell from "../components/TruncatedCell";
import { exportToExcel } from "../utils/exportToExcel";
import AddProjectModal from "../components/AddProjectModal";
import ProjectHistoryModal from "../components/ProjectHistoryModal";
import BulkUploadActionsModal from "../components/BulkUploadActionsModal";


const getStatusMeta = (row) => {
  const s = String(row.status || "").toLowerCase();
  const map = {
    open: { rowClass: "status-open", dotClass: "dot-open", label: "Open" },
    "in progress": { rowClass: "status-inprogress", dotClass: "dot-inprogress", label: "In Progress" },
    "on hold": { rowClass: "status-onhold", dotClass: "dot-onhold", label: "On Hold" },
    resolved: { rowClass: "status-resolved", dotClass: "dot-resolved", label: "Resolved" },
    cancelled: { rowClass: "status-cancelled", dotClass: "dot-cancelled", label: "Cancelled" },
  };
  return map[s] || null;
};

const COLUMNS = [
  { key: "status", label: "Status" },
  { key: "action_item", label: "Action Item" },
  { key: "priority", label: "Priority" },
  { key: "target_date", label: "Target Date" },
  { key: "responsible", label: "Responsible" },
  { key: "support_required_from", label: "Support Required From" },
  { key: "teams_involved", label: "Teams Involved" },
  { key: "remarks", label: "Remarks" },
];

const MonitoringActionsPage = () => {
  const { selectedManager } = useFilter();
  const navigate = useNavigate();
  
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allRows, setAllRows] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const [showAddProject, setShowAddProject] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  
  const [globalSearch, setGlobalSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
  });

  const userStr = localStorage.getItem("ARCHERIDE_AUTH");
  const userData = userStr ? JSON.parse(userStr) : null;
  const isAdmin = userData?.user?.role === "ADMIN";

  useMonitoringExport("actions", rows);

  const applyFiltersAndSearch = useCallback((data) => {
    let filtered = [...data];

    if (filters.status) {
      filtered = filtered.filter(r => String(r.status || "").toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.priority) {
      filtered = filtered.filter(r => String(r.priority || "").toLowerCase() === filters.priority.toLowerCase());
    }

    if (globalSearch.trim()) {
      const term = globalSearch.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((v) =>
          v !== null && v !== undefined && String(v).toLowerCase().includes(term)
        )
      );
    }

    filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    setRows(filtered);
  }, [filters, globalSearch]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchActions({ manager: selectedManager });
      const list = Array.isArray(res) ? res : (res?.data || []);
      setAllRows(list);
      applyFiltersAndSearch(list);
    } catch (err) {
      console.error("Failed to load actions", err);
      setAllRows([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedManager]);

  useEffect(() => {
    applyFiltersAndSearch(allRows);
  }, [filters, globalSearch, allRows, applyFiltersAndSearch]);

  const handleFilterChange = (e) => {
    setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleClear = () => {
    setFilters({ status: "", priority: "" });
    setGlobalSearch("");
  };

  const handleApply = () => {
    applyFiltersAndSearch(allRows);
  };

  const handleExport = () => {
    const exportData = window.__EXPORT_DATA__?.["actions"];
    if (!exportData || !exportData.rows?.length) return;
    exportToExcel(exportData);
    setToastMessage("✅ Exported Successfully");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };



  return (
    <motion.div
      className="min-h-[calc(100vh-80px)] bg-gray-50 p-4 sm:p-6 flex flex-col gap-4 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {showToast && (
        <div className="absolute top-4 right-1/2 translate-x-1/2 z-50 rounded-md bg-green-600 px-4 py-2 text-white shadow-lg animate-fade">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-marcellus font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight">Actions</h1>
          <p className="text-sm text-gray-500 italic">Table — Latest Updates (Simplified)</p>
        </div>

        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => setShowAddProject(true)}
                className="rounded-full h-10 w-10 flex items-center justify-center border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors bg-white shadow-sm"
              >
                <Plus size={20} weight="bold" />
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="rounded-full h-10 w-10 flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors bg-white shadow-sm"
              >
                <ClockCounterClockwise size={20} weight="duotone" />
              </button>
            </>
          )}
          <button
            onClick={() => setShowBulkUpload(true)}
            className="rounded-full h-10 px-4 flex items-center justify-center bg-brandDark text-white hover:bg-black transition-colors shadow-sm text-xs font-bold gap-2"
          >
            <Plus size={16} weight="bold" /> Add New
          </button>
          

          <button
            onClick={handleExport}
            className="rounded-full h-10 w-10 flex items-center justify-center border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors bg-white shadow-sm"
          >
            <DownloadSimple size={20} weight="duotone" />
          </button>
        </div>
      </div>

      {/* Filter Bar (Escalations Style) */}
      <motion.div
        className="w-full rounded-xl bg-white border shadow-sm px-4 py-4 flex flex-col lg:flex-row gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
           <select name="status" value={filters.status} onChange={handleFilterChange} className="rounded-lg border px-3 py-2 text-xs sm:text-sm outline-none focus:border-brandDark">
             <option value="">Status (All)</option>
             {["Open", "In Progress", "Resolved", "On Hold", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
           </select>

           <select name="priority" value={filters.priority} onChange={handleFilterChange} className="rounded-lg border px-3 py-2 text-xs sm:text-sm outline-none focus:border-brandDark">
             <option value="">Priority (All)</option>
             {["Critical", "High", "Medium", "Low"].map(p => <option key={p} value={p}>{p}</option>)}
           </select>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={handleApply} className="rounded-full bg-brandDark text-white px-6 py-2 text-xs sm:text-sm font-bold shadow-sm hover:bg-black transition-all">Apply</button>
          <button onClick={handleClear} className="rounded-full border px-6 py-2 text-xs sm:text-sm font-bold hover:bg-gray-50 transition-all">Clear</button>
        </div>
      </motion.div>

      {/* Global Search Bar (Escalations Style) */}
      <motion.div
        className="w-full rounded-xl bg-white border shadow-sm px-4 py-3 flex items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 w-28">Global Search</label>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search all fields..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="rounded-lg border w-full px-3 py-2 text-xs sm:text-sm pr-16 outline-none focus:border-brandDark"
          />
          <FiSearch className="absolute right-10 top-2.5 text-gray-400" />
          {globalSearch && (
            <RxCross2
              onClick={() => setGlobalSearch("")}
              className="absolute right-3 top-2.5 text-gray-400 cursor-pointer hover:text-brandDark"
            />
          )}
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div
        className="flex-1 rounded-xl bg-white border shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {loading ? (
          <div className="p-10 text-center text-gray-400 animate-pulse">Loading Actions...</div>
        ) : (
          <div className="overflow-auto h-full">
            <table className="monitoring-table min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500 w-12">S.No</th>
                  {COLUMNS.map(c => <th key={c.key} className="px-4 py-3 text-xs font-bold uppercase text-gray-500 whitespace-nowrap">{c.label}</th>)}
                  <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 italic-rows">
                {rows.map((row, idx) => {
                  const meta = getStatusMeta(row);
                  return (
                    <tr key={row.id} className={`${meta?.rowClass || ""} hover:bg-gray-50 transition-colors group`}>
                      <td className="px-4 py-4 font-semibold text-gray-900 w-12">{idx + 1}</td>
                      {COLUMNS.map(c => (
                        <td key={c.key} className="px-6 py-4 align-top text-gray-700 leading-relaxed min-w-[150px]">
                          {c.key === "status" && meta ? (
                            <span className="flex items-center gap-2">
                              <span className={`status-dot ${meta.dotClass}`} />
                              {meta.label}
                            </span>
                          ) : c.key === "target_date" ? (
                            formatDisplayDate(row[c.key], true)
                          ) : (
                            <TruncatedCell content={String(row[c.key] || "-")} />
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-4">
                        <button 
                           onClick={() => navigate(`/modules/actions?mode=edit&id=${row.id}`)}
                           className="opacity-0 group-hover:opacity-100 transition-opacity bg-brandDark text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-md hover:bg-black"
                        >
                          EDIT
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr><td colSpan={COLUMNS.length + 2} className="py-20 text-center text-gray-400 italic">No actions found matching your criteria.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AddProjectModal
        isOpen={showAddProject}
        onClose={() => setShowAddProject(false)}
        onSuccess={() => {
          setToastMessage("🚀 Project added successfully!");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
          loadData();
        }}
      />

      <ProjectHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />

      {showBulkUpload && (
        <BulkUploadActionsModal
          isOpen={true}
          onClose={() => setShowBulkUpload(false)}
          onSuccess={() => {
            setToastMessage("🚀 Bulk upload successful!");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            loadData();
          }}
        />
      )}
    </motion.div>
  );
};

export default MonitoringActionsPage;
