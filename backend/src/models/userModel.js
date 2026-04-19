const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const UserModel = {
  /**
   * Create the users and password_reset_tokens tables
   */
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);

      -- Add user_id column to tests table if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'tests' AND column_name = 'user_id'
        ) THEN
          ALTER TABLE tests ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
          CREATE INDEX idx_tests_user_id ON tests(user_id);
        END IF;
      END $$;
    `;
    await pool.query(query);
  },

  /**
   * Create a new user
   */
  async create({ username, email, password }) {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
    `;
    const result = await pool.query(query, [username.trim().toLowerCase(), email.trim().toLowerCase(), passwordHash]);
    return result.rows[0];
  },

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );
    return result.rows[0] || null;
  },

  /**
   * Find user by username
   */
  async findByUsername(username) {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username.trim().toLowerCase()]
    );
    return result.rows[0] || null;
  },

  /**
   * Find user by email or username (for login)
   */
  async findByEmailOrUsername(identifier) {
    const normalized = identifier.trim().toLowerCase();
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [normalized]
    );
    return result.rows[0] || null;
  },

  /**
   * Find user by ID (without password)
   */
  async findById(id) {
    const result = await pool.query(
      'SELECT id, username, email, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Verify password
   */
  async verifyPassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  },

  /**
   * Update password
   */
  async updatePassword(userId, newPassword) {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );
  },

  /**
   * Create a password reset token
   */
  async createResetToken(userId, token) {
    // Invalidate any existing tokens for this user
    await pool.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE',
      [userId]
    );

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const result = await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [userId, token, expiresAt]
    );
    return result.rows[0];
  },

  /**
   * Find a valid (non-expired, non-used) reset token
   */
  async findValidResetToken(token) {
    const result = await pool.query(
      `SELECT prt.*, u.email, u.username
       FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token = $1 AND prt.used = FALSE AND prt.expires_at > NOW()`,
      [token]
    );
    return result.rows[0] || null;
  },

  /**
   * Mark token as used
   */
  async markTokenUsed(tokenId) {
    await pool.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE id = $1',
      [tokenId]
    );
  },
};

module.exports = UserModel;
