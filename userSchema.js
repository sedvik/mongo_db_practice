const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required']
    },
    favoriteFood: {
        type: String,
        required: [true, 'Favorite food is required']
    },
    favoriteNumber: {
        type: Number,
        required: [true, 'Favorite number is required']
    },
    signupDate: {
        type: Date,
        default: Date.now()
    }
});

module.exports = userSchema;