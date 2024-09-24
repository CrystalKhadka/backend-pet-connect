const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
        required: true,
    },
    pet: {
        type: mongoose.Schema.ObjectId,
        ref: 'pets',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

const Favorite = mongoose.model('favorites', favoriteSchema);
module.exports = Favorite;