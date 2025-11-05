// import module `mongoose`
const mongoose = require('mongoose');

// import models (optional example, not required if unused)
const User = require('./UserModel.js');
const Rating = require('./RatingModel.js');
const Service = require('./ServiceModel.js');
const Booking = require('./BookingModel.js');

// database name
const url = 'mongodb://localhost:27017/onhand';

// defines an object which contains necessary database functions
const database = {

    /*
        connects to database
    */
    connect: async function () {
        try {
            await mongoose.connect(url);
            console.log('Connected to MongoDB at: ' + url);
        } catch (err) {
            console.error('Database connection error:', err);
        }
    },

    // INSERT
    insertOne: async function (model, doc) {
        return await model.create(doc);
    },
    insertMany: async function (model, docs) {
        return await model.insertMany(docs);
    },

    // FIND
    findOne: async function (model, query, projection) {
        return await model.findOne(query, projection);
    },
    findMany: async function (model, query, projection) {
        return await model.find(query, projection);
    },

    // UPDATE
    updateOne: async function (model, filter, update) {
        return await model.updateOne(filter, update);
    },
    updateMany: async function (model, filter, update) {
        return await model.updateMany(filter, update);
    },

    // DELETE
    deleteOne: async function (model, conditions) {
        return await model.deleteOne(conditions);
    },
    deleteMany: async function (model, conditions) {
        return await model.deleteMany(conditions);
    }
};

// export
module.exports = database;
