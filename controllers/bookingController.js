// controllers/bookingController.js
const User = require('../models/UserModel.js');
const Booking = require('../models/BookingModel.js');
const db = require('../models/db.js');

const bookingController = {

    getBookings: async function (req, res) {

        res.render('bookings');

    }
}

module.exports = bookingController;