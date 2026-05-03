/* ====
   FILE: ceo-bureau-controlled-read-model-types.ts
   PURPOSE: Static Stage 15 controlled read-model contracts.
   DEPENDENCIES: None
   EXPORTS: Controlled read-model constants and interfaces
   ==== */

// #region Constants
/** Static fixture marker for Stage 15 controlled read models. */
export const CEO_BUREAU_CONTROLLED_FIXTURE_SOURCE =
  'stage15_static_ceo_bureau_controlled_read_model';

/** Display-only source object types accepted by Stage 15 controlled read models. */
export const CEO_BUREAU_CONTROLLED_SOURCE_OBJECT_TYPES = [
  'stage_6_read_only_metadata_preview',
  'stage_7_intake_approval_preview',
  'stage_8_candidate_operational_preview',
  'stage_9_real_action_policy_classification',
  'stage_10_output_preview',
  'stage_11_workflow_map_preview',
  'stage_12_qc_result_preview',
  'stage_12_qc_approval_requirement_preview',
  'stage_13_evidence_spine_metadata',
] as const;

/** Status badges allowed inside static Stage 15 metadata summaries. */
export const CEO_BUREAU_CONTROLLED_STATUS_BADGES = [
  'display_ready',
  'preview_only',
  'read_only',
  'gate_required',
  'qc_required',
  'policy_required',
  'blocked',
  'metadata_only',
] as const;

/** Stage references used as string ids only, with no imports from prior stages. */
export const CEO_BUREAU_CONTROLLED_STAGE_REFS = [
  'stage_6_read_only_metadata_gate',
  'stage_7_approval_gate',
  'stage_8_operational_preview_contract',
  'stage_9_real_action_policy_map',
  'stage_10_output_preview_contract',
  'stage_11_workflow_map_contract',
  'stage_12_qc_preview_contract',
  'stage_13_evidence_spine_metadata_contract',
  'agent_a_ceo_bureau_integration_gate',
] as const;

/** Static capability locks for every Stage 15 controlled read model. */
export const CEO_BUREAU_CONTROLLED_CAPABILITY_LOCKS = {
  canCreateWorkItem: false,
  canCreateMatter: false,
  canCreateDocumentRef: false,
  canPersist: false,
  canExecuteProviderAction: false,
  canMoveFiles: false,
  canFinalizeOutput: false,
  canBypassApproval: false,
} as const;
// #endregion

// #region Types
/** Static fixture marker for Stage 15 controlled read models. */
export type CeoBureauControlledFixtureSource =
  typeof CEO_BUREAU_CONTROLLED_FIXTURE_SOURCE;

/** Display-only source object type accepted by Stage 15 controlled read models. */
export type CeoBureauControlledSourceObjectType =
  (typeof CEO_BUREAU_CONTROLLED_SOURCE_OBJECT_TYPES)[number];

/** Metadata badge used by Stage 15 controlled read models. */
export type CeoBureauControlledStatusBadge =
  (typeof CEO_BUREAU_CONTROLLED_STATUS_BADGES)[number];

/** Stage reference id used by Stage 15 controlled read models. */
export type CeoBureauControlledStageRef =
  (typeof CEO_BUREAU_CONTROLLED_STAGE_REFS)[number];

/** Shared static capability locks for the Stage 15 controlled read model. */
export interface CeoBureauControlledSafetyLocks {
  /** Confirms no future work object can be created. */
  canCreateWorkItem: false;
  /** Confirms no case container can be created or linked. */
  canCreateMatter: false;
  /** Confirms no document reference can be created. */
  canCreateDocumentRef: false;
  /** Confirms the read model cannot write state. */
  canPersist: false;
  /** Confirms the read model cannot call external connection actions. */
  canExecuteProviderAction: false;
  /** Confirms the read model cannot move managed files. */
  canMoveFiles: false;
  /** Confirms the read model cannot finalize output. */
  canFinalizeOutput: false;
  /** Confirms the read model cannot bypass approval gates. */
  canBypassApproval: false;
}

/** Shallow display-only reference to a source object from a prior planning stage. */
export interface CeoBureauControlledSourceObjectRef {
  /** Stable display reference id. */
  sourceObjectId: string;
  /** Prior-stage source object category. */
  sourceObjectType: CeoBureauControlledSourceObjectType;
  /** Human-readable label only. */
  label: string;
  /** Display badge for scan-friendly review. */
  statusBadge: CeoBureauControlledStatusBadge;
  /** Stage id string only. */
  stageRef: CeoBureauControlledStageRef;
  /** Related trace ids, stored as strings only. */
  sourceTraceIds: readonly string[];
  /** Confirms this is not a deep embedded object. */
  referenceOnly: true;
  /** Confirms source payloads are not embedded. */
  embeddedPayloadAllowed: false;
}

/** Static summary of gates that must be satisfied before any later integration. */
export interface CeoBureauControlledGateSummary {
  /** Stable gate summary id. */
  gateSummaryId: string;
  /** Required gate refs as strings only. */
  requiredGateRefs: readonly CeoBureauControlledStageRef[];
  /** Status badge for the gate summary. */
  statusBadge: CeoBureauControlledStatusBadge;
  /** Human-readable gate label. */
  label: string;
  /** Confirms Agent A approval is still required. */
  agentAApprovalRequired: true;
}

/** Static QC metadata summary for controlled read review. */
export interface CeoBureauControlledQcSummary {
  /** Stable QC summary id. */
  qcSummaryId: string;
  /** Stage 12 result ids, as strings only. */
  qcResultIds: readonly string[];
  /** Stage 12 requirement ids, as strings only. */
  approvalRequirementIds: readonly string[];
  /** Status badge for the QC summary. */
  statusBadge: CeoBureauControlledStatusBadge;
  /** Human-readable reviewer label. */
  reviewerRequirementLabel: string;
}

