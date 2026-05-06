/* ==== FILE: src/work-spine/process-library/process-library-seed.ts ==== */

// #region Imports
import { PROCESS_LIBRARY_FORBIDDEN_ACTIONS } from './process-library-types';
import type {
  ProcessLibraryBlueprint,
  ProcessLibraryDomain,
  ProcessLibraryStatus,
} from './process-library-types';
// #endregion

// #region Constants
/** Global warning for the static Process Library blueprint seed. */
export const PROCESS_LIBRARY_BLUEPRINT_WARNING =
  'ספריית תהליכים סטטית בלבד — Blueprint לתכנון, לא הפעלה, לא אימות מקצועי, לא קריאת תוכן, ולא יצירת רשומות.';

/** Static source trace for the 13 Stage 21B process blueprint rows. */
export const PROCESS_LIBRARY_SOURCE_TRACE =
  'static-copy:Stage21B:visual-navigation-inventory:professional_process_blueprint';

const COMMON_REQUIRED_GATES = [
  'בדיקת אלדד',
  'ביקורת מקצועית נפרדת',
  'אישור Stage 20 לפני כל שימוש תפעולי',
] as const;

const COMMON_WORKFLOW_STAGES = ['intake', 'classification', 'review', 'output_preview'] as const;
const COMMON_STATIC_AGENTS = ['סוכן קליטה', 'סוכן סיווג', 'סוכן ביקורת'] as const;

/** Input shape for building one static process blueprint. */
interface ProcessLibraryBlueprintInput {
  /** Stable process identifier. */
  processId: string;
  /** Hebrew process name. */
  hebrewName: string;
  /** Professional domain for this process blueprint. */
  domain: ProcessLibraryDomain;
  /** Static trigger description for the process. */
  trigger: string;
  /** Inputs the process would require before future use. */
  requiredInputs: readonly string[];
  /** Expected outputs as planning targets only. */
  expectedOutputs: readonly string[];
  /** Static workflow stages for planning and review. */
  workflowStages?: readonly string[];
  /** Logical static agents that may review this process later. */
  relatedAgents?: readonly string[];
  /** Gates required before this process can move beyond static blueprint form. */
  requiredGates?: readonly string[];
  /** Current static blueprint status. */
  status?: ProcessLibraryStatus;
}
// #endregion

// #region Helpers
const buildProcessBlueprint = (input: ProcessLibraryBlueprintInput): ProcessLibraryBlueprint => ({
  processId: input.processId,
  hebrewName: input.hebrewName,
  domain: input.domain,
  trigger: input.trigger,
  requiredInputs: input.requiredInputs,
  expectedOutputs: input.expectedOutputs,
  workflowStages: input.workflowStages ?? COMMON_WORKFLOW_STAGES,
  relatedAgents: input.relatedAgents ?? COMMON_STATIC_AGENTS,
  requiredGates: input.requiredGates ?? COMMON_REQUIRED_GATES,
  forbiddenActions: PROCESS_LIBRARY_FORBIDDEN_ACTIONS,
  status: input.status ?? 'static_blueprint_only',
  operationalExecution: false,
  sourceTrace: PROCESS_LIBRARY_SOURCE_TRACE,
});
// #endregion

