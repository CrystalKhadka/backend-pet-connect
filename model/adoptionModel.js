const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema({
  formSender: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: true,
  },
  formReceiver: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: true,
  },
  pet: {
    type: mongoose.Schema.ObjectId,
    ref: 'pets',
    required: true,
  },
  status: {
    type: String,
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  form: {
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    houseType: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },

    yard: {
      type: String,
      required: true,
    },
    petExperience: {
      type: String,
      required: true,
    },
  },
});

const Adoption = mongoose.model('adoptions', adoptionSchema);
module.exports = Adoption;
