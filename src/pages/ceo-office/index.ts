/**
 * CEO Office — Barrel Exports
 *
 * Default export: CeoOffice orchestrator component (used by React.lazy in main.tsx)
 * Re-exports: Hooks and types for potential cross-feature reuse.
 */

/* Default page export — used by main.tsx lazy() import */
export { default } from './CeoOffice';

/* Hooks — reusable across the app if needed */
export { useMeetings, useTasks } from './hooks';

/* Types — for consumers that need to work with CEO Office data */
export type { CalendarDay, DayEvents } from './types';
