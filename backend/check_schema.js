import pool from './db.js';

async function run() {
  const res = await pool.query(`
    SELECT column_name, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'risks' AND column_name = 'project_id'
  `);
  console.log(res.rows);
  pool.end();
}
run();
