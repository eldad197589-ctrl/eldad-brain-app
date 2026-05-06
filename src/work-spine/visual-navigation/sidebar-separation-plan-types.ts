/* ==== FILE: src/work-spine/visual-navigation/sidebar-separation-plan-types.ts ==== */

// #region Constants
/** Approved static classifications for the Sidebar separation plan. */
export const SIDEBAR_SEPARATION_CLASSIFICATIONS = [
  'staysInSidebar',
  'movesToProcessLibrary',
  'needsEldadDecision',
] as const;
// #endregion

// #region Types
/** Classification for a current visual navigation item in the static Sidebar separation plan. */
export type SidebarSeparationClassification =
  (typeof SIDEBAR_SEPARATION_CLASSIFICATIONS)[number];

/** Static planning row for separating professional blueprints from operational navigation. */
export interface SidebarSeparationPlanRow {
  /** Stable identifier copied from the current visual navigation inventory. */
  itemId: string;
  /** Hebrew-facing label for the item. */
  hebrewLabel: string;
  /** Current visual location as identified by the Stage 21B inventory. */
  currentLocation: string;
  /** Current route or route-like pointer when known. */
  currentRoute: string | null;
  /** Proposed static classification for future Sidebar separation. */
  proposedClassification: SidebarSeparationClassification;
  /** Static explanation for the proposed classification. */
  reason: string;
  /** Proposed target visual location for a later implementation gate. */
  targetLocation: string;
  /** This plan is documentation only and does not authorize implementation. */
  implementationAllowed: false;
  /** Any implementation must receive Eldad approval first. */
  requiresEldadApproval: true;
}
// #endregion
