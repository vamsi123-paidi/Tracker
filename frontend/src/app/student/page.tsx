'use client';

import { useState, useEffect, useRef, memo } from 'react';
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

// Stable, memoized Compiler Tab Panel to prevent reloading/cancelling code execution on parent re-renders (like Pomodoro timer updates)
const CompilerTabPanel = memo(({ lang, isFullscreen, onLangChange, onFullscreenToggle }: {
  lang: 'c' | 'cpp' | 'python' | 'java' | 'javascript' | 'go' | 'rust' | 'csharp' | 'php';
  isFullscreen: boolean;
  onLangChange: (lang: any) => void;
  onFullscreenToggle: () => void;
}) => {
  return (
    <div 
      className={isFullscreen ? "" : "glass-panel"} 
      style={isFullscreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: '#050508',
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
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontFamily: 'monospace' }}>ONLINE_CODE_COMPILER</span>
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
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => onLangChange(l.id as any)}
                className={`btn-glass ${lang === l.id ? 'btn-neon' : ''}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
              >
                {l.name}
              </button>
            ))}
          </div>

          <button
            onClick={onFullscreenToggle}
            className="btn-glass"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderColor: isFullscreen ? 'var(--neon-primary)' : 'rgba(255,255,255,0.1)'
            }}
          >
            {isFullscreen ? (
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
        borderRadius: isFullscreen ? '0' : '12px',
        overflow: 'hidden',
        border: isFullscreen ? 'none' : '1.5px solid var(--border-glass)',
        background: '#1a1b26',
        boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.5)',
        flex: 1,
        height: isFullscreen ? 'calc(100vh - 120px)' : '650px'
      }}>
        <iframe
          src={`https://onecompiler.com/embed/${lang === 'cpp' ? 'cpp' : lang === 'csharp' ? 'csharp' : lang}?theme=dark&hideLanguageSelection=true&hideNew=true`}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 'none', display: 'block' }}
          title="Code Compiler"
        />
      </div>
    </div>
  );
}, (prevProps, nextProps) => prevProps.lang === nextProps.lang && prevProps.isFullscreen === nextProps.isFullscreen);
CompilerTabPanel.displayName = 'CompilerTabPanel';

