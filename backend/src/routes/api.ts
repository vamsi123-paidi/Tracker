import { Router } from 'express';
import { login, registerTrainer, getCurrentUser, updateProfile } from '../controllers/authController.js';
import { getColleges, createCollege } from '../controllers/collegeController.js';
import { getTasks, createTask } from '../controllers/taskController.js';
import { getSubmissions, submitTask, reviewSubmission } from '../controllers/submissionController.js';
import { bulkImportStudents, registerStudent, getStudentsList, deleteStudent } from '../controllers/adminController.js';
import { handleChat } from '../controllers/chatController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { upload, uploadRoster } from '../middleware/upload.js';

const router = Router();

// Authentication
router.post('/auth/login', login);
router.post('/auth/register-trainer', registerTrainer);
router.get('/auth/me', authenticateToken, getCurrentUser);
router.put('/auth/profile', authenticateToken, upload.single('profileImage'), updateProfile);
router.post('/chat', authenticateToken, requireRole('student'), handleChat);

// Colleges
router.get('/colleges', authenticateToken, getColleges);
router.post('/colleges', authenticateToken, requireRole('trainer'), createCollege);

// Tasks
router.get('/tasks', authenticateToken, getTasks);
router.post('/tasks', authenticateToken, requireRole('trainer'), createTask);

// Submissions
router.get('/submissions', authenticateToken, getSubmissions);
router.post('/submissions', authenticateToken, requireRole('student'), upload.single('screenshot'), submitTask);
router.put('/submissions/:submissionId/review', authenticateToken, requireRole('trainer'), reviewSubmission);

// Admin / Bulk importing & Manual Student Onboarding & Metrics Directory
router.post('/admin/import-students', authenticateToken, requireRole('trainer'), uploadRoster.single('file'), bulkImportStudents);
router.post('/admin/register-student', authenticateToken, requireRole('trainer'), registerStudent);
router.get('/admin/students', authenticateToken, requireRole('trainer'), getStudentsList);
router.delete('/admin/students/:studentId', authenticateToken, requireRole('trainer'), deleteStudent);

// Temporary diagnostics route to see which models Google allows for this API key
router.get('/test-gemini-models', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(400).json({ error: 'GEMINI_API_KEY is not set on the server environment.' });
      return;
    }
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
