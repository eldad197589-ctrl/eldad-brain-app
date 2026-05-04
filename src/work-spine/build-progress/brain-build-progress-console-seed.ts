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
  whatIsStillBlocked: COMMON_BLOCKED,
  nextSafeStep,
  responsibleAgent: 'Codex ראשי',
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
  safetyStatus: 'static_roadmap_only',
} as const);

const builtRoadmapStage = (
  group: string,
  order: number,
  title: string,
  relatedCommit: string,
  visibleRoute: string | null,
  proofText: string,
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
  );
// #endregion

// #region Static Data
/** Latest committed build-state summary shown above the full progress history. */
export const BRAIN_BUILD_LATEST_CHANGE_SUMMARY = {
  title: 'תיקון עברית מלא למסך התקדמות בניית המוח',
  relatedCommit: '0132154',
  whereToSee: BRAIN_BUILD_PROGRESS_ROUTE,
  whatChanged: 'המסך עבר לתצוגה עברית מלאה: כותרות, מדדים, סטטוסים, שדות, שמות פריטים ופעולות חסומות.',
  proofOfLife: `המסך מציג UI עברי מלא ושומר על האזהרה: ${BRAIN_BUILD_PROGRESS_WARNING}`,
  stillBlocked: ['אין פעולה חיה', 'אין שמירה', 'אין חיבור ספק', 'אין יצירת משימה', 'אין יצירת תיק', 'אין DocumentRef', 'אין persistence'],
  nextSafeStep: 'ביקורת חזותית בלבד לפני הרחבה נוספת.',
  safetyStatus: 'סיכום התקדמות לקריאה בלבד',
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
  progressItem('progress-static-visual-proof-checklist-v1', 'רשימת בדיקת הוכחת תצוגה סטטית', 'proof', 'proof_inventory', '07cd8fa', null, 'commit:07cd8fa', 'רשימת בדיקת הוכחת תצוגה סטטית קיימת כהפניית בקרת פרויקט.', 'built_not_visible', 'not_visible_as_screen', 'static_visual', 'נוספה רשימת בדיקה סטטית להוכחת תצוגה.', 'אלדד רואה את ההשפעה שלה רק דרך סיכומי התקדמות מאוחרים יותר.', 'למפות משטחים חזותיים לפני עבודת ביקורת תצוגה.'),
  progressItem('progress-phase2-safe-knowledge-candidates-v1', 'מועמדי ידע בטוחים שלב 2', 'knowledge', 'knowledge_inventory', 'cd122de', MANUAL_WORKBENCH_ROUTE, 'Robium לשכת שכר', 'מועמדי שלב 2 סטטיים מוצגים כהקשר מלאי.', 'built_not_visible', 'static_reference_recorded', 'preview_only', 'נוספו שש רשומות מועמדי ידע לשלב 2 במסגרת סטטית.', 'אלדד רואה אותן רק כהקשר מצביע סטטי.', 'להשאיר מועמדים מאחורי ביקורת לפני שימוש מאוחר יותר.'),
  progressItem('progress-hypothetical-task-shape-preview-v1', 'תצוגת צורת משימה היפותטית', 'scanned_evidence', 'manual_workbench', '160f271', MANUAL_WORKBENCH_ROUTE, 'סריקות דימה', 'תצוגת צורת משימה היפותטית מוצגת תחת מועמדי סריקה תואמים.', 'built_and_visible', 'visible_static_preview', 'preview_only', 'נוספה תצוגת צורת משימה היפותטית לסריקות.', 'אלדד רואה דגלי יכולת שליליים ופעולות חסומות.', 'להשאיר את צורת המשימה נפרדת מאובייקטים אמיתיים.'),
  progressItem('progress-intake-signal-summary-v1', 'סיכום רמזי קלט', 'intake', 'manual_workbench', 'ee3a06f', MANUAL_WORKBENCH_ROUTE, 'צילה שכר', 'סיכום רמזי קלט ידני מציג רמזי טקסט ושלבים חסומים.', 'built_and_visible', 'visible_static_preview', 'preview_only', 'נוסף סיכום רמזי קלט ידני לקריאה בלבד.', 'אלדד רואה ניסוח רמזים ללא טענות תוכן.', 'להשאיר את שפת הסיכום מוגבלת לרמזי טקסט ידניים.'),
  progressItem('progress-visual-brain-surface-inventory-v1', 'מלאי משטחי מוח חזותיים', 'visual_surface', 'surface_inventory', 'edf165d', null, 'commit:edf165d', 'רשומות מלאי משטחים חזותיים סטטיות קיימות כהקשר בקרת פרויקט.', 'built_not_visible', 'not_visible_as_screen', 'static_visual', 'נוסף מלאי משטחי מוח חזותיים סטטי.', 'אלדד רואה אותו דרך מסך ההתקדמות הזה לאחר שהוא מוצג.', 'להשתמש במפה הזו לבחירת פרוסת ביקורת חזותית מאוחרת יותר.'),
];

