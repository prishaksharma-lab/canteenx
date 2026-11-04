const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

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

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/canteenx';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✓ Connected to MongoDB Database'))
  .catch((err) => console.warn('! MongoDB connection warning:', err.message));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  CanteenX Express & Socket.IO Backend Server`);
  console.log(`  Listening on port ${PORT}`);
  console.log(`===============================================`);
});
