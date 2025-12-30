// sweep ease-in-out
import React from "react";
import { motion } from "framer-motion";

const GaugeChart = ({ value }) => {
  const sweep = (value / 100) * 180;

  return (
    <div style={{ width: 260, height: 140, position: "relative", overflow: "hidden" }}>
      <motion.div
        initial={{ rotate: -90 }}
        animate={{ rotate: sweep - 90 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
        style={{
          width: "100%",
          height: "200px",
          borderRadius: "1000px 1000px 0 0",
          background: `conic-gradient(#2A9D8F ${sweep}deg, #eaeaea 0deg)`
        }}
      />
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        textAlign: "center",
        fontFamily: "Montserrat",
        fontSize: "1.4rem",
        fontWeight: 600
      }}>
        {value}% Completed
      </div>
    </div>
  );
};

export default GaugeChart;
