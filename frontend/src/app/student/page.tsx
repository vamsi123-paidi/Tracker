'use client';

import { useState, useEffect } from 'react';
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
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  submission?: {
    _id: string;
    screenshotUrl: string;
    notes?: string;
    feedback?: string;
  } | null;
}

const getImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
  return `${baseUrl}${url}`;
};

export default function StudentDashboard() {
  const router = useRouter();
  const [studentName, setStudentName] = useState('');
  const [studentCollege, setStudentCollege] = useState<College | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Submission Modal States
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Profile management states
  const [studentEmail, setStudentEmail] = useState('');
  const [studentProfileImage, setStudentProfileImage] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Profile settings edit state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editProfileFile, setEditProfileFile] = useState<File | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'student' | 'bot'; text: string; timestamp: Date }[]>([
    {
      sender: 'bot',
      text: 'Hello! I am HoloBot, your AI Study Assistant. Ask me anything about programming, study tips, recursion, or CSV file layouts!',
      timestamp: new Date()
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    // Auth Check
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch Student Info & Tasks
    api.get('/auth/me')
      .then((user) => {
        if (user.role !== 'student') {
          router.push('/trainer');
        } else {
          setStudentName(user.name);
          setStudentEmail(user.email);
          setStudentProfileImage(user.profileImage || '');
          setStudentCollege(user.college || null);
          fetchStudentTasks();
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const fetchStudentTasks = async () => {
    try {
      const taskData = await api.get('/tasks');
      setTasks(taskData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to retrieve tasks');
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    router.push('/login');
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !screenshotFile) return;
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('taskId', selectedTask._id);
    formData.append('notes', notes);
    formData.append('screenshot', screenshotFile);

    try {
      await api.postFile('/submissions', formData);
      setSuccessMsg(`Task "${selectedTask.title}" submitted successfully!`);
      setSelectedTask(null);
      setScreenshotFile(null);
      setNotes('');
      fetchStudentTasks(); // Refresh list to reflect pending state
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit task proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let data;
      if (editProfileFile) {
        const formData = new FormData();
        formData.append('name', editName);
        formData.append('email', editEmail);
        if (editPassword) formData.append('password', editPassword);
        formData.append('profileImage', editProfileFile);

        data = await api.putFile('/auth/profile', formData);
      } else {
        data = await api.put('/auth/profile', {
          name: editName,
          email: editEmail,
          password: editPassword || undefined
        });
      }

      setStudentName(data.user.name);
      setStudentEmail(data.user.email);
      setStudentProfileImage(data.user.profileImage || '');
      setIsProfileModalOpen(false);
      setSuccessMsg('Profile settings updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile settings');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSendChatMessage = async (e?: React.FormEvent, promptText?: string) => {
    if (e) e.preventDefault();
    const messageToSend = promptText || chatInput;
    if (!messageToSend.trim()) return;

    const userMsg = {
      sender: 'student' as const,
      text: messageToSend,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await api.post('/chat', { message: messageToSend });
      
      const botReply = {
        sender: 'bot' as const,
        text: res.reply,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botReply]);
    } catch (err: any) {
      const errorReply = {
        sender: 'bot' as const,
        text: err.message || 'HoloBot is offline. Please configure the GEMINI_API_KEY on the backend server.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorReply]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Metrics
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const approvedCount = tasks.filter(t => t.status === 'approved').length;
  const rejectedCount = tasks.filter(t => t.status === 'rejected').length;

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
          <span style={{ fontFamily: 'monospace', color: '#bd00ff', fontSize: '0.9rem' }}>STUDENT_TERMINAL</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>HoloTrack Student</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {studentCollege && (
            <span className="badge badge-not-submitted" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
              College: {studentCollege.name} ({studentCollege.code})
            </span>
          )}
          
          <div 
            onClick={() => {
              setEditName(studentName);
              setEditEmail(studentEmail);
              setEditPassword('');
              setEditProfileFile(null);
              setIsProfileModalOpen(true);
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.65rem', 
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '999px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-glass)'
            }}
          >
            {studentProfileImage ? (
              <img 
                src={getImageUrl(studentProfileImage)} 
                alt={studentName} 
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  objectFit: 'cover', 
                  border: '1.5px solid var(--neon-primary)',
                  boxShadow: 'var(--glow-primary)'
                }} 
              />
            ) : (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--neon-primary) 0%, var(--neon-secondary) 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1.5px solid rgba(255,255,255,0.1)'
              }}>
                {studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Welcome, <strong style={{ color: 'var(--text-primary)' }}>{studentName}</strong>
            </span>
          </div>

          <ThemeToggle />
          
          <button 
            onClick={() => {
              setEditName(studentName);
              setEditEmail(studentEmail);
              setEditPassword('');
              setEditProfileFile(null);
              setIsProfileModalOpen(true);
            }} 
            className="btn-glass" 
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Settings
          </button>
          
          <button onClick={handleLogout} className="btn-glass" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Disconnect
          </button>
        </div>
      </header>

      {/* Notifications */}
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

      {/* Stats Board */}
      <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-panel">
          <p style={{ color: '#a0aec0', fontSize: '0.85rem', fontFamily: 'monospace' }}>ASSIGNED_TASKS</p>
          <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: '#00f2fe' }}>{totalTasks}</h3>
        </div>
        <div className="glass-panel">
          <p style={{ color: '#a0aec0', fontSize: '0.85rem', fontFamily: 'monospace' }}>COMPLETED_APPROVED</p>
          <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: '#00ff87' }}>{approvedCount}</h3>
        </div>
        <div className="glass-panel">
          <p style={{ color: '#a0aec0', fontSize: '0.85rem', fontFamily: 'monospace' }}>AWAITING_REVIEW</p>
          <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: '#ffd000' }}>{pendingCount}</h3>
        </div>
        <div className="glass-panel">
          <p style={{ color: '#a0aec0', fontSize: '0.85rem', fontFamily: 'monospace' }}>REQUESTS_REVISION</p>
          <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: '#ff0055' }}>{rejectedCount}</h3>
        </div>
      </div>

      {/* Task Board Section */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'monospace', color: '#00f2fe' }}>
        TASKS_LISTING_WORKSPACE
      </h3>

      {tasks.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#718096' }}>
          No tasks found for your college. Check back later or ask your trainer.
        </div>
      ) : (
        <div className="dashboard-grid">
          {tasks.map((task) => {
            const isApproved = task.status === 'approved';
            const isPending = task.status === 'pending';
            const isRejected = task.status === 'rejected';

            // Glow border depending on task status
            let glowBorder = 'var(--border-glass)';
            if (isApproved) glowBorder = 'rgba(0, 255, 135, 0.3)';
            else if (isPending) glowBorder = 'rgba(255, 208, 0, 0.3)';
            else if (isRejected) glowBorder = 'rgba(255, 0, 85, 0.3)';

            return (
              <div
                key={task._id}
                onClick={() => {
                  if (!isApproved) {
                    setSelectedTask(task);
                  }
                }}
                className="glass-panel tilt-card"
                style={{
                  borderColor: glowBorder,
                  cursor: isApproved ? 'default' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '220px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#718096', fontFamily: 'monospace' }}>
                      DUE: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    <span className={`badge badge-${task.status.replace('_', '-')}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.75rem' }}>{task.title}</h4>
                  <p style={{ color: '#a0aec0', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                    {task.description}
                  </p>
                </div>

                {/* Feedback Panel */}
                {task.submission && task.submission.feedback && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: isRejected ? 'rgba(255,0,85,0.04)' : 'rgba(0,255,135,0.04)',
                    border: `1px solid ${isRejected ? 'rgba(255,0,85,0.1)' : 'rgba(0,255,135,0.1)'}`,
                    fontSize: '0.8rem',
                    color: '#a0aec0'
                  }}>
                    <strong style={{ color: isRejected ? '#ff0055' : '#00ff87', display: 'block', marginBottom: '2px' }}>
                      Trainer feedback:
                    </strong>
                    {task.submission.feedback}
                  </div>
                )}

                {!isApproved && (
                  <div style={{
                    marginTop: '1rem',
                    fontSize: '0.85rem',
                    color: '#00f2fe',
                    textAlign: 'right',
                    fontWeight: 600
                  }}>
                    {isPending ? 'Re-upload proof →' : isRejected ? 'Resolve revision requirements →' : 'Upload milestone deliverables →'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal Dialog */}
      {selectedTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'var(--modal-overlay)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem',
          overflowY: 'auto'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '520px',
            width: '100%',
            maxHeight: 'calc(100vh - 3rem)',
            overflowY: 'auto',
            animation: 'zoomIn 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--neon-secondary)', fontFamily: 'monospace' }}>MILESTONE_VERIFICATION</span>
                <h3 style={{ fontSize: '1.25rem' }}>{selectedTask.title}</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setScreenshotFile(null);
                  setNotes('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Upload Screenshot Proof (PNG, JPG)
                </label>
                <div style={{
                  border: '2px dashed var(--border-glass)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.01)'
                }}>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
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
                  <p style={{ color: 'var(--neon-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
                    {screenshotFile ? screenshotFile.name : 'Select screenshot image'}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>Image dimensions up to 5MB</p>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Notes / Links / Code Snippets (Optional)
                </label>
                <textarea
                  className="glass-input"
                  rows={4}
                  placeholder="Describe your implementation, provide github repositories, or add notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTask(null);
                    setScreenshotFile(null);
                    setNotes('');
                  }}
                  className="btn-glass"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !screenshotFile}
                  className="btn-neon"
                  style={{ background: 'linear-gradient(135deg, #bd00ff 0%, #0052ff 100%)', color: '#fff' }}
                >
                  {isSubmitting ? 'Uploading...' : 'Transmit Deliverables'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {isProfileModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'var(--modal-overlay)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem',
          overflowY: 'auto'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '520px',
            width: '100%',
            maxHeight: 'calc(100vh - 3rem)',
            overflowY: 'auto',
            animation: 'zoomIn 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--neon-secondary)', fontFamily: 'monospace' }}>SETTINGS_MANAGEMENT</span>
                <h3 style={{ fontSize: '1.25rem' }}>Edit Profile Settings</h3>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Profile Image Preview & Select */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ position: 'relative' }}>
                  {editProfileFile ? (
                    <img 
                      src={URL.createObjectURL(editProfileFile)} 
                      alt="Preview" 
                      style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--neon-primary)', boxShadow: 'var(--glow-primary)' }} 
                    />
                  ) : studentProfileImage ? (
                    <img 
                      src={getImageUrl(studentProfileImage)} 
                      alt={studentName} 
                      style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--neon-primary)', boxShadow: 'var(--glow-primary)' }} 
                    />
                  ) : (
                    <div style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--neon-primary) 0%, var(--neon-secondary) 100%)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 700,
                      border: '3px solid rgba(255,255,255,0.1)'
                    }}>
                      {studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                  <button type="button" className="btn-glass" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    Change Avatar
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditProfileFile(e.target.files?.[0] || null)}
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
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="glass-input"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  className="glass-input"
                  placeholder="••••••••"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
              </div>

              {/* Locked college details */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Assigned College (Locked)
                  </label>
                  <input
                    type="text"
                    disabled
                    className="glass-input"
                    value={studentCollege ? studentCollege.name : ''}
                    style={{ cursor: 'not-allowed', opacity: 0.6 }}
                  />
                </div>
                <div style={{ width: '120px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    College Code
                  </label>
                  <input
                    type="text"
                    disabled
                    className="glass-input"
                    value={studentCollege ? studentCollege.code : ''}
                    style={{ cursor: 'not-allowed', opacity: 0.6 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="btn-glass"
                  disabled={isUpdatingProfile}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="btn-neon"
                  style={{ background: 'linear-gradient(135deg, #bd00ff 0%, #0052ff 100%)', color: '#fff' }}
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Chat Bubble & Chat Window */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 90 }}>
        {/* Chat Window */}
        {isChatOpen && (
          <div className="glass-panel" style={{
            position: 'absolute',
            bottom: '70px',
            right: 0,
            width: '360px',
            height: '480px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '1.25rem',
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--border-glass-hover)',
            animation: 'zoomIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff87', boxShadow: 'var(--glow-green)' }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>HoloBot AI</h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>STUDY_ASSISTANT</span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {/* Messages Listing */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginBottom: '1rem',
              paddingRight: '4px'
            }}>
              {chatMessages.map((msg, idx) => {
                const isStudent = msg.sender === 'student';
                return (
                  <div
                    key={idx}
                    style={{
                      alignSelf: isStudent ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      borderTopRightRadius: isStudent ? '2px' : '14px',
                      borderTopLeftRadius: isStudent ? '14px' : '2px',
                      background: isStudent 
                        ? 'rgba(0, 242, 254, 0.15)' 
                        : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${isStudent ? 'rgba(0, 242, 254, 0.3)' : 'var(--border-glass)'}`,
                      fontSize: '0.85rem',
                      lineHeight: '1.4',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i} style={{ marginBottom: i < msg.text.split('\n').length - 1 ? '6px' : '0' }}>
                        {line}
                      </p>
                    ))}
                  </div>
                );
              })}
              {isChatLoading && (
                <div style={{
                  alignSelf: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  borderTopLeftRadius: '2px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-glass)',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  fontFamily: 'monospace'
                }}>
                  Thinking...
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleSendChatMessage(undefined, 'Study tips')}
                className="btn-glass"
                style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '6px' }}
              >
                Study tips
              </button>
              <button
                type="button"
                onClick={() => handleSendChatMessage(undefined, 'What is recursion?')}
                className="btn-glass"
                style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '6px' }}
              >
                Recursion help
              </button>
              <button
                type="button"
                onClick={() => handleSendChatMessage(undefined, 'CSV layout guide')}
                className="btn-glass"
                style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '6px' }}
              >
                CSV format
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="glass-input"
                style={{ padding: '10px 14px', fontSize: '0.85rem' }}
                placeholder="Ask HoloBot study questions..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isChatLoading}
              />
              <button
                type="submit"
                className="btn-neon"
                style={{ padding: '10px 16px', background: 'linear-gradient(135deg, var(--neon-primary) 0%, var(--neon-blue) 100%)' }}
                disabled={isChatLoading || !chatInput.trim()}
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* Floating Bubble Icon */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="btn-neon"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            boxShadow: 'var(--glow-primary)',
            background: 'linear-gradient(135deg, var(--neon-primary) 0%, var(--neon-secondary) 100%)',
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          {isChatOpen ? (
            // Close Symbol
            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>&times;</span>
          ) : (
            // Chat Bubble Icon
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </button>
      </div>

      <style jsx global>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </main>
  );
}
