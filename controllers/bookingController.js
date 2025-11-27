// controllers/bookingController.js
const User = require('../models/UserModel.js');
const Booking = require('../models/BookingModel.js');
const db = require('../models/db.js');

const bookingController = {

  getBookings: async function (req, res) {
    try {
      const loggedInUser = await db.findOne(User, { _id: req.session.user._id });
      if (!loggedInUser) return res.redirect('/');

      const statusParam = req.params.status;   // ongoing, to-rate, completed
      let dbStatus = null;

      // Convert URL param → DB values
      if (statusParam === "ongoing") dbStatus = "Ongoing";
      else if (statusParam === "to-rate") dbStatus = "ToRate";
      else if (statusParam === "completed") dbStatus = "Done";
      else {
        console.error("Invalid status:", statusParam);
        return res.redirect("/bookings/ongoing");
      }

      // Fetch bookings for logged-in user with matching status
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

      // Map bookings safely
      const mappedBookings = bookings.map(b => {
        const isCustomer = b.customerId._id.toString() === loggedInUser._id.toString();
        const otherUser = isCustomer ? b.providerId : b.customerId;

        return {
          clientName: `${otherUser.firstName} ${otherUser.lastName}`,
          image: otherUser.profilePicture || "/images/default_profile.png",
          serviceType: b.serviceType,
          location: `${otherUser.address?.city}, ${otherUser.address?.province}` || "N/A",
          price: b.price,
          status: statusParam, // lowercase for HBS
          rating: b.rating || 0,
          remainingStars: 5 - (b.rating || 0)
        };
      });

      // Render correct HBS file based on tab
      let viewName = "bookings"; // default
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
  }

};

module.exports = bookingController;
