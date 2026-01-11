import pool from "../config/db.config.js";

// === 🔹 LATEST RISKS (Top-5) ===
export async function getLatestRisks(req, res) {
  try {
    const sql = `
      SELECT risk_id AS id, risk_title AS title, priority, status
      FROM risks
      ORDER BY identified_date DESC, created_at DESC
      LIMIT 5;
    `;
    const { rows } = await pool.query(sql);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("latest risks error:", err);
    return res.status(500).json({ success: false });
  }
}

// === 🔹 LATEST COLLECTIONS (Top-5 Priority: overdue first) ===
export async function getLatestCollections(req, res) {
  try {
    const sql = `
      SELECT invoice_id AS invoice, customer_name AS customer,
             outstanding_amount AS due, status
      FROM collections
      ORDER BY
         (status='Overdue') DESC,
         due_date ASC,
         outstanding_amount DESC
      LIMIT 5;
    `;
    const { rows } = await pool.query(sql);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("latest collections error:", err);
    return res.status(500).json({ success: false });
  }
}

// === 🔹 LATEST DEPENDENCIES (Top-5) ===
export async function getLatestDependencies(req, res) {
  try {
    const sql = `
      SELECT dependency_id AS dep, project_name AS owner,
             dependent_on AS blocker, status
      FROM dependencies
      ORDER BY reported_date DESC, created_at DESC
      LIMIT 5;
    `;
    const { rows } = await pool.query(sql);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("latest dependencies error:", err);
    return res.status(500).json({ success: false });
  }
}


