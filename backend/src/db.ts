import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Assessment } from './models/Assessment.js';
import { generate100Assessments } from './data/assessmentsSeed.js';
import { migrateBase64ImagesToCloudinary } from './utils/migration.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tasktrack';

const seedAssessments = async () => {
  try {
    const count = await Assessment.countDocuments();
    if (count === 0) {
      console.log('No assessments found. Seeding 100 HTML/CSS/JS coding challenges...');
      const seeds = generate100Assessments();
      await Assessment.insertMany(seeds);
      console.log('Successfully seeded 100 assessments.');
    } else {
      console.log(`Found ${count} assessments in the database.`);
    }
  } catch (err) {
    console.error('Failed to seed assessments:', err);
  }
};

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to MongoDB.');
    await seedAssessments();
    // Clean up large Base64 images to lower database storage usage
    await migrateBase64ImagesToCloudinary();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

