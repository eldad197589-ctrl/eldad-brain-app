/* ============================================
   FILE: supabaseService.ts
   PURPOSE: supabaseService module
   DEPENDENCIES: None (local only)
   EXPORTS: None
   ============================================ */
/**
 * FILE: supabaseService.ts
 * PURPOSE: CRUD operations for Supabase — mirrors brainStore actions
 * DEPENDENCIES: supabaseClient.ts, calendarTypes.ts, brainStore.ts
 *
 * Each function is fire-and-forget: the store updates locally (fast UI),
 * then syncs to Supabase in the background. Errors are logged, not thrown.
 */

import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import type { Task, Meeting } from '../data/calendarTypes';
import type { KnowledgeEntry, IncomingDocument } from '../store/brainStore';

// #region Helpers

/** Convert camelCase Task to snake_case DB row */
function taskToRow(task: Task) {
  return {
    id: task.id,
    title: task.title,
    due_date: task.dueDate,
    priority: task.priority,
    status: task.status,
    category: task.category,
    notes: task.notes || null,
    source_protocol: task.sourceProtocol || null,
    action_link: task.actionLink || null,
    assignee: task.assignee || null,
    sub_tasks: task.subTasks || [],
  };
}

/** Convert snake_case DB row to camelCase Task */
function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    dueDate: row.due_date as string,
    priority: row.priority as Task['priority'],
    status: row.status as Task['status'],
    category: row.category as string,
    notes: (row.notes as string) || undefined,
    sourceProtocol: (row.source_protocol as string) || undefined,
    actionLink: (row.action_link as string) || undefined,
    assignee: (row.assignee as string) || undefined,
    subTasks: (row.sub_tasks as Task['subTasks']) || undefined,
  };
}

/** Convert camelCase Meeting to snake_case DB row */
function meetingToRow(meeting: Meeting) {
  return {
    id: meeting.id,
    title: meeting.title,
    date: meeting.date,
    time: meeting.time,
    duration: meeting.duration,
    participants: meeting.participants,
    topics: meeting.topics,
    color: meeting.color,
    completed: meeting.completed,
    prep_stages: meeting.prepStages || null,
  };
}

/** Convert snake_case DB row to camelCase Meeting */
function rowToMeeting(row: Record<string, unknown>): Meeting {
  return {
    id: row.id as string,
    title: row.title as string,
    date: row.date as string,
    time: row.time as string,
    duration: row.duration as number,
    participants: row.participants as string[],
    topics: row.topics as Meeting['topics'],
    color: row.color as string,
    completed: row.completed as boolean,
    prepStages: (row.prep_stages as Meeting['prepStages']) || undefined,
  };
}

// #endregion

// #region Tasks CRUD

/** Load all tasks from Supabase */
export async function loadTasks(): Promise<Task[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb.from('tasks').select('*').order('due_date');
  if (error) {
    console.warn('[Supabase] loadTasks error:', error.message);
    return null;
  }
  return (data || []).map(rowToTask);
}

/** Upsert a single task */
export async function upsertTask(task: Task): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const { error } = await sb.from('tasks').upsert(taskToRow(task));
  if (error) console.warn('[Supabase] upsertTask error:', error.message);
}

/** Delete a task by ID */
export async function deleteTask(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const { error } = await sb.from('tasks').delete().eq('id', id);
  if (error) console.warn('[Supabase] deleteTask error:', error.message);
}

/** Bulk upsert tasks (for initial seed sync) */
export async function bulkUpsertTasks(tasks: Task[]): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const { error } = await sb.from('tasks').upsert(tasks.map(taskToRow));
  if (error) console.warn('[Supabase] bulkUpsertTasks error:', error.message);
}

// #endregion

// #region Meetings CRUD

/** Load all meetings from Supabase */
export async function loadMeetings(): Promise<Meeting[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb.from('meetings').select('*').order('date');
  if (error) {
    console.warn('[Supabase] loadMeetings error:', error.message);
    return null;
  }
  return (data || []).map(rowToMeeting);
}

