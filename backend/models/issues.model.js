// backend/models/issues.model.js
import pool from "../db.js";
import { createResolutionNotification } from "../models/notifications.model.js";

/* =======================================================
   ISSUES MODEL — PROJECT_NAME DIRECT STORAGE VERSION
   ======================================================= */

/* ============================
   LIST ISSUES (ROLE AWARE)
   ============================ */
export async function findIssues({ whereSql = "", params = [] } = {}) {
  const sql = `
    SELECT
      i.id,
      i.issue_id,
      i.manual_project_id,
      i.project_description,
      i.account,
      i.reported_date,
      i.reported_by,
      i.status,
      i.priority,
      i.category,
      i.issue_title,
      i.issue_description,
      i.impact_on_project,
      i.affected_system,
      i.assigned_to,
      i.target_resolution_date,
      i.actual_resolution_date,
      i.resolution_details,
      i.root_cause_analysis,
      i.last_updated,
      i.comments,
      i.reported_by as created_by,
      i.created_at,
      i.updated_at
    FROM issues i
    -- LEFT JOIN users u ON i.created_by = u.id
    ${whereSql}
    ORDER BY i.reported_date DESC, i.created_at DESC
  `;
  const { rows } = await pool.query(sql, params);
  return rows;
}

/* ============================
   GET ISSUE BY ID
   ============================ */
export async function findIssueById(id) {
  const sql = `
    SELECT i.*
    FROM issues i
    WHERE i.id = $1
  `;
  const { rows } = await pool.query(sql, [id]);
  return rows[0];
}

/* ============================
   CREATE ISSUE
   ============================ */
export async function createIssue(data) {
  const sql = `
    INSERT INTO issues (
      issue_id,
      manual_project_id,
      project_description,
      account,
      reported_date,
      reported_by,
      status,
      priority,
      category,
      issue_title,
      issue_description,
      impact_on_project,
      affected_system,
      assigned_to,
      target_resolution_date,
      actual_resolution_date,
      resolution_details,
      root_cause_analysis,
      last_updated,
      comments
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,
      $10,$11,$12,$13,$14,$15,$16,$17,$18,now(),$19
    )
    RETURNING *;
  `;

  const params = [
    data.issue_id,
    data.manual_project_id || null,
    data.project_description || null,
    data.account || null,
    data.reported_date,
    data.reported_by,
    data.status,
    data.priority,
    data.category,
    data.issue_title,
    data.issue_description,
    data.impact_on_project || null,
    data.affected_system || null,
    data.assigned_to || null,
    data.target_resolution_date,
    data.actual_resolution_date || null,
    data.resolution_details || null,
    data.root_cause_analysis || null,
    data.comments || null
  ];

  const { rows } = await pool.query(sql, params);
  return rows[0];
}

/* ============================
   UPDATE ISSUE
   ============================ */
export async function updateIssue(id, data) {
  const sql = `
    UPDATE issues SET
      issue_id = $1,
      manual_project_id = $20,
      project_description = $2,
      account = $3,
      reported_date = $4,
      reported_by = $5,
      status = $6,
      priority = $7,
      category = $8,
      issue_title = $9,
      issue_description = $10,
      impact_on_project = $11,
      affected_system = $12,
      assigned_to = $13,
      target_resolution_date = $14,
      actual_resolution_date = $15,
      resolution_details = $16,
      root_cause_analysis = $17,
      last_updated = now(),
      comments = $18,
      updated_at = now()
    WHERE id = $19
    RETURNING *;
  `;

  const params = [
    data.issue_id,
    data.project_description || null,
    data.account || null,
    data.reported_date,
    data.reported_by,
    data.status,
    data.priority,
    data.category,
    data.issue_title,
    data.issue_description,
    data.impact_on_project || null,
    data.affected_system || null,
    data.assigned_to || null,
    data.target_resolution_date,
    data.actual_resolution_date || null,
    data.resolution_details || null,
    data.root_cause_analysis || null,
    data.comments || null,
    id,
    data.manual_project_id // $20
  ];

  const { rows } = await pool.query(sql, params);
  const updated = rows[0];

  if (updated && String(updated.status).toLowerCase() === "resolved") {
    // Notification handled in controller now
  }

  return updated;
}

/* ============================
   KPI HELPERS
   ============================ */
export async function countAll() {
  const result = await pool.query("SELECT COUNT(*) AS c FROM issues");
  return Number(result.rows[0].c);
}

export async function countByStatus(status) {
  const result = await pool.query(
    "SELECT COUNT(*) AS c FROM issues WHERE status = $1",
    [status]
  );
  return Number(result.rows[0].c);
}
