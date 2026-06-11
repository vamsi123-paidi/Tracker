import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

// Define directories relative to process.cwd() (backend directory)
const NOTES_DIR = path.resolve(process.cwd(), '../notes for mern fullstack');
const INTERVIEW_DIR = path.resolve(process.cwd(), '../interview questions');

// Helper to recursively scan directory
interface FileItem {
  name: string;
  path: string;
  type: 'txt' | 'pdf' | 'rar' | 'docx' | 'folder' | 'zip' | 'other';
  size?: number;
  children?: FileItem[];
}

const scanDir = (dirPath: string, rootDir: string): FileItem[] => {
  const items: FileItem[] = [];
  if (!fs.existsSync(dirPath)) return items;

  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    // Ignore git, node_modules, ES files, temp files
    if (file.startsWith('.') || file === 'node_modules' || file === 'package-lock.json') return;

    const fullPath = path.join(dirPath, file);
    const relativePath = path.relative(rootDir, fullPath);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      items.push({
        name: file,
        path: relativePath.replace(/\\/g, '/'),
        type: 'folder',
        children: scanDir(fullPath, rootDir)
      });
    } else {
      const ext = path.extname(file).toLowerCase();
      let type: FileItem['type'] = 'other';
      if (ext === '.txt') type = 'txt';
      else if (ext === '.pdf') type = 'pdf';
      else if (ext === '.rar') type = 'rar';
      else if (ext === '.docx') type = 'docx';
      else if (ext === '.zip') type = 'zip';

      items.push({
        name: file,
        path: relativePath.replace(/\\/g, '/'),
        type,
        size: stat.size
      });
    }
  });

  return items;
};

// Global in-memory cache for parsed interview questions (0 DB size footprint)
let cachedQuestions: any[] | null = null;

// Helper to extract category from filename
function getCategoryFromFilename(filename: string): string {
  const name = filename.toLowerCase();
  if (name.includes('html')) return 'HTML';
  if (name.includes('css')) return 'CSS';
  if (name.includes('bootstrap')) return 'Bootstrap';
  if (name.includes('js_') || name.includes('javascript') || name.includes('js.')) return 'JavaScript';
  if (name.includes('react')) return 'React';
  if (name.includes('backend') || name.includes('node') || name.includes('express') || name.includes('mongo')) return 'Backend';
  return 'General';
}

// Helper to parse question-answer pairs from raw text
function parseQuestionsFromText(text: string, filename: string): any[] {
  const qaPairs: any[] = [];
  const category = getCategoryFromFilename(filename);
  
  // Clean page markers
  const cleanText = text.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '');
  const lines = cleanText.split(/\r?\n/);
  
  let currentQuestion = null;
  let currentAnswer = null;
  let currentId = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Check if line starts with "<number>."
    const qMatch = line.match(/^(\d+)\.\s*(.*)/);
    if (qMatch) {
      if (currentQuestion && currentAnswer) {
        qaPairs.push({
          id: `${filename}-${currentId++}`,
          category,
          question: currentQuestion.trim(),
          answer: currentAnswer.trim()
        });
      }
      
      currentQuestion = qMatch[2];
      currentAnswer = null;
    } else {
      // Check for answer start keyword (Ans or Answer)
      const aMatch = line.match(/^(?:Ans\b(?:\.|\:)?|Answer\b(?:\.|\:)?)\s*(.*)/i);
      if (aMatch) {
        currentAnswer = aMatch[1];
      } else {
        // Append to current question or answer
        if (currentAnswer !== null) {
          currentAnswer += ' ' + line;
        } else if (currentQuestion !== null) {
          currentQuestion += ' ' + line;
        }
      }
    }
  }
  
  // Push the final item
  if (currentQuestion && currentAnswer) {
    qaPairs.push({
      id: `${filename}-${currentId++}`,
      category,
      question: currentQuestion.trim(),
      answer: currentAnswer.trim()
    });
  }
  
  return qaPairs;
}

