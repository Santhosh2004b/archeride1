
import pool from "./db.js";

async function check() {
    try {
        console.log("Checking distinct statuses in RISKS table:");
        const res = await pool.query("SELECT DISTINCT status FROM risks");
        res.rows.forEach(r => console.log(`'${r.status}'`));

        console.log("\nChecking counts for 'Cancelled':");
        const count = await pool.query("SELECT count(*) FROM risks WHERE status = 'Cancelled'");
        console.log("Exact match 'Cancelled':", count.rows[0].count);

        const countLower = await pool.query("SELECT count(*) FROM risks WHERE lower(status) = 'cancelled'");
        console.log("Case insensitive 'cancelled':", countLower.rows[0].count);

        const countLike = await pool.query("SELECT count(*) FROM risks WHERE status LIKE '%Cancelled%'");
        console.log("Like '%Cancelled%':", countLike.rows[0].count);

        // Check if other tables have cancelled
        console.log("\nChecking other tables for 'Cancelled':");
        const tables = ['issues', 'actions', 'dependencies', 'escalations'];
        for (const t of tables) {
            const c = await pool.query(`SELECT count(*) FROM ${t} WHERE status = 'Cancelled'`);
            console.log(`${t}: ${c.rows[0].count}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
