/* ============================================
// #region Module

   FILE: calendarTypes.ts
   PURPOSE: Type definitions
   DEPENDENCIES: None (local only)
   EXPORTS: MeetingTopic, MeetingPrepItem, MeetingPrepStage, Meeting, Task, CalendarEvent, STORAGE_KEYS, PRIORITY_CONFIG, STATUS_CONFIG
   ============================================ */
/** A single topic discussed in a meeting */
export interface MeetingTopic {
  text: string;
  /** Optional internal route this topic relates to */
  link?: string;
}

/** A single prep item — link, message template, or checklist */
export interface MeetingPrepItem {
  /** Item type: link opens a page, message can be copied, checklist has toggleable items */
  type: 'link' | 'message' | 'checklist';
  /** Display label */
  label: string;
  /** For link: URL or internal route */
  href?: string;
  /** For link: if true, open inside the app via navigate */
  isInternal?: boolean;
  /** For message: template text to copy */
  messageText?: string;
  /** For message: who this message is for */
  recipient?: string;
  /** For checklist: list of items (persisted state is in localStorage via meeting ID) */
  checkItems?: string[];
}

/** A preparation stage for a meeting (e.g. "before", "during", "after") */
export interface MeetingPrepStage {
  /** Stage title, e.g. "שלב 1 — לפני הפגישה" */
  title: string;
  /** Badge / accent color */
  color: string;
  /** Items in this stage */
  items: MeetingPrepItem[];
}

export interface Meeting {
  id: string;
  title: string;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:mm
  duration: number;    // minutes
  participants: string[];
  topics: MeetingTopic[];
  color: string;
  completed: boolean;
  /** Optional preparation stages — meetings with this get a "war room" view */
  prepStages?: MeetingPrepStage[];
  /** Free-text meeting notes — editable by the user */
  meetingNotes?: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;     // YYYY-MM-DD
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'done';
  category: string;
  notes?: string;
  sourceProtocol?: string; // meeting ID that generated this task
  actionLink?: string;     // internal route to relevant page
  assignee?: string;       // responsible person (from Protokol)
  subTasks?: { text: string; done: boolean }[];
}

export interface CalendarEvent {
  type: 'meeting' | 'task';
  date: string;
  data: Meeting | Task;
}


// localStorage keys
/** STORAGE_KEYS — Type definitions */
export const STORAGE_KEYS = {
  meetings: 'brain-meetings',
  tasks: 'brain-tasks',
} as const;

// Priority config
/** PRIORITY_CONFIG — Type definitions */
export const PRIORITY_CONFIG = {
  high:   { label: 'גבוהה', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  medium: { label: 'בינונית', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  low:    { label: 'נמוכה', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
} as const;

/** STATUS_CONFIG — Type definitions */
export const STATUS_CONFIG = {
  todo:          { label: 'לביצוע', color: '#94a3b8' },
  'in-progress': { label: 'בעבודה', color: '#3b82f6' },
  done:          { label: 'הושלם', color: '#10b981' },
} as const;

// #endregion
