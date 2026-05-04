/* ==== FILE: src/work-spine/build-progress/brain-system-source-map-seed.ts ==== */

// #region Imports
import type {
  BrainSystemSourceKind,
  BrainSystemSourceMapRow,
  BrainSystemSourceRiskLevel,
  BrainSystemSourceStatus,
} from './brain-system-source-map-types';
// #endregion

// #region Constants
export const BRAIN_SYSTEM_SOURCE_MAP_TITLE = 'מפת מצב המוח ומקורותיו';
export const BRAIN_SYSTEM_SOURCE_MAP_WARNING =
  'מפת מקורות בלבד — עצם הופעת מקור לא אומר שהתוכן נקרא, נכרה, אומת, עודכן, חובר חי, או שמותר למוח לפעול עליו.';
export const BRAIN_SYSTEM_SOURCE_MAP_ROW_WARNING =
  'שורת מקור היא אינדקס בלבד — לא ראיה, לא אימות, לא חיבור חי, ולא הרשאה לפעולה.';

export const BRAIN_SYSTEM_SOURCE_MAP_BLOCKED_ACTIONS = [
  'content_reading_blocked',
  'source_mining_blocked',
  'source_verification_blocked',
  'live_connection_blocked',
  'source_action_blocked',
  'object_creation_blocked',
  'persistence_blocked',
] as const;
// #endregion

// #region Helpers
const sourceRow = (
  sourceId: string,
  label: string,
  domain: string,
  sourceKind: BrainSystemSourceKind,
  status: BrainSystemSourceStatus,
  riskLevel: BrainSystemSourceRiskLevel,
  whatIsKnown: string,
  whatIsNotKnown: string,
  requiredGateBeforeMining = 'נדרשת בדיקת אלדד לפני כל כרייה, קריאת תוכן או חיבור מקור.',
): BrainSystemSourceMapRow => ({
  sourceId,
  label,
  domain,
  sourceKind,
  status,
  indexOnly: true,
  contentRead: false,
  sourceMined: false,
  sourceVerified: false,
  dataCurrentVerified: false,
  liveConnectionExists: false,
  canActOnSource: false,
  professionallyReliable: false,
  blockedActions: BRAIN_SYSTEM_SOURCE_MAP_BLOCKED_ACTIONS,
  riskLevel,
  requiredGateBeforeMining,
  whatIsKnown,
  whatIsNotKnown,
  visibleWarning: BRAIN_SYSTEM_SOURCE_MAP_ROW_WARNING,
});
// #endregion

