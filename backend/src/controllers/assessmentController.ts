import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Assessment } from '../models/Assessment.js';
import { AssessmentSubmission } from '../models/AssessmentSubmission.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

// Student: Get all assessments with completion status
export const getAssessments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      res.status(401).json({ message: 'Unauthorized access' });
      return;
    }

    const assessments = await Assessment.find().sort({ points: 1 });
    const submissions = await AssessmentSubmission.find({ student: studentId });

    // Map submission status
    const submissionMap = new Map();
    submissions.forEach(sub => {
      submissionMap.set(sub.assessment.toString(), {
        passedAll: sub.passedAll,
        scoreGained: sub.scoreGained,
        completedAt: sub.completedAt
      });
    });

    const result = assessments.map(a => {
      const subInfo = submissionMap.get(a._id.toString());
      return {
        ...a.toObject(),
        solvedStatus: subInfo ? (subInfo.passedAll ? 'solved' : 'attempted') : 'not_started',
        scoreGained: subInfo ? subInfo.scoreGained : 0
      };
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch assessments', error: error.message });
  }
};

// Student: Submit assessment solution
export const submitAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { id: assessmentId } = req.params;
    const { codeHtml, codeCss, codeJs, scoreGained, passedAll } = req.body;

    if (!studentId) {
      res.status(401).json({ message: 'Unauthorized access' });
      return;
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      res.status(404).json({ message: 'Assessment not found' });
      return;
    }

    // Check if there's already a submission
    let submission = await AssessmentSubmission.findOne({
      assessment: assessmentId,
      student: studentId
    });

    if (submission) {
      // Update only if they improved or passed
      if (!submission.passedAll || passedAll) {
        submission.codeHtml = codeHtml || submission.codeHtml;
        submission.codeCss = codeCss || submission.codeCss;
        submission.codeJs = codeJs || submission.codeJs;
        submission.scoreGained = Math.max(submission.scoreGained, scoreGained || 0);
        submission.passedAll = passedAll || submission.passedAll;
        submission.completedAt = new Date();
        await submission.save();
      }
    } else {
      submission = new AssessmentSubmission({
        assessment: assessmentId,
        student: studentId,
        codeHtml: codeHtml || '',
        codeCss: codeCss || '',
        codeJs: codeJs || '',
        scoreGained: scoreGained || 0,
        passedAll: !!passedAll
      });
      await submission.save();
    }

    res.status(200).json({ message: 'Assessment solution submitted successfully', submission });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to submit assessment', error: error.message });
  }
};

// Global Leaderboard: Aggregate student scores
export const getLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const leaderboard = await AssessmentSubmission.aggregate([
      { $match: { passedAll: true } },
      { $group: {
          _id: '$student',
          totalPoints: { $sum: '$scoreGained' },
          solvedCount: { $sum: 1 }
      }},
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo'
      }},
      { $unwind: '$studentInfo' },
      { $lookup: {
          from: 'colleges',
          localField: 'studentInfo.college',
          foreignField: '_id',
          as: 'collegeInfo'
      }},
      { $unwind: { path: '$collegeInfo', preserveNullAndEmptyArrays: true } },
      { $project: {
          _id: 1,
          totalPoints: 1,
          solvedCount: 1,
          name: '$studentInfo.name',
          email: '$studentInfo.email',
          collegeCode: '$collegeInfo.code',
          collegeName: '$collegeInfo.name'
      }},
      { $sort: { totalPoints: -1, solvedCount: -1 } }
    ]);

    res.status(200).json(leaderboard);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: error.message });
  }
};

// Trainer/Admin: Get detail analytics for a specific student
export const getStudentAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: studentId } = req.params;

    const student = await User.findById(studentId).populate('college');
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    const submissions = await AssessmentSubmission.find({ student: studentId }).populate('assessment');
    
    const solvedCount = submissions.filter(s => s.passedAll).length;
    const totalPoints = submissions.filter(s => s.passedAll).reduce((sum, s) => sum + s.scoreGained, 0);

    // Get rank position
    const allRankings = await AssessmentSubmission.aggregate([
      { $match: { passedAll: true } },
      { $group: {
          _id: '$student',
          totalPoints: { $sum: '$scoreGained' }
      }},
      { $sort: { totalPoints: -1 } }
    ]);

    const rankIndex = allRankings.findIndex(r => r._id.toString() === studentId.toString());
    const rank = rankIndex !== -1 ? rankIndex + 1 : allRankings.length + 1;

    res.status(200).json({
      student: {
        name: student.name,
        email: student.email,
        college: student.college
      },
      solvedCount,
      totalPoints,
      rank,
      submissions: submissions.map(s => ({
        _id: s._id,
        assessmentTitle: (s.assessment as any)?.title || 'Deleted Challenge',
        assessmentType: (s.assessment as any)?.type || 'unknown',
        points: (s.assessment as any)?.points || 0,
        scoreGained: s.scoreGained,
        passedAll: s.passedAll,
        completedAt: s.completedAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch student analytics', error: error.message });
  }
};
