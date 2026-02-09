import pool from './db.js';

async function checkProjects() {
    try {
        const res = await pool.query('SELECT count(*) FROM projects');
        console.log('Total projects count:', res.rows[0].count);

        const sample = await pool.query('SELECT * FROM projects LIMIT 5');
        console.log('Sample projects:', sample.rows);

        pool.end();
    } catch (err) {
        console.error('Error checking DB:', err);
    }
}

checkProjects();
