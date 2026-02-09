
import pool from "../db.js";
import { createResolutionNotification } from "../models/notifications.model.js";




export async function findActionsByUser(email) {
  const sql = `
    SELECT
      a.id,
      a.action_id,
      a.manual_project_id,
      a.project_id,
      a.project_description,
      a.account,
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
    ORDER BY a.created_at DESC, a.created_date DESC
  `;
  const { rows } = await pool.query(sql, [email]);
  return rows;
}


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


export async function findActionById(id) {
  const sql = `
    SELECT a.*
    FROM actions a
    WHERE a.id = $1
  `;
  const { rows } = await pool.query(sql, [id]);
  return rows[0];
}


export async function createAction(data) {
  const sql = `
    INSERT INTO actions (
      action_id,
      manual_project_id,
      project_id,
      project_description,
      account,
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
      $11,$12,$13,$14,$15,$16,$17,$18,now(),$19
    )
    RETURNING *;
  `;

  const params = [
    data.action_id,
    data.manual_project_id || null, 
    data.project_id || null,
    data.project_description || null,
    data.account || null,
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

export async function updateAction(id, data) {
  const sql = `
    UPDATE actions SET
      action_id = $1,
      manual_project_id = $20,
      project_id = $2,
      project_description = $3,
      account = $4,
      created_date = $5,
      created_by = $6,
      status = $7,
      priority = $8,
      action_title = $9,
      action_description = $10,
      action_owner = $11,
      due_date = $12,
      completion_date = $13,
      completion_percent = $14,
      related_to_type = $15,
      related_to_id = $16,
      dependencies = $17,
      last_updated = now(),
      comments = $18,
      updated_at = now()
    WHERE id = $19
    RETURNING *;
  `;

  const params = [
    data.action_id,
    data.project_id,
    data.project_description || null,
    data.account || null,
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
    id,
    data.manual_project_id 
  ];

  const { rows } = await pool.query(sql, params);
  const updated = rows[0];

  
  
  if (String(updated.status).toLowerCase() === "resolved") {
    
  }

  return updated;
}


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
