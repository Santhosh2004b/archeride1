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

export async function findAllCollections() {
  const sql = `
    SELECT
      c.*
    FROM collections c
    ORDER BY c.invoice_date DESC, c.created_at DESC
  `;
  const { rows } = await pool.query(sql);
  return rows;
}

export async function findCollectionById(id) {
  const sql = `
    SELECT
      c.*
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
  project_name,
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
  $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,now()
)
RETURNING *;

  `;

  const params = [
    data.invoice_id,
    data.project_name,
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
      project_name = $2,
      customer_name = $3,
      invoice_date = $4,
      invoice_amount = $5,
      currency = $6,
      due_date = $7,
      status = $8,
      days_overdue = $9,
      amount_received = $10,
      outstanding_amount = $11,
      last_follow_up_date = $12,
      next_follow_up_date = $13,
      payment_status = $14,
      follow_up_owner = $15,
      customer_contact = $16,
      remarks = $17,
      last_updated = now(),
      updated_at = now()
    WHERE id = $18
    RETURNING *;
  `;

  const params = [
    data.invoice_id,
    data.project_name,
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
    id
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
