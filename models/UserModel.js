// ============================================================
// UserModel.js
// ============================================================
// This schema stores all user data — both customers and providers.
// It supports two user types, and includes provider verification
// details such as valid ID, working days, and NBI clearance.
// ============================================================

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, trim: true },
  lastName: { type: String, required: true, trim: true },
  userName: { type: String, required: true, unique: true, trim: true },
  
  email: { type: String, required: true, unique: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  birthday: { type: Date, required: true },

  // Optional bio and personal info
  bio: { type: String, trim: true },

  // Nested address object
  address: {
    houseNumber: { type: String, trim: true },
    street: { type: String, trim: true },
    barangay: { type: String, trim: true },
    city: { type: String, trim: true },
    province: { type: String, trim: true },
    region: { type: String, trim: true },
    country: { type: String, trim: true },
    postalCode: { type: String, trim: true }
  },

  profilePicture: { type: String, trim: true, default: '/images/default_profile.png' },

  // Verification and provider-specific fields
  validId: { type: String, trim: true }, // path or filename of uploaded ID
  type: { type: String, enum: ['customer', 'provider'], required: true },

  // Provider-specific info
  nbiClearance: { type: String, trim: true }, // path or filename of uploaded NBI
  workingDays: { type: [String] }, // e.g., ['Monday', 'Tuesday']
  workingHours: { type: String, trim: true }, // thought: maybe he wants different time for his different services
  WorkingArea: { type: String, trim: true }, // provider’s service area

  // Ratings and metadata
  ratingAverage: { type: Number, default: 0 },
  dateJoined: { type: Date, default: Date.now }
});

// export the model
module.exports = mongoose.model('User', userSchema);