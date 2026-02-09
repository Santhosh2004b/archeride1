import pool from './db.js';

async function checkSpecificProjects() {
    try {
        
        const res = await pool.query("SELECT * FROM projects WHERE name ILIKE 'SI%' OR name ILIKE 'SP%' LIMIT 10");
        console.log('Found specific projects:', res.rows.length);
        console.log(res.rows);

        if (res.rows.length === 0) {
            console.log("WARNING: The seeded data (SI_..., SP_...) matches were NOT found.");
        } else {
            console.log("SUCCESS: Seeded data is present.");
        }

        pool.end();
    } catch (err) {
        console.error('Error checking DB:', err);
    }
}

checkSpecificProjects();