// Cybernetic Telemetry Loading Overlay
const QuantumLoader: React.FC<{ message?: string }> = ({ message }) => {
  const [logIndex, setLogIndex] = useState(0);
  const telemetryLogs = [
    'INITIALIZING SECURE PROTOCOLS...',
    'ESTABLISHING HANDSHAKE WITH VERIFIER CORES...',
    'COMPILING DEPLOYED BINDINGS AND DEPENDENCY SCHEMAS...',
    'EVALUATING DOM & FUNCTIONAL SYNTAX TREE...',
    'COMPUTING COMPLEXITY SCORES AND TELEMETRY TELEPORT...',
    'TRANSMITTING ENCRYPTED BYTE ARRAYS TO API DATABASE...',
    'CALIBRATING PORTAL RANKS & COMPLETED MILESTONES...',
    'INTEGRATING LEDGER INDEX UPDATES...',
    'FINISHING DATA TRANSCEIVER HANDSHAKE...',
    'SYNC COMPLETE. REDIRECTING...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev < telemetryLogs.length - 1 ? prev + 1 : prev));
    }, 550);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(2, 2, 7, 0.93)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: '2rem'
    }}>
      {/* Dynamic 3D Concentric Ring Spinner */}
      <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' }}>
        {/* Outer clockwise circle */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '3px dashed var(--neon-primary)',
          animation: 'rotateCW 10s linear infinite',
          boxShadow: 'inset 0 0 15px rgba(245, 158, 11, 0.1)',
          opacity: 0.8
        }} />
        
        {/* Middle counter-clockwise circle */}
        <div style={{
          position: 'absolute',
          width: '80%',
          height: '80%',
          borderRadius: '50%',
          border: '2px dotted var(--neon-secondary)',
          animation: 'rotateCCW 6s linear infinite',
          boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)',
          opacity: 0.7
        }} />

        {/* Inner clockwise circle */}
        <div style={{
          position: 'absolute',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          border: '3px double var(--neon-blue)',
          animation: 'rotateCW 3s linear infinite',
          boxShadow: 'inset 0 0 10px rgba(255, 107, 53, 0.2)',
          opacity: 0.6
        }} />

        {/* Pulsing Core */}
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--neon-primary) 0%, var(--neon-secondary) 100%)',
          boxShadow: 'var(--glow-primary)',
          animation: 'pulseScale 1.5s ease-in-out infinite'
        }} />

        {/* Scanning laser line overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, transparent, var(--neon-green), transparent)',
          boxShadow: 'var(--glow-green)',
          opacity: 0.7,
          animation: 'scanVertically 3.5s ease-in-out infinite',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Upload Telemetry Message */}
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#fff',
        letterSpacing: '1px',
        marginBottom: '0.75rem',
        fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.2)'
      }}>
        {message || 'SYNCING WITH SECURE DATABASE'}
      </h3>

      {/* Terminal Readout Logs */}
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(0, 0, 0, 0.4)',
        borderColor: 'var(--border-glass)',
        padding: '1rem 1.25rem',
        borderRadius: '10px',
        fontFamily: 'monospace',
        fontSize: '0.8rem',
        lineHeight: '1.5',
        color: 'var(--text-muted)'
      }}>
        <div style={{ color: 'var(--neon-green)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
          <span>🛰️ CORE_NODE_STATUS</span>
          <span style={{ animation: 'pulseScale 1s infinite' }}>ONLINE</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {telemetryLogs.slice(0, logIndex + 1).map((log, idx) => (
            <div key={idx} style={{
              color: idx === logIndex ? 'var(--neon-primary)' : 'var(--text-muted)',
              display: 'flex',
              gap: '6px',
              textShadow: idx === logIndex ? '0 0 6px rgba(245, 158, 11, 0.3)' : 'none'
            }}>
              <span>&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MERN_QUESTIONS: any[] = [];

const mernProjects = [
  {
    id: 'proj-sru',
    title: 'SRU (Student Resource Unit)',
    description: 'Core Student Resource Unit repository containing academic tools and frameworks.',
    cloneUrl: 'https://github.com/vamsi123-paidi/SRU.git',
    githubUrl: 'https://github.com/vamsi123-paidi/SRU',
    tags: ['SRU', 'Academic', 'Framework', 'Portal']
  },
  {
    id: 'proj-1',
    title: 'MERN Full-Stack Starter Template',
    description: 'Complete baseline setup integrating Express REST controller directories, Mongoose schemas, and a React (Vite) frontend with proxy configurations.',
    cloneUrl: 'https://github.com/vamsi123-paidi/mern-starter-template.git',
    githubUrl: 'https://github.com/vamsi123-paidi/mern-starter-template',
    tags: ['Vite', 'Express', 'Mongoose', 'Tailwind']
  },
  {
    id: 'proj-2',
    title: 'Secure Authentication Boilerplate',
    description: 'Starter project preconfigured with JSON Web Token (JWT) authorization, HTTP-Only cookie session storage, Bcrypt hashing, and React login guards.',
    cloneUrl: 'https://github.com/vamsi123-paidi/mern-auth-kit.git',
    githubUrl: 'https://github.com/vamsi123-paidi/mern-auth-kit',
    tags: ['JWT', 'Cookies', 'Bcrypt', 'React Router']
  },
  {
    id: 'proj-3',
    title: 'Node REST API & Validation Boilerplate',
    description: 'Express microservice template pre-seeded with Morgan logging, CORS config, express-validator schemas, and error-handling middleware.',
    cloneUrl: 'https://github.com/vamsi123-paidi/node-api-boilerplate.git',
    githubUrl: 'https://github.com/vamsi123-paidi/node-api-boilerplate',
    tags: ['Express-Validator', 'CORS', 'Morgan', 'REST']
  }
];

const flattenResources = (items: any[]): any[] => {
  let list: any[] = [];
  if (!items) return list;
  items.forEach((item: any) => {
    if (item.type === 'folder') {
      if (item.children) {
        list = list.concat(flattenResources(item.children));
      }
    } else {
      list.push(item);
    }
  });
  return list;
};

const getFileMeta = (file: any) => {
  const pathParts = file.path.split('/');
  let category = 'General Study';
  if (pathParts.length > 0) {
    const parent = pathParts[0].toLowerCase();
    if (parent === 'mongodb') category = 'MongoDB Database';
    else if (parent === 'backend') category = 'Express & Node.js';
    else if (parent === 'frontend') {
      if (file.path.toLowerCase().includes('html and css') || file.path.toLowerCase().includes('html notes') || file.path.toLowerCase().includes('css notes')) {
        category = 'HTML & CSS Design';
      } else {
        category = 'JavaScript & React';
      }
    }
    else if (parent === 'bonus') category = 'MERN Case Studies';
  }
  
  // Pretty name: remove leading numbers, capitalize, remove extensions
  const cleanBase = file.name
    .replace(/^\d+-/, '') // remove leading numbers
    .replace(/\.txt$|\.pdf$|\.rar$|\.docx$/gi, ''); // remove extension
  
  // Format readable name
  let displayName = cleanBase
    .replace(/([A-Z])/g, ' $1') // split camelCase
    .trim();
  
  // Clean up display name typos or abbreviations
  displayName = displayName
    .replace(/Kwywordinjs/gi, 'Keyword in JS')
    .replace(/callapplybind/gi, 'Call, Apply, Bind')
    .replace(/clouser/gi, 'Closure')
    .replace(/deepcopy/gi, 'Deep Copy')
    .replace(/localstorageandsessionstorage/gi, 'LocalStorage & SessionStorage')
    .replace(/reactintro/gi, 'React Introduction')
    .replace(/redux_complete/gi, 'Redux Complete Guide')
    .replace(/spreadrest/gi, 'Spread & Rest Operator')
    .replace(/uptouseRef/gi, 'Usage of useRef')
    .replace(/advencedpart/gi, 'Advanced Part')
    .replace(/agrregations/gi, 'Aggregations')
    .replace(/FirebaseAuth/gi, 'Firebase Auth Guide');

  return { category, displayName };
};

export default function StudentDashboard() {
  const router = useRouter();
  
  // Auth & Student Details
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentProfileImage, setStudentProfileImage] = useState('');
  const [studentCollege, setStudentCollege] = useState<College | null>(null);
  
  // Sidebar tab control
  const [activeTab, setActiveTab] = useState<'milestones' | 'quizzes' | 'playground' | 'compiler' | 'assessments' | 'tools' | 'achievements' | 'mern'>('milestones');
  const [mernTab, setMernTab] = useState<'questions' | 'notes' | 'projects'>('questions');
  const [mernSearchQuery, setMernSearchQuery] = useState('');
  const [mernCategoryFilter, setMernCategoryFilter] = useState('All');
  const [expandedMernQ, setExpandedMernQ] = useState<string | null>(null);
  const [userGuesses, setUserGuesses] = useState<{ [key: string]: string }>({});
  const [aiVerifications, setAiVerifications] = useState<{ [key: string]: string }>({});
  const [revealAnswers, setRevealAnswers] = useState<{ [key: string]: boolean }>({});
  const [isVerifyingIndex, setIsVerifyingIndex] = useState<{ [key: string]: boolean }>({});
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // MERN Resources file tree
  const [mernResources, setMernResources] = useState<{ notes: any[], interviewFiles: any[] } | null>(null);
  const [mernQuestions, setMernQuestions] = useState<any[]>([]);
  const [selectedMernNote, setSelectedMernNote] = useState<any | null>(null);
  const [selectedMernNoteContent, setSelectedMernNoteContent] = useState<string>('');
  const [isLoadingMernContent, setIsLoadingMernContent] = useState(false);

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
  const [playgroundCss, setPlaygroundCss] = useState(`/* Write your CSS here */\nbody {\n  background: #030305;\n  color: #fff;\n  font-family: sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  margin: 0;\n}\n.card {\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  padding: 30px;\n  border-radius: 16px;\n  text-align: center;\n  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);\n  backdrop-filter: blur(10px);\n}\nh2 {\n  color: #f59e0b;\n  margin-top: 0;\n  text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);\n}\nbutton {\n  background: linear-gradient(135deg, #f59e0b 0%, #10b981 100%);\n  color: white;\n  border: none;\n  padding: 10px 20px;\n  border-radius: 8px;\n  cursor: pointer;\n  font-weight: bold;\n  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);\n  transition: 0.3s;\n}\nbutton:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);\n}`);
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

  // Assessments States
  const [assessmentsList, setAssessmentsList] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [assessmentHtml, setAssessmentHtml] = useState('');
  const [assessmentCss, setAssessmentCss] = useState('');
  const [assessmentJs, setAssessmentJs] = useState('');
  const [assessmentActiveEditor, setAssessmentActiveEditor] = useState<'html' | 'css' | 'js'>('html');
  const [assessmentTestResults, setAssessmentTestResults] = useState<{ description: string, passed: boolean, run: boolean }[]>([]);
  const [leaderboardList, setLeaderboardList] = useState<any[]>([]);
  const [isAssessmentsLoading, setIsAssessmentsLoading] = useState(false);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [assessmentCompletedCount, setAssessmentCompletedCount] = useState(0);
  const [assessmentTotalPoints, setAssessmentTotalPoints] = useState(0);
  const [assessmentTab, setAssessmentTab] = useState<'challenges' | 'leaderboard'>('challenges');
  const [assessmentSearchQuery, setAssessmentSearchQuery] = useState('');
  const [isAssessmentFullscreen, setIsAssessmentFullscreen] = useState(false);
  const [assessmentLayout, setAssessmentLayout] = useState<'tabs' | 'split'>('tabs');

  // Quiz Results / Details States
  const [myQuizResults, setMyQuizResults] = useState<any[]>([]);
  const [quizSubTab, setQuizSubTab] = useState<'available' | 'results'>('available');
  const [selectedQuizResult, setSelectedQuizResult] = useState<any | null>(null);
  const [isQuizResultsLoading, setIsQuizResultsLoading] = useState(false);

  // Advanced Notes Workspace States
  const [studyNotes, setStudyNotes] = useState<any[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [noteCategoryFilter, setNoteCategoryFilter] = useState('All');

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
          fetchAssessments();
          fetchLeaderboard();
        }
      })
      .catch(() => router.push('/login'));

    // Client-side localstorage initializers
    if (typeof window !== 'undefined') {
      // Load notepad
      const savedNotes = localStorage.getItem('holotrack_notes');
      setNotepadText(savedNotes || '# My Study Notes\n\n- Write programming structures here...\n- Autosaves locally without backend DB storage!');
      
      // Load multi-note workspace
      const savedNotesStr = localStorage.getItem('tasktrack_study_notes');
      if (savedNotesStr) {
        try {
          const parsed = JSON.parse(savedNotesStr);
          setStudyNotes(parsed);
          if (parsed.length > 0) {
            setActiveNoteId(parsed[0].id);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        const defaultNotes = [
          {
            id: 'default-1',
            title: 'Class Lecture Notes',
            content: '# Class Lecture Notes\n\nUse this space to write definitions, questions, and concepts discussed in class.\n\n## 💡 Key Definitions\n\n> **HTML**: HyperText Markup Language, the standard markup language for documents designed to be displayed in a web browser.\n\n## ❓ Important Q&As\n\n### ❓ What is the difference between let and var?\n\n**Answer**: `let` has block scope while `var` has function scope.\n\n## 💻 Snippets\n\n```js\nconst greet = () => console.log("Hello, Class!");\n```',
            updatedAt: new Date().toLocaleString()
          }
        ];
        localStorage.setItem('tasktrack_study_notes', JSON.stringify(defaultNotes));
        setStudyNotes(defaultNotes);
        setActiveNoteId('default-1');
      }
      
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

  const fetchQuizResults = async () => {
    setIsQuizResultsLoading(true);
    try {
      const data = await api.get('/quizzes/my-results');
      setMyQuizResults(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsQuizResultsLoading(false);
    }
  };

  const handleCreateNote = () => {
    const newNote = {
      id: 'note-' + Date.now(),
      title: 'New Class Note',
      content: '# New Lecture\n\n- Write definitions and Q&As here...',
      updatedAt: new Date().toLocaleString()
    };
    const updated = [newNote, ...studyNotes];
    setStudyNotes(updated);
    setActiveNoteId(newNote.id);
    localStorage.setItem('tasktrack_study_notes', JSON.stringify(updated));
  };

  const handleUpdateNoteContent = (content: string) => {
    if (!activeNoteId) return;
    const updated = studyNotes.map(n => {
      if (n.id === activeNoteId) {
        return { ...n, content, updatedAt: new Date().toLocaleString() };
      }
      return n;
    });
    setStudyNotes(updated);
    localStorage.setItem('tasktrack_study_notes', JSON.stringify(updated));
  };

  const handleUpdateNoteTitle = (title: string) => {
    if (!activeNoteId) return;
    const updated = studyNotes.map(n => {
      if (n.id === activeNoteId) {
        return { ...n, title, updatedAt: new Date().toLocaleString() };
      }
      return n;
    });
    setStudyNotes(updated);
    localStorage.setItem('tasktrack_study_notes', JSON.stringify(updated));
  };

  const handleDeleteNote = (id: string, e: any) => {
    e.stopPropagation();
    const updated = studyNotes.filter(n => n.id !== id);
    setStudyNotes(updated);
    localStorage.setItem('tasktrack_study_notes', JSON.stringify(updated));
    if (activeNoteId === id) {
      setActiveNoteId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleDownloadNote = () => {
    const activeNote = studyNotes.find(n => n.id === activeNoteId);
    if (!activeNote) return;
    const element = document.createElement("a");
    const file = new Blob([activeNote.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeNote.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const insertTemplate = (type: 'definition' | 'question' | 'code' | 'list') => {
    const activeNote = studyNotes.find(n => n.id === activeNoteId);
    if (!activeNote) return;
    
    let templateText = '';
    if (type === 'definition') {
      templateText = '\n\n> 💡 **Definition**: [Term] - [Description]\n';
    } else if (type === 'question') {
      templateText = '\n\n### ❓ Question: [Topic]?\n**Answer**: \n';
    } else if (type === 'code') {
      templateText = '\n\n```javascript\n// Code snippet\n\n```\n';
    } else if (type === 'list') {
      templateText = '\n\n- Key Point 1\n- Key Point 2\n';
    }

    const newContent = activeNote.content + templateText;
    handleUpdateNoteContent(newContent);
  };

  const fetchAssessments = async () => {
    setIsAssessmentsLoading(true);
    try {
      const data = await api.get('/assessments');
      setAssessmentsList(data);
      const solved = data.filter((a: any) => a.solvedStatus === 'solved');
      setAssessmentCompletedCount(solved.length);
      const points = solved.reduce((sum: number, a: any) => sum + a.points, 0);
      setAssessmentTotalPoints(points);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch assessments');
    } finally {
      setIsAssessmentsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setIsLeaderboardLoading(true);
    try {
      const data = await api.get('/assessments/leaderboard');
      setLeaderboardList(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch leaderboard');
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  const handleSelectAssessment = (assessment: any) => {
    setSelectedAssessment(assessment);
    setAssessmentHtml(assessment.templateHtml || '');
    setAssessmentCss(assessment.templateCss || '');
    setAssessmentJs(assessment.templateJs || '');
    setAssessmentActiveEditor(assessment.type === 'html' ? 'html' : (assessment.type === 'css' ? 'css' : 'js'));
    setAssessmentTestResults(assessment.testCases.map((tc: any) => ({ description: tc.description, passed: false, run: false })));
  };

  const executeTestCases = async () => {
    if (!selectedAssessment) return;
    setErrorMsg('');
    setSuccessMsg('');
    
    // Create temporary iframe for browser evaluation
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Prepare combined HTML+CSS+JS document
    const srcDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${assessmentCss}</style>
        </head>
        <body>
          ${assessmentHtml}
          <script>
            try {
              ${assessmentJs}
            } catch(e) {
              window.__jsExecutionError = e.message;
            }
          </script>
        </body>
      </html>
    `;

    iframe.srcdoc = srcDoc;

    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
    });

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    const win = iframe.contentWindow;

    if (!doc || !win) {
      document.body.removeChild(iframe);
      setErrorMsg('Failed to initialize execution sandbox');
      return;
    }

    const results = selectedAssessment.testCases.map((tc: any) => {
      let passed = false;
      try {
        (win as any).doc = doc;
        let evalResult;
        try {
          evalResult = (win as any).eval(tc.assertCode);
        } catch {
          const evaluator = new Function('doc', 'win', `
            try {
              with (win) {
                return (${tc.assertCode});
              }
            } catch(e) {
              return false;
            }
          `);
          evalResult = evaluator(doc, win);
        }
        passed = !!evalResult;
      } catch (err) {
        passed = false;
      }
      return {
        description: tc.description,
        passed,
        run: true
      };
    });

    setAssessmentTestResults(results);
    document.body.removeChild(iframe);
    
    const passedAll = results.every((r: any) => r.passed);
    if (passedAll) {
      setSuccessMsg('All test cases passed! You can now submit your solution to claim your points.');
    } else {
      setErrorMsg('Some test cases failed. Please inspect your code structure or logic and try again.');
    }
  };

  const handleAssessmentSubmit = async () => {
    if (!selectedAssessment) return;
    
    setIsSubmittingAssessment(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Execute tests client-side first
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const srcDoc = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>${assessmentCss}</style>
          </head>
          <body>
            ${assessmentHtml}
            <script>${assessmentJs}</script>
          </body>
        </html>
      `;
      iframe.srcdoc = srcDoc;

      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
      });

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      const win = iframe.contentWindow;

      if (!doc || !win) {
        document.body.removeChild(iframe);
        throw new Error('Sandbox error');
      }

      const passedAll = selectedAssessment.testCases.every((tc: any) => {
        try {
          (win as any).doc = doc;
          let evalResult;
          try {
            evalResult = (win as any).eval(tc.assertCode);
          } catch {
            const evaluator = new Function('doc', 'win', `
              try {
                with (win) {
                  return (${tc.assertCode});
                }
              } catch(e) {
                return false;
              }
            `);
            evalResult = evaluator(doc, win);
          }
          return !!evalResult;
        } catch {
          return false;
        }
      });

      document.body.removeChild(iframe);

      if (!passedAll) {
        throw new Error('You must pass all test cases before submitting.');
      }

      // Submit to backend
      await api.post(`/assessments/${selectedAssessment._id}/submit`, {
        codeHtml: assessmentHtml,
        codeCss: assessmentCss,
        codeJs: assessmentJs,
        scoreGained: selectedAssessment.points,
        passedAll: true
      });

      setSuccessMsg(`Congratulations! Solved "${selectedAssessment.title}" and gained +${selectedAssessment.points} points.`);
      setSelectedAssessment(null);
      fetchAssessments();
      fetchLeaderboard();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit solution.');
    } finally {
      setIsSubmittingAssessment(false);
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

  const fetchMernResources = async () => {
    try {
      const [resourcesData, questionsData] = await Promise.all([
        api.get('/mern/resources'),
        api.get('/mern/questions')
      ]);
      setMernResources(resourcesData);
      setMernQuestions(questionsData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load MERN resources');
    }
  };

  const handleSelectMernNote = async (noteItem: any) => {
    setSelectedMernNote(noteItem);
    setSelectedMernNoteContent('');
    if (noteItem.type !== 'txt') return;

    setIsLoadingMernContent(true);
    try {
      const data = await api.get(`/mern/notes/content?filePath=${encodeURIComponent(noteItem.path)}`);
      setSelectedMernNoteContent(data.content);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to retrieve note content');
    } finally {
      setIsLoadingMernContent(false);
    }
  };

  const handleDownloadMernFile = (noteItem: any, folder: 'notes' | 'interview') => {
    const token = getAuthToken();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const downloadUrl = `${apiUrl}/mern/download?filePath=${encodeURIComponent(noteItem.path)}&folder=${folder}&token=${token}`;
    
    // Open in a new tab or trigger direct download
    window.open(downloadUrl, '_blank');
    setSuccessMsg(`Initiating download for "${noteItem.name}"...`);
  };

  const handleImportMernNoteToNotepad = (title: string, content: string) => {
    const newNote = {
      id: 'note-' + Date.now(),
      title: title.replace('.txt', ''),
      content: content,
      updatedAt: new Date().toLocaleString()
    };
    const updated = [newNote, ...studyNotes];
    setStudyNotes(updated);
    setActiveNoteId(newNote.id);
    localStorage.setItem('tasktrack_study_notes', JSON.stringify(updated));
    setActiveTab('tools'); // Switch to Notepad tab
    setSuccessMsg(`"${newNote.title}" imported successfully to your local Make a Note workspace!`);
  };

  const handleVerifyMernAnswerWithAi = async (qId: string, question: string, standard: string) => {
    const guess = userGuesses[qId];
    if (!guess || guess.trim() === '') {
      setErrorMsg('Please type your guess before verifying.');
      return;
    }

    setIsVerifyingIndex(prev => ({ ...prev, [qId]: true }));
    setAiVerifications(prev => ({ ...prev, [qId]: '' }));

    try {
      const res = await api.post('/mern/verify-answer', {
        question,
        userAnswer: guess,
        standardAnswer: standard
      });
      setAiVerifications(prev => ({ ...prev, [qId]: res.reply }));
    } catch (err: any) {
      console.error(err);
      setAiVerifications(prev => ({ ...prev, [qId]: `Error: ${err.message || 'Failed to verify with AI.'}` }));
    } finally {
      setIsVerifyingIndex(prev => ({ ...prev, [qId]: false }));
    }
  };

  const handleCopyTextToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
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
            container.style.background = 'rgba(245, 158, 11, 0.95)';
            container.style.color = '#020208';
            container.style.fontWeight = 'bold';
            container.style.borderRadius = '8px';
            container.style.boxShadow = '0 0 15px rgba(245, 158, 11, 0.5)';
            container.style.fontFamily = 'sans-serif';
            container.style.zIndex = '9999';
            container.textContent = 'Sandbox Alert: ' + msg;
            document.body.appendChild(container);
            setTimeout(() => container.remove(), 3000);
          };
          
          try {
            ${playgroundJs}
          } catch(err) {
            document.body.innerHTML += '<div style="color: #ef4444; font-family: monospace; padding: 10px; border: 1px dashed #ef4444; margin-top: 15px;">JS Error: ' + err.message + '</div>';
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
    html = html.replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px; font-family:monospace; color:#10b981;">$1</code>');
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
      color: '#f59e0b'
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
      color: '#10b981'
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
      color: '#ef4444'
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
      color: '#ec4899'
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
          <span style={{ fontFamily: 'monospace', color: '#10b981', fontSize: '0.9rem' }}>STUDENT_TERMINAL</span>
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
          color: '#ef4444',
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

      {/* Sleek Top Horizontal Navigation Bar */}
      <nav className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '0.65rem',
        background: 'rgba(5, 5, 8, 0.4)',
        border: '1px solid var(--border-glass)',
        borderRadius: '16px'
      }}>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`sidebar-btn ${activeTab === 'milestones' ? 'active' : ''}`}
          style={{ width: 'auto', flex: '1', minWidth: '120px', justifyContent: 'center' }}
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
            fetchQuizResults();
          }}
          className={`sidebar-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
          style={{ width: 'auto', flex: '1', minWidth: '120px', justifyContent: 'center' }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Quiz Hub
        </button>

        <button
          onClick={() => setActiveTab('playground')}
          className={`sidebar-btn ${activeTab === 'playground' ? 'active' : ''}`}
          style={{ width: 'auto', flex: '1', minWidth: '120px', justifyContent: 'center' }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          Playground
        </button>

        <button
          onClick={() => setActiveTab('compiler')}
          className={`sidebar-btn ${activeTab === 'compiler' ? 'active' : ''}`}
          style={{ width: 'auto', flex: '1', minWidth: '120px', justifyContent: 'center' }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M6 10l3 2-3 2" />
            <line x1="11" y1="14" x2="15" y2="14" />
          </svg>
          Compiler
        </button>

        <button
          onClick={() => {
            setActiveTab('assessments');
            fetchAssessments();
            fetchLeaderboard();
          }}
          className={`sidebar-btn ${activeTab === 'assessments' ? 'active' : ''}`}
          style={{ width: 'auto', flex: '1', minWidth: '120px', justifyContent: 'center' }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Assessments
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`sidebar-btn ${activeTab === 'tools' ? 'active' : ''}`}
          style={{ width: 'auto', flex: '1', minWidth: '120px', justifyContent: 'center' }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Make a Note
        </button>

        <button
          onClick={() => {
            setActiveTab('mern');
            fetchMernResources();
          }}
          className={`sidebar-btn ${activeTab === 'mern' ? 'active' : ''}`}
          style={{ width: 'auto', flex: '1', minWidth: '120px', justifyContent: 'center' }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          MERN Hub
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`sidebar-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          style={{ width: 'auto', flex: '1', minWidth: '120px', justifyContent: 'center' }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
          Badge Shelf
        </button>
      </nav>

      {/* Main Workspace Layout (stretched 100% width) */}
      <div className="workspace-layout">
        <section className="workspace-content" style={{ width: '100%' }}>
          
          {/* TAB 1: MILESTONES (Tasks Listing & Stats) */}
          {activeTab === 'milestones' && (
            <div>
              {/* Stats Counters */}
              <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                <div className="glass-panel">
                  <p style={{ color: '#a0aec0', fontSize: '0.85rem', fontFamily: 'monospace' }}>ASSIGNED_TASKS</p>
                  <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: 'var(--neon-primary)' }}>{totalTasks}</h3>
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
                  <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: '#ef4444' }}>{rejectedCount}</h3>
                </div>
              </div>

              {/* Tasks List */}
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'monospace', color: 'var(--neon-secondary)' }}>
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
                            <strong style={{ color: isRejected ? '#ef4444' : '#00ff87', display: 'block', marginBottom: '2px' }}>
                              Trainer feedback:
                            </strong>
                            {task.submission.feedback}
                          </div>
                        )}

                        {!isApproved && (
                          <div style={{
                            marginTop: '1rem',
                            fontSize: '0.85rem',
                            color: 'var(--neon-secondary)',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-secondary)', margin: 0 }}>
                    SECURE_QUIZ_HUB
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                    Take college-deployed examinations and review completed results details.
                  </p>
                </div>
              </div>

              {/* Sub tab navigation */}
              <div style={{
                display: 'inline-flex',
                background: 'rgba(10, 10, 15, 0.6)',
                border: '1px solid var(--border-glass)',
                padding: '5px',
                borderRadius: '30px',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.4)',
                gap: '5px',
                width: 'fit-content'
              }}>
                <button
                  onClick={() => setQuizSubTab('available')}
                  style={{
                    padding: '10px 24px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    borderRadius: '25px',
                    background: quizSubTab === 'available' 
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(255, 107, 53, 0.15) 100%)' 
                      : 'transparent',
                    border: quizSubTab === 'available'
                      ? '1px solid rgba(245, 158, 11, 0.4)'
                      : '1px solid transparent',
                    color: quizSubTab === 'available' ? 'var(--neon-primary)' : 'var(--text-secondary)',
                    textShadow: quizSubTab === 'available' ? '0 0 10px rgba(245, 158, 11, 0.5)' : 'none',
                    boxShadow: quizSubTab === 'available' ? '0 0 15px rgba(245, 158, 11, 0.15)' : 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  📝 Available Quizzes
                </button>
                <button
                  onClick={() => {
                    setQuizSubTab('results');
                    fetchQuizResults();
                  }}
                  style={{
                    padding: '10px 24px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    borderRadius: '25px',
                    background: quizSubTab === 'results' 
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(255, 107, 53, 0.15) 100%)' 
                      : 'transparent',
                    border: quizSubTab === 'results'
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : '1px solid transparent',
                    color: quizSubTab === 'results' ? 'var(--neon-secondary)' : 'var(--text-secondary)',
                    textShadow: quizSubTab === 'results' ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none',
                    boxShadow: quizSubTab === 'results' ? '0 0 15px rgba(16, 185, 129, 0.15)' : 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  📊 Performance Results
                </button>
              </div>

              {quizSubTab === 'available' ? (
                /* Available Quizzes Tab */
                isLoadingQuizzes ? (
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
                          borderLeft: quiz.isCompleted ? '4px solid var(--neon-green)' : '4px solid var(--neon-primary)',
                          background: 'rgba(10, 10, 15, 0.45)',
                          borderColor: quiz.isCompleted ? 'rgba(0, 255, 135, 0.25)' : 'var(--border-glass)'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#718096', fontFamily: 'var(--font-mono)' }}>
                              LIMIT: {quiz.durationMinutes} MINS
                            </span>
                            <span className={`badge ${quiz.isCompleted ? 'badge-approved' : 'badge-pending'}`}>
                              {quiz.isCompleted ? 'COMPLETED' : 'PENDING'}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>{quiz.title}</h4>
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
                )
              ) : (
                /* Past Quiz Results Tab */
                isQuizResultsLoading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Retrieving exam submissions history...
                  </div>
                ) : myQuizResults.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#718096' }}>
                    No completed quiz attempts recorded in this portal.
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="glass-table">
                      <thead>
                        <tr>
                          <th>Exam / Quiz Title</th>
                          <th style={{ textAlign: 'center' }}>Score Obtained</th>
                          <th style={{ textAlign: 'center' }}>Accuracy Rate</th>
                          <th style={{ textAlign: 'center' }}>Anti-Cheat Telemetry</th>
                          <th style={{ textAlign: 'center' }}>Time Taken</th>
                          <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myQuizResults.map((resultItem) => {
                          const quizData = resultItem.quiz || { title: 'Unknown Exam', questions: [] };
                          const accuracy = Math.round((resultItem.score / resultItem.totalPoints) * 100);
                          const minutes = Math.floor(resultItem.timeTakenSeconds / 60);
                          const seconds = resultItem.timeTakenSeconds % 60;
                          
                          return (
                            <tr key={resultItem._id} className="leaderboard-row">
                              <td>
                                <strong style={{ color: '#fff' }}>{quizData.title}</strong>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  Submitted: {new Date(resultItem.submittedAt).toLocaleString()}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                {resultItem.score} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>/ {resultItem.totalPoints}</span>
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 700, color: accuracy >= 70 ? 'var(--neon-green)' : accuracy >= 40 ? 'var(--neon-yellow)' : 'var(--neon-red)' }}>
                                {accuracy}%
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {resultItem.isCheated ? (
                                  <span className="badge badge-rejected" style={{ fontSize: '0.7rem' }}>
                                    ⚠️ Flagged ({resultItem.tabSwitchCount} tab switches)
                                  </span>
                                ) : (
                                  <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                                    🛡️ Secure Passed
                                  </span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                                {minutes}m {seconds}s
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  onClick={() => setSelectedQuizResult(resultItem)}
                                  className="btn-glass"
                                  style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                                >
                                  🔍 Review Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* Quiz Answers Review Modal Overlay */}
              {selectedQuizResult && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'var(--modal-overlay)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 99999,
                  padding: '1.5rem'
                }}>
                  <div className="glass-panel" style={{
                    width: '100%',
                    maxWidth: '800px',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(5, 5, 8, 0.95)',
                    border: '1.5px solid var(--border-glass-hover)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
                  }}>
                    {/* Modal Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#10b981', fontFamily: 'var(--font-mono)', letterSpacing: '1px', textTransform: 'uppercase' }}>EXAM_SUBMISSION_DETAILS</span>
                        <h4 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '4px 0 0', color: '#fff' }}>
                          {selectedQuizResult.quiz?.title || 'Quiz Review'}
                        </h4>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Score: <strong style={{ color: 'var(--neon-primary)' }}>{selectedQuizResult.score}/{selectedQuizResult.totalPoints} points</strong>
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>|</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Time taken: <strong>{Math.floor(selectedQuizResult.timeTakenSeconds / 60)}m {selectedQuizResult.timeTakenSeconds % 60}s</strong>
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>|</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Anti-cheat Status: {selectedQuizResult.isCheated ? (
                              <strong style={{ color: 'var(--neon-red)' }}>Flagged ({selectedQuizResult.tabSwitchCount} Switches)</strong>
                            ) : (
                              <strong style={{ color: 'var(--neon-green)' }}>🛡️ Passed</strong>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setSelectedQuizResult(null)}
                        className="theme-toggle"
                        style={{ border: 'none', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '1rem', width: '32px', height: '32px' }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Scrollable Questions list */}
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingRight: '6px' }}>
                      {selectedQuizResult.quiz?.questions ? (
                        selectedQuizResult.quiz.questions.map((q: any, qIdx: number) => {
                          const studentAnswerIdx = selectedQuizResult.answers[qIdx];
                          const isCorrect = studentAnswerIdx === q.correctOptionIndex;
                          
                          return (
                            <div key={qIdx} style={{
                              padding: '1.2rem',
                              border: '1px solid var(--border-glass)',
                              borderRadius: '12px',
                              background: 'rgba(10, 10, 15, 0.4)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}>
                              <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#fff', lineHeight: '1.5' }}>
                                {qIdx + 1}. {q.questionText}
                                <span style={{ 
                                  marginLeft: '10px',
                                  fontSize: '0.7rem', 
                                  color: isCorrect ? 'var(--neon-green)' : 'var(--neon-red)',
                                  background: isCorrect ? 'rgba(0, 255, 135, 0.05)' : 'rgba(255, 0, 85, 0.05)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  border: isCorrect ? '1px solid rgba(0, 255, 135, 0.2)' : '1px solid rgba(255, 0, 85, 0.2)'
                                }}>
                                  {isCorrect ? 'Correct (+'+q.points+' pts)' : 'Incorrect (0/'+q.points+' pts)'}
                                </span>
                              </h5>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '4px' }}>
                                {q.options.map((opt: string, optIdx: number) => {
                                  let badgeStyle: any = {
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.2s'
                                  };
                                  let label = '';
                                  
                                  if (optIdx === q.correctOptionIndex) {
                                    // Correct answer
                                    badgeStyle.background = 'rgba(0, 255, 135, 0.06)';
                                    badgeStyle.border = '1px solid rgba(0, 255, 135, 0.35)';
                                    badgeStyle.color = 'var(--neon-green)';
                                    label = '✓ Correct Answer';
                                  } else if (optIdx === studentAnswerIdx && !isCorrect) {
                                    // Student chose wrong option
                                    badgeStyle.background = 'rgba(255, 0, 85, 0.06)';
                                    badgeStyle.border = '1px solid rgba(255, 0, 85, 0.35)';
                                    badgeStyle.color = 'var(--neon-red)';
                                    label = '✗ Your Selection';
                                  } else {
                                    // Normal option
                                    badgeStyle.background = 'rgba(255, 255, 255, 0.01)';
                                    badgeStyle.border = '1px solid var(--border-glass)';
                                    badgeStyle.color = 'var(--text-secondary)';
                                  }

                                  return (
                                    <div key={optIdx} style={badgeStyle}>
                                      <span>
                                        <strong style={{ opacity: 0.6, marginRight: '8px' }}>
                                          {optIdx === 0 ? 'A' : optIdx === 1 ? 'B' : optIdx === 2 ? 'C' : 'D'}.
                                        </strong>
                                        {opt}
                                      </span>
                                      {label && (
                                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                          {label}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No questions data found.</div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
                      <button onClick={() => setSelectedQuizResult(null)} className="btn-glass" style={{ padding: '8px 24px', fontSize: '0.85rem' }}>
                        Close Review
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: CODE PLAYGROUND */}
          {activeTab === 'playground' && (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontFamily: 'monospace', color: 'var(--neon-secondary)', margin: 0 }}>
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
                    background: '#050508',
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
            <CompilerTabPanel
              lang={compilerLang}
              isFullscreen={isCompilerFullscreen}
              onLangChange={setCompilerLang}
              onFullscreenToggle={() => setIsCompilerFullscreen(!isCompilerFullscreen)}
            />
          )}

          {/* TAB: ASSESSMENTS */}
          {activeTab === 'assessments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Assessments Header & Overall Stats */}
              <div className="glass-panel" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem',
                padding: '1.5rem 2rem',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.03) 100%)',
                borderColor: 'var(--border-glass-hover)'
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px', letterSpacing: '1px' }}>CODE_CHALLENGE_WORKSPACE</span>
                  <h3 style={{ fontSize: '1.65rem', fontWeight: 700, margin: 0, color: '#fff' }}>Coding Assessments</h3>
                  <p style={{ color: '#a0aec0', fontSize: '0.9rem', margin: '6px 0 0', lineHeight: '1.5' }}>Complete sandboxed coding tasks, earn points, and climb the leaderboard.</p>
                </div>
                
                {/* Stats */}
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div className="assessment-stats-card total-score">
                    <span style={{ fontSize: '0.75rem', color: '#a0aec0', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>TOTAL_SCORE</span>
                    <h4 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '6px 0 0', color: 'var(--neon-secondary)', textShadow: 'var(--glow-secondary)' }}>
                      {assessmentTotalPoints} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}>pts</span>
                    </h4>
                  </div>
                  <div className="assessment-stats-card completed">
                    <span style={{ fontSize: '0.75rem', color: '#a0aec0', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>COMPLETED</span>
                    <h4 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '6px 0 0', color: '#00ff87', textShadow: '0 0 12px rgba(0, 255, 135, 0.5)' }}>
                      {assessmentCompletedCount} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ {assessmentsList.length}</span>
                    </h4>
                  </div>
                </div>
              </div>

              {/* Assessment Sub-Navigation */}
              <div style={{
                display: 'inline-flex',
                background: 'rgba(10, 10, 15, 0.6)',
                border: '1px solid var(--border-glass)',
                padding: '5px',
                borderRadius: '30px',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.4)',
                gap: '5px',
                width: 'fit-content'
              }}>
                <button
                  onClick={() => setAssessmentTab('challenges')}
                  style={{
                    padding: '10px 28px',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)',
                    borderRadius: '25px',
                    background: assessmentTab === 'challenges' 
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(255, 107, 53, 0.15) 100%)' 
                      : 'transparent',
                    border: assessmentTab === 'challenges'
                      ? '1px solid rgba(245, 158, 11, 0.4)'
                      : '1px solid transparent',
                    color: assessmentTab === 'challenges' ? 'var(--neon-primary)' : 'var(--text-secondary)',
                    textShadow: assessmentTab === 'challenges' ? '0 0 10px rgba(245, 158, 11, 0.5)' : 'none',
                    boxShadow: assessmentTab === 'challenges' ? '0 0 15px rgba(245, 158, 11, 0.15)' : 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  🎯 Challenges
                </button>
                <button
                  onClick={() => {
                    setAssessmentTab('leaderboard');
                    fetchLeaderboard();
                  }}
                  style={{
                    padding: '10px 28px',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)',
                    borderRadius: '25px',
                    background: assessmentTab === 'leaderboard' 
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(255, 107, 53, 0.15) 100%)' 
                      : 'transparent',
                    border: assessmentTab === 'leaderboard'
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : '1px solid transparent',
                    color: assessmentTab === 'leaderboard' ? 'var(--neon-secondary)' : 'var(--text-secondary)',
                    textShadow: assessmentTab === 'leaderboard' ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none',
                    boxShadow: assessmentTab === 'leaderboard' ? '0 0 15px rgba(16, 185, 129, 0.15)' : 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  🏆 Leaderboard
                </button>
              </div>

              {isAssessmentsLoading && assessmentsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#a0aec0' }}>
                  Loading assessments database...
                </div>
              ) : assessmentTab === 'challenges' ? (
                /* Challenges Grid Workspace */
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isAssessmentFullscreen ? '1fr' : '340px 1fr',
                  gap: isAssessmentFullscreen ? '0' : '2rem',
                  alignItems: 'stretch'
                }}>
                  
                  {/* Left Column: Challenges List & Search */}
                  {!isAssessmentFullscreen && (
                    <div className="glass-panel" style={{
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                      height: '680px',
                      background: 'rgba(10, 10, 15, 0.45)',
                      backdropFilter: 'blur(20px)',
                      borderColor: 'var(--border-glass-hover)'
                    }}>
                    {/* Search bar */}
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="glass-input"
                        style={{
                          padding: '12px 16px 12px 42px',
                          fontSize: '0.85rem',
                          width: '100%',
                          background: 'rgba(10, 10, 15, 0.4)',
                          borderColor: 'var(--border-glass)',
                          borderRadius: '12px',
                          color: '#fff',
                          outline: 'none',
                          transition: 'all 0.3s ease'
                        }}
                        placeholder="Search challenges..."
                        value={assessmentSearchQuery}
                        onChange={(e) => setAssessmentSearchQuery(e.target.value)}
                      />
                      <svg
                        style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                        width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    
                    {/* List */}
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
                      {assessmentsList
                        .filter(a => a.title.toLowerCase().includes(assessmentSearchQuery.toLowerCase()))
                        .map((a) => {
                          const isSelected = selectedAssessment?._id === a._id;
                          const isSolved = a.solvedStatus === 'solved';

                          let difficultyColor = 'var(--neon-green)';
                          let difficultyBorder = 'rgba(0, 255, 135, 0.25)';
                          let difficultyBg = 'rgba(0, 255, 135, 0.05)';
                          if (a.difficulty === 'medium') {
                            difficultyColor = 'var(--neon-yellow)';
                            difficultyBorder = 'rgba(255, 208, 0, 0.25)';
                            difficultyBg = 'rgba(255, 208, 0, 0.05)';
                          } else if (a.difficulty === 'hard') {
                            difficultyColor = 'var(--neon-red)';
                            difficultyBorder = 'rgba(255, 0, 85, 0.25)';
                            difficultyBg = 'rgba(255, 0, 85, 0.05)';
                          }

                          return (
                            <div
                              key={a._id}
                              onClick={() => handleSelectAssessment(a)}
                              className={`challenge-item-card ${isSelected ? 'selected' : ''} ${isSolved ? 'solved' : ''}`}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                  fontSize: '0.9rem',
                                  fontWeight: 600,
                                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                                  textOverflow: 'ellipsis',
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '180px'
                                }}>
                                  {a.title}
                                </span>
                                {isSolved && (
                                  <span style={{
                                    fontSize: '0.65rem',
                                    color: 'var(--neon-green)',
                                    fontWeight: 'bold',
                                    background: 'rgba(0, 255, 135, 0.05)',
                                    padding: '3px 10px',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(0, 255, 135, 0.25)',
                                    fontFamily: 'var(--font-mono)'
                                  }}>
                                    ✓ Solved
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ 
                                  fontSize: '0.65rem', 
                                  padding: '3px 10px', 
                                  borderRadius: '20px', 
                                  background: difficultyBg, 
                                  border: `1px solid ${difficultyBorder}`,
                                  color: difficultyColor, 
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 700, 
                                  textTransform: 'uppercase', 
                                  letterSpacing: '0.5px' 
                                }}>
                                  {a.difficulty}
                                </span>
                                <span style={{ 
                                  fontSize: '0.65rem', 
                                  padding: '3px 10px', 
                                  borderRadius: '20px', 
                                  background: 'rgba(245, 158, 11, 0.05)', 
                                  border: '1px solid rgba(245, 158, 11, 0.25)',
                                  color: 'var(--neon-primary)', 
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 700 
                                }}>
                                  +{a.points} pts
                                </span>
                                <span style={{ 
                                  fontSize: '0.65rem', 
                                  padding: '3px 10px', 
                                  borderRadius: '20px', 
                                  background: 'rgba(255,255,255,0.02)', 
                                  border: '1px solid var(--border-glass)',
                                  color: 'var(--text-muted)', 
                                  fontFamily: 'var(--font-mono)', 
                                  fontWeight: 600 
                                }}>
                                  {a.type.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      {assessmentsList.filter(a => a.title.toLowerCase().includes(assessmentSearchQuery.toLowerCase())).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#718096', fontSize: '0.85rem' }}>
                          No matching challenges.
                        </div>
                      )}
                    </div>
                  </div>
                  )}

                  {/* Right Column: Code Editor Workspace */}
                  <div className={isAssessmentFullscreen ? "" : "glass-panel"} style={isAssessmentFullscreen ? {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 9999,
                    background: '#0a0b12',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  } : {
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    height: '680px',
                    background: 'rgba(10, 10, 15, 0.45)',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'var(--border-glass-hover)'
                  }}>
                    {!selectedAssessment ? (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#718096', gap: '15px', textAlign: 'center' }}>
                        <div style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '50%',
                          background: 'rgba(16, 185, 129, 0.05)',
                          border: '1.5px dashed var(--neon-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--neon-primary)',
                          boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)',
                          animation: 'pulse 2s infinite'
                        }}>
                          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="16 18 22 12 16 6" />
                            <polyline points="8 6 2 12 8 18" />
                          </svg>
                        </div>
                        <div>
                          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Workspace Empty</h4>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Select a challenge from the left to load the code environment.</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: 0 }}>
                        {/* Title & Description Card */}
                        <div style={{
                          background: 'rgba(10, 10, 15, 0.4)',
                          border: '1px solid var(--border-glass)',
                          borderLeft: '4px solid var(--neon-primary)',
                          padding: '16px 20px',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>{selectedAssessment.title}</h4>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              color: 'var(--neon-secondary)', 
                              background: 'rgba(245, 158, 11, 0.05)', 
                              border: '1px solid rgba(245, 158, 11, 0.25)', 
                              padding: '4px 12px', 
                              borderRadius: '20px', 
                              fontWeight: 600,
                              fontFamily: 'var(--font-mono)'
                            }}>
                              Value: +{selectedAssessment.points} points
                            </span>
                          </div>
                          <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            lineHeight: '1.65',
                            whiteSpace: 'pre-line',
                            margin: '12px 0 0 0',
                            fontFamily: 'var(--font-sans)'
                          }}>
                            {selectedAssessment.description}
                          </p>
                        </div>

                        {/* Editor Tabs & Workspace */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                          
                          {/* VSCode-style Tab bar */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#0a0b12',
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px',
                            border: '1px solid var(--border-glass)',
                            borderBottom: 'none',
                            padding: '0 8px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              {assessmentLayout === 'tabs' ? (
                                <div style={{ display: 'flex', gap: '2px' }}>
                                  {[
                                    { id: 'html', file: 'index.html', color: '#e34f26' },
                                    { id: 'css', file: 'styles.css', color: 'var(--neon-primary)' },
                                    { id: 'js', file: 'app.js', color: '#ffd000' }
                                  ].map(t => {
                                    const isActive = assessmentActiveEditor === t.id;
                                    return (
                                      <button
                                        key={t.id}
                                        onClick={() => setAssessmentActiveEditor(t.id as any)}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          padding: '12px 20px',
                                          fontSize: '0.8rem',
                                          fontFamily: 'var(--font-mono)',
                                          border: 'none',
                                          background: isActive ? '#14151f' : 'transparent',
                                          color: isActive ? '#fff' : 'var(--text-muted)',
                                          fontWeight: isActive ? 600 : 400,
                                          cursor: 'pointer',
                                          borderTopLeftRadius: '8px',
                                          borderTopRightRadius: '8px',
                                          borderBottom: isActive ? `2px solid ${t.color}` : '2px solid transparent',
                                          transition: '0.2s'
                                        }}
                                      >
                                        <span style={{ color: t.color, fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
                                          ●
                                        </span>
                                        {t.file}
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', paddingLeft: '8px', fontWeight: 600 }}>
                                  🥞 Split IDE Workspace
                                </span>
                              )}

                              <button
                                onClick={() => setAssessmentLayout(prev => prev === 'tabs' ? 'split' : 'tabs')}
                                className="btn-glass"
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.7rem',
                                  borderRadius: '4px',
                                  fontFamily: 'var(--font-mono)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  background: 'rgba(255,255,255,0.02)'
                                }}
                              >
                                {assessmentLayout === 'tabs' ? '🥞 Split View' : '🗂️ Tabbed View'}
                              </button>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', paddingRight: '12px', letterSpacing: '0.5px' }}>
                                {selectedAssessment.type.toUpperCase()}_WORKSPACE
                              </span>

                              <button
                                onClick={() => setIsAssessmentFullscreen(!isAssessmentFullscreen)}
                                className="btn-glass"
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.7rem',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  borderColor: isAssessmentFullscreen ? 'var(--neon-primary)' : 'rgba(255,255,255,0.1)'
                                }}
                              >
                                {isAssessmentFullscreen ? (
                                  <>
                                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
                                    </svg>
                                    Exit Zen
                                  </>
                                ) : (
                                  <>
                                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                                    </svg>
                                    Zen Mode
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {assessmentLayout === 'tabs' ? (
                            <div style={{
                              flex: 1,
                              borderBottomLeftRadius: '12px',
                              borderBottomRightRadius: '12px',
                              overflow: 'hidden',
                              border: '1px solid var(--border-glass)',
                              borderTop: 'none',
                              background: '#14151f',
                              minHeight: 0
                            }}>
                              <Editor
                                height={isAssessmentFullscreen ? "calc(100vh - 340px)" : "350px"}
                                language={assessmentActiveEditor === 'js' ? 'javascript' : assessmentActiveEditor}
                                theme={editorTheme}
                                value={
                                  assessmentActiveEditor === 'html' ? assessmentHtml :
                                  assessmentActiveEditor === 'css' ? assessmentCss :
                                  assessmentJs
                                }
                                onChange={(val) => {
                                  const newVal = val || '';
                                  if (assessmentActiveEditor === 'html') setAssessmentHtml(newVal);
                                  else if (assessmentActiveEditor === 'css') setAssessmentCss(newVal);
                                  else setAssessmentJs(newVal);
                                }}
                                options={{
                                  minimap: { enabled: false },
                                  fontSize: 13,
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
                          ) : (
                            <div style={{
                              flex: 1,
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, 1fr)',
                              gap: '10px',
                              minHeight: 0
                            }}>
                              <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-glass)', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', overflow: 'hidden', background: '#14151f' }}>
                                <div style={{ background: '#0a0b12', padding: '6px 12px', borderBottom: '1px solid var(--border-glass)', color: '#e34f26', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                  index.html
                                </div>
                                <div style={{ flex: 1 }}>
                                  <Editor
                                    height={isAssessmentFullscreen ? "calc(100vh - 370px)" : "320px"}
                                    language="html"
                                    theme={editorTheme}
                                    value={assessmentHtml}
                                    onChange={(val) => setAssessmentHtml(val || '')}
                                    options={{
                                      minimap: { enabled: false },
                                      fontSize: 12,
                                      fontFamily: 'Consolas, "Courier New", monospace',
                                      tabSize: 2,
                                      automaticLayout: true,
                                      lineNumbers: 'on',
                                      autoClosingBrackets: 'always',
                                      scrollbar: { vertical: 'visible', horizontal: 'visible' }
                                    }}
                                  />
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-glass)', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', overflow: 'hidden', background: '#14151f' }}>
                                <div style={{ background: '#0a0b12', padding: '6px 12px', borderBottom: '1px solid var(--border-glass)', color: 'var(--neon-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                  styles.css
                                </div>
                                <div style={{ flex: 1 }}>
                                  <Editor
                                    height={isAssessmentFullscreen ? "calc(100vh - 370px)" : "320px"}
                                    language="css"
                                    theme={editorTheme}
                                    value={assessmentCss}
                                    onChange={(val) => setAssessmentCss(val || '')}
                                    options={{
                                      minimap: { enabled: false },
                                      fontSize: 12,
                                      fontFamily: 'Consolas, "Courier New", monospace',
                                      tabSize: 2,
                                      automaticLayout: true,
                                      lineNumbers: 'on',
                                      autoClosingBrackets: 'always',
                                      scrollbar: { vertical: 'visible', horizontal: 'visible' }
                                    }}
                                  />
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-glass)', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', overflow: 'hidden', background: '#14151f' }}>
                                <div style={{ background: '#0a0b12', padding: '6px 12px', borderBottom: '1px solid var(--border-glass)', color: '#ffd000', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                  app.js
                                </div>
                                <div style={{ flex: 1 }}>
                                  <Editor
                                    height={isAssessmentFullscreen ? "calc(100vh - 370px)" : "320px"}
                                    language="javascript"
                                    theme={editorTheme}
                                    value={assessmentJs}
                                    onChange={(val) => setAssessmentJs(val || '')}
                                    options={{
                                      minimap: { enabled: false },
                                      fontSize: 12,
                                      fontFamily: 'Consolas, "Courier New", monospace',
                                      tabSize: 2,
                                      automaticLayout: true,
                                      lineNumbers: 'on',
                                      autoClosingBrackets: 'always',
                                      scrollbar: { vertical: 'visible', horizontal: 'visible' }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Test Cases Run & Action Controls */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '1px solid var(--border-glass)',
                          paddingTop: '1.25rem',
                          flexWrap: 'wrap',
                          gap: '1.5rem'
                        }}>
                          
                          {/* Test Checklist status pills */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '240px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#a0aec0', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>VERIFICATION_CHECKLIST:</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {assessmentTestResults.map((tc, idx) => {
                                let pillBg = 'rgba(10, 10, 15, 0.4)';
                                let pillBorder = 'var(--border-glass)';
                                let pillColor = 'var(--text-secondary)';
                                let icon = '⚡';
                                let textGlow = 'none';
                                
                                if (tc.run) {
                                  if (tc.passed) {
                                    pillBg = 'rgba(0, 255, 135, 0.03)';
                                    pillBorder = 'rgba(0, 255, 135, 0.3)';
                                    pillColor = 'var(--neon-green)';
                                    icon = '✓';
                                    textGlow = '0 0 8px rgba(0, 255, 135, 0.4)';
                                  } else {
                                    pillBg = 'rgba(255, 0, 85, 0.03)';
                                    pillBorder = 'rgba(255, 0, 85, 0.3)';
                                    pillColor = 'var(--neon-red)';
                                    icon = '✗';
                                    textGlow = '0 0 8px rgba(255, 0, 85, 0.4)';
                                  }
                                }

                                return (
                                  <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '0.8rem',
                                    background: pillBg,
                                    border: '1px solid',
                                    borderColor: pillBorder,
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    color: pillColor,
                                    textShadow: textGlow,
                                    fontFamily: 'var(--font-mono)',
                                    transition: 'all 0.2s ease'
                                  }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{icon}</span>
                                    <span>{tc.description}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Trigger Buttons */}
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button
                              onClick={executeTestCases}
                              className="btn-glass btn-run"
                              style={{
                                padding: '12px 24px',
                                fontSize: '0.85rem',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontFamily: 'var(--font-mono)',
                                gap: '6px'
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                              Run Tests
                            </button>
                            <button
                              onClick={handleAssessmentSubmit}
                              disabled={isSubmittingAssessment || assessmentTestResults.length === 0 || !assessmentTestResults.every(r => r.passed)}
                              className="btn-neon btn-transmit"
                              style={{
                                padding: '12px 26px',
                                fontSize: '0.85rem',
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontFamily: 'var(--font-mono)',
                                background: (assessmentTestResults.length > 0 && assessmentTestResults.every(r => r.passed))
                                  ? 'linear-gradient(135deg, var(--neon-green) 0%, var(--neon-blue) 100%)'
                                  : 'rgba(255,255,255,0.03)',
                                border: (assessmentTestResults.length > 0 && assessmentTestResults.every(r => r.passed))
                                  ? 'none'
                                  : '1px solid var(--border-glass)',
                                color: (assessmentTestResults.length > 0 && assessmentTestResults.every(r => r.passed))
                                  ? '#03030b'
                                  : 'var(--text-muted)',
                                boxShadow: (assessmentTestResults.length > 0 && assessmentTestResults.every(r => r.passed)) ? '0 0 15px rgba(0, 255, 135, 0.4)' : 'none',
                                opacity: (assessmentTestResults.length > 0 && assessmentTestResults.every(r => r.passed)) ? 1 : 0.5,
                                cursor: (assessmentTestResults.length > 0 && assessmentTestResults.every(r => r.passed)) ? 'pointer' : 'not-allowed',
                                transition: 'all 0.3s ease',
                                gap: '8px'
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease' }}>
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                              </svg>
                              {isSubmittingAssessment ? 'Submitting...' : 'Submit Challenge'}
                            </button>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* Leaderboard Table Workspace */
                <div className="glass-panel" style={{
                  padding: '2rem',
                  background: 'rgba(10, 10, 15, 0.45)',
                  backdropFilter: 'blur(20px)',
                  borderColor: 'var(--border-glass-hover)'
                }}>
                  <div style={{ marginBottom: '2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>GLOBAL_SCOREBOARD</span>
                    <h4 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: '4px 0 0' }}>Performance Leaderboard</h4>
                  </div>
                  
                  {isLeaderboardLoading && leaderboardList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#a0aec0' }}>
                      Accessing server analytics...
                    </div>
                  ) : leaderboardList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                      No submissions recorded on the leaderboard. Be the first to solve a challenge!
                    </div>
                  ) : (
                    <div className="table-container" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                      <table className="glass-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
                            <th style={{ width: '90px', padding: '16px 20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rank</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Student</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>College Code</th>
                            <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Solved</th>
                            <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboardList.map((row, idx) => {
                            const isTop3 = idx < 3;
                            let rowBg = 'transparent';
                            let rankColor = 'var(--text-primary)';
                            let rankBadge = '';
                            let rankGlow = 'none';
                            
                            if (idx === 0) {
                              rowBg = 'rgba(255, 208, 0, 0.03)';
                              rankColor = '#ffd000';
                              rankBadge = '🥇';
                              rankGlow = '0 0 12px rgba(255, 208, 0, 0.6)';
                            } else if (idx === 1) {
                              rowBg = 'rgba(255, 255, 255, 0.015)';
                              rankColor = '#e2e8f0';
                              rankBadge = '🥈';
                              rankGlow = '0 0 12px rgba(226, 232, 240, 0.5)';
                            } else if (idx === 2) {
                              rowBg = 'rgba(184, 115, 51, 0.02)';
                              rankColor = '#cd7f32';
                              rankBadge = '🥉';
                              rankGlow = '0 0 12px rgba(205, 127, 50, 0.5)';
                            }

                            return (
                              <tr 
                                key={row._id} 
                                className="leaderboard-row"
                                style={{ 
                                  background: rowBg,
                                  borderBottom: '1px solid var(--border-glass)',
                                  transition: 'background 0.2s ease'
                                }}
                              >
                                <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '1rem', fontWeight: 800, color: rankColor, textShadow: rankGlow }}>
                                  {rankBadge ? `${rankBadge}` : idx + 1}
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{
                                      width: '34px',
                                      height: '34px',
                                      borderRadius: '50%',
                                      background: 'linear-gradient(135deg, var(--neon-primary) 0%, var(--neon-secondary) 100%)',
                                      color: '#fff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.8rem',
                                      fontWeight: 700,
                                      border: isTop3 ? `1.5px solid ${rankColor}` : '1.5px solid rgba(255,255,255,0.1)',
                                      boxShadow: isTop3 ? `0 0 10px ${rankColor}33` : 'none'
                                    }}>
                                      {row.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{row.name}</strong>
                                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{row.email}</span>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                  <span className="badge badge-not-submitted" style={{ 
                                    padding: '4px 10px', 
                                    fontSize: '0.75rem', 
                                    borderRadius: '6px',
                                    fontFamily: 'var(--font-mono)',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    borderColor: 'var(--border-glass)',
                                    color: 'var(--text-secondary)'
                                  }}>
                                    {row.collegeCode || 'GLBL'}
                                  </span>
                                </td>
                                <td style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                  {row.solvedCount}
                                </td>
                                <td style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 800, color: 'var(--neon-secondary)', fontSize: '0.95rem', fontFamily: 'var(--font-mono)', textShadow: '0 0 8px rgba(16, 185, 129, 0.3)' }}>
                                  {row.totalPoints} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>pts</span>
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

            </div>
          )}

          {/* TAB 4: MAKE A NOTE WORKSPACE */}
          {activeTab === 'tools' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', width: '100%', alignItems: 'stretch' }}>
              
              {/* Left Column: Client-side Study Notes Workspace */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', flex: '2 1 650px', minHeight: '640px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>📝</span>
                    <div>
                      <h3 style={{ fontSize: '0.9rem', color: '#00ff87', fontWeight: 600, margin: 0, fontFamily: 'monospace' }}>
                        CLASS_STUDY_NOTEBOOK
                      </h3>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>
                        Save important concepts, definitions, and code templates during lectures
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#00ff87', background: 'rgba(0, 255, 135, 0.1)', padding: '3px 8px', borderRadius: '12px', fontFamily: 'monospace' }}>
                    ● Auto-saved to LocalStorage
                  </span>
                </div>

                {/* Two Column Layout */}
                <div className="notes-workspace-layout">
                  {/* Left Sub-Sidebar: Notes list */}
                  <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderRight: '1px solid var(--border-glass)', paddingRight: '1rem', flexShrink: 0 }}>
                    
                    {/* Search Input */}
                    <input
                      type="text"
                      placeholder="🔍 Search notes..."
                      value={noteSearchQuery}
                      onChange={(e) => setNoteSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.2)',
                        color: '#fff',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.8rem',
                        outline: 'none'
                      }}
                    />

                    {/* + New Note Button */}
                    <button
                      onClick={handleCreateNote}
                      className="btn-neon btn-create"
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        background: 'linear-gradient(135deg, #00ff87 0%, #f59e0b 100%)',
                        color: '#030305',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 10px rgba(0, 255, 135, 0.2)'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease' }}>
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      New Note
                    </button>

                    {/* Notes List */}
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '480px' }}>
                      {studyNotes
                        .filter(note => note.title.toLowerCase().includes(noteSearchQuery.toLowerCase()))
                        .map((note) => {
                          const isActive = note.id === activeNoteId;
                          return (
                            <div
                              key={note.id}
                              onClick={() => setActiveNoteId(note.id)}
                              style={{
                                padding: '8px 10px',
                                borderRadius: '6px',
                                background: isActive ? 'rgba(0, 255, 135, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                border: `1px solid ${isActive ? '#00ff87' : 'var(--border-glass)'}`,
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                transition: 'all 0.2s ease',
                                position: 'relative'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isActive ? '#00ff87' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                                  {note.title}
                                </span>
                                <button
                                  onClick={(e) => handleDeleteNote(note.id, e)}
                                  title="Delete note"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255,255,255,0.3)',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'color 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                                >
                                  🗑️
                                </button>
                              </div>
                              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                                🕒 {note.updatedAt}
                              </span>
                            </div>
                          );
                        })}
                      {studyNotes.filter(note => note.title.toLowerCase().includes(noteSearchQuery.toLowerCase())).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          No notes found
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Editor Panel */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
                    {activeNoteId && studyNotes.find(n => n.id === activeNoteId) ? (() => {
                      const note = studyNotes.find(n => n.id === activeNoteId)!;
                      return (
                        <>
                          {/* Title Editing Row */}
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={note.title}
                              onChange={(e) => handleUpdateNoteTitle(e.target.value)}
                              placeholder="Note Title"
                              style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.02)',
                                color: '#fff',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                outline: 'none'
                              }}
                            />
                            
                            {/* Write / Preview Tabs */}
                            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                              <button
                                onClick={() => setNotepadTab('edit')}
                                className={`btn-glass ${notepadTab === 'edit' ? 'btn-neon' : ''}`}
                                style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '4px', border: 'none' }}
                              >
                                ✍️ Edit
                              </button>
                              <button
                                onClick={() => setNotepadTab('preview')}
                                className={`btn-glass ${notepadTab === 'preview' ? 'btn-neon' : ''}`}
                                style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '4px', border: 'none' }}
                              >
                                👁️ Preview
                              </button>
                            </div>

                            {/* Download Button */}
                            <button
                              onClick={handleDownloadNote}
                              className="btn-glass btn-download"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.7rem',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: '#00ff87',
                                borderColor: 'rgba(0, 255, 137, 0.3)'
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease' }}>
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              Download
                            </button>
                          </div>

                          {/* Template insertion buttons */}
                          {notepadTab === 'edit' && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: '4px' }}>Quick Insert:</span>
                              <button
                                onClick={() => insertTemplate('definition')}
                                className="btn-glass"
                                style={{ padding: '4px 8px', fontSize: '0.65rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                              >
                                💡 Definition
                              </button>
                              <button
                                onClick={() => insertTemplate('question')}
                                className="btn-glass"
                                style={{ padding: '4px 8px', fontSize: '0.65rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                              >
                                ❓ Question / Answer
                              </button>
                              <button
                                onClick={() => insertTemplate('code')}
                                className="btn-glass"
                                style={{ padding: '4px 8px', fontSize: '0.65rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                              >
                                💻 Code Block
                              </button>
                              <button
                                onClick={() => insertTemplate('list')}
                                className="btn-glass"
                                style={{ padding: '4px 8px', fontSize: '0.65rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                              >
                                📋 Bullet List
                              </button>
                            </div>
                          )}

                          {/* Editor Textarea / Preview Container */}
                          <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
                            {notepadTab === 'edit' ? (
                              <textarea
                                value={note.content}
                                onChange={(e) => handleUpdateNoteContent(e.target.value)}
                                placeholder="Use Markdown symbols: # Header, ## Header, - list, **bold**, `code`..."
                                style={{
                                  flex: 1,
                                  width: '100%',
                                  background: '#030305',
                                  color: '#a0aec0',
                                  fontFamily: 'monospace',
                                  fontSize: '0.85rem',
                                  padding: '12px',
                                  border: '1px solid var(--border-glass)',
                                  borderRadius: '8px',
                                  outline: 'none',
                                  resize: 'none',
                                  height: '100%',
                                  minHeight: '440px'
                                }}
                              />
                            ) : (
                              <div
                                dangerouslySetInnerHTML={renderMarkdown(note.content)}
                                style={{
                                  flex: 1,
                                  background: '#030305',
                                  padding: '12px',
                                  border: '1px solid var(--border-glass)',
                                  borderRadius: '8px',
                                  overflowY: 'auto',
                                  fontSize: '0.85rem',
                                  lineHeight: '1.6',
                                  color: 'var(--text-primary)',
                                  height: '100%',
                                  minHeight: '440px'
                                }}
                              />
                            )}
                          </div>
                        </>
                      );
                    })() : (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-glass)', borderRadius: '8px', padding: '2rem' }}>
                        <span>📝</span>
                        <p style={{ margin: '8px 0 0', fontSize: '0.85rem' }}>No note selected or created</p>
                        <button
                          onClick={handleCreateNote}
                          className="btn-neon btn-create"
                          style={{ marginTop: '1rem', padding: '6px 12px', fontSize: '0.75rem', gap: '4px' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Create a Note
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Stacked Pomodoro & Revision Flashcards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: '1 1 350px', minWidth: '320px' }}>
                
                {/* 1. Pomodoro Focus Timer */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '340px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', fontFamily: 'monospace', alignSelf: 'flex-start', marginBottom: '1rem' }}>
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
                        stroke="#ef4444"
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
                      style={{ padding: '8px 20px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #ef4444 0%, #10b981 100%)', boxShadow: '0 4px 10px rgba(255,0,85,0.2)' }}
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

                {/* 2. 3D Revision Flashcards Section */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '320px', flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--neon-secondary)', fontFamily: 'monospace', display: 'block', marginBottom: '1.25rem' }}>
                    3D_REVISION_FLASHCARDS
                  </span>

                  {/* Flip Cards List */}
                  <div className="dashboard-grid" style={{ marginBottom: '2rem', gridTemplateColumns: '1fr', gap: '1rem' }}>
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
                  <div style={{ borderTop: '1px dashed var(--border-glass)', paddingTop: '1.5rem', marginTop: 'auto' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Compile Custom Flashcard</h4>
                    <form onSubmit={handleAddFlashcard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <input
                          type="text"
                          required
                          placeholder="Study Question (e.g. What is closure?)"
                          className="glass-input"
                          value={newFlashcardQ}
                          onChange={(e) => setNewFlashcardQ(e.target.value)}
                        />
                        <input
                          type="text"
                          required
                          placeholder="Concept Details (e.g. Nested scope access...)"
                          className="glass-input"
                          value={newFlashcardA}
                          onChange={(e) => setNewFlashcardA(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="btn-neon btn-create" style={{ alignSelf: 'flex-end', padding: '8px 20px', fontSize: '0.8rem', gap: '6px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add to Shelf
                      </button>
                    </form>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: ACHIEVEMENTS BADGE SHELF */}
          {activeTab === 'achievements' && (
            <div className="glass-panel">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'monospace', color: 'var(--neon-secondary)' }}>
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
                        color: badge.unlocked ? '#00ff87' : '#ef4444',
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

          {/* TAB 6: MERN HUB WORKSPACE */}
          {activeTab === 'mern' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease' }}>
              <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--neon-primary)', fontFamily: 'monospace', letterSpacing: '1px' }}>SPARK_STUDY_CENTER</span>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>MERN Full-Stack Hub</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                    S - Student Progress | A - Assessment | R - Resources | K - Knowledge
                  </p>
                </div>
                {/* Horizontal pill navigation */}
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <button 
                    onClick={() => setMernTab('questions')} 
                    className={`sidebar-btn ${mernTab === 'questions' ? 'active' : ''}`}
                    style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    📋 Guess & AI Verify
                  </button>
                  <button 
                    onClick={() => setMernTab('notes')} 
                    className={`sidebar-btn ${mernTab === 'notes' ? 'active' : ''}`}
                    style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    📝 Full-Stack Notes
                  </button>
                  <button 
                    onClick={() => setMernTab('projects')} 
                    className={`sidebar-btn ${mernTab === 'projects' ? 'active' : ''}`}
                    style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    💻 Clone Starter Kits
                  </button>
                </div>
              </div>

              {/* Main Content Split: Resources on Left, Project Hub on Right */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }} className="dashboard-grid">
                
                {/* Left Column: MERN Tabs Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* SUB-TAB 1: INTERACTIVE INTERVIEW QUESTIONS */}
                  {mernTab === 'questions' && (
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Interactive Interview Practice</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>First guess the answer, verify via Gemini AI review, then reveal standard answers.</p>
                        </div>
                        {/* Filters */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <select 
                            value={mernCategoryFilter} 
                            onChange={(e) => setMernCategoryFilter(e.target.value)}
                            className="glass-input" 
                            style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid var(--border-glass)' }}
                          >
                            <option value="All">All Topics</option>
                            <option value="HTML">HTML</option>
                            <option value="CSS">CSS</option>
                            <option value="Bootstrap">Bootstrap</option>
                            <option value="JavaScript">JavaScript</option>
                            <option value="React">React</option>
                            <option value="Backend">Node & Express & Mongo</option>
                          </select>
                          <input 
                            type="text" 
                            placeholder="Search questions..." 
                            value={mernSearchQuery} 
                            onChange={(e) => setMernSearchQuery(e.target.value)}
                            className="glass-input" 
                            style={{ padding: '6px 12px', fontSize: '0.85rem', maxWidth: '200px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)' }}
                          />
                        </div>
                      </div>

                      {/* Accordion List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {mernQuestions.filter(q => {
                          const matchesCat = mernCategoryFilter === 'All' || q.category === mernCategoryFilter;
                          const matchesSearch = q.question.toLowerCase().includes(mernSearchQuery.toLowerCase()) || q.answer.toLowerCase().includes(mernSearchQuery.toLowerCase());
                          return matchesCat && matchesSearch;
                        }).map((q) => {
                          const isOpen = expandedMernQ === q.id;
                          return (
                            <div 
                              key={q.id} 
                              className="glass-panel" 
                              style={{ 
                                padding: '1.25rem', 
                                borderLeft: isOpen ? '4px solid var(--neon-primary)' : '1px solid var(--border-glass)',
                                background: isOpen ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)'
                              }}
                            >
                              {/* Header Trigger */}
                              <div 
                                onClick={() => setExpandedMernQ(isOpen ? null : q.id)}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <span style={{ 
                                    fontSize: '0.7rem', 
                                    fontWeight: 'bold', 
                                    background: q.category === 'React' ? 'rgba(16,185,129,0.1)' : q.category === 'JavaScript' ? 'rgba(245,158,11,0.1)' : 'rgba(255,107,53,0.1)', 
                                    color: q.category === 'React' ? 'var(--neon-secondary)' : q.category === 'JavaScript' ? 'var(--neon-primary)' : '#ff6b35', 
                                    padding: '3px 8px', 
                                    borderRadius: '4px',
                                    fontFamily: 'monospace'
                                  }}>
                                    {q.category}
                                  </span>
                                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{q.question}</h4>
                                </div>
                                <span>{isOpen ? '▲' : '▼'}</span>
                              </div>

                              {/* Accordion Content */}
                              {isOpen && (
                                <div style={{ marginTop: '1.25rem', borderTop: '1px dashed var(--border-glass)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                  
                                  {/* Guess Input */}
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                                      GUESS_YOUR_ANSWER
                                    </label>
                                    <textarea
                                      rows={4}
                                      value={userGuesses[q.id] || ''}
                                      onChange={(e) => setUserGuesses({ ...userGuesses, [q.id]: e.target.value })}
                                      className="glass-input"
                                      placeholder="Type your explanation or core logic here to verify..."
                                      style={{ resize: 'vertical', minHeight: '100px', fontSize: '0.9rem' }}
                                    />
                                  </div>

                                  {/* Actions Row */}
                                  <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                      onClick={() => handleVerifyMernAnswerWithAi(q.id, q.question, q.answer)}
                                      disabled={isVerifyingIndex[q.id]}
                                      className="btn-neon btn-run"
                                      style={{ padding: '8px 18px', fontSize: '0.8rem', borderRadius: '8px' }}
                                    >
                                      {isVerifyingIndex[q.id] ? 'ANALYZING...' : 'Verify with AI'}
                                    </button>

                                    <button
                                      onClick={() => setRevealAnswers({ ...revealAnswers, [q.id]: !revealAnswers[q.id] })}
                                      className="btn-glass"
                                      style={{ padding: '8px 18px', fontSize: '0.8rem', borderRadius: '8px' }}
                                    >
                                      {revealAnswers[q.id] ? 'Hide Standard Answer' : 'Reveal Standard Answer'}
                                    </button>
                                  </div>

                                  {/* AI Verification Report */}
                                  {aiVerifications[q.id] && (
                                    <div 
                                      className="glass-panel" 
                                      style={{ 
                                        background: 'rgba(0,0,0,0.3)', 
                                        borderColor: 'var(--border-glass-hover)', 
                                        padding: '1rem', 
                                        borderRadius: '10px',
                                        fontFamily: 'monospace',
                                        fontSize: '0.85rem',
                                        lineHeight: '1.6'
                                      }}
                                    >
                                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px', marginBottom: '8px', color: 'var(--neon-secondary)' }}>
                                        <span>🛰️ TELEMETRY_VERIFIER_AI</span>
                                        <span>STATUS: RUN_COMPLETE</span>
                                      </div>
                                      <div dangerouslySetInnerHTML={renderMarkdown(aiVerifications[q.id])} />
                                    </div>
                                  )}

                                  {/* Standard Reference Answer */}
                                  {revealAnswers[q.id] && (
                                    <div 
                                      className="glass-panel" 
                                      style={{ 
                                        background: 'rgba(16,185,129,0.02)', 
                                        borderColor: 'rgba(16,185,129,0.2)', 
                                        padding: '1.25rem', 
                                        borderRadius: '10px'
                                      }}
                                    >
                                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(16,185,129,0.1)', paddingBottom: '6px', marginBottom: '8px', color: 'var(--neon-secondary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                        <span>📂 STANDARD_REFERENCE_ANSWER</span>
                                        <button 
                                          onClick={() => handleCopyTextToClipboard(`Question: ${q.question}\nAnswer: ${q.answer}`, q.id)} 
                                          style={{ background: 'none', border: 'none', color: 'var(--neon-primary)', cursor: 'pointer', fontSize: '0.75rem' }}
                                        >
                                          {copiedIndex === q.id ? '✓ Copied' : '📋 Copy QA'}
                                        </button>
                                      </div>
                                      <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>{q.answer}</p>
                                    </div>
                                  )}

                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                          {/* SUB-TAB 2: FULL-STACK STUDY NOTES */}
                  {mernTab === 'notes' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      
                      {/* Active Preview Panel for TXT notes */}
                      {selectedMernNote && selectedMernNote.type === 'txt' && (
                        <div className="glass-panel" style={{ padding: '1.5rem', border: '1.5px solid var(--neon-primary)', background: 'rgba(5, 5, 8, 0.65)', borderRadius: '14px', position: 'relative', animation: 'zoomIn 0.3s ease' }}>
                          <button 
                            onClick={() => setSelectedMernNote(null)} 
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
                          >
                            ✕
                          </button>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--neon-primary)', fontFamily: 'monospace', letterSpacing: '1px' }}>ACTIVE_LECTURE_NOTE_PREVIEW</span>
                              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{getFileMeta(selectedMernNote).displayName}</h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Path: {selectedMernNote.path} | Size: {(selectedMernNote.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleDownloadMernFile(selectedMernNote, 'notes')}
                                className="btn-glass"
                                style={{ padding: '8px 16px', fontSize: '0.75rem', borderRadius: '8px' }}
                              >
                                Download TXT
                              </button>
                              <button
                                onClick={() => handleImportMernNoteToNotepad(selectedMernNote.name, selectedMernNoteContent)}
                                className="btn-neon"
                                style={{ padding: '8px 16px', fontSize: '0.75rem', borderRadius: '8px' }}
                              >
                                Import to Notepad
                              </button>
                            </div>
                          </div>
                          {isLoadingMernContent ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading note details...</div>
                          ) : (
                            <div 
                              style={{ 
                                maxHeight: '350px', 
                                overflowY: 'auto', 
                                padding: '1.25rem', 
                                background: 'rgba(0,0,0,0.3)', 
                                borderRadius: '10px', 
                                fontSize: '0.92rem', 
                                lineHeight: '1.65',
                                border: '1px solid var(--border-glass)',
                                color: 'var(--text-primary)'
                              }}
                              dangerouslySetInnerHTML={renderMarkdown(selectedMernNoteContent)}
                            />
                          )}
                        </div>
                      )}

                      {/* Header controls: Search & Filters */}
                      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Full-Stack Study Library</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '2px 0 0 0' }}>Access, study, and download all materials in a premium card interface.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <select 
                            value={noteCategoryFilter} 
                            onChange={(e) => setNoteCategoryFilter(e.target.value)}
                            className="glass-input" 
                            style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid var(--border-glass)' }}
                          >
                            <option value="All">All Categories</option>
                            <option value="MongoDB Database">MongoDB Database</option>
                            <option value="Express & Node.js">Express & Node.js</option>
                            <option value="HTML & CSS Design">HTML & CSS Design</option>
                            <option value="JavaScript & React">JavaScript & React</option>
                            <option value="MERN Case Studies">Case Studies & Bonus</option>
                            <option value="pdf">PDF Documents</option>
                            <option value="rar">Archives (RAR)</option>
                            <option value="txt">Lecture Notes (TXT)</option>
                          </select>
                          <input 
                            type="text" 
                            placeholder="Search notes..." 
                            value={noteSearchQuery} 
                            onChange={(e) => setNoteSearchQuery(e.target.value)}
                            className="glass-input" 
                            style={{ padding: '6px 12px', fontSize: '0.85rem', maxWidth: '200px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)' }}
                          />
                        </div>
                      </div>

                      {/* Notes Cards Grid */}
                      {mernResources ? (
                        (() => {
                          const flatNotes = flattenResources(mernResources.notes);
                          const filtered = flatNotes.filter(file => {
                            const meta = getFileMeta(file);
                            const matchesSearch = file.name.toLowerCase().includes(noteSearchQuery.toLowerCase()) || meta.category.toLowerCase().includes(noteSearchQuery.toLowerCase());
                            let matchesFilter = true;
                            if (noteCategoryFilter !== 'All') {
                              if (noteCategoryFilter === 'pdf' || noteCategoryFilter === 'rar' || noteCategoryFilter === 'txt') {
                                matchesFilter = file.type === noteCategoryFilter;
                              } else {
                                matchesFilter = meta.category === noteCategoryFilter;
                              }
                            }
                            return matchesSearch && matchesFilter;
                          });

                          if (filtered.length === 0) {
                            return (
                              <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <span style={{ fontSize: '2rem' }}>🔍</span>
                                <h4 style={{ fontSize: '1rem', marginTop: '0.75rem', color: '#fff' }}>No notes found</h4>
                                <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0' }}>Try refining your search query or category filter selection.</p>
                              </div>
                            );
                          }

                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                              {filtered.map((file, idx) => {
                                const meta = getFileMeta(file);
                                const isSelected = selectedMernNote?.path === file.path;
                                const isPdf = file.type === 'pdf';
                                const isRar = file.type === 'rar';
                                const isDocx = file.type === 'docx';
                                const isTxt = file.type === 'txt';

                                let tagBg = 'rgba(255,107,53,0.1)';
                                let tagColor = '#ff6b35';
                                if (isPdf) {
                                  tagBg = 'rgba(16,185,129,0.1)';
                                  tagColor = 'var(--neon-secondary)';
                                } else if (isRar) {
                                  tagBg = 'rgba(245,158,11,0.1)';
                                  tagColor = 'var(--neon-primary)';
                                } else if (isDocx) {
                                  tagBg = 'rgba(59,130,246,0.1)';
                                  tagColor = '#3b82f6';
                                }

                                return (
                                  <div 
                                    key={idx}
                                    className="glass-panel tilt-card"
                                    style={{ 
                                      padding: '1.25rem', 
                                      display: 'flex', 
                                      flexDirection: 'column', 
                                      justifyContent: 'space-between',
                                      gap: '1rem',
                                      border: isSelected ? '1.5px solid var(--neon-primary)' : '1px solid var(--border-glass)',
                                      background: isSelected ? 'rgba(245,158,11,0.02)' : 'rgba(255,255,255,0.01)',
                                      transition: 'all 0.3s ease'
                                    }}
                                  >
                                    <div>
                                      {/* Tags row */}
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                          {meta.category}
                                        </span>
                                        <span style={{ fontSize: '0.65rem', background: tagBg, color: tagColor, padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                          {file.type.toUpperCase()}
                                        </span>
                                      </div>

                                      {/* Title */}
                                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '6px 0 4px 0', color: '#fff', lineHeight: '1.4' }}>
                                        {meta.displayName}
                                      </h4>
                                      
                                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0, fontFamily: 'monospace' }}>
                                        Size: {(file.size / 1024).toFixed(1)} KB
                                      </p>
                                    </div>

                                    {/* Action Row */}
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                      {isTxt ? (
                                        <>
                                          <button
                                            onClick={() => handleSelectMernNote(file)}
                                            className="btn-neon"
                                            style={{ flex: 1, padding: '8px', fontSize: '0.75rem', borderRadius: '6px', textAlign: 'center' }}
                                          >
                                            Study Note
                                          </button>
                                          <button
                                            onClick={() => handleDownloadMernFile(file, 'notes')}
                                            className="btn-glass"
                                            style={{ padding: '8px', fontSize: '0.75rem', borderRadius: '6px' }}
                                            title="Download TXT file"
                                          >
                                            📥
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => handleDownloadMernFile(file, 'notes')}
                                          className="btn-neon"
                                          style={{ flex: 1, padding: '8px', fontSize: '0.75rem', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
                                        >
                                          <span>📥 Download</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()
                      ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0', fontSize: '0.85rem' }}>
                          Loading full-stack library resources...
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 3: PROJECT TEMPLATES & CLONING STARTER KITS */}
                  {mernTab === 'projects' && (
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Project Cloning & Starter Boilerplates</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>Use these pre-configured code structures to quickly boot and start your assignments.</p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                        {mernProjects.map((proj) => (
                          <div key={proj.id} className="glass-panel tilt-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                                {proj.tags.map((t, idx) => (
                                  <span key={idx} style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)', color: 'var(--neon-primary)', fontFamily: 'monospace' }}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{proj.title}</h4>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '6px', lineHeight: '1.4', minHeight: '65px' }}>
                                {proj.description}
                              </p>
                            </div>

                            {/* Git Clone Command Block */}
                            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <code style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--neon-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                                git clone {proj.cloneUrl}
                              </code>
                              <button 
                                onClick={() => handleCopyTextToClipboard(`git clone ${proj.cloneUrl}`, proj.id)} 
                                style={{ background: 'none', border: 'none', color: 'var(--neon-primary)', cursor: 'pointer', fontSize: '0.8rem', paddingLeft: '4px' }}
                              >
                                {copiedIndex === proj.id ? '✓' : '📋'}
                              </button>
                            </div>

                            {/* View Repo link button */}
                            <a 
                              href={proj.githubUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="btn-glass" 
                              style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '8px', borderRadius: '6px', textAlign: 'center', width: '100%' }}
                            >
                              View GitHub Repository
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Column: Platform Core Links & Curriculum Guide */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Card 1: Core Portal Repository */}
                  <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(245,158,11,0.25)', background: 'linear-gradient(135deg, rgba(245,158,11,0.04) 0%, rgba(255,107,53,0.01) 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.2rem', color: 'var(--neon-primary)' }}>✦</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Active SRU Project Repository</h4>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
                      This project repository is active and deployed. Students can review and clone the main academic codebase directly.
                    </p>
                    <a
                      href="https://github.com/vamsi123-paidi/SRU"
                      target="_blank"
                      rel="noreferrer"
                      className="btn-neon"
                      style={{ textDecoration: 'none', display: 'block', textAlign: 'center', padding: '10px', fontSize: '0.8rem', borderRadius: '8px' }}
                    >
                      View SRU on GitHub
                    </a>
                  </div>

                  {/* Card 2: Interview PDFs quick links */}
                  <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', margin: 0 }}>
                      Interview Material Downloads
                    </h4>
                    
                    {mernResources && mernResources.interviewFiles ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {mernResources.interviewFiles.map((file, idx) => (
                          <div 
                            key={idx}
                            onClick={() => handleDownloadMernFile(file, 'interview')}
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              fontSize: '0.75rem',
                              padding: '6px 8px',
                              borderRadius: '4px',
                              background: 'rgba(255,255,255,0.02)',
                              cursor: 'pointer',
                              border: '1px solid var(--border-glass)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-glass-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                          >
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                              📥 {file.name.replace(/^\d+-/, '')}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--neon-primary)', fontFamily: 'monospace' }}>
                              {file.type.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Loading PDF list...
                      </div>
                    )}
                  </div>

                </div>

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
                  color: '#ef4444',
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
                  background: timeRemaining <= 60 ? 'rgba(255,0,85,0.1)' : 'rgba(16, 185, 129, 0.08)',
                  border: `1.5px solid ${timeRemaining <= 60 ? '#ef4444' : 'var(--neon-primary)'}`,
                  color: timeRemaining <= 60 ? '#ef4444' : 'var(--neon-secondary)',
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
                          background: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255,255,255,0.02)',
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
                  color: tabSwitchCount > 0 ? '#ef4444' : 'var(--text-muted)'
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
                  className="btn-neon btn-transmit"
                  style={{ color: '#fff', gap: '8px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease' }}>
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
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
                  className="btn-neon btn-save"
                  style={{ color: '#fff', gap: '8px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease' }}>
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
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
                        ? 'rgba(245, 158, 11, 0.15)' 
                        : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${isStudent ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-glass)'}`,
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

      {/* Dynamic Telemetry Loading Portal */}
      {(isSubmitting || isSubmittingQuiz || isSubmittingAssessment || isUpdatingProfile) && (
        <QuantumLoader
          message={
            isSubmitting
              ? "Uploading Task Deliverables"
              : isSubmittingQuiz
              ? "Securing Exam Submission"
              : isSubmittingAssessment
              ? "Running Evaluation Verification"
              : "Calibrating User Account Settings"
          }
        />
      )}

      {/* Initial Page Loaders */}
      {isAssessmentsLoading && assessmentsList.length === 0 && (
        <QuantumLoader message="Synchronizing Coding Challenges Database" />
      )}
      {isLoadingQuizzes && quizzes.length === 0 && (
        <QuantumLoader message="Connecting to Quiz Proctor Gateway" />
      )}

      <style jsx global>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        /* Workspace layout styles */
        .workspace-layout {
          display: grid;
          grid-template-columns: 1fr;
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
          background: rgba(245, 158, 11, 0.06);
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

        .notes-workspace-layout {
          display: flex;
          flex: 1;
          gap: 1.5rem;
          min-height: 0;
        }
        @media (max-width: 768px) {
          .notes-workspace-layout {
            flex-direction: column !important;
          }
          .notes-workspace-layout > div:first-child {
            width: 100% !important;
            border-right: none !important;
            padding-right: 0 !important;
            border-bottom: 1px solid var(--border-glass) !important;
            padding-bottom: 1rem !important;
          }
        }
      `}</style>
    </main>
  );
}
