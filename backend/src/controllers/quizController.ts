import { Response } from 'express';
import * as XLSX from 'xlsx';
import { Quiz, IQuizQuestion } from '../models/Quiz.js';
import { QuizResult } from '../models/QuizResult.js';
import { College } from '../models/College.js';
import { AuthRequest } from '../middleware/auth.js';

// Helper to normalize spreadsheet keys
const cleanQuestionRow = (row: any) => {
  const cleaned: any = {};
  for (const key of Object.keys(row)) {
    const normKey = key.trim().toLowerCase().replace(/[\s_-]+/g, '');
    cleaned[normKey] = row[key];
  }
  return cleaned;
};

// Create a new Quiz (Supports manual form array or Excel/CSV file upload)
export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, collegeId, durationMinutes } = req.body;
    const file = req.file;

    if (!title || !collegeId) {
      res.status(400).json({ message: 'Title and College ID are required.' });
      return;
    }

    const college = await College.findById(collegeId);
    if (!college) {
      res.status(404).json({ message: 'Selected College does not exist.' });
      return;
    }

    let questions: IQuizQuestion[] = [];

    // Parse Excel/CSV if file uploaded
    if (file) {
      try {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet);

        for (let i = 0; i < sheetData.length; i++) {
          const cleaned = cleanQuestionRow(sheetData[i]);
          
          const questionText = (cleaned.questiontext || cleaned.question || '').toString().trim();
          const opt1 = (cleaned.option1 || '').toString().trim();
          const opt2 = (cleaned.option2 || '').toString().trim();
          const opt3 = (cleaned.option3 || '').toString().trim();
          const opt4 = (cleaned.option4 || '').toString().trim();
          
          const correctVal = cleaned.correctoption || cleaned.correctoptionindex || cleaned.correct || '1';
          const correctOption = parseInt(correctVal.toString()) || 1;
          const ptsVal = cleaned.points || '1';
          const points = parseInt(ptsVal.toString()) || 1;

          const options = [opt1, opt2, opt3, opt4].filter(Boolean);
          
          if (!questionText || options.length < 2) {
            continue; // Skip incomplete questions
          }

          // Map 1-based options index to 0-based array index
          let correctOptionIndex = correctOption - 1;
          if (correctOptionIndex < 0 || correctOptionIndex >= options.length) {
            correctOptionIndex = 0;
          }

          questions.push({
            questionText,
            options,
            correctOptionIndex,
            points
          });
        }
      } catch (err: any) {
        res.status(400).json({ message: 'Failed to parse spreadsheet file', error: err.message });
        return;
      }
    } else if (req.body.questions) {
      // Parse manual questions array
      try {
        const parsed = typeof req.body.questions === 'string' ? JSON.parse(req.body.questions) : req.body.questions;
        questions = parsed.map((q: any) => {
          const opts = q.options.map((o: any) => o.toString().trim()).filter(Boolean);
          let correctIndex = parseInt(q.correctOptionIndex) || 0;
          if (correctIndex < 0 || correctIndex >= opts.length) {
            correctIndex = 0;
          }
          return {
            questionText: q.questionText.toString().trim(),
            options: opts,
            correctOptionIndex: correctIndex,
            points: parseInt(q.points) || 1
          };
        });
      } catch (err: any) {
        res.status(400).json({ message: 'Invalid manual questions structure', error: err.message });
        return;
      }
    }

    if (questions.length === 0) {
      res.status(400).json({ message: 'Quiz must contain at least one valid question.' });
      return;
    }

    const newQuiz = new Quiz({
      title: title.trim(),
      description: (description || '').trim(),
      questions,
      college: collegeId,
      durationMinutes: parseInt(durationMinutes) || 15,
      isActive: false
    });

    await newQuiz.save();
    res.status(201).json({ message: 'Quiz created successfully', quiz: newQuiz });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create quiz', error: error.message });
  }
};

// Toggle Quiz Deployment Active State (Trainer)
export const toggleQuizActive = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found.' });
      return;
    }

    quiz.isActive = !quiz.isActive;
    await quiz.save();
    res.status(200).json({ message: `Quiz is now ${quiz.isActive ? 'Active' : 'Inactive'}`, quiz });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to toggle quiz state', error: error.message });
  }
};

// Get All Quizzes for Trainer
export const getTrainerQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quizzes = await Quiz.find({}).populate('college');
    res.status(200).json(quizzes);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve quizzes', error: error.message });
  }
};

// Get Quiz Results for Trainer
export const getQuizResultsForTrainer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const results = await QuizResult.find({ quiz: quizId })
      .populate('student', 'name email')
      .sort({ score: -1 });

    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve quiz submissions', error: error.message });
  }
};

// Get Active Quizzes for Student (Sanitized correct answers)
export const getActiveQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.college) {
      res.status(401).json({ message: 'Unauthorized or missing college profile info' });
      return;
    }

    const quizzes = await Quiz.find({ college: req.user.college, isActive: true });
    
    // Check which quizzes the student has already taken
    const results = await QuizResult.find({ student: req.user.id });
    const completedQuizIds = results.map(r => r.quiz.toString());

    // Filter and sanitize (remove correct answer indices)
    const sanitizedQuizzes = quizzes.map(quiz => {
      const qObj = quiz.toObject();
      qObj.isCompleted = completedQuizIds.includes(quiz._id.toString());
      
      // Strip correct answers
      qObj.questions = qObj.questions.map((q: any) => {
        const { correctOptionIndex, ...safePart } = q;
        return safePart;
      });
      return qObj;
    });

    res.status(200).json(sanitizedQuizzes);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to load active quizzes', error: error.message });
  }
};

// Submit Quiz Attempt (Student)
export const submitQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const { answers, tabSwitchCount, timeTakenSeconds } = req.body;

    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({ message: 'Answers array is required.' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Lock double submissions
    const existing = await QuizResult.findOne({ student: req.user.id, quiz: quizId });
    if (existing) {
      res.status(400).json({ message: 'You have already submitted this quiz once.' });
      return;
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found.' });
      return;
    }

    // Evaluate answers server-side
    let score = 0;
    let totalPoints = 0;

    quiz.questions.forEach((q: any, idx: number) => {
      const studentAns = answers[idx];
      const isCorrect = studentAns === q.correctOptionIndex;
      if (isCorrect) {
        score += q.points;
      }
      totalPoints += q.points;
    });

    // Check anti-cheat violations (e.g. 3 tab switches)
    const switchLimit = 3;
    const isCheated = (tabSwitchCount || 0) >= switchLimit;

    const result = new QuizResult({
      student: req.user.id,
      quiz: quizId,
      answers,
      score,
      totalPoints,
      tabSwitchCount: tabSwitchCount || 0,
      isCheated,
      timeTakenSeconds: timeTakenSeconds || 0
    });

    await result.save();

    res.status(201).json({
      message: 'Quiz submitted successfully',
      score,
      totalPoints,
      isCheated
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Quiz submission failed', error: error.message });
  }
};

// Get Quiz Results for current Student
export const getStudentQuizResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const results = await QuizResult.find({ student: req.user.id })
      .populate({
        path: 'quiz',
        select: 'title description questions durationMinutes'
      })
      .sort({ submittedAt: -1 });

    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve your quiz results', error: error.message });
  }
};
