// ============================================================
// MessageModel.js
// ============================================================
// This schema represents a message thread between two users.
// Each thread is linked to a specific post (either an offer or request).
// Inside each thread, there are multiple messages exchanged.
// If both parties agree, the thread links to a Booking document.
// ============================================================

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Participants (always 2 people: customer & provider)
  // Participants
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // The post that started the conversation
  relatedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },

  // Chat log (all messages between the two users)
 messages: [
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, trim: true },
    type: {
      type: String,
      enum: ['text', 'offer', 'offer-reply', 'offer-update', 'offer-cancel'],
      default: 'text'
    },
    price: { type: Number },
    accepted: { type: Boolean, default: false },
    declined: { type: Boolean, default: false },
    cancelled: { type: Boolean, default: false },
    images: [{ type: String }],
    timestamp: { type: Date, default: Date.now }
  }
],


  // Negotiation details
  negotiatedPrice: {
    type: Number
  },

  // Current chat status
  status: {
    type: String,
    enum: ['Negotiating', 'Agreed', 'Rejected', 'Closed'],
    default: 'Negotiating'
  },

  // Link to booking (created when both agree)
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },

  // Automatically update when new message is added
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Automatically refresh lastUpdated when a message is added
messageSchema.pre('save', function (next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Message', messageSchema);
