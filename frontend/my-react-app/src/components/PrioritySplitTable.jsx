// Priority Split Table Component
import React from "react";

const PRIORITY_COLORS = {
  Critical: "#E63946",
  High: "#F77F00",
  Medium: "#FCBF49",
  Low: "#06A77D",
  Unknown: "#6B7280",
};

export default function PrioritySplitTable({ data = [] }) {
  // Sort by count descending
  const sortedData = [...data].sort((a, b) => Number(b.value || 0) - Number(a.value || 0));

  // Calculate total
  const total = sortedData.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <div style={{ width: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #E5E7EB" }}>
            <th style={{
              textAlign: "left",
              padding: "12px 8px",
              fontSize: 13,
              fontWeight: 600,
              color: "#6B7280",
              fontFamily: "Urbanist"
            }}>
              Priority
            </th>
            <th style={{
              textAlign: "right",
              padding: "12px 8px",
              fontSize: 13,
              fontWeight: 600,
              color: "#6B7280",
              fontFamily: "Urbanist"
            }}>
              Count
            </th>
            <th style={{
              textAlign: "right",
              padding: "12px 8px",
              fontSize: 13,
              fontWeight: 600,
              color: "#6B7280",
              fontFamily: "Urbanist"
            }}>
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, idx) => {
            const count = Number(item.value || 0);
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            const priorityName = item.name || "Unknown";
            const color = PRIORITY_COLORS[priorityName] || "#6B7280";

            return (
              <tr
                key={idx}
                style={{
                  borderBottom: "1px solid #F3F4F6",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFB"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={{
                  padding: "12px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#1F2937",
                  fontFamily: "Urbanist"
                }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: color,
                    flexShrink: 0
                  }} />
                  {priorityName}
                </td>
                <td style={{
                  padding: "12px 8px",
                  textAlign: "right",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1F2937",
                  fontFamily: "Urbanist"
                }}>
                  {count}
                </td>
                <td style={{
                  padding: "12px 8px",
                  textAlign: "right",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#6B7280",
                  fontFamily: "Urbanist"
                }}>
                  {percentage}%
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: "2px solid #E5E7EB", background: "#F9FAFB" }}>
            <td style={{
              padding: "12px 8px",
              fontSize: 13,
              fontWeight: 600,
              color: "#1F2937",
              fontFamily: "Urbanist"
            }}>
              Total
            </td>
            <td style={{
              padding: "12px 8px",
              textAlign: "right",
              fontSize: 13,
              fontWeight: 700,
              color: "#1F2937",
              fontFamily: "Urbanist"
            }}>
              {total}
            </td>
            <td style={{
              padding: "12px 8px",
              textAlign: "right",
              fontSize: 13,
              fontWeight: 700,
              color: "#1F2937",
              fontFamily: "Urbanist"
            }}>
              100%
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
