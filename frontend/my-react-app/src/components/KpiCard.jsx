// filepath: src/components/KpiCard.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChartLineUp, WarningCircle, CheckCircle, ClipboardText } from "phosphor-react";

const iconMap = {
  "Total Open": <WarningCircle size={24} color="#D64550" weight="duotone" />,
  "In Progress": <ChartLineUp size={24} color="#E7A725" weight="duotone" />,
  "Closed": <CheckCircle size={24} color="#1EA896" weight="duotone" />,
  "Total Items": <ClipboardText size={24} color="#517493" weight="duotone" />,
};

// overlay color tint based on metric
const insightMap = {
  "Total Open": "Critical attention required for new items.",
  "In Progress": "Active workflows are tracking steadily.",
  "Closed": "Completion rate is optimal.",
  "Total Items": "Overall volume is trending upward.",
  "On Hold": "Pending external validation or inputs."
};

export default function KpiCard({ title, value }) {
  const [display, setDisplay] = useState(0);
  const aiText = insightMap[title] || "AI: Data analysis in progress...";

  // smooth count-up
  useEffect(() => {
    let current = 0;
    const tick = () => {
      current += Math.ceil(value / 45); // naive increment
      if (current >= value) current = value;
      setDisplay(current);
      if (current < value) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <motion.div

      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "22px 24px",
        border: "1px solid #E1E6EB",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* overlay breakdown */}


      {/* icon + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {iconMap[title]}
        <span style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 15, color: "#0B2341" }}>
          {title}
        </span>
      </div>

      {/* animated count */}
      <motion.span
        key={display}
        initial={{ scale: 0.95, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          fontSize: 42,
          fontFamily: "Montserrat",
          fontWeight: 700,
          color: "#0B2341",
          lineHeight: 1,
        }}
      >
        {display}
      </motion.span>

      {/* underline */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: value > 0 ? "45%" : "28%" }}
        transition={{ duration: 0.6 }}
        style={{
          height: 3,
          borderRadius: 3,
          background:
            value === 0
              ? "#8D99AE"
              : title === "Closed"
                ? "#1EA896"
                : title === "In Progress"
                  ? "#E7A725"
                  : "#D64550",
        }}
      />

      {/* AI micro-copy */}
      <motion.span
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        style={{
          fontSize: 13,
          color: "#517493",
          fontFamily: "Urbanist",
          minHeight: 18,
          display: "block"
        }}
      >
        {aiText}
      </motion.span>
    </motion.div>
  );
}
