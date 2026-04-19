const pool = require('../config/db');

const TestModel = {
  /**
   * Create the tests table if it doesn't exist
   */
  async createTable() {
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
    await pool.query(query);
  },

  /**
   * Insert a new test result
   */
  async create(data) {
    const query = `
      INSERT INTO tests (
        first_name, last_name, age, gender, weight,
        test_type, distance_meters, stop_time_seconds, walking_time_seconds,
        effective_time_seconds, vma, level, level_label, calculation_steps, user_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *
    `;
    const values = [
      data.firstName,
      data.lastName,
      data.age,
      data.gender,
      data.weight || null,
      data.testType,
      data.distanceMeters,
      data.stopTimeSeconds,
      data.walkingTimeSeconds,
      data.effectiveTimeSeconds,
      data.vma,
      data.level,
      data.levelLabel,
      data.calculationSteps,
      data.userId || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Find all tests with optional filters
   */
  async findAll({ level, type, search, sortBy = 'created_at', sortOrder = 'DESC', limit = 100, offset = 0 } = {}) {
    let query = 'SELECT * FROM tests WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (level) {
      query += ` AND level = $${paramIndex++}`;
      values.push(parseInt(level));
    }

    if (type) {
      query += ` AND test_type = $${paramIndex++}`;
      values.push(type);
    }

    if (search) {
      query += ` AND (LOWER(first_name) LIKE $${paramIndex} OR LOWER(last_name) LIKE $${paramIndex})`;
      values.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    // Whitelist sort columns
    const allowedSorts = ['created_at', 'vma', 'last_name', 'first_name', 'level', 'distance_meters'];
    const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${safeSort} ${safeOrder}`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  },

  /**
   * Count tests with optional filters
   */
  async count({ level, type, search } = {}) {
    let query = 'SELECT COUNT(*) as total FROM tests WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (level) {
      query += ` AND level = $${paramIndex++}`;
      values.push(parseInt(level));
    }

    if (type) {
      query += ` AND test_type = $${paramIndex++}`;
      values.push(type);
    }

    if (search) {
      query += ` AND (LOWER(first_name) LIKE $${paramIndex} OR LOWER(last_name) LIKE $${paramIndex})`;
      values.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total);
  },

  /**
   * Find a single test by ID
   */
  async findById(id) {
    const result = await pool.query('SELECT * FROM tests WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  /**
   * Delete a test by ID
   */
  async delete(id) {
    const result = await pool.query('DELETE FROM tests WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },

  /**
   * Get statistics scoped to a specific user
   */
  async getStatsByUserId(userId) {
    const levelStats = await pool.query(`
      SELECT
        level,
        level_label,
        COUNT(*) as count,
        ROUND(AVG(vma)::numeric, 2) as avg_vma,
        ROUND(MIN(vma)::numeric, 2) as min_vma,
        ROUND(MAX(vma)::numeric, 2) as max_vma
      FROM tests
      WHERE user_id = $1
      GROUP BY level, level_label
      ORDER BY level
    `, [userId]);

    const typeStats = await pool.query(`
      SELECT
        test_type,
        COUNT(*) as count,
        ROUND(AVG(vma)::numeric, 2) as avg_vma
      FROM tests
      WHERE user_id = $1
      GROUP BY test_type
      ORDER BY test_type
    `, [userId]);

    const genderStats = await pool.query(`
      SELECT
        gender,
        COUNT(*) as count,
        ROUND(AVG(vma)::numeric, 2) as avg_vma
      FROM tests
      WHERE user_id = $1
      GROUP BY gender
      ORDER BY gender
    `, [userId]);

    const overallStats = await pool.query(`
      SELECT
        COUNT(*) as total_tests,
        ROUND(AVG(vma)::numeric, 2) as overall_avg_vma,
        ROUND(MIN(vma)::numeric, 2) as min_vma,
        ROUND(MAX(vma)::numeric, 2) as max_vma
      FROM tests
      WHERE user_id = $1
    `, [userId]);

    const ranking = await pool.query(`
      SELECT id, first_name, last_name, vma, level, level_label, test_type
      FROM tests
      WHERE user_id = $1
      ORDER BY vma DESC
      LIMIT 10
    `, [userId]);

    const progression = await pool.query(`
      SELECT
        first_name || ' ' || last_name as athlete,
        vma,
        test_type,
        created_at
      FROM tests
      WHERE user_id = $1
      ORDER BY first_name, last_name, created_at
    `, [userId]);

    return {
      byLevel: levelStats.rows,
      byType: typeStats.rows,
      byGender: genderStats.rows,
      overall: overallStats.rows[0],
      topRanking: ranking.rows,
      progression: progression.rows,
    };
  },

  /**
   * Get statistics: counts per level, average VMA per group, etc.
   */
  async getStats() {
    const levelStats = await pool.query(`
      SELECT
        level,
        level_label,
        COUNT(*) as count,
        ROUND(AVG(vma)::numeric, 2) as avg_vma,
        ROUND(MIN(vma)::numeric, 2) as min_vma,
        ROUND(MAX(vma)::numeric, 2) as max_vma
      FROM tests
      GROUP BY level, level_label
      ORDER BY level
    `);

    const typeStats = await pool.query(`
      SELECT
        test_type,
        COUNT(*) as count,
        ROUND(AVG(vma)::numeric, 2) as avg_vma
      FROM tests
      GROUP BY test_type
      ORDER BY test_type
    `);

    const genderStats = await pool.query(`
      SELECT
        gender,
        COUNT(*) as count,
        ROUND(AVG(vma)::numeric, 2) as avg_vma
      FROM tests
      GROUP BY gender
      ORDER BY gender
    `);

    const overallStats = await pool.query(`
      SELECT
        COUNT(*) as total_tests,
        ROUND(AVG(vma)::numeric, 2) as overall_avg_vma,
        ROUND(MIN(vma)::numeric, 2) as min_vma,
        ROUND(MAX(vma)::numeric, 2) as max_vma
      FROM tests
    `);

    const ranking = await pool.query(`
      SELECT id, first_name, last_name, vma, level, level_label, test_type
      FROM tests
      ORDER BY vma DESC
      LIMIT 10
    `);

    // Progression data: tests per athlete sorted by date
    const progression = await pool.query(`
      SELECT
        first_name || ' ' || last_name as athlete,
        vma,
        test_type,
        created_at
      FROM tests
      ORDER BY first_name, last_name, created_at
    `);

    return {
      byLevel: levelStats.rows,
      byType: typeStats.rows,
      byGender: genderStats.rows,
      overall: overallStats.rows[0],
      topRanking: ranking.rows,
      progression: progression.rows,
    };
  },

  /**
   * Get all results for CSV export
   */
  async findAllForExport({ level, type, search } = {}) {
    let query = `
      SELECT
        id, first_name, last_name, age, gender, weight,
        test_type, distance_meters, stop_time_seconds, walking_time_seconds,
        effective_time_seconds, vma, level, level_label, created_at
      FROM tests WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (level) {
      query += ` AND level = $${paramIndex++}`;
      values.push(parseInt(level));
    }
    if (type) {
      query += ` AND test_type = $${paramIndex++}`;
      values.push(type);
    }
    if (search) {
      query += ` AND (LOWER(first_name) LIKE $${paramIndex} OR LOWER(last_name) LIKE $${paramIndex})`;
      values.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  },

  /**
   * Find tests belonging to a specific user
   */
  async findByUserId(userId, { level, type, search, sortBy = 'created_at', sortOrder = 'DESC', limit = 100, offset = 0 } = {}) {
    let query = 'SELECT * FROM tests WHERE user_id = $1';
    const values = [userId];
    let paramIndex = 2;

    if (level) {
      query += ` AND level = $${paramIndex++}`;
      values.push(parseInt(level));
    }
    if (type) {
      query += ` AND test_type = $${paramIndex++}`;
      values.push(type);
    }
    if (search) {
      query += ` AND (LOWER(first_name) LIKE $${paramIndex} OR LOWER(last_name) LIKE $${paramIndex})`;
      values.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    const allowedSorts = ['created_at', 'vma', 'last_name', 'first_name', 'level', 'distance_meters'];
    const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${safeSort} ${safeOrder}`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  },

  /**
   * Count tests for a specific user
   */
  async countByUserId(userId, { level, type, search } = {}) {
    let query = 'SELECT COUNT(*) as total FROM tests WHERE user_id = $1';
    const values = [userId];
    let paramIndex = 2;

    if (level) {
      query += ` AND level = $${paramIndex++}`;
      values.push(parseInt(level));
    }
    if (type) {
      query += ` AND test_type = $${paramIndex++}`;
      values.push(type);
    }
    if (search) {
      query += ` AND (LOWER(first_name) LIKE $${paramIndex} OR LOWER(last_name) LIKE $${paramIndex})`;
      values.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total);
  },
};

module.exports = TestModel;
