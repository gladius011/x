#!/usr/bin/env node
// Simple static server + API proxy for exposing a single origin to a tunnel
// Usage: node proxy.js

const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'frontend', 'dist');

const API_TARGET = process.env.API_TARGET || 'http://127.0.0.1:3001';
const PORT = process.env.PORT || 8080;

// Proxy /api -> backend. Express removes the mount path before invoking the
// middleware, so we need to restore the original path (with the /api prefix)
// before handing the request to http-proxy-middleware.
const apiProxy = createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  logLevel: 'warn',
});

app.use('/api', (req, res, next) => {
  req.url = req.originalUrl; // bring the /api prefix back
  apiProxy(req, res, next);
});

// Serve static files
app.use(express.static(DIST, { index: false }));

// SPA fallback — use a generic middleware to avoid path-to-regexp issues
// (some router/path-to-regexp versions can reject patterns like '*').
app.use((req, res, next) => {
  // Only serve index.html for GET requests that accept HTML
  if (req.method === 'GET' && req.headers.accept && req.headers.accept.includes('text/html')) {
    return res.sendFile(path.join(DIST, 'index.html'));
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
  console.log(`Proxying /api -> ${API_TARGET}`);
  console.log(`Serving SPA from ${DIST}`);
});
