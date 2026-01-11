import pool from "./db.js";
async function check() {
    const tables = ['projects', 'risks', 'issues', 'actions', 'dependencies', 'escalations', 'appreciations', 'collections'];
    for (const table of tables) {
        const { rows } = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [table]);
        console.log(`Table: ${table}`);
        console.log(JSON.stringify(rows, null, 2));
    }
    process.exit(0);
}
check();