// #region Static Data
/** Index-only source ecosystem rows around Eldad Brain. */
export const BRAIN_SYSTEM_SOURCE_MAP_ROWS: readonly BrainSystemSourceMapRow[] = [
  sourceRow('source-brain-app-v1', 'המוח של אלדד — brain-app', 'core', 'internal_brain_system', 'known_source', 'low', 'קיימת אפליקציית React מקומית המשמשת משטח בנייה ותצוגה.', 'מפה זו לא בודקת תקינות מקצועית, שלמות או התאמה לשימוש תפעולי.'),
  sourceRow('source-work-spine-contracts-v1', 'Work Spine contracts', 'work_spine', 'internal_brain_system', 'partial_static', 'medium', 'קיימים חוזים וסוגים פנימיים סביב Work Spine.', 'מפה זו לא מפעילה use-cases, repository או יצירת רשומות.'),
  sourceRow('source-knowledge-inventory-v1', 'Knowledge Inventory', 'knowledge', 'static_inventory', 'known_source', 'low', 'קיים מלאי ידע סטטי כמצביעי הקשר.', 'המלאי אינו ידע מחייב ואינו מחליף בדיקת מקור.'),
  sourceRow('source-visual-surface-inventory-v1', 'Visual Surface Inventory', 'visual_surface', 'static_inventory', 'known_source', 'low', 'קיים מלאי משטחים חזותיים סטטי.', 'המלאי אינו אומר שהמשטחים מבוקרים או מתאימים לשימוש תפעולי.'),
  sourceRow('source-brain-operating-truth-v1', 'Brain Operating Truth', 'governance', 'governance', 'known_source', 'low', 'קיים מסמך אמת תפעולית כמסגרת זהירות סטטית.', 'המפה לא הופכת את המסמך למדיניות פעולה אוטומטית.'),
  sourceRow('source-scans-folder-v1', 'סריקות', 'scanned_evidence', 'manual_source_area', 'needs_mining', 'high', 'קיים רמז לאזור סריקות כמקור עתידי אפשרי.', 'לא נקראה תיקייה, לא נקראו קבצים, לא הופעל OCR ולא נבדקה תכולה.'),
  sourceRow('source-dima-context-v1', 'דימה', 'case_context', 'case_context', 'partial_static', 'medium', 'קיים הקשר פרויקט/תיק סביב דימה.', 'המפה לא מאשרת שתוכן תיק נקרא, אומת או עדכני.'),
  sourceRow('source-tsila-context-v1', 'צילה', 'case_context', 'case_context', 'imported_context', 'medium', 'קיים הקשר ידוע סביב צילה ושכר.', 'המפה לא מאשרת תלושים, חישובים או מסקנה מקצועית.'),
  sourceRow('source-vat-maven-static-v1', 'VAT / Maven static context', 'vat', 'professional_domain', 'partial_static', 'medium', 'קיים הקשר מע״מ/מייבן סטטי מתוך עבודת preview.', 'אין גישה חיה למייבן, אין התאמה חיה ואין אימות מקור.'),
  sourceRow('source-attendance-payroll-v1', 'נוכחות / Payroll domain', 'payroll', 'professional_domain', 'partial_static', 'medium', 'קיים הקשר דומיין סביב נוכחות ושכר.', 'אין חישוב שכר, אין בדיקת תלושים ואין קביעה מקצועית.'),
  sourceRow('source-employee-system-v1', 'Employee System', 'employee', 'professional_domain', 'unknown_needs_audit', 'high', 'קיים שם אזור מקצועי אפשרי למערכת עובדים.', 'לא ברור מה קיים, מה עדכני ומה ניתן להציג ללא audit.'),
  sourceRow('source-guardian-v1', 'Guardian / אפוטרופוס', 'legal', 'professional_domain', 'unknown_needs_audit', 'high', 'קיים רמז לדומיין אפוטרופוס.', 'לא נקבע מקור, תוכן, מסגרת מקצועית או תוקף.'),
  sourceRow('source-foreign-resident-capital-gain-v1', 'רווח הון לתושב חוץ', 'tax', 'professional_domain', 'unknown_needs_audit', 'high', 'קיים רמז לדומיין מס בנושא רווח הון.', 'אין בדיקת מסמך, חישוב, דין או מקור מחייב.'),
  sourceRow('source-capital-declaration-v1', 'הצהרת הון', 'tax', 'professional_domain', 'unknown_needs_audit', 'high', 'קיים רמז לדומיין הצהרת הון.', 'אין בדיקת מסמכים, חישוב או הכנה להגשה.'),
  sourceRow('source-robium-salary-bureau-v1', 'Robium / Salary Bureau', 'product', 'product_context', 'partial_static', 'medium', 'קיים הקשר מוצרי/עסקי סביב Robium ולשכת שכר.', 'אין חישוב שכר, קשר לקוחות או שימוש בנתוני לקוח.'),
  sourceRow('source-protokol-robium-v1', 'Protokol / Robium context', 'product', 'product_context', 'imported_context', 'medium', 'קיים הקשר סטטי סביב Protokol/Robium.', 'המפה לא בודקת תוכן מקור או תוקף עסקי.'),
  sourceRow('source-gmail-drive-exports-v1', 'Gmail/Drive exports', 'provider_exports', 'provider_snapshot', 'blocked_live_connection', 'blocked', 'קיים רמז לייצואי ספקים כמועמדי מקור.', 'אין חיבור Gmail/Drive, אין קריאת תיבות, אין משיכת קבצים ואין סנכרון.'),
  sourceRow('source-accounting-core-v1', 'Accounting Core', 'accounting', 'runtime_area', 'blocked_live_connection', 'blocked', 'קיים אזור קוד חשבונאי רחב.', 'המפה לא מפעילה הנהלת חשבונות, פקודות או posting.'),
  sourceRow('source-workitem-matter-runtime-v1', 'WorkItem / Matter runtime', 'runtime', 'runtime_area', 'blocked_live_connection', 'blocked', 'קיים אזור אובייקטים תפעוליים שחייב להישאר מאחורי שער.', 'אין יצירת WorkItem, אין Matter, אין DocumentRef ואין persistence חדש.'),
  sourceRow('source-document-output-engines-v1', 'Document output engines', 'output', 'output_engine', 'blocked_live_connection', 'blocked', 'קיימים שמות מנועי פלט/מסמכים כמועמדי ביקורת.', 'אין יצירת קובץ, אין export, אין הגשה ואין שליחה.'),
];
// #endregion
