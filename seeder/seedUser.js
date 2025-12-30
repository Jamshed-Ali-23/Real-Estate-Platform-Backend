const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from backend folder
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
const User = require('../models/User');

console.log('🌱 Starting user seeding...');
console.log(`📊 Connecting to: ${process.env.MONGODB_URI ? 'MongoDB Atlas' : 'No URI found'}`);

// Demo user data - Pakistani Agent
const demoUser = {
  name: 'Ahmed Raza Khan',
  email: 'ahmed@khanrealestate.pk',
  password: 'admin123',
  role: 'admin',
  phone: '+92 321 1234567',
  title: 'Licensed Property Consultant',
  bio: 'With over 12 years of experience in Pakistan real estate market, I help clients find their dream properties across Islamabad, Lahore, and Karachi.',
  license: 'RECA-PK-2024-1234',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  isActive: true
};

const seedUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Check if user already exists
    const existingUser = await User.findOne({ email: demoUser.email });
    
    if (existingUser) {
      console.log('👤 Demo user already exists, updating...');
      // Update existing user (except password if not changed)
      await User.findByIdAndUpdate(existingUser._id, {
        name: demoUser.name,
        role: demoUser.role,
        phone: demoUser.phone,
        title: demoUser.title,
        bio: demoUser.bio,
        license: demoUser.license,
        avatar: demoUser.avatar,
        isActive: demoUser.isActive
      });
      console.log('✅ Demo user updated!');
    } else {
      // Create new user
      await User.create(demoUser);
      console.log('✅ Demo user created!');
    }

    console.log(`
📋 Demo User Credentials:
   Email: ${demoUser.email}
   Password: ${demoUser.password}
   Role: ${demoUser.role}

🎉 User seeded successfully!
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding user:', error);
    process.exit(1);
  }
};

seedUser();
