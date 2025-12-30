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
const tintMap = {
  "Total Open": "rgba(214,69,80,0.18)",
  "In Progress": "rgba(231,167,37,0.18)",
  "Closed": "rgba(30,168,150,0.18)",
  "Total Items": "rgba(81,116,147,0.18)",
};

// demo static table values (replace with API later)
const sampleBreakdown = [
  { label: "Critical", count: 9, color: "#E63946" },
  { label: "High", count: 8, color: "#FB8500" },
  { label: "Low", count: 3, color: "#FFCA3A" },
  { label: "Medium", count: 2, color: "#2A9D8F" },
];

export default function KpiCard({ title, value }) {
  const [display, setDisplay] = useState(0);
  const [aiText, setAiText] = useState("");

  // AI micro-copy typing
  useEffect(() => {
    const full =
      value === 0
        ? "AI: stable — no active shifts."
        : "AI: momentum rising — monitor transitions.";
    let i = 0;
    const write = () => {
      setAiText(full.slice(0, i));
      i++;
      if (i <= full.length) requestAnimationFrame(write);
    };
    write();
  }, [value]);

  // smooth count-up
  useEffect(() => {
    let current = 0;
    const tick = () => {
      current += Math.ceil(value / 45);
      if (current >= value) current = value;
      setDisplay(current);
      if (current < value) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <motion.div
      
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.26, 0.08, 0.25, 1] }}
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
        initial={{ scale: 0.9, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45 }}
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
      <span
        style={{
          fontSize: 13,
          color: "#517493",
          fontFamily: "Urbanist",
          minHeight: 18,
        }}
      >
        {aiText}
      </span>
    </motion.div>
  );
}
