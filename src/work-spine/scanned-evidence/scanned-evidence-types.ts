/* ==== FILE: src/work-spine/scanned-evidence/scanned-evidence-types.ts ==== */

// #region Constants
/** Allowed document kinds for static scanned evidence candidates. */
export const DOCUMENT_KINDS = [
  'supplier_invoice',
  'demand_letter',
  'fine_or_penalty',
  'debt_notice',
  'payroll_document',
  'legal_letter',
  'tax_report',
  'bank_or_credit_document',
  'unknown',
] as const;

/** Allowed professional domains for static scanned evidence candidates. */
export const PROFESSIONAL_DOMAINS = [
  'accounting',
  'legal',
  'employee',
  'reports',
  'support',
  'core',
  'unknown',
] as const;

/** Allowed preview suggestions for static scanned evidence candidates. */
export const SUGGESTED_ACTION_PREVIEWS = [
  'preview_only_review',
  'preview_only_vat_mapping',
  'preview_only_deadline_check',
  'preview_only_classification',
  'preview_only_missing_info',
  'preview_only_payroll_review',
  'preview_only_legal_review',
  'preview_only_unknown_triage',
] as const;

/** Allowed missing-field markers for static scanned evidence candidates. */
export const MISSING_FIELDS = [
  'client_or_matter',
  'document_date',
  'period',
  'amount',
  'vat',
  'deadline',
  'counterparty',
  'supplier',
  'authority',
  'employee',
  'external_status',
  'classification',
  'suggested_preview',
] as const;

/** Allowed confidence levels for static scanned evidence candidates. */
export const CONFIDENCE_LEVELS = ['high', 'medium', 'low'] as const;

/** Allowed duplicate-risk levels for static scanned evidence candidates. */
export const DUPLICATE_RISK_LEVELS = ['none', 'possible', 'likely', 'unknown'] as const;

/** Safety marker for static scanned evidence previews. */
export const SCANNED_EVIDENCE_SAFETY_STATUS = 'static_preview_only';
// #endregion

// #region Types
/** Document kind assigned to a static scanned evidence candidate. */
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

/** Professional domain assigned to a static scanned evidence candidate. */
export type ProfessionalDomain = (typeof PROFESSIONAL_DOMAINS)[number];

/** Preview-only suggestion assigned to a static scanned evidence candidate. */
export type SuggestedActionPreview = (typeof SUGGESTED_ACTION_PREVIEWS)[number];

/** Missing-field marker assigned to a static scanned evidence candidate. */
export type MissingField = (typeof MISSING_FIELDS)[number];

/** Confidence level assigned to a static scanned evidence candidate. */
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

/** Duplicate-risk level assigned to a static scanned evidence candidate. */
export type DuplicateRiskLevel = (typeof DUPLICATE_RISK_LEVELS)[number];

/** Safety status assigned to a static scanned evidence candidate. */
export type ScannedEvidenceSafetyStatus = typeof SCANNED_EVIDENCE_SAFETY_STATUS;
// #endregion

// #region Interfaces
/** A static evidence candidate representing one scanned document preview row. */
export interface ScannedEvidenceCandidate {
  /** Stable evidence identifier. */
  evidenceId: string;
  /** Parent batch identifier. */
  batchId: string;
  /** Static source file name label. */
  sourceFileName: string;
  /** Static source folder label. */
  sourceFolderLabel: string;
  /** Document kind classification. */
  documentKind: DocumentKind;
  /** Professional domain classification. */
  professionalDomain: ProfessionalDomain;
  /** Conservative client or matter guess, when known. */
  clientOrMatterGuess: string | null;
  /** Counterparty name, when known. */
  counterparty: string | null;
  /** Supplier name, when known. */
  supplier: string | null;
  /** Authority name, when known. */
  authority: string | null;
  /** Employee name, when known. */
  employee: string | null;
  /** Document date, when known, formatted as YYYY-MM-DD. */
  documentDate: string | null;
  /** Period description, when known. */
  periodDescription: string | null;
  /** Amount, when already known from the static label. */
  amountIfKnown: string | null;
  /** VAT value, when already known and relevant. */
  vatIfRelevant: string | null;
  /** Deadline, when already known and relevant, formatted as YYYY-MM-DD. */
  deadlineIfRelevant: string | null;
  /** External system status, when already known. */
  externalSystemStatusIfKnown: string | null;
  /** Duplicate risk preview. */
  duplicateRisk: DuplicateRiskLevel;
  /** Preview-only suggested next review lens. */
  suggestedActionPreview: SuggestedActionPreview;
  /** Missing fields that still require human review. */
  missingFields: readonly MissingField[];
  /** Static trace describing how this candidate entered the seed. */
  sourceTrace: string;
  /** Confidence in the static candidate metadata. */
  confidence: ConfidenceLevel;
  /** Safety marker proving this is preview-only static data. */
  safetyStatus: ScannedEvidenceSafetyStatus;
}

/** A static batch of scanned evidence candidates. */
export interface ScannedEvidenceBatch {
  /** Stable batch identifier. */
  batchId: string;
  /** Human-readable batch label. */
  batchLabel: string;
  /** Static source folder label. */
  sourceFolderLabel: string;
  /** Static channel marker for the scans folder snapshot. */
  sourceChannel: 'scans_folder_static_snapshot';
  /** Creation marker proving this is a manual static seed. */
  createdFrom: 'static_manual_seed';
  /** Preview-only scanned evidence candidates. */
  candidates: readonly ScannedEvidenceCandidate[];
}
// #endregion
