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

  getSearch: async function (req, res) {
    try {
      const loggedInUser = req.session.user;
      if (!loggedInUser) return res.redirect('/');

      const { service, urgency, minPrice, maxPrice, location } = req.query;

      // If the user didn't provide any search input, go back to home
      const noInput = !(service && service.trim()) && !(urgency && urgency.trim()) && !minPrice && !maxPrice && !(location && location.trim());
      if (noInput) return res.redirect('/home');

      // Build DB query similar to getPosts but honoring search params
      let query = { userId: { $ne: loggedInUser._id } }; // exclude own posts

      // Location preference: explicit search location overrides user city
      if (location && location.trim()) {
        const locRegex = new RegExp(location.trim(), 'i');
        query.location = { $regex: locRegex };
      } else if (loggedInUser.address?.city) {
        const cityRegex = new RegExp(loggedInUser.address.city.trim(), 'i');
        query.location = { $regex: cityRegex };
      }

      // Post type based on user mode
      query.postType = loggedInUser.mode === 'customer' ? 'Offering' : 'LookingFor';

      // Service / title / description search
      if (service && service.trim()) {
        const s = new RegExp(service.trim(), 'i');
        query.$or = [
          { serviceType: { $regex: s } },
          { title: { $regex: s } },
          { description: { $regex: s } }
        ];
      }

      // Urgency
      if (urgency && urgency.trim()) {
        query.levelOfUrgency = { $regex: new RegExp(urgency.trim(), 'i') };
      }

      // Fetch posts matching the query
      let postsRaw = await db.findMany(Post, query);

      // Populate user info for posts
      const userIds = postsRaw.map(p => p.userId);
      const users = await db.findMany(User, { _id: { $in: userIds } });
      const usersMap = {};
      users.forEach(u => { usersMap[u._id.toString()] = u; });

      // Map and filter by price range if provided
      const minQ = minPrice ? parseInt(minPrice, 10) : null;
      const maxQ = maxPrice ? parseInt(maxPrice, 10) : null;

      const results = postsRaw.map(p => {
        const postUser = usersMap[p.userId.toString()] || {};
        const images = p.sampleWorkImages || [];
        const imagePost = images[0] || null;
        const imageGallery = images.length > 1 ? images.slice(1) : [];

        // Parse numeric min/max from stored priceRange string
        let postMin = 0, postMax = 0;
        if (p.priceRange) {
          const parts = p.priceRange.split('-');
          postMin = parseInt((parts[0] || '').replace(/[^\d]/g, ''), 10) || 0;
          postMax = parseInt((parts[1] || '').replace(/[^\d]/g, ''), 10) || postMin;
        }

        return {
          image: postUser.profilePicture || '/images/default_profile.png',
          workerName: `${postUser.firstName || ''} ${postUser.lastName || ''}`.trim(),
          jobTitle: p.serviceType || '',
          location: p.location || '',
          hours: p.workingHours || 'Not set',
          title: p.title || '',
          description: p.description || '',
          minPrice: postMin,
          maxPrice: postMax,
          isOwner: false,
          urgency: p.levelOfUrgency || null,
          imagePost,
          imageGallery
        };
      }).filter(item => {
        // Apply price filtering in JS when min/max search provided
        if (minQ !== null && item.maxPrice < minQ) return false;
        if (maxQ !== null && item.minPrice > maxQ) return false;
        return true;
      });

      return res.render('search', { user: loggedInUser, results });

    } catch (err) {
      console.error('Error in getSearch:', err);
      return res.status(500).send('Internal Server Error');
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

            const images = p.sampleWorkImages || [];
            const imagePost = images[0] || null;
            const imageGallery = images.length > 1 ? images.slice(1) : [];

            return {
                image: postUser.profilePicture || '/images/default_profile.png',
                workerName: `${postUser.firstName || ''} ${postUser.lastName || ''}`.trim(),
                jobTitle: p.serviceType || '',
                location: p.location || '',
                hours: p.workingHours || 'Not set',
                title: p.title || '',
                description: p.description || '',
                minPrice: p.priceRange ? p.priceRange.split('-')[0].replace(/[^\d]/g,'') : 0,
                maxPrice: p.priceRange ? p.priceRange.split('-')[1]?.replace(/[^\d]/g,'') : 0,
                isOwner: false,
                urgency: p.levelOfUrgency || null,
                imagePost,
                imageGallery
            };
        });

        return posts;

        } catch (err) {
        console.error('Error in getPosts:', err);
        return [];
        }
    },

    postCreatePost: async function (req, res) {
        try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

        const { title, description, location, minPrice, maxPrice, postType, serviceType, levelOfUrgency } = req.body;

        // Handle images
        const imagePaths = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
            imagePaths.push(`/uploads/posts/${file.filename}`);
            });
        }

        const newPost = new Post({
            userId: user._id,
            postType,
            serviceType,
            title,
            description,
            priceRange: minPrice && maxPrice ? `₱${minPrice} - ₱${maxPrice}` : "",
            levelOfUrgency: postType === "LookingFor" ? levelOfUrgency : undefined,
            workingHours: postType === "Offering" ? req.body.workingHours || "" : undefined,
            location,
            sampleWorkImages: imagePaths
        });

        await newPost.save();

        return res.json({ success: true, post: newPost });

        } catch (err) {
        console.error("Error creating post:", err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

};

module.exports = homeController;