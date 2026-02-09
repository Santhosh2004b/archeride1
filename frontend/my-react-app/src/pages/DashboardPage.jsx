import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Warning,
  ArrowClockwise,
  ShieldCheck,
  TrendUp,
  Heart,
  Stack,
  ArrowRight
} from "phosphor-react";
import { fetchDashboardMetrics } from "../api/metricsApi";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout";

const modules = [
  { key: "risks", label: "Risks", icon: ShieldCheck, color: "var(--status-risk)" },
  { key: "issues", label: "Issues", icon: Warning, color: "var(--status-issue)" },
  { key: "actions", label: "Actions", icon: ArrowClockwise, color: "var(--status-action)" },
  { key: "dependencies", label: "Dependencies", icon: Stack, color: "var(--status-dependency)" },
  { key: "escalations", label: "Escalations", icon: TrendUp, color: "var(--status-escalation)" },
  { key: "appreciations", label: "Appreciations", icon: Heart, color: "var(--status-appreciation)" },
];

function DashboardPage() {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl font-medium text-gray-400 animate-pulse">Initializing Governance Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-marcellus font-bold mb-6 text-gray-900">Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((m) => {
          const mData = metrics[m.key] || { total: 0, open: 0 };
          return (
            <div key={m.key} className="p-4 bg-white rounded shadow border">
              <h2 className="text-lg font-semibold mb-2">{m.label}</h2>
              <div className="flex justify-between text-sm">
                <span>Total: {mData.total ?? 0}</span>
                <span className="text-orange-600">Open: {mData.open ?? 0}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate(`/modules/${m.key}?mode=view`)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                >
                  View
                </button>
                {(user?.role === "BM" || user?.role === "PM") && (
                  <button
                    onClick={() => navigate(`/modules/${m.key}?mode=edit`)}
                    className="px-3 py-1 border rounded text-xs"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardPage;
