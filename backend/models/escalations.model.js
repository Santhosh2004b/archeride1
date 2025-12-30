// backend/models/escalations.model.js
import pool from "../db.js";
import { createResolutionNotification } from "../models/notifications.model.js";

/* =======================================================
   ESCALATIONS MODEL — PROJECT_NAME DIRECT STORAGE VERSION
   ======================================================= */

/* ============================
   LIST ESCALATIONS
   ============================ */
export async function findEscalations({ whereSql = "", params = [] } = {}) {
  const sql = `
    SELECT
      e.id,
      e.escalation_id,
      e.project_name,
      e.reported_date,
      e.reported_by,
      e.status,
      e.priority,
      e.category,
      e.title,
      e.description,
      e.impact,
      e.customer_name,
      e.escalated_to,
      e.target_resolution_date,
      e.actual_resolution_date,
      e.resolution_details,
      e.root_cause,
      e.preventive_actions,
      e.last_updated,
      e.comments,
      e.created_by,
      e.created_at,
      e.updated_at
    FROM escalations e
    ${whereSql}
    ORDER BY e.reported_date DESC, e.created_at DESC
  `;
  const { rows } = await pool.query(sql, params);
  return rows;
}

/* ============================
   GET ESCALATION BY ID
   ============================ */
export async function findEscalationById(id) {
  const sql = `
    SELECT e.*
    FROM escalations e
    WHERE e.id = $1
  `;
  const { rows } = await pool.query(sql, [id]);
  return rows[0];
}

/* ============================
   GET ESCALATION BY USER
   ============================ */
export async function findEscalationByUser(userId) {
  const sql = `
    SELECT *
    FROM escalations
    WHERE created_by = $1
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const { rows } = await pool.query(sql, [userId]);
  return rows[0] || null;
}

/* ============================
   CREATE ESCALATION
   ============================ */
export async function createEscalation(data, userId) {
  const sql = `
    INSERT INTO escalations (
      escalation_id,
      project_name,
      reported_date,
      reported_by,
      status,
      priority,
      category,
      title,
      description,
      impact,
      customer_name,
      escalated_to,
      target_resolution_date,
      actual_resolution_date,
      resolution_details,
      root_cause,
      preventive_actions,
      last_updated,
      comments,
      created_by
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,$19,$20
    )
    RETURNING *;
  `;

  const params = [
    data.escalation_id,
    data.project_name,
    data.reported_date,
    data.reported_by,
    data.status,
    data.priority,
    data.category,
    data.title,
    data.description,
    data.impact,
    data.customer_name || null,
    data.escalated_to || null,
    data.target_resolution_date,
    data.actual_resolution_date || null,
    data.resolution_details || null,
    data.root_cause || null,
    data.preventive_actions || null,
    data.last_updated,
    data.comments || null,
    userId
  ];

  const { rows } = await pool.query(sql, params);
  return rows[0];
}

/* ============================
   UPDATE ESCALATION
   ============================ */
export async function updateEscalation(id, data) {
  const sql = `
    UPDATE escalations SET
      escalation_id = $1,
      project_name = $2,
      reported_date = $3,
      reported_by = $4,
      status = $5,
      priority = $6,
      category = $7,
      title = $8,
      description = $9,
      impact = $10,
      customer_name = $11,
      escalated_to = $12,
      target_resolution_date = $13,
      actual_resolution_date = $14,
      resolution_details = $15,
      root_cause = $16,
      preventive_actions = $17,
      last_updated = $18,
      comments = $19,
      updated_at = now()
    WHERE id = $20
    RETURNING *;
  `;

  const params = [
    data.escalation_id,
    data.project_name,
    data.reported_date,
    data.reported_by,
    data.status,
    data.priority,
    data.category,
    data.title,
    data.description,
    data.impact,
    data.customer_name || null,
    data.escalated_to || null,
    data.target_resolution_date,
    data.actual_resolution_date || null,
    data.resolution_details || null,
    data.root_cause || null,
    data.preventive_actions || null,
    data.last_updated,
    data.comments || null,
    id
  ];

  const { rows } = await pool.query(sql, params);
  const updated = rows[0];

  if (updated && String(updated.status).toLowerCase() === "resolved") {
    await createResolutionNotification({
      module: "escalation",
      itemId: updated.id,
      itemCode: updated.escalation_id,
      statusBefore: data.previous_status || null,
      statusAfter: "Resolved",
      payload: updated,
      bmUser: updated.reported_by,
    });
  }

  return updated;
}

/* ============================
   COUNT ESCALATIONS
   ============================ */
export async function countAll() {
  const result = await pool.query("SELECT COUNT(*) AS c FROM escalations");
  return Number(result.rows[0].c);
}
