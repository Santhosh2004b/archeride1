// frontend/my-react-app/src/components/DashboardTable.jsx
// Phase-6 — Added scroll, S.No column, sorting by last_updated DESC

import React, { useMemo } from "react";
import { formatDisplayDate, formatDateOnly } from "../utils/dateFormat";

const STATUS_COLORS = {
  Open: "#E63946",        // red
  "On Hold": "#FB8500",   // orange
  "In Progress": "#FB8500", // orange (alt)
  Resolved: "#457B9D",    // blue
  "Approved & Closed": "#1EA896", // teal
  Cancelled: "#8D99AE",   // soft grey
  Pending: "#FFCA3A",     // gold
  Overdue: "#E63946",     // force red
  High: "#E63946",        // priority
  Critical: "#E63946",    // priority
  Medium: "#FB8500",      // priority
  Low: "#457B9D"          // priority
};

// convert hex to soft pastel background
const tint = (hex) => hex + "22"; // add alpha for ~13% opacity

const DashboardTable = ({ data = [], columns = [] }) => {
  // Sort by last_updated or updated_at DESC, then filter to passed columns
  const sortedData = useMemo(() => {
    if (!data.length) return [];

    // Create a copy and sort
    const sorted = [...data].sort((a, b) => {
      const dateA = new Date(a.last_updated || a.updated_at || a.created_at || 0);
      const dateB = new Date(b.last_updated || b.updated_at || b.created_at || 0);
      return dateB - dateA; // DESC: newest first
    });

    return sorted;
  }, [data]);

  if (!sortedData.length) {
    return (
      <div style={{ color: "#8D99AE", fontSize: 14, padding: 20 }}>
        No data available
      </div>
    );
  }

  // Merge S.No with passed columns
  const allColumns = ["S.No", ...columns];

  return (
    <div
      style={{
        height: 400,
        overflowY: "auto",
        overflowX: "auto",
        border: "1px solid #E1E6EB",
        borderRadius: 8,
        background: "#fff",
        // ensure visible scrollbar track for better UX
        scrollbarWidth: "thin",
        scrollbarColor: "#93C5FD #F3F4F6",
      }}
    >
      <table
        style={{
          minWidth: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
          fontFamily: "Urbanist",
        }}
      >
        <thead>
          <tr style={{ background: "#f9fafb" }}>
            {allColumns.map((col) => (
              <th
                key={col}
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  background: "#f9fafb", // Important for opacity
                  textAlign: "left",
                  padding: "10px 12px",
                  borderBottom: "2px solid #E9ECEF",
                  fontWeight: 600,
                  fontFamily: "Montserrat",
                  color: "#0B2341",
                  fontSize: 12,
                  minWidth: col === "S.No" ? 45 : undefined,
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 2px -1px rgba(0,0,0,0.1)", // Subtle shadow for depth
                }}
              >
                {col.toUpperCase().replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sortedData.map((row, idx) => {
            // pick a status color if exists
            const rowStatus = row.status || row.priority || row.payment_status;
            const baseColor = STATUS_COLORS[rowStatus] || "#1A1A1A";
            const hoverColor = tint(baseColor);

            return (
              <tr
                key={idx}
                style={{
                  background: idx % 2 ? "#FAFAFA" : "#fff",
                  transition: "background-color 0.2s ease",
                  borderBottom: "1px solid #E9ECEF",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = hoverColor)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = idx % 2 ? "#FAFAFA" : "#fff")
                }
              >
                {/* S.No Column */}
                <td
                  style={{
                    padding: "10px 12px",
                    fontWeight: 600,
                    color: "#517493",
                    minWidth: 45,
                    textAlign: "center",
                  }}
                >
                  {idx + 1}
                </td>

                {/* Data Columns */}
                {columns.map((col) => (
                  <td
                    key={col}
                    style={{
                      padding: "8px 10px",
                      whiteSpace: "normal",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 160,
                      minWidth: 100,
                      color: "#1A1A1A", // Default text color
                      fontSize: 12,
                      lineHeight: "1.4",
                    }}
                    title={String(row[col] ?? "")}
                  >
                    {col.toLowerCase().includes("date") && !col.toLowerCase().includes("at")
                      ? formatDateOnly(row[col]) // Use date only for date fields
                      : col.toLowerCase().includes("_at")
                        ? formatDisplayDate(row[col], true) // Keep timestamps for system fields
                        : (row[col] ?? "-")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardTable;
