import { createRisk } from './models/risks.model.js';
import pool from './db.js';

async function test() {
    try {
        const data = {
            risk_id: "TEST-002",
            // project_id is undefined
            created_by: "92c8259b-3658-4e56-979a-f77a31911a25" // valid user id from previous logs
        };
        console.log("Attempting to create risk with undefined fields + valid UUID...");
        await createRisk(data);
        console.log("Success! Undefined params are accepted.");
    } catch (err) {
        console.error("Caught error:", err.message);
    } finally {
        pool.end();
    }
}

test();
