import { createRisk } from './models/risks.model.js';
import pool from './db.js';

async function test() {
    try {
        const data = {
            risk_id: "TEST-003",
            // project_id is undefined
            created_by: "92c8259b-3658-4e56-979a-f77a31911a25",
            identified_date: new Date() // Satisfy date constraint
            // identified_by undefined
        };
        console.log("Attempting to create risk with identified_date but no identified_by...");
        await createRisk(data);
        console.log("Success! identified_by is optional.");
    } catch (err) {
        console.error("Caught error:", err.message);
    } finally {
        pool.end();
    }
}

test();
