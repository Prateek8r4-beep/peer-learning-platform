const { Pool } = require('pg');

let pool;

async function connectPostgres() {
  if (pool) return pool;

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  try {
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected successfully');
    return pool;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    throw error;
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call connectPostgres first.');
  }
  return pool;
}

module.exports = { connectPostgres, getPool };
