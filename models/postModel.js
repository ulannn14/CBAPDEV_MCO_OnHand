// ============================================================
// PostModel.js
// ============================================================
// This schema represents posts made by both customers and providers.
// - Customers post when they're looking for services (LookingFor)
// - Providers post when they're offering services (Offering)
// Each post links to a User and stores relevant service details.
// ============================================================

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // The user who created the post
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Type of post: 'LookingFor' (customer) or 'Offering' (provider)
  postType: {
    type: String,
    enum: ['LookingFor', 'Offering'],
    required: true
  },

  // The category of service (7 main categories)
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

  // Short title for display (optional but nice for feed)
  title: {
    type: String,
    trim: true
  },

  // Longer description of the service or request
  description: {
    type: String,
    required: true,
    trim: true
  },

  // Price range or offer (depending on post type)
  priceRange: {
    type: String, // e.g. "₱500 - ₱1000" or "₱250/hour"
    trim: true
  },

  // For customers: how urgent the request is
  levelOfUrgency: {
    type: String,
    enum: ['Urgent', 'Non-Urgent']
  },

  // For providers: availability details
  workingHours: { type: String, trim: true },

  // Location of the job or provider
  location: { type: String, required: true, trim: true },

  // Optional sample images (e.g., past work, reference photos)
  sampleWorkImages: [String],

  // Auto timestamp for when the post was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', postSchema);
