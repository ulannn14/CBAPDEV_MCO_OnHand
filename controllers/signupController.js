const fs = require('fs');
const path = require('path');
const db = require('../models/db.js');
const User = require('../models/UserModel.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

    // Basic server-side validation (you can expand)
    if (!username || !email || !password) {
      return res.status(400).render('signup', { loggedInUser: null, signupError: 'Username, email and password are required.' });
    }

    // check for existing username/email
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

    // Hash password (await style)
    const hash = await bcrypt.hash(password, saltRounds);

    // Build user object (use hashed password)
    const newUser = {
      firstName,
      middleName,
      lastName,
      userName: username,
      email,
      phoneNumber: phone,
      password: hash, // <-- store the hash
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
        workingArea: workingLocation // normalized
      })
    };

    // Insert into DB
    const result = await db.insertOne(User, newUser);
    console.log('User added:', result);

    if (result) {
      // Normalize result if it is a mongoose document
      const dbUser = (typeof result.toObject === 'function') ? result.toObject() : result;

      // Set session (never put password in session)
      req.session.user = {
        _id: dbUser._id,
        userName: dbUser.userName,
        profilePicture: dbUser.profilePicture || '/images/default_profile.png',
        type: dbUser.type,
        mode: dbUser.type === 'provider' ? 'provider' : 'customer'
      };

      // Ensure session is saved before redirecting
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
