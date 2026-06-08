import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';

// HoloBot AI Study Assistant controller
export const handleChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      res.status(400).json({ message: 'Chat message is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if GEMINI_API_KEY is not set
    if (!apiKey) {
      const lowerMsg = message.toLowerCase().trim();
      let reply = "Hello! I am HoloBot, your secure study assistant. ⚠️ The system administrator has not configured my Gemini API key (`GEMINI_API_KEY`) in the backend `.env` file, so I am running in local fallback mode.\n\n";

      if (lowerMsg.includes('study tips') || lowerMsg.includes('tip') || lowerMsg.includes('how to study')) {
        reply += "📚 **Study Tips in Fallback Mode**:\n1. Break tasks into 45-minute chunks with 5-minute breaks (Pomodoro technique).\n2. Write down your coding milestones before starting keyboard execution.\n3. Make sure to double check your submission screenshot details!";
      } else if (lowerMsg.includes('csv') || lowerMsg.includes('excel')) {
        reply += "📊 **CSV/Spreadsheet Help**:\nEnsure your files contain precise column headers: `name`, `email`, `password`, and `collegeCode` to onboard students successfully!";
      } else if (lowerMsg.includes('recursion') || lowerMsg.includes('recursive')) {
        reply += "🔁 **Recursion Guide**:\nRecursion is when a function calls itself to solve smaller instances of the same problem. Always define a **base case** first to avoid infinite loops and stack overflows!";
      } else {
        reply += "I can help with basic queries offline. Try asking about **study tips**, **CSV requirements**, or **recursion**! Ask your system administrator to add the API key to unleash my full generative capabilities.";
      }

      res.status(200).json({ reply });
      return;
    }

    const promptText = 
      "SYSTEM INSTRUCTION:\n" +
      "You are HoloBot, a study-only AI assistant built into the HoloTrack.io Student Portal. " +
      "Your sole purpose is to help students with academic subjects, study advice, homework guidance, coding, coursework, and task management. " +
      "If the user's message is NOT related to study, learning, programming, academics, or task work (for example: entertainment, pop culture, casual jokes, gossip, gaming, general conversation unrelated to education), " +
      "you must politely refuse to answer. Explain to the user that you are programmed strictly as an educational learning assistant and can only discuss study or task-related topics. " +
      "Keep your tone helpful, technical, encouraging, and clear.\n\n" +
      `USER QUERY: ${message}`;

    // Call live Gemini 1.5 Flash API
    // We use built-in fetch which is supported in modern Node environments (v18+)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
      console.error('Gemini API call failed:', errText);
      
      let apiErrorMessage = 'Error communicating with Gemini API';
      try {
        const parsedError = JSON.parse(errText);
        if (parsedError.error?.message) {
          apiErrorMessage = `Gemini API Error: ${parsedError.error.message}`;
        }
      } catch (parseErr) {
        // Fallback
      }

      res.status(response.status).json({ message: apiErrorMessage, error: errText });
      return;
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    res.status(200).json({ reply });
  } catch (error: any) {
    console.error('Chat controller error:', error);
    res.status(500).json({ message: 'Failed to process chat message', error: error.message });
  }
};
