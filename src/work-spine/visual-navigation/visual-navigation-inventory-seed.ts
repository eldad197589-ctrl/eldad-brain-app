/* ==== FILE: src/work-spine/visual-navigation/visual-navigation-inventory-seed.ts ==== */

// #region Imports
import { VISUAL_NAVIGATION_BLOCKED_ACTIONS } from './visual-navigation-inventory-types';
import type {
  VisualNavigationBucket,
  VisualNavigationInventoryItem,
  VisualNavigationMixingRisk,
  VisualNavigationSourceSurface,
} from './visual-navigation-inventory-types';
// #endregion

// #region Constants
/** Global warning for the Stage 21B static visual navigation inventory. */
export const VISUAL_NAVIGATION_INVENTORY_WARNING =
  'מלאי ניווט חזותי סטטי בלבד — מסווג פריטים קיימים לצורך תכנון, לא משנה ניווט, לא יוצר אזורי עבודה, ולא מעניק הרשאת פעולה.';

/** Gate required before any real navigation implementation can be started. */
export const VISUAL_NAVIGATION_REQUIRED_GATE =
  'אישור אלדד נפרד לשינוי ניווט חזותי אחרי ביקורת Stage 21B';

/** Display labels for the four approved visual navigation buckets. */
export const VISUAL_NAVIGATION_BUCKET_LABELS = {
  control_view: 'Control Views',
  professional_process_blueprint: 'Professional Process Blueprints',
  real_client_case_work_area: 'Real Clients / Cases / Work Areas',
  product_system: 'Products / Systems',
} as const satisfies Record<VisualNavigationBucket, string>;

/** Input shape for building one static visual navigation inventory row. */
interface VisualNavigationItemInput {
  /** Stable static item identifier. */
  itemId: string;
  /** User-facing label observed during the audit. */
  label: string;
  /** Route, route family, or code pointer where the item is visible. */
  routeOrPath: string;
  /** Current visual surface where the item was observed. */
  sourceSurface: VisualNavigationSourceSurface;
  /** Current UI/navigation grouping where the item appears. */
  currentLocation: string;
  /** Approved Stage 21B classification bucket. */
  bucket: VisualNavigationBucket;
  /** Why this record belongs in the selected bucket. */
  classificationReason: string;
  /** Current mixing risk observed in the visual navigation tree. */
  currentMixingRisk: VisualNavigationMixingRisk;
  /** Human-readable notes about the current mixing risk. */
  mixingNotes?: readonly string[];
  /** Proposed future home for a corrected hierarchy. */
  recommendedHome?: VisualNavigationBucket;
}

const PROCESS_IN_SIDEBAR_NOTE = [
  'professional process blueprint appears inside office operations navigation',
] as const;

const CASE_IN_PROCESS_NOTE = ['case or work area appears inside a process visual surface'] as const;
const TOOL_IN_PROCESS_NOTE = ['tool or engine appears inside a process visual surface'] as const;
const SYSTEM_SPLIT_NOTE = ['system/product needs a separate products and systems home'] as const;
const CONTROL_NOTE = ['control surface should stay separate from process and case work areas'] as const;
// #endregion

// #region Helpers
const buildVisualNavigationItem = (input: VisualNavigationItemInput): VisualNavigationInventoryItem => ({
  itemId: input.itemId,
  label: input.label,
  routeOrPath: input.routeOrPath,
  sourceSurface: input.sourceSurface,
  currentLocation: input.currentLocation,
  bucket: input.bucket,
  recommendedHome: input.recommendedHome ?? input.bucket,
  classificationReason: input.classificationReason,
  staticIndexOnly: true,
  visualNavigationOnly: true,
  changesRuntimeNavigation: false,
  changesRouting: false,
  canExecute: false,
  canCreateOperationalObject: false,
  canPersist: false,
  readsSourceContent: false,
  blockedActions: VISUAL_NAVIGATION_BLOCKED_ACTIONS,
  requiredGateBeforeChange: VISUAL_NAVIGATION_REQUIRED_GATE,
  currentMixingRisk: input.currentMixingRisk,
  mixingNotes: input.mixingNotes ?? [],
  visibleWarning: VISUAL_NAVIGATION_INVENTORY_WARNING,
});
// #endregion

