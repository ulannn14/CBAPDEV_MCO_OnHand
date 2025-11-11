const db = require('../models/db.js');
const User = require('../models/UserModel.js');

const profileController = {

  getProfile: async function (req, res) {
    try {
      const loggedInUser = req.session.user;
      const requestedUsername = req.params.username;

      if (!loggedInUser) {
        return res.redirect('/'); // must be logged in to view profiles
      }

      // fetch the requested user's data
      const user = await db.findOne(User, { userName: requestedUsername });
      if (!user) {
        return res.status(404).send('User not found');
      }

      // determine if it’s the logged-in user’s own profile
      const isOwnProfile = loggedInUser.userName === requestedUsername;

      // render the profile
      res.render('profile', {
        user,
        isOwnProfile, // <-- send this flag to the template
        currentPage: 'profile'
      });

    } catch (err) {
      console.error('Error fetching profile:', err);
      res.status(500).send('Internal Server Error');
    }
  }

};

module.exports = profileController;