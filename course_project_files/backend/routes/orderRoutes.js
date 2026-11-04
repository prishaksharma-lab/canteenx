const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/authMiddleware');

let currentSequence = 100;

// Helper to calculate queue waiting time
const calculateEstimatedWait = async () => {
  const activeOrdersCount = await Order.countDocuments({
    status: { $in: ['Pending', 'Preparing'] }
  });
  return Math.max(8, 6 + (activeOrdersCount * 3));
};

// @route   POST /api/orders
// @desc    Place a new student order
router.post('/', async (req, res) => {
  const { studentName, studentRoll, items, totalAmount, specialInstructions } = req.body;

  try {
    currentSequence += 1;
    const token = `#CX-${currentSequence}`;
    const waitTime = await calculateEstimatedWait();

    const order = await Order.create({
      token,
      studentName: studentName || 'Campus Student',
      studentRoll: studentRoll || 'CS-DEFAULT',
      items,
      totalAmount,
      status: 'Pending',
      estimatedWaitMinutes: waitTime,
      specialInstructions: specialInstructions || '',
      counter: currentSequence % 2 === 0 ? 'Counter 1' : 'Counter 2'
    });

    // Real-time broadcast to kitchen staff
    req.io.emit('new_order_placed', order);

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (with optional status filter)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status (Pending -> Preparing -> Ready -> Collected)
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    await order.save();

    // Broadcast status change immediately to student and counter board
    req.io.emit('order_status_updated', order);

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
