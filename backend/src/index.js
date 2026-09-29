require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const testRoutes = require('./routes/testRoutes');
const statsRoutes = require('./routes/statsRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const TestModel = require('./models/testModel');
const UserModel = require('./models/userModel');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

let isTablesReady = false;
let tableInitPromise = null;

async function initTables() {
  if (isTablesReady) return;
  if (!tableInitPromise) {
    tableInitPromise = (async () => {
      try {
        await TestModel.createTable();
        await UserModel.createTable();
        isTablesReady = true;
        console.log('✅ Database tables ready');
      } catch (err) {
        console.error('❌ Database table initialization error:', err.message);
        tableInitPromise = null;
        throw err;
      }
    })();
  }
  return tableInitPromise;
}

// Ensure DB tables exist before handling any API request
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && req.path !== '/api/health') {
    try {
      await initTables();
    } catch (err) {
      console.error('Database init failed before handling route:', err.message);
      return next(new Error(`Database setup error: ${err.message}`));
    }
  }
  next();
});

// Health check and database diagnostics
app.get('/api/health', async (req, res) => {
  const result = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasDbUrl: Boolean(process.env.DATABASE_URL),
    env: process.env.NODE_ENV || 'unknown',
  };

  try {
    const timeRes = await pool.query('SELECT NOW()');
    result.database = 'connected';
    result.dbTime = timeRes.rows[0].now;

    const tableRes = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    result.tables = tableRes.rows.map((r) => r.table_name);

    if (!result.tables.includes('users') || !result.tables.includes('tests')) {
      await initTables();
      const updatedTables = await pool.query(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
      `);
      result.tables = updatedTables.rows.map((r) => r.table_name);
      result.tablesCreated = true;
    }

    res.json(result);
  } catch (err) {
    result.database = 'failed';
    result.error = err.message;
    res.status(500).json(result);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/stats', statsRoutes);

// Serve static frontend SPA if built dist exists
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start listening only in non-serverless environments (local, PM2, Docker)
if (process.env.VERCEL !== '1') {
  initTables().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 VMA Calculator API running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  }).catch((err) => {
    console.error('❌ Failed to start server:', err.message);
  });
}

module.exports = app;
