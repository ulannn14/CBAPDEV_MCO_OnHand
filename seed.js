// ============================================================
// seedData.js
// ============================================================
// Inserts 5 complete sample data per model for testing the OnHand app.
// Run with: node seedData.js --reset
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

  const shouldReset = process.argv.includes('--reset');
  if (shouldReset) {
    console.log('Reset flag detected, deleting existing data...');
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Message.deleteMany({}),
      Booking.deleteMany({}),
      Rating.deleteMany({}),
      Report.deleteMany({})
    ]);
    console.log('All collections cleared.\n');
  }

  // ------------------------------------------------------------
  // USERS
  // ------------------------------------------------------------
  const users = await User.insertMany([
    {
      firstName: 'Lian',
      lastName: 'Barte',
      userName: 'lncrlsbrt',
      email: 'lian@example.com',
      phoneNumber: '09171234567',
      password: '1234',
      birthday: new Date('2000-05-14'),
      type: 'provider',
      bio: 'Skilled plumber who loves solving complex home repair problems.',
      address: {
        houseNumber: '123',
        street: 'San Jose St.',
        barangay: 'Banlic',
        city: 'Cabuyao',
        province: 'Laguna',
        region: 'Region IV-A',
        country: 'Philippines',
        postalCode: '4025'
      },
      workingDays: ['Monday', 'Tuesday', 'Friday'],
      workingHours: '8AM - 6PM',
      WorkingArea: 'Laguna',
      profilePicture: '/uploads/profile_pics/lncrlsbrt_profile.jpg',
      validId: '/uploads/ids/lncrlsbrt_id.png',
      nbiClearance: '/uploads/nbi/lncrlsbrt_nbi.png'
    },
    {
      firstName: 'Leigh',
      lastName: 'Albo',
      userName: 'gwyeigh',
      email: 'leigh@example.com',
      phoneNumber: '09181234567',
      password: '1234',
      birthday: new Date('2000-06-10'),
      type: 'provider',
      bio: 'Professional electrician with years of residential experience.',
      address: {
        houseNumber: '56',
        street: 'Malvar St.',
        barangay: 'Sampaloc',
        city: 'Manila',
        province: 'Metro Manila',
        region: 'NCR',
        country: 'Philippines',
        postalCode: '1008'
      },
      workingDays: ['Wednesday', 'Thursday'],
      workingHours: '10AM - 4PM',
      WorkingArea: 'Manila',
      profilePicture: '/uploads/profile_pics/gwyeigh_profile.jpg',
      validId: '/uploads/ids/gwyeigh_id.png',
      nbiClearance: '/uploads/nbi/gwyeigh_nbi.png'
    },
    {
      firstName: 'Allysa',
      lastName: 'Villamor',
      userName: 'aloisuh',
      email: 'allysa@example.com',
      phoneNumber: '09191234567',
      password: '1234',
      birthday: new Date('2001-01-22'),
      type: 'customer',
      bio: 'Architecture student who often needs help with apartment repairs.',
      address: {
        houseNumber: '9B',
        street: 'Riverside Dr.',
        barangay: 'Pansol',
        city: 'Calamba',
        province: 'Laguna',
        region: 'Region IV-A',
        country: 'Philippines',
        postalCode: '4027'
      },
      profilePicture: '/uploads/profile_pics/aloisuh_profile.jpg',
      validId: '/uploads/ids/aloisuh_id.png'
    },
    {
      firstName: 'Rlsrain',
      lastName: 'Gonzales',
      userName: 'rlsrain',
      email: 'rain@example.com',
      phoneNumber: '09991234567',
      password: '1234',
      birthday: new Date('1999-07-30'),
      type: 'customer',
      bio: 'Freelance artist renting a studio space in Cavite.',
      address: {
        houseNumber: '27',
        street: 'Daisy Ave.',
        barangay: 'San Nicolas',
        city: 'Dasmariñas',
        province: 'Cavite',
        region: 'Region IV-A',
        country: 'Philippines',
        postalCode: '4114'
      },
      profilePicture: '/uploads/profile_pics/rlsrain_profile.jpg',
      validId: '/uploads/ids/rlsrain_id.png'
    },
    {
      firstName: 'Mac',
      lastName: 'Orcullo',
      userName: 'mackenlhy',
      email: 'mac@example.com',
      phoneNumber: '09091234567',
      password: '1234',
      birthday: new Date('2002-02-12'),
      type: 'provider',
      bio: 'Experienced appliance technician and handyman for hire.',
      address: {
        houseNumber: '45',
        street: 'Rosario St.',
        barangay: 'Zone IV',
        city: 'Dasmariñas',
        province: 'Cavite',
        region: 'Region IV-A',
        country: 'Philippines',
        postalCode: '4114'
      },
      workingDays: ['Monday', 'Saturday'],
      workingHours: '7AM - 7PM',
      WorkingArea: 'Cavite',
      profilePicture: '/uploads/profile_pics/mackenlhy_profile.jpg',
      validId: '/uploads/ids/mackenlhy_id.png',
      nbiClearance: '/uploads/nbi/mackenlhy_nbi.png'
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
      title: 'Reliable Plumbing Service - Laguna',
      description: 'Fixing leaks, clogged drains, and pipe replacements. Affordable rates!',
      priceRange: '₱500 - ₱1,500',
      location: 'Cabuyao, Laguna',
      workingHours: '8AM - 6PM',
      sampleWorkImages: ['/uploads/posts/lncrlsbrt-post-plumbing1.jpg', '/uploads/posts/lncrlsbrt-post-plumbing2.jpg'],
      levelOfUrgency: 'Non-Urgent'
    },
    {
      userId: users[1]._id,
      postType: 'Offering',
      serviceType: 'Electrical',
      title: 'Professional Electrician Available',
      description: 'Handles wiring, lighting, and electrical maintenance safely.',
      priceRange: '₱700 - ₱2,000',
      location: 'Manila',
      workingHours: '10AM - 4PM',
      sampleWorkImages: [],
      levelOfUrgency: 'Non-Urgent'
    },
    {
      userId: users[2]._id,
      postType: 'LookingFor',
      serviceType: 'Cleaning',
      title: 'Need Help Cleaning Dorm Room',
      description: 'Looking for someone to deep clean a dorm this weekend.',
      priceRange: '₱300 - ₱600',
      location: 'Calamba, Laguna',
      levelOfUrgency: 'Urgent'
    },
    {
      userId: users[3]._id,
      postType: 'LookingFor',
      serviceType: 'Painting',
      title: 'Looking for Wall Painter',
      description: 'Need an affordable painter for a 2-bedroom apartment.',
      priceRange: '₱1,000 - ₱3,000',
      location: 'Dasmariñas, Cavite',
      levelOfUrgency: 'Non-Urgent'
    },
    {
      userId: users[4]._id,
      postType: 'Offering',
      serviceType: 'Appliance Repair',
      title: 'Appliance Repair Services',
      description: 'Expert repair for refrigerators, washing machines, and air conditioners.',
      priceRange: '₱800 - ₱2,500',
      location: 'Dasmariñas, Cavite',
      workingHours: '7AM - 7PM',
      sampleWorkImages: [],
      levelOfUrgency: 'Non-Urgent'
    }
  ]);

  console.log('Posts inserted.');

  // ------------------------------------------------------------
  // MESSAGES
  // ------------------------------------------------------------
  const messages = await Message.insertMany([
    {
      customerId: users[2]._id,
      providerId: users[0]._id,
      relatedPost: posts[0]._id,
      messages: [
        { sender: users[2]._id, content: 'Hi, can you check my leaking sink tomorrow?' },
        { sender: users[0]._id, content: 'Sure! Morning or afternoon?' },
        { sender: users[2]._id, content: 'Afternoon works, thanks!' }
      ],
      negotiatedPrice: 850,
      status: 'Agreed'
    },
    {
      customerId: users[3]._id,
      providerId: users[4]._id,
      relatedPost: posts[4]._id,
      messages: [
        { sender: users[3]._id, content: 'My washing machine stopped spinning.' },
        { sender: users[4]._id, content: 'I can check it today.' },
        { sender: users[3]._id, content: 'Great! Around 4PM?' }
      ],
      negotiatedPrice: 600,
      status: 'Negotiating'
    },
    {
      customerId: users[2]._id,
      providerId: users[1]._id,
      relatedPost: posts[1]._id,
      messages: [
        { sender: users[2]._id, content: 'Do you fix broken outlets?' },
        { sender: users[1]._id, content: 'Yes, I handle rewiring too.' }
      ],
      negotiatedPrice: 1000,
      status: 'Closed'
    },
    {
      customerId: users[3]._id,
      providerId: users[0]._id,
      relatedPost: posts[0]._id,
      messages: [
        { sender: users[3]._id, content: 'Do you install water heaters?' },
        { sender: users[0]._id, content: 'Yes, I can handle that easily.' }
      ],
      negotiatedPrice: 1200,
      status: 'Agreed'
    },
    {
      customerId: users[2]._id,
      providerId: users[4]._id,
      relatedPost: posts[4]._id,
      messages: [
        { sender: users[2]._id, content: 'Can you fix AC cooling issues?' },
        { sender: users[4]._id, content: 'Yes, I’ve done that many times.' }
      ],
      negotiatedPrice: 1500,
      status: 'Negotiating'
    }
  ]);

  console.log('Messages inserted.');

  // ------------------------------------------------------------
  // BOOKINGS
  // ------------------------------------------------------------
  const bookings = await Booking.insertMany([
    {
      relatedMessage: messages[0]._id,
      customerId: users[2]._id,
      providerId: users[0]._id,
      serviceType: 'Plumbing',
      price: 850,
      status: 'Ongoing'
    },
    {
      relatedMessage: messages[1]._id,
      customerId: users[3]._id,
      providerId: users[4]._id,
      serviceType: 'Appliance Repair',
      price: 600,
      status: 'ToRate'
    },
    {
      relatedMessage: messages[2]._id,
      customerId: users[2]._id,
      providerId: users[1]._id,
      serviceType: 'Electrical',
      price: 1000,
      status: 'Done',
      completedByProvider: true,
      dateCompleted: new Date('2025-11-10')
    },
    {
      relatedMessage: messages[3]._id,
      customerId: users[3]._id,
      providerId: users[0]._id,
      serviceType: 'Plumbing',
      price: 1200,
      status: 'Cancelled'
    },
    {
      relatedMessage: messages[4]._id,
      customerId: users[2]._id,
      providerId: users[4]._id,
      serviceType: 'Appliance Repair',
      price: 1500,
      status: 'Ongoing'
    }
  ]);

  console.log('Bookings inserted.');

  // ------------------------------------------------------------
  // RATINGS
  // ------------------------------------------------------------
  const ratings = await Rating.insertMany([
    {
      fromUser: users[2]._id,
      toUser: users[0]._id,
      relatedBooking: bookings[2]._id,
      stars: 5,
      review: 'Fast and reliable service, thank you!'
    },
    {
      fromUser: users[3]._id,
      toUser: users[4]._id,
      relatedBooking: bookings[1]._id,
      stars: 4,
      review: 'Fixed it quickly but came 15 minutes late.'
    },
    {
      fromUser: users[0]._id,
      toUser: users[2]._id,
      relatedBooking: bookings[0]._id,
      stars: 5,
      review: 'Very polite and easy to talk to.'
    },
    {
      fromUser: users[1]._id,
      toUser: users[2]._id,
      relatedBooking: bookings[2]._id,
      stars: 4,
      review: 'Good coordination throughout the job.'
    },
    {
      fromUser: users[4]._id,
      toUser: users[3]._id,
      relatedBooking: bookings[1]._id,
      stars: 5,
      review: 'Kind customer, paid promptly.'
    }
  ]);

  console.log('Ratings inserted.');

  // ------------------------------------------------------------
  // REPORTS
  // ------------------------------------------------------------
  await Report.insertMany([
    {
      reportedBy: users[2]._id,
      reportedUser: users[1]._id,
      relatedBooking: bookings[2]._id,
      reason: 'Did not respond for 3 days before the appointment.',
      status: 'Pending'
    },
    {
      reportedBy: users[3]._id,
      reportedUser: users[4]._id,
      relatedBooking: bookings[1]._id,
      reason: 'Charged more than agreed price.',
      status: 'Reviewed',
      adminNotes: 'Provider warned about pricing transparency.'
    },
    {
      reportedBy: users[0]._id,
      reportedUser: users[2]._id,
      relatedBooking: bookings[0]._id,
      reason: 'Cancelled at last minute after confirmation.',
      status: 'Resolved',
      adminNotes: 'Customer apologized, case closed.'
    },
    {
      reportedBy: users[1]._id,
      reportedUser: users[3]._id,
      relatedBooking: bookings[3]._id,
      reason: 'Rude behavior during chat.',
      status: 'Dismissed',
      adminNotes: 'No sufficient evidence provided.'
    },
    {
      reportedBy: users[4]._id,
      reportedUser: users[0]._id,
      relatedBooking: bookings[4]._id,
      reason: 'Attempted to undercut service fee after agreement.',
      status: 'Pending'
    }
  ]);

  console.log('Reports inserted.');
  console.log('\nSeeding Completed Successfully.');
  process.exit();
}

seed();
