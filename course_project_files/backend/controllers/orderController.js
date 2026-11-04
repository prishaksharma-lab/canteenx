/**
 * CanteenX - Order Controller (Module 5 & 6: Express CRUD & MongoDB Aggregation)
 */

const Order = require('../models/Order');

// Helper generator to estimate waiting time based on active backlog
const calculateWaitTime = async () => {
  const activeCount = await Order.countDocuments({
    status: { $in: ['Pending', 'Preparing'] }
  });
  return Math.max(8, 6 + (activeCount * 3));
};

// @desc    Create a new student order & generate unique token
// @route   POST /api/orders
// @access  Public / Student
exports.createOrder = async (req, res, next) => {
  try {
    const { studentName, studentRoll, items, totalAmount, specialInstructions } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Tray cannot be empty' });
    }

    // Generate atomic sequential token
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    let nextNum = 101;
    if (lastOrder && lastOrder.token) {
      const match = lastOrder.token.match(/#CX-(\d+)/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    const token = `#CX-${nextNum}`;
    const waitTime = await calculateWaitTime();

    const order = await Order.create({
      token,
      studentName: studentName || 'Campus Student',
      studentRoll: studentRoll || 'CS-GUEST',
      items,
      totalAmount,
      status: 'Pending',
      estimatedWaitMinutes: waitTime,
      specialInstructions: specialInstructions || '',
      counter: nextNum % 2 === 0 ? 'Counter 1' : 'Counter 2'
    });

    // Broadcast through WebSocket if initialized
    if (req.io) {
      req.io.emit('new_order_placed', order);
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (filterable by status)
// @route   GET /api/orders
// @access  Public
exports.getOrders = async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;
    const filter = status && status !== 'All' ? { status } : {};

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (State transitions: Pending -> Preparing -> Ready -> Collected)
// @route   PATCH /api/orders/:id/status
// @access  Kitchen Staff / Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Collected', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // Broadcast status change immediately
    if (req.io) {
      req.io.emit('order_status_updated', order);
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    MongoDB Aggregation Pipeline for Analytics & Peak Hours (Module 6)
// @route   GET /api/orders/analytics
// @access  Admin
exports.getOrderAnalytics = async (req, res, next) => {
  try {
    // Pipeline 1: Group by status and sum revenue
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Pipeline 2: Hourly breakdown to calculate lunch peak rush
    const hourlyDistribution = await Order.aggregate([
      {
        $project: {
          hour: { $hour: '$createdAt' },
          totalAmount: 1
        }
      },
      {
        $group: {
          _id: '$hour',
          orderCount: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        summary: stats,
        hourlyPeakDistribution: hourlyDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};