// Read and parse all files under interview questions folder
async function loadAndCacheQuestions(): Promise<any[]> {
  const allQuestions: any[] = [];
  const seenQuestionTexts = new Set<string>();

  if (!fs.existsSync(INTERVIEW_DIR)) return allQuestions;
  
  const files = fs.readdirSync(INTERVIEW_DIR);
  for (const file of files) {
    if (file.startsWith('.') || file.toLowerCase().includes('cheatsheet')) continue;
    const fullPath = path.join(INTERVIEW_DIR, file);
    const ext = path.extname(file).toLowerCase();
    
    let text = '';
    if (ext === '.pdf') {
      try {
        const dataBuffer = fs.readFileSync(fullPath);
        const parser = new PDFParse({ data: new Uint8Array(dataBuffer) });
        const result = await parser.getText();
        text = result.text;
        await parser.destroy();
      } catch (err) {
        console.error(`Error parsing PDF ${file} for questions:`, err);
      }
    } else if (ext === '.docx') {
      try {
        const result = await mammoth.extractRawText({ path: fullPath });
        text = result.value;
      } catch (err) {
        console.error(`Error parsing DOCX ${file} for questions:`, err);
      }
    }
    
    if (text) {
      const parsed = parseQuestionsFromText(text, file);
      parsed.forEach((qa) => {
        const normalizedQ = qa.question.toLowerCase().replace(/\s+/g, ' ').trim();
        if (!seenQuestionTexts.has(normalizedQ)) {
          seenQuestionTexts.add(normalizedQ);
          allQuestions.push(qa);
        }
      });
    }
  }

  return allQuestions;
}

// Global in-memory cache for notes and interview structure
let cachedMernResources: { notes: FileItem[]; interviewFiles: FileItem[] } | null = null;
let resourcesCacheTimestamp = 0;
const RESOURCES_CACHE_TTL = 300000; // 5 minutes cache

// 1. GET /api/mern/resources - Lists all files and structures in the folders
export const getMernResources = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = Date.now();
    if (!cachedMernResources || (now - resourcesCacheTimestamp) > RESOURCES_CACHE_TTL) {
      const notesTree = scanDir(NOTES_DIR, NOTES_DIR);
      const interviewTree = scanDir(INTERVIEW_DIR, INTERVIEW_DIR);
      cachedMernResources = {
        notes: notesTree,
        interviewFiles: interviewTree
      };
      resourcesCacheTimestamp = now;
    }

    res.status(200).json(cachedMernResources);
  } catch (error: any) {
    console.error('Error scanning MERN folders:', error);
    res.status(500).json({ message: 'Failed to scan MERN folders', error: error.message });
  }
};

// 2. GET /api/mern/notes/content - Reads content of a specific .txt file securely
export const getNoteContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filePath } = req.query;
    if (!filePath || typeof filePath !== 'string') {
      res.status(400).json({ message: 'File path query parameter is required' });
      return;
    }

    // Resolve file path securely and prevent directory traversal
    const resolvedPath = path.resolve(NOTES_DIR, filePath);
    if (!resolvedPath.startsWith(NOTES_DIR)) {
      res.status(403).json({ message: 'Access denied: Directory traversal blocked' });
      return;
    }

    if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).isDirectory()) {
      res.status(404).json({ message: 'Note file not found' });
      return;
    }

    const content = fs.readFileSync(resolvedPath, 'utf8');
    res.status(200).json({ content });
  } catch (error: any) {
    console.error('Error reading note file:', error);
    res.status(500).json({ message: 'Failed to read note file', error: error.message });
  }
};

