// backend/controllers/metrics.controller.js
import pool from "../db.js";

export async function getSummaryMetrics(req, res) {
  try {
    // total by status across all modules
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

    // items by module for donut + stacked
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

    // aging buckets example (0–7, 8–30, 31+ days since created_at)
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
