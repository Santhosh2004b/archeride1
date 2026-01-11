import pool from './db.js';

async function run() {
    const res = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'projects'
  `);
    console.table(res.rows.map(r => ({ col: r.column_name, type: r.data_type })));
    pool.end();
}
run();
