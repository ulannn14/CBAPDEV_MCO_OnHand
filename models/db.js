// ============================================================
// db.js
// ============================================================
// Handles MongoDB connection for OnHand app using Mongoose.
// All database helper functions are wrapped in a single `database` object
// for easy import and consistent use in controllers.
// ============================================================

const mongoose = require('mongoose');
require('dotenv').config();

// Database connection URL
const url = process.env.MONGO_URI;

// Optional connection options
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true
};

// ============================================================
// Defines the `database` object containing connection and CRUD functions
// ============================================================

const database = {

  // ------------------------------------------------------------
  // CONNECT
  // ------------------------------------------------------------
  connect: async function () {
    try {
      await mongoose.connect(url, options);
      console.log('Connected to MongoDB at:', url);
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err);
    }
  },

  // ------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------
  insertOne: async function (model, doc) {
    return await model.create(doc);
  },

  insertMany: async function (model, docs) {
    return await model.insertMany(docs);
  },

  // ------------------------------------------------------------
  // READ
  // ------------------------------------------------------------
  findOne: async function (model, query, projection = null) {
    return await model.findOne(query, projection);
  },

  findMany: async function (model, query = {}, projection = null) {
    return await model.find(query, projection);
  },

  // ------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------
  updateOne: async function (model, filter, update) {
    return await model.updateOne(filter, update);
  },

  updateMany: async function (model, filter, update) {
    return await model.updateMany(filter, update);
  },

  // ------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------
  deleteOne: async function (model, conditions) {
    return await model.deleteOne(conditions);
  },

  deleteMany: async function (model, conditions) {
    return await model.deleteMany(conditions);
  }
};

// ============================================================
// Export the `database` object and the mongoose instance
// ============================================================
module.exports = database;
