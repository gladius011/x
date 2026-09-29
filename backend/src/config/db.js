const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const hasDbUrl = Boolean(process.env.DATABASE_URL);

const poolConfig = hasDbUrl
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction || process.env.DATABASE_URL.includes('neon.tech') || process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'vma_calculator',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err.message);
});

module.exports = pool;
