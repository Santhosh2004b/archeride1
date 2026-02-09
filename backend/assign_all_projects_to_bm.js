import pool from './db.js';

async function run() {
    try {
        
        const email = 'bm@example.com';
        const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (userRes.rows.length === 0) {
            console.log(`User ${email} not found.`);
            process.exit(1);
        }
        const userId = userRes.rows[0].id;

        
        const projectsRes = await pool.query("SELECT id, name FROM projects");
        const projects = projectsRes.rows;

        console.log(`Found user ${userId} and ${projects.length} projects.`);

        
        for (const p of projects) {
            
            
            await pool.query(
                `INSERT INTO user_projects (user_id, project_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, project_id) DO NOTHING`,
                [userId, p.id]
            );
        }

        console.log(`Assigned ${projects.length} projects to ${email}.`);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

run();
