import db from "../db.js";

export async function generateEntityId(userEmail, projectName, entityType) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

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

        const userRes = await client.query('SELECT id FROM users WHERE email = $1', [userEmail]);
        if (userRes.rows.length === 0) {
            throw new Error(`User not found: ${userEmail}`);
        }
        const { id: userId } = userRes.rows[0];

        let accountCode = "GEN";
        if (projectName && typeof projectName === 'string' && projectName.trim().length > 0) {
            accountCode = projectName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
            if (accountCode.length < 3) accountCode = accountCode.padEnd(3, 'X');
        }

        const seqRes = await client.query(`
            INSERT INTO user_entity_sequences (user_id, entity_type, last_value)
            VALUES ($1, $2, 1)
            ON CONFLICT (user_id, entity_type)
            DO UPDATE SET last_value = user_entity_sequences.last_value + 1
            RETURNING last_value
        `, [userId, entityType.toLowerCase()]);

        const nextVal = seqRes.rows[0].last_value;
        const paddedVal = String(nextVal).padStart(3, '0');

        const generatedId = `${prefix}-${accountCode}-${paddedVal}`;

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

export async function previewEntityId(userEmail, projectName, entityType) {
    const client = await db.connect();
    try {
        // No transaction needed for read-only preview

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

        const userRes = await client.query('SELECT id FROM users WHERE email = $1', [userEmail]);
        if (userRes.rows.length === 0) {
            return "USER-ERR";
        }
        const { id: userId } = userRes.rows[0];

        let accountCode = "GEN";
        if (projectName && typeof projectName === 'string' && projectName.trim().length > 0) {
            accountCode = projectName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
            if (accountCode.length < 3) accountCode = accountCode.padEnd(3, 'X');
        }

        // Check current sequence without incrementing
        const seqRes = await client.query(`
            SELECT last_value FROM user_entity_sequences 
            WHERE user_id = $1 AND entity_type = $2
        `, [userId, entityType.toLowerCase()]);

        let nextVal = 1;
        if (seqRes.rows.length > 0) {
            nextVal = seqRes.rows[0].last_value + 1;
        }

        const paddedVal = String(nextVal).padStart(3, '0');
        return `${prefix}-${accountCode}-${paddedVal}`;

    } catch (err) {
        console.error("ID Preview Error:", err);
        return "PREVIEW-ERR";
    } finally {
        if (client) client.release();
    }
}
