/* ====
   FILE: real-actions-policy-types.ts
   PURPOSE: Static Stage 9 policy contracts for real-action boundaries.
   DEPENDENCIES: None
   EXPORTS: Real-action policy constants and interfaces
   ==== */

// #region Constants
/** Stage 9 risk names keyed by numeric severity. */
export const REAL_ACTION_RISK_NAMES = {
  0: 'none',
  1: 'low',
  2: 'medium',
  3: 'high',
  4: 'critical',
} as const;

/** Required Stage 9 real-action names. */
export const REAL_ACTION_NAMES = [
  'classify_intake_candidate',
  'create_work_item',
  'link_to_matter',
  'create_document_ref',
  'approve_learning_candidate',
  'file_document_to_vault',
  'move_file',
  'rename_file',
  'generate_client_letter',
  'submit_vat_report',
  'submit_tax_filing',
  'send_email_reply',
  'delete_file',
] as const;

/** Stage 9 actions that must remain manual-only. */
export const MANUAL_ONLY_REAL_ACTIONS = [
  'generate_client_letter',
  'submit_vat_report',
  'submit_tax_filing',
  'send_email_reply',
  'delete_file',
] as const;

/** Locked Stage 9 policy status. */
export const REAL_ACTION_POLICY_STATUS = 'blocked';
// #endregion

// #region Types
/** Numeric Stage 9 risk levels. */
export type RealActionRiskLevel = keyof typeof REAL_ACTION_RISK_NAMES;

/** Human-readable Stage 9 risk names. */
export type RealActionRiskName = (typeof REAL_ACTION_RISK_NAMES)[RealActionRiskLevel];

/** Required Stage 9 real-action names. */
export type RealActionName = (typeof REAL_ACTION_NAMES)[number];

/** Stage 9 actions that must remain manual-only. */
export type ManualOnlyRealAction = (typeof MANUAL_ONLY_REAL_ACTIONS)[number];

/** Allowed rollback methods for blocked real-action policies. */
export type RealActionRollbackMethod = 'undo' | 'manual_restore' | 'not_reversible';

/** Static, non-running policy for a future real action. */
export interface RealActionPolicy {
  /** Stable policy id. */
  policyId: string;
  /** Required real-action name. */
  actionName: RealActionName;
  /** Numeric risk level. */
  riskLevel: RealActionRiskLevel;
  /** Human-readable risk name matching the numeric level. */
  riskName: RealActionRiskName;
  /** Locked Stage 9 status. */
  status: typeof REAL_ACTION_POLICY_STATUS;
  /** Confirms the action has no implementation in Stage 9. */
  implementationBlocked: true;
  /** Confirms whether this action must stay manual-only. */
  manualOnly: boolean;
  /** Gates required before any later implementation review. */
  requiredGates: readonly string[];
  /** Confirms whether a later audit log would be required. */
  requiresAuditLog: boolean;
  /** Fields that a later audit log must include. */
  auditMustInclude: readonly string[];
  /** Whether a later action could be reversed by an approved process. */
  isReversible: boolean;
  /** Allowed rollback method for later approved work. */
  rollbackMethod: RealActionRollbackMethod;
  /** Whether rollback would require Eldad approval. */
  rollbackRequiresEldad: boolean;
  /** Effects explicitly forbidden at Stage 9. */
  forbiddenEffects: readonly string[];
  /** Human-readable reason for the blocked policy. */
  reason: string;
}
// #endregion
