// Utility for consistent date formatting (DD/MM/YYYY HH:mm, 24h or AM/PM)

export function formatDisplayDate(dateStr, useAmPm = false) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  if (useAmPm) {
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  }
  return `${day}/${month}/${year} ${String(hours).padStart(2, "0")}:${minutes}`;
}

export function formatSaveDate(dateStr) {
  // Always save as DD/MM/YYYY HH:mm (24h)
  return formatDisplayDate(dateStr, false);
}
