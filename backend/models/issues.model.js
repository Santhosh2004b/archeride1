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
      i.project_name,
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
      i.created_at,
      i.updated_at
    FROM issues i
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
      project_name,
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
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,now(),$17
    )
    RETURNING *;
  `;

  const params = [
    data.issue_id,
    data.project_name,
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
      project_name = $2,
      reported_date = $3,
      reported_by = $4,
      status = $5,
      priority = $6,
      category = $7,
      issue_title = $8,
      issue_description = $9,
      impact_on_project = $10,
      affected_system = $11,
      assigned_to = $12,
      target_resolution_date = $13,
      actual_resolution_date = $14,
      resolution_details = $15,
      root_cause_analysis = $16,
      last_updated = now(),
      comments = $17,
      updated_at = now()
    WHERE id = $18
    RETURNING *;
  `;

  const params = [
    data.issue_id,
    data.project_name,
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
    id
  ];

  const { rows } = await pool.query(sql, params);
  const updated = rows[0];

  if (updated && String(updated.status).toLowerCase() === "resolved") {
    await createResolutionNotification({
      module: "issue",
      itemId: updated.id,
      itemCode: updated.issue_id,
      statusBefore: data.previous_status || null,
      statusAfter: "Resolved",
      payload: updated,
      bmUser: updated.reported_by,
    });
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
