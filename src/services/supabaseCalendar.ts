/* ============================================
   FILE: supabaseCalendar.ts
   PURPOSE: Supabase CRUD for Tasks and Meetings (calendar domain)
   DEPENDENCIES: supabaseClient.ts, calendarTypes.ts
   EXPORTS: loadTasks, upsertTask, deleteTask, bulkUpsertTasks, loadMeetings, upsertMeeting, deleteMeeting, bulkUpsertMeetings
   ============================================ */
import { getSupabase } from './supabaseClient';
import type { Task, Meeting } from '../data/calendarTypes';

// #region Row Converters

/** Convert camelCase Task to snake_case DB row */
export function taskToRow(task: Task) {
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
export function rowToTask(row: Record<string, unknown>): Task {
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
export function meetingToRow(meeting: Meeting) {
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
export function rowToMeeting(row: Record<string, unknown>): Meeting {
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
