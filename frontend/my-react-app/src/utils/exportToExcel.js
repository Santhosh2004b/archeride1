import * as XLSX from "xlsx";

export function exportToExcel({ rows, fileName }) {
  if (!rows || rows.length === 0) {
    alert("No data to export");
    return;
  }

  // ✅ Use EXACT columns shown in UI
  const columns = Object.keys(rows[0]);

  // ✅ Normalize rows using only visible columns
  const normalizedRows = rows.map((row) => {
    const obj = {};
    columns.forEach((key) => {
      obj[key] = row[key] ?? "";
    });
    return obj;
  });

  // 📄 Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(normalizedRows, {
    header: columns,
  });

  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  // 🎨 Style HEADER
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!worksheet[addr]) continue;

    worksheet[addr].s = {
      fill: { fgColor: { rgb: "FFFF00" } }, // Yellow
      font: { bold: true, color: { rgb: "000000" } }, // Black text
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // 📐 Auto width
  worksheet["!cols"] = columns.map(() => ({ wch: 22 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
