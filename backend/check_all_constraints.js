import pool from './db.js';

async function run() {
    const tables = ['actions', 'dependencies', 'escalations', 'collections', 'appreciations'];
    for (const t of tables) {
        const res = await pool.query(`
      SELECT column_name, is_nullable, data_type
      FROM information_schema.columns
      WHERE table_name = $1 AND is_nullable = 'NO' AND column_name NOT IN ('id', 'created_at', 'updated_at')
    `, [t]);

        if (res.rows.length > 0) {
            console.log(`\n--- ${t} NOT NULL Columns ---`);
            console.table(res.rows.map(r => ({ col: r.column_name, type: r.data_type })));
        }
    }
    pool.end();
}
run();
