// src/pages/ActionsPage.jsx
import React, { useEffect, useState } from "react";
import { fetchActions } from "../api/actionsApi";

function ActionsPage() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [mode, setMode] = useState("view");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchActions();
        setActions(res.data || []);
      } catch (err) {
        setError(err.message || "Failed to load actions");
      } finally {
        setLoading(false);
      }
    }
    load();
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    const idParam = params.get("id");
    setMode(modeParam || "view");
    setEditId(idParam);
  }, []);

  if (loading) return <div>Loading actions...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 text-brandDark px-4 sm:px-6 py-4 relative">
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-2 rounded-full shadow-lg animate-fade-in">
          Saved Successfully
        </div>
      )}
      <h1 className="font-marcellus text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Actions</h1>
      {mode === "view" && (
        <>
          <div className="mb-2 text-xs text-gray-500">To update this record, click Edit</div>
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-auto">
              <table className="min-w-full text-left text-xs sm:text-sm font-urbanist">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-semibold text-brandMuted uppercase tracking-wide whitespace-nowrap">Edit</th>
                    <th className="px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-semibold text-brandMuted uppercase tracking-wide whitespace-nowrap">Action ID</th>
                    <th className="px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-semibold text-brandMuted uppercase tracking-wide whitespace-nowrap">Project</th>
                    <th className="px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-semibold text-brandMuted uppercase tracking-wide whitespace-nowrap">Status</th>
                    <th className="px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-semibold text-brandMuted uppercase tracking-wide whitespace-nowrap">Priority</th>
                    <th className="px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-semibold text-brandMuted uppercase tracking-wide whitespace-nowrap">Title</th>
                    <th className="px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-semibold text-brandMuted uppercase tracking-wide whitespace-nowrap">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map((a) => (
                    <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                      <td className="px-3 sm:px-4 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = `${window.location.pathname}?mode=edit&id=${a.id}`;
                          }}
                          className="inline-flex items-center justify-center rounded-full border border-brandDark/20 px-3 py-1 text-[11px] font-urbanist text-brandDark hover:bg-brandDark hover:text-white transition"
                        >
                          Edit
                        </button>
                      </td>
                      <td className="px-3 sm:px-4 py-2 text-[11px] sm:text-sm whitespace-nowrap">{a.action_id}</td>
                      <td className="px-3 sm:px-4 py-2 text-[11px] sm:text-sm whitespace-nowrap">{a.project_name}</td>
                      <td className="px-3 sm:px-4 py-2 text-[11px] sm:text-sm whitespace-nowrap">{a.status}</td>
                      <td className="px-3 sm:px-4 py-2 text-[11px] sm:text-sm whitespace-nowrap">{a.priority}</td>
                      <td className="px-3 sm:px-4 py-2 text-[11px] sm:text-sm whitespace-nowrap">{a.action_title}</td>
                      <td className="px-3 sm:px-4 py-2 text-[11px] sm:text-sm whitespace-nowrap">{a.due_date}</td>
                    </tr>
                  ))}
                  {actions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 sm:px-4 py-4 text-center text-xs sm:text-sm text-brandMuted">
                        No actions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {mode === "edit" && editId && (
        <div className="mt-4 rounded-xl bg-white border border-gray-200 shadow-sm p-5">
          <h3 className="font-urbanist font-semibold text-sm mb-4">Edit Action</h3>
          {/* ...form fields here... */}
          <button
            className="mt-4 bg-brandDark text-white px-6 py-2 rounded-full"
            onClick={() => {
              setShowToast(true);
              setTimeout(() => setShowToast(false), 2000);
              window.location.href = `${window.location.pathname}?mode=view`;
            }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}

export default ActionsPage;
