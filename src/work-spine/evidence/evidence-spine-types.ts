/* ====
   FILE: evidence-spine-types.ts
   PURPOSE: Static Stage 13 Evidence Spine contracts.
   DEPENDENCIES: None
   EXPORTS: Evidence Spine constants and interfaces
   ==== */

// #region Constants
/** Allowed Stage 13 evidence item statuses. */
export const EVIDENCE_SPINE_STATUSES = [
  'candidate',
  'verified',
  'superseded',
  'archived_pending_approval',
] as const;

/** Allowed Stage 13 evidence approval statuses. */
export const EVIDENCE_APPROVAL_STATUSES = [
  'unapproved',
  'pending_eldad',
  'eldad_approved',
] as const;

/** Allowed confidence bands for Evidence Spine metadata. */
export const EVIDENCE_CONFIDENCE_LEVELS = [
  'low',
  'medium',
  'high',
] as const;

/** Locked Stage 13 boundary flags. */
export const EVIDENCE_BOUNDARY_FLAGS = {
  canMoveFile: false,
  canCopyFile: false,
  canDeleteFile: false,
  canRenameFile: false,
  canCreateFolder: false,
  canArchive: false,
} as const;

/** File operations blocked by the Stage 13 policy layer. */
export const BLOCKED_FILE_OPERATION_NAMES = [
  'move',
  'copy',
  'delete',
  'rename',
  'create_folder',
  'archive',
] as const;
// #endregion

// #region Types
/** Stage 13 Evidence Spine item status. */
export type EvidenceSpineStatus = (typeof EVIDENCE_SPINE_STATUSES)[number];

/** Stage 13 Evidence Spine approval status. */
export type EvidenceApprovalStatus = (typeof EVIDENCE_APPROVAL_STATUSES)[number];

/** Stage 13 confidence level label. */
export type EvidenceConfidenceLevel = (typeof EVIDENCE_CONFIDENCE_LEVELS)[number];

/** Stage 13 blocked file operation name. */
export type BlockedFileOperationName = (typeof BLOCKED_FILE_OPERATION_NAMES)[number];

/** Locked file-operation boundary flags for every evidence item. */
export interface EvidenceBoundaryFlags {
  /** Blocks file movement. */
  canMoveFile: false;
  /** Blocks file copying. */
  canCopyFile: false;
  /** Blocks file deletion. */
  canDeleteFile: false;
  /** Blocks file rename. */
  canRenameFile: false;
  /** Blocks folder creation. */
  canCreateFolder: false;
  /** Blocks archive execution. */
  canArchive: false;
}

/** Metadata-only source trace attached to an evidence item. */
export interface SourceTrace {
  /** Stable source trace id. */
  sourceTraceId: string;
  /** Source intake id from the intake spine. */
  sourceIntakeId: string;
  /** Source kind label, such as scan or protocol. */
  sourceKind: string;
  /** Source capture timestamp. */
  capturedAt: string;
  /** Static metadata-only marker. */
  metadataOnly: true;
}

/** Metadata-only official folder reference with no resolved location. */
export interface OfficialFolderRef {
  /** Stable folder reference id. */
  officialFolderRefId: string;
  /** Client or case key used for metadata assignment. */
  clientCaseKey: string;
  /** Human-readable folder label. */
  folderLabel: string;
  /** Confirms assignment is metadata only. */
  assignmentMode: 'metadata_only';
  /** Confirms no real folder location is resolved. */
  resolvedToRealLocation: false;
}

/** Version lineage record for original, derived, or superseded evidence. */
export interface VersionLineageRecord {
  /** Stable lineage record id. */
  lineageId: string;
  /** Evidence id described by this lineage record. */
  evidenceId: string;
  /** Lineage relation for this record. */
  relation: 'original' | 'derived_from' | 'superseded_by';
  /** Required source evidence id for derived records. */
  sourceEvidenceId?: string;
  /** Replacement evidence id for superseded records. */
  replacementEvidenceId?: string;
  /** Static lineage note. */
  lineageNote: string;
}

/** Static Evidence Spine item with all file operations blocked. */
export interface EvidenceSpineItem {
  /** Stable evidence id. */
  evidenceId: string;
  /** Human-readable display name. */
  displayName: string;
  /** Source intake id that produced this evidence candidate. */
  sourceIntakeId: string;
  /** Metadata-only trace back to the source. */
  sourceTrace: SourceTrace;
  /** Current preview status. */
  currentStatus: EvidenceSpineStatus;
  /** Numeric confidence score from 0 to 1. */
  confidenceLevel: number;
  /** Metadata-only official folder reference. */
  officialFolderRef: OfficialFolderRef;
  /** Version lineage records. */
  versionLineage: readonly VersionLineageRecord[];
  /** Whether this item is the original evidence candidate. */
  isOriginal: boolean;
  /** Eldad approval state for metadata-only evidence review. */
  approvalStatus: EvidenceApprovalStatus;
  /** Locked file-operation boundary flags. */
  boundaryFlags: EvidenceBoundaryFlags;
}

/** Static policy for one official source folder per client/case. */
export interface FolderRelationshipPolicy {
  /** Stable folder relationship policy id. */
  policyId: string;
  /** Scope of the folder relationship policy. */
  scope: 'one_official_source_folder_per_client_case';
  /** Confirms folder assignment is metadata only. */
  folderAssignmentMode: 'metadata_only';
  /** Confirms folder creation is blocked. */
  folderCreationBlocked: true;
  /** Confirms official folder mutation is blocked. */
  officialFolderMutationBlocked: true;
  /** Confirms assignment changes require Eldad review. */
  assignmentChangeRequiresEldad: true;
}

/** Static policy for archive proposals. */
export interface ArchiveDecisionPolicy {
  /** Stable archive decision policy id. */
  policyId: string;
  /** Confirms archive is only a proposed state. */
  proposedStateOnly: true;
  /** Confirms archive reason is required. */
  archiveReasonRequired: true;
  /** Confirms proposedBy is required. */
  proposedByRequired: true;
  /** Confirms Eldad approval is required. */
  eldadApprovalRequired: true;
  /** Confirms automatic archive is blocked. */
  automaticArchiveBlocked: true;
}

/** Static policy that blocks all file operations. */
export interface FileOperationBlockPolicy {
  /** Stable file operation block policy id. */
  policyId: string;
  /** Blocked file operation names. */
  blockedOperations: readonly BlockedFileOperationName[];
  /** Confirms all file operations are blocked. */
  allFileOperationsBlocked: true;
  /** Confirms a future gate is required for any file operation. */
  futureGateRequired: true;
}

/** Static requirement for Evidence Spine approval. */
export interface EvidenceApprovalRequirement {
  /** Stable approval requirement id. */
  approvalRequirementId: string;
  /** Statuses covered by this approval requirement. */
  appliesToStatuses: readonly EvidenceSpineStatus[];
  /** Required reviewer. */
  requiredReviewer: 'Eldad';
  /** Confirms approval is metadata-only. */
  approvalMode: 'metadata_only';
  /** Confirms approval cannot create records. */
  createsOperationalRecord: false;
}
// #endregion
