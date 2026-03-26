/* ============================================
   FILE: geminiService.ts
   PURPOSE: Gemini AI engine — chat, embeddings, and Function Calling (tool use)
   DEPENDENCIES: @google/generative-ai, processRegistry
   EXPORTS: ChatMessage, ToolCallLog, ToolCallingResult, isAIConfigured, sendBrainMessage, askBrain, getEmbedding, sendWithTools
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
 * Note: Switched from deprecated text-embedding-004 (404 error)
 * to gemini-embedding-001 (March 2026).
 *
 * @param text - Text to embed
 * @returns Embedding vector (number array)
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: 'gemini-embedding-001' });

  // Retry with exponential backoff for rate limiting (429)
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      if (status === 429 || status === 503) {
        // Rate limit — wait and retry
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`[Embedding] Rate limited (${status}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err; // Non-retryable error
    }
  }
  throw lastError;
}

// #endregion

// #region Function Calling (Tool Use)

/**
 * Result of a tool call made by Gemini during generation.
 * Logged by the caller for persistent agent memory.
 */
export interface ToolCallLog {
  /** Tool name */
  toolName: string;
  /** Arguments Gemini passed to the tool */
  toolArgs: Record<string, unknown>;
  /** Result returned from the tool */
  toolResult: Record<string, unknown>;
}

/**
 * Result from sendWithTools — includes both the final text and tool call logs.
 */
export interface ToolCallingResult {
  /** Final text response from Gemini */
  text: string;
  /** All tool calls that were made during generation */
  toolCalls: ToolCallLog[];
}

/**
 * Send a message to Gemini with Function Calling support.
 * Handles the multi-turn loop: Gemini calls tools → we execute → feed back → repeat.
 *
 * @param systemPrompt - System instruction for the model
 * @param userMessage - The user/agent message
 * @param tools - Gemini FunctionDeclarationsTool with available functions
 * @param toolExecutor - Function that executes tool calls and returns results
 * @param maxIterations - Maximum tool-calling rounds (default: 10)
 * @returns Final text response and all tool call logs
 */
export async function sendWithTools(
  systemPrompt: string,
  userMessage: string,
  tools: import('@google/generative-ai').FunctionDeclarationsTool,
  toolExecutor: (name: string, args: Record<string, unknown>) => Promise<Record<string, unknown>>,
  maxIterations = 10,
): Promise<ToolCallingResult> {
  const ai = getGenAI();
  const model = ai.getGenerativeModel({
    model: 'gemini-2.5-flash',
    tools: [tools],
    systemInstruction: { role: 'user', parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 4096,
    },
  });

  const toolCallLogs: ToolCallLog[] = [];

  // Start with the user message
  const contents: import('@google/generative-ai').Content[] = [
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  for (let i = 0; i < maxIterations; i++) {
    const result = await model.generateContent({ contents });
    const response = result.response;
    const candidate = response.candidates?.[0];

    if (!candidate) {
      return { text: 'לא התקבלה תגובה מהמודל', toolCalls: toolCallLogs };
    }

    // Check if the model wants to call functions
    const functionCalls = response.functionCalls();

    if (!functionCalls || functionCalls.length === 0) {
      // No more tool calls — return the final text
      const text = response.text() || '';
      return { text, toolCalls: toolCallLogs };
    }

    // Add the model's response (with function calls) to history
    contents.push({ role: 'model', parts: candidate.content.parts });

    // Execute each function call and collect responses
    const functionResponses: import('@google/generative-ai').Part[] = [];

    for (const fc of functionCalls) {
      console.log(`[Gemini] 🔧 Tool call: ${fc.name}(${JSON.stringify(fc.args).substring(0, 100)})`);

      const toolResult = await toolExecutor(fc.name, fc.args as Record<string, unknown>);

      toolCallLogs.push({
        toolName: fc.name,
        toolArgs: fc.args as Record<string, unknown>,
        toolResult,
      });

      functionResponses.push({
        functionResponse: {
          name: fc.name,
          response: toolResult,
        },
      });
    }

    // Add function responses to history
    contents.push({ role: 'user', parts: functionResponses });
  }

  // If we hit max iterations, return what we have
  return {
    text: 'הסוכן הגיע למגבלת הקריאות לכלים. התוצאה האחרונה שנמצאה מוצגת למעלה.',
    toolCalls: toolCallLogs,
  };
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
