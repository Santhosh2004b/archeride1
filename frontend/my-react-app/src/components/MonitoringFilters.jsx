import React from "react";
import { filterConfig } from "../config/filterConfig";
import { RxMagnifyingGlass } from "react-icons/rx";

// Temporary placeholder for the clear icon
const RxCross2 = () => <span className="text-lg font-bold">×</span>;

const MonitoringFilters = ({ moduleKey, filters, setFilters, onApply }) => {
  const cfg = filterConfig[moduleKey]?.fields || []; // Get filter configuration for the module

  // Handle filter value change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...filters, [name]: value };
    setFilters(updated);
  };

  // Clear a specific filter field
  const handleClearField = (name) => {
    const updated = { ...filters, [name]: "" };
    setFilters(updated);
    onApply(updated); // Apply filters after clearing
  };

  // Clear all filters
  const handleClearAll = () => {
    const reset = Object.fromEntries(cfg.map((f) => [f.name, ""]));
    setFilters(reset);
    onApply(reset); // Apply filters after clearing all
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {cfg.map((f) => {
          const value = filters[f.name] ?? "";

          // Render dropdown (select) fields
          if (f.type === "select") {
            return (
              <select
                key={f.name}
                name={f.name}
                value={value}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">{f.label} (All)</option>
                {f.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            );
          }

          // Render date fields
          if (f.type === "date") {
            return (
              <input
                key={f.name}
                name={f.name}
                type="date"
                value={value}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            );
          }

          // Render text and search fields
          return (
            <div key={f.name} className="relative">
              <input
                type="text"
                name={f.name}
                placeholder={f.label}
                value={value}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              {/* Search icon for the search field */}
              {f.name === "search" && (
                <RxMagnifyingGlass className="absolute right-8 top-2.5 text-gray-500" />
              )}
              {/* Clear icon for fields with values */}
              {value && (
                <RxCross2
                  onClick={() => handleClearField(f.name)}
                  className="absolute right-3 top-2.5 text-gray-500 cursor-pointer hover:text-black"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => onApply(filters)}
          className="bg-brandDark text-white rounded-full px-4 py-2 text-sm"
        >
          Apply
        </button>
        <button
          onClick={handleClearAll}
          className="border rounded-full px-4 py-2 text-sm"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default MonitoringFilters;