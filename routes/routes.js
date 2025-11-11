
// import module `express`
const express = require('express');

// import module 'mutler'
const multer = require('multer');

// import module 'path'
const path = require('path');

// import module 'fs'
const fs = require('fs');

// import module `controller` from `../controllers/controller.js`
const controller = require('../controllers/controller.js');

// import module `loginController` from `../controllers/loginController.js`
const loginController = require('../controllers/loginController.js');

// import module `homeController` from `../controllers/homeController.js`
const homeController = require('../controllers/homeController.js');

// import module `signupController` from `../controllers/signupController.js`
const signupController = require('../controllers/signupController.js');

// import module `profileController` from `../controllers/profileController.js`
const profileController = require('../controllers/profileController.js');

const app = express();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const username = req.body.username || 'guest';
    let basePath;

    // Decide folder based on field name
    switch (file.fieldname) {
      case 'profilePicture':
        basePath = path.join(__dirname, '../public/uploads/profile_pics');
        break;
      case 'validID':
        basePath = path.join(__dirname, '../private/uploads/ids');
        break;
      case 'nbiClearance':
        basePath = path.join(__dirname, '../private/uploads/nbi');
        break;
      default:
        basePath = path.join(__dirname, '../private/uploads/other');
        break;
    }

    // Create the folder if it doesn't exist
    fs.mkdirSync(basePath, { recursive: true });

    cb(null, basePath);
  },

  filename: function (req, file, cb) {
    const username = req.body.username || 'guest';
    const ext = path.extname(file.originalname);
    const safeField = file.fieldname.replace(/\s+/g, '_');
    const filename = `${username}.${safeField}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ dest: 'tmp/' });

/*
    execute function getIndex()
    defined in object `controller` in `../controllers/controller.js`
    when a client sends an HTTP GET request for `/`
*/
app.get('/', controller.getIndex);

/*
    execute function getSuccess()
    defined in object `loginController` in `../controllers/loginController.js`
    when a client sends an HTTP POST request for `/login`
*/
app.post('/login', loginController.postLogin);

/*
    execute function getSuccess()
    defined in object `homeController` in `../controllers/homeController.js`
    when a client sends an HTTP GET request for `/home`
*/
app.get('/home', homeController.getHome);

/*
    execute function getSuccess()
    defined in object `signupController` in `../controllers/signupController.js`
    when a client sends an HTTP GET request for `/signup`
*/
app.get('/signup', signupController.getSignup);

/*
    execute function getSuccess()
    defined in object `signupController` in `../controllers/signupController.js`
    when a client sends an HTTP POST request for `/signup`
    uses multer upload fields
*/
app.post(
  '/signup',
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'validID', maxCount: 1 },
    { name: 'nbiClearance', maxCount: 1 },
  ]),
  signupController.postSignup
);

// Check if username exists
app.get('/checkUsername', signupController.getCheckUsername);

// Check if email exists
app.get('/checkEmail', signupController.getCheckEmail);

/*
    execute function getProfile()
    defined in object `profileController` in `../controllers/profileController.js`
    when a client sends an HTTP GET request for `/profile/:username`
    where `username` is a parameter
*/
app.get('/profile/:username', profileController.getProfile);

// Logging out
app.get('/logout', controller.getLogout);

/*
    exports the object `app` (defined above)
    when another script exports from this file
*/
module.exports = app;