// frontend/my-react-app/src/pages/WorkboardPage.jsx

import React, { useEffect, useState } from "react";
import { formatDisplayDate } from "../utils/dateFormat";
import { BASE_URL, authHeaders } from "../api/http";
import { FiPlus } from "react-icons/fi";
import { useLocation } from "react-router-dom";

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

const formatDateForSave = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// map status → row background color
const getStatusRowClass = (row) => {
  const raw = row.status || row.Status || row.current_status;
  if (!raw) return "";
  const s = String(raw).toLowerCase();

  if (s === "open") return "bg-blue-50";
  if (s === "inholding") return "bg-yellow-50";
  if (s === "resolved") return "bg-orange-50";
  if (s === "cancelled") return "bg-gray-200";

  return "";
};


const WorkboardPage = ({
  title,
  moduleKey,
  mode, // "view" | "edit"
  fetchList,
  createItem,
  updateItem,
  formConfig,
}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const editId = params.get("id");

  const loadData = async () => {
    try {
      setLoading(true);
      const params = editId ? { id: editId } : {};
      const res = await fetchList(params);
      const list = editId ? [res.data] : Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setRows(list);
      if (editId && list.length > 0) {
        handleEdit(list[0]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadData();
    };
    init();
  }, [moduleKey, editId]);



  const fields = formConfig?.fields || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (row) => {
    setEditingId(row.id || row.escalation_id);

    const mapped = { ...row };
    fields
      .filter((f) => f.type === "date")
      .forEach((f) => {
        mapped[f.name] = toDateInputValue(row[f.name]);
      });
    setFormData(mapped);
  };

  const handleNew = () => {
    setEditingId(null);
    const initial = {};
    fields.forEach((f) => {
      initial[f.name] = "";
    });
    setFormData(initial);
  };

  const validateForm = () => {
    for (const f of fields) {
      if (f.required && !formData[f.name]) {
        alert(`Please fill: ${f.label}`);
        return false;
      }
    }
    return true;
  };

  // Helper to format date as YYYY-MM-DD
  const toYYYYMMDD = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      const payload = { ...formData };
      fields
        .filter((f) => f.type === "date")
        .forEach((f) => {
          if (payload[f.name]) {
            payload[f.name] = toYYYYMMDD(payload[f.name]);
          } else {
            payload[f.name] = null;
          }
        });
      // 🚀 map project_name → project_id before saving

      if (editingId) {
        await updateItem(editingId, payload);
      } else {
        // 🚫 Escalations are EDIT-ONLY
        await createItem(payload);
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      // After save, return to view mode
      window.location.href = `${window.location.pathname}?mode=view`;
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

const columns = rows[0] ? Object.keys(rows[0]).filter(c => c !== "project_id") : [];
  const hasEdit = !!(mode === "view" && updateItem);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-brandBg text-brandDark px-3 sm:px-5 py-3 relative">
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-2 rounded-full shadow-lg animate-fade-in">
          Saved Successfully
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-marcellus font-bold text-3xl sm:text-4xl text-brandDark tracking-tight mb-1">{title}</h2>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleNew}
            className="inline-flex items-center justify-center rounded-full border border-brandDark/20 px-3 py-2 text-sm font-urbanist text-brandDark hover:bg-brandDark hover:text-white transition shadow-sm"
            title="Add New"
          >
            <FiPlus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* VIEW MODE: table */}
      {mode === "view" && (
        <>
          <div className="mb-2 text-xs text-brandMuted font-urbanist">To update this record, click Edit</div>
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-6 text-sm text-brandMuted">Loading...</div>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full text-left text-xs sm:text-sm font-urbanist">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {hasEdit && (
                        <th className="px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-semibold text-brandMuted uppercase tracking-wide whitespace-nowrap">
                          Edit
                        </th>
                      )}
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-semibold text-brandMuted uppercase tracking-wide whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.id || row.issue_id || row.risk_id}
                        className={`${getStatusRowClass(
                          row
                        )} border-b border-gray-100 hover:bg-gray-50/80`}
                      >
                        {hasEdit && (
                          <td className="px-3 sm:px-4 py-2">
                            <button
                              type="button"
                              onClick={() => {
                                // Redirect to edit mode with id in URL
                                window.location.href = `${window.location.pathname}?mode=edit&id=${row.id || row.issue_id || row.risk_id}`;
                              }}
                              className="inline-flex items-center justify-center rounded-full border border-brandDark/20 px-3 py-1 text-[11px] font-urbanist text-brandDark hover:bg-brandDark hover:text-white transition"
                            >
                              Edit
                            </button>
                          </td>
                        )}
                        {columns.map((col) => (
                          <td
                            key={col}
                            className="px-3 sm:px-4 py-2 text-[11px] sm:text-sm text-brandDark whitespace-nowrap font-urbanist"
                          >
                            {col.toLowerCase().includes("date") || col.toLowerCase().includes("_at") ? formatDisplayDate(row[col]) : String(row[col] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={columns.length + (hasEdit ? 1 : 0) || 1}
                          className="px-3 sm:px-4 py-4 text-center text-xs sm:text-sm text-brandMuted"
                        >
                          No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* EDIT MODE: form */}
      {mode === "edit" && createItem && updateItem && (
        <div className="mt-4 rounded-xl bg-white border border-gray-200 shadow-sm p-5">
          <p className="text-xs text-brandMuted font-urbanist mb-4">Click + Add New before creating a record</p>
          <h3 className="font-urbanist font-semibold text-lg mb-4 text-brandDark">
            {editingId ? `Edit ${title}` : `New ${title}`}
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {fields.map((field) => {
              const value = formData[field.name] ?? "";

              if (field.type === "textarea") {
                return (
                  <div key={field.name} className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-xs font-medium text-brandMuted">
                      {field.label}
                    </label>
                    <textarea
                      name={field.name}
                      value={value}
                      onChange={handleChange}
                      className="min-h-[80px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-urbanist text-brandDark focus:outline-none focus:ring-2 focus:ring-brandDark/15"
                    />
                  </div>
                );
              }

              if (field.type === "select") {
                return (
                  <div key={field.name} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-brandMuted">
                      {field.label}
                    </label>
                    <select
                      name={field.name}
                      value={value}
                      onChange={handleChange}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-urbanist text-brandDark focus:outline-none focus:ring-2 focus:ring-brandDark/15"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((opt) => {
                        const v = typeof opt === "string" ? opt : opt.value;
                        const label = typeof opt === "string" ? opt : opt.label;
                        return (
                          <option key={v} value={v}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                );
              }

              return (
                <div key={field.name} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-brandMuted">
                    {field.label}
                  </label>
                  <input
                    type={field.type === "date" ? "datetime-local" : "text"}
                    name={field.name}
                    value={value}
                    onChange={handleChange}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-urbanist text-brandDark focus:outline-none focus:ring-2 focus:ring-brandDark/15"
                  />
                </div>
              );
            })}

            <div className="sm:col-span-2 flex justify-end mt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-full bg-brandDark px-6 py-2 text-sm font-urbanist font-semibold text-white hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WorkboardPage;
