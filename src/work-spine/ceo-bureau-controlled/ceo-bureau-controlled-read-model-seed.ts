/* ====
   FILE: ceo-bureau-controlled-read-model-seed.ts
   PURPOSE: Static Stage 15 controlled read-model fixtures.
   DEPENDENCIES: Stage 15 controlled read-model contracts
   EXPORTS: Controlled read-model static fixtures
   ==== */

// #region Imports
import {
  CEO_BUREAU_CONTROLLED_CAPABILITY_LOCKS,
  CEO_BUREAU_CONTROLLED_FIXTURE_SOURCE,
} from './ceo-bureau-controlled-read-model-types';
import type {
  CeoBureauControlledBlockedAction,
  CeoBureauControlledGateSummary,
  CeoBureauControlledOutputPreviewSummary,
  CeoBureauControlledPolicySummary,
  CeoBureauControlledQcSummary,
  CeoBureauControlledReadModel,
  CeoBureauControlledRequiredApproval,
  CeoBureauControlledEvidenceSummary,
  CeoBureauControlledSourceObjectRef,
  CeoBureauControlledSourceTraceEntry,
  CeoBureauControlledWorkflowSummary,
} from './ceo-bureau-controlled-read-model-types';
// #endregion

// #region Source Object Fixtures
/** Display-only Stage 15 source object references. */
export const CEO_BUREAU_CONTROLLED_SOURCE_OBJECT_REFS: readonly CeoBureauControlledSourceObjectRef[] =
  [
    {
      sourceObjectId: 'stage6-readonly-metadata-preview-001',
      sourceObjectType: 'stage_6_read_only_metadata_preview',
      label: 'Stage 6 read-only metadata preview',
      statusBadge: 'display_ready',
      stageRef: 'stage_6_read_only_metadata_gate',
      sourceTraceIds: ['trace-stage15-001'],
      referenceOnly: true,
      embeddedPayloadAllowed: false,
    },
    {
      sourceObjectId: 'stage7-intake-approval-preview-001',
      sourceObjectType: 'stage_7_intake_approval_preview',
      label: 'Stage 7 intake approval preview',
      statusBadge: 'preview_only',
      stageRef: 'stage_7_approval_gate',
      sourceTraceIds: ['trace-stage15-001'],
      referenceOnly: true,
      embeddedPayloadAllowed: false,
    },
    {
      sourceObjectId: 'stage8-candidate-preview-001',
      sourceObjectType: 'stage_8_candidate_operational_preview',
      label: 'Stage 8 candidate preview',
      statusBadge: 'preview_only',
      stageRef: 'stage_8_operational_preview_contract',
      sourceTraceIds: ['trace-stage15-002'],
      referenceOnly: true,
      embeddedPayloadAllowed: false,
    },
    {
      sourceObjectId: 'stage9-policy-classification-001',
      sourceObjectType: 'stage_9_real_action_policy_classification',
      label: 'Stage 9 policy classification',
      statusBadge: 'policy_required',
      stageRef: 'stage_9_real_action_policy_map',
      sourceTraceIds: ['trace-stage15-002'],
      referenceOnly: true,
      embeddedPayloadAllowed: false,
    },
    {
      sourceObjectId: 'stage10-output-preview-001',
      sourceObjectType: 'stage_10_output_preview',
      label: 'Stage 10 output preview',
      statusBadge: 'preview_only',
      stageRef: 'stage_10_output_preview_contract',
      sourceTraceIds: ['trace-stage15-003'],
      referenceOnly: true,
      embeddedPayloadAllowed: false,
    },
    {
      sourceObjectId: 'stage11-workflow-map-preview-001',
      sourceObjectType: 'stage_11_workflow_map_preview',
      label: 'Stage 11 workflow map preview',
      statusBadge: 'metadata_only',
      stageRef: 'stage_11_workflow_map_contract',
      sourceTraceIds: ['trace-stage15-003'],
      referenceOnly: true,
      embeddedPayloadAllowed: false,
    },
    {
      sourceObjectId: 'stage12-qc-result-preview-001',
      sourceObjectType: 'stage_12_qc_result_preview',
      label: 'Stage 12 QC result preview',
      statusBadge: 'qc_required',
      stageRef: 'stage_12_qc_preview_contract',
      sourceTraceIds: ['trace-stage15-004'],
      referenceOnly: true,
      embeddedPayloadAllowed: false,
    },
    {
      sourceObjectId: 'stage12-qc-approval-requirement-001',
      sourceObjectType: 'stage_12_qc_approval_requirement_preview',
      label: 'Stage 12 QC approval requirement preview',
      statusBadge: 'gate_required',
      stageRef: 'stage_12_qc_preview_contract',
      sourceTraceIds: ['trace-stage15-004'],
      referenceOnly: true,
      embeddedPayloadAllowed: false,
    },
    {
      sourceObjectId: 'stage13-evidence-spine-metadata-001',
      sourceObjectType: 'stage_13_evidence_spine_metadata',
      label: 'Stage 13 evidence spine metadata',
      statusBadge: 'metadata_only',
      stageRef: 'stage_13_evidence_spine_metadata_contract',
      sourceTraceIds: ['trace-stage15-005'],
      referenceOnly: true,
      embeddedPayloadAllowed: false,
    },
  ];
