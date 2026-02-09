
import fs from 'fs';
import pool from './db.js';
import path from 'path';






async function seed() {
    const filePath = path.join(process.cwd(), 'projects_list.tsv');
    console.log(`Reading ${filePath}...`);

    if (!fs.existsSync(filePath)) {
        console.error("File not found!");
        process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    console.log(`Found ${lines.length} lines. Processing...`);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        
        

        let count = 0;
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            
            
            
            
            

            let parts = line.split('\t');
            if (parts.length < 2) {
                
                parts = line.split(/\s{2,}/);
            }

            
            if (parts.length < 2) {
                console.warn("Skipping line (format):", line);
                
                continue;
            }

            const projectId = parts[0]?.trim();
            const desc = parts[1]?.trim();
            
            const account = parts[parts.length - 1]?.trim(); 

            if (!projectId || projectId.toLowerCase() === 'project id') continue;

            
            const sql = `
        INSERT INTO projects (id, name, description, account)
        VALUES (gen_random_uuid(), $1, $2, $3)
        ON CONFLICT (name) DO UPDATE 
        SET description = EXCLUDED.description, account = EXCLUDED.account
      `;

            await client.query(sql, [projectId, desc, account]);
            count++;
        }

        await client.query('COMMIT');
        console.log(`Successfully seeded ${count} projects.`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error seeding:", err);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
