/* ============================================
   FILE: geminiService.ts
   PURPOSE: geminiService module
   DEPENDENCIES: @google
   EXPORTS: ChatMessage, isAIConfigured
   ============================================ */
/**
 * Gemini AI Service — Brain Agent Engine
 *
 * Connects to Google Gemini API to power AI agents in the Eldad Brain.
 * Each process can use this service to get AI assistance.
 *
 * @see AGENTS.md for architecture rules
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PROCESS_REGISTRY } from '../data/processRegistry';

// #region Configuration

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!API_KEY) {
      throw new Error('VITE_GEMINI_API_KEY is not set in .env');
    }
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

// #endregion

// #region System Prompts

/** Build a context-aware system prompt based on the current process */
function buildSystemPrompt(processId?: string): string {
  const basePrompt = `אתה "המוח של אלדד" — מערכת AI חכמה שמסייעת לרואה חשבון בכיר בניהול תהליכים מקצועיים.

כללים חשובים:
- ענה תמיד בעברית
- היה מקצועי, מדויק וממוקד
- אם אתה לא בטוח — אמור שאתה לא בטוח
- הצע צעדים מעשיים ולא תיאורטיים
- השתמש בשפה מקצועית של רואי חשבון ועורכי דין

המערכת כוללת את התהליכים הבאים:
${PROCESS_REGISTRY.map(p => `- ${p.name} (${p.domain})`).join('\n')}
`;

  if (processId) {
    const process = PROCESS_REGISTRY.find(p => p.id === processId);
    if (process) {
      return `${basePrompt}

אתה כרגע מסייע בתהליך: **${process.name}**
תחום: ${process.domain}
${process.category ? `קטגוריה: ${process.category}` : ''}

קלט נדרש: ${process.requiredInputs?.join(', ') || 'לא הוגדר'}
פלט צפוי: ${process.outputs?.join(', ') || 'לא הוגדר'}
שלבים: ${process.states?.join(' → ') || 'לא הוגדר'}

תפקידך:
1. לעזור למשתמש לאסוף את המידע הנדרש
2. לנתח את הנתונים
3. לייצר מסמכים ודוחות
4. להציע המלצות מקצועיות
5. להתריע על בעיות אפשריות`;
    }
  }

  return `${basePrompt}

אתה נתב המוח — עוזר למשתמש למצוא את התהליך הנכון ומספק מידע כללי.
כשהמשתמש שואל על תהליך מסוים, הסבר מה הוא כולל ומה צריך כדי להתחיל.`;
}

// #endregion

// #region Embeddings

/**
 * Generate a text embedding using Gemini's embedding model.
 * Used by the RAG system for semantic search.
 *
 * @param text - Text to embed
 * @returns Embedding vector (number array)
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: 'text-embedding-004' });

  const result = await model.embedContent(text);
  return result.embedding.values;
}

// #endregion

// #region Chat Interface

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

/**
 * Send a message to the Brain AI and get a response.
 *
 * @param messages — Chat history
 * @param userMessage — New user message
 * @param processId — Optional: context process for focused assistance
 * @returns AI response text
 */
export async function sendBrainMessage(
  messages: ChatMessage[],
  userMessage: string,
  processId?: string,
  knowledgeContext?: string,
): Promise<string> {
  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

  let systemPrompt = buildSystemPrompt(processId);

  // Inject RAG knowledge context if available
  if (knowledgeContext) {
    systemPrompt += `\n\n═══ ידע רלוונטי מהמוח ═══\n${knowledgeContext}\n═══ סוף ידע ═══\nהשתמש בידע שלמעלה כדי לענות בצורה מדויקת. אם הידע לא מכיל את התשובה, אמור שאין לך מידע.`;
  }

  // Build chat history
  const history = messages.map(m => ({
    role: m.role === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({
    history,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
    },
    systemInstruction: {
      role: 'user',
      parts: [{ text: systemPrompt }],
    },
  });

  const result = await chat.sendMessage(userMessage);
  const response = result.response;
  return response.text();
}

/**
 * Quick question to the Brain — no chat history.
 *
 * @param question — The question to ask
 * @param processId — Optional context
 * @returns AI response text
 */
export async function askBrain(question: string, processId?: string): Promise<string> {
  return sendBrainMessage([], question, processId);
}

/**
 * Check if the Gemini API key is configured.
 */
export function isAIConfigured(): boolean {
  return !!API_KEY && API_KEY.length > 10;
}

// #endregion
