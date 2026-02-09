import pool from './db.js';

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS user_code VARCHAR(20) UNIQUE');

        
        await client.query(`
      CREATE TABLE IF NOT EXISTS user_entity_sequences (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        entity_type VARCHAR(50) NOT NULL,
        last_value INTEGER DEFAULT 0,
        UNIQUE(user_id, entity_type)
      )
    `);

        
        const { rows: users } = await client.query('SELECT id, role, name FROM users');
        const roleCounts = {};

        for (const user of users) {
            const role = user.role || 'USER';
            if (!roleCounts[role]) roleCounts[role] = 0;
            roleCounts[role]++;
            const userCode = `${role}${roleCounts[role]}`;
            await client.query('UPDATE users SET user_code = $1 WHERE id = $2', [userCode, user.id]);
        }

        await client.query('COMMIT');
        console.log('Migration successful');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
}

migrate();
