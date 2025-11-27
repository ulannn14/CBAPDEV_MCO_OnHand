// controllers/bookingController.js
const User = require('../models/UserModel.js');
const Booking = require('../models/BookingModel.js');
const Rating = require('../models/RatingModel.js');
const db = require('../models/db.js');

const bookingController = {

  getBookings: async function (req, res) {
    try {
      const loggedInUser = await db.findOne(User, { _id: req.session.user._id });
      if (!loggedInUser) return res.redirect('/');

      const statusParam = req.params.status;   // ongoing, to-rate, completed
      let dbStatus = null;

      // Convert URL param → DB
      if (statusParam === "ongoing") dbStatus = "Ongoing";
      else if (statusParam === "to-rate") dbStatus = "ToRate";
      else if (statusParam === "completed") dbStatus = "Completed";
      else return res.redirect("/bookings/ongoing");

      // Fetch bookings for user + status
      const bookings = await Booking.find({
        $or: [
          { customerId: loggedInUser._id },
          { providerId: loggedInUser._id }
        ],
        status: dbStatus
      })
        .populate("customerId")
        .populate("providerId")
        .lean();

      // Get all ratings by this user
      const ratings = await Rating.find({ fromUser: loggedInUser._id }).lean();
      const ratingMap = {};
      ratings.forEach(r => {
        ratingMap[r.relatedBooking.toString()] = r.stars;
      });

      // Map bookings for HBS
      const mappedBookings = bookings.map(b => {
        const isCustomer = b.customerId._id.toString() === loggedInUser._id.toString();
        const otherUser = isCustomer ? b.providerId : b.customerId;

        // Determine status for the current user
        const hasRated = ratingMap[b._id.toString()] !== undefined;
        let statusForUser = b.status.toLowerCase();
        if (b.status === "Completed" && !hasRated) {
          statusForUser = "toRate";
        }

        return {
          bookingId: b._id,
          clientName: `${otherUser.firstName} ${otherUser.lastName}`,
          image: otherUser.profilePicture || "/images/default_profile.png",
          serviceType: b.serviceType,
          location: otherUser.address?.city || "N/A",
          price: b.price,
          status: statusForUser,
          rating: ratingMap[b._id.toString()] || 0,
          remainingStars: 5 - (ratingMap[b._id.toString()] || 0)
        };
      });

      // Choose HBS view
      let viewName = "bookings";
      if (statusParam === "to-rate") viewName = "bookings-to-rate";
      if (statusParam === "completed") viewName = "bookings-completed";

      return res.render(viewName, {
        user: loggedInUser,
        bookings: mappedBookings,
        currentTab: statusParam
      });

    } catch (err) {
      console.error("Error in getBookings:", err);
      return res.render("error");
    }
  },

  postRating: async (req, res) => {
    try {
      const { bookingId, stars, review } = req.body;

      if (!bookingId || !stars) {
        return res.status(400).send('Booking ID and rating stars are required.');
      }

      const loggedInUserId = req.session.user._id;

      // Find booking and participants
      const booking = await Booking.findById(bookingId).populate('customerId providerId');
      if (!booking) return res.status(404).send('Booking not found.');

      // Determine who is being rated
      const fromUserId = loggedInUserId;
      const toUserId = booking.customerId._id.toString() === loggedInUserId.toString()
        ? booking.providerId._id
        : booking.customerId._id;

      const starsValue = parseInt(stars);
      if (isNaN(starsValue) || starsValue < 1 || starsValue > 5) {
        return res.status(400).send('Invalid star rating.');
      }

      // Create rating (one-sided)
      await Rating.create({
        fromUser: fromUserId,
        toUser: toUserId,
        relatedBooking: booking._id,
        stars: starsValue,
        review: review || ""
      });

      // Check if both users have rated
      const ratingsCount = await Rating.countDocuments({ relatedBooking: booking._id });

      if (ratingsCount >= 2) {
        await Booking.findByIdAndUpdate(bookingId, {
          status: 'Completed',
          dateCompleted: new Date()
        });
      }

      res.redirect('/bookings/completed');

    } catch (err) {
      console.error('Error posting rating:', err);
      res.status(500).render('error');
    }
  }

};

module.exports = bookingController;
