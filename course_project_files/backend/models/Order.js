const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  studentName: {
    type: String,
    required: true
  },
  studentRoll: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Ready', 'Collected', 'Cancelled'],
    default: 'Pending'
  },
  estimatedWaitMinutes: {
    type: Number,
    default: 10
  },
  specialInstructions: {
    type: String,
    default: ''
  },
  counter: {
    type: String,
    default: 'Counter 1'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
