// backend/models/appreciations.model.js
import pool from "../db.js";

/* ==========================================================
   APPRECIATIONS MODEL — PROJECT_NAME DIRECT STORAGE VERSION
   ========================================================== */
/* ============================
   LIST (ROLE AWARE, UI READY)
   ============================ */
export async function findAppreciations({ whereSql = "", params = [] } = {}) {
  const sql = `
    SELECT
      a.id,
      a.appreciation_id,
      a.project_name,

      a.received_date,
      a.recorded_by,
      a.customer_name,
      a.customer_contact,
      a.appreciation_type,
      a.subject,
      a.details,
      a.team_members_recognized,

      CASE
        WHEN a.team_members_recognized IS NULL OR a.team_members_recognized = ''
        THEN 0
        ELSE array_length(string_to_array(a.team_members_recognized, ','), 1)
      END AS team_members_count,

      a.shared_with_team,
      a.follow_up_action,
      a.comments,

      a.created_at,
      a.updated_at

    FROM appreciations a
    ${whereSql}
    ORDER BY a.received_date DESC, a.created_at DESC
  `;
  const { rows } = await pool.query(sql, params);
  return rows;
}

/* ============================
   GET BY ID
   ============================ */
export async function findAppreciationById(id) {
  const sql = `
    SELECT
      a.id,
      a.appreciation_id,
      a.project_name,

      a.received_date,
      a.recorded_by,
      a.customer_name,
      a.customer_contact,
      a.appreciation_type,
      a.subject,
      a.details,
      a.team_members_recognized,

      CASE
        WHEN a.team_members_recognized IS NULL OR a.team_members_recognized = ''
        THEN 0
        ELSE array_length(string_to_array(a.team_members_recognized, ','), 1)
      END AS team_members_count,

      a.shared_with_team,
      a.follow_up_action,
      a.comments,
      a.created_at,
      a.updated_at

    FROM appreciations a
    WHERE a.id = $1
  `;
  const { rows } = await pool.query(sql, [id]);
  return rows[0];
}

/* ============================
   CREATE
   ============================ */
export async function createAppreciation(data) {
  const sql = `
   INSERT INTO appreciations (
  appreciation_id,
  project_name,
  received_date,
  recorded_by,
  customer_name,
  customer_contact,
  appreciation_type,
  subject,
  details,
  team_members_recognized,
  shared_with_team,
  follow_up_action,
  last_updated,
  comments
) VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8,$9,
  $10,
  $11,
  $12,
  now(),
  $13
)
RETURNING *,
  CASE
    WHEN $10 IS NULL OR $10 = ''
    THEN 0
    ELSE array_length(string_to_array($10, ','), 1)
  END as team_members_count;

  `;

  const params = [
    data.appreciation_id,
    data.project_name,
    data.received_date,
    data.recorded_by,
    data.customer_name,
    data.customer_contact || null,
    data.appreciation_type,
    data.subject,
    data.details,
    data.team_members_recognized || null,
    data.shared_with_team ?? false,
    data.follow_up_action || null,
    data.comments || null
  ];

  const { rows } = await pool.query(sql, params);
  return rows[0];
}

/* ============================
   UPDATE
   ============================ */
export async function updateAppreciation(id, data) {
  const sql = `
    UPDATE appreciations SET
      appreciation_id = $1,
      project_name = $2,
      received_date = $3,
      recorded_by = $4,
      customer_name = $5,
      customer_contact = $6,
      appreciation_type = $7,
      subject = $8,
      details = $9,
      team_members_recognized = $10,

      team_members_count = CASE
        WHEN $10 IS NULL OR $10 = ''
        THEN 0
        ELSE array_length(string_to_array($10, ','), 1)
      END,

      shared_with_team = $11,
      follow_up_action = $12,
      last_updated = now(),
      comments = $13,
      updated_at = now()
    WHERE id = $14
    RETURNING *;
  `;

  const params = [
    data.appreciation_id,
    data.project_name,
    data.received_date,
    data.recorded_by,
    data.customer_name,
    data.customer_contact || null,
    data.appreciation_type,
    data.subject,
    data.details,
    data.team_members_recognized || null,
    data.shared_with_team ?? false,
    data.follow_up_action || null,
    data.comments || null,
    id
  ];

  const { rows } = await pool.query(sql, params);
  return rows[0];
}

/* ============================
   COUNT
   ============================ */
export async function countAll() {
  const { rows } = await pool.query(
    "SELECT COUNT(*) AS c FROM appreciations"
  );
  return Number(rows[0].c);
}
