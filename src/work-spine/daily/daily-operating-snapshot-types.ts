/* ====
   FILE: daily-operating-snapshot-types.ts
   PURPOSE: Static Stage 17 daily operating snapshot contracts.
   DEPENDENCIES: None
   EXPORTS: Daily operating snapshot constants and interfaces
   ==== */

// #region Constants
/** Required Stage 17 daily operating item group keys. */
export const DAILY_OPERATING_ITEM_GROUP_KEYS = [
  'newIntake',
  'pendingApprovals',
  'blockedItems',
  'qcWarnings',
  'workflowPreviews',
  'outputPreviews',
  'evidenceGaps',
  'learningCandidates',
  'safeNextCandidates',
] as const;

/** Valid source stage refs for the Stage 17 static snapshot. */
export const DAILY_OPERATING_SOURCE_STAGE_REFS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] as const;

/** Urgency labels used by the daily operating snapshot. */
export const DAILY_OPERATING_URGENCY_LEVELS = [
  'none',
  'low',
  'medium',
  'high',
  'critical',
] as const;

/** Risk labels used by the daily operating snapshot. */
export const DAILY_OPERATING_RISK_LABELS = [
  'none',
  'low',
  'medium',
  'high',
  'critical',
] as const;

/** Locked Stage 17 capability set. Every value must stay false. */
export const DAILY_OPERATING_CAPABILITY_LOCKS = {
  canExecuteActions: false,
  canPersistSnapshot: false,
  canCreateWorkItem: false,
  canCreateMatter: false,
  canCreateDocumentRef: false,
  canApproveItems: false,
  canGenerateFiles: false,
  canUseProviders: false,
  canMoveFiles: false,
} as const;
// #endregion

// #region Types
/** Required Stage 17 daily operating item group key. */
export type DailyOperatingItemGroupKey = (typeof DAILY_OPERATING_ITEM_GROUP_KEYS)[number];

/** Valid source stage refs for the Stage 17 static snapshot. */
export type DailyOperatingSourceStageRef = (typeof DAILY_OPERATING_SOURCE_STAGE_REFS)[number];

/** Urgency label used by the daily operating snapshot. */
export type DailyOperatingUrgencyLevel = (typeof DAILY_OPERATING_URGENCY_LEVELS)[number];

/** Risk label used by the daily operating snapshot. */
export type DailyOperatingRiskLabel = (typeof DAILY_OPERATING_RISK_LABELS)[number];

/** Count and shallow label group for the Stage 17 daily operating snapshot. */
export interface DailyOperatingItemGroup {
  /** Count of preview items in this group. */
  count: number;
  /** Shallow preview ids only. */
  ids: readonly string[];
  /** Human-readable summary labels only. */
  summaryLabels: readonly string[];
  /** Optional urgency labels only. */
  urgencyLabels: readonly DailyOperatingUrgencyLevel[];
  /** Optional risk labels only. */
  riskLabels: readonly DailyOperatingRiskLabel[];
}

/** Required item groups for the Stage 17 daily operating snapshot. */
export interface DailyOperatingItemGroups {
  /** New read-only intake previews. */
  newIntake: DailyOperatingItemGroup;
  /** Preview approvals waiting for Eldad. */
  pendingApprovals: DailyOperatingItemGroup;
  /** Blocked preview items. */
  blockedItems: DailyOperatingItemGroup;
  /** QC warning summaries. */
  qcWarnings: DailyOperatingItemGroup;
  /** Static workflow preview summaries. */
  workflowPreviews: DailyOperatingItemGroup;
  /** Static output preview summaries. */
  outputPreviews: DailyOperatingItemGroup;
  /** Evidence gap summaries. */
  evidenceGaps: DailyOperatingItemGroup;
  /** Learning candidate summaries. */
  learningCandidates: DailyOperatingItemGroup;
  /** Safe next preview candidates. */
  safeNextCandidates: DailyOperatingItemGroup;
}

/** Static Stage 17 capability contract with every action locked false. */
export interface DailyOperatingCapabilities {
  /** Confirms no action execution is available. */
  canExecuteActions: false;
  /** Confirms no snapshot persistence is available. */
  canPersistSnapshot: false;
  /** Confirms no work item creation is available. */
  canCreateWorkItem: false;
  /** Confirms no matter creation is available. */
  canCreateMatter: false;
  /** Confirms no document reference creation is available. */
  canCreateDocumentRef: false;
  /** Confirms approvals cannot be performed here. */
  canApproveItems: false;
  /** Confirms files cannot be generated. */
  canGenerateFiles: false;
  /** Confirms live providers cannot be used. */
  canUseProviders: false;
  /** Confirms files cannot be moved. */
  canMoveFiles: false;
}

/** Static, read-only daily operating snapshot for Stage 17. */
export interface DailyOperatingSnapshot {
  /** Stable snapshot id. */
  snapshotId: string;
  /** Snapshot date in YYYY-MM-DD format. */
  snapshotDate: string;
  /** Static generated timestamp for the preview fixture. */
  generatedAt: string;
  /** Confirms this is a preview-only snapshot. */
  previewOnly: true;
  /** Confirms this snapshot is read-only. */
  readOnly: true;
  /** Required shallow item groups. */
  itemGroups: DailyOperatingItemGroups;
  /** Total pending item count. */
  totalPendingCount: number;
  /** Total blocked item count. */
  totalBlockedCount: number;
  /** Total warning item count. */
  totalWarningCount: number;
  /** Whether Eldad attention is required. */
  eldadAttentionRequired: boolean;
  /** Highest urgency label across all shallow groups. */
  highestUrgencyLevel: DailyOperatingUrgencyLevel;
  /** Source stage refs, limited to stages 6 through 16. */
  sourceStageRefs: readonly DailyOperatingSourceStageRef[];
  /** Locked false capability set. */
  capabilities: DailyOperatingCapabilities;
}
// #endregion
