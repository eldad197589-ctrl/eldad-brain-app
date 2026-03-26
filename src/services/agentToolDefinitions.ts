/* ============================================
   FILE: agentToolDefinitions.ts
   PURPOSE: Individual tool definitions for AI agents (search, save, create, document)
   DEPENDENCIES: ragService.ts, processRegistry.ts, supabaseClient.ts, agentMemory.ts
   EXPORTS: searchKnowledgeTool, searchProcessesTool, saveNoteTool, createTaskTool, generateDocumentDraftTool
   ============================================ */
/**
 * Tool Definitions — Extracted from agentTools.ts for ≤300 line compliance.
 * Each tool wraps an existing service into a structured Gemini Function Call.
 */

import { SchemaType } from '@google/generative-ai';
import { queryKnowledge, getRAGStatus } from './ragService';
import { findProcessByKeyword, getProcessById, PROCESS_REGISTRY } from '../data/processRegistry';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { saveAgentNote } from './agentMemory';
import type { AgentTool } from './agentTools';

// #region Tool: search_knowledge

/** @see AgentTool — search the Brain knowledge base */
export const searchKnowledgeTool: AgentTool = {
  name: 'search_knowledge',
  descriptionHe: 'חיפוש ידע בבסיס הידע של המוח',
  allowedLayers: ['command', 'intake', 'processing', 'output', 'support'],
  declaration: {
    name: 'search_knowledge',
    description: 'Search the Brain knowledge base for relevant information. Use this when you need professional accounting, tax, or legal knowledge.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: { type: SchemaType.STRING, description: 'The search query in Hebrew or English' },
        top_k: { type: SchemaType.NUMBER, description: 'Number of results to return (default: 3, max: 5)' },
      },
      required: ['query'],
    },
  },
  execute: async (args) => {
    const query = args.query as string;
    const topK = Math.min((args.top_k as number) || 3, 5);
    const status = getRAGStatus();
    if (status !== 'ready' && status !== 'fallback') {
      return { success: false, error: 'מערכת הידע לא מוכנה', results: [] };
    }
    const chunks = await queryKnowledge(query, topK);
    return {
      success: true, resultCount: chunks.length,
      results: chunks.map(c => ({ source: c.sourceFile, section: c.sectionTitle, content: c.content.substring(0, 500) })),
    };
  },
};

// #endregion

// #region Tool: search_processes

/** @see AgentTool — search the process registry */
export const searchProcessesTool: AgentTool = {
  name: 'search_processes',
  descriptionHe: 'חיפוש תהליכים ברג\'יסטרי התהליכים',
  allowedLayers: ['command', 'intake', 'processing'],
  declaration: {
    name: 'search_processes',
    description: 'Search the process registry for workflows matching a keyword. Returns process details including inputs, outputs, and lifecycle stages.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        keyword: { type: SchemaType.STRING, description: 'Keyword to search for (Hebrew or English)' },
        process_id: { type: SchemaType.STRING, description: 'Optional: specific process ID to look up directly' },
      },
      required: ['keyword'],
    },
  },
  execute: async (args) => {
    const keyword = args.keyword as string;
    const processId = args.process_id as string | undefined;
    if (processId) {
      const process = getProcessById(processId);
      if (process) {
        return { success: true, resultCount: 1, results: [{ id: process.id, name: process.name, domain: process.domain, inputs: process.requiredInputs, outputs: process.outputs, states: process.states, agents: process.agents }] };
      }
    }
    const matches = findProcessByKeyword(keyword);
    return {
      success: true, resultCount: matches.length,
      results: matches.map(p => ({ id: p.id, name: p.name, domain: p.domain, inputs: p.requiredInputs, outputs: p.outputs, states: p.states })),
      allProcesses: PROCESS_REGISTRY.map(p => `${p.id}: ${p.name}`),
    };
  },
};

// #endregion

// #region Tool: save_note

