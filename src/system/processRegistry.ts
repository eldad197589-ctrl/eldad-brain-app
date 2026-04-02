/* ============================================
   FILE: processRegistry.ts
   PURPOSE: Process System Layer — רישום אחיד לכל תהליכי המוח.
            מקור אמת יחיד ל-sidebar, dashboard, brain map, חיפוש, ניווט.
   DEPENDENCIES: None (pure data + localStorage)
   EXPORTS: ProcessDefinition, ProcessDomain, ProcessStatus, ProcessTrigger,
            processRegistry, getProcessesByDomain, getVisibleSidebar,
            getVisibleDashboard, registerProcess, getProcessById
   ============================================ */

// #region Types

/** דומיין ראשי */
export type ProcessDomain =
  | 'core'
  | 'employees'
  | 'accounting'
  | 'financial'
  | 'special_claims'
  | 'tools'
  | 'robium'
  | 'personal'
  | 'documents'
  | 'tasks'
  | 'clients';

/** סטטוס תהליך */
export type ProcessStatus =
  | 'active'
  | 'coming_soon'
  | 'archived'
  | 'disabled';

/** טריגר שמפעיל תהליך */
export interface ProcessTrigger {
  type: 'email_classified' | 'document_received' | 'task_created'
    | 'entity_updated' | 'draft_generated' | 'manual' | 'schedule';
  /** תנאי הפעלה (למשל: category === 'legal_task') */
  condition?: string;
}

/** ישות שהתהליך מנהל */
export interface ProcessEntity {
  type: 'bill' | 'receipt' | 'task' | 'case_bundle' | 'document' | 'draft' | 'client';
  storageKey?: string;
}

/** תור שהתהליך כותב/קורא */
export interface ProcessQueue {
  name: string;
  storageKey: string;
  direction: 'read' | 'write' | 'both';
}

/** הגדרת תהליך מלאה */
export interface ProcessDefinition {
  /** מזהה ייחודי */
  id: string;
  /** שם תצוגה (עברית) */
  title: string;
  /** אימוג'י */
  emoji: string;
  /** דומיין ראשי */
  domain: ProcessDomain;
  /** דומיינים נוספים (קשרים רוחביים) */
  parentDomains: ProcessDomain[];
  /** תת-תהליכים */
  subProcesses: string[];
  /** ישויות */
  entities: ProcessEntity[];
  /** תורים */
  queues: ProcessQueue[];
  /** טריגרים */
  triggers: ProcessTrigger[];
  /** פלטים — מה התהליך מייצר */
  outputs: string[];
  /** תהליכים קשורים (IDs) */
  relatedProcesses: string[];
  /** סטטוס */
  status: ProcessStatus;
  /** מסלול ניווט */
  route?: string;
  /** נראה ב-sidebar */
  isVisibleInSidebar: boolean;
  /** נראה ב-dashboard */
  isVisibleInDashboard: boolean;
  /** מזהה ב-brain map */
  brainNodeId?: string;
  /** תיאור קצר */
  description?: string;

  // ─── AI / Agent fields (merged from old data/processRegistry) ───
  /** מילות מפתח לחיפוש AI ו-Brain Router */
  brainKeywords?: string[];
  /** קובץ flowchart HTML */
  flowchartFile?: string;
  /** קלטים נדרשים */
  requiredInputs?: string[];
  /** קלטים אופציונליים */
  optionalInputs?: string[];
  /** סוכני AI שמופעלים */
  agents?: string[];
  /** מצבי תהליך */
  processStates?: string[];
  /** קטגוריה (compensation, tax, workforce, ...) */
  category?: string;
  /** מסכים שבהם מוצג */
  screens?: string[];
}

// #endregion

// #region Registry Storage

const REGISTRY_KEY = 'eldad_process_registry';

/** טוען את ה-registry מ-localStorage */
function loadRegistry(): ProcessDefinition[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/** שומר את ה-registry */
function saveRegistry(processes: ProcessDefinition[]): void {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(processes));
  } catch { /* quota — silent */ }
}

// #endregion

// #region Core Registry API

/**
 * רישום תהליך. אם קיים — מעדכן. אם חדש — מוסיף.
 * @returns התהליך שנרשם
 */
export function registerProcess(process: ProcessDefinition): ProcessDefinition {
  const all = loadRegistry();
  const idx = all.findIndex(p => p.id === process.id);
  if (idx >= 0) {
    all[idx] = process;
  } else {
    all.push(process);
  }
  saveRegistry(all);
  console.log(`[Registry] ✅ Registered: "${process.title}" (${process.id}) → ${process.domain}`);
  return process;
}

/** כל התהליכים */
export function getAllProcesses(): ProcessDefinition[] {
  return loadRegistry();
}

/** תהליך לפי ID */
export function getProcessById(id: string): ProcessDefinition | undefined {
  return loadRegistry().find(p => p.id === id);
}

/** תהליכים לפי דומיין (כולל parentDomains) */
export function getProcessesByDomain(domain: ProcessDomain): ProcessDefinition[] {
  return loadRegistry().filter(
    p => p.domain === domain || p.parentDomains.includes(domain)
  );
}

/** תהליכים שנראים ב-sidebar */
export function getVisibleSidebar(): ProcessDefinition[] {
  return loadRegistry().filter(p => p.isVisibleInSidebar && p.status === 'active');
}

/** תהליכים שנראים ב-dashboard */
export function getVisibleDashboard(): ProcessDefinition[] {
  return loadRegistry().filter(p => p.isVisibleInDashboard && p.status === 'active');
}

/** חיפוש תהליכים לפי טקסט (כולל brainKeywords) */
export function searchProcesses(query: string): ProcessDefinition[] {
  const normalizedQuery = query.toLowerCase();
  return loadRegistry().filter(p =>
    p.title.toLowerCase().includes(normalizedQuery) ||
    p.description?.toLowerCase().includes(normalizedQuery) ||
    p.id.includes(normalizedQuery) ||
    p.brainKeywords?.some(kw => kw.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(kw.toLowerCase()))
  );
}

/** תהליכים שמופעלים ע"י טריגר מסוים */
export function getProcessesForTrigger(
  triggerType: ProcessTrigger['type'],
  condition?: string
): ProcessDefinition[] {
  return loadRegistry().filter(p =>
    p.triggers.some(t =>
      t.type === triggerType &&
      (!condition || !t.condition || t.condition === condition)
    )
  );
}

// #endregion
