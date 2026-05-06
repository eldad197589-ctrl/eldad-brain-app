/* ==== FILE: src/work-spine/visual-architecture/visual-architecture-map-types.ts ==== */

// #region Constants
/** Hebrew label for the static Visual Architecture Map. */
export const VISUAL_ARCHITECTURE_MAP_LABEL = 'מפת ארכיטקטורה חזותית';

/** Approved visual architecture buckets for Stage 22A. */
export const VISUAL_ARCHITECTURE_BUCKETS = [
  'command_center',
  'work_desk',
  'process_library',
  'knowledge_center',
  'client_workspace',
  'products_systems',
  'internal_dev_tools',
] as const;

/** Static safety warning for every Stage 22A architecture record. */
export const VISUAL_ARCHITECTURE_MAP_WARNING =
  'מפת ארכיטקטורה חזותית בלבד — אין שינוי UI, אין שינוי ניתוב, אין הפעלת runtime, ואין הרשאה ליישום ללא אישור אלדד.';

/** Blocked action markers for the static Visual Architecture Map. */
export const VISUAL_ARCHITECTURE_BLOCKED_ACTIONS = [
  'change_ui',
  'change_routes',
  'change_sidebar',
  'change_dashboard',
  'change_layout',
  'touch_neurons',
  'create_runtime_behavior',
  'move_stage_20',
] as const;
// #endregion

// #region Types
/** Approved Stage 22A visual architecture bucket. */
export type VisualArchitectureBucket = (typeof VISUAL_ARCHITECTURE_BUCKETS)[number];

/** Blocked action marker for the static Visual Architecture Map. */
export type VisualArchitectureBlockedAction = (typeof VISUAL_ARCHITECTURE_BLOCKED_ACTIONS)[number];
// #endregion

// #region Interfaces
/** Static architecture record for one visible brain surface or planned visual surface. */
export interface VisualArchitectureMapRow {
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
  /** Stage 22A records never implement UI changes. */
  implementationAllowed: false;
  /** Eldad approval is required before any real visual architecture change. */
  requiresEldadApproval: true;
  /** Static map warning carried by every row. */
  visibleWarning: string;
  /** Blocked actions for this static row. */
  blockedActions: readonly VisualArchitectureBlockedAction[];
}
// #endregion
