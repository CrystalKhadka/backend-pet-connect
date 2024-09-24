const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'users',
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'users',
  },
  type: {
    type: String,
    default: 'text',
  },
  timestamp: {
    type: Date,
    required: true,
  },
});

const Message = mongoose.model('messages', messageSchema);

module.exports = Message;
