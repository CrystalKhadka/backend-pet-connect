const mongoose = require('mongoose');

const khaltiSchema = new mongoose.Schema(
  {
    amount: {
      type: String,
      required: true,
    },
    purchase_order_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Payment',
      required: true,
    },
    purchase_order_name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    extra: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Khalti = mongoose.model('Khalti', khaltiSchema);
module.exports = Khalti;
