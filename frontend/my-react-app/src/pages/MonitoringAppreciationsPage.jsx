import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchAppreciations } from "../api/appreciationsApi";
import { FiPlus } from "react-icons/fi";
import { formatDisplayDate, formatDateOnly } from "../utils/dateFormat";
import { filterConfig } from "../config/filterConfig";
import useMonitoringExport from "../hooks/useMonitoringExport";
import LayoutBuilder from "../components/LayoutBuilder";
import { getLayoutApi, saveLayoutApi } from "../api/layoutApi";
import { appreciationsFormConfig } from "../config/formConfig";
import { Pen } from "phosphor-react";

// Helper for professional headers
const formatHeader = (key) => {
  const map = {
    appreciation_id: "Appreciation ID",
    manual_project_id: "Project ID",
    project_description: "Project Description",
    account: "Account",
    received_date: "Received Date",
    recorded_by: "Recorded By",
    appreciation_type: "Appreciation Type",
    shared_with_team: "Shared With Team",
    created_at: "Created On",
    updated_at: "Updated On"
  };
  if (map[key]) return map[key];
  return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

const MonitoringAppreciationsPage = () => {
  // ... (state) ...
  const [showLayoutBuilder, setShowLayoutBuilder] = useState(false);
  const [layoutFields, setLayoutFields] = useState(appreciationsFormConfig?.fields || []);

  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allRows, setAllRows] = useState([]); // Store unfiltered data

  // ... (filters/export logic stays same) ...
  const [filters, setFilters] = useState({
    appreciation_type: "",
    shared_with: "",
    account: "",
    search: "",
  });
  const [globalSearch, setGlobalSearch] = useState("");
  useMonitoringExport("appreciations", rows);
  const cleanParams = (obj) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== "" && v !== null));

  // ... (applyFiltersAndSearch stays same) ...
  const applyFiltersAndSearch = (data) => {
    let filtered = [...data];
    // 1. Apply select filters
    const selectFilters = { ...filters };
    const pName = selectFilters.account?.trim().toLowerCase();
    delete selectFilters.account;
    delete selectFilters.search;
    Object.entries(selectFilters).forEach(([key, value]) => {
      if (value) filtered = filtered.filter((row) => String(row[key] ?? "").toLowerCase() === String(value).toLowerCase());
    });
    // 2. Account Filter
    if (pName) filtered = filtered.filter((row) => String(row.account ?? "").toLowerCase().includes(pName));
    // 3. Global Search
    if (globalSearch.trim()) {
      const term = globalSearch.toLowerCase();
      filtered = filtered.filter((row) => Object.values(row).some((v) => v !== null && v !== undefined && String(v).toLowerCase().includes(term)));
    }
    // Sort by latest updated
    filtered.sort((a, b) => new Date(b.last_updated || b.updated_at || b.created_at || 0) - new Date(a.last_updated || a.updated_at || a.created_at || 0));
    setRows(filtered);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const src = filters;
      const q = cleanParams(src);
      q.search = "";
      if (q.shared_with) { q.shared_with_team = q.shared_with; delete q.shared_with; }

      let res = await fetchAppreciations(q);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setAllRows(list);
      applyFiltersAndSearch(list);
    } catch (err) {
      console.error("Failed to load appreciations", err);
      // alert("Failed to load appreciations"); 
      setAllRows([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLayout = async () => {
    try {
      const serverLayout = await getLayoutApi("appreciations");
      if (serverLayout && Array.isArray(serverLayout)) setLayoutFields(serverLayout);
      else setLayoutFields(appreciationsFormConfig?.fields || []);
    } catch (err) {
      console.warn("No custom layout found, using default");
      setLayoutFields(appreciationsFormConfig?.fields || []);
    }
  };

  useEffect(() => { loadData(); loadLayout(); return () => { }; }, []);
  useEffect(() => { if (allRows.length > 0) applyFiltersAndSearch(allRows); }, [filters, globalSearch]);

  const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleApply = () => loadData();
  const handleClear = () => {
    const cleared = { appreciation_type: "", shared_with: "", account: "", search: "" };
    setFilters(cleared);
  };
  const clearGlobal = () => setGlobalSearch("");

  // Column Construction & Reordering
  const getColumns = () => {
    if (!rows[0]) return [];
    const keys = Object.keys(rows[0]).filter(c => c !== "id" && c !== "project_id");

    // Preferred Order: ID, Creator, Project ID, Desc, Account, Date...
    const preferred = ["appreciation_id", "recorded_by", "manual_project_id", "project_description", "account", "received_date"];

    return keys.sort((a, b) => {
      const idxA = preferred.indexOf(a);
      const idxB = preferred.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  };
  const columns = getColumns();

  const appreciationTypes = ["Email", "Call", "Meeting", "Formal Letter", "Survey Feedback", "Verbal"];
  const sharedWithOpts = ["Yes", "No"];

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
          <h1 className="font-marcellus font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight mb-1">Appreciation</h1>
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

      {/* -------- FILTERS -------- */}
      <motion.div
        className="w-full rounded-xl bg-white border border-gray-200 shadow-sm px-4 py-4 flex flex-col lg:flex-row gap-3 lg:items-end"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="bg-white border rounded-xl shadow-sm px-4 py-4 flex flex-col gap-3">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            <select
              name="appreciation_type"
              value={filters.appreciation_type}
              onChange={handleFilterChange}
              className="border rounded-lg px-3 py-2 text-xs sm:text-sm outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Appreciation Type (All)</option>
              {appreciationTypes.map(t => <option key={t}>{t}</option>)}
            </select>

            <select
              name="shared_with"
              value={filters.shared_with}
              onChange={handleFilterChange}
              className="border rounded-lg px-3 py-2 text-xs sm:text-sm outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Shared With (All)</option>
              {sharedWithOpts.map(s => <option key={s}>{s}</option>)}
            </select>

            <input
              type="text"
              name="account"
              placeholder="Account"
              value={filters.account}
              onChange={handleFilterChange}
              className="border rounded-lg px-3 py-2 text-xs sm:text-sm outline-none focus:border-blue-500 transition-colors"
            />

          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={handleApply}
              className="rounded-full bg-brandDark text-white px-4 py-2 text-xs sm:text-sm transition-transform active:scale-95">
              Apply
            </button>
            <button onClick={handleClear}
              className="rounded-full border px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors">
              Clear
            </button>
          </div>
        </div>

        {/* -------- GLOBAL SEARCH -------- */}
        <motion.div
          className="bg-white border rounded-xl shadow-sm px-4 py-3 flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <label className="text-xs sm:text-sm font-semibold w-24 sm:w-32 text-gray-700">Global Search</label>

          <div className="relative flex-1">
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search..."
              className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm pr-10 outline-none focus:border-blue-500 transition-colors"
            />
            {globalSearch && (
              <span onClick={clearGlobal}
                className="absolute right-3 top-2.5 text-gray-500 cursor-pointer hover:text-red-500">✕</span>
            )}
          </div>
        </motion.div>
      </motion.div>


      {/* -------- TABLE -------- */}
      <motion.div
        className="flex-1 bg-white border rounded-xl shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        {loading ? (
          <div className="p-6 text-sm text-gray-500 animate-pulse">Loading appreciations...</div>
        ) : (
          <div className="overflow-auto custom-scrollbar">
            <table className="monitoring-table min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-12">S.No</th>
                  {columns.map(c => (
                    <th key={c} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {formatHeader(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 w-12">{idx + 1}</td>
                    {columns.map(c => (
                      <td key={c} className="px-4 py-3 whitespace-nowrap text-gray-700">
                        {c.toLowerCase().includes("date") || c.toLowerCase().includes("_at")
                          ? formatDateOnly(row[c])
                          : (row[c] || "-")}
                      </td>
                    ))}
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center py-8 text-gray-500 italic">
                      No appreciations found matching your criteria.
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
            await saveLayoutApi("appreciations", newLayout);
            setLayoutFields(newLayout);
            setShowLayoutBuilder(false);
          }}
        />
      )}
    </motion.div>
  );
};

export default MonitoringAppreciationsPage;

