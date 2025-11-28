// Import required modules
const Report = require("../models/ReportModel.js");

// -- REPORT CONTROLLER --
const reportController = {

  // ---------- POST REPORT ----------
  postReport: async (req, res) => {

    try {

      // Check if a user is logged in
      if (!req.session.user) {
        return res.json({ success: false, error: "Not logged in" });
      }

      // Get report details from body
      const { reportedUser, reason } = req.body;

      // Add report to the database
      await Report.create({
        reportedBy: req.session.user._id,
        reportedUser,
        reason
      });

      res.json({ success: true });

    } catch (err) {

      // Error handling
      console.error(err);
      res.json({ success: false, error: "Server error" });

    }

  }

};

// Export object 'reportController'
module.exports = reportController;