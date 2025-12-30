// filepath: src/components/PieChart.jsx
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#E63946", "#FB8500", "#FFCA3A", "#2A9D8F"];

export default function RiskPie({ data = [] }) {
  const total = data.reduce((a, b) => a + Number(b.value), 0);

  // 🔥 display values animate on hover
  const [hoverIndex, setHoverIndex] = useState(null);
  const [displayVal, setDisplayVal] = useState(0);

  // animate the hovered slice count
  useEffect(() => {
    if (hoverIndex === null) return;
    let start = 0;
    const target = Number(data[hoverIndex].value);
    const step = () => {
      start += Math.ceil(target / 30);
      if (start >= target) start = target;
      setDisplayVal(start);
      if (start < target) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [hoverIndex, data]);

  // main decorated version (percent + label)
  const decorated = data.map((d) => ({
    ...d,
    percent: total ? ((d.value / total) * 100).toFixed(1) : 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      style={{
        position: "relative",
        width: 370,
        height: 330,
        paddingTop: 10,
      }}
    >
      <PieChart width={370} height={330}>
        <Pie
          data={decorated}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={105}
          innerRadius={60}
          paddingAngle={3}
          onMouseLeave={() => {
            setHoverIndex(null);
            setDisplayVal(0);
          }}
        >
          {decorated.map((entry, i) => (
            <motion.g
              key={i}
              onMouseEnter={() => setHoverIndex(i)}
              animate={{ scale: hoverIndex === i ? 1.1 : 1 }}
              transition={{ duration: 0.4 }}
            >
              <Cell fill={COLORS[i % COLORS.length]} />
            </motion.g>
          ))}
        </Pie>
      </PieChart>

      {/* 🧠 Center information */}
      <motion.div
        key={hoverIndex}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "Montserrat",
          fontWeight: 700,
          textAlign: "center",
          pointerEvents: "none",
          color: "#0B2341",
        }}
      >
        {hoverIndex === null ? (
          <>
            <motion.div style={{ fontSize: 28 }}>{total}</motion.div>
            <motion.div style={{ fontSize: 14, opacity: 0.6 }}>
              total items
            </motion.div>
          </>
        ) : (
          <>
            <motion.div style={{ fontSize: 28 }}>{displayVal}</motion.div>
            <motion.div style={{ fontSize: 14, opacity: 0.6 }}>
              of {total}
            </motion.div>
          </>
        )}
      </motion.div>

      {/* 📌 persistent labels beside donut */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "102%",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          fontFamily: "Urbanist",
          fontSize: 15,
        }}
      >
        {decorated.map((d, i) => (
          <motion.div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: hoverIndex === i ? 700 : 500,
              color: hoverIndex === i ? "#0B2341" : "#4A5568",
            }}
            animate={{ x: hoverIndex === i ? 6 : 0 }}
          >
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: "50%",
                background: COLORS[i % COLORS.length],
              }}
            />
            {d.name} — {d.value}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