// #endregion

// #region Summary Fixtures
/** Static gate summary for Stage 15 controlled read-model review. */
export const CEO_BUREAU_CONTROLLED_GATE_SUMMARY: CeoBureauControlledGateSummary = {
  gateSummaryId: 'stage15-gate-summary-001',
  requiredGateRefs: [
    'stage_7_approval_gate',
    'stage_8_operational_preview_contract',
    'stage_9_real_action_policy_map',
    'stage_12_qc_preview_contract',
    'agent_a_ceo_bureau_integration_gate',
  ],
  statusBadge: 'gate_required',
  label: 'Controlled read-model gate summary',
  agentAApprovalRequired: true,
};

/** Static QC summary for Stage 15 controlled read-model review. */
export const CEO_BUREAU_CONTROLLED_QC_SUMMARY: CeoBureauControlledQcSummary = {
  qcSummaryId: 'stage15-qc-summary-001',
  qcResultIds: ['stage12-qc-result-preview-001'],
  approvalRequirementIds: ['stage12-qc-approval-requirement-001'],
  statusBadge: 'qc_required',
  reviewerRequirementLabel: 'Eldad preview review required before any later gate',
};

/** Static policy summary for Stage 15 controlled read-model review. */
export const CEO_BUREAU_CONTROLLED_POLICY_SUMMARY: CeoBureauControlledPolicySummary = {
  policySummaryId: 'stage15-policy-summary-001',
  policyClassificationIds: ['stage9-policy-classification-001'],
  statusBadge: 'policy_required',
  policyLabel: 'Real action policy classification must remain advisory',
};

/** Static evidence summary for Stage 15 controlled read-model review. */
export const CEO_BUREAU_CONTROLLED_EVIDENCE_SUMMARY: CeoBureauControlledEvidenceSummary = {
  evidenceSummaryId: 'stage15-evidence-summary-001',
  evidenceSpineMetadataIds: ['stage13-evidence-spine-metadata-001'],
  versionPolicyBadge: 'metadata_only',
  archivePolicyBadge: 'metadata_only',
  metadataOnly: true,
};

/** Static workflow summary for Stage 15 controlled read-model review. */
export const CEO_BUREAU_CONTROLLED_WORKFLOW_SUMMARY: CeoBureauControlledWorkflowSummary = {
  workflowSummaryId: 'stage15-workflow-summary-001',
  workflowMapIds: ['stage11-workflow-map-preview-001'],
  statusBadge: 'metadata_only',
  workflowLabel: 'Professional workflow map preview only',
};

/** Static output preview summary for Stage 15 controlled read-model review. */
export const CEO_BUREAU_CONTROLLED_OUTPUT_PREVIEW_SUMMARY: CeoBureauControlledOutputPreviewSummary =
  {
    outputPreviewSummaryId: 'stage15-output-preview-summary-001',
    outputPreviewIds: ['stage10-output-preview-001'],
    statusBadge: 'preview_only',
    generationBlocked: true,
  };
// #endregion

// #region Safety Fixtures
/** Operations that remain blocked in Stage 15 controlled read-model fixtures. */
export const CEO_BUREAU_CONTROLLED_BLOCKED_ACTIONS: readonly CeoBureauControlledBlockedAction[] =
  [
    { blockedActionId: 'blocked-create-work-object', label: 'Create operational work object', statusBadge: 'blocked' },
    { blockedActionId: 'blocked-link-case-context', label: 'Create or link case context', statusBadge: 'blocked' },
    { blockedActionId: 'blocked-create-document-reference', label: 'Create document reference', statusBadge: 'blocked' },
    { blockedActionId: 'blocked-state-write', label: 'Write controlled read-model state', statusBadge: 'blocked' },
    { blockedActionId: 'blocked-external-connection-operation', label: 'External connection operation unavailable', statusBadge: 'blocked' },
    { blockedActionId: 'blocked-managed-file-movement', label: 'Move managed files', statusBadge: 'blocked' },
    { blockedActionId: 'blocked-output-completion', label: 'Complete professional output', statusBadge: 'blocked' },
    { blockedActionId: 'blocked-approval-bypass', label: 'Bypass required approval gates', statusBadge: 'blocked' },
  ];

