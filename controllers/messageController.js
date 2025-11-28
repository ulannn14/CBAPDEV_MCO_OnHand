// Import database models and utilities
const User = require('../models/UserModel.js');
const Message = require('../models/MessageModel.js');
const Post = require('../models/postModel.js');
const Booking = require('../models/BookingModel.js');
const db = require('../models/db.js');

// -- MESSAGE CONTROLLER --
const messageController = {

  // ---------- GET MESSAGES ----------
  getMessages: async function (req, res) {

    try 
    {
      // Get session user
      const sessionUser = req.session.user;
      const loggedInUser = await db.findOne(User, { _id: sessionUser._id });
      if (!loggedInUser) return res.redirect('/');

      // Extract thread id from query
      const threadId = req.query.thread || null;

      // Determine mode based on session or account type
      const currentMode = sessionUser.mode || (loggedInUser.type === 'provider'
        ? 'provider'
        : 'customer');

      // Render chatbox with mode and current thread
      res.render('chatbox', {
        user: loggedInUser,
        threadId,
        isProvider: currentMode === 'provider',
        mode: currentMode
      });

    } catch (err) {

      // Error handling
      console.error('Error in getMessage:', err);
      res.status(500).render('error');

    }
  },

  // ---------- GET START THREAD ----------
  getStartThread: async function (req, res) {

    try {

      // Get session user
      const loggedInUser = await db.findOne(User, { _id: req.session.user._id });
      if (!loggedInUser) return res.redirect('/');

      // Get post and other user's id from query
      const { postId, otherId } = req.query;
      if (!postId || !otherId) return res.redirect('/messages');

      // Fetch post from the databas
      const post = await db.findOne(Post, { _id: postId });
      if (!post) return res.redirect('/messages');

      let customerId, providerId;
      const currentMode = req.session.user.mode || 'customer'; // session mode

      // Assign provider/customer based on current mode
      if (currentMode === 'provider') {
        providerId = loggedInUser._id;
        customerId = otherId;
      } else {
        customerId = loggedInUser._id;
        providerId = otherId;
      }

      // Search for existing thread
      let thread = await Message.findOne({
        customerId,
        providerId,
        relatedPost: postId
      });

      // Create thread if not existing
      if (!thread) {
        thread = await Message.create({
          customerId,
          providerId,
          relatedPost: postId,
          messages: []
        });
      }

      // Redirect to the opened/created thread
      return res.redirect(`/messages?thread=${thread._id}`);

    } catch (err) {

      // Error handling
      console.error('Error in startThread:', err);
      return res.redirect('/messages');
    
    }

  },

  // ---------- GET MESSAGES LIST ----------
  getMessagesList: async function (req, res) {

    try {

      // Get session user
      const loggedInUser = req.session.user;
      if (!loggedInUser) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const userId = loggedInUser._id;
      const currentMode = loggedInUser.mode || 'customer'; // session mode

      let threadFilter;

      // Filter threads depending on user mode
      if (currentMode === 'provider') {
        threadFilter = { providerId: userId }; // provider sees provider threads
      } else {
        threadFilter = { customerId: userId }; // customer sees customer threads
      }

      // Fetch threads with user/post info
      const threads = await Message.find(threadFilter)
        .populate('customerId providerId', 'firstName lastName profilePicture userName')
        .populate('relatedPost', 'title serviceType')
        .sort({ lastUpdated: -1 })
        .lean();

      // Map each thread into sidebar preview format
      const conversations = threads.map(t => {
        const isCustomer = String(t.customerId._id) === String(userId);
        const other = isCustomer ? t.providerId : t.customerId;

        const lastMsg = t.messages?.length
          ? t.messages[t.messages.length - 1]
          : null;

        const lastText = lastMsg
          ? (lastMsg.type === 'offer'
              ? `Offer: ₱${lastMsg.price ?? ''}`
              : (lastMsg.content || ''))
          : '';

        const listingTitle =
          (t.relatedPost && (t.relatedPost.title || t.relatedPost.serviceType)) || '';

        return {
          id: t._id,
          name: `${other.firstName} ${other.lastName}`,
          username: other.userName || '', // username shown in sidebar
          avatar: other.profilePicture || '/images/default_profile.png',
          last: lastText,
          title: listingTitle,
          myRole: isCustomer ? 'customer' : 'provider'
        };
      });

      return res.json({ success: true, conversations });

    } catch (err) {

      // Error handling
      console.error('Error in getMessagesList:', err);
      return res.status(500).render('error');

    }

  },

  // ---------- GET THREAD ----------
  getThread: async function (req, res) {

    try {

      // Check if session user exists
      if (!req.session.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      // Get necessary information for thread
      const userId = req.session.user._id;
      const threadId = req.params.id;

      // Fetch thread only if user is a participant
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

      // Error handling
      console.error('Error in getThread:', err);
      return res.status(500).render('error');

    }

  },

  // ---------- POST MESSAGES ----------
  postMessage: async function (req, res) {

    try {

      // Get session user
      const loggedInUser = req.session.user;
      if (!loggedInUser) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const userId = loggedInUser._id;
      const threadId = req.params.id;

      // Extract message payload
      const {
        content,
        type,
        price,
        images,
        accepted,
        declined,
        cancelled
      } = req.body;

      // Validate thread + user belongs to it
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

      // Build message object
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

      // Add message to thread
      thread.messages.push(msg);

      // If sending an offer, update negotiation state
      if (msg.type === 'offer') {
        thread.negotiatedPrice = msg.price;
        thread.status = 'Negotiating';
      }

      let createdBooking = null;

      // If provider replies to offer
      if (msg.type === 'offer-reply') {
        const isProvider = String(thread.providerId) === String(userId);
        if (!isProvider) {
          return res.status(403).json({
            success: false,
            error: 'Only provider can accept/decline offers'
          });
        }

        // Find most recent offer message
        const latestOffer = [...thread.messages]
          .slice(0, -1)
          .reverse()
          .find(m => m.type === 'offer');

        // Provider ACCEPTED offer
        if (msg.accepted) {
          thread.status = 'Agreed';

          const finalPrice =
            thread.negotiatedPrice ??
            (latestOffer ? latestOffer.price : undefined) ??
            msg.price;

          if (finalPrice == null) {
            return res.status(400).json({
              success: false,
              error: 'No agreed price found for booking'
            });
          }

          // Create booking if none exists
          if (!thread.relatedBooking) {
            const post = await Post.findById(thread.relatedPost).lean();
            if (!post || !post.serviceType) {
              return res.status(400).json({
                success: false,
                error: 'Cannot create booking: missing serviceType from post'
              });
            }

            createdBooking = await Booking.create({
              relatedMessage: thread._id,
              customerId: thread.customerId,
              providerId: thread.providerId,
              serviceType: post.serviceType,
              price: finalPrice,
              status: 'Ongoing',
              completedByProvider: false
            });

            thread.relatedBooking = createdBooking._id;
          }
        }

        // Provider DECLINED offer
        if (msg.declined) {
          thread.status = 'Rejected';
        }
      }

      // Save thread with new message
      await thread.save();

      const savedMsg = thread.messages[thread.messages.length - 1];

      return res.json({
        success: true,
        message: savedMsg,
        relatedBooking: thread.relatedBooking || null,
        threadStatus: thread.status
      });

    } catch (err) {

      // Error handling
      console.error('Error in postMessage:', err);
      return res.status(500).render('error');

    }

  },

  // ---------- POST COMPLETE BOOKING ----------
  postCompleteBooking: async function (req, res) {

    try {

      // Check if session user exists
      if (!req.session.user) {
        return res.status(401).json({ success: false, error: 'Not logged in' });
      }

      const userId = req.session.user._id;
      const threadId = req.params.id;

      // Fetch thread
      const thread = await Message.findById(threadId);
      if (!thread) {
        return res.status(404).json({ success: false, error: 'Thread not found' });
      }

      // Only provider can complete booking
      if (String(thread.providerId) !== String(userId)) {
        return res.status(403).json({
          success: false,
          error: 'Only provider can complete booking'
        });
      }

      // Validate booking link
      if (!thread.relatedBooking) {
        return res.status(400).json({ success: false, error: 'No booking linked to this thread' });
      }

      const booking = await Booking.findById(thread.relatedBooking);
      if (!booking) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }

      // Mark booking completed
      booking.status = 'Done';
      booking.completedByProvider = true;
      booking.dateCompleted = new Date();
      await booking.save();

      // Update thread status
      thread.status = 'Closed';
      thread.messages.push({
        sender: userId,
        content: 'Booking marked as complete.',
        type: 'offer-update',
        timestamp: new Date()
      });
      await thread.save();

      return res.json({
        success: true,
        bookingId: booking._id,
        bookingStatus: booking.status,
        threadStatus: thread.status
      });

    } catch (err) {

      // Error handling
      console.error('Error in completeBooking:', err);
      return res.status(500).render('error');

    }

  }

};

// Export object 'messageController'
module.exports = messageController;
