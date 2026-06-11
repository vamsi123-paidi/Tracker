import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { User } from '../models/User.js';
import { College } from '../models/College.js';
import { AuthRequest } from '../middleware/auth.js';
import { Submission } from '../models/Submission.js';
import { QuizResult } from '../models/QuizResult.js';
import { AssessmentSubmission } from '../models/AssessmentSubmission.js';

// Setup Cloudinary if credentials are provided
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Ensure local uploads directory exists for fallback
const localUploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeychangeinproduction';

// Unified Login
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        college: user.college
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Trainer Signup (Standard signup for trainer)
export const registerTrainer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, code } = req.body;

    // Optional signup secret check to protect Trainer registration
    const trainerSignupSecret = process.env.TRAINER_SIGNUP_SECRET || 'tracker-admin-secret';
    if (code !== trainerSignupSecret) {
      res.status(403).json({ message: 'Invalid registration credentials' });
      return;
    }

    if (!name || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newTrainer = new User({
      name,
      email: normalizedEmail,
      passwordHash,
      role: 'trainer'
    });

    await newTrainer.save();

    res.status(201).json({ message: 'Trainer registered successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Get current logged in user details
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.user.id).select('-passwordHash').populate('college');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving user info', error: error.message });
  }
};

// Update User Profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;
    const { name, email, password } = req.body;
    const file = req.file;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // If email is changing, make sure it's not taken by another user
    if (email && email.toLowerCase().trim() !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        res.status(400).json({ message: 'Email is already taken by another account' });
        return;
      }
      user.email = normalizedEmail;
    }

    if (name) {
      user.name = name;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    // Process profile image upload
    if (file) {
      let profileImageUrl = '';
      let uploadSuccess = false;
      const hasCloudinaryEnv = !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      );

      if (hasCloudinaryEnv) {
        try {
          profileImageUrl = await new Promise<string>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'tracker_profiles' },
              (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error('Cloudinary upload result was undefined'));
                resolve(result.secure_url);
              }
            );
            Readable.from(file.buffer).pipe(stream);
          });
          uploadSuccess = true;
        } catch (uploadError: any) {
          console.warn('Cloudinary profile upload failed, falling back to local storage:', uploadError);
        }
      }

      if (!uploadSuccess) {
        // Save file locally to process.cwd()/uploads/ and return relative static URL path
        try {
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
          const filepath = path.join(process.cwd(), 'uploads', filename);
          fs.writeFileSync(filepath, file.buffer);
          profileImageUrl = `/uploads/${filename}`;
        } catch (localError: any) {
          console.error('Local file save failed:', localError);
          res.status(500).json({ message: 'Failed to save profile image file locally', error: localError.message });
          return;
        }
      }
      user.profileImage = profileImageUrl;
    }


    await user.save();

    // Populate college details to return a complete user object
    const updatedUser = await User.findById(userId).select('-passwordHash').populate('college');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// Update User Progress Telemetry
export const updateUserProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const studentId = req.user.id;
    const {
      studyNotesCount,
      playgroundRuns,
      compilerRuns,
      notesReadCount,
      badgesUnlocked
    } = req.body;

    const user = await User.findById(studentId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Merge/update activity fields if they are sent in request body
    if (typeof studyNotesCount === 'number') user.studyNotesCount = studyNotesCount;
    if (typeof playgroundRuns === 'number') user.playgroundRuns = playgroundRuns;
    if (typeof compilerRuns === 'number') user.compilerRuns = compilerRuns;
    if (typeof notesReadCount === 'number') user.notesReadCount = notesReadCount;
    if (Array.isArray(badgesUnlocked)) {
      user.badgesUnlocked = Array.from(new Set([...(user.badgesUnlocked || []), ...badgesUnlocked]));
    }

    // Calculate dynamic experience points (XP)
    const approvedMilestones = await Submission.countDocuments({ student: studentId, status: 'approved' });
    const quizAttempts = await QuizResult.countDocuments({ student: studentId });
    const assessmentSolves = await AssessmentSubmission.countDocuments({ student: studentId, passedAll: true });

    // Points calculation:
    // Approved milestones = 50 pts each
    // Attempted quizzes = 20 pts each
    // Passed assessments = 30 pts each
    // Study notes created = 10 pts each
    // Playground runs = 5 pts each
    // Compiler runs = 5 pts each
    // Notes read count = 2 pts each
    // Badges unlocked = 50 pts each
    const milestonePoints = approvedMilestones * 50;
    const quizPoints = quizAttempts * 20;
    const assessmentPoints = assessmentSolves * 30;
    const notesCreatedPoints = (user.studyNotesCount || 0) * 10;
    const playgroundPoints = (user.playgroundRuns || 0) * 5;
    const compilerPoints = (user.compilerRuns || 0) * 5;
    const notesReadPoints = (user.notesReadCount || 0) * 2;
    const badgePoints = (user.badgesUnlocked?.length || 0) * 50;

    user.points = milestonePoints + quizPoints + assessmentPoints + notesCreatedPoints + playgroundPoints + compilerPoints + notesReadPoints + badgePoints;

    await user.save();

    const updatedUser = await User.findById(studentId).select('-passwordHash').populate('college');

    res.status(200).json({
      message: 'Telemetry progress synced successfully',
      user: updatedUser
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to sync telemetry progress', error: error.message });
  }
};
