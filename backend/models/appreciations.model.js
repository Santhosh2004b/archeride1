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
  $1::text,
  $2::text,
  $3::date,
  $4::text,
  $5::text,
  $6::text,
  $7::text,
  $8::text,
  $9::text,
  $10::text,
  $11::boolean,
  $12::text,
  now(),
  $13::text
)
RETURNING *,
  CASE
    WHEN $10::text IS NULL OR $10::text = ''
    THEN 0
    ELSE array_length(string_to_array($10::text, ','), 1)
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
    data.shared_with_team === 'Yes' || data.shared_with_team === true,
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
      appreciation_id = $1::text,
      project_name = $2::text,
      received_date = $3::date,
      recorded_by = $4::text,
      customer_name = $5::text,
      customer_contact = $6::text,
      appreciation_type = $7::text,
      subject = $8::text,
      details = $9::text,
      team_members_recognized = $10::text,
      team_members_count = CASE
        WHEN $10::text IS NULL OR $10::text = ''
        THEN 0
        ELSE array_length(string_to_array($10::text, ','), 1)
      END,
      shared_with_team = $11::boolean,
      follow_up_action = $12::text,
      last_updated = now(),
      comments = $13::text,
      updated_at = now()
    WHERE id = $14::uuid
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
    data.shared_with_team === 'Yes' || data.shared_with_team === true,
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
