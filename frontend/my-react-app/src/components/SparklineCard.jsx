// sparkline — peak pulse highlight
import React from "react";
import {
    LineChart, Line, ResponsiveContainer, Tooltip, YAxis, XAxis,
} from "recharts";
import { motion } from "framer-motion";

const SparklineCard = ({ title, data = [], color }) => {
    const maxVal = Math.max(...data.map(d => d.value));
    return (
        <motion.div
            whileHover={{ y: -2, boxShadow: "0 12px 28px rgba(0,0,0,0.14)" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
                flex: 1,
                padding: "16px 18px",
                borderRadius: 12,
                background: "#fff",
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                minHeight: 120
            }}
        >
            <h4 style={{ marginBottom: 8, fontFamily: "Montserrat" }}>{title}</h4>
            <div style={{ width: "100%", height: 60 }}>
                <ResponsiveContainer>
                    <LineChart data={data}>
                        {/* Sparkline line component */}
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            dot={false}                    // ⬅️ no dot objects here
                            activeDot={({ cx, cy, payload }) =>
                                payload.value === maxVal ? (
                                    <circle cx={cx} cy={cy} r={6} fill={color} />
                                ) : null
                            }
                            isAnimationActive={true}
                            animationDuration={1200}
                        />

                        <Tooltip cursor={false} />
                        <YAxis hide />
                        <XAxis hide />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default SparklineCard;
