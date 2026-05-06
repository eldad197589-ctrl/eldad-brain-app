/* ==== FILE: src/work-spine/agent-process-map/agent-process-assignment-types.ts ==== */

// #region Constants
/** Allowed passive mode for Stage 21D assignment rows. */
export const AGENT_PROCESS_ASSIGNMENT_ALLOWED_MODES = ['static_preview_only'] as const;
// #endregion

// #region Types
/** Passive allowed mode for one agent-to-process assignment row. */
export type AgentProcessAssignmentAllowedMode = (typeof AGENT_PROCESS_ASSIGNMENT_ALLOWED_MODES)[number];
// #endregion

// #region Interfaces
/** Static assignment between internal agents and one Process Library blueprint. */
export interface AgentProcessAssignment {
  /** Stable assignment identifier. */
  assignmentId: string;
  /** Process Library blueprint identifier. */
  processId: string;
  /** Primary static agent identifiers for this process blueprint. */
  primaryAgentIds: readonly string[];
  /** Supporting static agent identifiers for this process blueprint. */
  supportingAgentIds: readonly string[];
  /** Review or QA static agent identifiers for this process blueprint. */
  reviewAgentIds: readonly string[];
  /** Gate required before any future non-static use. */
  requiredGate: string;
  /** Required marker: this row is a static preview map only. */
  allowedMode: AgentProcessAssignmentAllowedMode;
  /** Required marker: this row cannot execute operationally. */
  operationalExecution: false;
  /** Required marker: this row cannot run. */
  canRun: false;
  /** Required marker: this row cannot persist state. */
  canPersist: false;
  /** Required marker: this row cannot create a matter. */
  canCreateMatter: false;
  /** Required marker: this row cannot create a work item. */
  canCreateWorkItem: false;
  /** Required marker: this row cannot create a document reference. */
  canCreateDocumentRef: false;
}
// #endregion
