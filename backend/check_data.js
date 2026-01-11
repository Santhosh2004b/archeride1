import pool from './db.js';

async function check() {
    const tables = ['risks', 'issues', 'actions', 'dependencies', 'escalations', 'collections', 'appreciations'];

    console.log("Checking table counts...");
    for (const t of tables) {
        try {
            const resCount = await pool.query(`SELECT COUNT(*) FROM ${t}`);
            const resNull = await pool.query(`SELECT COUNT(*) FROM ${t} WHERE project_id IS NULL`);
            console.log(`${t}: Total=${resCount.rows[0].count}, NullProject=${resNull.rows[0].count}`);
        } catch (e) {
            console.log(`${t}: Error - ${e.message}`);
        }
    }

    console.log("\nChecking Users...");
    try {
        const resUsers = await pool.query(`SELECT id, email, role FROM users`);
        resUsers.rows.forEach(u => {
            console.log(`User: ${u.email} (${u.role}) ID=${u.id}`);
        });
    } catch (e) {
        console.log(`Users Error: ${e.message}`);
    }

    pool.end();
}

check();
