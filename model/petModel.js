const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  petName: {
    type: String,
    required: true,
  },
  petSpecies: {
    type: String,
    required: true,
  },
  petBreed: {
    type: String,
    required: true,
  },
  petAge: {
    type: Number,
    required: true,
  },
  petWeight: {
    type: Number,
    required: true,
  },
  petColor: {
    type: String,
    required: true,
  },
  petDescription: {
    type: String,
    required: true,
  },
  petImage: {
    type: String,
    default: null,
  },
  petStatus: {
    type: String,
    default: 'available',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: true,
  },
  adoptedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
  },
});

const Pet = mongoose.model('pets', petSchema);
module.exports = Pet;
