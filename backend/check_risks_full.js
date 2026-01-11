import pool from './db.js';

async function run() {
    const res = await pool.query(`
    SELECT column_name, is_nullable, data_type
    FROM information_schema.columns
    WHERE table_name = 'risks'
  `);
    console.table(res.rows.map(r => ({ col: r.column_name, null: r.is_nullable, type: r.data_type })));
    pool.end();
}
run();
