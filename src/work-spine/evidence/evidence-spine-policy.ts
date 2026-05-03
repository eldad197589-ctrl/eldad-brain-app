/* ====
   FILE: evidence-spine-policy.ts
   PURPOSE: Static Stage 13 Evidence Spine policy fixtures.
   DEPENDENCIES: Evidence Spine contracts
   EXPORTS: Static Evidence Spine policy fixtures
   ==== */

// #region Imports
import {
  BLOCKED_FILE_OPERATION_NAMES,
} from './evidence-spine-types';
import type {
  ArchiveDecisionPolicy,
  EvidenceApprovalRequirement,
  FileOperationBlockPolicy,
  FolderRelationshipPolicy,
} from './evidence-spine-types';
// #endregion

// #region Folder Relationship Policy
/** Static folder relationship policy for metadata-only evidence assignment. */
export const EVIDENCE_FOLDER_RELATIONSHIP_POLICY: FolderRelationshipPolicy = {
  policyId: 'evidence-folder-policy-stage13',
  scope: 'one_official_source_folder_per_client_case',
  folderAssignmentMode: 'metadata_only',
  folderCreationBlocked: true,
  officialFolderMutationBlocked: true,
  assignmentChangeRequiresEldad: true,
};
// #endregion

// #region Archive Policy
/** Static archive decision policy that keeps archive as a proposal only. */
export const EVIDENCE_ARCHIVE_DECISION_POLICY: ArchiveDecisionPolicy = {
  policyId: 'evidence-archive-policy-stage13',
  proposedStateOnly: true,
  archiveReasonRequired: true,
  proposedByRequired: true,
  eldadApprovalRequired: true,
  automaticArchiveBlocked: true,
};
// #endregion

// #region File Operation Policy
/** Static file operation block policy for all Evidence Spine items. */
export const EVIDENCE_FILE_OPERATION_BLOCK_POLICY: FileOperationBlockPolicy = {
  policyId: 'evidence-file-operation-block-policy-stage13',
  blockedOperations: BLOCKED_FILE_OPERATION_NAMES,
  allFileOperationsBlocked: true,
  futureGateRequired: true,
};
// #endregion

// #region Approval Requirements
/** Static Evidence Spine approval requirements. */
export const EVIDENCE_APPROVAL_REQUIREMENTS: readonly EvidenceApprovalRequirement[] = [
  {
    approvalRequirementId: 'evidence-approval-candidate',
    appliesToStatuses: ['candidate'],
    requiredReviewer: 'Eldad',
    approvalMode: 'metadata_only',
    createsOperationalRecord: false,
  },
  {
    approvalRequirementId: 'evidence-approval-archive-proposal',
    appliesToStatuses: ['archived_pending_approval'],
    requiredReviewer: 'Eldad',
    approvalMode: 'metadata_only',
    createsOperationalRecord: false,
  },
  {
    approvalRequirementId: 'evidence-approval-superseded-lineage',
    appliesToStatuses: ['superseded'],
    requiredReviewer: 'Eldad',
    approvalMode: 'metadata_only',
    createsOperationalRecord: false,
  },
];
// #endregion
