// backend/models/actions.model.js
import pool from "../db.js";
import { createResolutionNotification } from "../models/notifications.model.js";

/* ==========================================================
   ACTIONS MODEL — PROJECT_NAME DIRECT STORAGE VERSION
   ========================================================== */

/* ============================
   LIST ACTIONS BY USER
   ============================ */
export async function findActionsByUser(email) {
  const sql = `
    SELECT
      a.id,
      a.action_id,
      a.project_name,
      a.created_date,
      a.created_by,
      a.status,
      a.priority,
      a.action_title,
      a.action_description,
      a.action_owner,
      a.due_date,
      a.completion_date,
      a.completion_percent,
      a.created_at,
      a.updated_at
    FROM actions a
    WHERE a.created_by = $1
    ORDER BY a.created_at DESC
  `;
  const { rows } = await pool.query(sql, [email]);
  return rows;
}

/* ============================
   GET LATEST ACTION BY USER
   ============================ */
export async function findActionByUserSingle(email) {
  const sql = `
    SELECT a.*
    FROM actions a
    WHERE a.created_by = $1
    ORDER BY a.created_at DESC
    LIMIT 1
  `;
  const { rows } = await pool.query(sql, [email]);
  return rows[0] || null;
}

/* ============================
   GET ACTION BY ID
   ============================ */
export async function findActionById(id) {
  const sql = `
    SELECT a.*
    FROM actions a
    WHERE a.id = $1
  `;
  const { rows } = await pool.query(sql, [id]);
  return rows[0];
}

/* ============================
   CREATE ACTION
   ============================ */
export async function createAction(data) {
  const sql = `
    INSERT INTO actions (
      action_id,
      project_name,
      created_date,
      created_by,
      status,
      priority,
      action_title,
      action_description,
      action_owner,
      due_date,
      completion_date,
      completion_percent,
      related_to_type,
      related_to_id,
      dependencies,
      last_updated,
      comments
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,now(),$16
    )
    RETURNING *;
  `;

  const params = [
    data.action_id,
    data.project_name,
    data.created_date,
    data.created_by,
    data.status,
    data.priority,
    data.action_title,
    data.action_description,
    data.action_owner,
    data.due_date,
    data.completion_date || null,
    data.completion_percent || null,
    data.related_to_type || null,
    data.related_to_id || null,
    data.dependencies || null,
    data.comments || null
  ];

  const { rows } = await pool.query(sql, params);
  return rows[0];
}

/* ============================
   UPDATE ACTION
   ============================ */export async function updateAction(id, data) {
  const sql = `
    UPDATE actions SET
      action_id = $1,
      project_name = $2,
      created_date = $3,
      created_by = $4,
      status = $5,
      priority = $6,
      action_title = $7,
      action_description = $8,
      action_owner = $9,
      due_date = $10,
      completion_date = $11,
      completion_percent = $12,
      related_to_type = $13,
      related_to_id = $14,
      dependencies = $15,
      last_updated = now(),
      comments = $16,
      updated_at = now()
    WHERE id = $17
    RETURNING *;
  `;

  const params = [
    data.action_id,
    data.project_name,
    data.created_date,
    data.created_by,
    data.status,
    data.priority,
    data.action_title,
    data.action_description,
    data.action_owner,
    data.due_date,
    data.completion_date || null,
    data.completion_percent || null,
    data.related_to_type || null,
    data.related_to_id || null,
    data.dependencies || null,
    data.comments || null,
    id
  ];

  const { rows } = await pool.query(sql, params);
  const updated = rows[0];

  // 🔔 ***NOW reachable***
  if (String(updated.status).toLowerCase() === "resolved") {
    await createResolutionNotification({
      module: "action",
      itemId: updated.id,
      itemCode: updated.action_id,
      statusBefore: data.previous_status || null,
      statusAfter: "Resolved",
      payload: updated,
      bmUser: updated.created_by,
    });
  }

  return updated;
}

/* ============================
   KPI HELPERS
   ============================ */
export async function countAll() {
  const result = await pool.query("SELECT COUNT(*) AS c FROM actions");
  return Number(result.rows[0].c);
}

export async function countByStatus(status) {
  const result = await pool.query(
    "SELECT COUNT(*) AS c FROM actions WHERE status = $1",
    [status]
  );
  return Number(result.rows[0].c);
}

export async function countOverdue() {
  const result = await pool.query(`
    SELECT COUNT(*) AS c
    FROM actions
    WHERE due_date < now()::date
      AND status NOT IN ('Resolved', 'Cancelled')
  `);
  return Number(result.rows[0].c);
}
