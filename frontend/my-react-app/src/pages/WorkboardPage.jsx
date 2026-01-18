import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDisplayDate, formatDateOnly } from "../utils/dateFormat";
import useMonitoringExport from "../hooks/useMonitoringExport";
import { searchProjects } from "../api/projectsApi";

import EscalationResolutionModal from "../components/EscalationResolutionModal";
import LayoutBuilder from "../components/LayoutBuilder";
import { getLayoutApi, saveLayoutApi } from "../api/layoutApi";
import { Pen, SlidersHorizontal } from "phosphor-react";
import SuccessNotification from "../components/SuccessNotification";

const toDateInputValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toYYYYMMDD = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

// Status classes map for row coloring
const getStatusRowClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "open" || s === "identified") return "status-open";
  if (s === "On Hold" || s === "On Hold" || s === "on hold") return "status-onhold";
  if (s === "resolved" || s === "completed") return "status-resolved";
  if (s === "approved" || s === "approved & closed") return "status-approved";
  if (s === "cancelled" || s === "rejected") return "status-cancelled";
  if (s === "in progress") return "status-inprogress";
  return "";
};

const WorkboardPage = ({
  title,
  moduleKey,
  mode,
  fetchList,
  fetchItem,
  createItem,
  updateItem,
  formConfig,
}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useMonitoringExport(moduleKey, rows);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [projectSearch, setProjectSearch] = useState("");
  const [projectResults, setProjectResults] = useState([]);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Layout Builder State
  const [layoutFields, setLayoutFields] = useState([]);
  const [showLayoutBuilder, setShowLayoutBuilder] = useState(false);
  const [userRole, setUserRole] = useState("USER"); // Default

  useEffect(() => {
    const stored = localStorage.getItem("archeride_auth");
    if (stored) {
      const { user } = JSON.parse(stored);
      setUserRole(user?.role || "USER");
    }
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  // Extract ID from URL for direct loading
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get("id");

  // useMemo to prevent fields array from forcing re-renders
  // Initialize fields from config, but override with server layout if available
  useEffect(() => {
    const initLayout = async () => {
      const serverLayout = await getLayoutApi(moduleKey);
      if (serverLayout && Array.isArray(serverLayout) && serverLayout.length > 0) {
        // Merge/Mapping logic: ensure all required fields from config still exist or handled
        // For simplicity, we trust serverLayout but we should probably merge to update labels if hardcode changed
        // But for now, let's just use serverLayout as primary source if exists.
        // However, to keep it robust:

        // If server layout misses new hardcoded fields, we might want to append them?
        // Lets strictly use serverLayout if available for order/visibility.
        // We need to hydrate functions if any? No functions in config usually.
        setLayoutFields(serverLayout);
      } else {
        setLayoutFields(formConfig?.fields || []);
      }
    };
    initLayout();
  }, [moduleKey, formConfig]);

  // Use layoutFields for rendering instead of memoized fields
  const activeFields = React.useMemo(() => layoutFields.filter(f => !f.hidden), [layoutFields]);

  const handleEditState = React.useCallback(
    (row) => {
      setEditingId(
        row.id ||
        row.issue_id ||
        row.risk_id ||
        row.escalation_id ||
        row.action_id ||
        row.dependency_id ||
        row.appreciation_id ||
        row.collection_id
      );
      const mapped = { ...row };
      layoutFields
        .filter((f) => f.type === "date")
        .forEach((f) => {
          mapped[f.name] = toDateInputValue(row[f.name]);
        });
      setFormData(mapped);
      setProjectSearch(row.project_name || "");
      setProjectResults([]);
    },
    [layoutFields]
  );

  const handleNew = () => {
    setEditingId(null);
    const initial = {};
    activeFields.forEach((f) => (initial[f.name] = ""));
    setFormData(initial);
    setFormData(initial);
    // Project search state cleared
    // navigate...
    // Use navigate instead of window.location
    navigate(`${location.pathname}?mode=edit`);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { ...formData };
      layoutFields
        .filter((f) => f.type === "date")
        .forEach((f) => {
          payload[f.name] = payload[f.name] ? toYYYYMMDD(payload[f.name]) : null;
        });

      if (editingId) {
        await updateItem(editingId, payload);
      } else {
        await createItem(payload);
      }

      setEditingId(null);
      setFormData({});

      // Reload data to ensure new record appears in list
      await loadData();

      // Trigger Success Notification
      setShowSuccessNotification(true);

      // Navigate back to view mode. The useEffect on editId=null will trigger loadData()
      navigate(`${location.pathname}?mode=view`);
    } catch (err) {
      console.error("Save error:", err);
      // Surface actual error message if available
      const errMsg = err.message || "Failed to save record. Please check inputs.";
      alert(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);

      // Load list (role-based)
      const res = await fetchList({});
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      setRows(list);

      // Load edit record directly by ID (NOT role-filtered)
      if (editId) {
        let found = null;
        if (fetchItem) {
          try {
            const itemRes = await fetchItem(editId);
            found = itemRes?.data || itemRes;
          } catch (err) {
            console.warn("Failed to fetch item by ID directly:", err);
          }
        }

        if (!found) {
          found = list.find(
            (r) =>
              String(
                r.id ||
                r.issue_id ||
                r.risk_id ||
                r.action_id ||
                r.dependency_id ||
                r.escalation_id ||
                r.appreciation_id ||
                r.collection_id
              ) === String(editId)
          );
        }

        if (found) {
          handleEditState(found);
        }
      }
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [editId, fetchList, fetchItem, handleEditState]);


  useEffect(() => {
    loadData();
  }, [moduleKey, editId, loadData]);

  // Load all projects on mount for dropdown
  const [allProjects, setAllProjects] = useState([]);
  useEffect(() => {
    const loadProjects = async () => {
      const res = await searchProjects(""); // Returns all if name is empty (backend updated)
      if (Array.isArray(res)) setAllProjects(res);
      else if (res && Array.isArray(res.data)) setAllProjects(res.data);
    };
    loadProjects();
  }, []);


  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: val }));

    if (moduleKey === "escalation" && e.target.name === "status" && val === "Resolved" && editingId) {
      setShowResolutionModal(true);
    }
  };

  // Removed problematic useEffect that caused infinite loop. 
  // Resetting form data is handled by handleNew or initial state.
  useEffect(() => {
    if (!editId) {
      setEditingId(null);
      // Only clear if we really need to, but avoid aggressive resets that cycle
      // setFormData({}); // This triggers re-round if not careful
    }
  }, [editId]);

  const columnsToHide = ["id", "project_id", "created_at", "updated_at"];
  const columns = rows[0] ? Object.keys(rows[0]).filter(c => !columnsToHide.includes(c)) : [];

  return (
    <div className="p-8 text-brandDark">
      <header className="mb-6 flex justify-between items-end border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-marcellus font-medium text-gray-900 leading-tight">
            {title}
            {mode === "edit" && (
              <span className="ml-3 text-lg font-bold text-blue-600 uppercase tracking-wider">
                — {editingId ? "Update Entry" : "Add New Entry"}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-urbanist">
            Here is your {title} Dashboard. Click <span className="font-bold text-gray-700">"Add New"</span> to begin.
          </p>

          {/* Helper message for empty state - Show if empty AND in view mode */}
          {rows.length === 0 && !loading && mode === "view" && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 inline-block animate-pulse">
              <span className="text-blue-600">ℹ️</span>
              <span>To begin, click <span className="font-bold text-gray-800">ADD NEW</span> to create your first entry.</span>
            </div>
          )}

          {rows.length > 0 && (
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-3">
              {rows.length} Data entries have been filled
            </p>
          )}
        </div>

        <button
          onClick={handleNew}
          className="px-8 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-gray-800 transition-all shadow-sm hover:shadow-md transform active:scale-95 flex items-center gap-2"
        >
          <span>ADD NEW</span>

        </button>
      </header>

      {mode === "view" && (
        <div className="bg-white border rounded shadow overflow-hidden">
          {loading ? (
            <div className="p-20 text-center">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                    {columns.map(col => (
                      <th key={col} className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">
                        {col === "manual_project_id" ? "Project ID" : col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const rowId = row.id || row.issue_id || row.risk_id || row.action_id || row.dependency_id || row.escalation_id || row.appreciation_id || row.collection_id;
                    return (
                      <tr key={rowId} className={`${getStatusRowClass(row.status || row.current_status)} border-b hover:bg-opacity-80 transition-colors text-sm`}>
                        <td className="px-6 py-3 font-medium">
                          <button
                            onClick={() => navigate(`${location.pathname}?mode=edit&id=${rowId}`)}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                        </td>
                        {columns.map(col => {
                          const val = row[col];
                          const isDate = col.toLowerCase().includes('date') || col.toLowerCase().includes('_at');
                          return (
                            <td key={col} className="px-6 py-3">
                              <span>{isDate ? formatDateOnly(val) : String(val ?? '-')}</span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={columns.length + 1} className="p-10 text-center text-gray-500">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {mode === "edit" && (
        <div className="bg-white p-5 border border-gray-200 rounded-sm shadow-sm w-full">
          <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
            <h2 className="text-lg font-marcellus font-bold text-gray-900 uppercase tracking-wide">
              {title} Details
            </h2>
            <div className="flex items-center gap-4">
              {userRole === "ADMIN" && (
                <button
                  onClick={() => setShowLayoutBuilder(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                >
                  <SlidersHorizontal size={14} />
                  ADMIN: Layout
                </button>
              )}
              <button
                onClick={() => navigate(`${location.pathname}?mode=view`)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                &times;
              </button>
            </div>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleSave(); }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {activeFields.map((field) => {
                const value = formData[field.name] ?? "";
                // Make descriptions/comments span full width, others 1 col
                const isFullWidth = field.type === "textarea" || field.name.includes("description") || field.name.includes("impact") || field.name.includes("comments") || field.name.includes("mitigation");


                return (
                  <div key={field.name} className={isFullWidth ? "md:col-span-2 lg:col-span-3" : ""}>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      {field.label} {field.required && <span className="text-red-600">*</span>}
                    </label>

                    {/* SHOW UPLOADED DOCUMENTS IF ESCALATION */}
                    {moduleKey === "escalation" && field.name === "status" && formData.documents && formData.documents.length > 0 && (
                      <div className="mb-2 p-2 bg-gray-50 border border-gray-200 rounded">
                        <span className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Attached Documents</span>
                        <div className="space-y-1">
                          {formData.documents.map((doc, idx) => (
                            <a
                              key={doc.id || idx}
                              href={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/${doc.file_path}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 text-xs text-blue-700 hover:underline font-medium"
                            >
                              📄 {doc.file_name} <span className="text-[10px] text-gray-500">({new Date(doc.uploaded_at).toLocaleDateString()})</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={value}
                        rows={3}
                        required={field.required}
                        disabled={field.readOnly}
                        onChange={handleChange}
                        className={`w-full border border-gray-300 p-2 rounded text-sm text-gray-900 focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors ${field.readOnly ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"}`}
                      />
                    ) : field.type === "select" ? (
                      <select
                        name={field.name}
                        value={value}
                        required={field.required}
                        disabled={field.readOnly}
                        onChange={handleChange}
                        className={`w-full border border-gray-300 p-2 rounded text-sm text-gray-900 focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:0.7em_0.7em] ${field.readOnly ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"}`}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23374151'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                      >
                        <option value="">Select...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === "date" ? "date" : "text"}
                        name={field.name}
                        value={value}
                        required={field.required}
                        disabled={field.readOnly}
                        readOnly={field.readOnly}
                        placeholder={field.readOnly && !value ? "Auto-generated" : ""}
                        onChange={handleChange}
                        className={`w-full border border-gray-300 p-2 rounded text-sm text-gray-900 focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors ${field.readOnly ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"
                          }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 mt-2">
              <button
                type="button"
                onClick={() => navigate(`${location.pathname}?mode=view`)}
                className="px-5 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2 bg-black text-white text-sm font-bold uppercase tracking-wider rounded hover:bg-gray-900 transition-colors disabled:opacity-50 shadow-sm"
              >
                {saving ? "Saving..." : "Save Record"}
              </button>
            </div>
          </form>
        </div>
      )
      }
      <EscalationResolutionModal
        isOpen={showResolutionModal}
        onClose={() => setShowResolutionModal(false)}
        escalationId={formData.id}
        onSuccess={() => {
          loadData();
          navigate(`/modules/${moduleKey}`);
        }}
      />
      <SuccessNotification
        isOpen={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
      />
      {
        showLayoutBuilder && (
          <LayoutBuilder
            fields={layoutFields}
            onClose={() => setShowLayoutBuilder(false)}
            onSave={async (newLayout) => {
              await saveLayoutApi(moduleKey, newLayout);
              setLayoutFields(newLayout);
              setShowLayoutBuilder(false);
            }}
          />
        )
      }
    </div >
  );
};

export default WorkboardPage;
