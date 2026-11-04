/**
 * CanteenX - Menu Controller (Module 5 & 6: Express CRUD & Mongoose Queries)
 */

const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items (filterable by category & diet)
// @route   GET /api/menu
// @access  Public
exports.getMenu = async (req, res, next) => {
  try {
    const { category, diet, availableOnly } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (diet && diet !== 'All') filter.diet = diet;
    if (availableOnly === 'true') filter.isAvailable = true;

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json({ success: true, count: items.length, menu: items });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new food item (Admin only)
// @route   POST /api/menu
// @access  Admin
exports.createMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    if (req.io) {
      req.io.emit('menu_item_added', item);
    }
    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle item stock availability (In Stock vs Sold Out)
// @route   PATCH /api/menu/:id/toggle-stock
// @access  Admin / Kitchen
exports.toggleStock = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : !item.isAvailable;
    await item.save();

    if (req.io) {
      req.io.emit('item_stock_changed', { itemId: item._id, isAvailable: item.isAvailable });
    }

    res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
};
