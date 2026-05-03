/* ====
   FILE: approval-decision-types.ts
   PURPOSE: Static Approval Gate contracts for metadata-only Unified Intake previews.
   DEPENDENCIES: Unified Intake source contracts
   EXPORTS: Approval decision types, constants, and validation helpers
   ==== */

// #region Imports
import type { IntakeSourceType } from '../intake/unified-intake-source-types';
// #endregion

// #region Constants
/** Allowed approval statuses for the static Stage 7A Approval Gate. */
export const APPROVAL_DECISION_STATUSES = [
  'pending_review',
  'approved_for_candidate_preview',
  'rejected',
  'needs_more_evidence',
  'blocked',
] as const;

/** The only allowed Stage 7A approval scope. */
export const APPROVAL_DECISION_SCOPE = 'metadata_preview_only';

/** The only allowed next step when a source is approved in Stage 7A. */
export const APPROVAL_CANDIDATE_PREVIEW_NEXT_STEP = 'candidate_preview_only';

/** The allowed next step for non-approved Stage 7A decisions. */
export const APPROVAL_NO_NEXT_STEP = 'none';

/** Locked operational blockers for every Stage 7A approval decision. */
export const APPROVAL_BLOCKED_OPERATIONAL_EFFECTS = {
  canCreateWorkItem: false,
  canCreateMatter: false,
  canCreateDocumentRef: false,
  canPersist: false,
  canRoute: false,
  canExecuteProviderAction: false,
  canCreateTask: false,
  canCreateCalendarItem: false,
  canCreateWorkflowItem: false,
} as const;
// #endregion

// #region Types
/** Allowed approval statuses for Stage 7A metadata preview decisions. */
export type ApprovalDecisionStatus = (typeof APPROVAL_DECISION_STATUSES)[number];

/** Stage 7A approval scope, limited to metadata preview review only. */
export type ApprovalDecisionScope = typeof APPROVAL_DECISION_SCOPE;

/** Allowed next step marker for Stage 7A decisions. */
export type ApprovalAllowedNextStep =
  | typeof APPROVAL_CANDIDATE_PREVIEW_NEXT_STEP
  | typeof APPROVAL_NO_NEXT_STEP;

/** Operational effects that must stay blocked for every Stage 7A decision. */
export interface ApprovalBlockedOperationalEffects {
  /** Blocks creation of real work items. */
  canCreateWorkItem: false;
  /** Blocks creation of real matters. */
  canCreateMatter: false;
  /** Blocks creation of real document references. */
  canCreateDocumentRef: false;
  /** Blocks persistence writes. */
  canPersist: false;
  /** Blocks operational routing. */
  canRoute: false;
  /** Blocks provider actions. */
  canExecuteProviderAction: false;
  /** Blocks task creation. */
  canCreateTask: false;
  /** Blocks calendar item creation. */
  canCreateCalendarItem: false;
  /** Blocks workflow item creation. */
  canCreateWorkflowItem: false;
}

/** Safety flags attached to every static Stage 7A decision. */
export interface ApprovalDecisionSafetyFlags {
  /** Confirms the decision is for metadata preview only. */
  metadataPreviewOnly: true;
  /** Confirms the decision is static mock data only. */
  staticMockOnly: true;
  /** Confirms the decision cannot create operational records. */
  operationalCreationBlocked: true;
  /** Confirms provider execution remains blocked. */
  providerActionBlocked: true;
  /** Confirms storage writes remain blocked. */
  persistenceBlocked: true;
  /** Confirms Eldad review is required before any later gate. */
  requiresEldadReview: true;
}

/** Static/mock approval decision for a metadata-only source preview. */
export interface ApprovalDecision {
  /** Stable static decision id. */
  decisionId: string;
  /** Source preview id reviewed by Eldad. */
  sourceId: string;
  /** Unified Intake source type. */
  sourceType: IntakeSourceType;
  /** Stage 7A scope, limited to metadata preview review. */
  approvalScope: ApprovalDecisionScope;
  /** Current approval decision status. */
  status: ApprovalDecisionStatus;
  /** Reviewer display name for the mock decision. */
  reviewedBy: string;
  /** ISO timestamp for the mock review event. */
  reviewedAt: string;
  /** Metadata evidence refs reviewed locally. */
  reviewedEvidenceRefs: readonly string[];
  /** Metadata-only explanation for the decision. */
  decisionReason: string;
  /** Later-only next step marker. */
  allowedNextStep: ApprovalAllowedNextStep;
  /** Explicit operational blockers. */
  blockedOperationalEffects: ApprovalBlockedOperationalEffects;
  /** Static safety flags. */
  safetyFlags: ApprovalDecisionSafetyFlags;
}
// #endregion

// #region Helpers
/** Checks whether a status belongs to the static Stage 7A allowlist. */
export const isApprovalDecisionStatus = (
  status: string,
): status is ApprovalDecisionStatus =>
  APPROVAL_DECISION_STATUSES.includes(status as ApprovalDecisionStatus);

/** Checks whether a decision keeps the Stage 7A metadata preview scope. */
export const isMetadataPreviewApprovalDecision = (
  decision: ApprovalDecision,
): boolean => decision.approvalScope === APPROVAL_DECISION_SCOPE;

/** Checks that all operational effects remain explicitly blocked. */
export const hasOnlyBlockedOperationalEffects = (
  decision: ApprovalDecision,
): boolean =>
  Object.values(decision.blockedOperationalEffects).every((effect) => effect === false);

/** Checks that an approved decision allows only later candidate preview. */
export const allowsOnlyCandidatePreview = (decision: ApprovalDecision): boolean =>
  decision.status === 'approved_for_candidate_preview' &&
  decision.allowedNextStep === APPROVAL_CANDIDATE_PREVIEW_NEXT_STEP &&
  hasOnlyBlockedOperationalEffects(decision);
// #endregion
