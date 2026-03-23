/**
 * FILE: hooks.ts
 * PURPOSE: CEO Office hooks — reads from central brainStore + calendar utilities
 * DEPENDENCIES: brainStore, calendarTypes, calendarUtils
 *
 * Per MASTER_BRAIN_INSTRUCTIONS Part 7:
 * "מסך קורא מ-store בלבד"
 */
import { useMemo } from 'react';
import { useBrainStore } from '../../store/brainStore';
import type { Meeting, Task } from '../../data/calendarTypes';
import { getDaysInMonth, getFirstDayOfWeek, toDateStr } from './calendarUtils';
import type { CalendarDay, DayEvents } from './types';

// #region useMeetings — from store

/**
 * Read meetings + actions from the central store.
 * Replaces the old localStorage-based hook.
 */
export function useMeetings() {
  const meetings = useBrainStore((s) => s.meetings);
  const addMeeting = useBrainStore((s) => s.addMeeting);
  const deleteMeeting = useBrainStore((s) => s.deleteMeeting);
  return { meetings, addMeeting, deleteMeeting };
}

// #endregion

// #region useTasks — from store

/**
 * Read tasks + actions from the central store.
 * Replaces the old localStorage-based hook.
 */
export function useTasks() {
  const tasks = useBrainStore((s) => s.tasks);
  const addTask = useBrainStore((s) => s.addTask);
  const toggleTask = useBrainStore((s) => s.toggleTask);
  const deleteTask = useBrainStore((s) => s.deleteTask);
  const toggleSubTask = useBrainStore((s) => s.toggleSubTask);
  const updateTask = useBrainStore((s) => s.updateTask);
  return { tasks, addTask, toggleTask, deleteTask, toggleSubTask, updateTask };
}

// #endregion

// #region useDailyNotes — from store

/**
 * Read daily notes from the central store.
 */
export function useDailyNotes() {
  const getNote = useBrainStore((s) => s.getNote);
  const setNote = useBrainStore((s) => s.setNote);
  return { getNote, setNote };
}

// #endregion

// #region useCalendarGrid

/**
 * Builds the 42-cell calendar grid for a given month.
 *
 * @param currentYear — The year to display
 * @param currentMonth — The month to display (0-indexed)
 * @returns Array of 42 CalendarDay objects
 */
export function useCalendarGrid(currentYear: number, currentMonth: number): CalendarDay[] {
  return useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfWeek(currentYear, currentMonth);
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

    const days: CalendarDay[] = [];

    // Previous month fill
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const mm = currentMonth === 0 ? 11 : currentMonth - 1;
      const yy = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({
        date: `${yy}-${String(mm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        day: d,
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        day: d,
        isCurrentMonth: true,
      });
    }

    // Next month fill (42 cells total)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const mm = currentMonth === 11 ? 0 : currentMonth + 1;
      const yy = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({
        date: `${yy}-${String(mm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        day: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);
}

// #endregion

// #region useEventsByDate

/**
 * Indexes meetings and tasks by date for O(1) lookup.
 *
 * @param meetings — All meetings
 * @param tasks — All tasks
 * @returns Record keyed by YYYY-MM-DD → { meetings, tasks }
 */
export function useEventsByDate(
  meetings: Meeting[],
  tasks: Task[],
): Record<string, DayEvents> {
  return useMemo(() => {
    const map: Record<string, DayEvents> = {};
    meetings.forEach((m) => {
      if (!map[m.date]) map[m.date] = { meetings: [], tasks: [] };
      map[m.date].meetings.push(m);
    });
    tasks.forEach((t) => {
      if (!map[t.dueDate]) map[t.dueDate] = { meetings: [], tasks: [] };
      map[t.dueDate].tasks.push(t);
    });
    return map;
  }, [meetings, tasks]);
}

// #endregion

// #region useUpcomingMeetings

/**
 * Filters and sorts meetings within the next 7 days.
 */
export function useUpcomingMeetings(meetings: Meeting[]): Meeting[] {
  return useMemo(() => {
    const now = new Date();
    const in7 = new Date(now);
    in7.setDate(in7.getDate() + 7);
    return meetings
      .filter((m) => m.date >= toDateStr(now) && m.date <= toDateStr(in7))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [meetings]);
}

// #endregion

// #region useOverdueTasks

/**
 * Counts tasks that are past their due date and not done.
 */
export function useOverdueTasks(tasks: Task[], todayStr: string): number {
  return useMemo(() => {
    return tasks.filter((t) => t.status !== 'done' && t.dueDate < todayStr).length;
  }, [tasks, todayStr]);
}

// #endregion
