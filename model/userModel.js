const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },
  birthDate: {
    type: Date,
  },
  address: {
    type: String,
  },
  gender: {
    type: String,
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    default: 'adopter',
  },
  image: {
    type: String,
    default: 'default.jpg',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  fromGoogle: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model('users', userSchema);

module.exports = User;
