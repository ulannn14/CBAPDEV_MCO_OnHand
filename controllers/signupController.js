
const fs = require('fs');
const path = require('path');
const db = require('../models/db.js');
const User = require('../models/UserModel.js');

const signupController = {

    getSignup: (req, res) => {
        res.render('signup', { weekdays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] });
    },

    postSignup: async (req, res) => {
        try {
            const {
                firstName,
                middleName,
                lastName,
                username,
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
                workingLocation,
                startTime,
                endTime
            } = req.body;

            // Working days (checkboxes)
            const workingDays = req.body.workingDays 
                ? Array.isArray(req.body.workingDays) 
                    ? req.body.workingDays 
                    : [req.body.workingDays] 
                : [];

            // Directories
            const profileDir = path.join(__dirname, '../public/uploads/profile_pics');
            const idDir = path.join(__dirname, '../private/uploads/ids');
            const nbiDir = path.join(__dirname, '../private/uploads/nbi');

            // Ensure directories exist
            [profileDir, idDir, nbiDir].forEach(dir => { if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });

            // Helper function to save file with custom name
            const saveFile = (file, folder, filename) => {
                if(!file) return null;
                const ext = path.extname(file.originalname);
                const filepath = path.join(folder, `${filename}${ext}`);
                fs.renameSync(file.path, filepath); // move file
                return filepath;
            }

            // Files
            const profilePicturePath = req.files?.profilePicture?.[0] 
                ? saveFile(req.files.profilePicture[0], profileDir, username)
                : '/images/default_profile.png';

            const validIdPath = req.files?.validID?.[0] 
                ? saveFile(req.files.validID[0], idDir, `${username}_id`)
                : null;

            const nbiClearancePath = (isServiceProvider === 'yes' && req.files?.nbiClearance?.[0]) 
                ? saveFile(req.files.nbiClearance[0], nbiDir, `${username}_nbi`)
                : null;

            // Construct user object
            const newUser = {
                firstName,
                middleName,
                lastName,
                userName: username,
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
                workingDays,
                workingHours: startTime && endTime ? `${startTime} - ${endTime}` : null,
                WorkingArea: workingLocation,
                profilePicture: profilePicturePath
            };

            // Insert into database
            await db.insertOne(User, newUser);

            res.redirect('/home');

        } catch (err) {
            console.error('Signup error:', err);
            res.status(500).render('error', { message: 'Signup failed.' });
        }
    }
};

module.exports = signupController;
