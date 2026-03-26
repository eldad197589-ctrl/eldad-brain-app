/* ============================================
   FILE: AgentCommandData.ts
   PURPOSE: Static data and types for the Agent Command Center
   DEPENDENCIES: None
   EXPORTS: AgentTask, MorningBriefItem, AGENT_TASKS, STATUS_CONFIG
   ============================================ */

// #region Types

/** A task assigned to an agent in the command center */
export interface AgentTask {
  id: string;
  processId: string;
  processName: string;
  clientName: string;
  agentEmoji: string;
  agentName: string;
  status: 'working' | 'waiting_ceo' | 'waiting_client' | 'done' | 'blocked';
  description: string;
  priority: 'critical' | 'high' | 'normal';
  updatedAt: string;
  actionRequired?: string;
  route?: string;
}

/** A single item in the CEO morning briefing */
export interface MorningBriefItem {
  emoji: string;
  text: string;
  type: 'urgent' | 'info' | 'success';
}

// #endregion

// #region Task Data

/** Real active tasks — what Eldad actually has on his plate */
export const AGENT_TASKS: AgentTask[] = [
  {
    id: 'PC-001', processId: 'penalty_cancellation', processName: 'ביטול קנסות מס הכנסה',
    clientName: 'דוד שמעון (אבא)', agentEmoji: '🚨', agentName: 'סוכן טריגר',
    status: 'done', description: 'שלב 1 — קבלת הודעה מאבא · מכתב חוב התקבל · התקשרת לחבר במס הכנסה',
    priority: 'normal', updatedAt: '2026-03-16T10:00:00',
    route: '/flow/penalty-cancellation',
  },
  {
    id: 'PC-002', processId: 'penalty_cancellation', processName: 'ביטול קנסות מס הכנסה',
    clientName: 'דוד שמעון (אבא)', agentEmoji: '🔍', agentName: 'סוכן איסוף',
    status: 'waiting_ceo', description: 'שלב 2 — כניסה לשע"מ / אזור אישי של אבא · לבדוק ממה נובע החוב',
    priority: 'high', updatedAt: '2026-03-16T21:00:00',
    actionRequired: 'להיכנס לשע"מ ולבדוק מצב חשבון מס הכנסה של אבא',
    route: '/flow/penalty-cancellation',
  },
  {
    id: 'PC-003', processId: 'penalty_cancellation', processName: 'ביטול קנסות מס הכנסה',
    clientName: 'דוד שמעון (אבא)', agentEmoji: '⚖️', agentName: 'סוכן החלטה',
    status: 'waiting_client', description: 'שלב 3 — תלוי בתוצאות שלב 2: הפרדה בין קנסות לחוב מס אמיתי',
    priority: 'normal', updatedAt: '2026-03-16T21:00:00',
    route: '/flow/penalty-cancellation',
  },
  {
    id: 'PC-004', processId: 'penalty_cancellation', processName: 'ביטול קנסות — מסלול A',
    clientName: 'דוד שמעון (אבא)', agentEmoji: '✍️', agentName: 'סוכן ניסוח',
    status: 'waiting_client', description: 'שלב 4 — כתיבת מכתב ביטול קנסות · ממתין לתוצאות שלב 2+3',
    priority: 'normal', updatedAt: '2026-03-16T21:00:00',
    route: '/flow/penalty-cancellation',
  },
  {
    id: 'PC-005', processId: 'penalty_cancellation', processName: 'ביטול קנסות — מסלול B',
    clientName: 'דוד שמעון (אבא)', agentEmoji: '💳', agentName: 'סוכן הגשה',
    status: 'waiting_client', description: 'שלב 5 — תשלום חוב מס אמיתי (אם ישנו) · ממתין לתוצאות שלב 2+3',
    priority: 'normal', updatedAt: '2026-03-16T21:00:00',
    route: '/flow/penalty-cancellation',
  },
];

// #endregion

// #region Status Config

/** Visual config for each task status */
export const STATUS_CONFIG: Record<AgentTask['status'], { label: string; color: string; icon: string; pulse?: boolean }> = {
  working: { label: '🤖 עובד', color: '#3b82f6', icon: '⚡', pulse: true },
  waiting_ceo: { label: '🔴 ממתין לך!', color: '#ef4444', icon: '👔', pulse: true },
  waiting_client: { label: '⏳ ממתין ללקוח', color: '#f59e0b', icon: '👤' },
  done: { label: '✅ הושלם', color: '#10b981', icon: '🏁' },
  blocked: { label: '🚫 חסום', color: '#ef4444', icon: '⚠️', pulse: true },
};

// #endregion
