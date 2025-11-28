// Import required modules
const db = require('../models/db.js');
const User = require('../models/UserModel.js');
const Post = require('../models/PostModel.js');
const Rating = require('../models/RatingModel.js');

// -- PROFILE CONTROLLER --
const profileController = {

    // ---------- GET PROFILE ----------
    getProfile: async function (req, res) {

        try {
        
            // Get session user
            const loggedInUser = await db.findOne(User, { _id: req.session.user._id });
            if (!loggedInUser) {
                return res.redirect('/');
            }

            // Get username from param
            const requestedUsername = req.params.username;

            // Fetch user from the database
            const user = await db.findOne(User, { userName: requestedUsername });
            if (!user) return res.status(404).render('error');

            // Check if profile owner is the session user
            const isOwner = loggedInUser.userName === requestedUsername;

            // Add profile owner's id to query
            let postQuery = { userId: user._id };

            // Add post type to query based on session user's mode
            if (isOwner) {
                if (req.session.user.mode === 'provider') postQuery.postType = 'Offering';
                else postQuery.postType = 'LookingFor';
            } else {
                if (req.session.user.mode === 'provider') postQuery.postType = 'LookingFor';
                else postQuery.postType = 'Offering';
            }
            
            // Fetch posts using the query
            const postsRaw = await db.findMany(Post, postQuery) || [];

            // Build the display data
            const posts = postsRaw.map(p => {
                const images = Array.isArray(p.sampleWorkImages) ? p.sampleWorkImages : [];
                const imagePost = images[0] || null;
                const imageGallery = images.length > 1 ? images.slice(1) : [];

                // parse priceRange for display
                let minPrice = 0, maxPrice = 0;
                if (typeof p.priceRange === 'string' && p.priceRange.includes('-')) {
                    const parts = p.priceRange.split('-').map(s => s.replace(/[^\d]/g, '').trim());
                    minPrice = parts[0] ? Number(parts[0]) : 0;
                    maxPrice = parts[1] ? Number(parts[1]) : 0;
                } else if (typeof p.priceRange === 'string') {
                    const num = p.priceRange.replace(/[^\d]/g, '');
                    minPrice = num ? Number(num) : 0;
                    maxPrice = minPrice;
                }

                return {
                    postId: p._id,
                    otherUserId: user._id,
                    otherUserName: user.userName,
                    image: user.profilePicture || '/images/default_profile.png',
                    workerName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                    jobTitle: p.serviceType || '',
                    location: p.location || '',
                    hours: p.workingHours || 'Not set',
                    title: p.title || '',
                    description: p.description || '',
                    minPrice,
                    maxPrice,
                    isOwner, 
                    urgency: p.levelOfUrgency || null,
                    imagePost,
                    imageGallery,
                    postType: p.postType || null,
                    rawPost: p
                };
            });

            // Fetch ratings where the profile owner is the receiving user
            let ratings = await Rating.find({ toUser: user._id })
            .populate('fromUser', 'firstName lastName profilePicture userName')
            .lean();

            // Calculate average rating
            let ratingAverage = 0;
            if (ratings.length > 0) {
            const sum = ratings.reduce((acc, r) => acc + r.stars, 0);
            ratingAverage = (sum / ratings.length).toFixed(1); // 1 decimal place
            }

            // Format ratings for handlebars
            const formattedRatings = ratings.map(r => {
                const fullStars = Math.floor(r.stars); // gold stars
                const emptyStars = 5 - fullStars;      // gray stars

                return {
                    reviewerName: r.fromUser.firstName + " " + r.fromUser.lastName,
                    reviewerUsername: r.fromUser.userName,
                    reviewerAvatar: r.fromUser.profilePicture || '/images/default_profile.png',
                    stars: r.stars,
                    goldStars: Array(fullStars).fill(1),
                    grayStars: Array(emptyStars).fill(1),
                    comment: r.review,
                    createdAt: r.createdAt
                };
            });

            // Render page
            res.render('profile', {
            user,
            isOwner,
            posts,
            reviews: formattedRatings,
            ratingAverage,
            currentPage: 'profile',
            cannotDeleteBooking: req.query.cannotDelete === 'booking'
            });

        } catch (err) {

            // Error handling
            console.error('Error fetching profile:', err);
            res.status(500).render('error');

        }

    },

    // ---------- GET PROFILE ----------
    postUpdate: async function (req, res) {

        try {

            // Get user id, field, and value from body
            const { id, field, value } = req.body;

            // Ensure that id and field exists
            if (!id || !field) {
                return res.status(400).json({ success: false, error: 'Invalid request data' });
            }

            // Fetch user from the database
            const user = await db.findOne(User, { _id: id });
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            // Parse attribute to be updated
            if (field === 'location') {
                const city = (value.city || user.address.city || "").trim();
                const province = (value.province || user.address.province || "").trim();

                user.address.city = city;
                user.address.province = province;
            } else if (field === 'WorkingArea') {
                user.WorkingArea = value;
            } else if (field === 'email') {
                user.email = value;
            } else if (field === 'phoneNumber') {
                user.phoneNumber = value;
            } else {
                return res.status(400).json({ success: false, error: 'Unsupported field' });
            }

            // Save changes to the database
            await user.save();

            return res.json({ success: true, user });

        } catch (err) {

            // Error handling
            console.error('Profile update failed:', err);
            return res.status(500).json({ success: false, error: err.message });
        
        }
    
    }

};

// Export object 'profileController'
module.exports = profileController;
