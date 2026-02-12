const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function listDatabases() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
        console.log('Databases available:', res.rows.map(r => r.datname));
        await client.end();
    } catch (err) {
        console.error('Error listing databases:', err.message);
    }
}

listDatabases();
