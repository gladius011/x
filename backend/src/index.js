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

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

let isTablesReady = false;
async function initTables() {
  if (isTablesReady) return;
  try {
    await TestModel.createTable();
    await UserModel.createTable();
    isTablesReady = true;
    console.log('✅ Database tables ready');
  } catch (err) {
    console.error('❌ Database table initialization error:', err.message);
  }
}

// Middleware to ensure DB tables are ready on first request
app.use(async (req, res, next) => {
  if (!isTablesReady) {
    await initTables();
  }
  next();
});

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
