// controllers/messageController.js
const User = require('../models/UserModel.js');
const Message = require('../models/MessageModel.js');
const Post = require('../models/PostModel.js');
const db = require('../models/db.js');

const messageController = {

  // RENDER CHATBOX PAGE (existing)
  getMessages: async function (req, res) {
    try {
      const loggedInUser = await db.findOne(User, { _id: req.session.user._id });
      if (!loggedInUser) return res.redirect('/');

      const threadId = req.query.thread || null; 

      res.render('chatbox', {
        user: loggedInUser,
        threadId
      });

    } catch (err) {
      console.error('Error in getMessage:', err);
      res.status(500).send('Internal Server Error');
    }
  },

  startThread: async function (req, res) {
    try {
      const loggedInUser = await db.findOne(User, { _id: req.session.user._id });
      if (!loggedInUser) return res.redirect('/');

      const { postId, otherId } = req.query;
      if (!postId || !otherId) {
        return res.redirect('/messages');
      }

      // Optional: ensure post exists
      const post = await db.findOne(Post, { _id: postId });
      if (!post) {
        return res.redirect('/messages');
      }

      // Decide who is customer and provider based on loggedInUser.mode
      let customerId, providerId;

      if (loggedInUser.mode === 'customer') {
        customerId = loggedInUser._id;
        providerId = otherId;
      } else {
        providerId = loggedInUser._id;
        customerId = otherId;
      }

      // Look for an existing thread for this pair + post
      let thread = await Message.findOne({
        customerId,
        providerId,
        relatedPost: postId
      });

      // If none, create a new one
      if (!thread) {
        thread = await Message.create({
          customerId,
          providerId,
          relatedPost: postId,
          messages: []
        });
      }

      // Redirect to messages page with thread id
      return res.redirect(`/messages?thread=${thread._id}`);

    } catch (err) {
      console.error('Error in startThread:', err);
      return res.redirect('/messages');
    }
  },

  // NEW: JSON list of conversations for sidebar
  getMessagesList: async function (req, res) {
    try {
      const loggedInUser = req.session.user;
      if (!loggedInUser) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const userId = loggedInUser._id;

      const threads = await Message.find({
        $or: [
          { customerId: userId },
          { providerId: userId }
        ]
      })
        .populate('customerId providerId', 'firstName lastName profilePicture')
        .sort({ lastUpdated: -1 })
        .lean();

      const conversations = threads.map(t => {
        const isCustomer = String(t.customerId._id) === String(userId);
        const other = isCustomer ? t.providerId : t.customerId;

        const lastMsg = t.messages && t.messages.length
          ? t.messages[t.messages.length - 1]
          : null;

        const lastText = lastMsg
          ? (lastMsg.type === 'offer'
              ? `Offer: ₱${lastMsg.price ?? ''}`
              : (lastMsg.content || ''))
          : '';

        return {
          id: t._id,
          name: `${other.firstName} ${other.lastName}`,
          avatar: other.profilePicture || '/images/default_profile.png',
          last: lastText
        };
      });

      return res.json({ success: true, conversations });

    } catch (err) {
      console.error('Error in getMessagesList:', err);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  },

  // NEW: one specific thread + all messages
  getThread: async function (req, res) {
    try {
      const loggedInUser = req.session.user;
      if (!loggedInUser) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const userId = loggedInUser._id;
      const threadId = req.params.id;

      const thread = await Message.findOne({
        _id: threadId,
        $or: [
          { customerId: userId },
          { providerId: userId }
        ]
      }).lean();

      if (!thread) {
        return res.status(404).json({ success: false, error: 'Thread not found' });
      }

      return res.json({
        success: true,
        thread,
        me: userId
      });

    } catch (err) {
      console.error('Error in getThread:', err);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  },

  // NEW: add a message (text / offer / image) to a thread
  postMessage: async function (req, res) {
    try {
      const loggedInUser = req.session.user;
      if (!loggedInUser) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const userId = loggedInUser._id;
      const threadId = req.params.id;

      const {
        content,
        type,
        price,
        images,
        accepted,
        declined,
        cancelled
      } = req.body;

      const thread = await Message.findOne({
        _id: threadId,
        $or: [
          { customerId: userId },
          { providerId: userId }
        ]
      });

      if (!thread) {
        return res.status(404).json({ success: false, error: 'Thread not found' });
      }

      const msg = {
        sender: userId,
        content: content || '',
        type: type || 'text',
        price,
        accepted: !!accepted,
        declined: !!declined,
        cancelled: !!cancelled,
        images: Array.isArray(images) ? images : []
      };

      thread.messages.push(msg);

      if (msg.type === 'offer') {
        thread.negotiatedPrice = msg.price;
      }

      await thread.save();

      const savedMsg = thread.messages[thread.messages.length - 1];

      return res.json({
        success: true,
        message: savedMsg
      });

    } catch (err) {
      console.error('Error in postMessage:', err);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }

};

module.exports = messageController;
