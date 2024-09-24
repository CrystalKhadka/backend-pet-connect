const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.ObjectId,
    ref: 'pets',
    required: true,
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    default: 'pending',
  },
  paymentAmount: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now(),
  },
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
