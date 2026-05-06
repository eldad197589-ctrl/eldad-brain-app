/* ==== FILE: src/work-spine/build-progress/brain-build-progress-console-seed.ts ==== */

// #region Imports
import {
  BRAIN_BUILD_BLOCKED_ACTIONS,
  BRAIN_BUILD_PROGRESS_SAFETY_STATUS,
} from './brain-build-progress-console-types';
import type {
  BrainBuildProofStatus,
  BrainBuildProgressDomain,
  BrainBuildProgressItem,
  BrainBuildProgressLayer,
  BrainBuildProgressStatus,
  BrainBuildSurfaceClassification,
} from './brain-build-progress-console-types';
// #endregion

// #region Constants
export const BRAIN_BUILD_PROGRESS_ROUTE = '/internal/brain-build-progress';
export const MANUAL_WORKBENCH_ROUTE = '/internal/manual-preview-workbench';
export const BRAIN_BUILD_PROGRESS_WARNING =
  'התקדמות בנייה בלבד — לא מוכנות תפעולית, לא אימות מקצועי, לא חיבור חי, ולא הרשאה לפעול.';
export const BRAIN_BUILD_LATEST_CHANGE_WARNING =
  'סיכום שינוי סטטי בלבד — לא פריסה חיה, לא מוכנות תפעולית, לא אימות מקור, לא חיבור ספקים, ולא הרשאה לפעול.';
export const BRAIN_BUILD_STAGE_ROADMAP_BANNER =
  'מפת שלבי יסוד — תצוגת מבנה בלבד. כל מה שמסומן "נבנה" הוכח חזותית על קלט סטטי ידוע בלבד. המוח לא תפעולי. אין שמירה. אין פעולה חיה.';
export const BRAIN_BUILD_STAGE_ROADMAP_WORKING_PLAN_NOTICE =
  'מפת שלבים זו היא מפת עבודה ניתנת לעדכון. שינוי במפה אינו פעולה תפעולית ואינו משנה נתונים במערכת.';
export const BRAIN_BUILD_STAGE_ROADMAP_DIVIDER =
  'מעבר לקו הזה = תשתית שלא קיימת עדיין. כל מה שמעל = תצוגת preview בלבד.';
export const BRAIN_BUILD_STAGE_ROADMAP_STATUSES = ['built', 'current', 'next', 'blocked'] as const;
export const BRAIN_BUILD_STAGE_ROADMAP_STATUS_ICONS: Record<(typeof BRAIN_BUILD_STAGE_ROADMAP_STATUSES)[number], string> = {
  built: '✅',
  current: '◀',
  next: '○',
  blocked: '🔒',
} as const;
export const BRAIN_BUILD_STAGE_ROADMAP_CONTROL = {
  roadmapStatus: 'working_plan_only',
  canBeReordered: true,
  requiresEldadApprovalForRoadmapChange: true,
} as const;

const COMMON_BLOCKED = [
  'no live source access',
  'no source content reading',
  'no task or record creation',
  'no filing or submission',
  'no retained state write',
] as const;

const STATIC_PREVIEW_MEANING = 'משמעות סטטית: תצוגת preview בלבד, ללא פעולה וללא שמירה.';
const AGENT_A_NO_ETA = 'נדרש שער Agent A לפני הרחבה. אין ETA.';
// #endregion

// #region Types
type RoadmapStatus = (typeof BRAIN_BUILD_STAGE_ROADMAP_STATUSES)[number];
// #endregion

// #region Helpers
const proofScenario = (input: string, expectedVisibleResult: string) => ({ input, expectedVisibleResult });

const progressItem = (
  progressItemId: string,
  title: string,
  domain: BrainBuildProgressDomain,
  layer: BrainBuildProgressLayer,
  relatedCommit: string,
  visibleRoute: string | null,
  proofInput: string,
  proofExpected: string,
  currentStatus: BrainBuildProgressStatus,
  proofStatus: BrainBuildProofStatus,
  surfaceClassification: BrainBuildSurfaceClassification,
  whatWasBuilt: string,
  whatEldadCanSee: string,
  nextSafeStep: string,
  whatIsStillBlocked: readonly string[] = COMMON_BLOCKED,
  responsibleAgent = 'Codex ראשי',
): BrainBuildProgressItem => ({
  progressItemId,
  title,
  domain,
  layer,
  relatedCommit,
  visibleRoute,
  proofScenario: proofScenario(proofInput, proofExpected),
  currentStatus,
  proofStatus,
  surfaceClassification,
  whatWasBuilt,
  whatEldadCanSee,
  whatIsStillBlocked,
  nextSafeStep,
  responsibleAgent,
  safetyStatus: BRAIN_BUILD_PROGRESS_SAFETY_STATUS,
  blockedActions: BRAIN_BUILD_BLOCKED_ACTIONS,
});

