// ============================================================
// RatingModel.js
// ============================================================
// This schema stores ratings and reviews between users after
// a booking is completed. It links to both the reviewer and
// the person being reviewed, and the booking it refers to.
// ============================================================

// import mongoose
const mongoose = require('mongoose');

// define the rating schema
const ratingSchema = new mongoose.Schema({
  // the user who gave the rating
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // the user who was rated
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // the booking this rating is connected to
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },

  // number of stars given (1–5)
  stars: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },

  // optional written feedback
  review: {
    type: String,
    trim: true
  },

  // automatically sets when rating is created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// export model
module.exports = mongoose.model('Rating', ratingSchema);
