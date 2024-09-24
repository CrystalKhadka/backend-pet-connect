const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

const Notification = mongoose.model('notifications', notificationSchema);

module.exports = Notification;
