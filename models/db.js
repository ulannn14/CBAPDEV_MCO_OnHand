// ============================================================
// db.js
// ============================================================
// Handles MongoDB connection for OnHand app using Mongoose.
// ============================================================

const mongoose = require('mongoose');

// Database connection URL
const url = 'mongodb://localhost:27017/onhand';

// Function to connect to MongoDB
async function connect() {
  try {
    await mongoose.connect(url);
    console.log('Connected to MongoDB at:', url);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }
}

// Export the connection function and mongoose instance
module.exports = {
  connect,
  mongoose
};
