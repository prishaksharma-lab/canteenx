const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const rushHourRoutes = require('./routes/rushHourRoutes');

const app = express();
const server = http.createServer(app);

// Enable Cross-Origin & JSON body parsing
app.use(cors());
app.use(express.json());

// Setup Socket.IO for Live Real-Time Web Updates
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH']
  }
});

// Pass io instance to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rush-hour', rushHourRoutes);

// Socket.io Connection lifecycle
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Locate frontend assets (supporting both root deployment and subfolder deployment)
const possibleStaticDirs = [
  path.join(__dirname, '..', '..'), // When in course_project_files/backend
  path.join(__dirname, '..', 'frontend', 'dist'),
  path.join(__dirname, 'public'),
  __dirname
];

let frontendDir = possibleStaticDirs.find(dir => fs.existsSync(path.join(dir, 'index.html'))) || __dirname;

// Serve static assets
app.use('/assets', express.static(path.join(frontendDir, 'assets')));
app.use(express.static(frontendDir));

// Root and Single Page Application Route (Solves "Cannot GET /" permanently!)
app.get('*', (req, res, next) => {
  // If requesting an API route that was not matched, return 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: `API endpoint ${req.path} not found` });
  }

  const indexPath = path.join(frontendDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  // Graceful fallback response if index.html is missing
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>CanteenX Server Active</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 4rem;">
        <h1>🍽️ CanteenX API Server is Live</h1>
        <p>Backend is operating normally.</p>
        <p><a href="/api/menu">View Menu API (/api/menu)</a> | <a href="/api/orders">View Orders API (/api/orders)</a></p>
      </body>
    </html>
  `);
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/canteenx';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✓ Connected to MongoDB Database'))
  .catch((err) => console.warn('! MongoDB connection notice:', err.message));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  CanteenX Express & Socket.IO Server Live`);
  console.log(`  Listening on port ${PORT}`);
  console.log(`===============================================`);
});

module.exports = app;
