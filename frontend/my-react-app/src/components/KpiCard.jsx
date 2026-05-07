import React, { useEffect, useRef } from "react";
import { motion, animate } from "framer-motion";
import { WarningCircle, CheckCircle, ShieldCheck, XCircle, ClipboardText } from "phosphor-react";

const iconMap = {
  "Open": <WarningCircle size={28} className="text-red-500" weight="duotone" />,
  "Resolved": <CheckCircle size={28} className="text-emerald-500" weight="duotone" />,
  "Approved": <ShieldCheck size={28} className="text-green-500" weight="duotone" />,
  "Cancelled": <XCircle size={28} className="text-gray-400" weight="duotone" />,
};

const insightMap = {
  "Open": "Critical attention required for new items.",
  "Resolved": "Issues resolved, pending approval.",
  "Approved": "Verified and officially closed.",
  "Cancelled": "Items cancelled or discarded.",
};

const colorMap = {
    "Open": "bg-red-500",
    "Resolved": "bg-emerald-500",
    "Approved": "bg-green-500",
    "Cancelled": "bg-gray-400"
};

export default function KpiCard({ title, value, delay = 0 }) {
  const nodeRef = useRef(null);
  const aiText = insightMap[title] || "AI: Data analysis in progress...";

  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      const controls = animate(0, value, {
        duration: 1.5,
        delay: delay,
        ease: "easeOut",
        onUpdate(v) {
          node.textContent = Math.round(v);
        }
      });
      return () => controls.stop();
    }
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg flex flex-col items-start gap-4 cursor-pointer relative overflow-hidden group h-full"
    >
      {/* Background Glow */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Icon & Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
          {iconMap[title] || <ClipboardText size={28} className="text-blue-500" weight="duotone" />}
        </div>
        <span className="text-base font-marcellus font-bold text-gray-800">
          {title}
        </span>
      </div>

      {/* Number */}
      <div className="flex flex-col">
        <span
            ref={nodeRef}
            className="text-4xl font-black font-montserrat text-gray-900 leading-none tracking-tighter"
        >
            0
        </span>
        
        {/* Progress Bar */}
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: "40%" }}
            transition={{ duration: 1, delay: delay + 0.5 }}
            className={`h-1 rounded-full mt-4 ${colorMap[title] || "bg-blue-500"}`}
        />
      </div>

      {/* Insight Text */}
      <p className="text-xs font-urbanist font-medium text-gray-400 leading-relaxed mt-2 line-clamp-2">
        {aiText}
      </p>
    </motion.div>
  );
}
