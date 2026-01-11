// backend/models/collections.model.js
import pool from "../db.js";

/* ======================================================
   COLLECTIONS MODEL — PROJECT_NAME DIRECT STORAGE VERSION
   ====================================================== */

function toNumericOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

/* =========================
   LIST (ADMIN / BM FILTER)
   ========================= */
export async function findCollectionsByUser(email) {
  const sql = `
    SELECT
      c.*
    FROM collections c
    WHERE c.created_by = $1
    ORDER BY c.invoice_date DESC, c.created_at DESC
  `;
  const { rows } = await pool.query(sql, [email]);
  return rows;
}

export async function findAllCollections(filters = {}) {
  const { whereSql, params } = filters;
  const sql = `
    SELECT
      c.*, c.manual_project_id
    FROM collections c
    ${whereSql || ""}
    ORDER BY c.invoice_date DESC, c.created_at DESC
  `;
  const { rows } = await pool.query(sql, params || []);
  return rows;
}

export async function findCollectionById(id) {
  const sql = `
    SELECT
      c.*, c.manual_project_id
    FROM collections c
    WHERE c.id = $1
  `;
  const { rows } = await pool.query(sql, [id]);
  return rows[0];
}

/* =========================
   CREATE
   ========================= */
export async function createCollection(data) {
  const sql = `
    INSERT INTO collections (
  invoice_id,
  manual_project_id,
  project_id,
  project_description,
  account,
  customer_name,
  invoice_date,
  invoice_amount,
  currency,
  due_date,
  status,
  days_overdue,
  amount_received,
  outstanding_amount,
  last_follow_up_date,
  next_follow_up_date,
  payment_status,
  follow_up_owner,
  customer_contact,
  remarks,
  created_by,
  last_updated
) VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20, $21,now()
)
RETURNING *;

  `;

  const params = [
    data.invoice_id,
    data.manual_project_id || null, // Fixed: manual_project_id is $2
    data.project_id || null, // $3
    data.project_description || null, // $4
    data.account || null,
    data.customer_name,
    data.invoice_date,
    toNumericOrNull(data.invoice_amount),
    data.currency,
    data.due_date,
    data.status,
    toNumericOrNull(data.days_overdue),
    toNumericOrNull(data.amount_received),
    toNumericOrNull(data.outstanding_amount),
    data.last_follow_up_date || null,
    data.next_follow_up_date || null,
    data.payment_status || null,
    data.follow_up_owner || null,
    data.customer_contact || null,
    data.remarks || null,
    data.created_by
  ];

  const { rows } = await pool.query(sql, params);
  return rows[0];
}

/* =========================
   UPDATE
   ========================= */
export async function updateCollection(id, data) {
  const sql = `
    UPDATE collections SET
      invoice_id = $1,
      manual_project_id = $21,
      project_id = $2,
      project_description = $3,
      account = $4,
      customer_name = $5,
      invoice_date = $6,
      invoice_amount = $7,
      currency = $8,
      due_date = $9,
      status = $10,
      days_overdue = $11,
      amount_received = $12,
      outstanding_amount = $13,
      last_follow_up_date = $14,
      next_follow_up_date = $15,
      payment_status = $16,
      follow_up_owner = $17,
      customer_contact = $18,
      remarks = $19,
      last_updated = now(),
      updated_at = now()
    WHERE id = $20
    RETURNING *;
  `;

  const params = [
    data.invoice_id,
    data.project_id,
    data.project_description || null,
    data.account || null,
    data.customer_name,
    data.invoice_date,
    toNumericOrNull(data.invoice_amount),
    data.currency,
    data.due_date,
    data.status,
    toNumericOrNull(data.days_overdue),
    toNumericOrNull(data.amount_received),
    toNumericOrNull(data.outstanding_amount),
    data.last_follow_up_date || null,
    data.next_follow_up_date || null,
    data.payment_status || null,
    data.follow_up_owner || null,
    data.customer_contact || null,
    data.remarks || null,
    id,
    data.manual_project_id // $21
  ];

  const { rows } = await pool.query(sql, params);
  return rows[0];
}

/* =========================
   KPI COUNTS
   ========================= */
export async function countAll() {
  const { rows } = await pool.query(
    "SELECT COUNT(*) AS c FROM collections"
  );
  return Number(rows[0].c);
}

export async function countByStatus(status) {
  const { rows } = await pool.query(
    "SELECT COUNT(*) AS c FROM collections WHERE status = $1",
    [status]
  );
  return Number(rows[0].c);
}