/** @see AgentTool — save findings to system memory */
export const saveNoteTool: AgentTool = {
  name: 'save_note',
  descriptionHe: 'שמירת הערה/ממצא בזיכרון המערכת',
  allowedLayers: ['command', 'intake', 'processing', 'output', 'support'],
  declaration: {
    name: 'save_note',
    description: 'Save an important finding, decision, or recommendation to the system memory.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        content: { type: SchemaType.STRING, description: 'The note content in Hebrew' },
        note_type: { type: SchemaType.STRING, description: 'Type of note: finding, decision, recommendation, or warning' },
        process_id: { type: SchemaType.STRING, description: 'Optional: related process ID' },
        client_id: { type: SchemaType.STRING, description: 'Optional: related client ID' },
      },
      required: ['content', 'note_type'],
    },
  },
  execute: async (args) => {
    const content = args.content as string;
    const noteType = (args.note_type as string) || 'finding';
    const processId = args.process_id as string | undefined;
    const clientId = args.client_id as string | undefined;
    const noteId = await saveAgentNote({
      missionId: undefined, agentId: 'unknown', processId, clientId,
      noteType: noteType as 'finding' | 'decision' | 'recommendation' | 'warning', content,
    });
    return { success: true, noteId, message: `הערה נשמרה בהצלחה (${noteType})` };
  },
};

// #endregion

// #region Tool: create_task

/** @see AgentTool — create tasks in the CEO Office */
export const createTaskTool: AgentTool = {
  name: 'create_task',
  descriptionHe: 'יצירת משימה חדשה בלשכת המנכ"ל',
  allowedLayers: ['command', 'processing', 'output'],
  declaration: {
    name: 'create_task',
    description: 'Create a new task in the CEO Office task board.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: 'Task title in Hebrew' },
        priority: { type: SchemaType.STRING, description: 'Priority: high, medium, or low' },
        due_date: { type: SchemaType.STRING, description: 'Optional: due date in YYYY-MM-DD format' },
      },
      required: ['title', 'priority'],
    },
  },
  execute: async (args) => {
    const title = args.title as string;
    const priority = args.priority as string;
    const dueDate = args.due_date as string | undefined;
    if (!isSupabaseConfigured()) {
      return { success: true, storage: 'memory_only', message: `משימה "${title}" נוצרה (בזיכרון בלבד)`, task: { title, priority, dueDate } };
    }
    const sb = getSupabase();
    if (!sb) return { success: false, error: 'Supabase לא זמין' };
    const taskId = `task_${Date.now().toString(36)}`;
    const { error } = await sb.from('tasks').insert({ id: taskId, title, priority, due_date: dueDate || null, status: 'pending', created_at: new Date().toISOString(), source: 'agent' });
    if (error) return { success: false, error: error.message };
    return { success: true, taskId, message: `משימה "${title}" נוצרה בהצלחה` };
  },
};

// #endregion

// #region Tool: generate_document_draft

/** @see AgentTool — create document drafts */
export const generateDocumentDraftTool: AgentTool = {
  name: 'generate_document_draft',
  descriptionHe: 'יצירת טיוטת מסמך',
  allowedLayers: ['command', 'output'],
  declaration: {
    name: 'generate_document_draft',
    description: 'Save a document draft (letter, report, analysis) to the system.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: 'Document title in Hebrew' },
        doc_type: { type: SchemaType.STRING, description: 'Document type: letter, report, analysis, opinion, or memo' },
        content: { type: SchemaType.STRING, description: 'Full document content in Hebrew' },
        process_id: { type: SchemaType.STRING, description: 'Optional: related process ID' },
      },
      required: ['title', 'doc_type', 'content'],
    },
  },
  execute: async (args) => {
    const title = args.title as string;
    const docType = args.doc_type as string;
    const content = args.content as string;
    const processId = args.process_id as string | undefined;
    if (!isSupabaseConfigured()) {
      return { success: true, storage: 'memory_only', message: `טיוטה "${title}" נוצרה (בזיכרון בלבד)`, preview: content.substring(0, 200) + '...' };
    }
    const sb = getSupabase();
    if (!sb) return { success: false, error: 'Supabase לא זמין' };
    const docId = `doc_${Date.now().toString(36)}`;
    const { error } = await sb.from('document_drafts').insert({ id: docId, title, doc_type: docType, content, process_id: processId || null, status: 'draft', created_at: new Date().toISOString(), source: 'agent' });
    if (error) return { success: false, error: error.message };
    return { success: true, docId, message: `טיוטה "${title}" נשמרה בהצלחה`, preview: content.substring(0, 200) + '...' };
  },
};

// #endregion
