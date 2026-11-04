const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Wraps & Rolls', 'Campus Bowls', 'Breakfast & Bites', 'Beverages', 'Healthy Greens', 'Sweet Treats']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  prepTime: {
    type: Number,
    required: true,
    default: 10 // minutes
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  tag: {
    type: String,
    default: ''
  },
  diet: {
    type: String,
    enum: ['Veg', 'Vegan', 'Non-Veg'],
    default: 'Veg'
  },
  calories: {
    type: String,
    default: '300 kcal'
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
