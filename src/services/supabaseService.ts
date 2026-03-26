/* ============================================
   FILE: supabaseService.ts
   PURPOSE: Supabase CRUD — barrel re-exports calendar functions + knowledge/documents/status
   DEPENDENCIES: supabaseClient.ts, supabaseCalendar.ts, brainStore types
   EXPORTS: All calendar CRUD (re-exported) + knowledge, documents, notes, checkConnection
   ============================================ */
import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import type { KnowledgeEntry, IncomingDocument } from '../store/brainStore';

// #region Re-exports (backward compatibility)

/**
 * Calendar CRUD is in supabaseCalendar.ts but re-exported here
 * so `import * as db from './supabaseService'` still works.
 */
export {
  loadTasks, upsertTask, deleteTask, bulkUpsertTasks,
  loadMeetings, upsertMeeting, deleteMeeting, bulkUpsertMeetings,
} from './supabaseCalendar';

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
