// src/components/MonitoringPageHeader.jsx
import React from "react";
import { motion } from "framer-motion";
import { FiFilter, FiRotateCcw } from "react-icons/fi";

const MonitoringPageHeader = ({ 
  title, 
  subtitle = "Table — Latest Updates",
  onApply, 
  onClear,
  filterCount = 0 
}) => {
  return (
    <>
      {/* Animated Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <h1 className="font-marcellus text-2xl sm:text-3xl font-bold text-gray-900">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        {filterCount > 0 && (
          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-700">
            {filterCount} active
          </div>
        )}
      </motion.div>

      {/* Animated Filter Controls */}
      <motion.div 
        className="flex gap-2 justify-end"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <button 
          onClick={onApply} 
          title="Apply filters"
          className="rounded-full bg-brandDark text-white p-2.5 hover:bg-black transition flex items-center justify-center shadow-sm"
        >
          <FiFilter size={18} />
        </button>
        <button 
          onClick={onClear} 
          title="Clear all filters"
          className="rounded-full border border-gray-300 p-2.5 hover:bg-gray-100 transition flex items-center justify-center shadow-sm"
        >
          <FiRotateCcw size={18} />
        </button>
      </motion.div>
    </>
  );
};

export default MonitoringPageHeader;
