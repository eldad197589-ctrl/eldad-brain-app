/* ==== FILE: src/work-spine/visual-architecture/visual-architecture-map-seed.ts ==== */

// #region Imports
import {
  VISUAL_ARCHITECTURE_BLOCKED_ACTIONS,
  VISUAL_ARCHITECTURE_BUCKETS,
  VISUAL_ARCHITECTURE_MAP_WARNING,
  type VisualArchitectureBucket,
  type VisualArchitectureMapRow,
} from './visual-architecture-map-types';
// #endregion

// #region Constants
/** Display labels for the seven approved visual architecture buckets. */
export const VISUAL_ARCHITECTURE_BUCKET_LABELS: Record<VisualArchitectureBucket, string> = {
  command_center: 'Command Center',
  work_desk: 'Work Desk',
  process_library: 'Process Library',
  knowledge_center: 'Knowledge Center',
  client_workspace: 'Client Workspace',
  products_systems: 'Products & Systems',
  internal_dev_tools: 'Internal Dev Tools',
};

/** Gate required before any row in this static map becomes an implementation change. */
export const VISUAL_ARCHITECTURE_REQUIRED_GATE =
  'Stage 22 implementation requires explicit Eldad approval and a separate scoped patch.';
// #endregion

// #region Types
/** Input shape for constructing one static visual architecture row. */
interface VisualArchitectureMapInput {
  /** Stable surface identifier. */
  surfaceId: string;
  /** Hebrew user-facing surface label. */
  hebrewLabel: string;
  /** Current route, route family, or static marker. */
  currentRoute: string;
  /** Current component or static source pointer. */
  currentComponent: string;
  /** Target architecture bucket. */
  bucket: VisualArchitectureBucket;
  /** Current overlap, duplication, or placement problem. */
  currentProblem: string;
  /** Intended role in the target visual brain architecture. */
  targetRole: string;
  /** Other surfaces this row currently overlaps with. */
  overlapsWith: readonly string[];
  /** Static recommendation for a later approved implementation step. */
  recommendedAction: string;
}
// #endregion

// #region Helpers
/** Creates one static Stage 22A architecture row with locked safety flags. */
const visualArchitectureRow = (input: VisualArchitectureMapInput): VisualArchitectureMapRow => ({
  surfaceId: input.surfaceId,
  hebrewLabel: input.hebrewLabel,
  currentRoute: input.currentRoute,
  currentComponent: input.currentComponent,
  bucket: input.bucket,
  currentProblem: input.currentProblem,
  targetRole: input.targetRole,
  overlapsWith: input.overlapsWith,
  recommendedAction: input.recommendedAction,
  implementationAllowed: false,
  requiresEldadApproval: true,
  visibleWarning: VISUAL_ARCHITECTURE_MAP_WARNING,
  blockedActions: VISUAL_ARCHITECTURE_BLOCKED_ACTIONS,
});
// #endregion

