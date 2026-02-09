
import pool from "../db.js";

export async function getSummaryMetrics(req, res) {
  try {
    
    const statusSql = `
      SELECT status, COUNT(*) AS c
      FROM (
        SELECT status FROM risks
        UNION ALL
        SELECT status FROM issues
        UNION ALL
        SELECT status FROM dependencies
        UNION ALL
        SELECT status FROM escalations
        UNION ALL
        SELECT status FROM actions
      ) s
      GROUP BY status;
    `;
    const { rows: statusRows } = await pool.query(statusSql);

    const totalOpen =
      Number(statusRows.find((r) => r.status === "Open")?.c || 0);
    const totalInProgress =
      Number(statusRows.find((r) => r.status === "In Progress")?.c || 0);
    const totalClosed =
      Number(statusRows.find((r) => r.status === "Closed")?.c || 0);
    const totalItems = statusRows.reduce(
      (sum, r) => sum + Number(r.c || 0),
      0
    );

    const kpis = {
      totalOpen,
      totalInProgress,
      totalClosed,
      totalItems,
    };

    
    const byModuleSql = `
      SELECT 'Risk' as module, status, COUNT(*)::int AS count FROM risks GROUP BY status
      UNION ALL
      SELECT 'Issue' as module, status, COUNT(*)::int AS count FROM issues GROUP BY status
      UNION ALL
      SELECT 'Dependency' as module, status, COUNT(*)::int AS count FROM dependencies GROUP BY status
      UNION ALL
      SELECT 'Escalation' as module, status, COUNT(*)::int AS count FROM escalations GROUP BY status
      UNION ALL
      SELECT 'Action' as module, status, COUNT(*)::int AS count FROM actions GROUP BY status;
    `;
    const { rows: byModuleRows } = await pool.query(byModuleSql);

    
    const agingSql = `
      SELECT bucket, COUNT(*)::int AS count
      FROM (
        SELECT
          CASE
            WHEN age(now(), created_at) <= interval '7 days' THEN '0-7'
            WHEN age(now(), created_at) <= interval '30 days' THEN '8-30'
            ELSE '31+'
          END AS bucket
        FROM (
          SELECT created_at FROM risks
          UNION ALL
          SELECT created_at FROM issues
          UNION ALL
          SELECT created_at FROM dependencies
          UNION ALL
          SELECT created_at FROM escalations
          UNION ALL
          SELECT created_at FROM actions
        ) all_items
      ) x
      GROUP BY bucket;
    `;
    const { rows: agingRows } = await pool.query(agingSql);

    return res.json({
      success: true,
      data: {
        kpis,
        byModule: byModuleRows,
        aging: agingRows,
      },
    });
  } catch (err) {
    console.error("Error loading summary metrics", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load metrics" });
  }
}



export async function getPrioritySplit(req, res) {
  try {
    const { module } = req.query; 
    const cleanModule = (module || "all").toLowerCase();

    let sql = "";

    if (cleanModule === "all") {
      
      sql = `
          SELECT priority, COUNT(*)::int as count 
          FROM (
            SELECT priority FROM risks
            UNION ALL
            SELECT priority FROM issues
            UNION ALL
            SELECT priority FROM dependencies
            UNION ALL
            SELECT priority FROM escalations
            UNION ALL
            SELECT priority FROM actions
          ) all_items
          GROUP BY priority
        `;
    } else {
      let table = "";
      switch (cleanModule) {
        case "risk": table = "risks"; break;
        case "issue": table = "issues"; break;
        case "dependency": table = "dependencies"; break;
        case "escalation": table = "escalations"; break;
        case "action": table = "actions"; break;
        default: return res.status(400).json({ success: false, message: "Invalid module" });
      }

      sql = `
          SELECT priority, COUNT(*)::int as count 
          FROM ${table} 
          GROUP BY priority
        `;
    }

    const { rows } = await pool.query(sql);

    
    const result = rows.map(r => ({
      priority: r.priority || "Unassigned",
      count: Number(r.count)
    }));

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to load priority split" });
  }
}
