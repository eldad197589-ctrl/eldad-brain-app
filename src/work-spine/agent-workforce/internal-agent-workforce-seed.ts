/* ==== FILE: src/work-spine/agent-workforce/internal-agent-workforce-seed.ts ==== */

// #region Imports
import type { InternalAgentWorkforceAgent } from './internal-agent-workforce-types';
// #endregion

// #region Constants
/** Hebrew label for the static internal workforce index. */
export const INTERNAL_AGENT_WORKFORCE_LABEL = 'מלאי סוכנים פנימי סטטי';

/** Static warning for every row in this index. */
export const INTERNAL_AGENT_WORKFORCE_WARNING =
  'מלאי סוכנים סטטי בלבד — אין סוכן רץ, אין פעולה, אין חיבור חיצוני, ואין יצירת רשומה.';

const STATIC_FORBIDDEN_ACTIONS = [
  'אין פעולה חיה',
  'אין חיבור חיצוני',
  'אין קריאת מקור',
  'אין שמירה',
  'אין יצירת רשומה',
  'אין שליחה או הגשה',
] as const;

/** Static index of the proposed internal workforce. */
export const INTERNAL_AGENT_WORKFORCE_AGENTS: readonly InternalAgentWorkforceAgent[] = [
  { agentId: 'intake-signal-agent', hebrewName: 'סוכן רמזי קלט', domain: 'intake', role: 'מזהה רמזי טקסט ידניים כתצוגה בלבד', inputs: ['טקסט ידני'], outputs: ['סיכום רמזים'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'בדיקת אלדד', status: 'planned', operationalExecution: false },
  { agentId: 'scanned-intake-index-agent', hebrewName: 'סוכן אינדקס סריקות', domain: 'intake', role: 'מציג מועמדי סריקות סטטיים', inputs: ['אצוות סריקות סטטית'], outputs: ['רשימת מועמדים'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער תוכן מקור', status: 'planned', operationalExecution: false },
  { agentId: 'external-source-index-agent', hebrewName: 'סוכן אינדקס מקורות חיצוניים', domain: 'intake', role: 'מציג מקורות חיצוניים כמפת אינדקס', inputs: ['מפת מקורות'], outputs: ['שורות מקור'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער Audit מקור', status: 'planned', operationalExecution: false },
  { agentId: 'document-kind-preview-agent', hebrewName: 'סוכן סוג מסמך', domain: 'document', role: 'מציג סוג מסמך משוער כתצוגה בלבד', inputs: ['מועמד סטטי'], outputs: ['סוג מסמך מוצע'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'בדיקת אלדד', status: 'planned', operationalExecution: false },
  { agentId: 'missing-fields-agent', hebrewName: 'סוכן שדות חסרים', domain: 'document', role: 'מציג שדות חסרים ללא השלמה', inputs: ['רשומת מועמד'], outputs: ['רשימת חוסרים'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער ראיות', status: 'planned', operationalExecution: false },
  { agentId: 'source-trace-agent', hebrewName: 'סוכן עקבת מקור', domain: 'document', role: 'מציג עקבת מקור סטטית ואזהרה', inputs: ['עקבת מקור'], outputs: ['הערת מקור'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער Audit מקור', status: 'planned', operationalExecution: false },
  { agentId: 'income-tax-router-agent', hebrewName: 'סוכן מס הכנסה', domain: 'tax', role: 'מציג הקשר מס אפשרי לפי רמזים', inputs: ['רמזי מס'], outputs: ['הקשר מס סטטי'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'ביקורת מקצועית', status: 'future', operationalExecution: false },
  { agentId: 'section-102-pointer-agent', hebrewName: 'סוכן סעיף 102/102A', domain: 'tax', role: 'מציג מצביע סטטי לסעיף 102/102A', inputs: ['מפת מקורות חיצוניים'], outputs: ['מצביע סעיף'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'ביקורת מקצועית', status: 'planned', operationalExecution: false },
  { agentId: 'capital-gains-context-agent', hebrewName: 'סוכן רווח הון', domain: 'tax', role: 'מציג הקשר רווח הון ללא חישוב', inputs: ['מלאי ידע'], outputs: ['הקשר סטטי'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער חישוב מס', status: 'future', operationalExecution: false },
  { agentId: 'capital-statement-context-agent', hebrewName: 'סוכן הצהרת הון', domain: 'tax', role: 'מציג הקשר הצהרת הון ללא מסקנה', inputs: ['מצביעי מקור'], outputs: ['תצוגת הקשר'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'ביקורת מקצועית', status: 'future', operationalExecution: false },
  { agentId: 'vat-evidence-agent', hebrewName: 'סוכן ראיות מע״מ', domain: 'vat_external', role: 'מציג ראיות מע״מ סטטיות', inputs: ['מאגר מע״מ סטטי'], outputs: ['התאמות סטטיות'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער ביקורת מע״מ', status: 'planned', operationalExecution: false },
  { agentId: 'vat-external-context-agent', hebrewName: 'סוכן הקשר מע״מ חיצוני', domain: 'vat_external', role: 'מציג הקשר מערכת חיצונית ללא חיבור', inputs: ['רמזי מע״מ'], outputs: ['הקשר חיצוני סטטי'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער חיבור נפרד', status: 'blocked', operationalExecution: false },
  { agentId: 'supplier-vat-fields-agent', hebrewName: 'סוכן חוסרי ספקים', domain: 'vat_external', role: 'מציג חוסרי חשבוניות וספקים', inputs: ['מועמדי מע״מ'], outputs: ['שדות חסרים'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער הנהלת חשבונות', status: 'planned', operationalExecution: false },
  { agentId: 'attendance-payroll-context-agent', hebrewName: 'סוכן נוכחות ושכר', domain: 'payroll_labor', role: 'מציג הקשר נוכחות ושכר ללא חישוב', inputs: ['מצביעי מקור'], outputs: ['הקשר שכר'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער שכר', status: 'future', operationalExecution: false },
  { agentId: 'labor-law-context-agent', hebrewName: 'סוכן דיני עבודה', domain: 'payroll_labor', role: 'מציג הקשר דיני עבודה ללא ייעוץ', inputs: ['מלאי ידע'], outputs: ['הקשר עבודה'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'ביקורת דיני עבודה', status: 'future', operationalExecution: false },
  { agentId: 'tsila-context-agent', hebrewName: 'סוכן צילה', domain: 'payroll_labor', role: 'מציג הקשר צילה זהיר', inputs: ['הקשר ידוע'], outputs: ['תצוגת הקשר'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'בדיקת אלדד', status: 'planned', operationalExecution: false },
  { agentId: 'employee-lifecycle-agent', hebrewName: 'סוכן מחזור עובד', domain: 'payroll_labor', role: 'מציג צורת תהליך עובד', inputs: ['רשימת תהליכים חזותית'], outputs: ['תצוגת מחזור'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער הפעלה מוגבלת', status: 'future', operationalExecution: false },
  { agentId: 'client-context-agent', hebrewName: 'סוכן הקשר לקוח', domain: 'client_case', role: 'מציג רמזי לקוח כתצוגה בלבד', inputs: ['טקסט ידני'], outputs: ['ניחוש לקוח'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'בדיקת אלדד', status: 'planned', operationalExecution: false },
  { agentId: 'case-shape-preview-agent', hebrewName: 'סוכן צורת תיק', domain: 'client_case', role: 'מציג צורת תיק היפותטית בלבד', inputs: ['מועמד סטטי'], outputs: ['תצוגת תיק'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער הפעלה מוגבלת', status: 'blocked', operationalExecution: false },
  { agentId: 'duplicate-risk-agent', hebrewName: 'סוכן סיכון כפילות', domain: 'client_case', role: 'מציג סיכון כפילות ללא מיזוג', inputs: ['סימוני כפילות'], outputs: ['אזהרת כפילות'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'בדיקת אלדד', status: 'planned', operationalExecution: false },
  { agentId: 'letter-shape-agent', hebrewName: 'סוכן צורת מכתב', domain: 'output_export', role: 'מציג שלד מכתב כתצוגה בלבד', inputs: ['פעולה מוצעת'], outputs: ['שלד פלט'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער פלט', status: 'blocked', operationalExecution: false },
  { agentId: 'document-export-shape-agent', hebrewName: 'סוכן צורת יצוא מסמך', domain: 'output_export', role: 'מציג צורת יצוא ללא קובץ', inputs: ['נתוני תצוגה'], outputs: ['תצוגת יצוא'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער יצוא', status: 'blocked', operationalExecution: false },
  { agentId: 'filing-package-shape-agent', hebrewName: 'סוכן צורת חבילת הגשה', domain: 'output_export', role: 'מציג חבילת הגשה תאורטית בלבד', inputs: ['תצוגת ראיות'], outputs: ['תצוגת חבילה'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער הגשה נפרד', status: 'blocked', operationalExecution: false },
  { agentId: 'safety-qa-agent', hebrewName: 'סוכן QA בטיחות', domain: 'review_qa', role: 'בודק גבולות פעולה בניסוח סטטי', inputs: ['טקסט תצוגה'], outputs: ['ממצאי בטיחות'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'ביקורת Codex', status: 'planned', operationalExecution: false },
  { agentId: 'evidence-qa-agent', hebrewName: 'סוכן QA ראיות', domain: 'review_qa', role: 'מציג חוסרי ראיות ללא אימות', inputs: ['מועמדי ראיות'], outputs: ['בדיקת חוסרים'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער ראיות', status: 'planned', operationalExecution: false },
  { agentId: 'wording-risk-agent', hebrewName: 'סוכן סיכון ניסוח', domain: 'review_qa', role: 'מזהה ניסוח שעלול להטעות', inputs: ['טקסט UI'], outputs: ['אזהרות ניסוח'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'בדיקת אלדד', status: 'planned', operationalExecution: false },
  { agentId: 'knowledge-inventory-agent', hebrewName: 'סוכן מלאי ידע', domain: 'operations_admin', role: 'מציע רשומת מלאי סטטית', inputs: ['מפות סטטיות'], outputs: ['הצעת רשומה'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער ידע', status: 'planned', operationalExecution: false },
  { agentId: 'visual-surface-audit-agent', hebrewName: 'סוכן ביקורת משטחים', domain: 'operations_admin', role: 'מציע תור ביקורת חזותית', inputs: ['מלאי משטחים'], outputs: ['תור ביקורת'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער Audit חזותי', status: 'planned', operationalExecution: false },
  { agentId: 'ceo-brief-agent', hebrewName: 'סוכן תדריך CEO', domain: 'ceo_bureau', role: 'מסכם מצב בנייה לקריאה בלבד', inputs: ['מסך התקדמות'], outputs: ['תדריך סטטי'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער CEO', status: 'planned', operationalExecution: false },
  { agentId: 'agent-workforce-planner', hebrewName: 'סוכן תכנון כוח אדם', domain: 'ceo_bureau', role: 'ממפה סוכנים וגבולות כאינדקס', inputs: ['תוכנית כוח אדם'], outputs: ['מפת סוכנים'], forbiddenActions: STATIC_FORBIDDEN_ACTIONS, requiredGateBeforeAction: 'שער הפעלה מוגבלת', status: 'planned', operationalExecution: false },
] as const;
// #endregion
