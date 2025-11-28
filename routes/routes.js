// Import required modules
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import required controllers
const controller = require('../controllers/controller.js');
const loginController = require('../controllers/loginController.js');
const homeController = require('../controllers/homeController.js');
const signupController = require('../controllers/signupController.js');
const profileController = require('../controllers/profileController.js');
const messageController = require('../controllers/messageController.js');
const bookingController = require('../controllers/bookingController.js');

// Declaration of application/router
const app = express();

// Configure multer storage for file uploads upon signup
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

  // Builds filename based on file type
  filename: function (req, file, cb) {
    const username = req.body.username || 'guest';
    const ext = path.extname(file.originalname);
    const safeField = file.fieldname.replace(/\s+/g, '_');
    const filename = `${username}.${safeField}${ext}`;
    cb(null, filename);
  }
});

// Assign destination for file uploads in signup page
const upload = multer({ dest: 'tmp/' });

// Route for HTTP GET request for '/'
app.get('/', controller.getIndex);

// Route for HTTP POST request for '/login'
app.post('/login', loginController.postLogin);

// Route for HTTP GET request for '/getCheckUsername'
app.get('/getCheckUsername', loginController.getCheckUsername);

// Route for HTTP GET request for '/getCheckPassword'
app.get('/getCheckPassword', loginController.getCheckPassword);

// Route for HTTP GET request for '/home'
app.get('/home', homeController.getHome);

// Route for HTTP GET request for '/search'
app.get('/search', homeController.getSearch);

// Route for HTTP GET request for '/signup'
app.get('/signup', signupController.getSignup);

// Route for HTTP POST request for '/signup'
app.post(
  '/signup',
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'validID', maxCount: 1 },
    { name: 'nbiClearance', maxCount: 1 },
  ]),
  signupController.postSignup
);

// Route for HTTP POST request for '/checkUsername'
app.get('/checkUsername', signupController.getCheckUsername);

// Route for HTTP POST request for '/CheckEmail'
app.get('/checkEmail', signupController.getCheckEmail);

// Route for HTTP GET request for '/profile/:username'
app.get('/profile/:username', profileController.getProfile);

// Route for HTTP POST request for '/profile/update'
app.post('/profile/update', profileController.postUpdate);

// Route for HTTP POST request for '/mode'
app.post('/mode', controller.postMode);

// Configure mutler storage for file uploads when creating posts
const postStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const basePath = path.join(__dirname, '../public/uploads/posts');
    fs.mkdirSync(basePath, { recursive: true });
    cb(null, basePath);
  },
  filename: function (req, file, cb) {
    const username = req.session.user.userName.replace(/\s+/g, '_'); // get username from session
    const randomNum = Math.floor(Math.random() * 1e6); // random number 0–999999
    const ext = path.extname(file.originalname);
    const filename = `${username}-post-${randomNum}${ext}`;
    cb(null, filename);
  }
});

// Assign destination for file uploads when creating a post
const postUpload = multer({ storage: postStorage });

// Route for HTTP POST request for '/create-post'
app.post('/create-post', postUpload.array('images'), homeController.postCreatePost);

// Route for HTTP POST request for '/posts/:id/delete'
app.post('/posts/:id/delete', homeController.postDeletePost);

// Route for HTTP GET request for '/messages'
app.get('/messages', messageController.getMessages);     

// Route for HTTP GET request for '/messages/list'
app.get('/messages/list', messageController.getMessagesList);  

// Route for HTTP GET request for '/messages/thread/:id'
app.get('/messages/thread/:id', messageController.getThread);  

// Route for HTTP POST request for '/messages/thread/:id'
app.post('/messages/thread/:id', messageController.postMessage); 

// Route for HTTP POST request for '/messages/thread/:id/complete-booking'
app.post('/messages/thread/:id/complete-booking', messageController.completeBooking);

// Route for HTTP GET request for '/start-thread'
app.get('/start-thread', messageController.startThread);

// Route for HTTP GET request for '/bookings/:status'
app.get('/bookings/:status', bookingController.getBookings);

// Route for HTTP POST request for '/postRating'
app.post('/postRating', bookingController.postRating);

// Route for HTTP GET request for '/logout'
app.get('/logout', controller.getLogout);

// Export object 'app'
module.exports = app;