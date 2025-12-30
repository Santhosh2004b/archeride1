import db from "../db.js";

/* ============================
   FIND USER BY EMAIL
   ============================ */
export async function findByEmail(email) {
  const result = await db.query(
    `SELECT *
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );

  return result.rows[0] || null;
}

/* ============================
   CREATE USER
   ============================ */
export async function createUser({ name, email, password_hash, role }) {
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, is_active`,
    [name, email, password_hash, role]
  );

  return result.rows[0];
}
