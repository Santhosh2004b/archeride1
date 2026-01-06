import pool from "./db.js";

async function inspect() {
    try {
        console.log("🔍 Inspecting 'issues' table...");
        const res = await pool.query("SELECT * FROM issues LIMIT 3");
        console.log(`Found ${res.rows.length} rows.`);
        if (res.rows.length > 0) {
            console.log("Keys in first row:", Object.keys(res.rows[0]));
            console.log("First row data:", res.rows[0]);
        } else {
            console.log("Table is empty.");
        }

        console.log("\n🔍 Inspecting 'risks' table...");
        const res2 = await pool.query("SELECT * FROM risks LIMIT 1");
        if (res2.rows.length > 0) {
            console.log("Keys in risks row:", Object.keys(res2.rows[0]));
        }
    } catch (err) {
        console.error("Error inspecting DB:", err);
    } finally {
        process.exit();
    }
}

inspect();
