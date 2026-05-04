/* ==== FILE: src/work-spine/proof-of-life/proof-of-life-types.ts ==== */

// #region Constants
/** Formal name for the static visual proof standard. */
export const STATIC_VISUAL_PROOF_FORMAL_NAME = 'Static Visual Proof Checklist';

/** Friendly label for reports that need a short user-facing phrase. */
export const STATIC_VISUAL_PROOF_FRIENDLY_LABEL = 'Proof of Life';

/** Definition of what a static visual proof can and cannot prove. */
export const STATIC_VISUAL_PROOF_DEFINITION =
  'A proof only confirms that a preview is visibly rendered for a known input. It does NOT prove professional correctness, source verification, live provider connection, operational readiness, persistence, or task/object creation.';

/** Only allowed proof status for the checklist. */
export const STATIC_VISUAL_PROOF_STATUS = 'static_checklist_only';

/** Only allowed safety status for the checklist. */
export const STATIC_VISUAL_PROOF_SAFETY_STATUS = 'preview_visible_only_no_runtime_action';

/** Proof statuses that must never be used by static proof scenarios. */
export const BANNED_PROOF_STATUSES = [
  'executed',
  'verified_live',
  'approved',
  'final',
  'submitted',
  'ready_for_operation',
] as const;
// #endregion

// #region Types
/** Proof status allowed for a static visual checklist scenario. */
export type StaticVisualProofStatus = typeof STATIC_VISUAL_PROOF_STATUS;

/** Safety status allowed for a static visual checklist scenario. */
export type StaticVisualProofSafetyStatus = typeof STATIC_VISUAL_PROOF_SAFETY_STATUS;

/** Banned proof status marker. */
export type BannedProofStatus = (typeof BANNED_PROOF_STATUSES)[number];
// #endregion

// #region Interfaces
/** A visible rule that explains expected and forbidden screen output. */
export interface ProofOfLifeVisibilityRule {
  /** Stable visibility rule identifier. */
  ruleId: string;
  /** Visible output that should appear for this rule. */
  shouldAppear: readonly string[];
  /** Visible output that must not appear for this rule. */
  mustNotAppear: readonly string[];
  /** Why this rule only proves visible preview rendering. */
  visualProofLimitation: string;
}

/** A forbidden outcome that remains blocked by this static checklist. */
export interface ForbiddenOutcome {
  /** Stable forbidden outcome identifier. */
  outcomeId: string;
  /** Human-readable blocked outcome. */
  description: string;
}

/** An automated or manual verification method for a scenario. */
export interface VerificationMethod {
  /** Stable verification method identifier. */
  methodId: string;
  /** Verification command, test name, or manual step label. */
  label: string;
  /** Expected result from this verification method. */
  expectedResult: string;
}

/** A checkpoint that can be referenced by future commit reports. */
export interface ProofOfLifeCheckpoint {
  /** Human-readable checkpoint name. */
  checkpointName: string;
  /** Route where the visual proof is expected to render. */
  route: string;
  /** Automated tests associated with the checkpoint. */
  automatedTests: readonly VerificationMethod[];
  /** Manual verification steps for the checkpoint. */
  manualVerificationSteps: readonly string[];
}

/** Static visual proof scenario for a known demo input. */
export interface ProofOfLifeScenario {
  /** Stable scenario identifier. */
  scenarioId: string;
  /** Human-readable checkpoint name. */
  checkpointName: string;
  /** Route where the visual proof is expected to render. */
  route: string;
  /** Exact demo input to type or paste. */
  demoInput: string;
  /** Output that should be visible on screen. */
  expectedVisibleOutput: readonly string[];
  /** Output that must remain absent from the screen. */
  forbiddenVisibleOutput: readonly string[];
  /** Clear list of what must not appear. */
  whatMustNotAppear: readonly string[];
  /** Safety warnings that must be visible. */
  requiredSafetyWarnings: readonly string[];
  /** Automated tests that prove the preview rendering contract. */
  automatedTests: readonly VerificationMethod[];
  /** Manual steps for verifying the preview visually. */
  manualVerificationSteps: readonly string[];
  /** Commit anchor associated with the visual proof. */
  commitReference: string;
  /** Static proof status. */
  proofStatus: StaticVisualProofStatus;
  /** Static safety status. */
  safetyStatus: StaticVisualProofSafetyStatus;
  /** Marker proving this is a static checklist only. */
  staticChecklistOnly: true;
  /** Marker proving this only checks visible preview output. */
  previewVisibleOnly: true;
  /** Marker proving no live execution is claimed. */
  noLiveExecution: true;
  /** Marker proving no professional correctness is claimed. */
  noProfessionalCorrectnessProven: true;
  /** Marker proving the preview is not binding knowledge. */
  noBindingKnowledge: true;
  /** Marker proving the source was not verified by this checklist. */
  noSourceVerification: true;
  /** Marker proving no provider connection is claimed. */
  noProviderConnection: true;
  /** Marker proving no operational readiness is claimed. */
  noOperationalReadiness: true;
  /** Marker proving no task or object creation is claimed. */
  noTaskOrObjectCreation: true;
  /** Outcomes that remain forbidden. */
  forbiddenOutcomes: readonly ForbiddenOutcome[];
  /** Blocked actions for this scenario. */
  blockedActions: readonly string[];
  /** Safety flags visible to agents and auditors. */
  safetyFlags: readonly string[];
  /** Visibility rules for this scenario. */
  visibilityRules: readonly ProofOfLifeVisibilityRule[];
  /** Why this scenario is visual proof only. */
  visualProofLimitation: string;
}
// #endregion
