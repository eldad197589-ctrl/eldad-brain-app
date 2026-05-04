/* ==== FILE: src/work-spine/build-progress/brain-visual-process-registry-types.ts ==== */

// #region Constants
/** Static build status values copied as visual/index-only context. */
export const BRAIN_VISUAL_PROCESS_BUILD_STATUSES = ['built', 'building', 'pending'] as const;
// #endregion

// #region Types
/** Build status shown by the static Visual Brain Process Registry snapshot. */
export type BrainVisualProcessBuildStatus = (typeof BRAIN_VISUAL_PROCESS_BUILD_STATUSES)[number];
// #endregion

// #region Interfaces
/** Static category snapshot copied from the visual Brain registry concepts. */
export interface BrainVisualProcessCategory {
  /** Stable category identifier. */
  categoryId: string;
  /** Hebrew category label. */
  categoryLabel: string;
}

/** Static visual process row for the Brain Build Progress Console. */
export interface BrainVisualProcessRegistryRow {
  /** Category identifier from the visual registry snapshot. */
  categoryId: string;
  /** Hebrew category label. */
  categoryLabel: string;
  /** Process identifier from the visual registry snapshot. */
  processId: string;
  /** Hebrew process label. */
  processLabel: string;
  /** Static visual build status. */
  buildStatus: BrainVisualProcessBuildStatus;
  /** Visual presence only, without action meaning. */
  visualPresenceOnly: true;
  /** Index row only. */
  indexOnly: true;
  /** Visual presence does not mean operational readiness. */
  operationalReady: false;
  /** The row cannot execute anything. */
  canExecute: false;
  /** The row cannot create records. */
  canCreateRecord: false;
  /** Static source trace for the snapshot. */
  sourceTrace: string;
  /** Warning shown near the registry. */
  visibleWarning: string;
}
// #endregion
