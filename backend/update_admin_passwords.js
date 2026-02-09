import pool from "./db.js";
import bcrypt from "bcrypt";

const ADMIN_CONFIG = {
    "sathishbalaji.k@arche.global": "Sathishbalaji@Arche2026",
    "ajaykumar.j@arche.global": "Ajaykumar@Arche2026",
    "sukanya.p@arche.global": "Sukanya@Arche2026",
    "santhosh.b@arche.global": "Santhosh@Arche2026",
    "rachana.pk@arche.global": "Rachana@Arche2026",
    "sindhu@arche.global": "Sindhu@Arche2026",
    "admin@arche.global": "Admin@Arche2026"
};

async function updatePasswords() {
    console.log("Starting Admin Password Update...");

    for (const [email, password] of Object.entries(ADMIN_CONFIG)) {
        try {
            const emailLower = email.toLowerCase().trim();
            const hash = await bcrypt.hash(password, 10);

            // Check if user exists
            const res = await pool.query("SELECT id FROM users WHERE lower(email) = $1", [emailLower]);

            if (res.rows.length > 0) {
                // Update existing user
                await pool.query(
                    "UPDATE users SET password_hash = $1, role = 'ADMIN', password_updated_at = NOW() WHERE lower(email) = $2",
                    [hash, emailLower]
                );
                console.log(`Updated password for existing user: ${email}`);
            } else {
                // Create new user (fallback if they were deleted or logic failed)
                await pool.query(
                    "INSERT INTO users (name, email, password_hash, role, created_at, updated_at) VALUES ($1, $2, $3, 'ADMIN', NOW(), NOW())",
                    [email.split('@')[0].replace('.', ' '), emailLower, hash]
                );
                console.log(`Created new admin user: ${email}`);
            }
        } catch (err) {
            console.error(`Failed to update ${email}:`, err);
        }
    }

    console.log("Password update complete.");
    process.exit();
}

updatePasswords();
