import { Router } from 'express';
import { login, registerTrainer, getCurrentUser, updateProfile, updateUserProgress } from '../controllers/authController.js';
import { getColleges, createCollege } from '../controllers/collegeController.js';
import { getTasks, createTask, deleteTask } from '../controllers/taskController.js';
import { getSubmissions, submitTask, reviewSubmission, autoReviewSubmission } from '../controllers/submissionController.js';
import { bulkImportStudents, registerStudent, getStudentsList, deleteStudent } from '../controllers/adminController.js';
import { handleChat } from '../controllers/chatController.js';
import { createQuiz, toggleQuizActive, getTrainerQuizzes, getQuizResultsForTrainer, getActiveQuizzes, submitQuiz, getStudentQuizResults } from '../controllers/quizController.js';
import { getAssessments, submitAssessment, getLeaderboard, getStudentAnalytics } from '../controllers/assessmentController.js';
import { getMernResources, getNoteContent, downloadFile, verifyMernAnswer, getMernQuestions } from '../controllers/mernController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { upload, uploadRoster } from '../middleware/upload.js';

const router = Router();

// Authentication
router.post('/auth/login', login);
router.post('/auth/register-trainer', registerTrainer);
router.get('/auth/me', authenticateToken, getCurrentUser);
router.put('/auth/profile', authenticateToken, upload.single('profileImage'), updateProfile);
router.put('/auth/progress', authenticateToken, requireRole('student'), updateUserProgress);
router.post('/chat', authenticateToken, requireRole('student'), handleChat);

// Colleges
router.get('/colleges', authenticateToken, getColleges);
router.post('/colleges', authenticateToken, requireRole('trainer'), createCollege);

// Tasks
router.get('/tasks', authenticateToken, getTasks);
router.post('/tasks', authenticateToken, requireRole('trainer'), createTask);
router.delete('/tasks/:taskId', authenticateToken, requireRole('trainer'), deleteTask);

// Submissions
router.get('/submissions', authenticateToken, getSubmissions);
router.post('/submissions', authenticateToken, requireRole('student'), upload.single('screenshot'), submitTask);
router.put('/submissions/:submissionId/review', authenticateToken, requireRole('trainer'), reviewSubmission);
router.post('/submissions/:submissionId/auto-review', authenticateToken, requireRole('trainer'), autoReviewSubmission);

// Admin / Bulk importing & Manual Student Onboarding & Metrics Directory
router.post('/admin/import-students', authenticateToken, requireRole('trainer'), uploadRoster.single('file'), bulkImportStudents);
router.post('/admin/register-student', authenticateToken, requireRole('trainer'), registerStudent);
router.get('/admin/students', authenticateToken, requireRole('trainer'), getStudentsList);
router.delete('/admin/students/:studentId', authenticateToken, requireRole('trainer'), deleteStudent);

// Quizzes
router.post('/quizzes', authenticateToken, requireRole('trainer'), uploadRoster.single('file'), createQuiz);
router.get('/quizzes', authenticateToken, requireRole('trainer'), getTrainerQuizzes);
router.put('/quizzes/:quizId/toggle-active', authenticateToken, requireRole('trainer'), toggleQuizActive);
router.get('/quizzes/:quizId/results', authenticateToken, requireRole('trainer'), getQuizResultsForTrainer);
router.get('/quizzes/active', authenticateToken, requireRole('student'), getActiveQuizzes);
router.get('/quizzes/my-results', authenticateToken, requireRole('student'), getStudentQuizResults);
router.post('/quizzes/:quizId/submit', authenticateToken, requireRole('student'), submitQuiz);

// Coding Assessments & Performance Leaderboards
router.get('/assessments', authenticateToken, requireRole('student'), getAssessments);
router.post('/assessments/:id/submit', authenticateToken, requireRole('student'), submitAssessment);
router.get('/assessments/leaderboard', authenticateToken, getLeaderboard);
router.get('/admin/student-analytics/:id', authenticateToken, requireRole('trainer'), getStudentAnalytics);

// MERN Prep & Project Hub Resources
router.get('/mern/resources', authenticateToken, requireRole('student'), getMernResources);
router.get('/mern/questions', authenticateToken, requireRole('student'), getMernQuestions);
router.get('/mern/notes/content', authenticateToken, requireRole('student'), getNoteContent);
router.get('/mern/download', authenticateToken, requireRole('student'), downloadFile);
router.post('/mern/verify-answer', authenticateToken, requireRole('student'), verifyMernAnswer);

export default router;
