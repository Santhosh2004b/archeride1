// backend/run_user_projects_migration.js
import pool from "./db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, "migrations", "user_projects.sql"), "utf8");
        await pool.query(sql);
        console.log("user_projects migration completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

run();
