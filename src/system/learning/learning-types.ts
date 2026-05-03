/* ============================================
   FILE: learning-types.ts
   PURPOSE: Static Brain Learning System contracts, taxonomy axes, and approval boundaries.
   DEPENDENCIES: None
   EXPORTS: Learning statuses, taxonomy axes, candidate, evidence, decision, and approval contracts
   ============================================ */

// #region Status And Taxonomy Constants
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

/** Professional knowledge domains that learning candidates may be classified under. */
export const KNOWLEDGE_DOMAINS = [
  'vat',
  'bookkeeping',
  'international_tax',
  'מע"מ',
  'מס הכנסה',
  'מיסוי',
  'דיני עבודה',
  'שכר',
  'פיצויי מלחמה',
  'הנהלת חשבונות',
] as const;

/** Domain label for professional learning candidates. */
export type KnowledgeDomain = (typeof KNOWLEDGE_DOMAINS)[number];

/** Professional workflows or processes that a learning candidate may support. */
export const LEARNING_WORKFLOWS = [
  'monthly_vat_reconciliation',
  'document_ingestion',
  'invoice_classification',
  'expense_recognition',
  'דיווח מע"מ',
  'דוח כספי',
  'הצהרת הון',
  'החזר מס',
  'חוות דעת',
  'ביטול קנס',
  'מילוי טפסים',
] as const;

/** Workflow/process label for learning candidates. */
export type LearningWorkflow = (typeof LEARNING_WORKFLOWS)[number];

/** Output artifact types that a learning candidate may help produce. */
export const LEARNING_OUTPUT_TYPES = [
  'architectural_rule',
  'process_boundary',
  'tax_treatment_rule',
  'מכתב',
  'טופס',
  'דוח',
  'חישוב',
  'חוות דעת',
  'אקסל',
  'PDF',
  'הודעה ללקוח',
] as const;

/** Output type label for learning candidates. */
export type LearningOutputType = (typeof LEARNING_OUTPUT_TYPES)[number];

/** Entity, client, or case tags that learning candidates may be associated with. */
export const LEARNING_ENTITY_TAGS = [
  'universal',
  'דימה',
  'צילה',
  'דוד אלדד',
  'רוביום',
  'בבילון',
  'א.א. עוגנים',
  'כללי / ללא לקוח',
] as const;

/** Entity/client/case tag for learning candidates. */
export type LearningEntityTag = (typeof LEARNING_ENTITY_TAGS)[number];

/** Source channels from which learning evidence may originate. */
export const LEARNING_SOURCE_CHANNELS = ['eldad_decision_log', 'סריקה', 'Email', 'Drive', 'אזור אישי', 'ידני'] as const;

/** Source channel tag for learning candidates. */
export type LearningSourceChannel = (typeof LEARNING_SOURCE_CHANNELS)[number];
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
  /** Knowledge domains where the decision applies. */
  readonly appliesToKnowledgeDomains: readonly KnowledgeDomain[];
  /** Workflows where the decision applies. */
  readonly appliesToWorkflows: readonly LearningWorkflow[];
  /** Output types where the decision applies. */
  readonly appliesToOutputTypes: readonly LearningOutputType[];
  /** Entities/clients/cases where the decision applies. */
  readonly appliesToEntities: readonly LearningEntityTag[];
  /** Source channels where the decision applies. */
  readonly appliesToSourceChannels: readonly LearningSourceChannel[];
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
  /** Short metadata-only summary; never raw source content. */
  readonly summary: string;
  /** Professional knowledge domains. */
  readonly knowledgeDomains: readonly KnowledgeDomain[];
  /** Professional workflows/processes. */
  readonly workflows: readonly LearningWorkflow[];
  /** Output artifact types. */
  readonly outputTypes: readonly LearningOutputType[];
  /** Related entities/clients/cases. */
  readonly entities: readonly LearningEntityTag[];
  /** Evidence source channels. */
  readonly sourceChannels: readonly LearningSourceChannel[];
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
