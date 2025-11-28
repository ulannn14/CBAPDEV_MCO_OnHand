// Import required modules
const db = require('../models/db.js');
const User = require('../models/UserModel.js');
const Post = require('../models/postModel.js');
const Message = require('../models/MessageModel.js');
const Booking = require('../models/BookingModel.js');

// -- HOME CONTROLLER --
const homeController = {

  // ---------- GET HOME ----------
  getHome: async function (req, res) {

    try {

      // Get session user
      const loggedInUser = await db.findOne(User, { _id: req.session.user._id });
      if (!loggedInUser) return res.redirect('/');

      // Fetch posts for homepage
      const posts = await homeController.getPosts(loggedInUser, req.session.user.mode);

      // Render homepage view
      res.render('homepage', { user: loggedInUser, posts });

    } catch (err) {

      // Error handling
      console.error('Error in getHome:', err);
      res.status(500).render('error');
    
    }
  
  },

  // ---------- GET SEARCH ----------
  getSearch: async function (req, res) {
    
    try {

      // Get session user
      const loggedInUser = await db.findOne(User, { _id: req.session.user._id });
      if (!loggedInUser) return res.redirect('/');

      // Get all fields from query
      const { service, urgency, minPrice, maxPrice, location } = req.query;

      // Redirect if all fields are empty
      const noInput =
        !(service && service.trim()) &&
        !(urgency && urgency.trim()) &&
        !minPrice &&
        !maxPrice &&
        !(location && location.trim());
      if (noInput) return res.redirect('/home');

      // Base query
      let query = { userId: { $ne: loggedInUser._id } };

      // Location query
      if (location && location.trim().length > 0) {
        query.location = { $regex: new RegExp(location.trim(), 'i') };
      }

      // Post type query based on session user mode
      query.postType = req.session.user.mode === 'customer' ? 'Offering' : 'LookingFor';

      // Parse service type search
      if (service && service.trim()) {
        const keywords = service.trim().split(/\s+/); // split into words

        // Each keyword must match at least one of these fields
        query.$and = keywords.map(word => ({
          $or: [
            { serviceType: { $regex: new RegExp(word, 'i') } },
            { title: { $regex: new RegExp(word, 'i') } },
            { description: { $regex: new RegExp(word, 'i') } }
          ]
        }));
      }

      // Urgency query
      if (urgency && urgency.trim()) {
        query.levelOfUrgency = { $regex: new RegExp(urgency.trim(), 'i') };
      }

      // Fetch posts based on query
      let postsRaw = await db.findMany(Post, query);

      // Filter out posts with a completed booking (status = "Done")
      const visiblePostsRaw = [];
      for (const p of postsRaw) {
        const thread = await Message.findOne({ relatedPost: p._id }).lean();

        // no thread or no booking → still visible
        if (!thread || !thread.relatedBooking) {
          visiblePostsRaw.push(p);
          continue;
        }

        const booking = await Booking.findById(thread.relatedBooking).lean();

        // no booking or not Done → still show
        if (!booking || booking.status !== 'Done') {
          visiblePostsRaw.push(p);
          continue;
        }
      }

      // Get creators of posts
      const userIds = visiblePostsRaw.map(p => p.userId);
      const users = await db.findMany(User, { _id: { $in: userIds } });

      const usersMap = {};
      users.forEach(u => (usersMap[u._id.toString()] = u));

      // Price filtering
      const minQ = minPrice ? parseInt(minPrice, 10) : null;
      const maxQ = maxPrice ? parseInt(maxPrice, 10) : null;

      // Build results
      const results = visiblePostsRaw.map(p => {
        const postUser = usersMap[p.userId.toString()] || {};
        const images = p.sampleWorkImages || [];
        const imagePost = images[0] || null;
        const imageGallery = images.length > 1 ? images.slice(1) : [];

        // Parse numeric price range (difference: more defensive parsing from second version)
        let postMin = 0, postMax = 0;
        if (p.priceRange) {
          const parts = p.priceRange.split('-');
          postMin = parseInt((parts[0] || '').replace(/[^\d]/g, ''), 10) || 0;
          postMax = parseInt((parts[1] || '').replace(/[^\d]/g, ''), 10) || postMin;
        }

        return {
          postId: p._id,
          otherUserId: postUser._id,
          otherUserName: postUser.userName,
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
        if (minQ !== null && item.maxPrice < minQ) return false;
        if (maxQ !== null && item.minPrice > maxQ) return false;
        return true;
      });

      return res.render('search', { user: loggedInUser, results });

    } catch (err) {

      // Error handling
      console.error('Error in getSearch:', err);
      return res.status(500).render('error');

    }

  },

  // ---------- GET POSTS ----------
  getPosts: async function (user, mode) {

    try {

      // Base query
      let query = { userId: { $ne: user._id } };
      query.postType = mode === 'customer' ? 'Offering' : 'LookingFor';

      // Get posts based on query
      let postsRaw = await db.findMany(Post, query);

      // Filter out posts with a completed booking (status = "Done")
      const visiblePostsRaw = [];
      for (const p of postsRaw) {
        const thread = await Message.findOne({ relatedPost: p._id }).lean();
        if (!thread || !thread.relatedBooking) {
          visiblePostsRaw.push(p);
          continue;
        }
        const booking = await Booking.findById(thread.relatedBooking).lean();
        if (!booking || booking.status !== 'Done') {
          visiblePostsRaw.push(p);
        }
      }

      // Map post creators
      const userIds = visiblePostsRaw.map(p => p.userId);
      const users = await db.findMany(User, { _id: { $in: userIds } });

      const usersMap = {};
      users.forEach(u => (usersMap[u._id.toString()] = u));

      // Build display data
      const posts = visiblePostsRaw.map(p => {
        const postUser = usersMap[p.userId.toString()] || {};
        const images = p.sampleWorkImages || [];
        const imagePost = images[0] || null;
        const imageGallery = images.length > 1 ? images.slice(1) : [];

        let postMin = 0, postMax = 0;
        if (p.priceRange) {
          const parts = p.priceRange.split('-');
          postMin = parseInt(parts[0]?.replace(/[^\d]/g, ''), 10) || 0;
          postMax = parseInt(parts[1]?.replace(/[^\d]/g, ''), 10) || postMin;
        }

        return {
          postId: p._id,
          otherUserId: postUser._id,
          otherUserName: postUser.userName,
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
      });

      return posts;

    } catch (err) {

      // Error handling
      console.error('Error in getPosts:', err);
      return [];

    }

  },

  // ---------- POST CREATE POST ----------
  postCreatePost: async function (req, res) {

    try {
      
      // Get session user
      const user = req.session.user;
      if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

      // Get all fields from body
      const { title, description, location, minPrice, maxPrice, postType, serviceType, levelOfUrgency } = req.body;

      // Declare image upload path
      const imagePaths = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => imagePaths.push(`/uploads/posts/${file.filename}`));
      }

      // Build post
      const newPost = new Post({
        userId: user._id,
        postType,
        serviceType,
        title,
        description,
        priceRange: minPrice && maxPrice ? `₱${minPrice} - ₱${maxPrice}` : "",
        levelOfUrgency,
        workingHours: postType === "Offering" ? req.body.workingHours || "" : undefined,
        location,
        sampleWorkImages: imagePaths
      });

      // Add post to the database
      await newPost.save();
      return res.json({ success: true, post: newPost });

    } catch (err) {

      // Error handling
      console.error("Error creating post:", err);
      return res.status(500).json({ success: false, message: "Internal Server Error" });

    }

  },

  // ---------- POST DELETE POST ----------
  postDeletePost: async function (req, res) {

    try {

      // Check if session user exists
      if (!req.session.user) return res.redirect('/');

      // Get necessary details for delete
      const userId = req.session.user._id;
      const username = req.session.user.userName;
      const postId = req.params.id;

      // Fetch post from the database
      const post = await Post.findById(postId);
      if (!post) return res.redirect(`/profile/${username}`);

      // Check if session user is the post creator
      if (String(post.userId) !== String(userId))
        return res.redirect(`/profile/${username}`);

      // Get message threads related to post
      const threads = await Message.find({ relatedPost: postId }).lean();

      // Checks all threads to see if any contain a booking or an accepted/agreed offer
      let hasAcceptedOrBooked = false;
      for (const t of threads) {
        if (t.relatedBooking) { hasAcceptedOrBooked = true; break; }
        if (t.status === 'Agreed' || t.status === 'Closed') { hasAcceptedOrBooked = true; break; }
        const acceptedOffer = (t.messages || []).some(
          m => m.type === 'offer' && m.accepted
        );
        if (acceptedOffer) { hasAcceptedOrBooked = true; break; }
      }

      // Don't delete posts with accepted or completed bookings
      if (hasAcceptedOrBooked)
        return res.redirect(`/profile/${username}?cannotDelete=booking`);

      // Delete post from database
      await Post.deleteOne({ _id: postId });
      await Message.deleteMany({ relatedPost: postId });

      return res.redirect(`/profile/${username}`);

    } catch (err) {

      // Error handling
      console.error('Error in postDeletePost:', err);
      return res.redirect('/home');
    
    }

  }
  
};

// Export object 'homeController'
module.exports = homeController;
