import pool from "./db.js";
async function check() {
  const { rows } = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'is_read'
  `);
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}
check();
