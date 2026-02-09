import { generateEntityId } from './utils/idGenerator.js';
import pool from './db.js';

async function test() {
    try {
        
        const userRes = await pool.query("SELECT email FROM users WHERE role = 'BM' LIMIT 1");
        if (userRes.rows.length === 0) {
            console.log('No BM user found to test with.');
            process.exit(0);
        }
        const email = userRes.rows[0].email;
        console.log(`Testing with user: ${email}`);

        const id1 = await generateEntityId(email, 'Test Project', 'risk');
        console.log(`Generated ID 1: ${id1}`);

        const id2 = await generateEntityId(email, 'Test Project', 'risk');
        console.log(`Generated ID 2: ${id2}`);

        const id3 = await generateEntityId(email, 'Test Project', 'issue');
        console.log(`Generated ID 3 (issue): ${id3}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
