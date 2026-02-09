import React from "react";
import { filterConfig } from "../config/filterConfig";
import { RxMagnifyingGlass } from "react-icons/rx";


const RxCross2 = () => <span className="text-lg font-bold">×</span>;

const MonitoringFilters = ({ moduleKey, filters, setFilters, onApply }) => {
  const cfg = filterConfig[moduleKey]?.fields || []; 

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...filters, [name]: value };
    setFilters(updated);
  };

  
  const handleClearField = (name) => {
    const updated = { ...filters, [name]: "" };
    setFilters(updated);
    onApply(updated); 
  };

  
  const handleClearAll = () => {
    const reset = Object.fromEntries(cfg.map((f) => [f.name, ""]));
    setFilters(reset);
    onApply(reset); 
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {cfg.map((f) => {
          const value = filters[f.name] ?? "";

          
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
              {}
              {f.name === "search" && (
                <RxMagnifyingGlass className="absolute right-8 top-2.5 text-gray-500" />
              )}
              {}
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

      {}
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
