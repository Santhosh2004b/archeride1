import pool from "./db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrate() {
    const sqlFile = path.join(__dirname, "migrations", "project_normalization.sql");
    const sql = fs.readFileSync(sqlFile, "utf-8");

    try {
        console.log("Starting project normalization migration...");
        await pool.query(sql);
        console.log("Migration completed successfully.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit(0);
    }
}

runMigrate();
