const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function testConnection() {
    // Only replace the database name after the last slash but before query params
    const originalUrl = process.env.DATABASE_URL;
    const parts = originalUrl.split('/');
    const lastPart = parts[parts.length - 1];
    const dbNameWithParams = lastPart.split('?');
    dbNameWithParams[0] = 'postgres';
    parts[parts.length - 1] = dbNameWithParams.join('?');
    const url = parts.join('/');

    console.log('Testing with URL (DB name replaced):', url.replace(/:[^@]*@/, ':****@')); // Hide password
    const client = new Client({
        connectionString: url,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected successfully');
        const res = await client.query('SELECT current_database()');
        console.log('Current database:', res.rows[0].current_database);
        await client.end();
    } catch (err) {
        console.error('Connection error:', err.message);
    }
}

testConnection();