/** Required approval references for Stage 15 controlled read-model fixtures. */
export const CEO_BUREAU_CONTROLLED_REQUIRED_APPROVALS: readonly CeoBureauControlledRequiredApproval[] =
  [
    {
      requiredApprovalId: 'stage15-required-approval-agent-a-001',
      reviewerRoleLabel: 'Agent A structural gate',
      requiredGateRef: 'agent_a_ceo_bureau_integration_gate',
      statusBadge: 'gate_required',
      storedApprovalStateAllowed: false,
    },
    {
      requiredApprovalId: 'stage15-required-approval-eldad-001',
      reviewerRoleLabel: 'Eldad preview review',
      requiredGateRef: 'stage_12_qc_preview_contract',
      statusBadge: 'qc_required',
      storedApprovalStateAllowed: false,
    },
  ];

/** Static source trace entries for Stage 15 controlled read-model fixtures. */
export const CEO_BUREAU_CONTROLLED_SOURCE_TRACE: readonly CeoBureauControlledSourceTraceEntry[] =
  [
    { sourceTraceId: 'trace-stage15-001', label: 'Read-only intake lineage', sourceObjectIds: ['stage6-readonly-metadata-preview-001', 'stage7-intake-approval-preview-001'], statusBadge: 'metadata_only' },
    { sourceTraceId: 'trace-stage15-002', label: 'Candidate and policy lineage', sourceObjectIds: ['stage8-candidate-preview-001', 'stage9-policy-classification-001'], statusBadge: 'preview_only' },
    { sourceTraceId: 'trace-stage15-003', label: 'Output and workflow lineage', sourceObjectIds: ['stage10-output-preview-001', 'stage11-workflow-map-preview-001'], statusBadge: 'preview_only' },
    { sourceTraceId: 'trace-stage15-004', label: 'QC lineage', sourceObjectIds: ['stage12-qc-result-preview-001', 'stage12-qc-approval-requirement-001'], statusBadge: 'qc_required' },
    { sourceTraceId: 'trace-stage15-005', label: 'Evidence metadata lineage', sourceObjectIds: ['stage13-evidence-spine-metadata-001'], statusBadge: 'metadata_only' },
  ];
// #endregion

// #region Read Model Fixtures
/** Static Stage 15 controlled read-model fixtures. */
export const CEO_BUREAU_CONTROLLED_READ_MODELS: readonly CeoBureauControlledReadModel[] =
  [
    {
      id: 'stage15-controlled-read-model-001',
      title: 'Controlled preview work center snapshot',
      snapshotAt: '2026-05-03T00:00:00.000Z',
      previewOnly: true,
      readOnly: true,
      sourceObjects: CEO_BUREAU_CONTROLLED_SOURCE_OBJECT_REFS,
      gateSummary: CEO_BUREAU_CONTROLLED_GATE_SUMMARY,
      qcSummary: CEO_BUREAU_CONTROLLED_QC_SUMMARY,
      policySummary: CEO_BUREAU_CONTROLLED_POLICY_SUMMARY,
      evidenceSummary: CEO_BUREAU_CONTROLLED_EVIDENCE_SUMMARY,
      workflowSummary: CEO_BUREAU_CONTROLLED_WORKFLOW_SUMMARY,
      outputPreviewSummary: CEO_BUREAU_CONTROLLED_OUTPUT_PREVIEW_SUMMARY,
      blockedActions: CEO_BUREAU_CONTROLLED_BLOCKED_ACTIONS,
      requiredApprovals: CEO_BUREAU_CONTROLLED_REQUIRED_APPROVALS,
      safetyLocks: CEO_BUREAU_CONTROLLED_CAPABILITY_LOCKS,
      sourceTrace: CEO_BUREAU_CONTROLLED_SOURCE_TRACE,
      canCreateWorkItem: false,
      canCreateMatter: false,
      canCreateDocumentRef: false,
      canPersist: false,
      canExecuteProviderAction: false,
      canMoveFiles: false,
      canFinalizeOutput: false,
      canBypassApproval: false,
      fixtureSource: CEO_BUREAU_CONTROLLED_FIXTURE_SOURCE,
    },
  ];
// #endregion
