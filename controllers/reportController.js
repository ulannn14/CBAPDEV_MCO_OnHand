const Report = require("../models/ReportModel");

module.exports = {
  create: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.json({ success: false, error: "Not logged in" });
      }

      const { reportedUser, reason } = req.body;

      await Report.create({
        reportedBy: req.session.user._id,
        reportedUser,
        reason
      });

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, error: "Server error" });
    }
  }
};
