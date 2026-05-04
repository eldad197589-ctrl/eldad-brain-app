/* ==== FILE: src/work-spine/build-progress/brain-visual-process-registry-seed.ts ==== */

// #region Imports
import type {
  BrainVisualProcessBuildStatus,
  BrainVisualProcessCategory,
  BrainVisualProcessRegistryRow,
} from './brain-visual-process-registry-types';
// #endregion

// #region Constants
export const BRAIN_VISUAL_PROCESS_REGISTRY_TITLE = 'רשימת תהליכי המוח הוויזואלי';
export const BRAIN_VISUAL_PROCESS_REGISTRY_WARNING =
  'נוכחות חזותית ברשימת התהליכים אינה מוכנות תפעולית, אינה אימות מקצועי, ואינה הרשאה לפעולה.';
export const BRAIN_VISUAL_PROCESS_REGISTRY_SOURCE_TRACE =
  'snapshot-static-copy:src/data/neurons.ts:CATEGORIES/NEURONS/PENDING';

export const BRAIN_VISUAL_PROCESS_STATUS_LABELS: Record<BrainVisualProcessBuildStatus, string> = {
  built: 'נבנה',
  building: 'בבנייה',
  pending: 'ממתין',
};
// #endregion

// #region Helpers
const category = (categoryId: string, categoryLabel: string): BrainVisualProcessCategory => ({
  categoryId,
  categoryLabel,
});

const processRow = (
  categoryId: string,
  categoryLabel: string,
  processId: string,
  processLabel: string,
  buildStatus: BrainVisualProcessBuildStatus,
): BrainVisualProcessRegistryRow => ({
  categoryId,
  categoryLabel,
  processId,
  processLabel,
  buildStatus,
  visualPresenceOnly: true,
  indexOnly: true,
  operationalReady: false,
  canExecute: false,
  canCreateRecord: false,
  sourceTrace: BRAIN_VISUAL_PROCESS_REGISTRY_SOURCE_TRACE,
  visibleWarning: BRAIN_VISUAL_PROCESS_REGISTRY_WARNING,
});
// #endregion

// #region Static Data
/** Static categories copied as a visual/index-only registry snapshot. */
export const BRAIN_VISUAL_PROCESS_CATEGORIES: readonly BrainVisualProcessCategory[] = [
  category('employees', 'עובדים'),
  category('accounting', 'הנהלת חשבונות'),
  category('financial', 'דוחות כספיים ומיסוי'),
  category('special', 'חישובים מיוחדים'),
  category('tools', 'כלים וטכנולוגיה'),
  category('robium', 'רוביום'),
  category('personal', 'אישי ומערכת'),
];

/** Static process rows copied as a visual/index-only registry snapshot. */
export const BRAIN_VISUAL_PROCESS_REGISTRY_ROWS: readonly BrainVisualProcessRegistryRow[] = [
  processRow('employees', 'עובדים', 'attendance', 'נוכחות ושכר', 'built'),
  processRow('employees', 'עובדים', 'expert-opinion', 'חוות דעת כלכלית', 'built'),
  processRow('employees', 'עובדים', 'employee-lifecycle', 'מחזור חיי עובד', 'building'),
  processRow('accounting', 'הנהלת חשבונות', 'accounting', 'הנהלת חשבונות', 'pending'),
  processRow('accounting', 'הנהלת חשבונות', 'reports', 'דוחות מוסדיים', 'built'),
  processRow('financial', 'דוחות כספיים ומיסוי', 'declaration-of-capital', 'הצהרת הון', 'built'),
  processRow('accounting', 'הנהלת חשבונות', 'penalty-cancellation', 'ביטול קנסות', 'built'),
  processRow('special', 'חישובים מיוחדים', 'capital-gains', 'רווח הון ממקרקעין בחו"ל', 'built'),
  processRow('special', 'חישובים מיוחדים', 'guardian', 'אפוטרופוס', 'built'),
  processRow('special', 'חישובים מיוחדים', 'insolvency', 'חדלות פירעון', 'built'),
  processRow('special', 'חישובים מיוחדים', 'war', 'פיצויי מלחמה', 'built'),
  processRow('financial', 'דוחות כספיים ומיסוי', 'pension', 'ייעוץ פנסיוני', 'pending'),
  processRow('accounting', 'הנהלת חשבונות', 'quotes', 'קליטת לקוחות ותמחור', 'built'),
  processRow('tools', 'כלים וטכנולוגיה', 'brain-router', 'Brain Router', 'built'),
  processRow('tools', 'כלים וטכנולוגיה', 'letter-bot', 'בוט מכתבים', 'built'),
  processRow('tools', 'כלים וטכנולוגיה', 'doc-collector', 'בוט איסוף מסמכים', 'pending'),
  processRow('robium', 'רוביום', 'business-plan', 'תוכנית עסקית', 'built'),
  processRow('robium', 'רוביום', 'robium-products', 'תיק מוצרים', 'built'),
  processRow('robium', 'רוביום', 'robium-agreement', 'הסכם מייסדים', 'built'),
  processRow('robium', 'רוביום', 'robium-analysis', 'ניתוח מתחרים', 'built'),
  processRow('personal', 'אישי ומערכת', 'seminar-tzila', 'עבודה אקדמית — צילה', 'building'),
  processRow('personal', 'אישי ומערכת', 'music', 'זמר ומוזיקה', 'built'),
];

/** Static future candidates copied from the visual Brain pending list as index-only context. */
export const BRAIN_VISUAL_PROCESS_PENDING_CANDIDATES = [
  'מיסוי מקרקעין',
  'החזרי מס',
  'הכנת דוחות כספיים',
  'התחשבנות בשותפות',
  'ביקורת ספרים',
  'מע"מ חודשי',
  'דוח שנתי',
  'ביטוח לאומי',
  'קרן השתלמות',
  'דמי הבראה',
  'חישובי פיצויים',
  'הסכם קיבוצי',
  'צו הרחבה',
  '106 שנתי',
  'אישור ניכוי',
  'תיקון 190',
  'מאזן בוחן',
  'רווח והפסד',
  'תזרים מזומנים',
  'ניהול מלאי WMS',
  'ניהול אתרי בנייה',
  'ניהול תביעות',
  'רגולציה וציות',
  'פורטל עובד',
  'עוד הרבה...',
] as const;
// #endregion
