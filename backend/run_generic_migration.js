import pool from "./config/db.config.js"; 
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";







const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationFile = process.argv[2];

if (!migrationFile) {
    console.error("Please provide a migration file path relative to backend root.");
    process.exit(1);
}

async function runMigrate() {
    const sqlFile = path.resolve(__dirname, migrationFile);
    console.log(`Reading migration from: ${sqlFile}`);
    try {
        const sql = fs.readFileSync(sqlFile, "utf-8");
        console.log("Executing migration...");
        await pool.query(sql);
        console.log("Migration completed successfully.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit(0);
    }
}

runMigrate();
