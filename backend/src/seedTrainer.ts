import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { connectDB } from './db.js';

dotenv.config();

const seed = async () => {
  await connectDB();
  
  const name = "vamsi paidi";
  const email = "vamsi@tracker.com";
  const password = "Tracker@123";

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`User ${email} already exists! Updating password...`);
      const salt = await bcrypt.genSalt(10);
      existing.passwordHash = await bcrypt.hash(password, salt);
      existing.name = name;
      await existing.save();
      console.log("Trainer credentials updated successfully.");
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const newTrainer = new User({
        name,
        email,
        passwordHash,
        role: 'trainer'
      });
      await newTrainer.save();
      console.log("Trainer credentials created successfully.");
    }
  } catch (error) {
    console.error("Failed to seed trainer:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

seed();
