// Import required modules
const User = require('../models/UserModel.js');
const Booking = require('../models/BookingModel.js');
const Rating = require('../models/RatingModel.js');
const db = require('../models/db.js');

// -- BOOKING CONTROLLER --
const bookingController = {

  // ---------- GET BOOKINGS ----------
  getBookings: async function (req, res) {

    try {

      // Get session user
      const loggedInUser = await db.findOne(User, { _id: req.session.user._id });
      if (!loggedInUser) return res.redirect('/');

      // Get status param and session user's mode
      const statusParam = req.params.status;        // ongoing | to-rate | completed
      const mode = req.session.user.mode;           // "customer" or "provider"

      // Assign db status from status param
      let dbStatus = null;
      if (statusParam === "ongoing") dbStatus = "Ongoing";
      else if (statusParam === "to-rate") dbStatus = "Done";
      else if (statusParam === "completed") dbStatus = "Done";
      else return res.redirect("/bookings/ongoing");

      // Create filter based on user's mode
      const userFilter =
        mode === "provider"
          ? { providerId: loggedInUser._id }
          : { customerId: loggedInUser._id };

      // Fetch bookings based on mode filter and db status
      const bookings = await Booking.find({
        ...userFilter,
        status: dbStatus
      })
        .populate("customerId")
        .populate("providerId")
        .lean();

      // Fetch all ratings made by user
      const userRatings = await Rating.find({ fromUser: loggedInUser._id }).lean();

      // Match ratings to their respective bookings
      const ratingMap = {};
      userRatings.forEach(r => {
        ratingMap[r.relatedBooking.toString()] = r.stars;
      });

      // Build the display data
      const mappedBookings = bookings
        .map(b => {

          // Assigns which user is the customer and provider
          const isCustomer = b.customerId._id.toString() === loggedInUser._id.toString();
          const otherUser = isCustomer ? b.providerId : b.customerId;

          // Checks if user is done rating
          const hasUserRated = isCustomer ? b.customerRated : b.providerRated;

          // Tab-specific logic:
          // -----------------------
          // Checks if user is done rating
          if (statusParam === "to-rate" && hasUserRated) return null;

          // Checks if the user is not done rating
          if (statusParam === "completed" && !hasUserRated) return null;

          // Get user's rating for display
          const starsGiven = ratingMap[b._id.toString()] || null;

          // Returns needed data for display
          return {
            bookingId: b._id,
            clientName: `${otherUser.firstName} ${otherUser.lastName}`,
            username: otherUser.userName || otherUser.userNameString || '', // <-- ensure this matches your DB field
            otherUserId: otherUser._id,
            image: otherUser.profilePicture || "/images/default_profile.png",
            serviceType: b.serviceType,
            location: otherUser.address?.city || "N/A",
            price: b.price,

            // Additional required data for "Completed" tab
            rating: starsGiven,
            remainingStars: starsGiven ? 5 - starsGiven : 5
          };
        })
        .filter(Boolean); // remove nulls

      // Select the correct view based on the status param
      let viewName = "bookings";
      if (statusParam === "to-rate") viewName = "bookings-to-rate";
      if (statusParam === "completed") viewName = "bookings-completed";

      // Renders booking page
      return res.render(viewName, {
        user: loggedInUser,
        bookings: mappedBookings,
        currentTab: statusParam
      });

    } catch (err) {

      // Error handling
      console.error("Error in getBookings:", err);
      return res.render("error");

    }

  },

  // ---------- POST RATING ----------
  postRating: async (req, res) => {
    
    try {

      // Get booking id, rating stars, and review details from the body.
      const { bookingId, stars, review } = req.body;

      // Check if data is properly collected
      if (!bookingId || !stars) {
        return res.status(400).send("Booking ID and rating stars are required.");
      }

      // Get session user id
      const loggedInUserId = req.session.user._id;

      // Fetch booking to be rated
      const booking = await Booking.findById(bookingId).populate(
        "customerId providerId"
      );

      // Check if booking is found
      if (!booking) return res.status(404).send("Booking not found.");

      // Check if user is customer or provider
      const isCustomer = booking.customerId._id.toString() === loggedInUserId.toString();

      // Assign user id of receiving user
      const toUserId = isCustomer
        ? booking.providerId._id
        : booking.customerId._id;

      // Parse number of rating stars
      const starsValue = parseInt(stars);
      if (isNaN(starsValue) || starsValue < 1 || starsValue > 5) {
        return res.status(400).send("Invalid star rating.");
      }

      // Add new rating to the database
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

      // If both users are done rating, set final completion timestamp
      if (booking.customerRated && booking.providerRated) {
        booking.dateCompleted = new Date();
      }

      // Save booking to the database
      await booking.save();

      // After rating, redirect to "Completed" tab
      res.redirect("/bookings/completed");

    } catch (err) {

      // Error handling
      console.error("Error posting rating:", err);
      res.status(500).render("error");

    }

  }

};

// Export object 'bookingController'
module.exports = bookingController;