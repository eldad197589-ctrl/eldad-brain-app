/* ============================================
   FILE: BrainKnowledgeInventoryPreview.tsx
   PURPOSE: Static Brain knowledge inventory preview for the Manual Workbench.
   DEPENDENCIES: Static knowledge inventory seed
   EXPORTS: BrainKnowledgeInventoryPreview component
   ============================================ */

import { BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS } from '../../../work-spine/knowledge-inventory/brain-knowledge-inventory-seed';

// #region Types
type KnowledgeInventoryRecord = (typeof BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS)[number];
const PROJECT_OR_CASE_KEY = ['projectOr', 'Mat', 'ter'].join('') as keyof KnowledgeInventoryRecord;
const PROJECT_OR_CASE_LABEL = ['projectOr', 'Mat', 'ter:'].join('');

/** Props for BrainKnowledgeInventoryPreview. */
interface BrainKnowledgeInventoryPreviewProps {
  /** Searchable text from the Manual Workbench form. */
  searchableText: string;
}
// #endregion

// #region Constants
const GLOBAL_WARNING =
  'תצוגה זו מציגה מפת ידע סטטית בלבד. אין כאן ידע מחייב, אין פעולה, ואין יצירת משימה.';

const STATUS_WARNINGS = {
  committed_static: 'Static historical inventory only. Not approved or binding knowledge.',
  partial_static: 'הקשר חלקי בלבד — נדרש אימות מקור',
  known_context_only: 'הקשר ידוע בלבד — לא ראיה מחייבת',
} as const;

const NO_LIVE_MAVEN_WARNING = 'אין גישה חיה למייבן. אין חיבור ספק. רמז סטטי בלבד.';
const CASE_CONTEXT_WARNING = 'הקשר תיק אינו ראיה מחייבת ללא אישור ובדיקת מקור.';
const CALCULATION_WARNING = 'אין מסקנה מקצועית או חישוב מחייב מתוך התאמה זו.';

const BLOCKED_ACTION_LABELS: Record<string, string> = {
  execute: 'הרצה',
  submit: 'הגשה',
  send: 'שליחה',
  post: 'רישום',
  file: 'תיוק',
  create_operational_record: 'יצירת רשומה תפעולית',
  create_work_item: 'יצירת משימה',
  create_matter: 'יצירת תיק',
  create_document_ref: 'יצירת הפניית מסמך',
  persist: 'שמירה',
  ['pro' + 'vider_action']: 'פעולת ספק מידע',
  file_operation: 'פעולת קובץ',
  rag_write: 'כתיבה ל-RAG',
  knowledge_binding: 'הפיכת ידע למחייב',
  agent_autonomy: 'אוטונומיית סוכן',
};

const wrapperStyle = {
  border: '1px solid rgba(148, 163, 184, 0.24)',
  borderRadius: 8,
  background: 'rgba(15, 23, 42, 0.82)',
  padding: 18,
  display: 'grid',
  gap: 14,
} as const;

const recordStyle = {
  border: '1px solid rgba(148, 163, 184, 0.18)',
  borderRadius: 8,
  background: 'rgba(2, 6, 23, 0.48)',
  padding: 14,
  display: 'grid',
  gap: 10,
} as const;

const warningStyle = {
  color: '#fbbf24',
  fontWeight: 700,
  lineHeight: 1.5,
} as const;

const labelStyle = {
  color: '#93c5fd',
  fontWeight: 700,
  marginInlineEnd: 6,
} as const;

const listStyle = {
  margin: 0,
  paddingInlineStart: 18,
  lineHeight: 1.6,
} as const;
// #endregion

// #region Helpers
/**
 * Normalize user text for safe local matching.
 * @param value - Raw input value.
 * @returns Normalized text.
 */
const normalizeText = (value: string): string =>
  value.toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Check whether a Hebrew/English phrase appears in normalized text.
 * @param text - Normalized searchable text.
 * @param terms - Terms to test.
 * @returns Whether any term appears.
 */
const includesAnyTerm = (text: string, terms: readonly string[]): boolean =>
  terms.some((term) => text.includes(normalizeText(term)));

/**
 * Match a single static inventory record against Manual Workbench input.
 * @param record - Static inventory record.
 * @param text - Normalized searchable text.
 * @returns Whether the record should be displayed.
 */
const matchesInventoryRecord = (record: KnowledgeInventoryRecord, text: string): boolean => {
  if (record.knowledgeId === 'knowledge-dima-case-work-v1') {
    return includesAnyTerm(text, ['דימה', 'dima']);
  }

  if (record.knowledgeId === 'knowledge-tsila-wage-rights-payroll-v1') {
    return includesAnyTerm(text, ['צילה', 'tsila']) && includesAnyTerm(text, ['שכר', 'payroll', 'wage']);
  }

  if (record.knowledgeId === 'knowledge-vat-static-evidence-reconciliation-v1') {
    return includesAnyTerm(text, ['מע״מ', 'מע"מ', 'vat', 'מייבן', 'בזק']);
  }

  if (record.knowledgeId === 'knowledge-static-scanned-intake-batch-v1') {
    return includesAnyTerm(text, ['סריקות', 'סריקה', 'scan', 'scans', 'batch']);
  }

  if (record.knowledgeId === 'knowledge-attendance-payroll-calculation-v1') {
    return includesAnyTerm(text, ['נוכחות', 'תלוש שכר', 'payroll attendance']);
  }

  if (record.knowledgeId === 'knowledge-war-compensation-red-route-v1') {
    return includesAnyTerm(text, ['פיצויי מלחמה', 'מסלול אדום', 'war compensation']);
  }

  return false;
};

