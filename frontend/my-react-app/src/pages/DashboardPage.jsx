import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboardMetrics } from "../api/metricsApi";
import { useAuth } from "../context/AuthContext";

const modules = [
  { key: "risks", label: "Risks" },
  { key: "issues", label: "Issues" },
  { key: "actions", label: "Actions" },
  { key: "dependencies", label: "Dependencies" },
  { key: "escalations", label: "Escalations" },
  { key: "appreciations", label: "Appreciations" },
  { key: "collections", label: "Collections" },
];

function DashboardPage() {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, logout } = useAuth();
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

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Engagement Dashboard</h1>
        <div>
          <span>{user?.name} ({user?.role})</span>
          <button onClick={() => { logout(); navigate("/login"); }}>Logout</button>
        </div>
      </div>

      <div className="cards-grid">
        {modules.map((m) => {
          const mData = metrics[m.key] || {};
          return (
            <div key={m.key} className="dashboard-card">
              <h2>{m.label}</h2>
              <p>Total: {mData.total ?? "-"}</p>
              {mData.open != null && <p>Open: {mData.open}</p>}
              {m.key === "actions" && mData.overdue != null && (
                <p>Overdue: {mData.overdue}</p>
              )}
              {m.key === "collections" && mData.pending != null && (
                <p>Pending: {mData.pending}</p>
              )}
              <div className="card-actions">
                <button onClick={() => navigate(`/modules/${m.key}?mode=view`)}>
                  View
                </button>
                {(user?.role === "BM" || user?.role === "PM") && (
                  <button onClick={() => navigate(`/modules/${m.key}?mode=edit`)}>
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
