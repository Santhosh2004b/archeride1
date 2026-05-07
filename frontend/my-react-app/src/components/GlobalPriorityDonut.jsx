import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { fetchPrioritySplit } from "../api/metricsApi";

const COLORS = {
    Critical: "#DC2626",
    High: "#EA580C",
    Medium: "#D97706",
    Low: "#059669",
    Normal: "#2563EB",
    "Very High": "#991B1B",
};
const DEFAULT_COLOR = "#94A3B8";

const getColor = (priority) => {
    if (!priority) return DEFAULT_COLOR;
    if (COLORS[priority]) return COLORS[priority];
    const formatted = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
    return COLORS[formatted] || DEFAULT_COLOR;
};

const GlobalPriorityDonut = ({ onPrioritySelect, selectedPriority, data: externalData }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hovered, setHovered] = useState(null);

    useEffect(() => {
        if (externalData && externalData.length > 0) {
            setData(externalData);
            return;
        }

        const load = async () => {
            setLoading(true);
            try {
                const res = await fetchPrioritySplit('all');
                if (res?.success) {
                    setData(res.data || []);
                } else {
                    setData([]);
                }
            } catch (err) {
                console.error("Split Load Error:", err);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [externalData]);

    const chartData = data.filter(d => d.count > 0).sort((a, b) => b.count - a.count);
    const totalCount = chartData.reduce((acc, curr) => acc + curr.count, 0);

    const activeLabel = hovered || selectedPriority || "Total Items";
    let activeCount = totalCount;
    if (activeLabel !== "Total Items") {
        const item = chartData.find(d => d.priority === activeLabel);
        activeCount = item ? item.count : 0;
    }

    const handleSliceClick = (entry) => {
        if (onPrioritySelect) {
            if (selectedPriority === entry.priority) {
                onPrioritySelect(null);
            } else {
                onPrioritySelect(entry.priority);
            }
        }
    };

    return (
        <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100 flex flex-col h-full overflow-hidden transition-all duration-500 hover:shadow-brandDark/5">
            <div className="flex-1 flex flex-row items-center justify-between gap-10">
                {loading ? (
                    <div className="w-full flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-brandDark border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] text-gray-400 font-urbanist font-black tracking-[0.3em] animate-pulse">CALIBRATING...</span>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center text-center opacity-40">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                            <span className="text-2xl">📊</span>
                        </div>
                        <span className="text-sm font-bold text-gray-700">NO PRIORITY DATA</span>
                    </div>
                ) : (
                    <>
                        {/* Donut Chart Portion - Compact and Pro */}
                        <div className="w-[40%] h-[240px] relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        cornerRadius={8}
                                        dataKey="count"
                                        nameKey="priority"
                                        stroke="none"
                                        onMouseEnter={(data) => setHovered(data.priority)}
                                        onMouseLeave={() => setHovered(null)}
                                        onClick={handleSliceClick}
                                        isAnimationActive={true}
                                        animationDuration={1000}
                                        animationBegin={0}
                                    >
                                        {chartData.map((entry, index) => {
                                            const isSelected = selectedPriority === entry.priority;
                                            const isDimmed = selectedPriority && !isSelected;
                                            return (
                                                <Cell
                                                    key={'cell-' + index}
                                                    fill={getColor(entry.priority)}
                                                    style={{
                                                        opacity: isDimmed ? 0.2 : 1,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        filter: isSelected ? 'drop-shadow(0px 10px 20px rgba(0,0,0,0.15))' : 'none'
                                                    }}
                                                />
                                            );
                                        })}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            
                            {/* Center Label - Pro Styling */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeLabel + activeCount}
                                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                        className="text-center"
                                    >
                                        <span className="block text-4xl font-black font-montserrat text-gray-900 leading-none tracking-tight">
                                            {activeCount}
                                        </span>
                                        <span className="text-[9px] text-gray-400 uppercase tracking-[0.4em] font-black block mt-2">
                                            {activeLabel}
                                        </span>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Legend Portion - Pro Grid */}
                        <div className="w-[60%] grid grid-cols-1 gap-3 pr-4">
                            {chartData.map((item, idx) => {
                                const isSelected = selectedPriority === item.priority;
                                const share = Math.round((item.count / totalCount) * 100);
                                return (
                                    <div
                                        key={idx}
                                        className={`flex items-center justify-between py-2.5 px-4 rounded-2xl cursor-pointer transition-all duration-300 ${isSelected ? "bg-gray-50 shadow-md ring-1 ring-gray-200 scale-105" : "hover:bg-gray-50/70"}`}
                                        onClick={() => handleSliceClick(item)}
                                    >
                                        <div className="flex items-center min-w-0">
                                            <div className="relative mr-4 flex-shrink-0">
                                                <span
                                                    className="block w-2.5 h-2.5 rounded-full shadow-lg"
                                                    style={{ backgroundColor: getColor(item.priority) }}
                                                ></span>
                                                {isSelected && <motion.span layoutId="glow" className="absolute inset-0 rounded-full blur-[6px]" style={{ backgroundColor: getColor(item.priority) }} />}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${isSelected ? "text-gray-900" : "text-gray-400"}`}>
                                                    {item.priority}
                                                </span>
                                                <span className="text-[8px] font-bold text-gray-300 mt-1 uppercase tracking-tighter">
                                                    {share}% Distribution
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-black ${isSelected ? "text-brandDark" : "text-gray-400"}`}>
                                            {item.count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50 flex justify-center">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Urgent</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Stable</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalPriorityDonut;