const roadmapStage = (
  group: string,
  order: number,
  title: string,
  status: RoadmapStatus,
  relatedCommit: string | null,
  visibleRoute: string | null,
  proofText: string,
  whatIsDone: readonly string[],
  whatIsNotDone: readonly string[],
  blockedActions: readonly string[],
  nextGate: string,
  compactLine: string,
) => ({
  roadmapStageId: `brain-build-roadmap-stage-${order}`,
  title,
  group,
  status,
  order,
  relatedCommit,
  visibleRoute,
  proofScenario: proofText,
  whatIsDone,
  whatIsNotDone,
  blockedActions,
  nextGate,
  compactLine,
  safetyStatus: 'static_roadmap_only',
} as const);

const builtRoadmapStage = (
  group: string,
  order: number,
  title: string,
  relatedCommit: string,
  visibleRoute: string | null,
  proofText: string,
  compactLine: string,
) =>
  roadmapStage(
    group,
    order,
    title,
    'built',
    relatedCommit,
    visibleRoute,
    proofText,
    [STATIC_PREVIEW_MEANING],
    ['לא מוכנות תפעולית', 'אין פעולה חיה', 'אין שמירה'],
    ['אין פעולה חיה', 'אין שמירה', 'אין חיבור ספקים'],
    'בדיקה חזותית בלבד לפני הרחבה נוספת.',
    compactLine,
  );
// #endregion

// #region Static Data
/** Latest committed build-state summary shown above the full progress history. */
export const BRAIN_BUILD_LATEST_CHANGE_SUMMARY = {
  title: 'Stage 21C — ספריית תהליכים מקצועיים',
  relatedCommit: '7feb0c2',
  whereToSee: BRAIN_BUILD_PROGRESS_ROUTE,
  whatChanged:
    'נוספה שכבת Blueprint סטטית של ספריית תהליכים מקצועיים על בסיס 13 תהליכים שמופו ב־Stage 21B.',
  proofOfLife:
    'מה מוצג במסך: נרשמה ספריית תהליכים סטטית עם 13 blueprints מקצועיים. לכל blueprint דגל הפעלה false, אין UI integration, אין שינוי ניווט, ואין runtime workflow.',
  stillBlocked: [
    '18D remains HOLD',
    '18D Visual Brain Alignment: deferred/HOLD due dirty neurons.ts',
    'Stage 20 remains blocked',
    'No operational capability introduced',
    'Stage 21C is a static Process Library blueprint layer only',
    'אין שינוי Sidebar/Layout/Dashboard',
    'אין שינוי routes',
    'אין שינוי neurons.ts',
    'אין runtime workflow',
    'אין provider',
    'אין קריאת תיקייה חיה',
    'אין סריקת תוכן',
    'אין OCR',
    'אין קריאת תוכן מקור',
    'אין שמירת נתונים במסד',
    'אין חיבור ספקים',
    'אין WorkItem',
    'אין Matter',
    'אין DocumentRef',
    'אין persistence',
  ],
  nextSafeStep: 'לבקר את ספריית התהליכים כ־Blueprint סטטי בלבד לפני כל UI או שינוי ניווט עתידי.',
  safetyStatus: 'Stage 21C Process Library — שכבת Blueprint סטטית בלבד, לא הפעלה תפעולית',
  safetyNotes: ['מידע בנייה פנימי אמיתי לקריאה בלבד', 'לא מוכנות תפעולית', 'לא אימות מקור', 'אין חיבור ספקים', 'אין הרשאת פעולה או שמירה'],
} as const;

