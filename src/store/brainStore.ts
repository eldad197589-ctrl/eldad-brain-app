/* ============================================
   FILE: brainStore.ts
   PURPOSE: Type definitions
   DEPENDENCIES: zustand
   EXPORTS: KnowledgeEntry, IncomingDocument, SyncStatus, useBrainStore
   ============================================ */
/**
 * FILE: brainStore.ts
 * PURPOSE: Central Zustand store — single source of truth for all shared data
 * DEPENDENCIES: zustand, calendarTypes, supabaseService
 *
 * Per MASTER_BRAIN_INSTRUCTIONS Part 7:
 * "נתון אחד = מקום אחד = כולם קוראים משם"
 *
 * HYBRID MODE:
 * - Zustand = in-memory reactive store (instant UI)
 * - Supabase = persistent cloud DB (when configured)
 * - localStorage = fallback (when Supabase not configured)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Meeting, Task } from '../data/calendarTypes';
import { SEED_MEETINGS, SEED_TASKS } from '../data/calendarTypes';
import { isSupabaseConfigured } from '../services/supabaseClient';
import * as db from '../services/supabaseService';

// #region Types

/** An entry in the "Brain learned" log */
export interface KnowledgeEntry {
  /** Unique ID */
  id: string;
  /** What was learned */
  summary: string;
  /** Source: 'conversation' | 'document' | 'meeting' */
  source: string;
  /** Timestamp ISO string */
  timestamp: string;
  /** Knowledge layer: 'identity' | 'knowledge' | 'process' | 'bot' */
  layer: string;
}

/** An incoming document per doctrine Part 10 */
export interface IncomingDocument {
  /** Unique ID */
  id: string;
  /** Document description */
  description: string;
  /** Type: 'supplier_invoice' | 'client_doc' | 'tax_notice' | 'contract' | 'other' */
  docType: string;
  /** Source channel: 'email' | 'whatsapp' | 'scan' | 'manual' */
  source: string;
  /** Linked client or case name */
  linkedTo: string;
  /** Status: 'pending' | 'classified' | 'processed' */
  status: 'pending' | 'classified' | 'processed';
  /** Intake timestamp */
  intakeDate: string;
  /** Has VAT? */
  hasVat?: boolean;
  /** Amount if known */
  amount?: number;
}

/** Sync status indicator */
export type SyncStatus = 'local' | 'cloud' | 'syncing' | 'error';

/** Shape of the central store */
interface BrainState {
  // ═══ Sync ═══
  syncStatus: SyncStatus;
  initializeFromSupabase: () => Promise<void>;

  // ═══ Tasks ═══
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  toggleSubTask: (taskId: string, subIdx: number) => void;

  // ═══ Meetings ═══
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  deleteMeeting: (id: string) => void;
  updateMeeting: (id: string, updates: Partial<Omit<Meeting, 'id'>>) => void;

  // ═══ Daily Notes ═══
  dailyNotes: Record<string, string>;
  getNote: (date: string) => string;
  setNote: (date: string, text: string) => void;

  // ═══ Knowledge Log ═══
  knowledgeLog: KnowledgeEntry[];
  addKnowledge: (entry: Omit<KnowledgeEntry, 'id' | 'timestamp'>) => void;

  // ═══ Document Intake (Part 10) ═══
  documents: IncomingDocument[];
  addDocument: (doc: Omit<IncomingDocument, 'id' | 'intakeDate'>) => void;
  updateDocStatus: (id: string, status: IncomingDocument['status']) => void;
  deleteDocument: (id: string) => void;
}

// #endregion

// #region Helpers

/** Generate a short unique ID */
const uid = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// #endregion

// #region Store

/**
 * Central brain store — persisted to localStorage.
 * All screens read from here. All actions write here.
 *
 * @example
 * const tasks = useBrainStore(s => s.tasks);
 * const addTask = useBrainStore(s => s.addTask);
 */
