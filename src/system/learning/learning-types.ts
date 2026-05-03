/* ============================================
   FILE: learning-types.ts
   PURPOSE: Static Brain Learning System contracts and approval boundaries.
   DEPENDENCIES: None
   EXPORTS: Learning statuses, domains, candidate, evidence, decision, and approval contracts
   ============================================ */

// #region Status And Domain Constants
/** Learning statuses available before any operational knowledge binding. */
export const LEARNING_STATUSES = [
  'draft',
  'needs_source',
  'pending_eldad_review',
  'approved_by_eldad',
  'rejected',
  'obsolete',
] as const;

/** Status for a learning candidate inside the Brain Learning System. */
export type LearningStatus = (typeof LEARNING_STATUSES)[number];

/** Professional domains that learning candidates may be classified under. */
export const KNOWLEDGE_DOMAINS = [
  'מע"מ',
  'חוות דעת',
  'דיני עבודה',
  'שכר',
  'פיצויי מלחמה',
  'הנהלת חשבונות',
  'הצהרות הון',
  'החזרי מס',
  'מכתבים',
  'ניהול לקוחות',
  'רוביום',
] as const;

/** Domain label for professional learning candidates. */
export type KnowledgeDomain = (typeof KNOWLEDGE_DOMAINS)[number];
// #endregion

// #region Evidence Contracts
/** Type of source that supports a learning candidate. */
export type LearningSourceKind =
  | 'static_mock_seed'
  | 'operator_note'
  | 'source_document_metadata'
  | 'expert_workflow_metadata'
  | 'professional_pattern'
  | 'normative_reference';

/** Review level for source evidence attached to a candidate. */
export type LearningEvidenceReviewStatus = 'unverified' | 'source_required' | 'source_present' | 'eldad_confirmed';

/** Source evidence required for every learning candidate. */
export interface LearningSourceEvidence {
  /** Stable source evidence identifier. */
  readonly evidenceId: string;
  /** Evidence source kind. */
  readonly sourceKind: LearningSourceKind;
  /** Human-readable source label without raw private content. */
  readonly sourceLabel: string;
  /** Metadata-only source reference. */
  readonly sourceReference: string;
  /** When the source signal was captured. */
  readonly capturedAt: string;
  /** Whether the source may contain private client or case material. */
  readonly containsPrivateMaterial: boolean;
  /** How much of the source is allowed in this static contract. */
  readonly allowedAccess: 'metadata_only' | 'redacted_summary' | 'public_reference';
  /** Current source review status. */
  readonly reviewStatus: LearningEvidenceReviewStatus;
}

/** Non-empty evidence list required by the learning candidate contract. */
export type RequiredLearningEvidence = readonly [LearningSourceEvidence, ...LearningSourceEvidence[]];
// #endregion

// #region Decision And Boundary Contracts
/** Decision kind recorded by Eldad for a learning candidate. */
export type EldadDecisionKind = 'approve' | 'reject' | 'request_source' | 'mark_obsolete';

/** Decision log entry containing the required what, why, source, approval time, and scope. */
export interface EldadDecisionLogEntry {
  /** Stable decision log identifier. */
  readonly decisionId: string;
  /** Decision category. */
  readonly decision: EldadDecisionKind;
  /** What was decided. */
  readonly what: string;
  /** Why the decision was made. */
  readonly why: string;
  /** Source basis for the decision. */
  readonly source: string;
  /** Approval timestamp for approval decisions; null for non-approval decisions. */
  readonly approvedAt: string | null;
  /** Where the decision applies. */
  readonly appliesTo: readonly KnowledgeDomain[];
  /** Actor who made the decision. */
  readonly decidedBy: 'Eldad';
}

/** Approval boundary when a learning item is not binding professional knowledge. */
export interface LearningCandidateOnlyBoundary {
  /** Boundary status for unbound learning candidates. */
  readonly boundary: 'candidate_only';
  /** Candidate may not bind Brain behavior. */
  readonly canBindKnowledge: false;
  /** Eldad approval remains required before binding. */
  readonly requiresEldadApproval: true;
  /** No approval metadata exists yet. */
  readonly approvedByEldad: false;
}

/** Approval boundary required before a candidate becomes binding professional knowledge. */
export interface EldadApprovedBindingBoundary {
  /** Boundary status for Eldad-approved binding knowledge. */
  readonly boundary: 'eldad_approved_binding';
  /** Candidate may bind Brain behavior only after Eldad approval metadata exists. */
  readonly canBindKnowledge: true;
  /** Approval requirement has been satisfied. */
  readonly requiresEldadApproval: false;
  /** Eldad has approved this item. */
  readonly approvedByEldad: true;
  /** Eldad approval timestamp. */
  readonly approvedAt: string;
  /** Decision log entry authorizing binding use. */
  readonly approvalDecisionId: string;
}

/** Approval boundary for learning candidates and binding knowledge. */
export type LearningApprovalBoundary = LearningCandidateOnlyBoundary | EldadApprovedBindingBoundary;
// #endregion

// #region Candidate Contract
/** How a learning candidate may be used by the Brain. */
export type LearningBindingUse = 'none' | 'reference_only' | 'binding_knowledge';

/** Static Brain Learning System candidate contract. */
export interface LearningCandidate {
  /** Stable learning candidate identifier. */
  readonly candidateId: string;
  /** Human-readable title. */
  readonly title: string;
  /** Professional knowledge domain. */
  readonly domain: KnowledgeDomain;
  /** Candidate status in the learning workflow. */
  readonly status: LearningStatus;
  /** Non-binding learning hypothesis. */
  readonly hypothesis: string;
  /** Required source evidence. */
  readonly sourceEvidence: RequiredLearningEvidence;
  /** Eldad decision history. */
  readonly decisionLog: readonly EldadDecisionLogEntry[];
  /** Approval boundary governing knowledge binding. */
  readonly approvalBoundary: LearningApprovalBoundary;
  /** Current allowed Brain usage. */
  readonly bindingUse: LearningBindingUse;
  /** Creation timestamp. */
  readonly createdAt: string;
  /** Last update timestamp. */
  readonly updatedAt: string;
  /** Metadata-only notes. */
  readonly notes: string;
}
// #endregion
