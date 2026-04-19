require('dotenv').config();
const pool = require('../src/config/db');

async function migrate() {
  console.log('🔄 Running migrations...');

  const query = `
    CREATE TABLE IF NOT EXISTS tests (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
      gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
      weight DECIMAL(5,2),
      test_type VARCHAR(20) NOT NULL CHECK (test_type IN ('cooper', 'demi-cooper')),
      distance_meters DECIMAL(10,2) NOT NULL CHECK (distance_meters > 0),
      stop_time_seconds DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (stop_time_seconds >= 0),
      walking_time_seconds DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (walking_time_seconds >= 0),
      effective_time_seconds DECIMAL(10,2) NOT NULL,
      vma DECIMAL(6,2) NOT NULL,
      level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
      level_label VARCHAR(50) NOT NULL,
      calculation_steps TEXT[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_tests_test_type ON tests(test_type);
    CREATE INDEX IF NOT EXISTS idx_tests_level ON tests(level);
    CREATE INDEX IF NOT EXISTS idx_tests_last_name ON tests(last_name);
    CREATE INDEX IF NOT EXISTS idx_tests_vma ON tests(vma);
  `;

  try {
    await pool.query(query);
    console.log('✅ Migrations complete');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
