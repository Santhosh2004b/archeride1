// backend/models/escalations.model.js
import pool from "../db.js";
import { createResolutionNotification } from "../models/notifications.model.js";

/* =======================================================
   ESCALATIONS MODEL — PROJECT_NAME DIRECT STORAGE VERSION
   ======================================================= */

/* ============================
   LIST ESCALATIONS
   ============================ */
const sql = `
    SELECT
      e.id,
      e.escalation_id,
      e.manual_project_id,
      e.project_id,
      e.project_description,
      e.account,
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
      u.email as created_by,
      e.created_at,
      e.updated_at,
      (
        SELECT json_agg(json_build_object('id', ed.id, 'file_name', ed.file_name, 'file_path', ed.file_path, 'uploaded_by', ed.uploaded_by, 'uploaded_at', ed.uploaded_at))
        FROM escalation_documents ed
        WHERE ed.escalation_id = e.id
      ) as documents
    FROM escalations e
    LEFT JOIN users u ON e.created_by = u.id
    ${whereSql}
    ORDER BY e.created_at DESC, e.reported_date DESC
  `;
const { rows } = await pool.query(sql, params);
return rows;
}

/* ============================
   GET ESCALATION BY ID
   ============================ */
export async function findEscalationById(id) {
  const sql = `
    SELECT e.*, u.email as created_by,
      (
        SELECT json_agg(json_build_object('id', ed.id, 'file_name', ed.file_name, 'file_path', ed.file_path, 'uploaded_by', ed.uploaded_by, 'uploaded_at', ed.uploaded_at))
        FROM escalation_documents ed
        WHERE ed.escalation_id = e.id
      ) as documents
    FROM escalations e
    LEFT JOIN users u ON e.created_by = u.id
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
      manual_project_id,
      project_id,
      project_description,
      account,
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
      $11,$12,$13,$14,$15,$16,$17,$18,$19,$20, $21, $22, $23
    )
    RETURNING *;
  `;

  const params = [
    data.escalation_id,
    data.manual_project_id || null,
    data.project_id || null,
    data.project_description || null,
    data.account || null,
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
      manual_project_id = $23,
      project_id = $2,
      project_description = $3,
      account = $4,
      reported_date = $5,
      reported_by = $6,
      status = $7,
      priority = $8,
      category = $9,
      title = $10,
      description = $11,
      impact = $12,
      customer_name = $13,
      escalated_to = $14,
      target_resolution_date = $15,
      actual_resolution_date = $16,
      resolution_details = $17,
      root_cause = $18,
      preventive_actions = $19,
      last_updated = $20,
      comments = $21,
      updated_at = now()
    WHERE id = $22
    RETURNING *;
  `;

  const params = [
    data.escalation_id,
    data.project_id,
    data.project_description || null,
    data.account || null,
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
    id,
    data.manual_project_id // $23
  ];

  const { rows } = await pool.query(sql, params);
  const updated = rows[0];

  return updated;
}

/* ============================
   COUNT ESCALATIONS
   ============================ */
export async function countAll() {
  const result = await pool.query("SELECT COUNT(*) AS c FROM escalations");
  return Number(result.rows[0].c);
}

export async function createEscalationDocument(data) {
  const sql = `
    INSERT INTO escalation_documents (
      escalation_id, file_name, file_type, file_path, uploaded_by
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const params = [
    data.escalation_id,
    data.file_name,
    data.file_type,
    data.file_path,
    data.uploaded_by
  ];
  const { rows } = await pool.query(sql, params);
  return rows[0];
}
