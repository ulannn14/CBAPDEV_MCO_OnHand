
const fs = require('fs');
const path = require('path');
const db = require('../models/db.js');
const User = require('../models/UserModel.js');

function normalizePath(filePath) {
  if (!filePath) return null;
  return filePath
    .replace(/^.*public[\\/]/, '/') // remove everything before and including "public/"
    .replace(/\\/g, '/'); // convert backslashes to forward slashes
}

const signupController = {

  getSignup: (req, res) => {
    res.render('signup', {
      weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    });
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
        province,
        region,
        country,
        postal,
        isServiceProvider,
        workingLocation,
        startTime,
        endTime
      } = req.body;

      const workingDays = req.body.workingDays
        ? Array.isArray(req.body.workingDays)
          ? req.body.workingDays
          : [req.body.workingDays]
        : [];

      // Directories
      const profileDir = path.join(__dirname, '../public/uploads/profile_pics');
      const idDir = path.join(__dirname, '../private/uploads/ids');
      const nbiDir = path.join(__dirname, '../private/uploads/nbi');

      [profileDir, idDir, nbiDir].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      });

      // Helper to move files out of tmp/
      const saveFile = (file, folder, filename) => {
        if (!file) return null;
        const ext = path.extname(file.originalname);
        const filepath = path.join(folder, `${filename}${ext}`);
        fs.renameSync(file.path, filepath);
        return normalizePath(filepath);
      };

      // Files (use helper)
      const profilePicturePath = saveFile(
        req.files?.profilePicture?.[0],
        profileDir,
        `${username}_profile`
      ) || '/images/default_profile.png';

      const validIdPath = saveFile(
        req.files?.validID?.[0],
        idDir,
        `${username}_id`
      );

      const nbiClearancePath = saveFile(
        req.files?.nbiClearance?.[0],
        nbiDir,
        `${username}_nbi`
      );

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
              province,
              region,
              country,
              postalCode: postal
          },
          validId: validIdPath,
          type: isServiceProvider === 'yes' ? 'provider' : 'customer',
          profilePicture: profilePicturePath,
          // Only include service provider fields if applicable
          ...(isServiceProvider === 'yes' && {
              nbiClearance: nbiClearancePath,
              workingDays,
              workingHours: startTime && endTime ? `${startTime} - ${endTime}` : null,
              WorkingArea: workingLocation
          })
      };

      const result = await db.insertOne(User, newUser);
      console.log('User added:', result);

      if (result) {
        req.session.user = {
          _id: result._id,
          userName: result.userName,
          profilePicture: result.profilePicture || '/images/default_profile.png',
          isProvider: result.type === 'provider'
        };
        res.redirect('/home');
      } else {
        res.status(500).render('error', { message: 'Signup failed.' });
      }
    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).render('error', { message: 'Signup failed.' });
    }
  },

  // ----------------------------
  // AJAX: check if username exists
  // ----------------------------
  getCheckUsername: async (req, res) => {
    try {
      const username = req.query.value;
      if (!username) return res.json({ exists: false });

      const user = await db.findOne(User, { userName: username });
      res.json({ exists: !!user });
    } catch (err) {
      console.error('Username check error:', err);
      res.status(500).json({ exists: false });
    }
  },

  // ----------------------------
  // AJAX: check if email exists
  // ----------------------------
  getCheckEmail: async (req, res) => {
    try {
      const email = req.query.value;
      if (!email) return res.json({ exists: false });

      const user = await db.findOne(User, { email });
      res.json({ exists: !!user });
    } catch (err) {
      console.error('Email check error:', err);
      res.status(500).json({ exists: false });
    }
  }
};

module.exports = signupController;
