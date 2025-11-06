// ============================================================
// ReportModel.js
// ============================================================
// This schema stores user reports (complaints) against other users.
// Each report includes who filed it, who was reported, the reason,
// and the current status of the report.
// ============================================================

// import mongoose
const mongoose = require('mongoose');

// define the report schema
const reportSchema = new mongoose.Schema({
  // the user who filed the report
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // the user who was reported
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // optional: link to a booking or message
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },

  relatedMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },

  // text explanation or reason for the report
  reason: {
    type: String,
    required: true,
    trim: true
  },

  // whether the report has been reviewed
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Resolved', 'Dismissed'],
    default: 'Pending'
  },

  // optional remarks (e.g., action taken)
  adminNotes: {
    type: String,
    trim: true
  },

  // timestamps for record tracking
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// optional: auto-update `updatedAt` when document is modified
reportSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// export the schema as a model
module.exports = mongoose.model('Report', reportSchema);