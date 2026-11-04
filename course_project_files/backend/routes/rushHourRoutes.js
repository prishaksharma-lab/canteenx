const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');

let rushHourState = {
  isPaused: false,
  pauseReason: 'Kitchen at peak capacity. Pausing incoming orders for order fulfillment.',
  resumesInMinutes: 15,
  pausedUntil: null
};

// @route   GET /api/rush-hour
// @desc    Get current rush hour status
router.get('/', (req, res) => {
  res.json({ success: true, rushHour: rushHourState });
});

// @route   POST /api/rush-hour/toggle
// @desc    Pause or resume canteen order intake
router.post('/toggle', protect, adminOnly, (req, res) => {
  const { isPaused, pauseReason, resumesInMinutes } = req.body;

  rushHourState = {
    isPaused: Boolean(isPaused),
    pauseReason: pauseReason || rushHourState.pauseReason,
    resumesInMinutes: resumesInMinutes || 15,
    pausedUntil: isPaused ? new Date(Date.now() + (resumesInMinutes || 15) * 60000).toISOString() : null
  };

  // Broadcast rush hour state change to all connected students
  req.io.emit('rush_hour_changed', rushHourState);

  res.json({ success: true, rushHour: rushHourState });
});

module.exports = router;
