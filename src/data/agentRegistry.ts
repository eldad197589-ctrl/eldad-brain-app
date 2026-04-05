/* ============================================
   FILE: agentRegistry.ts
   PURPOSE: agentRegistry module
   DEPENDENCIES: None (local only)
   EXPORTS: AgentLayer, AgentStatus, Agent, MissionStep, Mission, Form4Report, LAYER_CONFIG, AGENTS, getAgentById, getAgentsByLayer, getLayerOrder
   ============================================ */
/**
 * Agent Registry — All 23 AI Agents in 6 Layers
 *
 * The complete army of agents that power Eldad's Brain.
 * Each agent has a specific role, layer, and capabilities.
 */

// #region Types

export type AgentLayer =
  | 'command'    // 🧠 פיקוד ותכנון
  | 'intake'     // 📥 קליטה וזיהוי
  | 'processing' // ⚙️ עיבוד וניתוח
  | 'output'     // 📄 הפקה ושליחה
  | 'support';   // 🔧 תמיכה ותיוק

export type AgentStatus = 'idle' | 'working' | 'done' | 'error' | 'waiting';

export interface Agent {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  layer: AgentLayer;
  description: string;
  capabilities: string[];
  status: AgentStatus;
}

export interface MissionStep {
  id: string;
  agentId: string;
  description: string;
  status: AgentStatus;
  output?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Mission {
  id: string;
  mode: 'process' | 'filing' | 'build' | 'audit';
  title: string;
  instruction: string;
  systemName: string;
  processId?: string;
  clientId?: string;
  /** Case ID — when mission operates on a CaseEntity */
  caseId?: string;
  steps: MissionStep[];
  status: 'planning' | 'executing' | 'review' | 'completed';
  form4?: Form4Report;
  createdAt: string;
}

export interface Form4Report {
  systemName: string;
  version: string;
  agentsUsed: string[];
  checklist: Record<string, boolean>;
  issuesFound: number;
  healthScore: number;
  recommendation: 'approved' | 'needs_fix';
  completedAt: string;
}

// #endregion

// #region Layer Config

/** LAYER_CONFIG — business process layers */
export const LAYER_CONFIG: Record<AgentLayer, { name: string; emoji: string; color: string }> = {
  command:    { name: 'פיקוד',    emoji: '🧠', color: '#c9a84c' },
  intake:     { name: 'קליטה',    emoji: '📥', color: '#3b82f6' },
  processing: { name: 'עיבוד',    emoji: '⚙️', color: '#a78bfa' },
  output:     { name: 'הפקה',     emoji: '📄', color: '#10b981' },
  support:    { name: 'תמיכה',    emoji: '🔧', color: '#f59e0b' },
};

// #endregion

// #region Agent Registry — 7 Business Agents

/** AGENTS — 7 business process agents matching AgentRole from brainTypes */
export const AGENTS: Agent[] = [
  // ═══ 🧠 פיקוד ═══
  {
    id: 'system_brain', name: 'מוח המערכת', nameEn: 'System Brain',
    emoji: '🧠', layer: 'command', status: 'idle',
    description: 'מנהל תהליכים, מפענח בקשות, מקצה סוכנים, מדווח לאלדד',
    capabilities: ['ניתוב תהליכים', 'הקצאת סוכנים', 'ניהול pipeline', 'דיווח למנכ"ל'],
  },

  // ═══ 📥 קליטה ═══
  {
    id: 'intake_agent', name: 'סוכן קליטה', nameEn: 'Intake Agent',
    emoji: '📥', layer: 'intake', status: 'idle',
    description: 'קולט מסמכים, מזהה סוג (ביטול קנסות, מכתב, חשבונית), מוצא לקוח, פותח תיק',
    capabilities: ['זיהוי מסמכים', 'חיפוש לקוח', 'פתיחת תיק', 'OCR', 'סיווג אוטומטי'],
  },
  {
    id: 'validation_agent', name: 'סוכן אימות', nameEn: 'Validation Agent',
    emoji: '✅', layer: 'intake', status: 'idle',
    description: 'בודק שהנתונים שלמים — חסר ת.ז? חסר כתובת? חסר אסמכתא?',
    capabilities: ['בדיקת שלמות', 'אימות נתונים', 'דרישת השלמות', 'בדיקת תנאי סף'],
  },

  // ═══ ⚙️ עיבוד ═══
  {
    id: 'analysis_agent', name: 'סוכן ניתוח', nameEn: 'Analysis Agent',
    emoji: '🔍', layer: 'processing', status: 'idle',
    description: 'מנתח מצב, מחשב סכומים, משווה, מפיק תובנות',
    capabilities: ['ניתוח פיננסי', 'חישוב מס', 'השוואת תקופות', 'הערכת סיכונים'],
  },
  {
    id: 'decision_support_agent', name: 'סוכן החלטות', nameEn: 'Decision Support Agent',
    emoji: '👔', layer: 'processing', status: 'idle',
    description: 'מציג אפשרויות לאלדד, ממליץ, ממתין לאישור על פעולות רגישות',
    capabilities: ['הצגת חלופות', 'המלצה', 'בקשת אישור', 'הכנת חומרי החלטה'],
  },

  // ═══ 📄 הפקה ═══
  {
    id: 'document_agent', name: 'סוכן מסמכים', nameEn: 'Document Agent',
    emoji: '📄', layer: 'output', status: 'idle',
    description: 'כותב מכתבים, ממלא טפסים, מייצר דוחות, מכין חומרים לפגישות',
    capabilities: ['כתיבת מכתבים', 'מילוי טפסים', 'יצירת דוחות', 'הכנת חומרי פגישה', 'PDF'],
  },
  {
    id: 'submission_agent', name: 'סוכן שליחה ותיוק', nameEn: 'Submission Agent',
    emoji: '📮', layer: 'output', status: 'idle',
    description: 'שולח מסמכים, מתעד, מעדכן סטטוס, שומר בתיק — גם לדברים שצריכים רק תיוק',
    capabilities: ['שליחה', 'תיעוד', 'תיוק', 'עדכון סטטוס', 'התראה למנכ"ל'],
  },
];

// #endregion

// #region Helpers

/** getAgentById — agentRegistry module */
export function getAgentById(id: string): Agent | undefined {
  return AGENTS.find(a => a.id === id);
}

/** getAgentsByLayer — agentRegistry module */
export function getAgentsByLayer(layer: AgentLayer): Agent[] {
  return AGENTS.filter(a => a.layer === layer);
}

/** getLayerOrder — business process layer order */
export function getLayerOrder(): AgentLayer[] {
  return ['command', 'intake', 'processing', 'output', 'support'];
}

// #endregion
