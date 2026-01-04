import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchCollections } from "../api/collectionsApi";
import { FiPlus } from "react-icons/fi";
import useMonitoringExport from "../hooks/useMonitoringExport";

const MonitoringCollectionsPage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allRows, setAllRows] = useState([]); // Store unfiltered data
  useMonitoringExport("collections", rows);

  /* === MASTER FILTER SET === */
  const [filters, setFilters] = useState({
    project_name: "",
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
    const pName = selectFilters.project_name?.trim().toLowerCase();
    delete selectFilters.project_name;
    delete selectFilters.search;

    Object.entries(selectFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row) =>
          String(row[key] ?? "").toLowerCase() === String(value).toLowerCase()
        );
      }
    });

    // 2. Project Name Filter
    if (pName) {
      filtered = filtered.filter((row) =>
        String(row.project_name ?? "").toLowerCase().includes(pName)
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

      // if project_name exists: map to backend like master spec
      if (q.project_name) {
        q.project_name = q.project_name; // same key, just clarifying mapping
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

  useEffect(() => {
    loadData();
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
      project_name: "",
      currency: "",
      status: "",
      payment_status: "",
      search: "",
    };
    setFilters(cleared);
    loadData(cleared);
  };

  const clearGlobal = () => {
    setGlobalSearch("");
  };



  const columns = rows[0] ? Object.keys(rows[0]) : [];

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
            name="project_name"
            placeholder="Project Name"
            value={filters.project_name}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-xs sm:text-sm"
          />

          <select
            name="currency"
            value={filters.currency}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-xs sm:text-sm"
          >
            <option value="">Currency (All)</option>
            {currencyOptions.map(c => <option key={c}>{c}</option>)}
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-xs sm:text-sm"
          >
            <option value="">Status (All)</option>
            {statusOptions.map(s => <option key={s}>{s}</option>)}
          </select>

          <select
            name="payment_status"
            value={filters.payment_status}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-xs sm:text-sm"
          >
            <option value="">Payment Status (All)</option>
            {paymentOptions.map(p => <option key={p}>{p}</option>)}
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

      {/* GLOBAL SEARCH */}
      <motion.div
        className="bg-white border rounded-xl shadow-sm px-4 py-3 flex items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <label className="text-xs sm:text-sm font-semibold w-32">Global Search</label>

        <div className="relative flex-1">
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search invoice / customer"
            className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm pr-10"
          />
          {globalSearch && (
            <span onClick={clearGlobal}
              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer">
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
          <div className="p-6 text-sm">Loading…</div>
        ) : (
          <div className="overflow-auto">
            <table className="monitoring-table min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 uppercase font-semibold w-12">S.No</th>
                  {columns.map((c) => (
                    <th key={c} className="px-4 py-2.5 uppercase font-semibold">
                      {c}
                    </th>
                  ))}

                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id} className="border-b">
                    <td className="px-4 py-2 whitespace-nowrap font-semibold w-12">{idx + 1}</td>
                    {columns.map((c) => (
                      <td key={c} className="px-4 py-2 whitespace-nowrap">
                        {String(row[c] ?? "")}
                      </td>
                    ))}

                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center py-4">
                      No collections found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MonitoringCollectionsPage;
