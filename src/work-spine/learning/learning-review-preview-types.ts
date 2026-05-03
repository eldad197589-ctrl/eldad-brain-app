/* ====
   FILE: learning-review-preview-types.ts
   PURPOSE: Static Stage 14 learning review preview contracts.
   DEPENDENCIES: None
   EXPORTS: Learning review preview constants and interfaces
   ==== */

// #region Constants
/** Required Stage 14 learning kinds. */
export const LEARNING_REVIEW_KINDS = [
  'fact',
  'domain_rule',
  'workflow_pattern',
  'preference',
  'blocked_learning',
] as const;

/** Required Stage 14 review statuses. */
export const LEARNING_REVIEW_STATUSES = [
  'observed_pattern',
  'learning_candidate',
  'needs_source_trace',
  'pending_eldad_review',
  'approved_for_reuse_preview',
  'rejected',
  'deferred',
  'blocked',
] as const;

/** Stage 14 candidate source categories for static previews. */
export const LEARNING_CANDIDATE_TYPES = [
  'intake_metadata_pattern',
  'workflow_map_pattern',
  'output_review_pattern',
  'qc_finding_pattern',
  'forbidden_learning_pattern',
] as const;

/** Stage 14 domain ids kept local to avoid structural coupling. */
export const LEARNING_REVIEW_DOMAINS = [
  'protocol_task_management',
  'client_case_filing',
  'bookkeeping',
  'vat',
  'payroll',
  'war_compensation',
  'labor_law',
  'expert_opinions',
  'core',
] as const;

/** Risk levels for static learning review previews. */
export const LEARNING_REVIEW_RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

/** Evidence strength labels for static learning review previews. */
export const LEARNING_EVIDENCE_STRENGTHS = [
  'none',
  'weak',
  'partial',
  'sufficient_for_preview',
] as const;

/** Suggested reuse scopes for non-binding learning previews. */
export const LEARNING_REUSE_SCOPES = [
  'none',
  'single_case_preview',
  'domain_preview',
  'workflow_preview',
] as const;

/** Boundary flags that keep Stage 14 non-binding and non-writing. */
export const LEARNING_REVIEW_BOUNDARY_FLAGS = [
  'static_preview_only',
  'stage13_id_trace_only',
  'eldad_review_required',
  'no_binding_knowledge',
  'no_writes',
  'no_automatic_learning',
] as const;
// #endregion

// #region Types
/** Required Stage 14 learning kind. */
export type LearningReviewKind = (typeof LEARNING_REVIEW_KINDS)[number];

/** Required Stage 14 review status. */
export type LearningReviewStatus = (typeof LEARNING_REVIEW_STATUSES)[number];

/** Static Stage 14 candidate source category. */
export type LearningCandidateType = (typeof LEARNING_CANDIDATE_TYPES)[number];

/** Stage 14 domain id. */
export type LearningReviewDomain = (typeof LEARNING_REVIEW_DOMAINS)[number];

/** Stage 14 learning preview risk level. */
export type LearningReviewRiskLevel = (typeof LEARNING_REVIEW_RISK_LEVELS)[number];

/** Stage 14 evidence strength label. */
export type LearningEvidenceStrength = (typeof LEARNING_EVIDENCE_STRENGTHS)[number];

/** Stage 14 suggested reuse scope. */
export type LearningReuseScope = (typeof LEARNING_REUSE_SCOPES)[number];

/** Static Stage 14 learning review preview that cannot become binding knowledge. */
export interface LearningReviewPreview {
  /** Stable preview id. */
  previewId: string;
  /** Stable learning candidate id. */
  candidateId: string;
  /** Static candidate source category. */
  candidateType: LearningCandidateType;
  /** Required learning kind. */
  learningKind: LearningReviewKind;
  /** Domain this preview belongs to. */
  domain: LearningReviewDomain;
  /** Human-readable proposed learning text. */
  proposedLearning: string;
  /** Stage 13 source trace ids as strings only. */
  sourceTraceIds: readonly string[];
  /** Stage 13 evidence bundle id as a string only. */
  evidenceBundleId: string;
  /** Stage 13 evidence item ids as strings only. */
  evidenceItemIds: readonly string[];
  /** Evidence strength for preview review. */
  evidenceStrength: LearningEvidenceStrength;
  /** Missing evidence notes. */
  missingEvidence: readonly string[];
  /** Risk level for the proposed learning. */
  riskLevel: LearningReviewRiskLevel;
  /** Confirms whether professional review is required. */
  professionalReviewRequired: boolean;
  /** Suggested non-binding reuse scope. */
  suggestedReuseScope: LearningReuseScope;
  /** Required review status. */
  reviewStatus: LearningReviewStatus;
  /** Eldad decision id when the preview is approved for reuse preview. */
  eldadDecisionId: string | null;
  /** Eldad approval is always required before reuse. */
  approvalRequired: true;
  /** Learning cannot become binding in Stage 14. */
  bindingKnowledge: false;
  /** Learning cannot be persisted in Stage 14. */
  persistenceAllowed: false;
  /** Learning cannot happen automatically in Stage 14. */
  automaticLearningAllowed: false;
  /** Learning cannot write memory in Stage 14. */
  memoryWriteAllowed: false;
  /** Learning cannot write retrieval stores in Stage 14. */
  ragWriteAllowed: false;
  /** Learning cannot write a knowledge log in Stage 14. */
  knowledgeLogWriteAllowed: false;
  /** Learning cannot write the brain store in Stage 14. */
  brainStoreWriteAllowed: false;
  /** Reasons reuse is blocked or limited. */
  forbiddenReuseReasons: readonly string[];
  /** Boundary flags proving this is preview-only. */
  boundaryFlags: readonly string[];
  /** ISO timestamp for the static preview fixture. */
  createdAt: string;
}
// #endregion
