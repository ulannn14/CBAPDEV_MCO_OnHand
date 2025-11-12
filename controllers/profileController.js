const db = require('../models/db.js');
const User = require('../models/UserModel.js');

const profileController = {

  getProfile: async function (req, res) {
        try {
        const loggedInUser = await User.findById(req.session.user._id).lean();
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
        const isOwner = loggedInUser.userName === requestedUsername;

        // render the profile
        res.render('profile', {
            user,
            isOwner, // <-- send this flag to the template
            currentPage: 'profile'
        });

        } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).send('Internal Server Error');
        }
    },

    postUpdate: async function (req, res) {
        try {
        console.log('🔹 Incoming profile update:', req.body);

        const { id, field, value } = req.body;
        if (!id || !field) {
            return res.status(400).json({ success: false, error: 'Invalid request data' });
        }

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        if (field === 'location') {
            // Expect format: "City, Province"
            const city = (value.city || user.address.city).trim();
            const province = (value.province || user.address.province).trim();

            // ✅ Only update the specific subfields, not overwrite the object
            user.address.city = city;
            user.address.province = province;

            console.log(`✅ Updated address.city = ${city}, address.province = ${province}`);
        } else if (field === 'email') {
            user.email = value;
            console.log(`✅ Updated email = ${value}`);
        } else if (field === 'phoneNumber') {
            user.phoneNumber = value;
            console.log(`✅ Updated phoneNumber = ${value}`);
        } else {
            return res.status(400).json({ success: false, error: 'Unsupported field' });
        }

        await user.save();

        console.log('✅ User saved successfully!');
        return res.json({ success: true, user });

        } catch (err) {
        console.error('🔥 Profile update failed:', err);
        return res.status(500).json({ success: false, error: err.message });
        }
    }

};

module.exports = profileController;