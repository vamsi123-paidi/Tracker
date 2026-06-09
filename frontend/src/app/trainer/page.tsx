'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api, removeAuthToken, getAuthToken } from '@/utils/api';
import { ThemeToggle } from '@/components/ThemeToggle';

interface College {
  _id: string;
  name: string;
  code: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  college: College;
  stats: {
    totalSubmissions: number;
    approved: number;
    rejected: number;
    pending: number;
  };
}

interface Student {
  _id: string;
  name: string;
  email: string;
  college: College;
}

interface StudentWithStats {
  _id: string;
  name: string;
  email: string;
  college?: College;
  stats: {
    totalTasksCount: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
  };
}

interface Submission {
  _id: string;
  task: {
    _id: string;
    title: string;
    description: string;
  };
  student: {
    _id: string;
    name: string;
    email: string;
    college: College;
  };
  screenshotUrl: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  createdAt: string;
}

export default function TrainerDashboard() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // User info
  const [trainerName, setTrainerName] = useState('');

  // Data lists
  const [colleges, setColleges] = useState<College[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<StudentWithStats[]>([]);

  // CSV/JSON/Excel Import States
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    message?: string;
    createdCount?: number;
    skippedCount?: number;
    errors?: string[];
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Manual Student Form States
  const [manualStudentName, setManualStudentName] = useState('');
  const [manualStudentEmail, setManualStudentEmail] = useState('');
  const [manualStudentPassword, setManualStudentPassword] = useState('');
  const [manualStudentCollegeId, setManualStudentCollegeId] = useState('');
  const [isRegisteringStudent, setIsRegisteringStudent] = useState(false);

  // New College State
  const [colName, setColName] = useState('');
  const [colCode, setColCode] = useState('');

  // New Task States
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState('');

  // Review Modal States
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  // Student Detail Performance Modal State
  const [selectedStudent, setSelectedStudent] = useState<StudentWithStats | null>(null);

  // Filtering states for verification queue
  const [filterCollegeId, setFilterCollegeId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering states for Student Directory
  const [filterStudentCollegeId, setFilterStudentCollegeId] = useState('');
  const [searchStudentQuery, setSearchStudentQuery] = useState('');

  // Filtering states for Deployed Tasks listing
  const [filterTaskCollegeId, setFilterTaskCollegeId] = useState('');

  // 3D Canvas Chart mode toggle: 'tasks' or 'colleges'
  const [chartViewMode, setChartViewMode] = useState<'tasks' | 'colleges'>('tasks');

  // Global Actions
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'submissions' | 'students' | 'tasks' | 'onboarding' | 'quizzes'>('submissions');

  // Quiz Hub States
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuizResults, setSelectedQuizResults] = useState<any[]>([]);
  const [viewingQuizId, setViewingQuizId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizDuration, setQuizDuration] = useState(15);
  const [quizCollegeId, setQuizCollegeId] = useState('');
  const [quizExcelFile, setQuizExcelFile] = useState<File | null>(null);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  // Manual Quiz Question Entry States
  const [quizQuestionsManual, setQuizQuestionsManual] = useState<any[]>([]);
  const [manualQText, setManualQText] = useState('');
  const [manualQOpt1, setManualQOpt1] = useState('');
  const [manualQOpt2, setManualQOpt2] = useState('');
  const [manualQOpt3, setManualQOpt3] = useState('');
  const [manualQOpt4, setManualQOpt4] = useState('');
  const [manualQCorrectIndex, setManualQCorrectIndex] = useState(0);
  const [manualQPoints, setManualQPoints] = useState(1);

  useEffect(() => {
    // Auth Check
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch Initial Data
    api.get('/auth/me')
      .then((user) => {
        if (user.role !== 'trainer') {
          router.push('/student');
        } else {
          setTrainerName(user.name);
          fetchDashboardData();
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const colData = await api.get('/colleges');
      setColleges(colData);

      const taskData = await api.get('/tasks');
      setTasks(taskData);

      const subData = await api.get('/submissions');
      setSubmissions(subData);

      const studData = await api.get('/admin/students');
      setStudents(studData);

      const quizData = await api.get('/quizzes');
      setQuizzes(quizData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load dashboard data');
    }
  };

  // Draw 3D analytical Canvas bar charts (cylinder style)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle empty data state
    if (chartViewMode === 'tasks' && tasks.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    
    // Canvas size setup
    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = 300;

    const margin = { top: 40, right: 30, bottom: 50, left: 50 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = margin.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(canvas.width - margin.right, y);
      ctx.stroke();
    }

    if (chartViewMode === 'tasks') {
      // 1. Chart View Mode: Tasks View
      const barWidth = Math.min(60, chartWidth / (tasks.length * 1.8));
      const gap = (chartWidth - barWidth * tasks.length) / (tasks.length + 1);
      const maxSubmissions = Math.max(...tasks.map(t => t.stats.totalSubmissions), 5);

      tasks.forEach((task, idx) => {
        const x = margin.left + gap + idx * (barWidth + gap);
        const total = task.stats.totalSubmissions;
        const approved = task.stats.approved;

        const scale = total / maxSubmissions;
        const totalBarHeight = chartHeight * scale;
        const y = margin.top + chartHeight - totalBarHeight;

        // Shadow effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x + 4, y, barWidth, totalBarHeight);

        // Body cylinder gradients
        const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
        gradient.addColorStop(0, '#00f2fe');
        gradient.addColorStop(0.5, '#4facfe');
        gradient.addColorStop(1, '#0052ff');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, totalBarHeight);

        // Cylinder top ellipse
        ctx.fillStyle = '#00f2fe';
        ctx.beginPath();
        ctx.ellipse(x + barWidth / 2, y, barWidth / 2, 5, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Cylinder bottom ellipse
        ctx.fillStyle = '#0052ff';
        ctx.beginPath();
        ctx.ellipse(x + barWidth / 2, y + totalBarHeight, barWidth / 2, 5, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Approved submissions overlay (green)
        if (approved > 0 && total > 0) {
          const approvedHeight = totalBarHeight * (approved / total);
          const appY = y + totalBarHeight - approvedHeight;

          const appGradient = ctx.createLinearGradient(x, appY, x + barWidth, appY);
          appGradient.addColorStop(0, '#00ff87');
          appGradient.addColorStop(1, '#60efff');

          ctx.fillStyle = appGradient;
          ctx.fillRect(x, appY, barWidth, approvedHeight);

          ctx.fillStyle = '#00ff87';
          ctx.beginPath();
          ctx.ellipse(x + barWidth / 2, appY, barWidth / 2, 3, 0, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Labels
        ctx.fillStyle = '#a0aec0';
        ctx.font = '10px Space Grotesk';
        ctx.textAlign = 'center';
        const truncatedTitle = task.title.length > 8 ? task.title.substring(0, 8) + '..' : task.title;
        ctx.fillText(truncatedTitle, x + barWidth / 2, margin.top + chartHeight + 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px Outfit';
        ctx.fillText(String(total), x + barWidth / 2, y - 10);
      });

      // Axis labels
      ctx.fillStyle = '#a0aec0';
      ctx.font = '10px Space Grotesk';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 4; i++) {
        const val = Math.round(maxSubmissions - (maxSubmissions / 4) * i);
        const y = margin.top + (chartHeight / 4) * i;
        ctx.fillText(String(val), margin.left - 10, y + 4);
      }
    } else {
      // 2. Chart View Mode: Colleges View
      // Group submission states by College
      const collegeMetrics = colleges.map((col) => {
        const colSubs = submissions.filter(s => s.student.college?.code === col.code);
        const approved = colSubs.filter(s => s.status === 'approved').length;
        return {
          code: col.code,
          total: colSubs.length,
          approved
        };
      });

      if (collegeMetrics.length === 0) return;

      const barWidth = Math.min(60, chartWidth / (collegeMetrics.length * 1.8));
      const gap = (chartWidth - barWidth * collegeMetrics.length) / (collegeMetrics.length + 1);
      const maxColSub = Math.max(...collegeMetrics.map(c => c.total), 5);

      collegeMetrics.forEach((metric, idx) => {
        const x = margin.left + gap + idx * (barWidth + gap);
        const total = metric.total;
        const approved = metric.approved;

        const scale = total / maxColSub;
        const totalBarHeight = chartHeight * scale;
        const y = margin.top + chartHeight - totalBarHeight;

        // Shadow effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x + 4, y, barWidth, totalBarHeight);

        // Body cylinder gradients
        const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
        gradient.addColorStop(0, '#bd00ff');
        gradient.addColorStop(0.5, '#4facfe');
        gradient.addColorStop(1, '#0052ff');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, totalBarHeight);

        // Cylinder top ellipse
        ctx.fillStyle = '#bd00ff';
        ctx.beginPath();
        ctx.ellipse(x + barWidth / 2, y, barWidth / 2, 5, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Cylinder bottom ellipse
        ctx.fillStyle = '#0052ff';
        ctx.beginPath();
        ctx.ellipse(x + barWidth / 2, y + totalBarHeight, barWidth / 2, 5, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Approved submissions overlay
        if (approved > 0 && total > 0) {
          const approvedHeight = totalBarHeight * (approved / total);
          const appY = y + totalBarHeight - approvedHeight;

          const appGradient = ctx.createLinearGradient(x, appY, x + barWidth, appY);
          appGradient.addColorStop(0, '#00ff87');
          appGradient.addColorStop(1, '#bd00ff');

          ctx.fillStyle = appGradient;
          ctx.fillRect(x, appY, barWidth, approvedHeight);

          ctx.fillStyle = '#00ff87';
          ctx.beginPath();
          ctx.ellipse(x + barWidth / 2, appY, barWidth / 2, 3, 0, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Labels
        ctx.fillStyle = '#a0aec0';
        ctx.font = '10px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText(metric.code, x + barWidth / 2, margin.top + chartHeight + 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px Outfit';
        ctx.fillText(String(total), x + barWidth / 2, y - 10);
      });

      // Axis labels
      ctx.fillStyle = '#a0aec0';
      ctx.font = '10px Space Grotesk';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 4; i++) {
        const val = Math.round(maxColSub - (maxColSub / 4) * i);
        const y = margin.top + (chartHeight / 4) * i;
        ctx.fillText(String(val), margin.left - 10, y + 4);
      }
    }
  }, [tasks, colleges, submissions, chartViewMode]);

  const handleLogout = () => {
    removeAuthToken();
    router.push('/login');
  };

  const handleDownloadQuizTemplate = () => {
    const headers = [
      'Question Text',
      'Option 1',
      'Option 2',
      'Option 3',
      'Option 4',
      'Correct Option Index',
      'Points'
    ];
    const row = [
      'Example Question: What is the Big O of Binary Search?',
      'O(1)',
      'O(n)',
      'O(log n)',
      'O(n log n)',
      '3',
      '1'
    ];
    const csvContent = 
      'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), row.map(val => `"${val.replace(/"/g, '""')}"`).join(',')].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'holotrack_quiz_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQText.trim() || !manualQOpt1.trim() || !manualQOpt2.trim()) {
      setErrorMsg('Question text and at least 2 options are required.');
      return;
    }
    const newQ = {
      questionText: manualQText.trim(),
      options: [manualQOpt1.trim(), manualQOpt2.trim(), manualQOpt3.trim(), manualQOpt4.trim()].filter(Boolean),
      correctOptionIndex: manualQCorrectIndex,
      points: Number(manualQPoints) || 1
    };
    setQuizQuestionsManual([...quizQuestionsManual, newQ]);
    setManualQText('');
    setManualQOpt1('');
    setManualQOpt2('');
    setManualQOpt3('');
    setManualQOpt4('');
    setManualQCorrectIndex(0);
    setManualQPoints(1);
    setSuccessMsg('Manual question added to draft list!');
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle || !quizCollegeId) {
      setErrorMsg('Quiz Title and Target College are required.');
      return;
    }
    setIsCreatingQuiz(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let res;
      if (quizExcelFile) {
        const formData = new FormData();
        formData.append('title', quizTitle);
        formData.append('description', quizDesc);
        formData.append('collegeId', quizCollegeId);
        formData.append('durationMinutes', String(quizDuration));
        formData.append('file', quizExcelFile);

        res = await api.postFile('/quizzes', formData);
      } else {
        if (quizQuestionsManual.length === 0) {
          throw new Error('Please upload an Excel/CSV file or compile manual questions.');
        }
        res = await api.post('/quizzes', {
          title: quizTitle,
          description: quizDesc,
          collegeId: quizCollegeId,
          durationMinutes: quizDuration,
          questions: quizQuestionsManual
        });
      }

      setSuccessMsg(`Quiz "${res.quiz.title}" deployed successfully!`);
      setQuizTitle('');
      setQuizDesc('');
      setQuizDuration(15);
      setQuizCollegeId('');
      setQuizExcelFile(null);
      setQuizQuestionsManual([]);
      
      fetchDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to deploy quiz.');
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  const handleToggleQuizActive = async (quizId: string) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      const res = await api.put(`/quizzes/${quizId}/toggle-active`, {});
      setSuccessMsg(res.message);
      fetchDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to toggle quiz active state.');
    }
  };

  const handleViewQuizResults = async (quizId: string) => {
    try {
      setErrorMsg('');
      const data = await api.get(`/quizzes/${quizId}/results`);
      setSelectedQuizResults(data);
      setViewingQuizId(quizId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load quiz attempt logs.');
    }
  };

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName || !colCode) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await api.post('/colleges', { name: colName, code: colCode });
      setColleges([...colleges, data.college]);
      setSuccessMsg(`College "${data.college.name}" created successfully!`);
      setColName('');
      setColCode('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create college');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDesc || !taskDueDate || !selectedCollegeId) {
      setErrorMsg('All task fields are required');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await api.post('/tasks', {
        title: taskTitle,
        description: taskDesc,
        dueDate: taskDueDate,
        collegeId: selectedCollegeId
      });
      setTasks([...tasks, { ...data.task, stats: { totalSubmissions: 0, approved: 0, rejected: 0, pending: 0 } }]);
      setSuccessMsg(`Task "${data.task.title}" created successfully!`);
      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create task');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    setIsImporting(true);
    setErrorMsg('');
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const data = await api.postFile('/admin/import-students', formData);
      setImportResult(data);
      fetchDashboardData(); // Refresh list
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to import roster file');
    } finally {
      setIsImporting(false);
    }
  };

  const handleManualStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudentName || !manualStudentEmail || !manualStudentPassword || !manualStudentCollegeId) {
      setErrorMsg('All fields are required for student creation');
      return;
    }
    setIsRegisteringStudent(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await api.post('/admin/register-student', {
        name: manualStudentName,
        email: manualStudentEmail,
        password: manualStudentPassword,
        collegeId: manualStudentCollegeId
      });
      setSuccessMsg(`Student "${data.student.name}" registered successfully!`);
      setManualStudentName('');
      setManualStudentEmail('');
      setManualStudentPassword('');
      setManualStudentCollegeId('');
      fetchDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to manually register student');
    } finally {
      setIsRegisteringStudent(false);
    }
  };

  const handleReviewSubmission = async (status: 'approved' | 'rejected') => {
    if (!selectedSubmission) return;
    setIsReviewing(true);
    setErrorMsg('');

    try {
      await api.put(`/submissions/${selectedSubmission._id}/review`, {
        status,
        feedback: reviewFeedback
      });

      // Update state
      setSubmissions(
        submissions.map((sub) =>
          sub._id === selectedSubmission._id
            ? { ...sub, status, feedback: reviewFeedback }
            : sub
        )
      );

      // Re-trigger counts
      fetchDashboardData();

      setSelectedSubmission(null);
      setReviewFeedback('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to delete student "${studentName}" and all their task submissions? This action is permanent and cannot be undone.`)) {
      return;
    }

    try {
      setErrorMsg('');
      setSuccessMsg('');
      
      const res = await api.delete(`/admin/students/${studentId}`);
      setSuccessMsg(res.message || `Student "${studentName}" has been successfully deleted.`);
      
      // Update local state list
      setStudents(prev => prev.filter(s => s._id !== studentId));
      
      // Re-trigger dashboard counts and stats
      fetchDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete student account');
    }
  };

  // Compile CSV file download (Report exporter)
  const handleExportGradesReport = () => {
    if (students.length === 0) return;
    
    const headers = [
      'Student Name',
      'Student Email',
      'College Code',
      'College Name',
      'Total Assigned Tasks',
      'Approved Tasks',
      'Pending Tasks',
      'Rejected Tasks',
      'Completion Rate'
    ];

    const rows = students.map((s) => [
      s.name,
      s.email,
      s.college?.code || 'N/A',
      s.college?.name || 'N/A',
      s.stats.totalTasksCount,
      s.stats.approvedCount,
      s.stats.pendingCount,
      s.stats.rejectedCount,
      `${s.stats.totalTasksCount > 0 ? Math.round((s.stats.approvedCount / s.stats.totalTasksCount) * 100) : 0}%`
    ]);

    const csvContent = 
      'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `holotrack_grades_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter verification queue
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesCollege = !filterCollegeId || String(sub.student.college?._id) === String(filterCollegeId);
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      sub.student.name.toLowerCase().includes(searchLower) ||
      sub.student.email.toLowerCase().includes(searchLower) ||
      (sub.task?.title || '').toLowerCase().includes(searchLower);

    return matchesCollege && matchesSearch;
  });

  // Filter student directory
  const filteredStudents = students.filter((stud) => {
    const matchesCollege = !filterStudentCollegeId || String(stud.college?._id) === String(filterStudentCollegeId);
    const searchLower = searchStudentQuery.toLowerCase();
    const matchesSearch = !searchStudentQuery ||
      stud.name.toLowerCase().includes(searchLower) ||
      stud.email.toLowerCase().includes(searchLower);

    return matchesCollege && matchesSearch;
  });

  // Filter deployed tasks listing
  const filteredTasks = tasks.filter((task) => {
    return !filterTaskCollegeId || String(task.college?._id) === String(filterTaskCollegeId);
  });

  // Compute Metrics
  const totalSubCount = submissions.length;
  const pendingSubCount = submissions.filter(s => s.status === 'pending').length;
  const approvedSubCount = submissions.filter(s => s.status === 'approved').length;
  const approvalRate = totalSubCount > 0 ? Math.round((approvedSubCount / totalSubCount) * 100) : 0;

  return (
    <main style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto', zIndex: 1 }}>
      {/* Top Bar */}
      <header className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem 1.5rem'
      }}>
        <div>
          <span style={{ fontFamily: 'monospace', color: '#00f2fe', fontSize: '0.9rem' }}>HOST_CONTROL</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>HoloTrack Trainer</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Logged in as: <strong style={{ color: 'var(--text-primary)' }}>{trainerName}</strong>
          </span>
          <ThemeToggle />
          <button onClick={handleLogout} className="btn-glass" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Disconnect
          </button>
        </div>
      </header>

      {/* Messaging */}
      {errorMsg && (
        <div style={{
          background: 'rgba(255, 0, 85, 0.1)',
          border: '1px solid rgba(255, 0, 85, 0.2)',
          color: '#ff0055',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{
          background: 'rgba(0, 255, 135, 0.1)',
          border: '1px solid rgba(0, 255, 135, 0.2)',
          color: '#00ff87',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          {successMsg}
        </div>
      )}

      {/* Metrics Row */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel">
          <p style={{ color: '#a0aec0', fontSize: '0.85rem', fontFamily: 'monospace' }}>ACTIVE_TASKS</p>
          <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: '#00f2fe' }}>{tasks.length}</h3>
        </div>
        <div className="glass-panel">
          <p style={{ color: '#a0aec0', fontSize: '0.85rem', fontFamily: 'monospace' }}>PENDING_VERIFICATION</p>
          <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: '#ffd000' }}>{pendingSubCount}</h3>
        </div>
        <div className="glass-panel">
          <p style={{ color: '#a0aec0', fontSize: '0.85rem', fontFamily: 'monospace' }}>TOTAL_SUBMISSIONS</p>
          <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: '#bd00ff' }}>{totalSubCount}</h3>
        </div>
        <div className="glass-panel">
          <p style={{ color: '#a0aec0', fontSize: '0.85rem', fontFamily: 'monospace' }}>APPROVAL_RATE</p>
          <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: '#00ff87' }}>{approvalRate}%</h3>
        </div>
      </div>

      {/* Analytics Chart Panel */}
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'monospace', color: '#00f2fe', fontSize: '0.95rem' }}>
            3D_ANALYTICS_MATRIX ({chartViewMode === 'tasks' ? 'Tasks View' : 'Colleges View'})
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setChartViewMode('tasks')}
              className={chartViewMode === 'tasks' ? 'btn-neon' : 'btn-glass'}
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              Analyze by Task
            </button>
            <button
              onClick={() => setChartViewMode('colleges')}
              className={chartViewMode === 'colleges' ? 'btn-neon' : 'btn-glass'}
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              Analyze by College
            </button>
          </div>
        </div>
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem', fontSize: '0.85rem', color: '#a0aec0' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: chartViewMode === 'tasks' ? '#00f2fe' : '#bd00ff', borderRadius: '2px' }} />
            Total Submissions
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#00ff87', borderRadius: '2px' }} />
            Approved
          </span>
        </div>
      </div>

      {/* Control Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('submissions')}
          className={activeTab === 'submissions' ? 'btn-neon' : 'btn-glass'}
          style={{ padding: '10px 20px', fontSize: '0.9rem' }}
        >
          Verification Queue
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={activeTab === 'students' ? 'btn-neon' : 'btn-glass'}
          style={{ padding: '10px 20px', fontSize: '0.9rem' }}
        >
          Student Directory
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={activeTab === 'tasks' ? 'btn-neon' : 'btn-glass'}
          style={{ padding: '10px 20px', fontSize: '0.9rem' }}
        >
          Task Creator
        </button>
        <button
          onClick={() => setActiveTab('onboarding')}
          className={activeTab === 'onboarding' ? 'btn-neon' : 'btn-glass'}
          style={{ padding: '10px 20px', fontSize: '0.9rem' }}
        >
          Student Onboarding
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={activeTab === 'quizzes' ? 'btn-neon' : 'btn-glass'}
          style={{ padding: '10px 20px', fontSize: '0.9rem' }}
        >
          Quiz Hub
        </button>
      </div>

      {/* View Panels */}
      {activeTab === 'submissions' && (
        <div className="glass-panel">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.1rem' }}>Pending Student Submissions</h3>
            
            {/* Filters Row */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                className="glass-input"
                style={{ width: '180px', padding: '8px 12px', fontSize: '0.85rem' }}
                value={filterCollegeId}
                onChange={(e) => setFilterCollegeId(e.target.value)}
              >
                <option value="">-- All Colleges --</option>
                {colleges.map((col) => (
                  <option key={col._id} value={col._id}>
                    {col.code}
                  </option>
                ))}
              </select>

              <input
                type="text"
                className="glass-input"
                style={{ width: '220px', padding: '8px 12px', fontSize: '0.85rem' }}
                placeholder="Search by student or task..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#718096' }}>
              No submissions found matching your filter criteria.
            </div>
          ) : (
            <div className="table-container">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>College</th>
                    <th>Task</th>
                    <th>Submission Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub._id}>
                      <td>
                        <strong>{sub.student.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>{sub.student.email}</div>
                      </td>
                      <td>
                        <span className="badge badge-not-submitted">{sub.student.college?.code || 'GLBL'}</span>
                      </td>
                      <td>{sub.task?.title || 'Unknown Task'}</td>
                      <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${sub.status}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setReviewFeedback(sub.feedback || '');
                          }}
                          className="btn-neon"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe', border: '1px solid rgba(0, 242, 254, 0.2)' }}
                        >
                          Review proof
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="glass-panel">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Student Performance Directory</h3>
              <p style={{ color: '#a0aec0', fontSize: '0.85rem', marginTop: '2px' }}>
                Track student progress, check task details, and download grades reports.
              </p>
            </div>
            
            {/* Filters Row & Exporter */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={handleExportGradesReport}
                disabled={students.length === 0}
                className="btn-neon"
                style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'linear-gradient(135deg, #00ff87 0%, #0052ff 100%)', color: '#03030b' }}
              >
                📥 Export Grades Report (CSV)
              </button>
              
              <select
                className="glass-input"
                style={{ width: '180px', padding: '8px 12px', fontSize: '0.85rem' }}
                value={filterStudentCollegeId}
                onChange={(e) => setFilterStudentCollegeId(e.target.value)}
              >
                <option value="">-- All Colleges --</option>
                {colleges.map((col) => (
                  <option key={col._id} value={col._id}>
                    {col.code}
                  </option>
                ))}
              </select>

              <input
                type="text"
                className="glass-input"
                style={{ width: '220px', padding: '8px 12px', fontSize: '0.85rem' }}
                placeholder="Search student by name..."
                value={searchStudentQuery}
                onChange={(e) => setSearchStudentQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#718096' }}>
              No students found matching filters.
            </div>
          ) : (
            <div className="table-container">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email Address</th>
                    <th>College Portal</th>
                    <th>Task Progression Status</th>
                    <th>Metrics</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((stud) => {
                    const total = stud.stats.totalTasksCount;
                    const approved = stud.stats.approvedCount;
                    const rate = total > 0 ? Math.round((approved / total) * 100) : 0;
                    
                    return (
                      <tr key={stud._id}>
                        <td><strong>{stud.name}</strong></td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#a0aec0' }}>{stud.email}</td>
                        <td>
                          <span className="badge badge-not-submitted">{stud.college?.code || 'GLBL'}</span>
                        </td>
                        <td style={{ width: '25%' }}>
                          {/* Visual Progress Bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              flex: 1,
                              height: '8px',
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${rate}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #bd00ff 0%, #00f2fe 100%)',
                                borderRadius: '4px',
                                boxShadow: '0 0 8px rgba(0, 242, 254, 0.4)'
                              }} />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, width: '35px' }}>{rate}%</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: '#a0aec0' }}>
                            ✅ {approved} / ⏳ {stud.stats.pendingCount} / ❌ {stud.stats.rejectedCount} (Total: {total})
                          </span>
                        </td>
                        <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => setSelectedStudent(stud)}
                            className="btn-neon"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Analyze
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(stud._id, stud.name)}
                            className="btn-glass"
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '0.8rem',
                              background: 'rgba(255, 0, 85, 0.05)',
                              border: '1px solid rgba(255, 0, 85, 0.2)',
                              color: 'var(--neon-red)',
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {/* Create Task Form */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Add New Milestone Task</h3>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0aec0', marginBottom: '0.5rem' }}>Task Title</label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  placeholder="Build 3D Landing Page"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0aec0', marginBottom: '0.5rem' }}>Description</label>
                <textarea
                  required
                  className="glass-input"
                  rows={4}
                  placeholder="Describe the deliverables, criteria, and requirements..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0aec0', marginBottom: '0.5rem' }}>Target College Code</label>
                <select
                  required
                  className="glass-input"
                  value={selectedCollegeId}
                  onChange={(e) => setSelectedCollegeId(e.target.value)}
                >
                  <option value="">-- Select Target College --</option>
                  {colleges.map((col) => (
                    <option key={col._id} value={col._id}>
                      {col.name} ({col.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0aec0', marginBottom: '0.5rem' }}>Due Date</label>
                <input
                  type="date"
                  required
                  className="glass-input"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-neon">
                Deploy Task
              </button>
            </form>
          </div>

          {/* List Deployed Tasks with College filtering */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Active Deployed Tasks</h3>
                <select
                  className="glass-input"
                  style={{ width: '150px', padding: '6px 10px', fontSize: '0.8rem' }}
                  value={filterTaskCollegeId}
                  onChange={(e) => setFilterTaskCollegeId(e.target.value)}
                >
                  <option value="">-- All Colleges --</option>
                  {colleges.map((col) => (
                    <option key={col._id} value={col._id}>
                      {col.code}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto' }}>
                {filteredTasks.length === 0 ? (
                  <span style={{ color: '#718096', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                    No active tasks deployed.
                  </span>
                ) : (
                  filteredTasks.map((t) => (
                    <div key={t._id} style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong>{t.title}</strong>
                        <span className="badge badge-not-submitted" style={{ fontSize: '0.7rem' }}>{t.college?.code}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#a0aec0', lineHeight: '1.4' }}>{t.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#718096', marginTop: '6px' }}>
                        <span>Due: {new Date(t.dueDate).toLocaleDateString()}</span>
                        <span style={{ color: '#00f2fe' }}>Submissions: {t.stats.totalSubmissions} ({t.stats.approved} approved)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* List Colleges & Manual Creator */}
            <div className="glass-panel">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Create College Portal</h3>
              <form onSubmit={handleCreateCollege} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0aec0', marginBottom: '0.5rem' }}>College Name</label>
                  <input
                    type="text"
                    required
                    className="glass-input"
                    placeholder="Massachusetts Institute of Tech"
                    value={colName}
                    onChange={(e) => setColName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0aec0', marginBottom: '0.5rem' }}>College Code (Unique)</label>
                  <input
                    type="text"
                    required
                    className="glass-input"
                    placeholder="MIT"
                    value={colCode}
                    onChange={(e) => setColCode(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-glass">
                  Create College
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'onboarding' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {/* Left Column: Bulk Onboarding */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Bulk Roster Import</h3>
              <p style={{ color: '#a0aec0', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Upload a comma-separated sheet, JSON file, or Excel spreadsheet (.xlsx/.xls) to batch register students.
                <br />
                The fields/headers should match:
                <br />
                <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '6px', fontFamily: 'monospace', color: '#00f2fe' }}>
                  name, email, password, collegeCode
                </code>
              </p>

              <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{
                  border: '2px dashed rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.01)'
                }}>
                  <input
                    type="file"
                    required
                    accept=".csv, .json, .xlsx, .xls"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <p style={{ color: '#00f2fe', fontWeight: 600, fontSize: '0.95rem' }}>
                    {importFile ? importFile.name : 'Select student CSV, JSON, or Excel file'}
                  </p>
                  <p style={{ color: '#718096', fontSize: '0.8rem', marginTop: '4px' }}>Accepts .csv, .json, .xlsx, .xls</p>
                </div>

                <button type="submit" disabled={isImporting || !importFile} className="btn-neon">
                  {isImporting ? 'Ingesting list...' : 'Upload Student Roster'}
                </button>
              </form>
            </div>

            {/* Results Output Console */}
            <div className="glass-panel">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Bulk Execution Logs</h3>
              {!importResult ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#718096', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  Console idle. Awaiting file execution...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: 'rgba(0, 255, 135, 0.1)',
                    border: '1px solid rgba(0, 255, 135, 0.2)',
                    color: '#00ff87',
                    fontSize: '0.9rem'
                  }}>
                    {importResult.message}
                  </div>

                  {importResult.errors && importResult.errors.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: '#ff0055', marginBottom: '0.5rem' }}>Warnings:</h4>
                      <div style={{
                        maxHeight: '150px',
                        overflowY: 'auto',
                        background: 'rgba(0, 0, 0, 0.2)',
                        padding: '10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        color: '#a0aec0',
                        border: '1px solid var(--border-glass)'
                      }}>
                        {importResult.errors.map((err, i) => (
                          <div key={i} style={{ marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>
                            {err}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Manual Student Onboarding */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Manual Student Registration</h3>
            <form onSubmit={handleManualStudentRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0aec0', marginBottom: '0.5rem' }}>Student Full Name</label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  placeholder="Luke Skywalker"
                  value={manualStudentName}
                  onChange={(e) => setManualStudentName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0aec0', marginBottom: '0.5rem' }}>Student Email Address</label>
                <input
                  type="email"
                  required
                  className="glass-input"
                  placeholder="luke@jediacademy.edu"
                  value={manualStudentEmail}
                  onChange={(e) => setManualStudentEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0aec0', marginBottom: '0.5rem' }}>Access Password</label>
                <input
                  type="password"
                  required
                  className="glass-input"
                  placeholder="Create password for student"
                  value={manualStudentPassword}
                  onChange={(e) => setManualStudentPassword(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0aec0', marginBottom: '0.5rem' }}>Assign College Portal</label>
                <select
                  required
                  className="glass-input"
                  value={manualStudentCollegeId}
                  onChange={(e) => setManualStudentCollegeId(e.target.value)}
                >
                  <option value="">-- Select Target College --</option>
                  {colleges.map((col) => (
                    <option key={col._id} value={col._id}>
                      {col.name} ({col.code})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={isRegisteringStudent} className="btn-neon" style={{ marginTop: '0.5rem' }}>
                {isRegisteringStudent ? 'Registering Student...' : 'Register Student'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Top Row: Excel Download & Deploy Forms */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            {/* 1. Download Spreadsheet template / upload file form */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Deploy Quiz via Excel/CSV</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                  Download the default spreadsheet template structure, input questions, and drop it here.
                </p>
                
                <button
                  type="button"
                  onClick={handleDownloadQuizTemplate}
                  className="btn-glass"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    marginBottom: '1.5rem',
                    borderColor: 'var(--neon-primary)',
                    color: 'var(--neon-primary)',
                    width: '100%'
                  }}
                >
                  Download Quiz Template (.CSV)
                </button>
              </div>

              <form onSubmit={handleCreateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Spreadsheet Question File (.xlsx / .csv)
                  </label>
                  <div style={{
                    border: '2px dashed var(--border-glass)',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    background: 'rgba(255, 255, 255, 0.01)'
                  }}>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setQuizExcelFile(e.target.files?.[0] || null)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                    <p style={{ color: 'var(--neon-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
                      {quizExcelFile ? quizExcelFile.name : 'Select Spreadsheet File'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1.5 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Quiz Title</label>
                    <input
                      type="text"
                      required={!!quizExcelFile}
                      className="glass-input"
                      placeholder="e.g. Midterm JavaScript"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Duration (Mins)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      className="glass-input"
                      value={quizDuration}
                      onChange={(e) => setQuizDuration(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Assign target College</label>
                  <select
                    required={!!quizExcelFile}
                    className="glass-input"
                    value={quizCollegeId}
                    onChange={(e) => setQuizCollegeId(e.target.value)}
                  >
                    <option value="">-- Target College --</option>
                    {colleges.map((col) => (
                      <option key={col._id} value={col._id}>
                        {col.name} ({col.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Description (Optional)</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Short description of concepts..."
                    value={quizDesc}
                    onChange={(e) => setQuizDesc(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingQuiz || !quizExcelFile}
                  className="btn-neon"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {isCreatingQuiz ? 'Uploading Quiz...' : 'Deploy Spreadsheet Quiz'}
                </button>
              </form>
            </div>

            {/* 2. Manual compile quiz form */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Deploy Quiz Manually</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Write individual questions manually and compile them into a deployed exam roster.
                </p>
              </div>

              {/* Manual Question Adder Card Form */}
              <form onSubmit={handleAddManualQuestion} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Question Text..."
                    className="glass-input"
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                    value={manualQText}
                    onChange={(e) => setManualQText(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Option 1"
                    className="glass-input"
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                    value={manualQOpt1}
                    onChange={(e) => setManualQOpt1(e.target.value)}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Option 2"
                    className="glass-input"
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                    value={manualQOpt2}
                    onChange={(e) => setManualQOpt2(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Option 3 (Optional)"
                    className="glass-input"
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                    value={manualQOpt3}
                    onChange={(e) => setManualQOpt3(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Option 4 (Optional)"
                    className="glass-input"
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                    value={manualQOpt4}
                    onChange={(e) => setManualQOpt4(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ flex: 1.5 }}>
                    <select
                      className="glass-input"
                      style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                      value={manualQCorrectIndex}
                      onChange={(e) => setManualQCorrectIndex(Number(e.target.value))}
                    >
                      <option value={0}>Correct: Option 1</option>
                      <option value={1}>Correct: Option 2</option>
                      <option value={2}>Correct: Option 3</option>
                      <option value={3}>Correct: Option 4</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="Points"
                      className="glass-input"
                      style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                      value={manualQPoints}
                      onChange={(e) => setManualQPoints(Number(e.target.value))}
                    />
                  </div>
                  <button type="submit" className="btn-glass" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                    + Add Q
                  </button>
                </div>
              </form>

              {/* manual questions counter / deploy button */}
              <div style={{ borderTop: '1px dashed var(--border-glass)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    Draft Questions: {quizQuestionsManual.length}
                  </span>
                  {quizQuestionsManual.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setQuizQuestionsManual([])}
                      style={{ background: 'none', border: 'none', color: '#ff0055', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      Clear Drafts
                    </button>
                  )}
                </div>
                
                {quizQuestionsManual.length > 0 && (
                  <div style={{ maxHeight: '100px', overflowY: 'auto', background: 'rgba(0,0,0,0.1)', padding: '6px', borderRadius: '4px', marginBottom: '10px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {quizQuestionsManual.map((q, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '2px' }}>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                          {idx + 1}. {q.questionText}
                        </span>
                        <span style={{ color: 'var(--neon-primary)' }}>({q.points} pts)</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required={quizQuestionsManual.length > 0}
                    className="glass-input"
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                    placeholder="Title..."
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                  />
                  <select
                    required={quizQuestionsManual.length > 0}
                    className="glass-input"
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                    value={quizCollegeId}
                    onChange={(e) => setQuizCollegeId(e.target.value)}
                  >
                    <option value="">-- College --</option>
                    {colleges.map((col) => (
                      <option key={col._id} value={col._id}>
                        {col.code}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  disabled={isCreatingQuiz || quizQuestionsManual.length === 0}
                  onClick={handleCreateQuiz}
                  className="btn-neon"
                  style={{ width: '100%', marginTop: '8px', padding: '10px 20px', fontSize: '0.8rem' }}
                >
                  {isCreatingQuiz ? 'Deploying...' : 'Deploy Manual Quiz'}
                </button>
              </div>

            </div>
          </div>

          {/* Active deployed quizzes dashboard */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Active Deployed Quizzes</h3>
            
            {quizzes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                No active quizzes deployed. Drop spreadsheet templates above to schedule exams.
              </div>
            ) : (
              <div className="table-container">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Quiz Title</th>
                      <th>Target College</th>
                      <th>Duration (Mins)</th>
                      <th>Total Questions</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.map((quiz: any) => (
                      <tr key={quiz._id}>
                        <td>
                          <strong>{quiz.title}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {quiz.description || 'No description'}
                          </span>
                        </td>
                        <td>{quiz.college?.name} ({quiz.college?.code})</td>
                        <td>{quiz.durationMinutes} mins</td>
                        <td>{quiz.questions?.length} Qs</td>
                        <td>
                          <span style={{
                            color: quiz.isActive ? 'var(--neon-green)' : 'var(--neon-red)',
                            fontWeight: 'bold',
                            fontSize: '0.8rem'
                          }}>
                            {quiz.isActive ? '● Active Exam' : '○ Retracted'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleToggleQuizActive(quiz._id)}
                              className="btn-glass"
                              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            >
                              {quiz.isActive ? 'Retract' : 'Deploy'}
                            </button>
                            <button
                              onClick={() => handleViewQuizResults(quiz._id)}
                              className="btn-neon"
                              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            >
                              Inspect Results
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quiz submissions analytics reports table */}
          {viewingQuizId && (
            <div className="glass-panel" style={{ border: '1px solid var(--border-glass-hover)', boxShadow: 'var(--glow-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Quiz Results Directory</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Telemetric grading logs and blur switch monitoring reports
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setViewingQuizId(null);
                    setSelectedQuizResults([]);
                  }}
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.25rem' }}
                >
                  &times;
                </button>
              </div>

              {selectedQuizResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: '#718096' }}>
                  No students have submitted attempts for this quiz environment yet.
                </div>
              ) : (
                <div className="table-container">
                  <table className="glass-table">
                    <thead>
                      <tr>
                        <th>Student Details</th>
                        <th>Score Gained</th>
                        <th>Time Elapsed</th>
                        <th>Warnings count</th>
                        <th>Telemetric Status</th>
                        <th>Submission Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuizResults.map((res: any) => (
                        <tr key={res._id}>
                          <td>
                            <strong>{res.student?.name}</strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {res.student?.email}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: res.isCheated ? 'var(--neon-red)' : 'var(--neon-green)' }}>
                              {res.score} / {res.totalPoints}
                            </strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              ({res.totalPoints > 0 ? Math.round((res.score / res.totalPoints) * 100) : 0}%)
                            </span>
                          </td>
                          <td>
                            {Math.floor(res.timeTakenSeconds / 60)}m {res.timeTakenSeconds % 60}s
                          </td>
                          <td style={{ color: res.tabSwitchCount >= 3 ? '#ff0055' : 'var(--text-primary)' }}>
                            {res.tabSwitchCount} / 3 warnings
                          </td>
                          <td>
                            {res.isCheated ? (
                              <span className="badge badge-rejected" style={{ fontSize: '0.7rem' }}>Cheated (Flagged)</span>
                            ) : (
                              <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>Secure exam</span>
                            )}
                          </td>
                          <td>{new Date(res.submittedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Verification / Review Proof Modal */}
      {selectedSubmission && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(3,3,11,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '750px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'zoomIn 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#00f2fe', fontFamily: 'monospace' }}>VERIFY_SUBMISSION</span>
                <h3 style={{ fontSize: '1.25rem' }}>{selectedSubmission.task?.title || 'Task Milestone'}</h3>
                <p style={{ color: '#a0aec0', fontSize: '0.9rem' }}>Submitted by: {selectedSubmission.student.name}</p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden', textAlign: 'center', background: '#000' }}>
              <img
                src={selectedSubmission.screenshotUrl.startsWith('http')
                  ? selectedSubmission.screenshotUrl
                  : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000'}${selectedSubmission.screenshotUrl}`
                }
                alt="Submission Proof"
                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>

            {selectedSubmission.notes && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#a0aec0', marginBottom: '0.25rem' }}>Student Notes:</h4>
                <p style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '6px', fontSize: '0.95rem' }}>
                  {selectedSubmission.notes}
                </p>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#a0aec0', marginBottom: '0.5rem' }}>Trainer Feedback</label>
              <textarea
                className="glass-input"
                rows={3}
                placeholder="Provide directions or approval feedback..."
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                style={{ marginBottom: '1.5rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleReviewSubmission('rejected')}
                disabled={isReviewing}
                className="btn-glass"
                style={{ border: '1px solid rgba(255, 0, 85, 0.4)', color: '#ff0055', background: 'rgba(255, 0, 85, 0.05)' }}
              >
                Reject / Request Rev
              </button>
              <button
                onClick={() => handleReviewSubmission('approved')}
                disabled={isReviewing}
                className="btn-neon"
                style={{ background: 'linear-gradient(135deg, #00ff87 0%, #60efff 100%)', color: '#03030b' }}
              >
                Approve Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Detail Performance Dashboard Modal */}
      {selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(3,3,11,0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#bd00ff', fontFamily: 'monospace' }}>STUDENT_PERFORMANCE_METRICS</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedStudent.name}</h3>
                <p style={{ color: '#a0aec0', fontSize: '0.9rem', marginTop: '2px' }}>
                  {selectedStudent.email} • {selectedStudent.college?.name || 'Global Portal'}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {/* Split layout: doughnut progress left, task stats right */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              {/* SVG doughnut ring chart */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="url(#gradCyanPurple)"
                      strokeWidth="3.5"
                      strokeDasharray={`${selectedStudent.stats.totalTasksCount > 0 ? (selectedStudent.stats.approvedCount / selectedStudent.stats.totalTasksCount) * 100 : 0}, 100`}
                    />
                    <defs>
                      <linearGradient id="gradCyanPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00f2fe" />
                        <stop offset="100%" stopColor="#bd00ff" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                      {selectedStudent.stats.totalTasksCount > 0 ? Math.round((selectedStudent.stats.approvedCount / selectedStudent.stats.totalTasksCount) * 100) : 0}%
                    </span>
                    <p style={{ fontSize: '0.65rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Approved</p>
                  </div>
                </div>
                <span style={{ marginTop: '10px', fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600 }}>Completion Progress Ring</span>
              </div>

              {/* Progress Counters Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(0, 255, 135, 0.05)', border: '1px solid rgba(0, 255, 135, 0.1)', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: '#00ff87', fontWeight: 600 }}>Approved Tasks</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedStudent.stats.approvedCount}</span>
                </div>
                <div style={{ background: 'rgba(255, 208, 0, 0.05)', border: '1px solid rgba(255, 208, 0, 0.1)', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: '#ffd000', fontWeight: 600 }}>Awaiting Review</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedStudent.stats.pendingCount}</span>
                </div>
                <div style={{ background: 'rgba(255, 0, 85, 0.05)', border: '1px solid rgba(255, 0, 85, 0.1)', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: '#ff0055', fontWeight: 600 }}>Rejected / Revision</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedStudent.stats.rejectedCount}</span>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Total Assigned Tasks</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedStudent.stats.totalTasksCount}</span>
                </div>
              </div>
            </div>

            {/* Task Checklist Breakdown */}
            <h4 style={{ fontSize: '1rem', color: '#00f2fe', marginBottom: '1rem', fontFamily: 'monospace' }}>TASK_PROGRESSION_BREAKDOWN</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '250px', overflowY: 'auto' }}>
              {tasks.filter(t => String(t.college?._id) === String(selectedStudent.college?._id)).length === 0 ? (
                <div style={{ textAlign: 'center', color: '#718096', padding: '1rem' }}>No tasks assigned to this student's college.</div>
              ) : (
                tasks.filter(t => String(t.college?._id) === String(selectedStudent.college?._id)).map((task) => {
                  const sub = submissions.find(s => s.task?._id === task._id && s.student._id === selectedStudent._id);
                  const status = sub ? sub.status : 'not_submitted';

                  let statusText = 'Not Submitted';
                  let statusGlow = 'var(--text-muted)';
                  if (status === 'approved') { statusText = 'Approved'; statusGlow = 'var(--neon-green)'; }
                  else if (status === 'pending') { statusText = 'Pending Review'; statusGlow = 'var(--neon-yellow)'; }
                  else if (status === 'rejected') { statusText = 'Needs Revision'; statusGlow = 'var(--neon-red)'; }

                  return (
                    <div key={task._id} style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem', display: 'block' }}>{task.title}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#718096' }}>Due Date: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: statusGlow, fontWeight: 600, fontSize: '0.85rem' }}>{statusText}</span>
                        {sub && (
                          <button
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setReviewFeedback(sub.feedback || '');
                              setSelectedStudent(null); // Close this modal to open verification proof
                            }}
                            className="btn-glass"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            Inspect Submission
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button onClick={() => setSelectedStudent(null)} className="btn-glass">
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </main>
  );
}
