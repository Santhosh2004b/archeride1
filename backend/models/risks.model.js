// backend/models/risks.model.js
import pool from "../db.js";
import { createResolutionNotification } from "../models/notifications.model.js";

/* =======================================================
   RISKS MODEL — PROJECT_NAME DIRECT STORAGE VERSION
   ======================================================= */

/* ============================
   LIST RISKS (ROLE AWARE)
   ============================ */
export async function findRisks({ whereSql = "", params = [] } = {}) {
  const sql = `
    SELECT
      r.id,
      r.risk_id,
      r.project_name,
      r.identified_date,
      r.identified_by,
      r.status,
      r.priority,
      r.category,
      r.risk_title,
      r.risk_description,
      r.probability,
      r.impact,
      r.risk_score,
      r.mitigation_strategy,
      r.mitigation_owner,
      r.target_mitigation_date,
      r.current_status,
      r.last_reviewed_date,
      r.comments,
      r.created_by,
      r.created_at,
      r.updated_at
    FROM risks r
    ${whereSql}
    ORDER BY r.identified_date DESC, r.created_at DESC
  `;

  const { rows } = await pool.query(sql, params);
  return rows;
}

/* ============================
   GET BY ID
   ============================ */
export async function findRiskById(id) {
  const sql = `
    SELECT r.*
    FROM risks r
    WHERE r.id = $1
  `;
  const { rows } = await pool.query(sql, [id]);
  return rows[0];
}

/* ============================
   CREATE RISK (OWNERSHIP)
   ============================ */
export async function createRisk(data) {
  const sql = `
    INSERT INTO risks (
      risk_id,
      project_name,
      identified_date,
      identified_by,
      status,
      priority,
      category,
      risk_title,
      risk_description,
      probability,
      impact,
      risk_score,
      mitigation_strategy,
      mitigation_owner,
      target_mitigation_date,
      current_status,
      last_reviewed_date,
      comments,
      created_by
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,$19
    )
    RETURNING *;
  `;

  const params = [
    data.risk_id,
    data.project_name,
    data.identified_date,
    data.identified_by,
    data.status,
    data.priority,
    data.category,
    data.risk_title,
    data.risk_description,
    data.probability,
    data.impact,
    data.risk_score || null,
    data.mitigation_strategy || null,
    data.mitigation_owner || null,
    data.target_mitigation_date || null,
    data.current_status || null,
    data.last_reviewed_date || null,
    data.comments || null,
    data.created_by, // ROLE LOCK
  ];

  const { rows } = await pool.query(sql, params);
  return rows[0];
}

/* ============================
   UPDATE RISK
   ============================ */
export async function updateRisk(id, data) {
  const sql = `
    UPDATE risks SET
      risk_id = $1,
      project_name = $2,
      identified_date = $3,
      identified_by = $4,
      status = $5,
      priority = $6,
      category = $7,
      risk_title = $8,
      risk_description = $9,
      probability = $10,
      impact = $11,
      risk_score = $12,
      mitigation_strategy = $13,
      mitigation_owner = $14,
      target_mitigation_date = $15,
      current_status = $16,
      last_reviewed_date = $17,
      comments = $18,
      updated_at = NOW()
    WHERE id = $19
    RETURNING *;
  `;

  const params = [
    data.risk_id,
    data.project_name,
    data.identified_date,
    data.identified_by,
    data.status,
    data.priority,
    data.category,
    data.risk_title,
    data.risk_description,
    data.probability,
    data.impact,
    data.risk_score || null,
    data.mitigation_strategy || null,
    data.mitigation_owner || null,
    data.target_mitigation_date || null,
    data.current_status || null,
    data.last_reviewed_date || null,
    data.comments || null,
    id,
  ];

  const { rows } = await pool.query(sql, params);
  const updated = rows[0];

  if (String(updated.status).toLowerCase() === "resolved") {
    await createResolutionNotification({
      module: "risk",
      itemId: updated.id,
      itemCode: updated.risk_id,
      statusBefore: data.previous_status || null,
      statusAfter: "Resolved",
      payload: updated,
      bmUser: updated.identified_by,
    });
  }

  return updated;
}
/* ============================
   COUNT HELPERS
   ============================ */
export async function countAll() {
  const result = await pool.query("SELECT COUNT(*) AS c FROM risks");
  return Number(result.rows[0].c);
}

export async function countByStatus(status) {
  const result = await pool.query(
    "SELECT COUNT(*) AS c FROM risks WHERE status = $1",
    [status]
  );
  return Number(result.rows[0].c);
}

/* ============================
   UPDATE ONLY STATUS (ADMIN)
   ============================ */
export async function updateRiskStatus(id, status) {
  const sql = `
    UPDATE risks
    SET status = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;
  const { rows } = await pool.query(sql, [status, id]);
  return rows[0];
}
