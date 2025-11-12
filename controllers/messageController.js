// controllers/messageController.js
const User = require('../models/UserModel.js');
const Message = require('../models/MessageModel.js');
const db = require('../models/db.js');

const messageController = {

    getMessages: async function (req, res) {

        res.render('chatbox');

    }
}

module.exports = messageController;