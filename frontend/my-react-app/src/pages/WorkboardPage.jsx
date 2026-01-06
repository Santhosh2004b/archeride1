import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDisplayDate } from "../utils/dateFormat";

const toDateInputValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
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
  if (s === "on-holding" || s === "inholding" || s === "on hold") return "status-onhold";
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
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const location = useLocation();
  const navigate = useNavigate();

  // Extract ID from URL for direct loading
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get("id");

  // useMemo to prevent fields array from forcing re-renders
  const fields = React.useMemo(() => formConfig?.fields || [], [formConfig]);

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
      fields
        .filter((f) => f.type === "date")
        .forEach((f) => {
          mapped[f.name] = toDateInputValue(row[f.name]);
        });
      setFormData(mapped);
    },
    [fields]
  );

  const handleNew = () => {
    setEditingId(null);
    const initial = {};
    fields.forEach((f) => (initial[f.name] = ""));
    setFormData(initial);
    // Use navigate instead of window.location
    navigate(`${location.pathname}?mode=edit`);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { ...formData };
      fields
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
      // Reload data to get the latest changes
      await loadData();
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

  // Handle clearing form when navigating away from editId (e.g. clicking 'Add New')
  useEffect(() => {
    if (!editId) {
      setEditingId(null);
      const initial = {};
      fields.forEach((f) => (initial[f.name] = ""));
      setFormData(initial);
    }
  }, [editId, fields]);

  const columnsToHide = ["project_id"];
  const columns = rows[0] ? Object.keys(rows[0]).filter(c => !columnsToHide.includes(c)) : [];

  return (
    <div className="p-8 text-brandDark">
      <header className="mb-2 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-marcellus font-medium text-gray-900">{title}</h1>
          {rows.length === 0 && !loading && mode === "edit" && (
            <p className="text-sm text-gray-500 mt-1 italic">
              👉 Tap <span className="font-bold">Add New</span> to create your first entry.
            </p>
          )}
          {rows.length > 0 && mode === "view" && (
            <p className="text-sm text-gray-500 mt-1 italic">
              Viewing {rows.length} {rows.length === 1 ? 'record' : 'records'}
            </p>
          )}
        </div>
        {/* Show Add New button in BOTH view and edit modes */}
        <button
          onClick={handleNew}
          className="px-6 py-2 border border-gray-300 rounded-full font-bold text-gray-600 hover:bg-gray-50 transition-all text-sm uppercase tracking-wide"
        >
          Add New
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
                        {col.replace(/_/g, ' ')}
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
                              <span>{isDate ? formatDisplayDate(val, true) : String(val ?? '-')}</span>
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
        <div className="bg-white p-8 border rounded-xl shadow-lg">
          <div className="flex justify-between mb-8 border-b pb-4">
            <h2 className="text-2xl font-marcellus font-medium text-gray-800">
              {editingId ? `Update ${title} Entry` : `New ${title} Entry`}
            </h2>
            <button
              onClick={() => navigate(`${location.pathname}?mode=view`)}
              className="text-3xl text-gray-400 hover:text-gray-600 transition-colors"
            >
              &times;
            </button>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleSave(); }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {fields.map((field) => {
                const value = formData[field.name] ?? "";
                const isLong = field.type === "textarea" || field.name.includes("description") || field.name.includes("impact") || field.name.includes("comments");

                return (
                  <div key={field.name} className={isLong ? "md:col-span-2" : ""}>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={value}
                        rows={3}
                        required={field.required}
                        disabled={field.readOnly}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                        className={`w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${field.readOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`}
                      />
                    ) : field.type === "select" ? (
                      <select
                        name={field.name}
                        value={value}
                        required={field.required}
                        disabled={field.readOnly}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                        className={`w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em] ${field.readOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                      >
                        <option value="">Select...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === "date" ? "datetime-local" : "text"}
                        name={field.name}
                        value={value}
                        required={field.required}
                        disabled={field.readOnly}
                        readOnly={field.readOnly}
                        placeholder={field.readOnly && !value ? "Auto-generated upon save" : ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                        className={`w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${field.readOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""
                          }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate(`${location.pathname}?mode=view`)}
                className="px-4 py-2 border rounded font-semibold text-gray-600 hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WorkboardPage;
