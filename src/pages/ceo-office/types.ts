/**
 * CEO Office — Domain-Specific Types
 *
 * Types and interfaces specific to the CEO Office feature.
 * Re-exports core types from the shared data layer for convenience.
 */
import type { Meeting, Task } from '../../data/calendarTypes';

// #region Calendar Types

/** A single cell in the calendar grid (one day) */
export interface CalendarDay {
  /** Date string in YYYY-MM-DD format */
  date: string;
  /** Day of month (1-31) */
  day: number;
  /** Whether this day belongs to the currently displayed month */
  isCurrentMonth: boolean;
}

/** Events grouped for a single date (used in the day detail panel) */
export interface DayEvents {
  /** Meetings scheduled for this date */
  meetings: Meeting[];
  /** Tasks due on this date */
  tasks: Task[];
}

// #endregion

// Re-export core types for convenience — avoids deep imports from ../../data/
export type { Meeting, Task } from '../../data/calendarTypes';
