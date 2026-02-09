import pool from "./db.js";

async function checkAndSeed() {
    try {
        console.log("Checking for users...");
        const { rows } = await pool.query("SELECT * FROM users LIMIT 1");
        if (rows.length === 0) {
            console.log("No users found. Seeding default user...");
            const id = "92c8259b-3658-4e56-979a-f77a31911a25"; 
            const sql = `
        INSERT INTO users (id, name, email, password_hash, role, is_active)
        VALUES ($1, 'Default Admin', 'admin@example.com', 'hash', 'ADMIN', true)
        RETURNING *;
      `;
            const created = await pool.query(sql, [id]);
            console.log("Seeded user:", created.rows[0]);
        } else {
            console.log("Users exist. First user:", rows[0]);
        }
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkAndSeed();