/** Static policy metadata summary for controlled read review. */
export interface CeoBureauControlledPolicySummary {
  /** Stable policy summary id. */
  policySummaryId: string;
  /** Stage 9 policy refs, as strings only. */
  policyClassificationIds: readonly string[];
  /** Risk badge for the policy surface. */
  statusBadge: CeoBureauControlledStatusBadge;
  /** Human-readable policy label. */
  policyLabel: string;
}

/** Static evidence metadata summary for controlled read review. */
export interface CeoBureauControlledEvidenceSummary {
  /** Stable evidence summary id. */
  evidenceSummaryId: string;
  /** Evidence spine refs, as strings only. */
  evidenceSpineMetadataIds: readonly string[];
  /** Version policy badge. */
  versionPolicyBadge: CeoBureauControlledStatusBadge;
  /** Archive policy badge. */
  archivePolicyBadge: CeoBureauControlledStatusBadge;
  /** Confirms only metadata can be displayed. */
  metadataOnly: true;
}

/** Static workflow metadata summary for controlled read review. */
export interface CeoBureauControlledWorkflowSummary {
  /** Stable workflow summary id. */
  workflowSummaryId: string;
  /** Stage 11 workflow refs, as strings only. */
  workflowMapIds: readonly string[];
  /** Status badge for the workflow summary. */
  statusBadge: CeoBureauControlledStatusBadge;
  /** Human-readable workflow label. */
  workflowLabel: string;
}

/** Static output preview metadata summary for controlled read review. */
export interface CeoBureauControlledOutputPreviewSummary {
  /** Stable output preview summary id. */
  outputPreviewSummaryId: string;
  /** Stage 10 output refs, as strings only. */
  outputPreviewIds: readonly string[];
  /** Status badge for the output preview summary. */
  statusBadge: CeoBureauControlledStatusBadge;
  /** Confirms generation remains blocked. */
  generationBlocked: true;
}

/** Blocked operation label for the controlled read model. */
export interface CeoBureauControlledBlockedAction {
  /** Stable blocked operation id. */
  blockedActionId: string;
  /** Human-readable blocked operation label. */
  label: string;
  /** Status badge proving the operation is unavailable. */
  statusBadge: Extract<CeoBureauControlledStatusBadge, 'blocked'>;
}

/** Static approval requirement reference for the controlled read model. */
export interface CeoBureauControlledRequiredApproval {
  /** Stable required approval id. */
  requiredApprovalId: string;
  /** Reviewer role label. */
  reviewerRoleLabel: string;
  /** Required gate ref as a string only. */
  requiredGateRef: CeoBureauControlledStageRef;
  /** Status badge for the approval requirement. */
  statusBadge: CeoBureauControlledStatusBadge;
  /** Confirms approval is not stored by this model. */
  storedApprovalStateAllowed: false;
}

/** Static trace entry preserving source lineage with string ids only. */
export interface CeoBureauControlledSourceTraceEntry {
  /** Stable trace id. */
  sourceTraceId: string;
  /** Human-readable trace label. */
  label: string;
  /** Related source object ids. */
  sourceObjectIds: readonly string[];
  /** Status badge for trace review. */
  statusBadge: CeoBureauControlledStatusBadge;
}

/** Static, isolated Stage 15 controlled read model. */
export interface CeoBureauControlledReadModel {
  /** Stable read-model id. */
  id: string;
  /** Human-readable title. */
  title: string;
  /** Snapshot timestamp metadata only. */
  snapshotAt: string;
  /** Confirms this model is preview-only. */
  previewOnly: true;
  /** Confirms this model is read-only. */
  readOnly: true;
  /** Display-only source object references. */
  sourceObjects: readonly CeoBureauControlledSourceObjectRef[];
  /** Gate metadata summary. */
  gateSummary: CeoBureauControlledGateSummary;
  /** QC metadata summary. */
  qcSummary: CeoBureauControlledQcSummary;
  /** Policy metadata summary. */
  policySummary: CeoBureauControlledPolicySummary;
  /** Evidence metadata summary. */
  evidenceSummary: CeoBureauControlledEvidenceSummary;
  /** Workflow metadata summary. */
  workflowSummary: CeoBureauControlledWorkflowSummary;
  /** Output preview metadata summary. */
  outputPreviewSummary: CeoBureauControlledOutputPreviewSummary;
  /** Explicitly blocked operations. */
  blockedActions: readonly CeoBureauControlledBlockedAction[];
  /** Required approval references. */
  requiredApprovals: readonly CeoBureauControlledRequiredApproval[];
  /** Static safety locks. */
  safetyLocks: CeoBureauControlledSafetyLocks;
  /** Source trace entries. */
  sourceTrace: readonly CeoBureauControlledSourceTraceEntry[];
  /** Confirms no future work object can be created. */
  canCreateWorkItem: false;
  /** Confirms no case container can be created or linked. */
  canCreateMatter: false;
  /** Confirms no document reference can be created. */
  canCreateDocumentRef: false;
  /** Confirms no state write is allowed. */
  canPersist: false;
  /** Confirms no external connection action is allowed. */
  canExecuteProviderAction: false;
  /** Confirms no managed file movement is allowed. */
  canMoveFiles: false;
  /** Confirms no output finalization is allowed. */
  canFinalizeOutput: false;
  /** Confirms approval gates cannot be bypassed. */
  canBypassApproval: false;
  /** Static fixture marker. */
  fixtureSource: CeoBureauControlledFixtureSource;
}
// #endregion