/** Static build progress checkpoints for the temporary Brain Build Progress Console. */
export const BRAIN_BUILD_PROGRESS_ITEMS: readonly BrainBuildProgressItem[] = [
  progressItem('progress-vat-mapping-table-preview-v1', 'תצוגת טבלת מיפוי מע״מ', 'vat', 'manual_workbench', 'a843121', MANUAL_WORKBENCH_ROUTE, 'מע״מ מייבן בזק', 'מוצגת טבלת מיפוי מע״מ סטטית במסך הידני.', 'built_and_visible', 'visible_static_preview', 'preview_only', 'נוספה תצוגת טבלת מיפוי מע״מ לקריאה בלבד במסך הידני.', 'אלדד רואה שורות מיפוי מע״מ וסימוני נתונים חסרים במסלול הידני.', 'להשאיר כהקשר תצוגה בלבד עד פתיחת שער ביקורת נפרד.'),
  progressItem('progress-static-vat-evidence-seed-v1', 'מאגר ראיות מע״מ סטטי', 'vat', 'static_evidence', '0c9444c', MANUAL_WORKBENCH_ROUTE, 'בזק מע״מ', 'שורות מאגר מע״מ סטטי מוצגות דרך תצוגת המסך הידני.', 'built_not_visible', 'static_reference_recorded', 'preview_only', 'נוסף מאגר ראיות מע״מ סטטי כהפניה מצומצמת.', 'אלדד רואה את המאגר רק כאשר משטח תצוגה מציג שורות תואמות.', 'להשתמש רק כהפניה סטטית לתצוגה.'),
  progressItem('progress-scanned-evidence-batch-v1', 'אצוות ראיות סריקה סטטית', 'scanned_evidence', 'scanned_intake', '2fb509d', MANUAL_WORKBENCH_ROUTE, 'סריקות', 'מועמדי ראיות סריקה סטטיים מוצגים במסך הידני כאשר יש התאמת רמזים.', 'built_not_visible', 'static_reference_recorded', 'preview_only', 'נוספה אצוות מועמדי ראיות סריקה סטטית.', 'אלדד רואה שורות מועמדות מייצגות כאשר רמזי התצוגה מתאימים.', 'להשאיר הרחבת ראיות סריקה מאחורי בדיקה סטטית.'),
  progressItem('progress-scanned-batch-preview-v1', 'תצוגת אצוות סריקות', 'scanned_evidence', 'manual_workbench', '5ed94d4', MANUAL_WORKBENCH_ROUTE, 'סריקות דימה', 'המסך הידני מציג מועמדי סריקה סטטיים.', 'built_and_visible', 'visible_static_preview', 'preview_only', 'נוספה למסך הידני תצוגת אצוות סריקות סטטית לקריאה בלבד.', 'אלדד רואה סוג מועמד, שדות חסרים, עקבת מקור ורמת ביטחון.', 'לבחון פלט חזותי בלבד.'),
  progressItem('progress-approval-gate-preview-v1', 'תצוגת שער אישור', 'approval', 'approval_gate', '6f1368b', MANUAL_WORKBENCH_ROUTE, 'סריקות דימה', 'טקסט שער אישור מוצג תחת מועמדי סריקה.', 'built_and_visible', 'visible_static_preview', 'preview_only', 'נוספה תצוגת שער אישור פסיבית תחת מועמדי סריקה.', 'אלדד רואה הקשר בדיקה מוצע ושדות חסרים.', 'להשאיר את שפת האישור פסיבית.'),
  progressItem('progress-knowledge-inventory-phase1-v1', 'מלאי ידע שלב 1', 'knowledge', 'knowledge_inventory', 'a2011a6', MANUAL_WORKBENCH_ROUTE, 'צילה שכר', 'הקשר מלאי ידע סטטי מוצג כאשר מילות הקלט מתאימות.', 'built_not_visible', 'static_reference_recorded', 'preview_only', 'נוספו רשומות מלאי ידע סטטיות של שלב 1.', 'אלדד רואה הקשר מלאי דרך משטח התצוגה שנוסף לאחר מכן.', 'להשתמש כהקשר מצביע בלבד.'),
  progressItem('progress-knowledge-inventory-preview-v1', 'תצוגת מלאי ידע', 'knowledge', 'manual_workbench', '31facca', MANUAL_WORKBENCH_ROUTE, 'מע״מ מייבן בזק', 'רשומות ידע סטטיות קשורות מוצגות במסך הידני.', 'built_and_visible', 'visible_static_preview', 'preview_only', 'נוספה למסך הידני תצוגת ידע קשור.', 'אלדד רואה סטטוס ראיה, מיקום מקור ופעולות חסומות.', 'לבקר ניסוח לפני הרחבת רשומות.'),
  progressItem('progress-static-visual-proof-checklist-v1', 'רשימת בדיקת תצוגה סטטית', 'proof', 'proof_inventory', '07cd8fa', null, 'commit:07cd8fa', 'רשימת בדיקת תצוגה סטטית קיימת כהפניית בקרת פרויקט.', 'built_not_visible', 'not_visible_as_screen', 'static_visual', 'נוספה רשימת בדיקה סטטית לבקרת תצוגה.', 'אלדד רואה את ההשפעה שלה רק דרך סיכומי התקדמות מאוחרים יותר.', 'למפות משטחים חזותיים לפני עבודת ביקורת תצוגה.'),
  progressItem('progress-phase2-safe-knowledge-candidates-v1', 'מועמדי ידע בטוחים שלב 2', 'knowledge', 'knowledge_inventory', 'cd122de', MANUAL_WORKBENCH_ROUTE, 'Robium לשכת שכר', 'מועמדי שלב 2 סטטיים מוצגים כהקשר מלאי.', 'built_not_visible', 'static_reference_recorded', 'preview_only', 'נוספו שש רשומות מועמדי ידע לשלב 2 במסגרת סטטית.', 'אלדד רואה אותן רק כהקשר מצביע סטטי.', 'להשאיר מועמדים מאחורי ביקורת לפני שימוש מאוחר יותר.'),
  progressItem('progress-hypothetical-task-shape-preview-v1', 'תצוגת צורת משימה היפותטית', 'scanned_evidence', 'manual_workbench', '160f271', MANUAL_WORKBENCH_ROUTE, 'סריקות דימה', 'תצוגת צורת משימה היפותטית מוצגת תחת מועמדי סריקה תואמים.', 'built_and_visible', 'visible_static_preview', 'preview_only', 'נוספה תצוגת צורת משימה היפותטית לסריקות.', 'אלדד רואה דגלי יכולת שליליים ופעולות חסומות.', 'להשאיר את צורת המשימה נפרדת מאובייקטים אמיתיים.'),
  progressItem('progress-intake-signal-summary-v1', 'סיכום רמזי קלט', 'intake', 'manual_workbench', 'ee3a06f', MANUAL_WORKBENCH_ROUTE, 'צילה שכר', 'סיכום רמזי קלט ידני מציג רמזי טקסט ושלבים חסומים.', 'built_and_visible', 'visible_static_preview', 'preview_only', 'נוסף סיכום רמזי קלט ידני לקריאה בלבד.', 'אלדד רואה ניסוח רמזים ללא טענות תוכן.', 'להשאיר את שפת הסיכום מוגבלת לרמזי טקסט ידניים.'),
  progressItem('progress-visual-brain-surface-inventory-v1', 'מלאי משטחי מוח חזותיים', 'visual_surface', 'surface_inventory', 'edf165d', null, 'commit:edf165d', 'רשומות מלאי משטחים חזותיים סטטיות קיימות כהקשר בקרת פרויקט.', 'built_not_visible', 'not_visible_as_screen', 'static_visual', 'נוסף מלאי משטחי מוח חזותיים סטטי.', 'אלדד רואה אותו דרך מסך ההתקדמות הזה לאחר שהוא מוצג.', 'להשתמש במפה הזו לבחירת פרוסת ביקורת חזותית מאוחרת יותר.'),
  progressItem(
    'progress-work-spine-bootstrap-idempotency-fix-v1',
    'תיקון יציבות אתחול Work Spine',
    'proof',
    'proof_inventory',
    'e6c15e9',
    BRAIN_BUILD_PROGRESS_ROUTE,
    'רענון /internal/brain-build-progress לאחר localStorage לא עקבי',
    'המסך נטען בדפדפן רגיל גם כאשר localStorage של Work Spine אינו עקבי.',
    'built_and_visible',
    'visible_static_preview',
    'preview_only',
    'תהליך bootstrap של Work Spine תוקן כך שלא יפיל את האפליקציה במקרה של רשומות מקומיות קיימות ואינדקס חסר.',
    'המסך עולה ללא מסך כחול לאחר רענון, והמערכת ממשיכה לרנדר את מסך ההתקדמות.',
    'להמשיך לשלב מפת מצב המוח ומקורותיו לאחר בדיקת Runtime יציבה.',
    ['אין יצירת WorkItem אמיתי ללא אישור', 'אין שימוש ב־Matter', 'אין DocumentRef', 'אין חיבור ספקים', 'אין פעולה חיה'],
    'Codex ראשי + Gravity א׳',
  ),
  progressItem(
    'progress-brain-system-source-map-v1',
    'מפת מצב המוח ומקורותיו',
    'visual_surface',
    'surface_inventory',
    '4b05db3',
    BRAIN_BUILD_PROGRESS_ROUTE,
    'פתיחת /internal/brain-build-progress לאחר Stage 17',
    'מה מוצג במסך: מוצגת מפת מקורות ומערכות, יחד עם רשימת תהליכי המוח הוויזואלי. מפת מקורות ומערכות: 20 מקורות. מפת שלבי בניית המוח: 17 נבנו · 1 עכשיו · 1 ממתין · 1 חסום. רשימת תהליכי המוח הוויזואלי: 7 קטגוריות · 22 תהליכים · 17 נבנו · 2 בבנייה · 3 ממתינים. נתוני התהליכים מתארים את המוח הוויזואלי בלבד, ולא מוכנות תפעולית של המערכת.',
    'built_and_visible',
    'visible_static_preview',
    'preview_only',
    'נוספה מפת מקורות ומערכות של המוח יחד עם רשימת תהליכי המוח הוויזואלי.',
    'אלדד רואה מפת מקורות אינדקס בלבד ורשימת תהליכים חזותית סטטית.',
    'להמשיך לשלב מפת מקורות ידע חיצוניים כתכנון אינדקס בלבד.',
    ['אין קריאת תיקיות', 'אין OCR', 'אין חיבור Gmail/Drive/Maven', 'אין WorkItem', 'אין Matter', 'אין DocumentRef', 'אין פעולה חיה'],
    'Codex ראשי + Gravity א׳',
  ),
  progressItem(
    'progress-stage-21a-internal-agent-workforce-v1',
    'Stage 21A — אינדקס כוח סוכנים פנימי',
    'knowledge',
    'knowledge_inventory',
    'b25d276',
    BRAIN_BUILD_PROGRESS_ROUTE,
    'פתיחת /internal/brain-build-progress לאחר Stage 21A',
    'מה מוצג במסך: נרשמה שכבת תכנון סטטית של 30 סוכנים פנימיים. דגל הפעלה false לכל סוכן. אין runtime agents ואין UI integration.',
    'built_and_visible',
    'visible_static_preview',
    'preview_only',
    'נוסף אינדקס סטטי של 30 סוכנים פנימיים מתוכננים בלבד.',
    'אלדד רואה ב־Brain Build Progress ש־Stage 21A קיים כשכבת תכנון סטטית בלבד.',
    'לא לפתוח Stage 20 ולא ליצור סוכני runtime בלי אישור מפורש.',
    ['אין runtime agents', 'אין UI integration', 'אין חיבור ספקים', 'אין WorkItem', 'אין Matter', 'אין DocumentRef', 'Stage 19 נרשם כ־preview-complete_metadata_only בלבד', 'Stage 20 חסום'],
    'Codex ראשי',
  ),
  progressItem(
    'progress-stage-21c-process-library-blueprints-v1',
    'Stage 21C — ספריית תהליכים מקצועיים',
    'knowledge',
    'knowledge_inventory',
    '7feb0c2',
    BRAIN_BUILD_PROGRESS_ROUTE,
    'פתיחת /internal/brain-build-progress לאחר Stage 21C',
    'מה מוצג במסך: נרשמה שכבת Blueprint סטטית של 13 תהליכים מקצועיים. לכל blueprint יש דגל הפעלה false. אין UI/navigation/runtime changes.',
    'built_and_visible',
    'visible_static_preview',
    'preview_only',
    'נוספה ספריית תהליכים מקצועיים סטטית עם 13 blueprints מתוך Stage 21B Professional Process Blueprints.',
    'אלדד רואה ב־Brain Build Progress ש־Stage 21C קיים כשכבת תכנון סטטית בלבד.',
    'לא לבצע UI integration, שינוי ניווט או runtime workflow בלי Gate נפרד.',
    [
      'אין UI/navigation changes',
      'אין Sidebar/Layout/Dashboard changes',
      'אין routes changes',
      'אין neurons.ts changes',
      'אין runtime workflows',
      'אין provider',
      'אין OCR',
      'אין content read',
      'אין WorkItem',
      'אין Matter',
      'אין DocumentRef',
      'Stage 20 חסום',
    ],
    'Codex ראשי',
  ),
  progressItem('progress-stage-19a-metadata-only-scan-intake-preview-v1', 'Stage 19A — תצוגת מטא־דאטה סריקות סטטית', 'scanned_evidence', 'manual_workbench', '3dbf61f', MANUAL_WORKBENCH_ROUTE, 'סריקות', 'מה מוצג במסך: תצוגת Stage 19A מציגה 61 מועמדי מטא־דאטה, 18 קבוצות סריקה, 61 קבצים נתמכים ו־35 תיקיות מתוך SCANNED_INTAKE_STATIC_SNAPSHOT בלבד.', 'built_and_visible', 'visible_static_preview', 'preview_only', 'נוספה תצוגת מטא־דאטה סריקות סטטית על בסיס SCANNED_INTAKE_STATIC_SNAPSHOT בלבד.', 'אלדד רואה ספירות, קבוצות, תוויות יחסיות ושמות קבצים לדוגמה מתוך snapshot סטטי בלבד.', 'לא להפוך את Stage 19 לקריאת תיקייה חיה ולא לפתוח OCR בלי שער אישור נפרד.', ['אין קריאת תיקייה חיה', 'אין OCR', 'אין קריאת תוכן מקור', 'אין הסקת סוג מסמך/לקוח/מס/שכר/דחיפות', 'אין Matter', 'אין WorkItem', 'אין DocumentRef', 'Stage 19 נרשם כ־preview-complete_metadata_only בלבד', 'Stage 20 חסום']),
  progressItem('progress-stage-19-metadata-only-preview-status-v1', 'Stage 19 — תצוגת מטא־דאטה הושלמה', 'scanned_evidence', 'manual_workbench', 'cce44f0', MANUAL_WORKBENCH_ROUTE, 'סריקות', 'מה מוצג במסך: הושלמה תצוגת מטא-דאטה בלבד עבור Stage 19A–19E. אין סריקת תוכן, אין OCR, אין שמירת נתונים במסד, ואין Matter / WorkItem / DocumentRef.', 'built_and_visible', 'visible_static_preview', 'preview_only', 'Stage 19: preview-complete_metadata_only נרשם כשכבת preview סטטית בלבד.', 'אלדד רואה מטא־דאטה סטטית, סיווג אפשרי, שער סקירה ותור החלטות — כולם ללא שמירה וללא פעולה.', 'לא לפתוח Stage 20 או עבודה תפעולית בלי אישור מפורש.', ['18D remains HOLD', 'Stage 20 remains blocked', 'אין סריקת תוכן', 'אין OCR', 'אין שמירת נתונים במסד', 'אין Matter / WorkItem / DocumentRef', 'אין חיבור ספקים', 'אין פעולה חיה']),
];

