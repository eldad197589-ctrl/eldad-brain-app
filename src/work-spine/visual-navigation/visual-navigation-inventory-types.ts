/* ==== FILE: src/work-spine/visual-navigation/visual-navigation-inventory-types.ts ==== */

// #region Constants
/** Hebrew label for the Visual Navigation Inventory. */
export const VISUAL_NAVIGATION_INVENTORY_LABEL = 'מלאי ניווט חזותי';

/** Static classification buckets approved for Stage 21B navigation audit. */
export const VISUAL_NAVIGATION_BUCKETS = [
  'control_view',
  'professional_process_blueprint',
  'real_client_case_work_area',
  'product_system',
] as const;

/** Source surfaces inspected during the Stage 21B audit. */
export const VISUAL_NAVIGATION_SOURCE_SURFACES = [
  'sidebar',
  'dashboard',
  'command_palette',
  'route_table',
  'visual_process_registry',
  'visual_surface_inventory',
] as const;

/** Conservative mixing-risk markers for visual navigation items. */
export const VISUAL_NAVIGATION_MIXING_RISKS = [
  'none',
  'process_in_operational_nav',
  'case_inside_process_visual',
  'tool_inside_process_visual',
  'system_inside_process_nav',
  'control_mixed_with_action_shortcuts',
  'requires_future_split',
] as const;

/** Actions blocked by the static visual navigation inventory boundary. */
export const VISUAL_NAVIGATION_BLOCKED_ACTIONS = [
  'change_navigation',
  'change_route',
  'create_operational_area',
  'create_case_record',
  'create_work_record',
  'persist',
  'provider_action',
  'file_operation',
  'content_mining',
  'agent_autonomy',
] as const;
// #endregion

// #region Types
/** Approved Stage 21B visual navigation classification bucket. */
export type VisualNavigationBucket = (typeof VISUAL_NAVIGATION_BUCKETS)[number];

/** Static source surface used to map one visible navigation/process item. */
export type VisualNavigationSourceSurface = (typeof VISUAL_NAVIGATION_SOURCE_SURFACES)[number];

/** Mixing-risk marker for a visual navigation item. */
export type VisualNavigationMixingRisk = (typeof VISUAL_NAVIGATION_MIXING_RISKS)[number];

/** Blocked action marker for the static visual navigation inventory. */
export type VisualNavigationBlockedAction = (typeof VISUAL_NAVIGATION_BLOCKED_ACTIONS)[number];
// #endregion

// #region Interfaces
/** Static visual-navigation inventory record for one currently visible route or process item. */
export interface VisualNavigationInventoryItem {
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
  /** Proposed future home for a corrected hierarchy. */
  recommendedHome: VisualNavigationBucket;
  /** Why this record belongs in the selected bucket. */
  classificationReason: string;
  /** Static inventory only; this record does not wire navigation. */
  staticIndexOnly: true;
  /** Visual/navigation mapping only. */
  visualNavigationOnly: true;
  /** This seed does not change runtime navigation. */
  changesRuntimeNavigation: false;
  /** This seed does not change routing. */
  changesRouting: false;
  /** This seed cannot execute any action. */
  canExecute: false;
  /** This seed cannot create operational objects or areas. */
  canCreateOperationalObject: false;
  /** This seed cannot persist anything. */
  canPersist: false;
  /** This seed does not read source content. */
  readsSourceContent: false;
  /** Blocked actions for this static inventory record. */
  blockedActions: readonly VisualNavigationBlockedAction[];
  /** Gate required before changing real navigation or UI structure. */
  requiredGateBeforeChange: string;
  /** Current mixing risk observed in the visual navigation tree. */
  currentMixingRisk: VisualNavigationMixingRisk;
  /** Human-readable notes about the current mixing risk. */
  mixingNotes: readonly string[];
  /** Warning to show or preserve near future UI use of this record. */
  visibleWarning: string;
}
// #endregion
