import pool from "./db.js";

async function inspect() {
    const id = process.argv[2];
    try {
        console.log(`🔍 Inspecting Issue ID: ${id}`);
        const res = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);
        if (res.rows.length > 0) {
            console.log("Row Found:", res.rows[0]);
        } else {
            console.log("Row NOT found in issues table.");
            
            const res2 = await pool.query("SELECT * FROM risks WHERE id = $1", [id]);
            if (res2.rows.length > 0) {
                console.log("WAIT! It was found in RISKS table!", res2.rows[0]);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

inspect();