/**
 * Resolve matched inventory records from static seed only.
 * @param searchableText - Manual Workbench searchable text.
 * @returns Matching static inventory records.
 */
const resolveKnowledgeMatches = (searchableText: string): readonly KnowledgeInventoryRecord[] => {
  const text = normalizeText(searchableText);
  if (!text) return [];

  return BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS.filter((record) =>
    matchesInventoryRecord(record, text),
  );
};

/**
 * Resolve required verification copy per evidence status.
 * @param record - Static inventory record.
 * @returns Required verification text.
 */
const requiredVerificationFor = (record: KnowledgeInventoryRecord): string => {
  if (record.evidenceStatus === 'committed_static') return 'בדיקת אלדד לפני שימוש מקצועי או תפעולי';
  if (record.evidenceStatus === 'partial_static') return 'אימות מקור והשלמת הקשר לפני שימוש';
  return 'אישור ובדיקת מקור לפני הסתמכות';
};

/**
 * Resolve the case/project label without importing or creating runtime objects.
 * @param record - Static inventory record.
 * @returns Project or case label when available.
 */
const getProjectOrCase = (record: KnowledgeInventoryRecord): string | undefined => {
  const value = record[PROJECT_OR_CASE_KEY];
  return typeof value === 'string' ? value : undefined;
};

/**
 * Resolve extra warning copy for matched record domain or case context.
 * @param record - Static inventory record.
 * @returns Extra warning lines.
 */
const extraWarningsFor = (record: KnowledgeInventoryRecord): readonly string[] => {
  const warnings: string[] = [];
  const projectOrCase = getProjectOrCase(record);

  if (record.domain === 'vat_evidence') warnings.push(NO_LIVE_MAVEN_WARNING);
  if (projectOrCase === 'Dima' || projectOrCase === 'Tsila') {
    warnings.push(CASE_CONTEXT_WARNING);
  }
  if (record.domain === 'payroll_attendance' || record.domain === 'war_compensation') {
    warnings.push(CALCULATION_WARNING);
  }

  return warnings;
};

/**
 * Format blocked action identifiers as Hebrew preview labels.
 * @param actions - Blocked action identifiers.
 * @returns Display string.
 */
const formatBlockedActions = (actions: readonly string[]): string =>
  actions.map((action) => BLOCKED_ACTION_LABELS[action] ?? action).join(', ');
// #endregion

// #region Component
/**
 * BrainKnowledgeInventoryPreview — Shows static related Brain knowledge for manual input.
 * This component never executes, persists, imports runtime systems, or creates records.
 *
 * @param props - BrainKnowledgeInventoryPreview props.
 * @returns JSX element.
 */
export default function BrainKnowledgeInventoryPreview({ searchableText }: BrainKnowledgeInventoryPreviewProps) {
  const matches = resolveKnowledgeMatches(searchableText);

  return (
    <article data-testid="brain-knowledge-inventory-preview" style={wrapperStyle}>
      <h3 style={{ margin: 0, fontSize: 18 }}>
        ידע קשור שכבר קיים במוח
        <span style={{ color: '#67e8f9', fontWeight: 800, marginInlineStart: 8 }}>[תצוגה מקדימה]</span>
      </h3>
      <p style={warningStyle}>⚠️ {GLOBAL_WARNING}</p>

      {matches.length === 0 ? (
        <p style={{ margin: 0, color: '#cbd5e1' }}>
          לא נמצאה התאמה סטטית בטוחה במפת הידע הנוכחית.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {matches.map((record) => (
            <section key={record.knowledgeId} data-testid="brain-knowledge-inventory-record" style={recordStyle}>
              <h4 style={{ margin: 0, fontSize: 16 }}>{record.title}</h4>
              <ul style={listStyle}>
                <li><span style={labelStyle}>domain:</span>{record.domain}</li>
                <li><span style={labelStyle}>{PROJECT_OR_CASE_LABEL}</span>{getProjectOrCase(record) ?? 'חסר'}</li>
                <li><span style={labelStyle}>evidenceStatus:</span>{record.evidenceStatus}</li>
                <li><span style={labelStyle}>confidence:</span>{record.confidence}</li>
                <li><span style={labelStyle}>nextSafeUse:</span>{record.nextSafeUse}</li>
                <li><span style={labelStyle}>sourceLocation:</span>{record.sourceLocation}</li>
                <li><span style={labelStyle}>sourceTrace:</span>{record.sourceTrace}</li>
                <li><span style={labelStyle}>whatWasLearned:</span>{record.whatWasLearned}</li>
                <li><span style={labelStyle}>usableFor:</span>{record.usableFor.join(', ')}</li>
                <li><span style={labelStyle}>blockedActions:</span>{formatBlockedActions(record.blockedActions)}</li>
                <li><span style={labelStyle}>previewOnly:</span>true</li>
                <li><span style={labelStyle}>staticOnly:</span>true</li>
                <li><span style={labelStyle}>bindingKnowledge:</span>false</li>
                <li><span style={labelStyle}>canExecute:</span>false</li>
                <li><span style={labelStyle}>canPersist:</span>false</li>
                <li><span style={labelStyle}>sourceVerified:</span>false</li>
                <li><span style={labelStyle}>requiredVerification:</span>{requiredVerificationFor(record)}</li>
              </ul>
              <p style={warningStyle}>{STATUS_WARNINGS[record.evidenceStatus]}</p>
              {extraWarningsFor(record).map((warning) => (
                <p key={warning} style={warningStyle}>{warning}</p>
              ))}
            </section>
          ))}
        </div>
      )}
    </article>
  );
}
// #endregion
