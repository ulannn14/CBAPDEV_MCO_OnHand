// import module `database` from `../models/UserModel.js`
const User = require('../models/UserModel.js');

// import module `database` from `../models/MessageModel.js`
const Message = require('../models/MessageModel.js');

// import module `database` from `../models/PostModel.js`
const Post = require('../models/PostModel.js');

// import module `database` from `../models/BookingModel.js`
const Booking = require('../models/BookingModel.js');

// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const messageController = {

  // RENDER CHATBOX PAGE (existing)
    getMessages: async function (req, res) {
      try {
        const sessionUser = req.session.user;
        const loggedInUser = await db.findOne(User, { _id: sessionUser._id });
        if (!loggedInUser) return res.redirect('/');

        const threadId = req.query.thread || null;

        // use session mode, fall back to provider/customer based on type
        const currentMode = sessionUser.mode || (loggedInUser.type === 'provider'
          ? 'provider'
          : 'customer');

        res.render('chatbox', {
          user: loggedInUser,
          threadId,
          isProvider: currentMode === 'provider',
          mode: currentMode        // 👈 pass this to the template
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

        const post = await db.findOne(Post, { _id: postId });
        if (!post) {
          return res.redirect('/messages');
        }

        let customerId, providerId;

        const currentMode = req.session.user.mode || 'customer';

        if (currentMode === 'provider') {
          providerId = loggedInUser._id;
          customerId = otherId;
        } else {
          customerId = loggedInUser._id;
          providerId = otherId;
        }

        let thread = await Message.findOne({
          customerId,
          providerId,
          relatedPost: postId
        });

        if (!thread) {
          thread = await Message.create({
            customerId,
            providerId,
            relatedPost: postId,
            messages: []
          });
        }

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
        const currentMode = loggedInUser.mode || 'customer';  // 👈 use session.mode

        let threadFilter;
        if (currentMode === 'provider') {
          // Provider mode: show threads where I'm the provider
          threadFilter = { providerId: userId };
        } else {
          // Customer mode: show threads where I'm the customer
          threadFilter = { customerId: userId };
        }

        const threads = await Message.find(threadFilter)
        .populate('customerId providerId', 'firstName lastName profilePicture userName')
        .populate('relatedPost', 'title serviceType')
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

          const listingTitle =
            (t.relatedPost && (t.relatedPost.title || t.relatedPost.serviceType)) || '';

          return {
            id: t._id,
            name: `${other.firstName} ${other.lastName}`,
            username: other.userName || '',              // <-- new
            avatar: other.profilePicture || '/images/default_profile.png',
            last: lastText,
            title: listingTitle,
            myRole: isCustomer ? 'customer' : 'provider'
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

        // If sending an offer, remember negotiated price
        if (msg.type === 'offer') {
          thread.negotiatedPrice = msg.price;
          thread.status = 'Negotiating';
        }

        let createdBooking = null;

        // Provider accepting/declining offer
        if (msg.type === 'offer-reply') {
          const isProvider = String(thread.providerId) === String(userId);

          if (!isProvider) {
            return res
              .status(403)
              .json({ success: false, error: 'Only provider can accept/decline offers' });
          }

          // Find the latest offer in this thread
          const latestOffer = [...thread.messages]
            .slice(0, -1) // ignore current offer-reply we just pushed
            .reverse()
            .find(m => m.type === 'offer');

          // ACCEPTED: create booking if not yet existing
          if (msg.accepted) {
            thread.status = 'Agreed';

            // Final price: negotiatedPrice > latestOffer.price > msg.price
            const finalPrice =
              thread.negotiatedPrice ??
              (latestOffer ? latestOffer.price : undefined) ??
              msg.price;

            if (finalPrice == null) {
              return res
                .status(400)
                .json({ success: false, error: 'No agreed price found for booking' });
            }

            if (!thread.relatedBooking) {
              // We need serviceType from the related post
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
                serviceType: post.serviceType, // must match enum
                price: finalPrice,
                status: 'Ongoing',
                completedByProvider: false
              });

              thread.relatedBooking = createdBooking._id;
            }
          }

          // DECLINED
          if (msg.declined) {
            thread.status = 'Rejected';
          }
        }

        await thread.save();

        const savedMsg = thread.messages[thread.messages.length - 1];

        return res.json({
          success: true,
          message: savedMsg,
          relatedBooking: thread.relatedBooking || null,
          threadStatus: thread.status
        });


      } catch (err) {
        console.error('Error in postMessage:', err);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
    },

      completeBooking: async function (req, res) {
        try {
          if (!req.session.user) {
            return res.status(401).json({ success: false, error: 'Not logged in' });
          }

          const userId = req.session.user._id;
          const threadId = req.params.id;

          // find the thread
          const thread = await Message.findById(threadId);
          if (!thread) {
            return res.status(404).json({ success: false, error: 'Thread not found' });
          }

          // only provider of this thread can complete
          if (String(thread.providerId) !== String(userId)) {
            return res.status(403).json({ success: false, error: 'Only provider can complete booking' });
          }

          if (!thread.relatedBooking) {
            return res.status(400).json({ success: false, error: 'No booking linked to this thread' });
          }

          const booking = await Booking.findById(thread.relatedBooking);
          if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
          }

          booking.status = 'Done';              
          booking.completedByProvider = true;
          booking.dateCompleted = new Date();
          await booking.save();

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
          console.error('Error in completeBooking:', err);
          return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
      }



};

module.exports = messageController;
