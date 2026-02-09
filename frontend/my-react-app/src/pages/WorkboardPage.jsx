import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDateOnly } from "../utils/dateFormat";
import useMonitoringExport from "../hooks/useMonitoringExport";
import ProjectSearchInput from "../components/ProjectSearchInput";

import EscalationResolutionModal from "../components/EscalationResolutionModal";
import LayoutBuilder from "../components/LayoutBuilder";
import { getLayoutApi, saveLayoutApi } from "../api/layoutApi";
import { SlidersHorizontal, DownloadSimple } from "phosphor-react";
import SuccessNotification from "../components/SuccessNotification";
import TruncatedCell from "../components/TruncatedCell";
import { exportToExcel } from "../utils/exportToExcel";
import { fetchPreviewId } from "../api/utilsApi";

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


const getStatusRowClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "open" || s === "identified") return "status-resolved"; // Open -> Resolved (Status Normalization Rule 3)
  if (s === "in progress") return "status-inprogress";
  if (s === "resolved" || s === "completed") return "status-resolved";
  if (s === "approved" || s === "approved & closed") return "status-approved";
  if (s === "cancelled" || s === "rejected") return "status-cancelled";
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
  const [resolutionId, setResolutionId] = useState(null);

  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showToast, setShowToast] = useState(false); // For export toast


  const [layoutFields, setLayoutFields] = useState([]);
  const [showLayoutBuilder, setShowLayoutBuilder] = useState(false);
  const [userRole, setUserRole] = useState("USER");

  useEffect(() => {
    const stored = localStorage.getItem("ARCHERIDE_AUTH");
    if (stored) {
      const { user } = JSON.parse(stored);
      setUserRole(user?.role || "USER");
    }
  }, []);

  const location = useLocation();
  const navigate = useNavigate();


  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get("id");



  useEffect(() => {
    const initLayout = async () => {
      const serverLayout = await getLayoutApi(moduleKey);
      if (serverLayout && Array.isArray(serverLayout) && serverLayout.length > 0) {

        const mergedLayout = serverLayout
          .filter(sField => sField.name?.toLowerCase() !== "comments") // Explicitly remove comments (case-insensitive)
          .map(sField => {
            const cField = formConfig?.fields?.find(f => f.name === sField.name);
            if (cField) {
              // Always sync critical properties from config to ensure code updates (like readOnly) are reflected
              return {
                ...sField,
                type: cField.type,
                options: cField.options,
                required: cField.required,
                readOnly: cField.readOnly,
                placeholder: cField.placeholder
              };
            }
            return sField;
          });
        setLayoutFields(mergedLayout);
      } else {
        setLayoutFields(formConfig?.fields || []);
      }
    };
    initLayout();
  }, [moduleKey, formConfig]);


  const activeFields = React.useMemo(() => {
    const visible = layoutFields.filter(f => !f.hidden);

    // Sort logic: ID first, then manual_project_id, then others
    return visible.sort((a, b) => {
      const isIdA = a.readOnly && a.name.endsWith("_id") && !a.name.includes("project_id");
      const isIdB = b.readOnly && b.name.endsWith("_id") && !b.name.includes("project_id");

      if (isIdA) return -1;
      if (isIdB) return 1;

      if (a.name === "manual_project_id") return -1;
      if (b.name === "manual_project_id") return 1;

      return 0;
    });
  }, [layoutFields]);

  const handleEditState = React.useCallback(
    (row) => {
      setEditingId(
        row.id ||
        row.issue_id ||
        row.risk_id ||
        row.escalation_id ||
        row.action_id ||
        row.dependency_id ||
        row.appreciation_id
      );
      const mapped = { ...row };
      layoutFields
        .filter((f) => f.type === "date")
        .forEach((f) => {
          mapped[f.name] = toDateInputValue(row[f.name]);
        });
      setFormData(mapped);
      setFormData(mapped);
    },
    [layoutFields]
  );

  const handleNew = () => {
    setEditingId(null);
    const initial = {};
    activeFields.forEach((f) => (initial[f.name] = ""));
    setFormData(initial);
    setFormData(initial);



    navigate(`${location.pathname}?mode=edit`);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { ...formData };



      const isEscalation = moduleKey === "escalation" || moduleKey === "escalations";
      if (isEscalation && payload.status === "Resolved") {

        let currentId = editingId || formData.id || formData.escalation_id;


        if (!currentId) {
          const tempPayload = { ...payload, status: "Open" };
          try {
            if (!createItem) throw new Error("Create function execution failed.");


            const res = await createItem(tempPayload);
            const created = res.data || res;
            currentId = created.id || created.escalation_id;

            if (!currentId) throw new Error("Backend did not return an ID for the new Escalation.");


            setEditingId(currentId);
            setFormData(prev => ({ ...prev, ...created, id: currentId }));

          } catch (autoCreateErr) {
            console.error("Auto-create failed during resolution", autoCreateErr);
            alert(`Could not proceed with resolution: ${autoCreateErr.message}`);
            setSaving(false);
            return;
          }
        }


        alert("For Escalations, you MUST upload proof of resolution. Please upload documents in the popup window.");
        setResolutionId(currentId);
        setShowResolutionModal(true);
        setSaving(false);
        return;
      }
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


      await loadData();


      setShowSuccessNotification(true);


      navigate(`${location.pathname}?mode=view`);
    } catch (err) {
      console.error("Save error:", err);

      const errMsg = err.message || "Failed to save record. Please check inputs.";
      alert(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);


      const res = await fetchList({});
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      setRows(list);


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
                r.appreciation_id
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


  useEffect(() => {
    if (moduleKey !== "risk" && moduleKey !== "risks") return;

    const probMap = {
      "Rare": 1,
      "Possible": 2,
      "Likely (Regularly)": 3
    };
    const impactMap = {
      "Minor": 1,
      "Moderate": 2,
      "Major": 3
    };

    const pVal = formData.probability;
    const iVal = formData.impact;

    if (pVal && iVal) {
      const pScore = probMap[pVal] || 0;
      const iScore = impactMap[iVal] || 0;
      if (pScore > 0 && iScore > 0) {
        const score = pScore * iScore;
        setFormData(prev => {
          if (prev.risk_score === score) return prev;
          return { ...prev, risk_score: score };
        });
      }
    }
  }, [moduleKey, formData.probability, formData.impact]);




  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: val }));



  };



  useEffect(() => {
    if (!editId) {
      setEditingId(null);


    }
  }, [editId]);

  const columnsToHide = ["id", "project_id", "created_at", "updated_at", "comments"];

  const getSortedColumns = () => {
    if (!rows[0]) return [];

    const keys = Object.keys(rows[0]).filter(c => !columnsToHide.includes(c));







    const creatorKeys = ["created_by", "reported_by", "recorded_by", "raised_by"];

    return keys.sort((a, b) => {

      const isIdA = a.endsWith("_id") && !a.includes("project_id");
      const isIdB = b.endsWith("_id") && !b.includes("project_id");

      if (isIdA && !isIdB) return -1;
      if (!isIdA && isIdB) return 1;


      const isCreatorA = creatorKeys.includes(a);
      const isCreatorB = creatorKeys.includes(b);

      if (isCreatorA && !isCreatorB) return -1;
      if (!isCreatorA && isCreatorB) return 1;


      if (a === "manual_project_id" && b !== "manual_project_id") return -1;
      if (a !== "manual_project_id" && b === "manual_project_id") return 1;

      return 0;
    });
  };

  const columns = getSortedColumns();

  const handleExport = () => {
    const exportData = window.__EXPORT_DATA__?.[moduleKey];

    if (!exportData || !exportData.rows?.length) {
      alert(`No data available to export for ${moduleKey}`);
      return;
    }

    exportToExcel(exportData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="p-8 text-brandDark relative">
      {/* Export Toast */}
      {showToast && (
        <div className="absolute top-4 right-1/2 translate-x-1/2 z-50
                      rounded-md bg-green-600 px-3 py-1.5
                      text-xs text-white shadow-lg
                      animate-fade">
          ✅ Downloaded successfully
        </div>
      )}

      <header className="mb-6 flex justify-between items-end border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-marcellus font-medium text-gray-900 leading-tight">
            {title}
            { }
          </h1>
          { }

          { }
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

        <div className="flex gap-2">
          {/* Re-added Export Button Near Add New */}
          {mode === "view" && rows.length > 0 && (
            <button
              type="button"
              onClick={handleExport}
              className="rounded-full h-10 w-10 flex items-center justify-center border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
              title="Export to Excel"
            >
              <DownloadSimple size={20} weight="duotone" />
            </button>
          )}

          <button
            onClick={handleNew}
            className="px-8 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-gray-800 transition-all shadow-sm hover:shadow-md transform active:scale-95 flex items-center gap-2"
          >
            <span>ADD NEW</span>

          </button>
        </div>
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
                    const rowId = row.id || row.issue_id || row.risk_id || row.action_id || row.dependency_id || row.escalation_id || row.appreciation_id;
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
                          if (col === "documents" && Array.isArray(val) && val.length > 0) {
                            return (
                              <td key={col} className="px-6 py-4 whitespace-normal break-words min-w-[180px] align-top text-gray-700 leading-relaxed">
                                <div className="flex flex-col gap-1">
                                  {val.map((doc, idx) => (
                                    <a
                                      key={idx}
                                      href={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/${doc.file_path}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium bg-blue-50 px-2 py-1 rounded border border-blue-100 w-fit"
                                      title={doc.file_name}
                                    >
                                      📄 {doc.file_name?.length > 20 ? doc.file_name.substring(0, 18) + "..." : doc.file_name}
                                    </a>
                                  ))}
                                </div>
                              </td>
                            );
                          }

                          const isDate = col.toLowerCase().includes('date') || col.toLowerCase().includes('_at');
                          return (
                            <td key={col} className="px-6 py-4 min-w-[180px] align-top text-gray-700 leading-relaxed"> {/* Removed break-words and whitespace-normal here, TruncatedCell handles it */}
                              {isDate ?
                                <span>{formatDateOnly(val)}</span> :
                                <TruncatedCell content={typeof val === 'object' ? JSON.stringify(val) : String(val ?? '-')} />
                              }
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
              {activeFields.map((field) => {
                const value = formData[field.name] ?? "";


                const isFullWidth = field.type === "textarea" || field.name.includes("title") || field.name === "subject";

                return (
                  <div key={field.name} className={isFullWidth ? "md:col-span-2 lg:col-span-4" : ""}>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      {field.label} {field.required && <span className="text-red-600">*</span>}
                    </label>

                    { }
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

                    {field.type === "project-search" ? (
                      <ProjectSearchInput
                        value={value}
                        onChange={(val) => setFormData(prev => ({ ...prev, [field.name]: val }))}
                        onSelect={async (project) => {
                          const newData = {
                            manual_project_id: project.name,
                            project_description: project.description,
                            account: project.account
                          };

                          // Only auto-generate ID if this is a new record (no editingId)
                          if (!editingId) {
                            try {
                              const singularMap = {
                                risks: "risk",
                                issues: "issue",
                                actions: "action",
                                dependencies: "dependency",
                                escalations: "escalation",
                                appreciations: "appreciation"
                              };
                              const module = singularMap[moduleKey] || moduleKey.replace(/s$/, "");

                              const res = await fetchPreviewId(module, project.name, project.account);

                              // Handle both wrapped and unwrapped response structures for robustness
                              const previewId = res?.previewId || res?.data?.previewId;

                              if (previewId) {
                                // Dynamic key based on module (risk_id, issue_id, etc.)
                                const idField = `${module}_id`;
                                newData[idField] = previewId;
                              }
                            } catch (err) {
                              console.error("Failed to auto-generate ID", err);
                            }
                          }

                          setFormData(prev => ({
                            ...prev,
                            ...newData
                          }));
                        }
                        }


                        required={field.required}
                        className={`w-full border border-gray-300 p-2 rounded text-sm text-gray-900 focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors ${field.readOnly ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"}`}
                      />
                    ) : field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={value}
                        rows={3}
                        required={field.required}
                        disabled={field.readOnly}
                        onChange={handleChange}
                        className={`w-full border border-gray-300 p-2 rounded text-sm text-gray-900 focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors ${field.readOnly
                          ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                          : "bg-white"
                          }`}
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
                        className={`w-full border border-gray-300 p-2 rounded text-sm text-gray-900 focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors ${field.readOnly
                          ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                          : "bg-white"
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
        onClose={() => {
          setShowResolutionModal(false);
          setResolutionId(null);
        }}
        escalationId={resolutionId}
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
