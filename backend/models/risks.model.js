
import pool from "../db.js";
import { createResolutionNotification } from "../models/notifications.model.js";




export async function findRisks({ whereSql = "", params = [] } = {}) {
  const sql = `
    SELECT
      r.id,
      r.risk_id,
      r.manual_project_id,
      r.project_description,
      r.account,
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
      u.email as created_by,
      r.created_at,
      r.updated_at
    FROM risks r
    LEFT JOIN users u ON r.created_by = u.id
    ${whereSql}
    ORDER BY r.created_at DESC, r.identified_date DESC
  `;

  const { rows } = await pool.query(sql, params);
  return rows;
}


export async function findRiskById(id) {
  const sql = `
    SELECT r.*
    FROM risks r
    WHERE r.id = $1
  `;
  const { rows } = await pool.query(sql, [id]);
  return rows[0];
}


export async function createRisk(data) {
  const sql = `
    INSERT INTO risks (
      risk_id,
      manual_project_id,
      project_description,
      account,
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
      $11,$12,$13,$14,$15,$16,$17,$18,$19,$20, $21
    )
    RETURNING *;
  `;

  const params = [
    data.risk_id,
    data.manual_project_id || null, 
    data.project_description || null,
    data.account || null,
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
    data.created_by, 
  ];

  const { rows } = await pool.query(sql, params);
  return rows[0];
}


export async function updateRisk(id, data) {
  const sql = `
    UPDATE risks SET
      risk_id = $1,
      manual_project_id = $21,
      project_description = $2,
      account = $3,
      identified_date = $4,
      identified_by = $5,
      status = $6,
      priority = $7,
      category = $8,
      risk_title = $9,
      risk_description = $10,
      probability = $11,
      impact = $12,
      risk_score = $13,
      mitigation_strategy = $14,
      mitigation_owner = $15,
      target_mitigation_date = $16,
      current_status = $17,
      last_reviewed_date = $18,
      comments = $19,
      updated_at = NOW()
    WHERE id = $20
    RETURNING *;
  `;

  const params = [
    data.risk_id,
    data.project_description || null,
    data.account || null,
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
    data.manual_project_id, 
  ];

  const { rows } = await pool.query(sql, params);
  const updated = rows[0];

  if (String(updated.status).toLowerCase() === "resolved") {
    
  }

  return updated;
}

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
