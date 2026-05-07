import { useFilter } from '../context/FilterContext';
import React, { useEffect, useState } from "react";
import { formatDateOnly } from "../utils/dateFormat";
import { motion } from "framer-motion";
import { fetchRisks } from "../api/risksApi";
import { filterConfig } from "../config/filterConfig";
import useMonitoringExport from "../hooks/useMonitoringExport";
import LayoutBuilder from "../components/LayoutBuilder";
import { getLayoutApi, saveLayoutApi } from "../api/layoutApi";
import { risksFormConfig } from "../config/formConfig";
// useNavigate removed as unused
import { FiSearch, FiFilter, FiRotateCcw } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { Pen, DownloadSimple } from "phosphor-react";
import TruncatedCell from "../components/TruncatedCell";
import { exportToExcel } from "../utils/exportToExcel";

const getStatusMeta = (row) => {
  const raw = row.status || row.Status || row.current_status;
  if (!raw) return null;

  const s = String(raw).toLowerCase();
  const map = {
    open: { rowClass: "status-resolved", dotClass: "dot-resolved", label: "Resolved" }, // Open -> Resolved (Status Normalization Rule 3)
    "in progress": { rowClass: "status-inprogress", dotClass: "dot-inprogress", label: "In Progress" },
    "on hold": { rowClass: "status-onhold", dotClass: "dot-onhold", label: "On Hold" },
    resolved: { rowClass: "status-resolved", dotClass: "dot-resolved", label: "Resolved" },
    "approved & closed": { rowClass: "status-approved", dotClass: "dot-approved", label: "Approved & Closed" },
    cancelled: { rowClass: "status-cancelled", dotClass: "dot-cancelled", label: "Cancelled" },
  };
  return map[s] || null;
};

const MonitoringRisksPage = () => {
  // navigate removed
  const [rows, setRows] = useState([]);
  useMonitoringExport("risks", rows);

  const [loading, setLoading] = useState(false);
  const [allRows, setAllRows] = useState([]);
  const { selectedManager } = useFilter();


  const [showLayoutBuilder, setShowLayoutBuilder] = useState(false);
  const [layoutFields, setLayoutFields] = useState(risksFormConfig?.fields || []);

  const [showToast, setShowToast] = useState(false);

  const [filters, setFilters] = useState({
    account: "",
    status: "",
    priority: "",
    category: "",
    probability: "",
    impact: "",
  });


  const [globalSearch, setGlobalSearch] = useState("");

  // ...

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
      const q = globalSearch.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((v) =>
          v !== null && v !== undefined && String(v).toLowerCase().includes(q)
        )
      );
    }


    filtered.sort((a, b) => {
      const dateA = new Date(a.last_updated || a.identified_date || a.created_at || 0);
      const dateB = new Date(b.last_updated || b.identified_date || b.created_at || 0);
      return dateB - dateA;
    });

    setRows(filtered);
  }, [filters, globalSearch]);

  const loadData = async () => {
    try {
      setLoading(true);

      const res = await fetchRisks({ manager: selectedManager });
      const data = Array.isArray(res) ? res : (res?.data || []);
      setAllRows(data);
      applyFiltersAndSearch(data);
    } catch (err) {
      console.error("Failed to load risks", err);
      alert("Failed to load risks");
      setAllRows([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };


  const loadLayout = async () => {
    try {
      const serverLayout = await getLayoutApi("risks");
      if (serverLayout && Array.isArray(serverLayout)) {
        setLayoutFields(serverLayout);
      } else {
        setLayoutFields(risksFormConfig?.fields || []);
      }
    } catch (err) {
      console.warn("No custom layout found, using default");
      setLayoutFields(risksFormConfig?.fields || []);
    }
  };


  useEffect(() => {
    loadData();
    loadLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManager]);

  useEffect(() => {
    if (allRows.length > 0) {
      applyFiltersAndSearch(allRows);
    }
  }, [filters, globalSearch, allRows, applyFiltersAndSearch]);


  const handleApply = () => loadData();

  const handleClear = () => {
    const cleared = {
      account: "",
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




  const columns = layoutFields;

  const cfg = filterConfig.risks.fields;

  const handleExport = () => {
    const exportData = window.__EXPORT_DATA__?.["risks"];

    if (!exportData || !exportData.rows?.length) {
      alert(`No data available to export for risks`);
      return;
    }

    exportToExcel(exportData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <motion.div
      className="min-h-[calc(100vh-80px)] flex flex-col gap-3 bg-brandBg p-3 sm:p-5 relative"
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
          <h1 className="font-marcellus font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight mb-1">Risks</h1>
          <p className="text-xs sm:text-sm text-gray-500 italic">Table — Latest Updates</p>
        </div>

        { }
        <div className="flex gap-2">
          {/* Export Button Near Customize Form */}
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
        className="w-full rounded-xl bg-white border border-gray-200 shadow-sm px-3 py-3 flex flex-col lg:flex-row gap-2 lg:items-end"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 flex-1">
          { }
          <div className="relative">
            <input
              type="text"
              name="account"
              placeholder="Account"
              value={filters.account}
              onChange={handleFilterChange}
              className="w-full rounded-lg border px-3 py-2 text-xs sm:text-sm pr-8 font-urbanist"
            />
            <FiFilter className="absolute right-3 top-2.5 text-gray-500" />
          </div>

          { }
          {cfg.filter((f) => f.name !== "account").map((f) => (
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

        { }
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

      { }
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

      { }
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
                  <th key={c.name} className="px-4 py-2.5 text-xs font-semibold text-brandMuted uppercase">
                    {c.name === "manual_project_id" ? "Project ID" : c.label}
                  </th>
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
                      <td key={c.name} className="px-6 py-4 min-w-[180px] align-top text-gray-700 leading-relaxed">
                        {c.name.toLowerCase() === "status" && meta ? (
                          <span className="inline-flex items-center gap-2">
                            <span className={`status-dot ${meta.dotClass}`} />
                            {meta.label}
                          </span>
                        ) : c.type === "date" || c.name.toLowerCase().includes("date") || c.name.toLowerCase().includes("_at") ? (
                          formatDateOnly(row[c.name])
                        ) : (
                          <TruncatedCell content={String(row[c.name] ?? "")} />
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

      { }
      {showLayoutBuilder && (
        <LayoutBuilder
          fields={layoutFields}
          onClose={() => setShowLayoutBuilder(false)}
          onSave={async (newLayout) => {
            await saveLayoutApi("risks", newLayout);
            setLayoutFields(newLayout);
            setShowLayoutBuilder(false);
          }}
        />
      )}
    </motion.div>
  );
};

export default MonitoringRisksPage;




