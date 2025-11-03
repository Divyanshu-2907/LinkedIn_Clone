import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedDemoUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');

    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'demo@example.com' });
    
    if (existingUser) {
      console.log('Demo user already exists!');
      console.log('Email: demo@example.com');
      console.log('Password: demo123');
      process.exit(0);
    }

    // Create demo user
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'demo123',
      avatar: 'https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=Demo+User'
    });

    console.log('✅ Demo user created successfully!');
    console.log('-----------------------------------');
    console.log('Email: demo@example.com');
    console.log('Password: demo123');
    console.log('-----------------------------------');
    console.log('You can now use these credentials to login.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo user:', error);
    process.exit(1);
  }
};

seedDemoUser();
