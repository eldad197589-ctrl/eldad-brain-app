/* ============================================
   FILE: learning-static-seed.ts
   PURPOSE: Static mock seed for Brain Learning System candidates.
   DEPENDENCIES: learning-types
   EXPORTS: LEARNING_STATIC_SEED
   ============================================ */

// #region Imports
import type { LearningCandidate } from './learning-types';
// #endregion

// #region Static Seed
/** Static mock learning seed; no item is binding or approved. */
export const LEARNING_STATIC_SEED = [
  {
    candidateId: 'learning-seed-vat-review-001',
    title: 'מע"מ review pattern candidate',
    domain: 'מע"מ',
    status: 'needs_source',
    hypothesis: 'VAT workflow signals should remain candidates until source evidence is reviewed.',
    sourceEvidence: [
      {
        evidenceId: 'learning-evidence-vat-review-001',
        sourceKind: 'static_mock_seed',
        sourceLabel: 'Mock VAT process learning signal',
        sourceReference: 'static-seed:vat-process-review',
        capturedAt: '2026-05-03T00:00:00.000Z',
        containsPrivateMaterial: false,
        allowedAccess: 'metadata_only',
        reviewStatus: 'source_required',
      },
    ],
    decisionLog: [],
    approvalBoundary: {
      boundary: 'candidate_only',
      canBindKnowledge: false,
      requiresEldadApproval: true,
      approvedByEldad: false,
    },
    bindingUse: 'none',
    createdAt: '2026-05-03T00:00:00.000Z',
    updatedAt: '2026-05-03T00:00:00.000Z',
    notes: 'Static mock seed only; not approved and not binding.',
  },
  {
    candidateId: 'learning-seed-opinion-workflow-001',
    title: 'חוות דעת workflow corpus candidate',
    domain: 'חוות דעת',
    status: 'pending_eldad_review',
    hypothesis: 'Expert opinion work can become a learning corpus only after Eldad review.',
    sourceEvidence: [
      {
        evidenceId: 'learning-evidence-opinion-workflow-001',
        sourceKind: 'expert_workflow_metadata',
        sourceLabel: 'Mock expert opinion workflow metadata',
        sourceReference: 'static-seed:expert-opinion-workflow',
        capturedAt: '2026-05-03T00:00:00.000Z',
        containsPrivateMaterial: false,
        allowedAccess: 'metadata_only',
        reviewStatus: 'unverified',
      },
    ],
    decisionLog: [],
    approvalBoundary: {
      boundary: 'candidate_only',
      canBindKnowledge: false,
      requiresEldadApproval: true,
      approvedByEldad: false,
    },
    bindingUse: 'reference_only',
    createdAt: '2026-05-03T00:00:00.000Z',
    updatedAt: '2026-05-03T00:00:00.000Z',
    notes: 'Reference-only mock seed; no operational approval.',
  },
  {
    candidateId: 'learning-seed-war-compensation-001',
    title: 'פיצויי מלחמה evidence pattern candidate',
    domain: 'פיצויי מלחמה',
    status: 'draft',
    hypothesis: 'War compensation patterns must stay draft until multi-source evidence is checked.',
    sourceEvidence: [
      {
        evidenceId: 'learning-evidence-war-compensation-001',
        sourceKind: 'professional_pattern',
        sourceLabel: 'Mock war compensation evidence-chain signal',
        sourceReference: 'static-seed:war-compensation-evidence-chain',
        capturedAt: '2026-05-03T00:00:00.000Z',
        containsPrivateMaterial: false,
        allowedAccess: 'metadata_only',
        reviewStatus: 'unverified',
      },
    ],
    decisionLog: [],
    approvalBoundary: {
      boundary: 'candidate_only',
      canBindKnowledge: false,
      requiresEldadApproval: true,
      approvedByEldad: false,
    },
    bindingUse: 'none',
    createdAt: '2026-05-03T00:00:00.000Z',
    updatedAt: '2026-05-03T00:00:00.000Z',
    notes: 'Static mock seed only; no real client facts included.',
  },
] satisfies readonly LearningCandidate[];
// #endregion
