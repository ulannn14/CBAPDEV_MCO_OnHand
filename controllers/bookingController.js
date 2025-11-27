// import module `database` from `../models/UserModel.js`
const User = require('../models/UserModel.js');

// import module `database` from `../models/BookingModel.js`
const Booking = require('../models/BookingModel.js');

// import module `database` from `../models/RatingModel.js`
const Rating = require('../models/RatingModel.js');

// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const bookingController = {

  // ---------- GET BOOKINGS ----------
  getBookings: async function (req, res) {
    try {
      const loggedInUser = await db.findOne(User, { _id: req.session.user._id });
      if (!loggedInUser) return res.redirect('/');

      const statusParam = req.params.status; // ongoing | to-rate | completed
      const mode = req.session.user.mode;   // "customer" or "provider"

      // Map statusParam → DB status
      let dbStatus = null;
      if (statusParam === "ongoing") dbStatus = "Ongoing";
      else if (statusParam === "to-rate") dbStatus = "Done";        // ALL done bookings land here first
      else if (statusParam === "completed") dbStatus = "Done";
      else return res.redirect("/bookings/ongoing");

      // Mode-based filtering
      const userFilter =
        mode === "provider"
          ? { providerId: loggedInUser._id }
          : { customerId: loggedInUser._id };

      // Fetch bookings where user matches AND correct status
      const bookings = await Booking.find({
        ...userFilter,
        status: dbStatus
      })
        .populate("customerId")
        .populate("providerId")
        .lean();

      // Fetch all ratings made BY the current user
      const userRatings = await Rating.find({ fromUser: loggedInUser._id }).lean();

      // Convert to map: bookingId → rating
      const ratingMap = {};
      userRatings.forEach(r => {
        ratingMap[r.relatedBooking.toString()] = r.stars;
      });

      // Build display data
      const mappedBookings = bookings
        .map(b => {
          const isCustomer = b.customerId._id.toString() === loggedInUser._id.toString();
          const otherUser = isCustomer ? b.providerId : b.customerId;

          // Has the current user already rated?
          const hasUserRated = isCustomer ? b.customerRated : b.providerRated;

          // Tab-specific logic:
          // -----------------------
          // TO-RATE tab → show only if user has NOT rated yet
          if (statusParam === "to-rate" && hasUserRated) return null;

          // COMPLETED tab → show only if user HAS rated
          if (statusParam === "completed" && !hasUserRated) return null;

          // Determine current user's rating for display
          const starsGiven = ratingMap[b._id.toString()] || null;

          return {
            bookingId: b._id,
            clientName: `${otherUser.firstName} ${otherUser.lastName}`,
            username: otherUser.userName || otherUser.userNameString || '', // <-- ensure this matches your DB field
            otherUserId: otherUser._id,
            image: otherUser.profilePicture || "/images/default_profile.png",
            serviceType: b.serviceType,
            location: otherUser.address?.city || "N/A",
            price: b.price,

            // For completed tab
            rating: starsGiven,
            remainingStars: starsGiven ? 5 - starsGiven : 5
          };
        })
        .filter(Boolean); // remove nulls

      // Select correct view
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

  // ---------- POST RATING ----------
  postRating: async (req, res) => {
    try {
      const { bookingId, stars, review } = req.body;

      if (!bookingId || !stars) {
        return res.status(400).send("Booking ID and rating stars are required.");
      }

      const loggedInUserId = req.session.user._id;

      const booking = await Booking.findById(bookingId).populate(
        "customerId providerId"
      );

      if (!booking) return res.status(404).send("Booking not found.");

      const isCustomer = booking.customerId._id.toString() === loggedInUserId.toString();

      const toUserId = isCustomer
        ? booking.providerId._id
        : booking.customerId._id;

      const starsValue = parseInt(stars);
      if (isNaN(starsValue) || starsValue < 1 || starsValue > 5) {
        return res.status(400).send("Invalid star rating.");
      }

      // Create rating
      await Rating.create({
        fromUser: loggedInUserId,
        toUser: toUserId,
        relatedBooking: booking._id,
        stars: starsValue,
        review: review || ""
      });

      // Update rating flags
      if (isCustomer) {
        booking.customerRated = true;
      } else {
        booking.providerRated = true;
      }

      // If provider already marked done, set booking.status Done
      booking.status = "Done";

      // If BOTH rated → set final completion timestamp
      if (booking.customerRated && booking.providerRated) {
        booking.dateCompleted = new Date();
      }

      await booking.save();

      // After rating, always redirect to completed (user's view handles logic)
      res.redirect("/bookings/completed");

    } catch (err) {
      console.error("Error posting rating:", err);
      res.status(500).render("error");
    }
  }

};

module.exports = bookingController;
