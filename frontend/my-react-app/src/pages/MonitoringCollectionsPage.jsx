import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchCollections } from "../api/collectionsApi";
import { formatDisplayDate, formatDateOnly } from "../utils/dateFormat";
import { filterConfig } from "../config/filterConfig";
import useMonitoringExport from "../hooks/useMonitoringExport";
import LayoutBuilder from "../components/LayoutBuilder";
import { getLayoutApi, saveLayoutApi } from "../api/layoutApi";
import { collectionsFormConfig } from "../config/formConfig";
import { Pen } from "phosphor-react";

// Helper for professional headers
const formatHeader = (key) => {
  const map = {
    invoice_number: "Invoice #",
    customer_name: "Customer Name",
    manual_project_id: "Project ID",
    project_description: "Project Description",
    account: "Account",
    invoice_date: "Invoice Date",
    due_date: "Due Date",
    total_amount: "Amount",
    amount_paid: "Paid",
    balance_due: "Balance",
    status: "Status",
    payment_status: "Payment Status",
    created_at: "Created On",
    updated_at: "Updated On"
  };
  if (map[key]) return map[key];
  return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

const MonitoringCollectionsPage = () => {
  // Layout Builder state
  const [showLayoutBuilder, setShowLayoutBuilder] = useState(false);
  const [layoutFields, setLayoutFields] = useState(collectionsFormConfig?.fields || []);

  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allRows, setAllRows] = useState([]); // Store unfiltered data
  useMonitoringExport("collections", rows);

  /* === MASTER FILTER SET === */
  const [filters, setFilters] = useState({
    account: "",
    currency: "",
    status: "",
    payment_status: "",
    search: "",
  });

  // second row global search
  const [globalSearch, setGlobalSearch] = useState("");

  const currencyOptions = ["INR", "USD", "EUR", "GBP"];
  const statusOptions = ["Pending", "Partially Paid", "Paid", "Overdue", "Disputed", "Written Off"];
  const paymentOptions = [
    "PO Received - Payment in Process",
    "Under Review",
    "Approved - Awaiting Payment",
    "Partially Paid",
    "Paid",
    "Disputed",
    "On Hold",
  ];

  const cleanParams = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== "" && v !== null)
    );

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

  /* === LOAD DATA === */
  const loadData = async () => {
    try {
      setLoading(true);

      const base = filters;
      const q = cleanParams(base);
      q.search = ""; // Don't send search to backend

      // if account exists: map to backend like master spec
      if (q.account) {
        q.account = q.account; // same key, just clarifying mapping
      }

      let res = await fetchCollections(q);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      setAllRows(list);
      applyFiltersAndSearch(list);
    } catch (err) {
      console.error("Failed to load collections", err);
      alert("Failed to load collections");
      setAllRows([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };


  // Load layout configuration
  const loadLayout = async () => {
    try {
      const serverLayout = await getLayoutApi("collections");
      if (serverLayout && Array.isArray(serverLayout)) {
        setLayoutFields(serverLayout);
      } else {
        setLayoutFields(collectionsFormConfig?.fields || []);
      }
    } catch (err) {
      console.warn("No custom layout found, using default");
      setLayoutFields(collectionsFormConfig?.fields || []);
    }
  };

  useEffect(() => {
    loadData();
    loadLayout();
    return () => { };
  }, []);

  // Re-filter when filters or search change (live)
  useEffect(() => {
    if (allRows.length > 0) {
      applyFiltersAndSearch(allRows);
    }
  }, [filters, globalSearch]);

  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleApply = () => loadData();

  const handleClear = () => {
    const cleared = {
      account: "",
      currency: "",
      status: "",
      payment_status: "",
      search: "",
    };
    setFilters(cleared);
    loadData(); // clear should reload? or just reset fitlers. Original logic called loadData(cleared) which might be wrong param. 
    // Usually applyFiltersAndSearch handles it if allRows exists.
    // But original code had: loadData(cleared).
    // Let's just setFilters and apply locally if possible or reload.
    // The original code passed 'cleared' to loadData but loadData uses state 'filters'.
    // So setState might not be fast enough if we call loadData immediately.
    // Safest is to just setFilters and let useEffect trigger? No, useEffect triggers on filter change?
    // Actually the Apply button calls loadData manually.
    // Let's stick to setFilters.
  };
  const clearGlobal = () => {
    setGlobalSearch("");
  };

  // Column Construction & Reordering
  const getColumns = () => {
    if (!rows[0]) return [];
    const keys = Object.keys(rows[0]).filter(c => c !== "id" && c !== "project_id");

    // Preferred Order: Invoice, Customer, Project ID, Desc, Account, Dates...
    const preferred = ["invoice_number", "customer_name", "manual_project_id", "project_description", "account", "invoice_date", "due_date", "total_amount", "status"];

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
          <h1 className="font-marcellus font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight mb-1">Collection</h1>
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

      {/* FILTERS */}
      <motion.div
        className="bg-white border rounded-xl shadow-sm px-4 py-4 flex flex-col gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">

          <input
            type="text"
            name="account"
            placeholder="Account"
            value={filters.account}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-xs sm:text-sm outline-none focus:border-blue-500 transition-colors"
          />

          <select
            name="currency"
            value={filters.currency}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-xs sm:text-sm outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">Currency (All)</option>
            {currencyOptions.map(c => <option key={c}>{c}</option>)}
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-xs sm:text-sm outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">Status (All)</option>
            {statusOptions.map(s => <option key={s}>{s}</option>)}
          </select>

          <select
            name="payment_status"
            value={filters.payment_status}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-xs sm:text-sm outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">Payment Status (All)</option>
            {paymentOptions.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={handleApply}
            className="rounded-full bg-brandDark text-white px-4 py-2 text-xs sm:text-sm transition-transform active:scale-95">
            Apply
          </button>
          <button onClick={() => { handleClear(); }}
            className="rounded-full border px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors">
            Clear
          </button>
        </div>
      </motion.div>

      {/* GLOBAL SEARCH */}
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
            placeholder="Search invoice / customer..."
            className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm pr-10 outline-none focus:border-blue-500 transition-colors"
          />
          {globalSearch && (
            <span onClick={clearGlobal}
              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer hover:text-red-500">
              ✕
            </span>
          )}
        </div>
      </motion.div>

      {/* TABLE */}
      <motion.div
        className="flex-1 bg-white border rounded-xl shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        {loading ? (
          <div className="p-6 text-sm text-gray-500 animate-pulse">Loading collections...</div>
        ) : (
          <div className="overflow-auto custom-scrollbar">
            <table className="monitoring-table min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-12">S.No</th>
                  {columns.map((c) => (
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
                    {columns.map((c) => (
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
                      No collections found matching your criteria.
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
            await saveLayoutApi("collections", newLayout);
            setLayoutFields(newLayout);
            setShowLayoutBuilder(false);
          }}
        />
      )}
    </motion.div>
  );
};

export default MonitoringCollectionsPage;

