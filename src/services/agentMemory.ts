/* ============================================
   FILE: agentMemory.ts
   PURPOSE: Persistent memory for agent runs, tool results, and notes
   DEPENDENCIES: supabaseClient.ts
   EXPORTS: saveAgentRun, getAgentHistory, saveToolResult, saveAgentNote, getAgentNotes
   ============================================ */
/**
 * Agent Memory — Persistent Storage for Agent Activity
 *
 * Saves every agent run, tool call, and finding to Supabase.
 * Falls back to localStorage when Supabase is not configured.
 * This is the foundation for agent learning and cross-mission knowledge.
 */

import { getSupabase, isSupabaseConfigured } from './supabaseClient';

// #region Types

/** Record of a single agent step execution */
export interface AgentRunRecord {
  /** Unique run ID */
  id: string;
  /** Parent mission ID */
  missionId: string;
  /** Agent that executed this step */
  agentId: string;
  /** Step ID within the mission */
  stepId: string;
  /** Human-readable step description */
  stepDescription?: string;
  /** The prompt sent to the agent */
  inputPrompt?: string;
  /** The agent's output text */
  outputText?: string;
  /** Names of tools used during execution */
  toolsUsed: string[];
  /** Execution duration in ms */
  durationMs: number;
  /** Whether execution succeeded */
  success: boolean;
  /** Error message if failed */
  errorMessage?: string;
  /** ISO timestamp */
  createdAt: string;
}

/** Record of a single tool execution */
export interface ToolResultRecord {
  /** Unique result ID */
  id: string;
  /** Parent agent run ID */
  runId: string;
  /** Tool name */
  toolName: string;
  /** Tool input arguments */
  toolInput: Record<string, unknown>;
  /** Tool output */
  toolOutput: Record<string, unknown>;
  /** Whether execution succeeded */
  success: boolean;
  /** ISO timestamp */
  createdAt: string;
}

/** A note saved by an agent */
export interface AgentNoteRecord {
  /** Unique note ID */
  id: string;
  /** Optional mission ID */
  missionId?: string;
  /** Agent that saved this note */
  agentId: string;
  /** Optional process ID */
  processId?: string;
  /** Optional client ID */
  clientId?: string;
  /** Note type */
  noteType: 'finding' | 'decision' | 'recommendation' | 'warning';
  /** Note content */
  content: string;
  /** ISO timestamp */
  createdAt: string;
}

// #endregion

// #region ID Generation

/** Generate a unique ID for records */
function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

// #endregion

// #region localStorage Fallback

const RUNS_KEY = 'brain_agent_runs';
const TOOLS_KEY = 'brain_tool_results';
const NOTES_KEY = 'brain_agent_notes';

/** Load array from localStorage */
function loadFromLocal<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Save array to localStorage (keep last 100) */
function saveToLocal<T>(key: string, items: T[]): void {
  const trimmed = items.slice(0, 100);
  localStorage.setItem(key, JSON.stringify(trimmed));
}

// #endregion

// #region Agent Run Persistence

/**
 * Save a record of an agent step execution.
 *
 * @param run - The run record (without id/createdAt — they'll be generated)
 * @returns The generated run ID
 */
export async function saveAgentRun(
  run: Omit<AgentRunRecord, 'id' | 'createdAt'>,
): Promise<string> {
  const id = generateId('run');
  const createdAt = new Date().toISOString();
  const record: AgentRunRecord = { ...run, id, createdAt };

  if (isSupabaseConfigured()) {
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from('agent_runs').insert({
        id,
        mission_id: run.missionId,
        agent_id: run.agentId,
        step_id: run.stepId,
        step_description: run.stepDescription || null,
        input_prompt: run.inputPrompt?.substring(0, 5000) || null,
        output_text: run.outputText?.substring(0, 10000) || null,
        tools_used: run.toolsUsed,
        duration_ms: run.durationMs,
        success: run.success,
        error_message: run.errorMessage || null,
        created_at: createdAt,
      });
      if (error) {
        console.warn('[AgentMemory] Supabase saveAgentRun error:', error.message);
      }
    }
  }

  // Always save locally too
  const local = loadFromLocal<AgentRunRecord>(RUNS_KEY);
  local.unshift(record);
  saveToLocal(RUNS_KEY, local);

  return id;
}

/**
 * Get agent run history, optionally filtered.
 *
 * @param filters - Optional filters
 * @returns Array of run records, newest first
 */
export async function getAgentHistory(filters?: {
  missionId?: string;
  agentId?: string;
  limit?: number;
}): Promise<AgentRunRecord[]> {
  const limit = filters?.limit || 20;

  if (isSupabaseConfigured()) {
    const sb = getSupabase();
    if (sb) {
      let query = sb.from('agent_runs').select('*').order('created_at', { ascending: false }).limit(limit);

      if (filters?.missionId) {
        query = query.eq('mission_id', filters.missionId);
      }
      if (filters?.agentId) {
        query = query.eq('agent_id', filters.agentId);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data.map(mapRunFromDb);
      }
    }
  }

  // Fallback to localStorage
  let local = loadFromLocal<AgentRunRecord>(RUNS_KEY);
  if (filters?.missionId) local = local.filter(r => r.missionId === filters.missionId);
  if (filters?.agentId) local = local.filter(r => r.agentId === filters.agentId);
  return local.slice(0, limit);
}

