import db from "../db.js";

export async function generateEntityId(userEmail, projectName, entityType) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. Define Prefixes
        const prefixMap = {
            risk: "RSK",
            issue: "ISS",
            dependency: "DEP",
            escalation: "ESC",
            action: "ACT",
            appreciation: "APP",
            collection: "INV",
            project: "PRJ"
        };

        const prefix = prefixMap[entityType.toLowerCase()] || "GEN";

        // 2. Get User Code
        const userRes = await client.query('SELECT id, user_code FROM users WHERE email = $1', [userEmail]);
        if (userRes.rows.length === 0) {
            throw new Error(`User not found: ${userEmail}`);
        }
        const { id: userId, user_code: userCode } = userRes.rows[0];

        // 3. Get and Increment Sequence
        const seqRes = await client.query(`
            INSERT INTO user_entity_sequences (user_id, entity_type, last_value)
            VALUES ($1, $2, 1)
            ON CONFLICT (user_id, entity_type)
            DO UPDATE SET last_value = user_entity_sequences.last_value + 1
            RETURNING last_value
        `, [userId, entityType.toLowerCase()]);

        const nextVal = seqRes.rows[0].last_value;
        const paddedVal = String(nextVal).padStart(3, '0');

        const generatedId = `${prefix}-${userCode}-${paddedVal}`; // e.g., RSK-BM1-001

        await client.query('COMMIT');

        console.log(`🆔 Generated Sequential ID for ${entityType}: ${generatedId}`);
        return generatedId;

    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error("ID Generation Error:", err);
        return `${entityType.toUpperCase().slice(0, 3)}-ERR-${Math.floor(Math.random() * 999)}`;
    } finally {
        if (client) client.release();
    }
}