/** Upsert a single meeting */
export async function upsertMeeting(meeting: Meeting): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const { error } = await sb.from('meetings').upsert(meetingToRow(meeting));
  if (error) console.warn('[Supabase] upsertMeeting error:', error.message);
}

/** Delete a meeting by ID */
export async function deleteMeeting(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const { error } = await sb.from('meetings').delete().eq('id', id);
  if (error) console.warn('[Supabase] deleteMeeting error:', error.message);
}

/** Bulk upsert meetings (for initial seed sync) */
export async function bulkUpsertMeetings(meetings: Meeting[]): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const { error } = await sb.from('meetings').upsert(meetings.map(meetingToRow));
  if (error) console.warn('[Supabase] bulkUpsertMeetings error:', error.message);
}

// #endregion

// #region Daily Notes CRUD

/** Load all daily notes */
export async function loadDailyNotes(): Promise<Record<string, string> | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb.from('daily_notes').select('*');
  if (error) {
    console.warn('[Supabase] loadDailyNotes error:', error.message);
    return null;
  }
  const notes: Record<string, string> = {};
  for (const row of data || []) {
    notes[row.date as string] = row.content as string;
  }
  return notes;
}

/** Upsert a daily note */
export async function upsertDailyNote(date: string, content: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const { error } = await sb.from('daily_notes').upsert({ date, content });
  if (error) console.warn('[Supabase] upsertDailyNote error:', error.message);
}

// #endregion

// #region Knowledge Log CRUD

/** Load knowledge log entries */
export async function loadKnowledgeLog(): Promise<KnowledgeEntry[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('knowledge_log')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[Supabase] loadKnowledgeLog error:', error.message);
    return null;
  }
  return (data || []).map(row => ({
    id: row.id as string,
    summary: row.summary as string,
    source: row.source as string,
    layer: row.layer as string,
    timestamp: row.created_at as string,
  }));
}

/** Insert a knowledge log entry */
export async function insertKnowledgeEntry(entry: KnowledgeEntry): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const { error } = await sb.from('knowledge_log').insert({
    id: entry.id,
    summary: entry.summary,
    source: entry.source,
    layer: entry.layer,
    created_at: entry.timestamp,
  });
  if (error) console.warn('[Supabase] insertKnowledgeEntry error:', error.message);
}

// #endregion

// #region Documents CRUD

/** Load incoming documents */
export async function loadDocuments(): Promise<IncomingDocument[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('documents')
    .select('*')
    .order('intake_date', { ascending: false });

  if (error) {
    console.warn('[Supabase] loadDocuments error:', error.message);
    return null;
  }
  return (data || []).map(row => ({
    id: row.id as string,
    description: row.description as string,
    docType: row.doc_type as string,
    source: row.source as string,
    linkedTo: row.linked_to as string,
    status: row.status as IncomingDocument['status'],
    hasVat: row.has_vat as boolean | undefined,
    amount: row.amount as number | undefined,
    intakeDate: row.intake_date as string,
  }));
}

/** Insert an incoming document */
export async function insertDocument(doc: IncomingDocument): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const { error } = await sb.from('documents').insert({
    id: doc.id,
    description: doc.description,
    doc_type: doc.docType,
    source: doc.source,
    linked_to: doc.linkedTo,
    status: doc.status,
    has_vat: doc.hasVat ?? null,
    amount: doc.amount ?? null,
    intake_date: doc.intakeDate,
  });
  if (error) console.warn('[Supabase] insertDocument error:', error.message);
}

/** Update document status */
export async function updateDocumentStatus(
  id: string,
  status: IncomingDocument['status'],
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const { error } = await sb.from('documents').update({ status }).eq('id', id);
  if (error) console.warn('[Supabase] updateDocumentStatus error:', error.message);
}

/** Delete a document */
export async function deleteDocument(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const { error } = await sb.from('documents').delete().eq('id', id);
  if (error) console.warn('[Supabase] deleteDocument error:', error.message);
}

// #endregion

// #region Sync Status

/** Check if Supabase is reachable */
export async function checkConnection(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb.from('tasks').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

// #endregion
