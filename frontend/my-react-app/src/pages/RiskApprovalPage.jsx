import React, { useState } from "react";
import { formatDisplayDate } from "../utils/dateFormat";

// Mock data as this is a UI-only implementation for now
const MOCK_APPROVALS = [
    {
        id: "RSK-2025-001",
        project_name: "Project Alpha",
        title: "Resource Shortage",
        priority: "High",
        status_before: "Open",
        status_after: "In Progress",
        updated_at: "2025-12-30T10:00:00Z",
        description: "Critical shortage of backend developers for the upcoming sprint.",
    },
    {
        id: "RSK-2025-002",
        project_name: "Project Beta",
        title: "API Latency",
        priority: "Medium",
        status_before: "In Progress",
        status_after: "Resolved",
        updated_at: "2025-12-29T14:30:00Z",
        description: "Latency issues observed in the payment gateway integration.",
    },
    {
        id: "RSK-2025-003",
        project_name: "Project Gamma",
        title: "Third-party Deprecation",
        priority: "Critical",
        status_before: "Evaluated",
        status_after: "Mitigated",
        updated_at: "2025-12-28T09:15:00Z",
        description: "Vendor API v1 is deprecated, need to migrate to v2 immediately.",
    },
    {
        id: "RSK-2025-004",
        project_name: "Phoenix Revamp",
        title: "Budget Overflow",
        priority: "High",
        status_before: "Identified",
        status_after: "Canceled",
        updated_at: "2025-12-27T11:45:00Z",
        description: "Initial budget estimates exceeded by 15% due to licensing costs.",
    },
    {
        id: "RSK-2025-005",
        project_name: "Mobile App V2",
        title: "Build Failure",
        priority: "Low",
        status_before: "Open",
        status_after: "On Hold",
        updated_at: "2025-12-26T16:20:00Z",
        description: "CI/CD pipeline failing intermittently on iOS builds.",
    },
];

const RiskApprovalPage = () => {
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <div className="mb-8">
                <h1 className="text-3xl font-montserrat font-medium text-gray-900">Risk Approval Inbox</h1>
                <p className="text-sm text-gray-500 mt-1 font-urbanist">
                    Review pending status changes and updates.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_APPROVALS.map((item) => (
                    <div
                        key={item.id}
                        className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${expandedId === item.id ? "ring-2 ring-blue-500 shadow-md transform scale-[1.01]" : "hover:shadow-md"
                            }`}
                    >
                        {/* Header / Summary Card */}
                        <div
                            className="p-5 cursor-pointer"
                            onClick={() => toggleExpand(item.id)}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                    {item.project_name}
                                </span>
                                <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.priority === "Critical" || item.priority === "High"
                                            ? "bg-red-100 text-red-600"
                                            : "bg-blue-50 text-blue-600"
                                        }`}
                                >
                                    {item.priority}
                                </span>
                            </div>

                            <h3 className="font-montserrat font-bold text-lg text-gray-900 mb-1">
                                {item.id}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-1">{item.title}</p>

                            <div className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-gray-400 mb-1 text-[10px] uppercase">Status Change</span>
                                    <div className="flex items-center gap-2 font-medium">
                                        <span className="line-through text-gray-400">{item.status_before}</span>
                                        <span className="text-gray-300">→</span>
                                        <span className="text-blue-600">{item.status_after}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-gray-400 mb-1 text-[10px] uppercase">Updated</span>
                                    <span className="text-gray-700">{formatDisplayDate(item.updated_at)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Details Section */}
                        {expandedId === item.id && (
                            <div className="px-5 pb-5 pt-0 animate-fadeIn">
                                <div className="border-t border-gray-100 my-3"></div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Description</h4>
                                <p className="text-sm text-gray-700 leading-relaxed mb-6">
                                    {item.description}
                                </p>

                                <div className="flex gap-3">
                                    <button className="flex-1 py-2 bg-black text-white text-xs font-bold uppercase rounded hover:bg-gray-800 transition-colors">
                                        Approve & Close
                                    </button>
                                    <button className="flex-1 py-2 border border-gray-300 text-gray-700 text-xs font-bold uppercase rounded hover:bg-gray-50 transition-colors">
                                        Keep Open
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RiskApprovalPage;
