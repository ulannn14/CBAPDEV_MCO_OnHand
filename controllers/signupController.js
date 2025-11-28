// Import required modules
const fs = require('fs');
const path = require('path');
const db = require('../models/db.js');
const User = require('../models/UserModel.js');
const bcrypt = require('bcrypt');

// Define saltRounds for password hashing
const saltRounds = 10;

// -----------------------------------------------------------------idk para san to
function normalizePath(filePath) {
  if (!filePath) return null;
  return filePath
    .replace(/^.*public[\\/]/, '/') 
    .replace(/\\/g, '/'); 
}

// -- SIGNUP CONTROLLER -- 
const signupController = {

  // ---------- GET SIGNUP ----------
  getSignup: (req, res) => {
    res.render('signup', {
      weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    });
  },

  // ---------- POST SIGNUP ----------
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

    if (!username || !email || !password) {
      return res.status(400).render('signup', { loggedInUser: null, signupError: 'Username, email and password are required.' });
    }

    const existing = await db.findOne(User, { userName: username });
    if (existing) {
      return res.status(409).render('signup', { loggedInUser: null, signupError: 'Username already taken.' });
    }

    // Directories
    const profileDir = path.join(__dirname, '../public/uploads/profile_pics');
    const idDir = path.join(__dirname, '../private/uploads/ids');
    const nbiDir = path.join(__dirname, '../private/uploads/nbi');

    [profileDir, idDir, nbiDir].forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

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

    // Hash password (await style)
    const hash = await bcrypt.hash(password, saltRounds);

    const newUser = {
      firstName,
      middleName,
      lastName,
      userName: username,
      email,
      phoneNumber: phone,
      password: hash, 
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
      const dbUser = (typeof result.toObject === 'function') ? result.toObject() : result;

      req.session.user = {
        _id: dbUser._id,
        userName: dbUser.userName,
        profilePicture: dbUser.profilePicture || '/images/default_profile.png',
        type: dbUser.type,
        mode: dbUser.type === 'provider' ? 'provider' : 'customer'
      };

      return req.session.save(err => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).render('error', { loggedInUser: null });
        }
        return res.redirect('/home');
      });
    } else {
      return res.status(500).render('error', { loggedInUser: null });
    }
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).render('error', { loggedInUser: null });
  }
},

  // ---------- GET CHECK USERNAME ----------
  getCheckUsername: async (req, res) => {

    try {

      // Get username from query
      const username = req.query.value;
      if (!username) return res.json({ exists: false });

      // Fetch user from database
      const user = await db.findOne(User, { userName: username });
      res.json({ exists: !!user });

    } catch (err) {

      // Error handling
      console.error('Username check error:', err);
      res.status(500).json({ exists: false });
    
    }

  },

  // ---------- GET CHECK EMAIL ----------
  getCheckEmail: async (req, res) => {
    
    try {
    
      // Get email from query
      const email = req.query.value;
      if (!email) return res.json({ exists: false });

      // Fetch user from database
      const user = await db.findOne(User, { email });
      res.json({ exists: !!user });
    
    } catch (err) {

      // Error handling
      console.error('Email check error:', err);
      res.status(500).json({ exists: false });

    }

  }

};

module.exports = signupController;