export const useBrainStore = create<BrainState>()(
  persist(
    (set, get) => ({
      // ═══ Sync ═══
      syncStatus: (isSupabaseConfigured() ? 'syncing' : 'local') as SyncStatus,

      initializeFromSupabase: async () => {
        if (!isSupabaseConfigured()) {
          set({ syncStatus: 'local' });
          return;
        }
        set({ syncStatus: 'syncing' });
        try {
          const [tasks, meetings, dailyNotes, knowledgeLog, documents] = await Promise.all([
            db.loadTasks(),
            db.loadMeetings(),
            db.loadDailyNotes(),
            db.loadKnowledgeLog(),
            db.loadDocuments(),
          ]);

          // If DB is empty, seed it with initial data
          const currentTasks = get().tasks;
          const currentMeetings = get().meetings;

          if (tasks && tasks.length === 0 && currentTasks.length > 0) {
            await db.bulkUpsertTasks(currentTasks);
          }
          if (meetings && meetings.length === 0 && currentMeetings.length > 0) {
            await db.bulkUpsertMeetings(currentMeetings);
          }

          set({
            syncStatus: 'cloud',
            ...(tasks && tasks.length > 0 ? { tasks } : {}),
            ...(meetings && meetings.length > 0 ? { meetings } : {}),
            ...(dailyNotes ? { dailyNotes } : {}),
            ...(knowledgeLog && knowledgeLog.length > 0 ? { knowledgeLog } : {}),
            ...(documents && documents.length > 0 ? { documents } : {}),
          });
          console.log('[Brain] ☁️ Synced with Supabase');
        } catch (err) {
          console.warn('[Brain] Supabase sync failed, using localStorage:', err);
          set({ syncStatus: 'error' });
        }
      },

      // ═══ Tasks ═══
      tasks: SEED_TASKS,

      addTask: (task) => {
        const newTask = { ...task, id: uid() } as Task;
        set((s) => ({ tasks: [...s.tasks, newTask] }));
        db.upsertTask(newTask);
      },

      toggleTask: (id) => set((s) => {
        const tasks = s.tasks.map((t) =>
          t.id === id ? { ...t, status: (t.status === 'done' ? 'todo' : 'done') as Task['status'] } : t
        );
        const updated = tasks.find(t => t.id === id);
        if (updated) db.upsertTask(updated);
        return { tasks };
      }),

      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
        db.deleteTask(id);
      },

      updateTask: (id, updates) => set((s) => {
        const tasks = s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
        const updated = tasks.find(t => t.id === id);
        if (updated) db.upsertTask(updated);
        return { tasks };
      }),

      toggleSubTask: (taskId, subIdx) => set((s) => {
        const tasks = s.tasks.map((t) => {
          if (t.id !== taskId || !t.subTasks) return t;
          const updatedSubs = t.subTasks.map((sub, i) =>
            i === subIdx ? { ...sub, done: !sub.done } : sub
          );
          return { ...t, subTasks: updatedSubs };
        });
        const updated = tasks.find(t => t.id === taskId);
        if (updated) db.upsertTask(updated);
        return { tasks };
      }),

      // ═══ Meetings ═══
      meetings: SEED_MEETINGS,

      addMeeting: (meeting) => {
        const newMeeting = { ...meeting, id: uid() } as Meeting;
        set((s) => ({ meetings: [...s.meetings, newMeeting] }));
        db.upsertMeeting(newMeeting);
      },

      deleteMeeting: (id) => {
        set((s) => ({ meetings: s.meetings.filter((m) => m.id !== id) }));
        db.deleteMeeting(id);
      },

      updateMeeting: (id, updates) => set((s) => {
        const meetings = s.meetings.map((m) => (m.id === id ? { ...m, ...updates } : m));
        const updated = meetings.find(m => m.id === id);
        if (updated) db.upsertMeeting(updated);
        return { meetings };
      }),

      // ═══ Daily Notes ═══
      dailyNotes: {},

      getNote: (date) => get().dailyNotes[date] || '',

      setNote: (date, text) => {
        set((s) => ({ dailyNotes: { ...s.dailyNotes, [date]: text } }));
        db.upsertDailyNote(date, text);
      },

      // ═══ Knowledge Log ═══
      knowledgeLog: [],

      addKnowledge: (entry) => {
        const newEntry: KnowledgeEntry = {
          ...entry, id: uid(), timestamp: new Date().toISOString(),
        };
        set((s) => ({ knowledgeLog: [...s.knowledgeLog, newEntry] }));
        db.insertKnowledgeEntry(newEntry);
      },

      // ═══ Document Intake (Part 10) ═══
      documents: [],

      addDocument: (doc) => {
        const newDoc: IncomingDocument = {
          ...doc, id: uid(), intakeDate: new Date().toISOString(),
        };
        set((s) => ({ documents: [...s.documents, newDoc] }));
        db.insertDocument(newDoc);
      },

      updateDocStatus: (id, status) => {
        set((s) => ({
          documents: s.documents.map((d) => (d.id === id ? { ...d, status } : d)),
        }));
        db.updateDocumentStatus(id, status);
      },

      deleteDocument: (id) => {
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) }));
        db.deleteDocument(id);
      },
    }),
    {
      name: 'brain-store',
      version: 5,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        // v2 → v3: convert meeting topics from string[] to MeetingTopic[]
        if (version < 3 && Array.isArray(state.meetings)) {
          state.meetings = (state.meetings as Array<Record<string, unknown>>).map(m => ({
            ...m,
            topics: Array.isArray(m.topics)
              ? (m.topics as unknown[]).map(t =>
                  typeof t === 'string' ? { text: t } : t
                )
              : m.topics,
          }));
        }
        // v3 → v4: inject new signing meeting if missing, refresh register-robium task
        if (version < 4) {
          if (Array.isArray(state.meetings)) {
            const meetings = state.meetings as Array<Record<string, unknown>>;
            const hasNewMeeting = meetings.some(m => m.id === 'founders-signing-march-25-2026');
            if (!hasNewMeeting) {
              const newMeeting = SEED_MEETINGS.find(m => m.id === 'founders-signing-march-25-2026');
              if (newMeeting) meetings.push(newMeeting as unknown as Record<string, unknown>);
            }
          }
          if (Array.isArray(state.tasks)) {
            const tasks = state.tasks as Array<Record<string, unknown>>;
            const idx = tasks.findIndex(t => t.id === 'register-robium-ltd');
            const updatedTask = SEED_TASKS.find(t => t.id === 'register-robium-ltd');
            if (idx >= 0 && updatedTask) {
              tasks[idx] = updatedTask as unknown as Record<string, unknown>;
            }
          }
        }
        // v4 → v5: inject prepStages onto founders signing meeting
        if (version < 5) {
          if (Array.isArray(state.meetings)) {
            const meetings = state.meetings as Array<Record<string, unknown>>;
            const idx = meetings.findIndex(m => m.id === 'founders-signing-march-25-2026');
            const seedMeeting = SEED_MEETINGS.find(m => m.id === 'founders-signing-march-25-2026');
            if (idx >= 0 && seedMeeting?.prepStages) {
              meetings[idx] = { ...meetings[idx], prepStages: seedMeeting.prepStages as unknown };
            } else if (idx < 0 && seedMeeting) {
              meetings.push(seedMeeting as unknown as Record<string, unknown>);
            }
          }
        }
        return state;
      },
    }
  )
);

// #endregion
