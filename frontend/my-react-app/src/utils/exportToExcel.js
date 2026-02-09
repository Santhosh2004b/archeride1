import * as XLSX from "xlsx";

export function exportToExcel({ rows, fileName }) {
  if (!rows || rows.length === 0) {
    alert("No data to export");
    return;
  }

  
  
  const excludedColumns = ["id", "project_id", "created_at", "updated_at"];
  const columns = Object.keys(rows[0]).filter(key => !excludedColumns.includes(key));

  
  const normalizedRows = rows.map((row) => {
    const obj = {};
    columns.forEach((key) => {
      const val = row[key];
      if (Array.isArray(val)) {
        
        
        obj[key] = val.map(v => v.file_name || v.name || JSON.stringify(v)).join(", ");
      } else if (typeof val === 'object' && val !== null) {
        obj[key] = JSON.stringify(val);
      } else {
        obj[key] = val ?? "";
      }
    });
    return obj;
  });

  
  const worksheet = XLSX.utils.json_to_sheet(normalizedRows, {
    header: columns,
  });

  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!worksheet[addr]) continue;

    worksheet[addr].s = {
      fill: { fgColor: { rgb: "FFFF00" } }, 
      font: { bold: true, color: { rgb: "000000" } }, 
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  
  worksheet["!cols"] = columns.map(() => ({ wch: 22 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
