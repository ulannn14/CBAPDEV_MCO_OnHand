const db = require('../models/db.js');
const User = require('../models/UserModel.js');
const Post = require('../models/PostModel.js');

const homeController = {

  getHome: async function (req, res) {
    try {
      const loggedInUser = req.session.user;
      if (!loggedInUser) return res.redirect('/');

      const posts = await homeController.getPosts(loggedInUser);

      res.render('homepage', {
        user: loggedInUser,
        posts
      });

    } catch (err) {
      console.error('Error in getHome:', err);
      res.status(500).send('Internal Server Error');
    }
  },

  getPosts: async function (user) {
    try {
      let query = { userId: { $ne: user._id } }; // exclude own posts

      if (user.address?.city) {
        const cityRegex = new RegExp(user.address.city.trim(), 'i');
        query.location = { $regex: cityRegex };
      }

      // Determine post type based on mode
      query.postType = user.mode === 'customer' ? 'Offering' : 'LookingFor';

      // Fetch posts using your db helper
      let postsRaw = await db.findMany(Post, query);

      // Manually populate user info for each post
      const userIds = postsRaw.map(p => p.userId);
      const users = await db.findMany(User, { _id: { $in: userIds } });

      const usersMap = {};
      users.forEach(u => {
        usersMap[u._id.toString()] = u;
      });

      // Map posts to format for serviceCard
      const posts = postsRaw.map(p => {
        const postUser = usersMap[p.userId.toString()] || {};
        return {
          image: postUser.profilePicture || '/images/default_profile.png',
          workerName: `${postUser.firstName || ''} ${postUser.lastName || ''}`.trim(),
          jobTitle: p.serviceType,
          location: p.location,
          hours: p.workingHours || 'Not set',
          description: p.description,
          minPrice: p.priceRange ? p.priceRange.split('-')[0].replace(/[^\d]/g,'') : 0,
          maxPrice: p.priceRange ? p.priceRange.split('-')[1]?.replace(/[^\d]/g,'') : 0,
          isOwner: false,
          urgency: p.levelOfUrgency || null
        };
      });

      return posts;

    } catch (err) {
      console.error('Error in getPosts:', err);
      return [];
    }
  }

};

module.exports = homeController;