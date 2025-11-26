// controllers/messageController.js
const User = require('../models/UserModel.js');
const Message = require('../models/MessageModel.js');
const db = require('../models/db.js');

const messageController = {

    getMessages: async function (req, res) {
    try {
      const loggedInUser = req.session.user;
      if (!loggedInUser) return res.redirect('/');

      res.render('chatbox', {
        user: loggedInUser
      });

    } catch (err) {
      console.error('Error in getMessage:', err);
      res.status(500).send('Internal Server Error');
    }
  }
  
}

module.exports = messageController;