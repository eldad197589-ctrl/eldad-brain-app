/* ============================================
// #region Module

   FILE: clients.ts
   PURPOSE: Type definitions
   DEPENDENCIES: None (local only)
   EXPORTS: Client, ClientProcess, PROCESS_LABELS, FILTER_OPTIONS, ALL_CLIENTS
   ============================================ */
export interface Client {
  name: string;
  process: ClientProcess;
  status: 'active' | 'done';
  source: string;
}

export type ClientProcess =
  | 'opinion'
  | 'tax'
  | 'war'
  | 'gain'
  | 'guardian'
  | 'pension'
  | 'partner'
  | 'accounting';

/** PROCESS_LABELS — Type definitions */
export const PROCESS_LABELS: Record<ClientProcess, { text: string; cls: string; color: string }> = {
  opinion:    { text: '📝 חוות דעת',       cls: 'badge-opinion',   color: '#a78bfa' },
  tax:        { text: '💼 החזרי מס',       cls: 'badge-tax',       color: '#34d399' },
  war:        { text: '🛡️ פיצויי מלחמה',  cls: 'badge-war',       color: '#f87171' },
  gain:       { text: '💰 רווח הון',       cls: 'badge-gain',      color: '#38bdf8' },
  guardian:   { text: '🛡️ אפוטרופוס',     cls: 'badge-guardian',  color: '#fbbf24' },
  pension:    { text: '💎 ייעוץ פנסיוני',  cls: 'badge-pension',   color: '#22d3ee' },
  partner:    { text: '🤝 התחשבנות',       cls: 'badge-partner',   color: '#818cf8' },
  accounting: { text: '📊 הנהלת חשבונות',  cls: 'badge-accounting', color: '#fbbf24' },
};

/** FILTER_OPTIONS — Type definitions */
export const FILTER_OPTIONS: { key: ClientProcess | 'all'; label: string; count?: number }[] = [
  { key: 'all',        label: 'הכל' },
  { key: 'opinion',    label: '📝 חוות דעת',      count: 84 },
  { key: 'tax',        label: '💼 החזרי מס',      count: 13 },
  { key: 'accounting', label: '📊 הנהלת חשבונות', count: 41 },
  { key: 'war',        label: '🛡️ פיצויי מלחמה', count: 4 },
  { key: 'gain',       label: '💰 רווח הון',      count: 1 },
  { key: 'guardian',   label: '🛡️ אפוטרופוס',    count: 1 },
  { key: 'pension',    label: '💎 ייעוץ פנסיוני', count: 1 },
];

/** ALL_CLIENTS — Type definitions */
export const ALL_CLIENTS: Client[] = [
  // All mock data removed. The system now uses live Supabase clients.
];

// #endregion