/** Map DB row to AgentRunRecord */
function mapRunFromDb(row: Record<string, unknown>): AgentRunRecord {
  return {
    id: row.id as string,
    missionId: row.mission_id as string,
    agentId: row.agent_id as string,
    stepId: row.step_id as string,
    stepDescription: row.step_description as string | undefined,
    inputPrompt: row.input_prompt as string | undefined,
    outputText: row.output_text as string | undefined,
    toolsUsed: (row.tools_used as string[]) || [],
    durationMs: row.duration_ms as number,
    success: row.success as boolean,
    errorMessage: row.error_message as string | undefined,
    createdAt: row.created_at as string,
  };
}

// #endregion

// #region Tool Result Persistence

/**
 * Save a tool execution result.
 *
 * @param result - The tool result (without id/createdAt)
 * @returns The generated result ID
 */
export async function saveToolResult(
  result: Omit<ToolResultRecord, 'id' | 'createdAt'>,
): Promise<string> {
  const id = generateId('tool');
  const createdAt = new Date().toISOString();
  const record: ToolResultRecord = { ...result, id, createdAt };

  if (isSupabaseConfigured()) {
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from('tool_results').insert({
        id,
        run_id: result.runId,
        tool_name: result.toolName,
        tool_input: result.toolInput,
        tool_output: result.toolOutput,
        success: result.success,
        created_at: createdAt,
      });
      if (error) {
        console.warn('[AgentMemory] Supabase saveToolResult error:', error.message);
      }
    }
  }

  const local = loadFromLocal<ToolResultRecord>(TOOLS_KEY);
  local.unshift(record);
  saveToLocal(TOOLS_KEY, local);

  return id;
}

// #endregion

// #region Agent Notes Persistence

/**
 * Save a note/finding from an agent.
 *
 * @param note - The note data (without id/createdAt)
 * @returns The generated note ID
 */
export async function saveAgentNote(
  note: Omit<AgentNoteRecord, 'id' | 'createdAt'>,
): Promise<string> {
  const id = generateId('note');
  const createdAt = new Date().toISOString();
  const record: AgentNoteRecord = { ...note, id, createdAt };

  if (isSupabaseConfigured()) {
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from('agent_notes').insert({
        id,
        mission_id: note.missionId || null,
        agent_id: note.agentId,
        process_id: note.processId || null,
        client_id: note.clientId || null,
        note_type: note.noteType,
        content: note.content,
        created_at: createdAt,
      });
      if (error) {
        console.warn('[AgentMemory] Supabase saveAgentNote error:', error.message);
      }
    }
  }

  const local = loadFromLocal<AgentNoteRecord>(NOTES_KEY);
  local.unshift(record);
  saveToLocal(NOTES_KEY, local);

  return id;
}

/**
 * Get agent notes, optionally filtered.
 *
 * @param filters - Optional filters
 * @returns Array of notes, newest first
 */
export async function getAgentNotes(filters?: {
  missionId?: string;
  agentId?: string;
  processId?: string;
  noteType?: string;
  limit?: number;
}): Promise<AgentNoteRecord[]> {
  const limit = filters?.limit || 20;

  if (isSupabaseConfigured()) {
    const sb = getSupabase();
    if (sb) {
      let query = sb.from('agent_notes').select('*').order('created_at', { ascending: false }).limit(limit);

      if (filters?.missionId) query = query.eq('mission_id', filters.missionId);
      if (filters?.agentId) query = query.eq('agent_id', filters.agentId);
      if (filters?.processId) query = query.eq('process_id', filters.processId);
      if (filters?.noteType) query = query.eq('note_type', filters.noteType);

      const { data, error } = await query;
      if (!error && data) {
        return data.map(row => ({
          id: row.id as string,
          missionId: row.mission_id as string | undefined,
          agentId: row.agent_id as string,
          processId: row.process_id as string | undefined,
          clientId: row.client_id as string | undefined,
          noteType: row.note_type as AgentNoteRecord['noteType'],
          content: row.content as string,
          createdAt: row.created_at as string,
        }));
      }
    }
  }

  // Fallback to localStorage
  let local = loadFromLocal<AgentNoteRecord>(NOTES_KEY);
  if (filters?.missionId) local = local.filter(n => n.missionId === filters.missionId);
  if (filters?.agentId) local = local.filter(n => n.agentId === filters.agentId);
  if (filters?.processId) local = local.filter(n => n.processId === filters.processId);
  if (filters?.noteType) local = local.filter(n => n.noteType === filters.noteType);
  return local.slice(0, limit);
}

// #endregion
