// ============================================================
// BookingModel.js
// ============================================================
// Created when both sides agree in a chat (MessageModel).
// Stores customer, provider, related message, service details,
// agreed price, and progress status.
// ============================================================

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Link to the message thread that created this booking
  relatedMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },

  // Participants
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Service details
  serviceType: {
    type: String,
    enum: [
      'Plumbing',
      'Electrical',
      'Cleaning',
      'Carpentry',
      'Painting',
      'Appliance Repair',
      'General Help'
    ],
    required: true
  },

  // Agreed price
  price: { type: Number, required: true },

  // Booking progress status
  status: {
    type: String,
    enum: ['Ongoing', 'ToRate', 'Done'],
    default: 'Ongoing'
  },

  // Provider marks this when finished
  completedByProvider: { type: Boolean, default: false },

  // Auto timestamps
  dateCreated: { type: Date, default: Date.now },
  dateCompleted: { type: Date }
});

module.exports = mongoose.model('Booking', bookingSchema);
