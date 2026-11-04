const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/menu
// @desc    Get all menu items
router.get('/', async (req, res) => {
  try {
    const menu = await MenuItem.find({});
    res.json({ success: true, count: menu.length, menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/menu
// @desc    Add a new menu item (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    req.io.emit('menu_updated', item);
    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/menu/:id/toggle-stock
// @desc    Toggle item availability (Admin only)
router.patch('/:id/toggle-stock', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : !item.isAvailable;
    await item.save();

    // Broadcast instant stock change via Socket.io
    req.io.emit('item_stock_changed', { itemId: item._id, isAvailable: item.isAvailable });

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
