import pool from "./db.js";

async function verify() {
    const email = "admin@example.com"; 
    try {
        console.log(`Setting password expiration for ${email}...`);

        
        await pool.query(`
            UPDATE users 
            SET password_updated_at = NOW() - INTERVAL '31 days' 
            WHERE email = $1
        `, [email]);

        console.log(`Done. Now try logging into the platform with ${email}. 
You should be prompted to reset your password.`);
        process.exit(0);
    } catch (err) {
        console.error("Verification setup failed:", err);
        process.exit(1);
    }
}

verify();