// 3. GET /api/mern/download - Streams any file for download securely
export const downloadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filePath, folder } = req.query; // folder can be 'notes' or 'interview'
    if (!filePath || typeof filePath !== 'string') {
      res.status(400).json({ message: 'File path query parameter is required' });
      return;
    }

    const baseDir = folder === 'interview' ? INTERVIEW_DIR : NOTES_DIR;
    const resolvedPath = path.resolve(baseDir, filePath);

    // Prevent directory traversal
    if (!resolvedPath.startsWith(baseDir)) {
      res.status(403).json({ message: 'Access denied: Directory traversal blocked' });
      return;
    }

    if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).isDirectory()) {
      res.status(404).json({ message: 'Requested file not found' });
      return;
    }

    res.download(resolvedPath);
  } catch (error: any) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Failed to download file', error: error.message });
  }
};

// 4. POST /api/mern/verify-answer - Evaluates student answer guess against standard answer
export const verifyMernAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, userAnswer, standardAnswer } = req.body;

    if (!question || !userAnswer || !standardAnswer) {
      res.status(400).json({ message: 'Question, userAnswer, and standardAnswer are required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback comparison if GEMINI_API_KEY is not defined
    if (!apiKey) {
      const uAns = userAnswer.toLowerCase().trim();
      const sAns = standardAnswer.toLowerCase().trim();

      // Simple keyword matching evaluation
      const keywords = sAns.split(/[\s,.\-()]+/).filter((word: string) => word.length > 4);
      let matchCount = 0;
      keywords.forEach((word: string) => {
        if (uAns.includes(word)) matchCount++;
      });

      const matchRatio = keywords.length > 0 ? matchCount / keywords.length : 0;
      let score = 30; // base score if they type something
      if (uAns.length > 15) score += 20;
      score += Math.min(50, Math.round(matchRatio * 70));

      let grade = 'Needs Improvement';
      if (score >= 80) grade = 'Excellent';
      else if (score >= 55) grade = 'Good';

      const reply = `### 🛰️ LOCAL REVIEW REPORT (Offline Fallback)
- **Evaluation Score**: ${score}% (${grade})
- **What you got right**: You attempted the query and wrote ${userAnswer.split(' ').length} words.
- **What was missing**: Keyword match indicates a ${Math.round(matchRatio * 100)}% match of technical vocabulary. Make sure to cover structural concepts.
- **Suggestions**: Review the reference answer below and expand your answer to cover more technical detail. Configure the API Key to get precise AI feedback.`;

      res.status(200).json({ reply });
      return;
    }

    const promptText = `SYSTEM INSTRUCTION:
You are an expert technical interviewer evaluating a student's answer to a MERN Stack question.
Compare the student's answer (GUESS) against the reference standard answer (STANDARD).
Provide a structured, helpful review detailing:
1. **Score & Grade**: (e.g. 85% - Excellent, 60% - Good, or 40% - Needs Improvement).
2. **What they got right**: Bullet points of matching concepts.
3. **What they missed**: Missing key concepts or vocabulary.
4. **Actionable Suggestions**: How to refine the explanation.
Keep the tone professional, educational, and constructive. Keep the formatting as clean, concise Markdown.

QUESTION: ${question}
STUDENT GUESS: ${userAnswer}
STANDARD REFERENCE ANSWER: ${standardAnswer}`;

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
      const errText = await response.text();
      console.error('Gemini verification call failed:', errText);
      res.status(200).json({ reply: 'AI server returned an error during verification. Please try again or reveal the answer.' });
      return;
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a verification report.";

    res.status(200).json({ reply });
  } catch (error: any) {
    console.error('Error verifying MERN answer:', error);
    res.status(500).json({ message: 'Failed to verify answer', error: error.message });
  }
};

// 5. GET /api/mern/questions - Serves all parsed interview questions (in-memory cached, 0 DB footprint)
export const getMernQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!cachedQuestions) {
      cachedQuestions = await loadAndCacheQuestions();
    }
    res.status(200).json(cachedQuestions);
  } catch (error: any) {
    console.error('Error fetching MERN questions:', error);
    res.status(500).json({ message: 'Failed to retrieve questions', error: error.message });
  }
};
