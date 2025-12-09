const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'rr4',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Log on successful connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

// Log on connection error
pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err);
    process.exit(-1);
});

// Export a single query function to use in controllers
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool // Also export pool for transactions
};