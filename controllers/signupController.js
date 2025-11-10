
// import database and model
const db = require('../models/db.js');
const User = require('../models/UserModel.js');

const signupController = {

    getSignup: function (req, res) {

        // render `../views/signup.hbs`
        res.render('signup');
    },

    postSignup: async function (req, res) {
        try {
        // Text fields
        const {
            name,
            email,
            phone,
            password,
            birthday,
            homeNumber,
            street,
            barangay,
            city,
            region,
            country,
            postal,
            isServiceProvider,
            workingDays,
            workingHours,
            workingLocation
        } = req.body;

        // Split name if needed
        const nameParts = name.split(' ');
        const firstName = nameParts[0];
        const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

        // Get uploaded file paths (if they exist)
        const profilePicturePath = req.files?.profilePicture?.[0]?.path || null;
        const validIdPath = req.files?.validID?.[0]?.path || null;
        const nbiClearancePath = req.files?.nbiClearance?.[0]?.path || null;

        // Construct the new user object
        const newUser = {
            firstName,
            middleName,
            lastName,
            userName,
            email,
            phoneNumber: phone,
            password,
            birthday,
            address: {
            houseNumber: homeNumber,
            street,
            barangay,
            city,
            region,
            country,
            postalCode: postal
            },
            validId: validIdPath,
            type: isServiceProvider === 'yes' ? 'provider' : 'customer',
            nbiClearance: nbiClearancePath,
            workingDays: workingDays ? workingDays.split(',').map(day => day.trim()) : [],
            workingHours,
            WorkingArea: workingLocation,
            profilePicture: profilePicturePath
        };

        // Insert user into the database using db.js helper
        await db.insertOne(User, newUser);

        // Redirect or render a success page
        res.redirect('/home');

        } catch (error) {
        console.error('Signup error:', error);
        res.status(500).render('error', { message: 'Signup failed.' });
        }
    }
    };

module.exports = signupController;
