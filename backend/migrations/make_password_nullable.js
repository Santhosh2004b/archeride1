import pool from '../db.js';

async function migrate() {
    console.log("Making password_hash nullable in users table...");
    try {
        await pool.query(`
            ALTER TABLE users 
            ALTER COLUMN password_hash DROP NOT NULL;
        `);
        console.log("Migration complete: password_hash is now nullable.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        pool.end();
    }
}

migrate();
