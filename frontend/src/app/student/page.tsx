'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api, removeAuthToken, getAuthToken } from '@/utils/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import Editor from '@monaco-editor/react';

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

interface QuizQuestion {
  questionText: string;
  options: string[];
  points: number;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  durationMinutes: number;
  isActive: boolean;
  isCompleted?: boolean;
}

interface Flashcard {
  q: string;
  a: string;
}

const getImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
  return `${baseUrl}${url}`;
};

// Helper function to register VSCode snippets and HTML auto-closing tag feature
const setupMonacoSnippetsAndAutoClose = (editor: any, monaco: any) => {
  // Register HTML Snippets
  const htmlProvider = monaco.languages.registerCompletionItemProvider('html', {
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };
      
      const suggestions = [
        {
          label: '!',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'HTML5 Boilerplate Structure',
          insertText: [
            '<!DOCTYPE html>',
            '<html lang="en">',
            '<head>',
            '  <meta charset="UTF-8">',
            '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '  <title>${1:Document}</title>',
            '</head>',
            '<body>',
            '  $0',
            '</body>',
            '</html>'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        },
        {
          label: 'html:5',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'HTML5 Boilerplate Structure',
          insertText: [
            '<!DOCTYPE html>',
            '<html lang="en">',
            '<head>',
            '  <meta charset="UTF-8">',
            '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '  <title>${1:Document}</title>',
            '</head>',
            '<body>',
            '  $0',
            '</body>',
            '</html>'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        },
        {
          label: 'a',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Anchor Tag',
          insertText: '<a href="${1:#}">${2:Link}</a>$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        },
        {
          label: 'img',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Image Tag',
          insertText: '<img src="${1}" alt="${2}">$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        },
        {
          label: 'link',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'CSS Link Tag',
          insertText: '<link rel="stylesheet" href="${1:style.css}">$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        },
        {
          label: 'script',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Script Tag',
          insertText: '<script src="${1:script.js}"></script>$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        },
        {
          label: 'div',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Div Element',
          insertText: '<div class="${1:container}">\n  $0\n</div>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        },
        {
          label: 'style',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Style Tag',
          insertText: '<style>\n  $0\n</style>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        },
        {
          label: 'p',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Paragraph Tag',
          insertText: '<p>$1</p>$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        },
        {
          label: 'button',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Button Tag',
          insertText: '<button class="${1:btn}">$2</button>$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        },
        {
          label: 'ul',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Unordered List',
          insertText: '<ul>\n  <li>$1</li>\n</ul>$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        }
      ];
      
      return { suggestions };
    }
  });

  // Register CSS Snippets
  const cssProvider = monaco.languages.registerCompletionItemProvider('css', {
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };
      
      const suggestions = [
        {
          label: 'df',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'display: flex;',
          insertText: 'display: flex;',
          range: range
        },
        {
          label: 'dn',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'display: none;',
          insertText: 'display: none;',
          range: range
        },
        {
          label: 'db',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'display: block;',
          insertText: 'display: block;',
          range: range
        },
        {
          label: 'jcsb',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'justify-content: space-between;',
          insertText: 'justify-content: space-between;',
          range: range
        },
        {
          label: 'jc',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'justify-content: center;',
          insertText: 'justify-content: center;',
          range: range
        },
        {
          label: 'ai',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'align-items: center;',
          insertText: 'align-items: center;',
          range: range
        },
        {
          label: 'tac',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'text-align: center;',
          insertText: 'text-align: center;',
          range: range
        },
        {
          label: 'm0',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'margin: 0;',
          insertText: 'margin: 0;',
          range: range
        },
        {
          label: 'p0',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'padding: 0;',
          insertText: 'padding: 0;',
          range: range
        },
        {
          label: 'w100',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'width: 100%;',
          insertText: 'width: 100%;',
          range: range
        },
        {
          label: 'h100',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'height: 100%;',
          insertText: 'height: 100%;',
          range: range
        },
        {
          label: 'bg',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'background;',
          insertText: 'background: ${1:#fff};',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        },
        {
          label: 'c',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'color;',
          insertText: 'color: ${1:#fff};',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        },
        {
          label: 'fs',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'font-size;',
          insertText: 'font-size: ${1:16px};',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        },
        {
          label: 'fw',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'font-weight;',
          insertText: 'font-weight: ${1:bold};',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        },
        {
          label: 'br',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'border-radius;',
          insertText: 'border-radius: ${1:8px};',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        },
        {
          label: 'bs',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'box-shadow;',
          insertText: 'box-shadow: ${1:0 4px 15px rgba(0,0,0,0.1)};',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        }
      ];
      
      return { suggestions };
    }
  });

  // HTML tag auto-closing listener
  const changeListener = editor.onDidChangeModelContent((event: any) => {
    const changes = event.changes;
    if (changes && changes.length === 1) {
      const change = changes[0];
      if (change.text === '>') {
        const model = editor.getModel();
        const position = editor.getPosition();
        if (!model || !position) return;

        const lineContent = model.getLineContent(position.lineNumber);
        const textBeforeCursor = lineContent.substring(0, position.column - 1);

        const tagMatch = textBeforeCursor.match(/<([a-zA-Z0-9\-]+)(?:\s+[^>]*)*$/);
        if (tagMatch) {
          const tagName = tagMatch[1];
          const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
          if (!selfClosingTags.includes(tagName.toLowerCase())) {
            const closingTag = `</${tagName}>`;
            
            setTimeout(() => {
              editor.executeEdits('auto-close-tag', [{
                range: new monaco.Range(
                  position.lineNumber,
                  position.column,
                  position.lineNumber,
                  position.column
                ),
                text: closingTag,
                forceMoveMarkers: true
              }]);
              
              editor.setPosition(position);
            }, 0);
          }
        }
      }
    }
  });

  return () => {
    htmlProvider.dispose();
    cssProvider.dispose();
    changeListener.dispose();
  };
};

export default function StudentDashboard() {
  const router = useRouter();
  
  // Auth & Student Details
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentProfileImage, setStudentProfileImage] = useState('');
  const [studentCollege, setStudentCollege] = useState<College | null>(null);
  
  // Sidebar tab control
  const [activeTab, setActiveTab] = useState<'milestones' | 'quizzes' | 'playground' | 'compiler' | 'tools' | 'achievements'>('milestones');
  const [compilerLang, setCompilerLang] = useState<'c' | 'cpp' | 'python' | 'java' | 'javascript' | 'go' | 'rust' | 'csharp' | 'php'>('python');
  const [isCompilerFullscreen, setIsCompilerFullscreen] = useState(false);
  
  // Tasks/Milestones State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Quizzes State
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    totalPoints: number;
    isCheated: boolean;
    message?: string;
  } | null>(null);

  // Code Playground Sandbox States
  const [playgroundHtml, setPlaygroundHtml] = useState('<!-- Write your HTML here -->\n<div class="card">\n  <h2>Code Playground</h2>\n  <p>Modify HTML, CSS or JS and click Run Code!</p>\n  <button id="glow-btn">Interact</button>\n</div>');
  const [playgroundCss, setPlaygroundCss] = useState(`/* Write your CSS here */\nbody {\n  background: #0d0e15;\n  color: #fff;\n  font-family: sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  margin: 0;\n}\n.card {\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  padding: 30px;\n  border-radius: 16px;\n  text-align: center;\n  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);\n  backdrop-filter: blur(10px);\n}\nh2 {\n  color: #00f2fe;\n  margin-top: 0;\n  text-shadow: 0 0 10px rgba(0, 242, 254, 0.5);\n}\nbutton {\n  background: linear-gradient(135deg, #00f2fe 0%, #bd00ff 100%);\n  color: white;\n  border: none;\n  padding: 10px 20px;\n  border-radius: 8px;\n  cursor: pointer;\n  font-weight: bold;\n  box-shadow: 0 4px 15px rgba(0, 242, 254, 0.3);\n  transition: 0.3s;\n}\nbutton:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 20px rgba(189, 0, 255, 0.5);\n}`);
  const [playgroundJs, setPlaygroundJs] = useState(`// Write your JavaScript here\nconst btn = document.getElementById('glow-btn');\nif (btn) {\n  btn.addEventListener('click', () => {\n    alert('Greetings from Code Playground!');\n  });\n}`);
  const [playgroundActiveEditor, setPlaygroundActiveEditor] = useState<'html' | 'css' | 'js'>('html');
  const [playgroundSrcDoc, setPlaygroundSrcDoc] = useState('');
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);

  // Notepad States
  const [notepadText, setNotepadText] = useState('');
  const [notepadTab, setNotepadTab] = useState<'edit' | 'preview'>('edit');

  // Pomodoro States
  const [pomodoroTime, setPomodoroTime] = useState(1500); // 25 min default
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<'focus' | 'short' | 'long'>('focus');

  // Revision Flashcards States
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flippedCardIdx, setFlippedCardIdx] = useState<number | null>(null);
  const [newFlashcardQ, setNewFlashcardQ] = useState('');
  const [newFlashcardA, setNewFlashcardA] = useState('');

  // Status Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Profile Edit States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
      text: 'Hello! I am your Study Assistant. Ask me anything about programming, study tips, recursion, or CSV file layouts!',
      timestamp: new Date()
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'vs-light'>('vs-dark');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLight = document.documentElement.classList.contains('light');
      setEditorTheme(isLight ? 'vs-light' : 'vs-dark');

      const observer = new MutationObserver(() => {
        const isLightNow = document.documentElement.classList.contains('light');
        setEditorTheme(isLightNow ? 'vs-light' : 'vs-dark');
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      return () => observer.disconnect();
    }
  }, []);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const editorRef = useRef<any>(null);
  const monacoCleanupRef = useRef<(() => void) | null>(null);

  // Clean up Monaco completion items on component unmount
  useEffect(() => {
    return () => {
      if (monacoCleanupRef.current) {
        monacoCleanupRef.current();
      }
    };
  }, []);

  // Initialize
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

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
          fetchActiveQuizzes();
        }
      })
      .catch(() => router.push('/login'));

    // Client-side localstorage initializers
    if (typeof window !== 'undefined') {
      // Load notepad
      const savedNotes = localStorage.getItem('holotrack_notes');
      setNotepadText(savedNotes || '# My Study Notes\n\n- Write programming structures here...\n- Autosaves locally without backend DB storage!');
      
      // Load flashcards
      const savedFlashcards = localStorage.getItem('holotrack_flashcards');
      if (savedFlashcards) {
        setFlashcards(JSON.parse(savedFlashcards));
      } else {
        const defaults: Flashcard[] = [
          { q: 'What is the runtime complexity of Binary Search?', a: 'O(log n) logarithmic time.' },
          { q: 'Define Mongoose Schemas.', a: 'Mongoose Schemas define the document structure, validation, default values, and queries for MongoDB collections.' },
          { q: 'How does client-side state caching work?', a: 'By saving data directly to browser storage APIs (like localStorage or IndexedDB) which bypasses server DB storage requests.' }
        ];
        setFlashcards(defaults);
        localStorage.setItem('holotrack_flashcards', JSON.stringify(defaults));
      }
    }
  }, [router]);

  // Run playground code once to render preview on load/switch
  useEffect(() => {
    if (playgroundSrcDoc === '') {
      runPlaygroundCode();
    }
  }, [playgroundHtml]);

  // Pomodoro countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (pomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0 && pomodoroActive) {
      setPomodoroActive(false);
      playBellSound();
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('holotrack_achievement_pomodoro', 'true');
      }
      alert('Focus Session Finished! Time to rest.');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoroActive, pomodoroTime]);

  // Active quiz ticking timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeQuiz && !quizResult && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (activeQuiz && !quizResult && timeRemaining === 0) {
      autoSubmitQuiz();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeQuiz, quizResult, timeRemaining]);

  // Security: Quiz window blur listener for anti-cheat tab-switching
  useEffect(() => {
    if (!activeQuiz || quizResult) return;

    const handleBlur = () => {
      setTabSwitchCount((prev) => {
        const nextWarnings = prev + 1;
        if (nextWarnings >= 3) {
          alert('CRITICAL VIOLATION: You have switched tabs 3 times. Your quiz is being auto-submitted immediately.');
          autoSubmitQuiz(nextWarnings);
        } else {
          alert(`WARNING: You have switched tabs. Tab switches are logged! warnings: ${nextWarnings}/3.`);
        }
        return nextWarnings;
      });
    };

    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [activeQuiz, quizResult]);

  const fetchStudentTasks = async () => {
    try {
      const taskData = await api.get('/tasks');
      setTasks(taskData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to retrieve tasks');
    }
  };

  const fetchActiveQuizzes = async () => {
    setIsLoadingQuizzes(true);
    try {
      const quizData = await api.get('/quizzes/active');
      setQuizzes(quizData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingQuizzes(false);
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
      fetchStudentTasks();
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
        text: err.message || 'Study Assistant is currently unavailable. Please verify the setup on the backend server.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorReply]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Sound generator using Web Audio API
  const playBellSound = () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn('Web Audio synthesis failed', e);
    }
  };

  // Launch Active Quiz
  const startQuizAttempt = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setQuizAnswers(new Array(quiz.questions.length).fill(-1));
    setCurrentQuestionIdx(0);
    setTabSwitchCount(0);
    setTimeRemaining(quiz.durationMinutes * 60);
    setQuizResult(null);
    setErrorMsg('');
  };

  // Submit Quiz Answers
  const submitQuizAttempt = async (forcedSwitchCount?: number) => {
    if (!activeQuiz) return;
    setIsSubmittingQuiz(true);
    setErrorMsg('');

    const finalSwitches = typeof forcedSwitchCount === 'number' ? forcedSwitchCount : tabSwitchCount;
    const timeTaken = activeQuiz.durationMinutes * 60 - timeRemaining;

    try {
      const res = await api.post(`/quizzes/${activeQuiz._id}/submit`, {
        answers: quizAnswers,
        tabSwitchCount: finalSwitches,
        timeTakenSeconds: timeTaken > 0 ? timeTaken : activeQuiz.durationMinutes * 60
      });
      setQuizResult(res);
      fetchActiveQuizzes(); // Refresh lists
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit quiz attempt.');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const autoSubmitQuiz = (forcedSwitchCount?: number) => {
    submitQuizAttempt(forcedSwitchCount);
  };

  // Run Custom Code inside Code Playground sandbox
  const runPlaygroundCode = () => {
    const combined = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Code Playground Preview</title>
        <style>
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
          ${playgroundCss}
        </style>
      </head>
      <body>
        ${playgroundHtml}
        <script>
          // Override window alert inside sandbox iframe
          window.alert = function(msg) {
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.top = '15px';
            container.style.left = '50%';
            container.style.transform = 'translateX(-50%)';
            container.style.padding = '10px 20px';
            container.style.background = 'rgba(0, 242, 254, 0.95)';
            container.style.color = '#020208';
            container.style.fontWeight = 'bold';
            container.style.borderRadius = '8px';
            container.style.boxShadow = '0 0 15px rgba(0, 242, 254, 0.5)';
            container.style.fontFamily = 'sans-serif';
            container.style.zIndex = '9999';
            container.textContent = 'Sandbox Alert: ' + msg;
            document.body.appendChild(container);
            setTimeout(() => container.remove(), 3000);
          };
          
          try {
            ${playgroundJs}
          } catch(err) {
            document.body.innerHTML += '<div style="color: #ff0055; font-family: monospace; padding: 10px; border: 1px dashed #ff0055; margin-top: 15px;">JS Error: ' + err.message + '</div>';
          }
        </script>
      </body>
      </html>
    `;
    setPlaygroundSrcDoc(combined);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('holotrack_achievement_code_warrior', 'true');
    }
  };

  // Notepad autosave function
  const handleNotepadChange = (text: string) => {
    setNotepadText(text);
    if (typeof window !== 'undefined') {
      localStorage.setItem('holotrack_notes', text);
    }
  };

  // Simple Markdown Parser for Preview Tab
  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    html = html.replace(/^### (.*$)/gim, '<h3 style="color:var(--neon-primary); margin: 15px 0 8px;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="color:var(--neon-primary); border-bottom:1px dashed var(--border-glass); padding-bottom:4px; margin:20px 0 10px;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="color:var(--neon-secondary); border-bottom:1px solid var(--border-glass); padding-bottom:6px; margin:25px 0 15px;">$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px; font-family:monospace; color:#bd00ff;">$1</code>');
    html = html.replace(/^\- (.*$)/gim, '<li style="margin-left: 20px; margin-bottom: 6px;">$1</li>');
    html = html.replace(/\n/g, '<br>');
    
    return { __html: html };
  };

  // Toggle Pomodoro Mode
  const switchPomodoroMode = (mode: 'focus' | 'short' | 'long') => {
    setPomodoroActive(false);
    setPomodoroMode(mode);
    if (mode === 'focus') setPomodoroTime(25 * 60);
    else if (mode === 'short') setPomodoroTime(5 * 60);
    else if (mode === 'long') setPomodoroTime(15 * 60);
  };

  // Add custom revision card
  const handleAddFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlashcardQ.trim() || !newFlashcardA.trim()) return;

    const newCard: Flashcard = {
      q: newFlashcardQ.trim(),
      a: newFlashcardA.trim()
    };
    const updated = [...flashcards, newCard];
    setFlashcards(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('holotrack_flashcards', JSON.stringify(updated));
      localStorage.setItem('holotrack_achievement_scholar', 'true');
    }
    setNewFlashcardQ('');
    setNewFlashcardA('');
    alert('Flashcard added successfully!');
  };

  // Compute Achievements Status
  const approvedCount = tasks.filter(t => t.status === 'approved').length;
  const attemptedQuizzes = quizzes.filter(q => q.isCompleted).length;

  const badges = [
    {
      id: 'transmitter',
      title: 'Milestone Transmitter',
      description: 'Submitted at least one milestone deliverable',
      unlocked: tasks.some(t => t.status === 'pending' || t.status === 'approved' || t.status === 'rejected'),
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      ),
      color: '#00f2fe'
    },
    {
      id: 'master',
      title: 'Task Master',
      description: 'Obtained trainer validation for 3+ tasks',
      unlocked: approvedCount >= 3,
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      color: '#00ff87'
    },
    {
      id: 'gladiator',
      title: 'Quiz Gladiator',
      description: 'Securely submitted an online quiz',
      unlocked: attemptedQuizzes > 0,
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
      color: '#ffd000'
    },
    {
      id: 'code_warrior',
      title: 'Code Warrior',
      description: 'Executed playground code successfully',
      unlocked: typeof window !== 'undefined' && localStorage.getItem('holotrack_achievement_code_warrior') === 'true',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      color: '#bd00ff'
    },
    {
      id: 'pomodoro',
      title: 'Focused Mind',
      description: 'Completed a focus interval session',
      unlocked: typeof window !== 'undefined' && localStorage.getItem('holotrack_achievement_pomodoro') === 'true',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      color: '#ff0055'
    },
    {
      id: 'scholar',
      title: 'Scholar Creator',
      description: 'Compiled a personal revision card',
      unlocked: typeof window !== 'undefined' && localStorage.getItem('holotrack_achievement_scholar') === 'true',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z" />
        </svg>
      ),
      color: '#0052ff'
    }
  ];

  // Stats Counters
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const rejectedCount = tasks.filter(t => t.status === 'rejected').length;

  return (
    <main style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto', zIndex: 1 }}>
      
      {/* Top Header Row */}
      <header className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem 1.5rem'
      }}>
        <div>
          <span style={{ fontFamily: 'monospace', color: '#bd00ff', fontSize: '0.9rem' }}>STUDENT_TERMINAL</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Student Portal</h2>
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

      {/* Action Alerts */}
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

      {/* Main Grid: Sidebar + Workspace */}
      <div className="workspace-layout">
        
        {/* Left Nav Bar */}
        <aside className="glass-panel" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '1rem', letterSpacing: '1px' }}>
            STUDENT_WORKPLACE
          </h4>
          <nav className="sidebar-nav">
            <button
              onClick={() => setActiveTab('milestones')}
              className={`sidebar-btn ${activeTab === 'milestones' ? 'active' : ''}`}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Milestones
            </button>

            <button
              onClick={() => {
                setActiveTab('quizzes');
                fetchActiveQuizzes();
              }}
              className={`sidebar-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Quiz Hub
            </button>

            <button
              onClick={() => setActiveTab('playground')}
              className={`sidebar-btn ${activeTab === 'playground' ? 'active' : ''}`}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              Code Playground
            </button>

            <button
              onClick={() => setActiveTab('compiler')}
              className={`sidebar-btn ${activeTab === 'compiler' ? 'active' : ''}`}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 10l3 2-3 2" />
                <line x1="11" y1="14" x2="15" y2="14" />
              </svg>
              Code Compiler
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`sidebar-btn ${activeTab === 'tools' ? 'active' : ''}`}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              Focus Tools
            </button>

            <button
              onClick={() => setActiveTab('achievements')}
              className={`sidebar-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
              Badge Shelf
            </button>
          </nav>
        </aside>

        {/* Right workspace area */}
        <section className="workspace-content">
          
          {/* TAB 1: MILESTONES (Tasks Listing & Stats) */}
          {activeTab === 'milestones' && (
            <div>
              {/* Stats Counters */}
              <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
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

              {/* Tasks List */}
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
            </div>
          )}

          {/* TAB 2: QUIZ HUB */}
          {activeTab === 'quizzes' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'monospace', color: '#00f2fe' }}>
                SECURE_QUIZ_HUB
              </h3>

              {isLoadingQuizzes ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  Loading active examinations...
                </div>
              ) : quizzes.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#718096' }}>
                  No active quizzes scheduled for your college code. Check back later.
                </div>
              ) : (
                <div className="dashboard-grid">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz._id}
                      className="glass-panel"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '220px',
                        borderLeft: quiz.isCompleted ? '4px solid var(--neon-green)' : '4px solid var(--neon-primary)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#718096', fontFamily: 'monospace' }}>
                            LIMIT: {quiz.durationMinutes} MINS
                          </span>
                          <span className={`badge ${quiz.isCompleted ? 'badge-approved' : 'badge-pending'}`}>
                            {quiz.isCompleted ? 'COMPLETED' : 'PENDING'}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>{quiz.title}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                          {quiz.description}
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {quiz.questions.length} Questions
                        </span>
                        
                        {quiz.isCompleted ? (
                          <button disabled className="btn-glass" style={{ padding: '8px 16px', fontSize: '0.8rem', opacity: 0.6, cursor: 'not-allowed' }}>
                            Attempt Saved
                          </button>
                        ) : (
                          <button
                            onClick={() => startQuizAttempt(quiz)}
                            className="btn-neon"
                            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                          >
                            Launch Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CODE PLAYGROUND */}
          {activeTab === 'playground' && (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontFamily: 'monospace', color: '#00f2fe', margin: 0 }}>
                    Code Playground Sandbox
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Test HTML, CSS, and JS components inside a browser-sandboxed iframe (VSCode engine)
                  </span>
                </div>
                <button
                  onClick={runPlaygroundCode}
                  className="btn-neon"
                  style={{
                    background: 'linear-gradient(135deg, var(--neon-primary) 0%, var(--neon-secondary) 100%)',
                    boxShadow: 'var(--glow-primary)',
                    padding: '8px 20px',
                    fontSize: '0.85rem'
                  }}
                >
                  Run Code
                </button>
              </div>

              {/* Sandbox Split Interface */}
              <div className="playground-split" style={{ display: 'flex', gap: '1.5rem', width: '100%' }}>
                
                {/* Editor Tabs & Inputs */}
                <div 
                  style={isEditorFullscreen ? {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 9999,
                    background: '#15161e',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  } : { 
                    flex: 1.2, 
                    minWidth: 0, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.75rem' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setPlaygroundActiveEditor('html')}
                        className={`btn-glass ${playgroundActiveEditor === 'html' ? 'btn-neon' : ''}`}
                        style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                      >
                        index.html
                      </button>
                      <button
                        onClick={() => setPlaygroundActiveEditor('css')}
                        className={`btn-glass ${playgroundActiveEditor === 'css' ? 'btn-neon' : ''}`}
                        style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                      >
                        styles.css
                      </button>
                      <button
                        onClick={() => setPlaygroundActiveEditor('js')}
                        className={`btn-glass ${playgroundActiveEditor === 'js' ? 'btn-neon' : ''}`}
                        style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                      >
                        app.js
                      </button>
                    </div>

                    <button
                      onClick={() => setIsEditorFullscreen(!isEditorFullscreen)}
                      className="btn-glass"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderColor: isEditorFullscreen ? 'var(--neon-primary)' : 'rgba(255,255,255,0.1)'
                      }}
                    >
                      {isEditorFullscreen ? (
                        <>
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
                          </svg>
                          Exit Fullscreen
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                          </svg>
                          Fullscreen
                        </>
                      )}
                    </button>
                  </div>

                  <div style={{ 
                    borderRadius: isEditorFullscreen ? '0' : '12px', 
                    overflow: 'hidden', 
                    border: isEditorFullscreen ? 'none' : '1.5px solid var(--border-glass)',
                    background: '#1e1e1e',
                    boxShadow: isEditorFullscreen ? 'none' : 'inset 0 0 10px rgba(0,0,0,0.5)',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Editor
                      height={isEditorFullscreen ? "calc(100vh - 100px)" : "500px"}
                      language={playgroundActiveEditor === 'js' ? 'javascript' : playgroundActiveEditor}
                      theme={editorTheme}
                      value={
                        playgroundActiveEditor === 'html' ? playgroundHtml :
                        playgroundActiveEditor === 'css' ? playgroundCss :
                        playgroundJs
                      }
                      onChange={(val) => {
                        const newVal = val || '';
                        if (playgroundActiveEditor === 'html') setPlaygroundHtml(newVal);
                        else if (playgroundActiveEditor === 'css') setPlaygroundCss(newVal);
                        else setPlaygroundJs(newVal);
                      }}
                      onMount={(editor, monaco) => {
                        editorRef.current = editor;
                        if (monacoCleanupRef.current) {
                          monacoCleanupRef.current();
                        }
                        const cleanup = setupMonacoSnippetsAndAutoClose(editor, monaco);
                        monacoCleanupRef.current = cleanup;
                      }}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: 'Consolas, "Courier New", monospace',
                        tabSize: 2,
                        automaticLayout: true,
                        suggestOnTriggerCharacters: true,
                        wordBasedSuggestions: 'allDocuments',
                        snippetSuggestions: 'inline',
                        quickSuggestions: { other: true, comments: true, strings: true },
                        lineNumbers: 'on',
                        autoClosingBrackets: 'always',
                        autoClosingQuotes: 'always',
                        autoClosingComments: 'always',
                        scrollbar: {
                          vertical: 'visible',
                          horizontal: 'visible'
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Preview Frame */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontFamily: 'monospace' }}>
                    LIVE_PREVIEW_IFRAME
                  </h4>
                  <div style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1.5px solid var(--border-glass-hover)',
                    background: '#fff',
                    boxShadow: 'var(--glow-primary)',
                    flex: 1,
                    display: 'flex'
                  }}>
                    <iframe
                      srcDoc={playgroundSrcDoc}
                      title="Playground Runner Sandbox"
                      sandbox="allow-scripts"
                      style={{
                        width: '100%',
                        height: '500px',
                        border: 'none',
                        display: 'block'
                      }}
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: CODE COMPILER */}
          {activeTab === 'compiler' && (
            <div 
              className={isCompilerFullscreen ? "" : "glass-panel"} 
              style={isCompilerFullscreen ? {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                background: '#15161e',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              } : { 
                padding: '2rem' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#bd00ff', fontFamily: 'monospace' }}>ONLINE_CODE_COMPILER</span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Code Compiler</h3>
                  <p style={{ color: '#a0aec0', fontSize: '0.9rem' }}>Write and run code in 9 languages instantly using the embedded terminal runner.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', maxWidth: '520px' }}>
                    {[
                      { id: 'c', name: 'C' },
                      { id: 'cpp', name: 'C++' },
                      { id: 'python', name: 'Python' },
                      { id: 'java', name: 'Java' },
                      { id: 'javascript', name: 'JavaScript' },
                      { id: 'go', name: 'Go' },
                      { id: 'rust', name: 'Rust' },
                      { id: 'csharp', name: 'C#' },
                      { id: 'php', name: 'PHP' }
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setCompilerLang(lang.id as any)}
                        className={`btn-glass ${compilerLang === lang.id ? 'btn-neon' : ''}`}
                        style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsCompilerFullscreen(!isCompilerFullscreen)}
                    className="btn-glass"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderColor: isCompilerFullscreen ? 'var(--neon-primary)' : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    {isCompilerFullscreen ? (
                      <>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
                        </svg>
                        Exit Fullscreen
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                        </svg>
                        Fullscreen
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div style={{
                borderRadius: isCompilerFullscreen ? '0' : '12px',
                overflow: 'hidden',
                border: isCompilerFullscreen ? 'none' : '1.5px solid var(--border-glass)',
                background: '#1a1b26',
                boxShadow: isCompilerFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.5)',
                flex: 1,
                height: isCompilerFullscreen ? 'calc(100vh - 120px)' : '650px'
              }}>
                <iframe
                  src={`https://onecompiler.com/embed/${compilerLang === 'cpp' ? 'cpp' : compilerLang === 'csharp' ? 'csharp' : compilerLang}?theme=dark&hideLanguageSelection=true&hideNew=true`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 'none', display: 'block' }}
                  title="Code Compiler"
                />
              </div>
            </div>
          )}

          {/* TAB 4: FOCUS & WORKSPACE TOOLS */}
          {activeTab === 'tools' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Pomodoro Timer & Notepad Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                
                {/* 1. Pomodoro Focus Timer */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '340px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#ff0055', fontFamily: 'monospace', alignSelf: 'flex-start', marginBottom: '1rem' }}>
                    CYBER_POMODORO
                  </span>
                  
                  {/* Timer Progress Circle */}
                  <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <svg width="150" height="150" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
                      {/* Gray track */}
                      <circle cx="75" cy="75" r="65" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                      {/* Colored dash */}
                      <circle
                        cx="75"
                        cy="75"
                        r="65"
                        stroke="#ff0055"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray="408.4"
                        strokeDashoffset={408.4 - (408.4 * (pomodoroTime / (pomodoroMode === 'focus' ? 1500 : pomodoroMode === 'short' ? 300 : 900)))}
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                      />
                    </svg>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                      <span style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'monospace' }}>
                        {Math.floor(pomodoroTime / 60).toString().padStart(2, '0')}:
                        {(pomodoroTime % 60).toString().padStart(2, '0')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'monospace', marginTop: '2px' }}>
                        {pomodoroMode}
                      </span>
                    </div>
                  </div>

                  {/* Mode Buttons */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
                    <button
                      onClick={() => switchPomodoroMode('focus')}
                      className={`btn-glass ${pomodoroMode === 'focus' ? 'btn-neon' : ''}`}
                      style={{ padding: '6px 12px', fontSize: '0.7rem', borderRadius: '6px' }}
                    >
                      Focus
                    </button>
                    <button
                      onClick={() => switchPomodoroMode('short')}
                      className={`btn-glass ${pomodoroMode === 'short' ? 'btn-neon' : ''}`}
                      style={{ padding: '6px 12px', fontSize: '0.7rem', borderRadius: '6px' }}
                    >
                      Short Break
                    </button>
                    <button
                      onClick={() => switchPomodoroMode('long')}
                      className={`btn-glass ${pomodoroMode === 'long' ? 'btn-neon' : ''}`}
                      style={{ padding: '6px 12px', fontSize: '0.7rem', borderRadius: '6px' }}
                    >
                      Long Break
                    </button>
                  </div>

                  {/* Playback control */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setPomodoroActive(!pomodoroActive)}
                      className="btn-neon"
                      style={{ padding: '8px 20px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #ff0055 0%, #bd00ff 100%)', boxShadow: '0 4px 10px rgba(255,0,85,0.2)' }}
                    >
                      {pomodoroActive ? 'Pause' : 'Start'}
                    </button>
                    <button
                      onClick={() => {
                        setPomodoroActive(false);
                        switchPomodoroMode(pomodoroMode);
                      }}
                      className="btn-glass"
                      style={{ padding: '8px 20px', fontSize: '0.8rem' }}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* 2. Client-side Autosaving Notepad */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '340px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#00ff87', fontFamily: 'monospace' }}>
                      LOCAL_STUDY_NOTEBOOK
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      ● Auto-saved to LocalStorage
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <button
                      onClick={() => setNotepadTab('edit')}
                      className={`btn-glass ${notepadTab === 'edit' ? 'btn-neon' : ''}`}
                      style={{ padding: '5px 10px', fontSize: '0.7rem', borderRadius: '4px' }}
                    >
                      Write Note
                    </button>
                    <button
                      onClick={() => setNotepadTab('preview')}
                      className={`btn-glass ${notepadTab === 'preview' ? 'btn-neon' : ''}`}
                      style={{ padding: '5px 10px', fontSize: '0.7rem', borderRadius: '4px' }}
                    >
                      Markdown Preview
                    </button>
                  </div>

                  {notepadTab === 'edit' ? (
                    <textarea
                      value={notepadText}
                      onChange={(e) => handleNotepadChange(e.target.value)}
                      placeholder="Use Markdown symbols: # Header, ## Header, - list, **bold**, `code`..."
                      style={{
                        flex: 1,
                        width: '100%',
                        background: '#0d0e15',
                        color: '#a0aec0',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        padding: '12px',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '8px',
                        outline: 'none',
                        resize: 'none'
                      }}
                    />
                  ) : (
                    <div
                      dangerouslySetInnerHTML={renderMarkdown(notepadText)}
                      style={{
                        flex: 1,
                        background: '#0d0e15',
                        padding: '12px',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '8px',
                        overflowY: 'auto',
                        fontSize: '0.85rem',
                        lineHeight: '1.6',
                        color: 'var(--text-primary)'
                      }}
                    />
                  )}
                </div>

              </div>

              {/* 3D Revision Flashcards Section */}
              <div className="glass-panel">
                <span style={{ fontSize: '0.8rem', color: '#00f2fe', fontFamily: 'monospace', display: 'block', marginBottom: '1.25rem' }}>
                  3D_REVISION_FLASHCARDS
                </span>

                {/* Flip Cards List */}
                <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                  {flashcards.map((card, idx) => {
                    const isFlipped = flippedCardIdx === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setFlippedCardIdx(isFlipped ? null : idx)}
                        className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                      >
                        <div className="flashcard-inner">
                          <div className="flashcard-front">
                            <div>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Question
                              </p>
                              <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{card.q}</p>
                              <span style={{ display: 'block', marginTop: '15px', fontSize: '0.75rem', color: 'var(--neon-primary)', fontWeight: 'bold' }}>
                                Tap to reveal answers →
                              </span>
                            </div>
                          </div>
                          <div className="flashcard-back">
                            <div>
                              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Verified Concept
                              </p>
                              <p style={{ fontSize: '0.92rem', lineHeight: '1.4' }}>{card.a}</p>
                              <span style={{ display: 'block', marginTop: '15px', fontSize: '0.75rem', color: '#ffd000' }}>
                                Tap to flip back
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Flashcard creation Form */}
                <div style={{ borderTop: '1px dashed var(--border-glass)', paddingTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Compile Custom Flashcard</h4>
                  <form onSubmit={handleAddFlashcard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '240px' }}>
                        <input
                          type="text"
                          required
                          placeholder="Study Question (e.g. What is closure?)"
                          className="glass-input"
                          value={newFlashcardQ}
                          onChange={(e) => setNewFlashcardQ(e.target.value)}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: '240px' }}>
                        <input
                          type="text"
                          required
                          placeholder="Concept Details (e.g. A closure lets a nested function access outer scope variables.)"
                          className="glass-input"
                          value={newFlashcardA}
                          onChange={(e) => setNewFlashcardA(e.target.value)}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-neon" style={{ alignSelf: 'flex-end', padding: '8px 20px', fontSize: '0.8rem' }}>
                      Add to Shelf
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: ACHIEVEMENTS BADGE SHELF */}
          {activeTab === 'achievements' && (
            <div className="glass-panel">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'monospace', color: '#00f2fe' }}>
                Achievement Shelf
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                Unlocked dynamically through study portal telemetry metrics
              </p>

              <div className="dashboard-grid">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="glass-panel"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      opacity: badge.unlocked ? 1 : 0.45,
                      filter: badge.unlocked ? 'none' : 'grayscale(100%)',
                      border: badge.unlocked ? `1px solid ${badge.color}` : '1px solid var(--border-glass)',
                      boxShadow: badge.unlocked ? `0 8px 25px rgba(${badge.id === 'transmitter' ? '0,242,254' : badge.id === 'master' ? '0,255,135' : badge.id === 'gladiator' ? '255,208,0' : badge.id === 'code_warrior' ? '189,0,255' : badge.id === 'pomodoro' ? '255,0,85' : '0,82,255'}, 0.15)` : 'none',
                      transition: '0.4s'
                    }}
                  >
                    {/* Badge Icon */}
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: badge.unlocked ? `${badge.color}15` : 'rgba(255,255,255,0.02)',
                      color: badge.unlocked ? badge.color : 'var(--text-muted)',
                      border: badge.unlocked ? `1.5px solid ${badge.color}35` : '1.5px solid var(--border-glass)'
                    }}>
                      {badge.icon}
                    </div>

                    {/* Badge Details */}
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: badge.unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {badge.title}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {badge.description}
                      </p>
                      <span style={{
                        display: 'inline-block',
                        marginTop: '8px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        color: badge.unlocked ? '#00ff87' : '#ff0055',
                        fontFamily: 'monospace'
                      }}>
                        {badge.unlocked ? '● UNLOCKED' : '○ LOCKED'}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

        </section>

      </div>

      {/* FULLSCREEN SECURE QUIZ TAKING OVERLAY */}
      {activeQuiz && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'var(--bg-dark)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          {quizResult ? (
            // POST-EXAM GRADE REPORT
            <div className="glass-panel" style={{
              maxWidth: '560px',
              width: '100%',
              textAlign: 'center',
              boxShadow: 'var(--card-shadow)',
              border: quizResult.isCheated ? '2px solid var(--neon-red)' : '2px solid var(--neon-green)',
              animation: 'zoomIn 0.3s ease'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'block', marginBottom: '0.5rem' }}>
                SUBMISSION_VERIFIED
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                {activeQuiz.title} Complete!
              </h2>

              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
                marginBottom: '1.5rem'
              }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Total Points Earned:</p>
                <h3 style={{ fontSize: '2.5rem', color: quizResult.isCheated ? 'var(--neon-red)' : 'var(--neon-green)', margin: '10px 0' }}>
                  {quizResult.score} / {quizResult.totalPoints}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Grade Rate: {quizResult.totalPoints > 0 ? Math.round((quizResult.score / quizResult.totalPoints) * 100) : 0}%
                </p>
              </div>

              {quizResult.isCheated && (
                <div style={{
                  background: 'rgba(255, 0, 85, 0.1)',
                  border: '1px solid rgba(255, 0, 85, 0.2)',
                  color: '#ff0055',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '1.5rem'
                }}>
                  <strong>Red-Flagged Alert:</strong> Tab switches exceeded warnings threshold limit (warnings: {tabSwitchCount}). This score was flagged to your trainer dashboard.
                </div>
              )}

              <button
                onClick={() => {
                  setActiveQuiz(null);
                  setQuizResult(null);
                  fetchActiveQuizzes();
                }}
                className="btn-neon"
                style={{ width: '100%' }}
              >
                Return to Workspace Hub
              </button>
            </div>
          ) : (
            // ACTIVE SECURE EXAM PANEL
            <div
              className="glass-panel"
              onCopy={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                maxWidth: '720px',
                width: '100%',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                boxShadow: 'var(--card-shadow)',
                border: '1px solid var(--border-glass-hover)'
              }}
            >
              {/* Exam Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-glass)',
                paddingBottom: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--neon-secondary)', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    SECURE_EXAM_ENVIRONMENT
                  </span>
                  <h3 style={{ fontSize: '1.25rem', margin: '4px 0 0' }}>{activeQuiz.title}</h3>
                </div>
                
                {/* Timer Clock */}
                <div style={{
                  background: timeRemaining <= 60 ? 'rgba(255,0,85,0.1)' : 'rgba(0,242,254,0.08)',
                  border: `1.5px solid ${timeRemaining <= 60 ? '#ff0055' : 'var(--neon-primary)'}`,
                  color: timeRemaining <= 60 ? '#ff0055' : '#00f2fe',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  boxShadow: timeRemaining <= 60 ? 'var(--glow-red)' : 'none'
                }}>
                  {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:
                  {(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
              </div>

              {/* Progress indicator */}
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{
                  width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--neon-primary) 0%, var(--neon-secondary) 100%)',
                  transition: 'width 0.3s ease'
                }} />
              </div>

              {/* Question text */}
              <div style={{ minHeight: '180px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '8px' }}>
                  <span>QUESTION_ID: 0{currentQuestionIdx + 1}</span>
                  <span>POINTS: {activeQuiz.questions[currentQuestionIdx].points}</span>
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 500, lineHeight: 1.5, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                  {activeQuiz.questions[currentQuestionIdx].questionText}
                </h4>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activeQuiz.questions[currentQuestionIdx].options.map((opt, oIdx) => {
                    const isSelected = quizAnswers[currentQuestionIdx] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => {
                          const updated = [...quizAnswers];
                          updated[currentQuestionIdx] = oIdx;
                          setQuizAnswers(updated);
                        }}
                        className="btn-glass"
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          justifyContent: 'flex-start',
                          padding: '12px 18px',
                          border: isSelected ? '1.5px solid var(--border-glass-hover)' : '1px solid var(--border-glass)',
                          background: isSelected ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255,255,255,0.02)',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        <span style={{
                          display: 'inline-flex',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: isSelected ? '2px solid var(--neon-primary)' : '2.5px solid var(--border-glass)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          background: isSelected ? 'var(--neon-primary)' : 'transparent',
                          color: isSelected ? '#020208' : 'var(--text-muted)'
                        }}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation & Telemetry footer */}
              <div style={{
                borderTop: '1px solid var(--border-glass)',
                paddingTop: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <span style={{
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  color: tabSwitchCount > 0 ? '#ff0055' : 'var(--text-muted)'
                }}>
                  ● Cheat Telemetry Warnings: {tabSwitchCount} / 3
                </span>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                    className="btn-glass"
                    style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                  >
                    Previous
                  </button>

                  {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                      className="btn-glass"
                      style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={() => submitQuizAttempt()}
                      disabled={isSubmittingQuiz}
                      className="btn-neon"
                      style={{ padding: '8px 20px', fontSize: '0.8rem', background: 'linear-gradient(135deg, var(--neon-green) 0%, var(--neon-blue) 100%)' }}
                    >
                      {isSubmittingQuiz ? 'Submitting...' : 'Submit Exam'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
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

      {/* Floating Chatbot assistant */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 90 }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff87', boxShadow: 'var(--glow-green)' }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Study Assistant</h4>
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

            <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="glass-input"
                style={{ padding: '10px 14px', fontSize: '0.85rem' }}
                placeholder="Ask a study question..."
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
            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>&times;</span>
          ) : (
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
        
        /* Workspace layout styles */
        .workspace-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 2rem;
          align-items: start;
        }
        
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        
        .sidebar-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          color: var(--text-secondary);
          font-family: var(--font-mono);
          font-size: 0.85rem;
          cursor: pointer;
          text-align: left;
          transition: all 0.3s ease;
          width: 100%;
        }
        
        .sidebar-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: var(--border-glass-hover);
          color: var(--text-primary);
          transform: translateX(4px);
        }
        
        .sidebar-btn.active {
          background: linear-gradient(135deg, var(--neon-primary) 0%, var(--neon-blue) 100%);
          color: #fff;
          border-color: transparent;
          box-shadow: var(--glow-primary);
        }
        
        /* 3D Flashcard flip styling */
        .flashcard {
          perspective: 1000px;
          width: 100%;
          height: 180px;
          cursor: pointer;
        }
        
        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        
        .flashcard.flipped .flashcard-inner {
          transform: rotateY(180deg);
        }
        
        .flashcard-front, .flashcard-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid var(--border-glass);
          box-shadow: var(--card-shadow);
        }
        
        .flashcard-front {
          background: var(--bg-glass);
          color: var(--text-primary);
        }
        
        .flashcard-back {
          background: rgba(0, 242, 254, 0.06);
          color: var(--neon-primary);
          transform: rotateY(180deg);
          border-color: var(--border-glass-hover);
        }
        
        @media (max-width: 992px) {
          .playground-split {
            flex-direction: column !important;
          }
        }
        
        @media (max-width: 768px) {
          .workspace-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .sidebar-nav {
            flex-direction: row;
            flex-wrap: wrap;
          }
          
          .sidebar-btn {
            width: auto;
            flex: 1;
            min-width: 120px;
            justify-content: center;
          }
          
          .sidebar-btn:hover {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </main>
  );
}
