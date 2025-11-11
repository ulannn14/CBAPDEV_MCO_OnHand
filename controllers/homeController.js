// controllers/homeController.js
const User = require('../models/UserModel.js');
const db = require('../models/db.js');

const homeController = {

  getHome: async function (req, res) {
    try {
      const loggedInUser = await User.findById(req.session.user._id).lean();

      console.log('Logged-in user:', loggedInUser);

      if (!loggedInUser) {
        console.log('No logged-in user, redirecting to /');
        return res.redirect('/');
      }

      let posts = [];

      if (loggedInUser.type === 'customer') {
        const customerCity = loggedInUser.address?.city?.trim();
        console.log('Customer city:', customerCity);

        if (customerCity) {
          const cityRegex = new RegExp(customerCity, 'i');
          console.log('City regex:', cityRegex);

          const providers = await db.findMany(User, { type: 'provider', WorkingArea: { $regex: cityRegex } });
          console.log('Providers found:', providers.length);

          posts = providers.map(p => {
            const mapped = {
              image: p.profilePicture,
              workerName: `${p.firstName} ${p.lastName}`,
              jobTitle: 'Provider',
              location: p.WorkingArea,
              hours: p.workingHours || 'Not set',
              description: p.bio || '',
              minPrice: p.minPrice || 0,
              maxPrice: p.maxPrice || 0,
              isOwner: false,
              urgency: null
            };
            console.log('Mapped provider:', mapped);
            return mapped;
          });
        } else {
          console.log('Customer city not found, no providers will be fetched.');
        }
      } else {
        console.log('Logged-in user is a provider, currently no posts fetched.');
      }

      console.log('Final posts array:', posts);

      res.render('homepage', {
        user: loggedInUser,
        posts
      });

    } catch (err) {
      console.error('Error in getHome:', err);
      res.status(500).send('Internal Server Error');
    }
  }
}

module.exports = homeController;
