// backend/utils/metrics.utils.js
import pool from "../config/db.config.js";
// utils/metrics.utils.js

export async function buildTrendCollections() {
  const q = `
    SELECT TO_CHAR(invoice_date, 'Mon') AS month,
           COUNT(*) as value
    FROM collections
    GROUP BY 1
    ORDER BY MIN(invoice_date);
  `;
  return (await pool.query(q)).rows;
}

export async function buildTrendClosedIssues() {
  const q = `
    SELECT TO_CHAR(actual_resolution_date, 'Mon') AS month,
           COUNT(*) AS value
    FROM issues
    WHERE status = 'Resolved' AND actual_resolution_date IS NOT NULL
    GROUP BY 1
    ORDER BY MIN(actual_resolution_date);
  `;
  return (await pool.query(q)).rows;
}

export async function buildTrendEscalations() {
  const q = `
    SELECT TO_CHAR(reported_date, 'Mon') AS month,
           COUNT(*) AS value
    FROM escalations
    GROUP BY 1
    ORDER BY MIN(reported_date);
  `;
  return (await pool.query(q)).rows;
}

/** Monthly Risk Trend: for line chart */
export async function buildMonthlyRiskTrend() {
  const result = await pool.query(`
    SELECT
      to_char(identified_date, 'Mon') AS month,
      COUNT(*)::int AS count
    FROM risks
    GROUP BY month
    ORDER BY MIN(identified_date)
  `);
  return result.rows;
}

/** Action completion %: for gauge chart */
export async function buildActionCompletion() {
  const result = await pool.query(`
    SELECT
      (SUM(CASE WHEN completion_percent = 100 THEN 1 ELSE 0 END)::float
      / NULLIF(COUNT(*),0)) * 100 AS percent
    FROM actions
  `);
  return Number(result.rows[0].percent || 0);
}

/** Module Status Distribution: for stacked column chart */
export async function buildModuleStatusDistribution() {
  const queries = {
    risks: "SELECT status, COUNT(*)::int AS count FROM risks GROUP BY status",
    issues: "SELECT status, COUNT(*)::int AS count FROM issues GROUP BY status",
    actions: "SELECT status, COUNT(*)::int AS count FROM actions GROUP BY status",
    dependencies: "SELECT status, COUNT(*)::int AS count FROM dependencies GROUP BY status",
    escalations: "SELECT status, COUNT(*)::int AS count FROM escalations GROUP BY status"
  };

  const modules = {};

  for (const [module, sql] of Object.entries(queries)) {
    const rows = (await pool.query(sql)).rows;
    modules[module] = rows;
  }

  return modules;
}
