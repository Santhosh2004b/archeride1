import pool from './db.js';

async function migrate() {
    const tables = [
        'risks',
        'issues',
        'actions',
        'dependencies',
        'escalations',
        'collections',
        'appreciations'
    ];

    try {
        for (const table of tables) {
            console.log(`Altering ${table}: Making project_id nullable...`);
            await pool.query(`
        ALTER TABLE ${table} 
        ALTER COLUMN project_id DROP NOT NULL;
      `);
        }
        console.log("Migration complete: project_id is now nullable.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        pool.end();
    }
}

migrate();