// #region Static Data
/** Static Process Library seed copied from the 13 Stage 21B professional process blueprints. */
export const PROCESS_LIBRARY_BLUEPRINTS: readonly ProcessLibraryBlueprint[] = [
  buildProcessBlueprint({
    processId: 'process-institutional-reports',
    hebrewName: 'דוחות מוסדיים',
    domain: 'reports',
    trigger: 'קלט ידני או מקור סטטי מרמז על צורך בדוח מוסדי',
    requiredInputs: ['זהות גוף מדווח', 'תקופה', 'סוג דוח', 'מקורות סטטיים לבדיקה'],
    expectedOutputs: ['טיוטת מבנה דוח', 'רשימת בדיקות', 'תצוגת פערים'],
  }),
  buildProcessBlueprint({
    processId: 'process-penalty-cancellation',
    hebrewName: 'ביטול קנסות',
    domain: 'tax',
    trigger: 'קלט ידני או מסמך סטטי מרמז על בקשת ביטול קנס',
    requiredInputs: ['סוג קנס', 'רשות רלוונטית', 'מועד דרישה', 'נימוקים לבדיקה'],
    expectedOutputs: ['טיוטת נימוק', 'רשימת אסמכתאות נדרשות', 'תצוגת סיכון'],
  }),
  buildProcessBlueprint({
    processId: 'process-declaration-of-capital',
    hebrewName: 'הצהרת הון',
    domain: 'tax',
    trigger: 'קלט ידני או מקור סטטי מרמז על הצהרת הון',
    requiredInputs: ['שנת הצהרה', 'נכסים', 'התחייבויות', 'מקורות הכנסה'],
    expectedOutputs: ['מפת סעיפים', 'רשימת חסרים', 'תצוגת בדיקה'],
  }),
  buildProcessBlueprint({
    processId: 'process-vat-report',
    hebrewName: 'דו"ח מע"מ',
    domain: 'vat',
    trigger: 'קלט ידני או מקור סטטי מרמז על דיווח מע"מ',
    requiredInputs: ['תקופת דיווח', 'עסקאות', 'תשומות', 'מקורות VAT סטטיים'],
    expectedOutputs: ['תצוגת מיפוי מע"מ', 'רשימת בדיקות', 'סיכום פערים'],
  }),
  buildProcessBlueprint({
    processId: 'process-attendance',
    hebrewName: 'נוכחות עובדים',
    domain: 'employee',
    trigger: 'קלט ידני או מקור סטטי מרמז על נתוני נוכחות',
    requiredInputs: ['תקופה', 'עובדים', 'דיווחי נוכחות', 'מדיניות בדיקה'],
    expectedOutputs: ['תצוגת חריגים', 'רשימת שאלות', 'סיכום בדיקה'],
  }),
  buildProcessBlueprint({
    processId: 'process-attendance-agents',
    hebrewName: 'סוכני נוכחות',
    domain: 'employee',
    trigger: 'צורך בתכנון תפקידי סוכנים סביב נוכחות',
    requiredInputs: ['תפקידי בדיקה', 'גבולות פעולה', 'שערי אישור', 'מקורות סטטיים'],
    expectedOutputs: ['מפת תפקידי סוכנים', 'גבולות פעולה', 'רשימת חסימות'],
  }),
  buildProcessBlueprint({
    processId: 'process-payroll-processing',
    hebrewName: 'עיבוד שכר',
    domain: 'payroll',
    trigger: 'קלט ידני או מקור סטטי מרמז על תהליך שכר',
    requiredInputs: ['תקופת שכר', 'נתוני עובדים', 'רכיבי שכר', 'מסמכי מדיניות'],
    expectedOutputs: ['תצוגת רכיבי שכר', 'רשימת בדיקות', 'סיכום חסרים'],
  }),
  buildProcessBlueprint({
    processId: 'process-worklaw',
    hebrewName: 'דיני עבודה',
    domain: 'labor',
    trigger: 'קלט ידני או מקור סטטי מרמז על בדיקת דיני עבודה',
    requiredInputs: ['סוג שאלה', 'תקופה', 'מקורות נורמטיביים', 'פרטי עובד או מעסיק לבדיקה'],
    expectedOutputs: ['מפת בדיקה', 'רשימת מקורות נדרשים', 'תצוגת שאלות לאלדד'],
  }),
  buildProcessBlueprint({
    processId: 'process-expert-opinion',
    hebrewName: 'חוות דעת מומחה',
    domain: 'legal',
    trigger: 'קלט ידני מרמז על צורך בחוות דעת',
    requiredInputs: ['נושא חוות דעת', 'עובדות יסוד', 'מסמכי רקע', 'שאלות מומחה'],
    expectedOutputs: ['מבנה חוות דעת', 'רשימת אסמכתאות', 'תצוגת פערים'],
  }),
  buildProcessBlueprint({
    processId: 'process-capital-gains',
    hebrewName: 'רווח הון ממקרקעין בחו"ל',
    domain: 'tax',
    trigger: 'קלט ידני או מקור סטטי מרמז על רווח הון ממקרקעין בחו"ל',
    requiredInputs: ['נכס', 'מדינה', 'מועדי רכישה ומכירה', 'מסמכי עלות ותמורה'],
    expectedOutputs: ['מפת חישוב לתכנון', 'רשימת מסמכים חסרים', 'תצוגת בדיקות'],
  }),
  buildProcessBlueprint({
    processId: 'process-guardian',
    hebrewName: 'אפוטרופוס',
    domain: 'legal',
    trigger: 'קלט ידני או מקור סטטי מרמז על הליך אפוטרופוס',
    requiredInputs: ['פרטי אדם', 'סטטוס הליך', 'מסמכי בית משפט', 'גורמים מעורבים'],
    expectedOutputs: ['מפת הליך', 'רשימת מסמכים', 'תצוגת שלבים'],
  }),
  buildProcessBlueprint({
    processId: 'process-war-compensation',
    hebrewName: 'פיצויי מלחמה',
    domain: 'special',
    trigger: 'קלט ידני או מקור סטטי מרמז על תביעת פיצויי מלחמה',
    requiredInputs: ['סוג נזק', 'תקופה', 'אסמכתאות', 'מסלול בדיקה'],
    expectedOutputs: ['תצוגת מסלול', 'רשימת חסרים', 'טיוטת שאלות בדיקה'],
  }),
  buildProcessBlueprint({
    processId: 'process-insolvency',
    hebrewName: 'חדלות פירעון',
    domain: 'legal',
    trigger: 'קלט ידני או מקור סטטי מרמז על חדלות פירעון',
    requiredInputs: ['זהות חייב או גורם', 'סטטוס הליך', 'חובות', 'מסמכי רקע'],
    expectedOutputs: ['מפת הליך', 'רשימת בדיקות', 'תצוגת סיכונים'],
  }),
];
// #endregion
