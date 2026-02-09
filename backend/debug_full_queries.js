
import pool from "./db.js";

async function check() {
    try {
        console.log("Testing specific queries...");

        // 1. Cancelled
        const sqlCancelled = `
      SELECT COUNT(*) FROM (
        SELECT id FROM risks WHERE status = 'Cancelled' 
        UNION ALL SELECT id FROM issues WHERE status = 'Cancelled' 
        UNION ALL SELECT id FROM actions WHERE status = 'Cancelled' 
        UNION ALL SELECT id FROM dependencies WHERE status = 'Cancelled' 
        UNION ALL SELECT id FROM escalations WHERE status = 'Cancelled' 
      ) t
    `;
        try {
            const res = await pool.query(sqlCancelled);
            console.log("Cancelled Count (SELECT id):", res.rows[0].count);
        } catch (e) {
            console.error("Cancelled Query Failed:", e.message);
        }

        // 2. Approved & Closed
        const sqlApproved = `
      SELECT COUNT(*) FROM (
        SELECT id FROM risks WHERE status = 'Approved & Closed' 
        UNION ALL SELECT id FROM issues WHERE status = 'Approved & Closed' 
        UNION ALL SELECT id FROM actions WHERE status = 'Approved & Closed' 
        UNION ALL SELECT id FROM dependencies WHERE status = 'Approved & Closed' 
        UNION ALL SELECT id FROM escalations WHERE status = 'Approved & Closed' 
      ) t
    `;
        try {
            const res = await pool.query(sqlApproved);
            console.log("Approved Count (SELECT id):", res.rows[0].count);
        } catch (e) {
            console.error("Approved Query Failed:", e.message);
        }

        // 3. Test SELECT 1
        const sqlCancelledSafe = `
      SELECT COUNT(*) FROM (
        SELECT 1 FROM risks WHERE status = 'Cancelled' 
        UNION ALL SELECT 1 FROM issues WHERE status = 'Cancelled' 
        UNION ALL SELECT 1 FROM actions WHERE status = 'Cancelled' 
        UNION ALL SELECT 1 FROM dependencies WHERE status = 'Cancelled' 
        UNION ALL SELECT 1 FROM escalations WHERE status = 'Cancelled' 
      ) t
    `;
        try {
            const res = await pool.query(sqlCancelledSafe);
            console.log("Cancelled Count (SELECT 1):", res.rows[0].count);
        } catch (e) {
            console.error("Cancelled Safe Query Failed:", e.message);
        }

        // 4. Check 'id' column existence
        const tables = ['risks', 'issues', 'actions', 'dependencies', 'escalations'];
        for (const t of tables) {
            try {
                await pool.query(`SELECT id FROM ${t} LIMIT 1`);
                console.log(`Table ${t} has 'id' column.`);
            } catch (e) {
                console.log(`Table ${t} DOES NOT have 'id' column: ${e.message}`);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