/** Static roadmap for build-stage planning only. */
export const BRAIN_BUILD_STAGE_ROADMAP_GROUPS = [
  {
    groupId: 'static-foundations',
    title: 'יסודות סטטיים',
    subtitle: 'מה המוח כבר רואה על קלט ידוע',
    stages: [
      builtRoadmapStage('יסודות סטטיים', 1, 'Static VAT Evidence Seed', '0c9444c', MANUAL_WORKBENCH_ROUTE, 'שורות מע״מ סטטיות מוצגות דרך Preview.'),
      builtRoadmapStage('יסודות סטטיים', 2, 'Scanned Evidence Batch', '2fb509d', MANUAL_WORKBENCH_ROUTE, 'אצוות סריקות סטטית מוצגת דרך Preview.'),
      builtRoadmapStage('יסודות סטטיים', 3, 'Brain Operating Truth', 'cda69ee', null, 'מסמך אמת תפעולית קיים כהפניה סטטית.'),
      builtRoadmapStage('יסודות סטטיים', 4, 'Static Visual Proof Checklist', '07cd8fa', null, 'רשימת בדיקת הוכחה חזותית קיימת כהפניה.'),
      builtRoadmapStage('יסודות סטטיים', 5, 'Knowledge Inventory Phase 1', 'a2011a6', MANUAL_WORKBENCH_ROUTE, 'רשומות מלאי ידע שלב 1 מוצגות כהקשר סטטי.'),
      builtRoadmapStage('יסודות סטטיים', 6, 'Knowledge Inventory Phase 2', 'cd122de', MANUAL_WORKBENCH_ROUTE, 'מועמדי ידע שלב 2 מוצגים כהקשר סטטי.'),
      builtRoadmapStage('יסודות סטטיים', 7, 'Visual Brain Surface Inventory', 'edf165d', BRAIN_BUILD_PROGRESS_ROUTE, 'מלאי משטחים חזותיים מוצג דרך מסך ההתקדמות.'),
      builtRoadmapStage('יסודות סטטיים', 8, 'Brain Build Progress Console', '36f3d4b', BRAIN_BUILD_PROGRESS_ROUTE, 'מסך התקדמות בניית המוח מוצג במסלול הפנימי.'),
      builtRoadmapStage('יסודות סטטיים', 9, 'Latest Change Summary', 'a4f81d4', BRAIN_BUILD_PROGRESS_ROUTE, 'מה השתנה עכשיו מופיע בראש מסך ההתקדמות.'),
    ],
  },
  {
    groupId: 'previews',
    title: 'תצוגות מקדימות',
    subtitle: 'מה מוצג ב־Workbench — הוכחה חזותית בלבד',
    stages: [
      builtRoadmapStage('תצוגות מקדימות', 10, 'Manual Workbench VAT Preview', 'a843121', MANUAL_WORKBENCH_ROUTE, 'המסך הידני מציג Preview למע״מ.'),
      builtRoadmapStage('תצוגות מקדימות', 11, 'VAT Mapping Table Preview', '28ecb17', MANUAL_WORKBENCH_ROUTE, 'טבלת מיפוי מע״מ מוצגת לקריאה בלבד.'),
      builtRoadmapStage('תצוגות מקדימות', 12, 'Scanned Batch Preview', '5ed94d4', MANUAL_WORKBENCH_ROUTE, 'אצוות סריקות מוצגת לפי רמזי טקסט ידניים.'),
      builtRoadmapStage('תצוגות מקדימות', 13, 'Approval Gate Preview', '6f1368b', MANUAL_WORKBENCH_ROUTE, 'שער אישור מוצג כטקסט פסיבי בלבד.'),
      builtRoadmapStage('תצוגות מקדימות', 14, 'Knowledge Inventory Preview', '31facca', MANUAL_WORKBENCH_ROUTE, 'מלאי ידע קשור מוצג במסך הידני.'),
      builtRoadmapStage('תצוגות מקדימות', 15, 'Intake Signal Summary', 'ee3a06f', MANUAL_WORKBENCH_ROUTE, 'סיכום רמזי קלט מוצג בראש המסך הידני.'),
      builtRoadmapStage('תצוגות מקדימות', 16, 'Hypothetical Scanned Task Shape Preview', '160f271', MANUAL_WORKBENCH_ROUTE, 'צורת משימה היפותטית מוצגת ללא יצירת אובייקט.'),
    ],
  },
  {
    groupId: 'path-to-operation',
    title: 'דרך לתפעול',
    subtitle: 'מה נדרש כדי שהמוח יתחיל לעבוד באמת',
    stages: [
      roadmapStage('דרך לתפעול', 17, 'Visual Brain Surface Section', 'current', null, BRAIN_BUILD_PROGRESS_ROUTE, 'מוצג כשלב תכנון נוכחי במפה בלבד.', ['שלב תכנון בלבד'], ['לא תפעולי', 'אין פעולה חיה'], ['אין פעולה חיה', 'אין שמירה'], 'ביקורת Gravity לפני יישום.'),
      roadmapStage('דרך לתפעול', 18, 'External Knowledge Sources Map', 'next', null, null, 'נדרש מיפוי מקורות חיצוניים לפני חיבור כלשהו.', ['ממתין לשער Agent A'], ['אין חיבור ספקים'], ['אין חיבור ספקים', 'אין קריאת מקור'], AGENT_A_NO_ETA),
      roadmapStage('דרך לתפעול', 19, 'Real Scanned Evidence Expansion', 'next', null, null, 'נדרשת הרחבת ראיות סריקה אמיתיות רק לאחר אישור סטטי.', ['ממתין לשער Agent A'], ['אין קריאת תיקייה', 'אין OCR'], ['אין קריאת קבצים', 'אין OCR'], AGENT_A_NO_ETA),
      roadmapStage('דרך לתפעול', 20, 'שער תפעולי מוגבל ראשון', 'blocked', null, null, 'חסום עד שער אישור מפורש.', [], ['אין עדיין שער אישור מפורש, אין שכבת persistence מאושרת, ואין הרשאה ליצור WorkItem/Matter/DocumentRef.'], ['אין WorkItem', 'אין Matter', 'אין DocumentRef', 'אין persistence'], 'דורש החלטת אלדד נפרדת לפני כל עבודה תפעולית.'),
    ],
  },
] as const;
// #endregion
