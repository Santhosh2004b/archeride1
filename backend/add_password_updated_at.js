import pool from "./db.js";

async function migrate() {
    try {
        console.log("Starting migration: adding password_updated_at to users table...");

        
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        `);

        
        await pool.query(`
            UPDATE users 
            SET password_updated_at = created_at 
            WHERE password_updated_at IS NULL
        `);

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