// #region Static Data
/** Static Stage 21B inventory of current visual navigation and process items. */
export const VISUAL_NAVIGATION_INVENTORY_ITEMS: readonly VisualNavigationInventoryItem[] = [
  buildVisualNavigationItem({
    itemId: 'control-dashboard-main',
    label: 'דשבורד ראשי',
    routeOrPath: '/',
    sourceSurface: 'sidebar',
    currentLocation: 'CEO / Dashboard',
    bucket: 'control_view',
    classificationReason: 'top-level control view for visual brain overview',
    currentMixingRisk: 'none',
    mixingNotes: CONTROL_NOTE,
  }),
  buildVisualNavigationItem({
    itemId: 'control-ceo-bureau',
    label: 'לוח מנכ"ל',
    routeOrPath: '/ceo',
    sourceSurface: 'sidebar',
    currentLocation: 'CEO / Dashboard',
    bucket: 'control_view',
    classificationReason: 'office control surface, not a professional process blueprint',
    currentMixingRisk: 'none',
    mixingNotes: CONTROL_NOTE,
  }),
  buildVisualNavigationItem({
    itemId: 'control-brain-build-progress',
    label: 'מסך התקדמות בניית המוח',
    routeOrPath: '/internal/brain-build-progress',
    sourceSurface: 'route_table',
    currentLocation: 'Internal control routes',
    bucket: 'control_view',
    classificationReason: 'read-only progress control view',
    currentMixingRisk: 'none',
  }),
  buildVisualNavigationItem({
    itemId: 'control-manual-preview-workbench',
    label: 'Manual Preview Workbench',
    routeOrPath: '/internal/manual-preview-workbench',
    sourceSurface: 'route_table',
    currentLocation: 'Internal preview routes',
    bucket: 'control_view',
    classificationReason: 'preview workbench surface, not an operational work area',
    currentMixingRisk: 'none',
  }),
  buildVisualNavigationItem({
    itemId: 'control-command-palette',
    label: 'Command Palette',
    routeOrPath: 'src/components/CommandPalette.tsx',
    sourceSurface: 'command_palette',
    currentLocation: 'Global command palette',
    bucket: 'control_view',
    classificationReason: 'global navigation control surface with action shortcut risk',
    currentMixingRisk: 'control_mixed_with_action_shortcuts',
    mixingNotes: ['inherits sidebar tree and also exposes quick-action style entries'],
  }),
  buildVisualNavigationItem({
    itemId: 'process-brain-router',
    label: 'נתב המוח',
    routeOrPath: '/flow/brain-router',
    sourceSurface: 'sidebar',
    currentLocation: 'Knowledge & AI',
    bucket: 'control_view',
    classificationReason: 'brain routing map is a control/navigation blueprint rather than a client case',
    currentMixingRisk: 'requires_future_split',
    mixingNotes: ['currently appears as knowledge navigation while also using flow route shape'],
  }),
  ...[
    ['process-institutional-reports', 'דוחות מוסדיים', '/flow/institutional-reports'],
    ['process-penalty-cancellation', 'ביטול קנסות', '/flow/penalty-cancellation'],
    ['process-declaration-of-capital', 'הצהרת הון', '/flow/declaration-of-capital'],
    ['process-vat-report', 'דו"ח מע"מ', '/coming-soon'],
    ['process-attendance', 'נוכחות עובדים', '/flow/attendance'],
    ['process-attendance-agents', 'סוכני נוכחות', '/flow/attendance-agents'],
    ['process-payroll-processing', 'עיבוד שכר', '/flow/payroll-processing'],
    ['process-worklaw', 'דיני עבודה', '/flow/worklaw'],
    ['process-expert-opinion', 'חוות דעת מומחה', '/flow/expert-opinion'],
    ['process-capital-gains', 'רווח הון ממקרקעין בחו"ל', '/flow/capital-gains'],
    ['process-guardian', 'אפוטרופוס', '/flow/guardian-pro'],
    ['process-war-compensation', 'פיצויי מלחמה', '/flow/war-compensation'],
    ['process-insolvency', 'חדלות פירעון', '/flow/insolvency'],
  ].map(([itemId, label, routeOrPath]) =>
    buildVisualNavigationItem({
      itemId,
      label,
      routeOrPath,
      sourceSurface: 'sidebar',
      currentLocation: 'תפעול משרדי',
      bucket: 'professional_process_blueprint',
      classificationReason: 'professional workflow/process blueprint currently shown as office operations navigation',
      currentMixingRisk: 'process_in_operational_nav',
      mixingNotes: PROCESS_IN_SIDEBAR_NOTE,
    }),
  ),
  ...[
    ['work-clients-index', 'לקוחות', '/clients'],
    ['work-leads', 'לידים', '/leads'],
    ['work-onboarding', 'קליטת לקוח חדש', '/onboarding'],
    ['work-active-cases', 'תיקים פעילים', '/case/:caseId'],
    ['work-helman-case', 'תיק הלמן', '/case/helman'],
    ['work-guardian-case', 'תיק אפוטרופוס', '/case/guardian'],
    ['work-tsila-case', 'עבודה אקדמית — צילה', '/case/tsila-shvartz'],
    ['work-spine-board', 'Work Spine board', '/work-spine'],
  ].map(([itemId, label, routeOrPath]) =>
    buildVisualNavigationItem({
      itemId,
      label,
      routeOrPath,
      sourceSurface: itemId === 'work-active-cases' ? 'visual_surface_inventory' : 'route_table',
      currentLocation: 'Clients / Cases / Work areas',
      bucket: 'real_client_case_work_area',
      classificationReason: 'client, case, intake, or work-area navigation surface',
      currentMixingRisk: itemId.includes('case') ? 'case_inside_process_visual' : 'requires_future_split',
      mixingNotes: itemId.includes('case') ? CASE_IN_PROCESS_NOTE : ['belongs in operational navigation, not process library'],
    }),
  ),
  ...[
    ['system-quotes-generator', 'מחולל הצעות מחיר', '/quotes-generator'],
    ['system-pricing-manager', 'מנהל מחירון', '/pricing-manager'],
    ['system-letter-bot', 'בוט מכתבים', '/letter'],
    ['system-documents', 'איסוף מסמכים', '/documents'],
    ['system-document-change-agent', 'Document Change Agent', '/document-change-agent'],
    ['system-messaging', 'מערכת הודעות', '/messaging'],
    ['system-products', 'מוצרים', '/products'],
    ['system-comparison', 'השוואת מוצרים', '/comparison'],
    ['system-robium-client', 'Robium client area', '/clients/robium'],
    ['system-robium-agreement', 'Robium agreement', '/agreement'],
    ['system-founders', 'Founders', '/founders'],
    ['system-incubator', 'Incubator', '/incubator'],
    ['system-accounting-core', 'Accounting Core', '/accounting-core'],
    ['system-calculator', 'מחשבון', '/calculator'],
  ].map(([itemId, label, routeOrPath]) =>
    buildVisualNavigationItem({
      itemId,
      label,
      routeOrPath,
      sourceSurface: 'route_table',
      currentLocation: 'Shared engines / Product routes',
      bucket: 'product_system',
      classificationReason: 'product, tool, or system surface rather than a client work area',
      currentMixingRisk: 'system_inside_process_nav',
      mixingNotes: itemId === 'system-calculator' ? TOOL_IN_PROCESS_NOTE : SYSTEM_SPLIT_NOTE,
    }),
  ),
];

/** Static count summary by the four approved navigation buckets. */
export const visualNavigationBucketCounts = (): Record<VisualNavigationBucket, number> =>
  VISUAL_NAVIGATION_INVENTORY_ITEMS.reduce(
    (bucketCounts, item) => ({
      ...bucketCounts,
      [item.bucket]: bucketCounts[item.bucket] + 1,
    }),
    {
      control_view: 0,
      professional_process_blueprint: 0,
      real_client_case_work_area: 0,
      product_system: 0,
    } satisfies Record<VisualNavigationBucket, number>,
  );
// #endregion
