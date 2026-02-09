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
            console.log(`Adding manual_project_id to ${table}...`);
            
            await pool.query(`
        ALTER TABLE ${table} 
        ADD COLUMN IF NOT EXISTS manual_project_id TEXT;
      `);
        }
        console.log("Migration complete!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        pool.end();
    }
}

migrate();
