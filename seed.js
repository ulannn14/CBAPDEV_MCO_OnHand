// ============================================================
// seedData.js
// ============================================================
// Inserts 5 sample data per model for testing the OnHand app.
// Run using: node seedData.js
// ============================================================

const db = require('./models/db');
const User = require('./models/UserModel');
const Post = require('./models/PostModel');
const Message = require('./models/MessageModel');
const Booking = require('./models/BookingModel');
const Rating = require('./models/RatingModel');
const Report = require('./models/ReportModel');

async function seed() {
  await db.connect();

  // ------------------------------------------------------------
  // USERS
  // ------------------------------------------------------------
  const users = await User.insertMany([
    {
      firstName: 'Lian',
      lastName: 'Barte',
      userName: 'lianb',
      email: 'lian@example.com',
      phoneNumber: '09171234567',
      password: '1234',
      birthday: new Date('2000-05-14'),
      type: 'provider',
      workingDays: ['Monday', 'Tuesday', 'Friday'],
      workingHours: '8AM - 6PM',
      WorkingArea: 'Laguna'
    },
    {
      firstName: 'Leigh',
      lastName: 'Albo',
      userName: 'leigha',
      email: 'leigh@example.com',
      phoneNumber: '09181234567',
      password: '1234',
      birthday: new Date('2000-06-10'),
      type: 'provider',
      workingDays: ['Wednesday', 'Thursday'],
      workingHours: '10AM - 4PM',
      WorkingArea: 'Manila'
    },
    {
      firstName: 'Allysa',
      lastName: 'Villamor',
      userName: 'allysav',
      email: 'allysa@example.com',
      phoneNumber: '09191234567',
      password: '1234',
      birthday: new Date('2001-01-22'),
      type: 'customer'
    },
    {
      firstName: 'Rain',
      lastName: 'Orcullo',
      userName: 'raino',
      email: 'rain@example.com',
      phoneNumber: '09991234567',
      password: '1234',
      birthday: new Date('1999-07-30'),
      type: 'customer'
    },
    {
      firstName: 'Mac',
      lastName: 'Villanueva',
      userName: 'macv',
      email: 'mac@example.com',
      phoneNumber: '09091234567',
      password: '1234',
      birthday: new Date('2002-02-12'),
      type: 'provider',
      workingDays: ['Monday', 'Saturday'],
      workingHours: '7AM - 7PM',
      WorkingArea: 'Cavite'
    }
  ]);

  console.log('Users inserted.');

  // ------------------------------------------------------------
  // POSTS
  // ------------------------------------------------------------
  const posts = await Post.insertMany([
    {
      userId: users[0]._id,
      postType: 'Offering',
      serviceType: 'Plumbing',
      description: 'Experienced plumber available for pipe leaks and bathroom repairs.',
      location: 'Laguna'
    },
    {
      userId: users[1]._id,
      postType: 'Offering',
      serviceType: 'Electrical',
      description: 'Certified electrician — installs lights and rewires houses.',
      location: 'Manila'
    },
    {
      userId: users[2]._id,
      postType: 'LookingFor',
      serviceType: 'Cleaning',
      description: 'Need help deep cleaning a dorm room this weekend.',
      location: 'Laguna'
    },
    {
      userId: users[3]._id,
      postType: 'LookingFor',
      serviceType: 'Painting',
      description: 'Looking for someone to paint a 2-bedroom apartment.',
      location: 'Cavite'
    },
    {
      userId: users[4]._id,
      postType: 'Offering',
      serviceType: 'Appliance Repair',
      description: 'Fixing refrigerators, washing machines, and small appliances.',
      location: 'Cavite'
    }
  ]);

  console.log('Posts inserted.');

  // ------------------------------------------------------------
  // 3️⃣ MESSAGES
  // ------------------------------------------------------------
  const messages = await Message.insertMany([
    {
      customerId: users[2]._id,
      providerId: users[0]._id,
      relatedPost: posts[0]._id,
      messages: [
        { sender: users[2]._id, content: 'Hi! Are you available tomorrow?' },
        { sender: users[0]._id, content: 'Yes! What time works for you?' }
      ],
      negotiatedPrice: 800,
      status: 'Agreed'
    },
    {
      customerId: users[3]._id,
      providerId: users[4]._id,
      relatedPost: posts[4]._id,
      messages: [
        { sender: users[3]._id, content: 'Can you fix my washing machine?' },
        { sender: users[4]._id, content: 'Sure, what model is it?' }
      ],
      negotiatedPrice: 500,
      status: 'Negotiating'
    }
  ]);

  console.log('Messages inserted.');

  // ------------------------------------------------------------
  // 4️⃣ BOOKINGS
  // ------------------------------------------------------------
  const bookings = await Booking.insertMany([
    {
      relatedMessage: messages[0]._id,
      customerId: users[2]._id,
      providerId: users[0]._id,
      serviceType: 'Plumbing',
      price: 800,
      status: 'Ongoing'
    },
    {
      relatedMessage: messages[1]._id,
      customerId: users[3]._id,
      providerId: users[4]._id,
      serviceType: 'Appliance Repair',
      price: 500,
      status: 'ToRate'
    },
    {
      relatedMessage: messages[0]._id,
      customerId: users[2]._id,
      providerId: users[0]._id,
      serviceType: 'Plumbing',
      price: 800,
      status: 'Done'
    }
  ]);

  console.log('Bookings inserted.');

  // ------------------------------------------------------------
  // 5️⃣ RATINGS
  // ------------------------------------------------------------
  const ratings = await Rating.insertMany([
    {
      fromUser: users[2]._id,
      toUser: users[0]._id,
      relatedBooking: bookings[2]._id,
      stars: 5,
      review: 'Quick and reliable plumber!'
    },
    {
      fromUser: users[3]._id,
      toUser: users[4]._id,
      relatedBooking: bookings[1]._id,
      stars: 4,
      review: 'Fixed it fast but was late by 10 minutes.'
    }
  ]);

  console.log('Ratings inserted.');

  // ------------------------------------------------------------
  // 6️⃣ REPORTS
  // ------------------------------------------------------------
  await Report.insertMany([
    {
      reportedBy: users[2]._id,
      reportedUser: users[1]._id,
      reason: 'Did not respond to messages for 3 days.',
      status: 'Pending'
    },
    {
      reportedBy: users[3]._id,
      reportedUser: users[4]._id,
      reason: 'Charged more than agreed price.',
      status: 'Reviewed'
    }
  ]);

  console.log('Reports inserted.');
  console.log('\n🎉 SEEDING COMPLETE!');
  process.exit();
}

seed();
