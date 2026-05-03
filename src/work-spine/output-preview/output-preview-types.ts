/* ====
   FILE: output-preview-types.ts
   PURPOSE: Static Stage 10 professional output preview contracts.
   DEPENDENCIES: Stage 9 real-action policy contracts
   EXPORTS: Output preview types, registry constants, and preview contracts
   ==== */

// #region Imports
import type { RealActionName, RealActionRiskName } from '../policy/real-actions-policy-types';
// #endregion

// #region Constants
/** Required Stage 10 professional output preview types. */
export const OUTPUT_PREVIEW_TYPES = [
  'letter',
  'task_summary',
  'scan_intake_report',
  'protocol_action_summary',
  'vat_review_memo',
  'evidence_summary',
  'professional_opinion_draft',
] as const;

/** Allowed Stage 10 output preview statuses. */
export const OUTPUT_PREVIEW_STATUSES = [
  'preview_draft',
  'structural_placeholder',
] as const;

/** Locked blocker reason for Stage 10 output preview generation. */
export const OUTPUT_GENERATION_BLOCKED_REASON = 'preview_only_no_generation';
// #endregion

// #region Types
/** Professional output preview type names allowed in Stage 10. */
export type OutputPreviewType = (typeof OUTPUT_PREVIEW_TYPES)[number];

/** Stage 10 output statuses that cannot be treated as completed output. */
export type OutputPreviewStatus = (typeof OUTPUT_PREVIEW_STATUSES)[number];

/** Text direction for professional output preview metadata. */
export type OutputLanguageDirection = 'ltr' | 'rtl';

/** Preview-only professional output contract. */
export interface ProfessionalOutputPreview {
  /** Stable output preview id. */
  outputPreviewId: string;
  /** Required output preview type. */
  outputType: OutputPreviewType;
  /** Locked preview output status. */
  outputStatus: OutputPreviewStatus;
  /** Source intake preview id. */
  sourceIntakeId: string;
  /** Source approval decision id. */
  sourceApprovalId: string;
  /** Source operational preview id. */
  sourceOperationalPreviewId: string;
  /** Stage 9 policy action reference. */
  policyActionRef: RealActionName;
  /** Metadata-only professional purpose. */
  professionalPurpose: string;
  /** Intended audience label. */
  intendedAudience: string;
  /** Language direction for preview metadata. */
  languageDirection: OutputLanguageDirection;
  /** Risk name for this preview. */
  riskLevel: RealActionRiskName;
  /** Required reviewer name or role. */
  requiredReviewer: string;
  /** Confirms Eldad must review before any later gate. */
  eldadMustReview: true;
  /** Confirms the preview cannot be automatically generated. */
  neverAutoGenerate: true;
  /** Confirms output generation is blocked. */
  generationBlocked: true;
  /** Locked generation blocker reason. */
  generationBlockedReason: typeof OUTPUT_GENERATION_BLOCKED_REASON;
  /** Confirms the preview is manual-only where required by risk. */
  manualOnly?: true;
}

/** Static registry entry for a professional output preview type. */
export interface OutputPreviewRegistryEntry {
  /** Required output preview type. */
  outputType: OutputPreviewType;
  /** Display label for internal previews. */
  displayName: string;
  /** Allowed preview statuses for this output type. */
  allowedStatuses: readonly OutputPreviewStatus[];
  /** Confirms generation stays blocked for this output type. */
  generationBlocked: true;
  /** Confirms the registry entry cannot export files. */
  exportBlocked: true;
  /** Confirms the registry entry is static metadata only. */
  staticPreviewOnly: true;
}
// #endregion
