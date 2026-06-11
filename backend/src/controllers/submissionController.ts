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
      { folder: 'tracker_submissions' },
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
    let uploadSuccess = false;

    const hasCloudinaryEnv = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (hasCloudinaryEnv) {
      try {
        screenshotUrl = await uploadToCloudinary(file.buffer);
        uploadSuccess = true;
      } catch (uploadError: any) {
        console.warn('Cloudinary upload failed, falling back to local storage:', uploadError);
      }
    }

    if (!uploadSuccess) {
      // Save file locally to process.cwd()/uploads/ and return relative static URL path
      try {
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        const filepath = path.join(process.cwd(), 'uploads', filename);
        fs.writeFileSync(filepath, file.buffer);
        screenshotUrl = `/uploads/${filename}`;
      } catch (localError: any) {
        console.error('Local file save failed:', localError);
        res.status(500).json({ message: 'Failed to save screenshot file locally', error: localError.message });
        return;
      }
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

    // Automatically trigger auto-review directly on student submission
    try {
      const taskDoc = await Task.findById(taskId);
      if (taskDoc) {
        const reviewResult = await evaluateSubmissionWithAi(submission, taskDoc);
        submission.status = reviewResult.status;
        submission.feedback = reviewResult.feedback;
        submission.reviewedAt = new Date();
        await submission.save();
      }
    } catch (aiError: any) {
      console.error('Automatic submission review failed, leaving as pending:', aiError);
    }

    res.status(201).json({ message: 'Task submitted and reviewed successfully', submission });
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

// Helper function to perform automated evaluation logic
export const evaluateSubmissionWithAi = async (
  submission: any,
  task: any
): Promise<{ status: 'approved' | 'rejected'; feedback: string }> => {
  const notesText = (submission.notes || '').trim();
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback Offline Rule-Based Evaluator
  if (!apiKey) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hasUrl = urlRegex.test(notesText);

    let status: 'approved' | 'rejected' = 'rejected';
    let feedback = '';

    if (hasUrl) {
      status = 'approved';
      feedback = `[Auto-Review (Fallback)]: I detected a valid URL link in your notes/links field. This meets the submission requirements for the task "${task.title}". Approved.`;
    } else {
      status = 'rejected';
      feedback = `[Auto-Review (Fallback)]: No valid project URL links detected in your notes. The milestone task "${task.title}" requires a GitHub repository or live deployment link. Please revise and provide a valid link in your notes.`;
    }

    return { status, feedback };
  }

  // Call live Gemini 2.5 Flash API for automated evaluation
  const promptText = 
    "SYSTEM INSTRUCTION:\n" +
    "You are an automated grading assistant. Your purpose is to review student milestone submissions.\n" +
    "Analyze the student's submission notes and links against the task requirements. Decide if it should be Approved or Rejected (needs revision) and explain why in the feedback.\n\n" +
    "TASK CRITERIA:\n" +
    `Title: ${task.title}\n` +
    `Description: ${task.description}\n\n` +
    "STUDENT SUBMISSION NOTES/LINKS:\n" +
    `${notesText || 'No notes or links provided.'}\n\n` +
    "EVALUATION RULES:\n" +
    "1. If the task description requires a website, deployment, source code, or repo, check if the student provided a valid URL in their notes.\n" +
    "2. If they provided a URL that looks like a valid git repository or deployment URL, approve it and summarize why it is correct.\n" +
    "3. If they did not provide a URL where one is expected, or if the text is placeholder/empty/irrelevant, reject it and state what they need to provide.\n\n" +
    "OUTPUT FORMAT:\n" +
    "You MUST respond ONLY with a raw JSON object matching this schema (do NOT wrap it in ```json blocks or include other text):\n" +
    "{\n" +
    "  \"status\": \"approved\" or \"rejected\",\n" +
    "  \"feedback\": \"Constructive evaluation comments.\"\n" +
    "}";

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: promptText }]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API call failed with status ${response.status}`);
  }

  const data = await response.json();
  let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Clean up JSON block formatting if returned by LLM
  rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

  let status: 'approved' | 'rejected' = 'rejected';
  let feedback = '';

  try {
    const parsedResult = JSON.parse(rawText);
    status = parsedResult.status === 'approved' ? 'approved' : 'rejected';
    feedback = parsedResult.feedback || 'Evaluated by system reviewer.';
  } catch (parseErr) {
    const isApproved = rawText.toLowerCase().includes('approved') || rawText.toLowerCase().includes('"status": "approved"');
    status = isApproved ? 'approved' : 'rejected';
    feedback = rawText || 'Evaluated by system reviewer.';
  }

  return { status, feedback };
};

// Automated Submission Reviewer (Trainer)
export const autoReviewSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const submission = await Submission.findById(submissionId).populate('task');

    if (!submission) {
      res.status(404).json({ message: 'Submission not found' });
      return;
    }

    const task: any = submission.task;
    if (!task) {
      res.status(400).json({ message: 'Associated task not found for this submission' });
      return;
    }

    const { status, feedback } = await evaluateSubmissionWithAi(submission, task);

    submission.status = status;
    submission.feedback = feedback;
    submission.reviewedAt = new Date();
    await submission.save();

    res.status(200).json({
      message: `Submission ${status} automatically reviewed and saved`,
      submission,
      status,
      feedback
    });
  } catch (error: any) {
    console.error('Submission auto-review error:', error);
    res.status(500).json({ message: 'Auto-review failed', error: error.message });
  }
};