/** Static roadmap for build-stage planning only. */
export const BRAIN_BUILD_STAGE_ROADMAP_GROUPS = [
  {
    groupId: 'static-foundations',
    title: 'יסודות סטטיים',
    subtitle: 'מה המוח כבר רואה על קלט ידוע',
    stages: [
      builtRoadmapStage('יסודות סטטיים', 1, 'מאגר ראיות מע״מ סטטי', '0c9444c', MANUAL_WORKBENCH_ROUTE, 'שורות מע״מ סטטיות מוצגות דרך Preview.', 'נתוני מע״מ סטטיים קיימים כהפניה.'),
      builtRoadmapStage('יסודות סטטיים', 2, 'אצוות ראיות סריקה סטטית', '2fb509d', MANUAL_WORKBENCH_ROUTE, 'אצוות סריקות סטטית מוצגת דרך Preview.', 'אצוות סריקה סטטיות קיימות כהפניה.'),
      builtRoadmapStage('יסודות סטטיים', 3, 'אמת תפעולית של המוח', 'cda69ee', null, 'מסמך אמת תפעולית קיים כהפניה סטטית.', 'מסמך אמת קיים כהפניה פנימית.'),
      builtRoadmapStage('יסודות סטטיים', 4, 'רשימת בדיקת תצוגה סטטית', '07cd8fa', null, 'רשימת בדיקת תצוגה קיימת כהפניה.', 'רשימת בדיקה חזותית קיימת.'),
      builtRoadmapStage('יסודות סטטיים', 5, 'מלאי ידע שלב 1', 'a2011a6', MANUAL_WORKBENCH_ROUTE, 'רשומות מלאי ידע שלב 1 מוצגות כהקשר סטטי.', 'רשומות ידע שלב 1 מוצגות כהקשר.'),
      builtRoadmapStage('יסודות סטטיים', 6, 'מלאי ידע שלב 2', 'cd122de', MANUAL_WORKBENCH_ROUTE, 'מועמדי ידע שלב 2 מוצגים כהקשר סטטי.', 'מועמדי ידע שלב 2 מוצגים כהקשר.'),
      builtRoadmapStage('יסודות סטטיים', 7, 'מלאי משטחי מוח חזותיים', 'edf165d', BRAIN_BUILD_PROGRESS_ROUTE, 'מלאי משטחים חזותיים מוצג דרך מסך ההתקדמות.', 'מפת משטחים קיימת במסך ההתקדמות.'),
      builtRoadmapStage('יסודות סטטיים', 8, 'מסך התקדמות בניית המוח', '36f3d4b', BRAIN_BUILD_PROGRESS_ROUTE, 'מסך התקדמות בניית המוח מוצג במסלול הפנימי.', 'מסך התקדמות מוצג במסלול פנימי.'),
      builtRoadmapStage('יסודות סטטיים', 9, 'תקציר שינוי אחרון', 'a4f81d4', BRAIN_BUILD_PROGRESS_ROUTE, 'מה השתנה עכשיו מופיע בראש מסך ההתקדמות.', 'תקציר שינוי מופיע בראש המסך.'),
    ],
  },
  {
    groupId: 'previews',
    title: 'תצוגות מקדימות',
    subtitle: 'מה מוצג ב־Workbench — הוכחה חזותית בלבד',
    stages: [
      builtRoadmapStage('תצוגות מקדימות', 10, 'המסך הידני — Preview מע״מ', 'a843121', MANUAL_WORKBENCH_ROUTE, 'המסך הידני מציג Preview למע״מ.', 'המסך הידני מציג preview מע״מ.'),
      builtRoadmapStage('תצוגות מקדימות', 11, 'תצוגת טבלת מיפוי מע״מ', '28ecb17', MANUAL_WORKBENCH_ROUTE, 'טבלת מיפוי מע״מ מוצגת לקריאה בלבד.', 'טבלת מיפוי מוצגת לקריאה בלבד.'),
      builtRoadmapStage('תצוגות מקדימות', 12, 'תצוגת אצוות סריקות', '5ed94d4', MANUAL_WORKBENCH_ROUTE, 'אצוות סריקות מוצגת לפי רמזי טקסט ידניים.', 'אצוות סריקות מוצגת לפי רמזי טקסט.'),
      builtRoadmapStage('תצוגות מקדימות', 13, 'תצוגת שער אישור', '6f1368b', MANUAL_WORKBENCH_ROUTE, 'שער אישור מוצג כטקסט פסיבי בלבד.', 'שער אישור פסיבי מוצג.'),
      builtRoadmapStage('תצוגות מקדימות', 14, 'תצוגת מלאי ידע', '31facca', MANUAL_WORKBENCH_ROUTE, 'מלאי ידע קשור מוצג במסך הידני.', 'מלאי ידע קשור מוצג במסך הידני.'),
      builtRoadmapStage('תצוגות מקדימות', 15, 'סיכום רמזי קלט', 'ee3a06f', MANUAL_WORKBENCH_ROUTE, 'סיכום רמזי קלט מוצג בראש המסך הידני.', 'סיכום רמזי קלט מוצג בראש המסך.'),
      builtRoadmapStage('תצוגות מקדימות', 16, 'תצוגת צורת משימה היפותטית', '160f271', MANUAL_WORKBENCH_ROUTE, 'צורת משימה היפותטית מוצגת ללא יצירת אובייקט.', 'צורת משימה היפותטית מוצגת ללא אובייקט.'),
    ],
  },
  {
    groupId: 'path-to-operation',
    title: 'דרך לתפעול',
    subtitle: 'מה נדרש כדי שהמוח יתחיל לעבוד באמת',
    stages: [
      builtRoadmapStage('דרך לתפעול', 17, 'מפת מצב המוח ומקורותיו', '4b05db3', BRAIN_BUILD_PROGRESS_ROUTE, 'מוצגת מפת מקורות ותהליכים אינדקס בלבד.', 'מפת מקורות + רשימת תהליכי המוח הוויזואלי — אינדקס בלבד, לא פעולה.'),
      roadmapStage('דרך לתפעול', 18, 'מפת מקורות ידע חיצוניים', 'current', null, null, 'נרשם סטטוס אינדקס של Stage 18 עם 18D deferred/HOLD בגלל src/data/neurons.ts dirty. Stage 19 נרשם כ־preview-complete_metadata_only. Stage 20 חסום.', ['אינדקס מקורות חיצוניים סטטי נרשם עד 18A, 18B, 18C, 18E, 18F+18G'], ['18D Visual Brain Alignment: deferred/HOLD due dirty neurons.ts', '18D remains HOLD', 'Stage 20 remains blocked', 'No operational capability introduced'], ['אין חיבור ספקים', 'אין קריאת מקור', 'אין מעבר ל־Stage 20 בלי אישור מפורש'], AGENT_A_NO_ETA, 'Stage 18: index-complete_with_18D_deferred — 18D deferred/HOLD; Stage 19 preview-complete_metadata_only; Stage 20 remains blocked.'),
      roadmapStage('דרך לתפעול', 19, 'תצוגת מטא־דאטה לסריקות', 'built', 'cce44f0', MANUAL_WORKBENCH_ROUTE, 'Stage 19A–19E נרשמו כתצוגת מטא־דאטה בלבד. Stage 19: preview-complete_metadata_only. אין סריקת תוכן, אין OCR, אין שמירת נתונים במסד, ואין Matter / WorkItem / DocumentRef.', ['Stage 19: preview-complete_metadata_only', 'הושלמה תצוגת מטא-דאטה בלבד', 'Stage 19A metadata-only scan intake preview נרשם כתצוגה סטטית בלבד', 'Stage 19B metadata classification helper נרשם ככלי סטטי בלבד', 'Stage 19C classification preview מוצג על בסיס SCANNED_INTAKE_STATIC_SNAPSHOT וה-helper בלבד', 'Stage 19D Eldad review gate preview מחובר ל־metadata-review-gate-helper כתצוגה סטטית בלבד ללא persistence', 'Stage 19E Eldad decision queue preview מוצג כתור החלטות סטטי בלבד ללא persistence וללא queue state אמיתי'], ['18D remains HOLD', 'Stage 20 remains blocked', 'אין סריקת תוכן', 'אין OCR', 'אין שמירת נתונים במסד', 'אין Matter / WorkItem / DocumentRef', 'אין confidence גבוה', 'אין אישור/דחייה אמיתיים'], ['אין קריאת קבצים', 'אין OCR', 'אין יצירת Matter/WorkItem/DocumentRef', 'אין persistence'], AGENT_A_NO_ETA, 'Stage 19: preview-complete_metadata_only — הושלמה תצוגת מטא-דאטה בלבד; אין סריקת תוכן, אין OCR, אין שמירת נתונים במסד; Stage 20 remains blocked.'),
      roadmapStage('דרך לתפעול', 20, 'שער תפעולי מוגבל ראשון', 'blocked', null, null, 'Stage 20A מציג חבילת אישור מטא־דאטה אחת כ־preview בלבד. Stage 20 הרחב עדיין חסום.', ['Stage 20A: metadata approval package preview only', 'תצוגת חבילת אישור בלבד — מבוסס מטא־דאטה סטטי', 'לא בוצעה פעולה במערכת'], ['אין עדיין שער אישור מפורש, אין שכבת persistence מאושרת, ואין הרשאה ליצור WorkItem/Matter/DocumentRef.', 'Stage 20 broad is not complete', 'אין שמירה', 'אין OCR / קריאת תוכן'], ['אין WorkItem', 'אין Matter', 'אין DocumentRef', 'אין persistence', 'אין OCR', 'אין קריאת תוכן'], 'דורש החלטת אלדד נפרדת לפני כל עבודה תפעולית.', 'Stage 20A תצוגת חבילת אישור בלבד; Stage 20 הרחב חסום — אין שמירה, אין OCR, אין Matter/WorkItem/DocumentRef.'),
    ],
  },
] as const;
// #endregion
