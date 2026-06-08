import { Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { Submission } from '../models/Submission.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

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

// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'holotrack_submissions' },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error('Cloudinary upload result was undefined'));
        }
        resolve(result.secure_url);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

// Student Submits Task
export const submitTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId, notes } = req.body;
    const file = req.file;

    if (!taskId) {
      res.status(400).json({ message: 'Task ID is required' });
      return;
    }

    if (!file) {
      res.status(400).json({ message: 'Screenshot file is required' });
      return;
    }

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Verify student belongs to the task's college
    if (req.user?.college && String(task.college) !== String(req.user.college)) {
      res.status(403).json({ message: 'You are not authorized to submit for this task' });
      return;
    }

    // Check if task is already approved
    const existingApproved = await Submission.findOne({
      task: taskId,
      student: req.user?.id,
      status: 'approved'
    });

    if (existingApproved) {
      res.status(400).json({ message: 'This task has already been approved' });
      return;
    }

    let screenshotUrl = '';

    if (useCloudinary) {
      try {
        screenshotUrl = await uploadToCloudinary(file.buffer);
      } catch (uploadError: any) {
        console.error('Cloudinary upload failed, falling back to local storage:', uploadError);
        // Fallback to local storage if Cloudinary fails
        const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        const filePath = path.join(localUploadsDir, fileName);
        await fs.promises.writeFile(filePath, file.buffer);
        screenshotUrl = `/uploads/${fileName}`;
      }
    } else {
      // Local file upload fallback
      const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
      const filePath = path.join(localUploadsDir, fileName);
      await fs.promises.writeFile(filePath, file.buffer);
      screenshotUrl = `/uploads/${fileName}`;
    }

    // Create or update submission
    let submission = await Submission.findOne({
      task: taskId,
      student: req.user?.id,
      status: { $ne: 'approved' } // Can overwrite pending/rejected submissions
    });

    if (submission) {
      submission.screenshotUrl = screenshotUrl;
      submission.notes = notes || submission.notes;
      submission.status = 'pending'; // Reset back to pending
      submission.feedback = ''; // Reset feedback
      await submission.save();
    } else {
      submission = new Submission({
        task: taskId,
        student: req.user?.id,
        screenshotUrl,
        notes,
        status: 'pending'
      });
      await submission.save();
    }

    res.status(201).json({ message: 'Task submitted successfully', submission });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to submit task', error: error.message });
  }
};

// Trainer Reviews Submission (Approve/Reject)
export const reviewSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { status, feedback } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ message: 'Invalid status. Must be approved or rejected' });
      return;
    }

    const submission = await Submission.findById(submissionId).populate({
      path: 'task',
      select: 'college'
    });

    if (!submission) {
      res.status(404).json({ message: 'Submission not found' });
      return;
    }

    // Optional: Verify trainer belongs to the same college if required,
    // or trainers can moderate all colleges. In this setup, trainer is global or moderation is open.

    submission.status = status;
    submission.feedback = feedback || '';
    submission.reviewedAt = new Date();

    await submission.save();

    res.status(200).json({ message: `Submission ${status} successfully`, submission });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to review submission', error: error.message });
  }
};

// Retrieve Submissions
export const getSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId, status } = req.query;
    const filter: any = {};

    if (taskId) filter.task = taskId;
    if (status) filter.status = status;

    if (req.user?.role === 'student') {
      // Students only see their own submissions
      filter.student = req.user.id;
      const submissions = await Submission.find(filter)
        .populate('task')
        .sort({ createdAt: -1 });
      res.status(200).json(submissions);
    } else {
      // Trainers see all submissions, but can filter by task or college
      // If we want to populate student details and tasks
      const submissions = await Submission.find(filter)
        .populate({
          path: 'student',
          select: 'name email college',
          populate: { path: 'college', select: 'name code' }
        })
        .populate({
          path: 'task',
          select: 'title description dueDate college',
          populate: { path: 'college', select: 'name code' }
        })
        .sort({ createdAt: -1 });

      res.status(200).json(submissions);
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to get submissions', error: error.message });
  }
};
