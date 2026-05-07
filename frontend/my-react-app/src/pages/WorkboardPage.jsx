import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDateOnly } from "../utils/dateFormat";
import useMonitoringExport from "../hooks/useMonitoringExport";
import ProjectSearchInput from "../components/ProjectSearchInput";
import ManagerSubPersonInput from "../components/ManagerSubPersonInput";

import EscalationResolutionModal from "../components/EscalationResolutionModal";
import LayoutBuilder from "../components/LayoutBuilder";
import { getLayoutApi, saveLayoutApi, deleteLayoutApi } from "../api/layoutApi";
import { SlidersHorizontal, DownloadSimple, Trash } from "phosphor-react";
import SuccessNotification from "../components/SuccessNotification";
import TruncatedCell from "../components/TruncatedCell";
import { exportToExcel } from "../utils/exportToExcel";
import { fetchPreviewId } from "../api/utilsApi";
import * as XLSX from "xlsx";
import { bulkUploadActionsApi } from "../api/actionsApi";

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
  if (s === "open" || s === "identified") return "status-open";
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
  deleteItem,
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

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [globalAlert, setGlobalAlert] = useState(null);

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
          .filter(sField => sField.name?.toLowerCase() !== "comments")
          .map(sField => {
            const cField = formConfig?.fields?.find(f => f.name === sField.name);
            if (cField) {
              return {
                ...sField,
                type: cField.type,
                options: cField.options,
                required: cField.required,
                readOnly: cField.readOnly,
                placeholder: cField.placeholder
              };
            }
            return null;
          })
          .filter(Boolean);
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

  const handleNewClick = () => {
    if (deleteItem && userRole !== "ADMIN") {
      setShowAddNotice(true);
    } else {
      handleNew();
    }
  };

  const proceedToNew = () => {
    setShowAddNotice(false);
    handleNew();
  };

  const handleDeleteClick = () => {
    if (selectedIds.length > 0) {
      setShowConfirmDelete(true);
    } else {
      setIsDeleteMode(!isDeleteMode);
    }
  };

  const executeDelete = async () => {
    setShowConfirmDelete(false);
    if (selectedIds.length === 0) return;
    try {
      setIsDeleting(true);
      await deleteItem({ ids: selectedIds });
      setIsDeleteMode(false);
      setSelectedIds([]);
      await loadData();
    } catch (err) {
      console.error("Delete failed", err);
      // Use structured messages based on status code
      if (err.status === 403) {
        setGlobalAlert({
          title: "Restriction Notice",
          message: "Deletion is restricted. Only records created on the current day can be deleted."
        });
      } else if (err.status === 404) {
        setGlobalAlert({
          title: "System Error",
          message: "The requested delete endpoint could not be found or the records do not exist. Please contact support."
        });
      } else {
        setGlobalAlert({
          title: "Deletion Failed",
          message: err.message || "An unexpected error occurred while deleting entries."
        });
      }
    } finally {
      setIsDeleting(false);
    }
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
            setGlobalAlert(`Could not proceed with resolution: ${autoCreateErr.message}`);
            setSaving(false);
            return;
          }
        }


        setGlobalAlert("For Escalations, you MUST upload proof of resolution. Please upload documents in the popup window.");
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
      setGlobalAlert({
        title: "Save Failed",
        message: errMsg
      });
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

    const getRiskScoreLabel = (score) => {
      if (score === 1 || score === 2) return "Low";
      if (score === 3) return "Medium";
      if (score === 4 || score === 6) return "High";
      if (score === 9) return "Critical";
      return "";
    };

    const pVal = formData.probability;
    const iVal = formData.impact;

    if (pVal && iVal) {
      const pScore = probMap[pVal] || 0;
      const iScore = impactMap[iVal] || 0;
      if (pScore > 0 && iScore > 0) {
        const scoreNum = pScore * iScore;
        const label = getRiskScoreLabel(scoreNum);
        const scoreDisplay = label ? `${scoreNum} - ${label}` : String(scoreNum);

        setFormData(prev => {
          if (prev.risk_score === scoreDisplay) return prev;
          return { ...prev, risk_score: scoreDisplay };
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







    const creatorKeys = ["created_by", "reported_by", "recorded_by", "raised_by", "identified_by"];

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
      setGlobalAlert(`No data available to export for ${moduleKey}`);
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

          {deleteItem && userRole !== "ADMIN" && mode === "view" && rows.length > 0 && (
            <>
              {isDeleteMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteMode(false);
                    setSelectedIds([]);
                  }}
                  className="rounded h-10 px-4 flex items-center gap-1.5 border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 font-semibold text-sm transition-colors shadow-sm"
                  title="Cancel deletion"
                >
                  ✕ Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className={`rounded flex items-center justify-center transition-colors shadow-sm h-10 ${isDeleteMode
                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-4 gap-2 font-semibold text-sm"
                    : "w-10 border border-gray-200 text-gray-500 hover:bg-gray-100 bg-white"
                  }`}
                title="Delete Mode"
              >
                <Trash size={20} weight={isDeleteMode ? "fill" : "duotone"} />
                {isDeleteMode && selectedIds.length > 0 && <span>Delete ({selectedIds.length})</span>}
              </button>
            </>
          )}

          {moduleKey === "actions" && (
            <label className="cursor-pointer rounded flex items-center justify-center border border-brandDark text-brandDark hover:bg-gray-50 transition-colors bg-white shadow-sm text-xs font-bold gap-2 px-4 h-10 w-auto">
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setLoading(true);
                try {
                  const data = await file.arrayBuffer();
                  const workbook = XLSX.read(data);
                  const sheetName = workbook.SheetNames[0];
                  const worksheet = workbook.Sheets[sheetName];
                  const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                  
                  if (json.length === 0) {
                    throw new Error("Excel file is empty");
                  }
                  if (json.length > 40) {
                    throw new Error("Maximum of 40 records allowed per upload.");
                  }

                  const getVal = (row, keys) => {
                    for (const k of Object.keys(row)) {
                      if (keys.map(x => x.toLowerCase().trim()).includes(k.toLowerCase().trim())) {
                        return row[k];
                      }
                    }
                    return "";
                  };

                  const parseExcelDate = (val) => {
                    if (!val) return null;
                    let str = String(val).trim();
                    if (str.toUpperCase() === "NA" || str.toUpperCase() === "TBD") return null;
                    
                    if (str.includes('\n')) str = str.split('\n')[0].trim();
                    if (str.includes(',')) str = str.split(',')[0].trim();

                    const numVal = Number(str);
                    if (!isNaN(numVal) && typeof numVal === 'number' && numVal > 10000) {
                      const date = new Date(Math.round((numVal - 25569) * 86400 * 1000));
                      return date.toISOString().split('T')[0];
                    }

                    const parts = str.split(/[-/]/);
                    if (parts.length === 3) {
                       let [d, m, y] = parts;
                       if (y.length === 2) y = "20" + y;
                       if (d.length === 4) return `${d}-${m.padStart(2, '0')}-${y.padStart(2, '0')}`;
                       return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                    }
                    return null;
                  };

                  const actions = json.map(row => ({
                    action_id: getVal(row, ["action_id", "Action ID"]),
                    action_item: getVal(row, ["action_item", "Action Item", "Action item"]),
                    priority: getVal(row, ["priority", "Priority"]) || "Medium",
                    target_date: parseExcelDate(getVal(row, ["target_date", "Target Date", "Target date"])),
                    status: getVal(row, ["status", "Status"]) || "Open",
                    responsible: getVal(row, ["responsible", "Responsible", "Responsib"]),
                    support_required_from: getVal(row, ["support_required_from", "Support Required From", "Support required from", "Support re"]),
                    teams_involved: getVal(row, ["teams_involved", "Teams Involved", "Teams involved", "Teams Inv"]),
                    remarks: getVal(row, ["remarks", "Remarks"])
                  }));

                  await bulkUploadActionsApi(actions);
                  alert("Bulk upload successful!");
                  loadData();
                } catch (err) {
                  console.error("Bulk upload error:", err);
                  alert(err.message || "Failed to process bulk upload");
                } finally {
                  setLoading(false);
                  e.target.value = "";
                }
              }} />
              BULK UPLOAD
            </label>
          )}

          {(userRole === "ADMIN" || userRole === "BM" || userRole === "PM") && mode === "view" && (
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to reset the layout to default? This will clear all custom column ordering and visibility.")) {
                  try {
                    await deleteLayoutApi(moduleKey);
                    window.location.reload();
                  } catch (error) {
                    alert("Failed to reset layout. Please try again.");
                  }
                }
              }}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 text-xs font-bold uppercase tracking-widest rounded transition-all shadow-sm flex items-center gap-2"
            >
              Reset Layout
            </button>
          )}
          <button
            onClick={handleNewClick}
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
                    {isDeleteMode && <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase w-10">Select</th>}
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
                        {isDeleteMode && (
                          <td className="px-6 py-3 align-top">
                            <input
                              type="checkbox"
                              className="w-4 h-4 cursor-pointer mt-2"
                              checked={selectedIds.includes(rowId)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedIds([...selectedIds, rowId]);
                                else setSelectedIds(selectedIds.filter(id => id !== rowId));
                              }}
                            />
                          </td>
                        )}
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
                      <td colSpan={columns.length + (isDeleteMode ? 2 : 1)} className="p-10 text-center text-gray-500">
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
            {(userRole === "ADMIN" || userRole === "BM" || userRole === "PM") && (
              <>
                <button
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to reset the layout to default? This will clear all custom column ordering and visibility.")) {
                      try {
                        await deleteLayoutApi(moduleKey);
                        window.location.reload();
                      } catch (error) {
                        alert("Failed to reset layout. Please try again.");
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                >
                  Reset Layout
                </button>
                {userRole === "ADMIN" && (
                  <button
                    onClick={() => setShowLayoutBuilder(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                  >
                    <SlidersHorizontal size={14} />
                    ADMIN: Layout
                  </button>
                )}
              </>
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
                    ) : field.type === "manager-sub-person" ? (
                      <ManagerSubPersonInput
                        value={value}
                        onChange={(val) => setFormData(prev => ({ ...prev, [field.name]: val }))}
                        required={field.required}
                        readOnly={field.readOnly}
                      />
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
      {showAddNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center transform scale-100 transition-all">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 border border-blue-100 mb-4 shadow-inner">
              <span className="text-blue-600 text-xl font-bold font-serif">i</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 font-marcellus">Important Notice</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Entries can be added or edited anytime, but <strong>deletion is strictly limited</strong> to the same day of creation. Please ensure your data entry is precise and accurate.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowAddNotice(false)}
                className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={proceedToNew}
                className="px-6 py-2.5 rounded-lg bg-black text-white font-semibold text-sm hover:bg-gray-800 shadow-md transition-all"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fade-in transition-all">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center transform scale-100 animate-slide-up transition-all">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-5 shadow-inner">
              <Trash size={28} weight="duotone" className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              Are you sure you want to permanently delete the <strong className="text-gray-900">{selectedIds.length} select {selectedIds.length === 1 ? 'entry' : 'entries'}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmDelete(false);
                  setSelectedIds([]);
                  setIsDeleteMode(false);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 shadow-md hover:shadow-lg focus:ring-2 focus:ring-red-500 focus:ring-offset-1 outline-none transition-all"
              >
                Delete ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {globalAlert && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fade-in transition-all">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center transform scale-100 animate-slide-up transition-all">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-blue-50 mb-5 shadow-inner border border-blue-100">
              <span className="text-blue-500 text-2xl font-bold font-serif">i</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">{globalAlert.title || "System Notice"}</h3>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              {globalAlert.message || globalAlert}
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setGlobalAlert(null)}
                className="w-full px-4 py-2.5 rounded-lg bg-black text-white font-semibold text-sm hover:bg-gray-800 shadow-md transition-all outline-none focus:ring-2 focus:ring-gray-400"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

    </div >
  );
};

export default WorkboardPage;
