import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    AreaChart, Area,
    ComposedChart, Line
} from 'recharts';

// --- VISUALIZATION COMPONENTS ---

// 1. Activity Trend (Bar)
const ActivityTrend = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

// 2. Module Overview (Table)
const ModuleOverview = ({ data }) => {
    return (
        <div className="overflow-x-auto h-full">
            <table className="min-w-full text-left text-xs">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className="pb-2 font-semibold text-gray-500">Module</th>
                        <th className="pb-2 font-semibold text-gray-500 text-right">Open</th>
                        <th className="pb-2 font-semibold text-gray-500 text-right">Closed</th>
                        <th className="pb-2 font-semibold text-gray-500 text-right">Rate</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => {
                        const total = (Number(row.Open) || 0) + (Number(row.Resolved) || 0) + (Number(row.Cancelled) || 0);
                        const rate = total > 0 ? Math.round((Number(row.Resolved) / total) * 100) : 0;
                        return (
                            <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                <td className="py-2 text-gray-800 font-medium">{row.module}</td>
                                <td className="py-2 text-right text-gray-600">{row.Open}</td>
                                <td className="py-2 text-right text-gray-600">{row.Resolved}</td>
                                <td className="py-2 text-right">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${rate >= 70 ? 'bg-green-100 text-green-700' : rate >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                        {rate}%
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// 3. Top Listings (List)
const RankingOverview = ({ items }) => {
    return (
        <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
            {items.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-[10px] font-bold text-gray-500">
                            {i + 1}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-800 truncate w-32">{item.account || "Unknown Account"}</span>
                            <span className="text-[10px] text-gray-500 truncate w-32">{item.risk_title || item.issue_title || "Item"}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-[10px] font-bold px-2 py-1 rounded ${item.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {item.priority}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// 4. Resolution Efficiency Matrix (Combo Chart)
const ResolutionMatrix = ({ created, closed, matrixYear, setMatrixYear, availableYears }) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Merge data
    const data = months.map((m, i) => {
        const c = created[i]?.value || 0; // New Items (Grey)
        const r = closed[i]?.value || 0;  // Resolved Items (Dark)

        // Safety: Avoid divide by zero
        // Efficiency = Resolved / Created (Input vs Output)
        // If Created is 0, Efficiency is 100% if Resolved > 0, else 0? 
        // Or strictly Resolved / Created. Screenshot implies "Margin".
        // Let's do (Resolved / Created * 100) or just raw % if they are comparable.
        // Actually SCREENSHOT has "Net Profit" (Bar) vs "Break-Even" (Grey Bar).
        // Dark Bar = Resolved. Grey Bar = Created.
        // Yellow Line = % Rate (Resolved / Created * 100).

        let rate = 0;
        if (c > 0) rate = Math.round((r / c) * 100);
        else if (r > 0) rate = 100; // Cleared backlog?

        return {
            name: m,
            created: c,
            resolved: r,
            rate: rate
        };
    });

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex justify-end mb-2">
                <select
                    value={matrixYear}
                    onChange={(e) => setMatrixYear(Number(e.target.value))}
                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50 text-gray-600 outline-none focus:border-blue-500"
                >
                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#F59E0B' }} unit="%" />
                        <RechartsTooltip
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            labelStyle={{ color: '#374151', fontWeight: 600 }}
                        />
                        {/* Grey Bar = Created (Input) behind */}
                        <Bar yAxisId="left" dataKey="created" name="New Items" fill="#E5E7EB" barSize={20} radius={[4, 4, 0, 0]} />
                        {/* Dark Bar = Resolved (Output) front - slightly offset or stacked? Screenshot has them separate or overlaid. 
                            Let's overlay nicely by putting created first. */}
                        <Bar yAxisId="left" dataKey="resolved" name="Resolved" fill="#1E293B" barSize={12} radius={[4, 4, 0, 0]} />

                        {/* Line = Efficiency */}
                        <Line yAxisId="right" type="monotone" dataKey="rate" name="Efficiency" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B' }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// 6. Closure Velocity (Area) - Widget integrated directly, component removed

// Internal Card Component
const Card = ({ title, colSpan = "", children, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.08)] p-5 flex flex-col ${colSpan} ${className}`}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-800 font-bold text-sm uppercase tracking-wide">{title}</h3>
            <div className="h-1 w-8 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-64 relative">
            {children}
        </div>
    </div>
);

export default function SystemAnalytics({ kpis, feeds, moduleStatus, trendRisks, trendCreated, trendClosed, matrixYear, setMatrixYear, availableYears }) {


    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {/* ROW 1 */}
            <Card title="Engagement Trend">
                <ActivityTrend data={trendRisks || []} />
            </Card>

            <Card title="Module Performance">
                <ModuleOverview data={moduleStatus || []} />
            </Card>

            <Card title="Critical Accounts">
                {/* Combine Top Risks/Issues for ranking */}
                <RankingOverview items={[...(feeds.risks || []), ...(feeds.issues || [])]} />
            </Card>

            {/* ROW 2 */}
            {/* NEW Resolution Performance Matrix taking 2 columns */}
            <Card title="Resolution Performance Matrix" colSpan="md:col-span-2">
                <ResolutionMatrix
                    created={trendCreated || []}
                    closed={trendClosed || []}
                    matrixYear={matrixYear}
                    setMatrixYear={setMatrixYear}
                    availableYears={availableYears || []}
                />
            </Card>

            <Card title="Closure Velocity">
                <ClosureVelocityWidget data={kpis?.trend_closed || []} total={kpis?.totalClosed} />
            </Card>
        </section>
    );
}

// Separate component for the richer widget
const ClosureVelocityWidget = ({ data, total }) => {
    // Calculate growth (last month vs previous)
    // Assuming data is 12 months ordered Jan-Dec
    // Just take the last non-zero or just the current vs prev for simplicity?
    // Let's use the last two available data points for trend.
    const lastVal = data[data.length - 1]?.value || 0;
    const prevVal = data[data.length - 2]?.value || 0;
    const growth = prevVal > 0 ? Math.round(((lastVal - prevVal) / prevVal) * 100) : 0;
    const isPositive = growth >= 0;

    return (
        <div className="h-full flex flex-col justify-between relative overflow-hidden">
            {/* Stats Header */}
            <div className="flex justify-between items-start z-10">
                <div>
                    <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">{total}</h2>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Items Resolved</p>
                </div>
                <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-bold ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span>{isPositive ? '+' : ''}{growth}%</span>
                    <span className="ml-1 text-[10px] opacity-75">vs prev</span>
                </div>
            </div>

            {/* Chart Background */}
            <div className="absolute bottom-0 left-0 right-0 h-32 w-full z-0 opacity-90">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <RechartsTooltip
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                            itemStyle={{ color: '#6D28D9', fontWeight: 600 }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={3} fill="url(#colorVelocity)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Decorative "Avg" Line or similar if needed, sticking to clean for now */}
        </div>
    );
}
