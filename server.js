/**
 * CanteenX - Root Server (Express.js)
 * Serves the CanteenX Web Application, static assets, and REST API routes.
 * Solves "Cannot GET /" by routing root requests to index.html.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// 1. Serve static assets (CSS, JS, images)
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(__dirname));

// 2. Mount API handlers (Serverless functions fallback)
const menuHandler = require('./api/menu.js');
const ordersHandler = require('./api/orders.js');
const authHandler = require('./api/auth.js');

app.all('/api/menu', (req, res) => menuHandler(req, res));
app.all('/api/orders', (req, res) => ordersHandler(req, res));
app.all('/api/auth/*', (req, res) => authHandler(req, res));
app.all('/api/auth', (req, res) => authHandler(req, res));

// 3. Root Route & SPA Fallback (Never show "Cannot GET /")
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: `API endpoint ${req.path} not found` });
  }

  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  res.send('CanteenX Web App is loading...');
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  CanteenX Express Server running on :${PORT}`);
    console.log(`  Serving index.html at http://localhost:${PORT}`);
    console.log(`===============================================`);
  });
}

module.exports = app;
