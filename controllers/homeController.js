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