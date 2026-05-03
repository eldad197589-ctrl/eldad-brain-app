/* ====
   FILE: approval-decision-seed.ts
   PURPOSE: Static mock Approval Gate decisions for metadata-only source previews.
   DEPENDENCIES: Approval decision contracts
   EXPORTS: Static approval decisions
   ==== */

// #region Imports
import type { ApprovalDecision } from './approval-decision-types';
import {
  APPROVAL_BLOCKED_OPERATIONAL_EFFECTS,
  APPROVAL_CANDIDATE_PREVIEW_NEXT_STEP,
  APPROVAL_DECISION_SCOPE,
  APPROVAL_NO_NEXT_STEP,
} from './approval-decision-types';
// #endregion

// #region Static Decisions
/** Static mock decisions covering the allowed Stage 7A decision statuses. */
export const STATIC_APPROVAL_DECISIONS: readonly ApprovalDecision[] = [
  {
    decisionId: 'approval-stage7a-email-pending',
    sourceId: 'gmail:msg-stage5a-vat-question',
    sourceType: 'email',
    approvalScope: APPROVAL_DECISION_SCOPE,
    status: 'pending_review',
    reviewedBy: 'Eldad',
    reviewedAt: '2026-05-03T15:00:00.000Z',
    reviewedEvidenceRefs: ['metadata:gmail:msg-stage5a-vat-question'],
    decisionReason: 'Pending Eldad review of metadata-only email preview.',
    allowedNextStep: APPROVAL_NO_NEXT_STEP,
    blockedOperationalEffects: APPROVAL_BLOCKED_OPERATIONAL_EFFECTS,
    safetyFlags: {
      metadataPreviewOnly: true,
      staticMockOnly: true,
      operationalCreationBlocked: true,
      providerActionBlocked: true,
      persistenceBlocked: true,
      requiresEldadReview: true,
    },
  },
  {
    decisionId: 'approval-stage7a-drive-approved-preview',
    sourceId: 'drive:file-stage5b-vat-sheet',
    sourceType: 'drive',
    approvalScope: APPROVAL_DECISION_SCOPE,
    status: 'approved_for_candidate_preview',
    reviewedBy: 'Eldad',
    reviewedAt: '2026-05-03T15:05:00.000Z',
    reviewedEvidenceRefs: ['metadata:drive:file-stage5b-vat-sheet'],
    decisionReason: 'Metadata preview reviewed; later candidate preview may be prepared.',
    allowedNextStep: APPROVAL_CANDIDATE_PREVIEW_NEXT_STEP,
    blockedOperationalEffects: APPROVAL_BLOCKED_OPERATIONAL_EFFECTS,
    safetyFlags: {
      metadataPreviewOnly: true,
      staticMockOnly: true,
      operationalCreationBlocked: true,
      providerActionBlocked: true,
      persistenceBlocked: true,
      requiresEldadReview: true,
    },
  },
  {
    decisionId: 'approval-stage7a-scan-rejected',
    sourceId: 'scan:scan-stage5c-low-quality-003',
    sourceType: 'scan',
    approvalScope: APPROVAL_DECISION_SCOPE,
    status: 'rejected',
    reviewedBy: 'Eldad',
    reviewedAt: '2026-05-03T15:10:00.000Z',
    reviewedEvidenceRefs: ['metadata:scan:scan-stage5c-low-quality-003'],
    decisionReason: 'Metadata preview rejected because the static quality label is low.',
    allowedNextStep: APPROVAL_NO_NEXT_STEP,
    blockedOperationalEffects: APPROVAL_BLOCKED_OPERATIONAL_EFFECTS,
    safetyFlags: {
      metadataPreviewOnly: true,
      staticMockOnly: true,
      operationalCreationBlocked: true,
      providerActionBlocked: true,
      persistenceBlocked: true,
      requiresEldadReview: true,
    },
  },
  {
    decisionId: 'approval-stage7a-protocol-needs-evidence',
    sourceId: 'protocol:protocol-stage6d1-client-call-002',
    sourceType: 'protocol',
    approvalScope: APPROVAL_DECISION_SCOPE,
    status: 'needs_more_evidence',
    reviewedBy: 'Eldad',
    reviewedAt: '2026-05-03T15:15:00.000Z',
    reviewedEvidenceRefs: ['metadata:protocol:protocol-stage6d1-client-call-002'],
    decisionReason: 'Metadata preview needs more evidence before any later candidate preview.',
    allowedNextStep: APPROVAL_NO_NEXT_STEP,
    blockedOperationalEffects: APPROVAL_BLOCKED_OPERATIONAL_EFFECTS,
    safetyFlags: {
      metadataPreviewOnly: true,
      staticMockOnly: true,
      operationalCreationBlocked: true,
      providerActionBlocked: true,
      persistenceBlocked: true,
      requiresEldadReview: true,
    },
  },
  {
    decisionId: 'approval-stage7a-unknown-blocked',
    sourceId: 'unknown:source-stage7a-unknown',
    sourceType: 'unknown',
    approvalScope: APPROVAL_DECISION_SCOPE,
    status: 'blocked',
    reviewedBy: 'Eldad',
    reviewedAt: '2026-05-03T15:20:00.000Z',
    reviewedEvidenceRefs: ['metadata:unknown:source-stage7a-unknown'],
    decisionReason: 'Unknown metadata preview is blocked until clarified by Eldad.',
    allowedNextStep: APPROVAL_NO_NEXT_STEP,
    blockedOperationalEffects: APPROVAL_BLOCKED_OPERATIONAL_EFFECTS,
    safetyFlags: {
      metadataPreviewOnly: true,
      staticMockOnly: true,
      operationalCreationBlocked: true,
      providerActionBlocked: true,
      persistenceBlocked: true,
      requiresEldadReview: true,
    },
  },
] as const;
// #endregion
