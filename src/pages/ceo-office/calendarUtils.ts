/* ============================================
   FILE: calendarUtils.ts
   PURPOSE: Pure utility functions
   DEPENDENCIES: None (local only)
   EXPORTS: toDateStr, uid, getDaysInMonth, getFirstDayOfWeek
   ============================================ */
/**
 * CEO Office — Calendar & Date Utilities
 *
 * Pure utility functions for date formatting and calendar math.
 * No side effects, no React dependencies.
 */

// #region Date Formatting

/** Format a Date object as `YYYY-MM-DD` string */
export function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Generate a short unique ID (alphanumeric + timestamp) */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// #endregion

// #region Calendar Math

/** Get the number of days in a given month (0-indexed month) */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Get the day-of-week (0=Sunday) for the 1st of a given month */
export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// #endregion
