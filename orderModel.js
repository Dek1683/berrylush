// orderModel.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date, // Change type to Date
      required: true,
    },
    subtotal_price: {
      type: Number,
      required: true,
    },
    // Add more fields as needed
  });
  

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

