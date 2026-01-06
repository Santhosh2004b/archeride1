import pool from './db.js';

async function check() {
    try {
        const res = await pool.query('SELECT name, email, role, user_code FROM users');
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
