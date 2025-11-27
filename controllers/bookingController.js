const User = require('../models/UserModel.js');
const Booking = require('../models/BookingModel.js');
const Rating = require('../models/RatingModel.js');
const db = require('../models/db.js');

const bookingController = {

  getBookings: async (req, res) => {
    try {
      const loggedInUser = await db.findOne(User, { _id: req.session.user._id });
      if (!loggedInUser) return res.redirect('/');

      const statusParam = req.params.status; // ongoing, to-rate, completed
      let dbStatus = null;

      if (statusParam === "ongoing") dbStatus = "Ongoing";
      else if (statusParam === "to-rate") dbStatus = "ToRate";
      else if (statusParam === "completed") dbStatus = "Completed";
      else return res.redirect("/bookings/ongoing");

      // Fetch all bookings for this user (regardless of their personal rated status)
      const bookings = await Booking.find({
        $or: [
          { customerId: loggedInUser._id },
          { providerId: loggedInUser._id }
        ]
      })
        .populate("customerId")
        .populate("providerId")
        .lean();

      // Map bookings for HBS
      const mappedBookings = bookings.map(b => {
        const isCustomer = b.customerId._id.toString() === loggedInUser._id.toString();
        const otherUser = isCustomer ? b.providerId : b.customerId;

        // Determine user-specific status
        let statusForUser = b.status.toLowerCase();
        if (b.status === "ToRate") {
          // If current user has already rated, show as completed
          if ((isCustomer && b.customerRated) || (!isCustomer && b.providerRated)) {
            statusForUser = "completed";
          }
        }

        return {
          bookingId: b._id,
          clientName: `${otherUser.firstName} ${otherUser.lastName}`,
          image: otherUser.profilePicture || "/images/default_profile.png",
          serviceType: b.serviceType,
          location: otherUser.address?.city || "N/A",
          price: b.price,
          status: statusForUser,
          rating: 0,              // you can fetch ratings separately if needed
          remainingStars: 5
        };
      });

      // Filter by requested tab
      const filteredBookings = mappedBookings.filter(b => b.status === statusParam);

      // Select HBS
      let viewName = "bookings";
      if (statusParam === "to-rate") viewName = "bookings-to-rate";
      if (statusParam === "completed") viewName = "bookings-completed";

      return res.render(viewName, {
        user: loggedInUser,
        bookings: filteredBookings,
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
      if (!bookingId || !stars) return res.status(400).send('Booking ID and rating stars are required.');

      const loggedInUserId = req.session.user._id;
      const booking = await Booking.findById(bookingId).populate('customerId providerId');
      if (!booking) return res.status(404).send('Booking not found.');

      const isCustomer = booking.customerId._id.toString() === loggedInUserId.toString();

      // Create one-sided rating
      await Rating.create({
        fromUser: loggedInUserId,
        toUser: isCustomer ? booking.providerId._id : booking.customerId._id,
        relatedBooking: booking._id,
        stars: parseInt(stars),
        review: review || ""
      });

      // Update the user-rated flag
      if (isCustomer) booking.customerRated = true;
      else booking.providerRated = true;

      // If both have rated, mark as Completed
      if (booking.customerRated && booking.providerRated) {
        booking.status = "Completed";
        booking.dateCompleted = new Date();
      }

      await booking.save();

      res.redirect('/bookings/completed');

    } catch (err) {
      console.error("Error posting rating:", err);
      res.status(500).render('error');
    }
  }

};

module.exports = bookingController;