// #region Seed
/** Static Stage 22A map of current and planned visual brain surfaces. */
export const VISUAL_ARCHITECTURE_MAP_ROWS: readonly VisualArchitectureMapRow[] = [
  visualArchitectureRow({
    surfaceId: 'surface-dashboard-main',
    hebrewLabel: 'דשבורד ראשי',
    currentRoute: '/',
    currentComponent: 'src/pages/dashboard/Dashboard.tsx',
    bucket: 'command_center',
    currentProblem: 'משלב סקירת מוח חזותית עם ספירות עבודה ותוכן תפעולי.',
    targetRole: 'סקירת מצב ושליטה בלבד, ללא ניהול עבודה מפורט.',
    overlapsWith: ['surface-ceo-bureau', 'surface-work-desk-route', 'surface-process-library'],
    recommendedAction: 'להשאיר כדשבורד מצב ולפנות משימות/תורים ל־CEO Bureau או Work Desk.',
  }),
  visualArchitectureRow({
    surfaceId: 'surface-ceo-bureau',
    hebrewLabel: 'לשכת מנכ״ל',
    currentRoute: '/ceo',
    currentComponent: 'src/pages/ceo-office/CeoOffice.tsx',
    bucket: 'command_center',
    currentProblem: 'כוללת מרכז ניהול, תורים, מסמכים, יומן וטאב עבודה באותו מסך.',
    targetRole: 'מרכז ניהול חי ומבוקר עם שערים ברורים לפעולות עתידיות.',
    overlapsWith: ['surface-dashboard-main', 'surface-work-desk-tab', 'surface-manual-preview-workbench'],
    recommendedAction: 'להגדיר כמרכז הניהול הראשי לפני איחוד Work Desk.',
  }),
  visualArchitectureRow({
    surfaceId: 'surface-work-desk-route',
    hebrewLabel: 'שולחן עבודה עצמאי',
    currentRoute: '/work-spine',
    currentComponent: 'src/work-spine/ui/TodayControlBoard.tsx',
    bucket: 'work_desk',
    currentProblem: 'מופיע כנתיב עצמאי וגם כטאב בתוך לשכת מנכ״ל.',
    targetRole: 'מודול עבודה בתוך CEO Bureau, עם deep link רק אם אלדד מאשר.',
    overlapsWith: ['surface-ceo-bureau', 'surface-work-desk-tab', 'surface-dashboard-main'],
    recommendedAction: 'להחליט בשלב 22B אם הנתיב העצמאי נשאר או הופך לקישור פנימי בלבד.',
  }),
  visualArchitectureRow({
    surfaceId: 'surface-work-desk-tab',
    hebrewLabel: 'טאב שולחן משימות',
    currentRoute: '/ceo#kanban',
    currentComponent: 'src/pages/ceo-office/CeoOffice.tsx > TodayControlBoard',
    bucket: 'work_desk',
    currentProblem: 'מכפיל את אותו תפקיד של נתיב Work Spine העצמאי.',
    targetRole: 'מקום העבודה היומי בתוך מרכז הניהול.',
    overlapsWith: ['surface-work-desk-route', 'surface-dashboard-main'],
    recommendedAction: 'לאחד את חוויית Work Desk תחת CEO Bureau לאחר שער יישום.',
  }),
  visualArchitectureRow({
    surfaceId: 'surface-process-library-seed',
    hebrewLabel: 'ספריית תהליכים מקצועיים',
    currentRoute: 'static-seed-only',
    currentComponent: 'src/work-spine/process-library/process-library-seed.ts',
    bucket: 'process_library',
    currentProblem: 'מקור אמת סטטי קיים, אך אין עדיין משטח UI ייעודי.',
    targetRole: 'מקור האמת לתהליכים מקצועיים ו־blueprints.',
    overlapsWith: ['surface-flowchart-pages', 'surface-dashboard-list-view', 'surface-knowledge-brain-router'],
    recommendedAction: 'לבנות משטח Process Library נפרד לפני ניקוי סופי של קיצורי ידע.',
  }),
  visualArchitectureRow({
    surfaceId: 'surface-flowchart-pages',
    hebrewLabel: 'עמודי תרשימי תהליך',
    currentRoute: '/flow/:flowId',
    currentComponent: 'src/pages/FlowchartPage.tsx',
    bucket: 'process_library',
    currentProblem: 'נראים כקיצורי ידע וניווט, אך הם נכסי תהליך מקצועיים.',
    targetRole: 'נכסי Blueprint תחת Process Library.',
    overlapsWith: ['surface-knowledge-brain-router', 'surface-process-library-seed'],
    recommendedAction: 'לשייך להצגה עתידית של Process Library בלי למחוק נכסי flow קיימים.',
  }),
  visualArchitectureRow({
    surfaceId: 'surface-knowledge-brain-router',
    hebrewLabel: 'מרכז ידע ונתב מוח',
    currentRoute: '/flow/brain-router',
    currentComponent: 'src/pages/FlowchartPage.tsx',
    bucket: 'knowledge_center',
    currentProblem: 'מערבב נתב מוח, קיצורי תהליכים וידע חזותי.',
    targetRole: 'מרכז ידע, מקורות ופרוטוקולים; לא סביבת עבודה ולא ספריית תהליך.',
    overlapsWith: ['surface-process-library-seed', 'surface-flowchart-pages'],
    recommendedAction: 'להפריד בהמשך בין Knowledge Center לבין Process Library.',
  }),
  visualArchitectureRow({
    surfaceId: 'surface-clients-cases',
    hebrewLabel: 'לקוחות ותיקים',
    currentRoute: '/clients + /case/:caseId',
    currentComponent: 'src/pages/ClientsPage.tsx + src/pages/case-view/CaseViewPage.tsx',
    bucket: 'client_workspace',
    currentProblem: 'חייב להישאר אזור עבודה חי ולא להכיל Blueprints מקצועיים.',
    targetRole: 'מרחבי לקוח, תיק ועבודה קיימת בלבד.',
    overlapsWith: ['surface-process-library-seed', 'surface-products-systems'],
    recommendedAction: 'להשאיר ב־Sidebar התפעולי ולמנוע הכנסת תהליכים מקצועיים לשם.',
  }),
  visualArchitectureRow({
    surfaceId: 'surface-robium-client-workspace',
    hebrewLabel: 'Robium כפרויקט לקוח',
    currentRoute: '/clients/robium',
    currentComponent: 'src/pages/clients/RobiumClientHub.tsx',
    bucket: 'client_workspace',
    currentProblem: 'Robium מופיע גם כלקוח/פרויקט וגם כקטלוג מוצרי מערכת.',
    targetRole: 'מרחב עבודה של לקוח/פרויקט, לא קטלוג מוצרים.',
    overlapsWith: ['surface-products-systems'],
    recommendedAction: 'לשמור כמרחב לקוח ולהעביר קטלוג מוצרים ל־Products & Systems.',
  }),
  visualArchitectureRow({
    surfaceId: 'surface-products-systems',
    hebrewLabel: 'מוצרים ומערכות',
    currentRoute: '/products + /hub',
    currentComponent: 'src/pages/products/ProductsPage.tsx + src/pages/robium-hub/RobiumHub.tsx',
    bucket: 'products_systems',
    currentProblem: 'קטלוג מוצרי Robium חופף לתרשימי תהליך ולמרחב Robium כלקוח.',
    targetRole: 'קטלוג מערכות ומוצרים בלבד.',
    overlapsWith: ['surface-robium-client-workspace', 'surface-flowchart-pages'],
    recommendedAction: 'לנסח מחדש כקטלוג מוצר/מערכת ולהפריד מתיקי לקוח ותהליכים.',
  }),
  visualArchitectureRow({
    surfaceId: 'surface-manual-preview-workbench',
    hebrewLabel: 'Manual Preview Workbench',
    currentRoute: '/internal/manual-preview-workbench',
    currentComponent: 'src/pages/internal/manual-preview-workbench/ManualPreviewWorkbench.tsx',
    bucket: 'internal_dev_tools',
    currentProblem: 'משטח תצוגה פנימי שעלול להיראות כמו עבודה תפעולית אם יוצג בניווט ראשי.',
    targetRole: 'כלי פנימי לתצוגות preview ו־proof-of-life בלבד.',
    overlapsWith: ['surface-ceo-bureau', 'surface-work-desk-route'],
    recommendedAction: 'להשאיר פנימי וללא כפתורי פעולה תפעוליים.',
  }),
  visualArchitectureRow({
    surfaceId: 'surface-brain-build-progress',
    hebrewLabel: 'מסך התקדמות בניית המוח',
    currentRoute: '/internal/brain-build-progress',
    currentComponent: 'src/pages/internal/brain-build-progress/BrainBuildProgressConsole.tsx',
    bucket: 'internal_dev_tools',
    currentProblem: 'מסך בקרה פנימי ארוך שמסכם שכבות בנייה ולא חוויית משתמש תפעולית.',
    targetRole: 'מסך בקרת פרויקט פנימי לקריאה בלבד.',
    overlapsWith: ['surface-dashboard-main', 'surface-knowledge-brain-router'],
    recommendedAction: 'להשאיר פנימי ולתעד בו את Stage 22A לאחר commit נפרד.',
  }),
];

/** Static count summary by visual architecture bucket. */
export const visualArchitectureBucketCounts = (): Record<VisualArchitectureBucket, number> =>
  VISUAL_ARCHITECTURE_MAP_ROWS.reduce(
    (bucketCounts, row) => ({
      ...bucketCounts,
      [row.bucket]: bucketCounts[row.bucket] + 1,
    }),
    {
      command_center: 0,
      work_desk: 0,
      process_library: 0,
      knowledge_center: 0,
      client_workspace: 0,
      products_systems: 0,
      internal_dev_tools: 0,
    },
  );

/** Static list of all approved bucket identifiers. */
export const visualArchitectureBuckets = (): readonly VisualArchitectureBucket[] => VISUAL_ARCHITECTURE_BUCKETS;
// #endregion
