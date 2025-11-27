const db = require('../models/db.js');
const User = require('../models/UserModel.js');
const Post = require('../models/PostModel.js');
const Rating = require('../models/RatingModel.js');

const profileController = {

    getProfile: async function (req, res) {
        try {
        // Logged-in user
        const loggedInUser = await db.findOne(User, { _id: req.session.user._id });
        const requestedUsername = req.params.username;

        if (!loggedInUser) {
            return res.redirect('/');
        }

        // Profile being viewed
        const user = await db.findOne(User, { userName: requestedUsername });
        if (!user) return res.status(404).render('error');

        // Is this the user's own profile?
        const isOwner = loggedInUser.userName === requestedUsername;

        // -------------------------------------------------------
        // FETCH POSTS CREATED BY PROFILE OWNER (filtered for owner)
        // -------------------------------------------------------
        let postQuery = { userId: user._id };

        // If the logged-in user is viewing their own profile, only show posts
        // matching their current mode:
        //  - provider -> show Offering
        //  - customer -> show LookingFor
        if (req.session.user.mode === 'provider') postQuery.postType = 'Offering';
        else postQuery.postType = 'LookingFor';
        

        // fetch posts with the constructed query
        const postsRaw = await db.findMany(Post, postQuery) || [];

        // Format posts similar to homepage
        const posts = postsRaw.map(p => {
        const images = Array.isArray(p.sampleWorkImages) ? p.sampleWorkImages : [];
        const imagePost = images[0] || null;
        const imageGallery = images.length > 1 ? images.slice(1) : [];

        // safe numeric parsing for priceRange (returns 0 if missing)
        let minPrice = 0, maxPrice = 0;
        if (typeof p.priceRange === 'string' && p.priceRange.includes('-')) {
            const parts = p.priceRange.split('-').map(s => s.replace(/[^\d]/g, '').trim());
            minPrice = parts[0] ? Number(parts[0]) : 0;
            maxPrice = parts[1] ? Number(parts[1]) : 0;
        } else if (typeof p.priceRange === 'string') {
            // try single value fallback
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
            isOwner, // set based on current user
            urgency: p.levelOfUrgency || null,
            imagePost,
            imageGallery,
            // include raw postType if you want to inspect in templates
            postType: p.postType || null,
            rawPost: p // optional: remove if you don't want full doc in template
        };
        });


        // -------------------------------------------------------
        // FETCH RATINGS WHERE PROFILE OWNER IS TOUSER
        // -------------------------------------------------------
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
        ratingAverage, // <-- send calculated average
        currentPage: 'profile'
        });

        } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).render('error');
        }
    },

    postUpdate: async function (req, res) {
        try {
        const { id, field, value } = req.body;

        if (!id || !field) {
            return res.status(400).json({ success: false, error: 'Invalid request data' });
        }

        const user = await db.findOne(User, { _id: id });
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

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

        await user.save();

        return res.json({ success: true, user });

        } catch (err) {
        console.error('Profile update failed:', err);
        return res.status(500).json({ success: false, error: err.message });
        }
    }
};

module.exports = profileController;
