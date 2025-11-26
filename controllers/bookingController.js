// controllers/bookingController.js
const User = require('../models/UserModel.js');
const Booking = require('../models/BookingModel.js');
const db = require('../models/db.js');

const bookingController = {

    getBookings: async function (req, res) {
    try {
      const loggedInUser = await db.findOne(User, { _id: req.session.user._id });
      if (!loggedInUser) return res.redirect('/');

      res.render('bookings', {
        user: loggedInUser,
      });

    } catch (err) {
      console.error('Error in getMessage:', err);
      res.status(500).render('error');
    }
  }
}

module.exports = bookingController;