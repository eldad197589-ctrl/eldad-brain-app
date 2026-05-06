/* ==== FILE: src/work-spine/agent-workforce/internal-agent-workforce-types.ts ==== */

// #region Constants
/** Static domains used by the internal workforce index. */
export const INTERNAL_AGENT_DOMAINS = [
  'intake',
  'document',
  'tax',
  'vat_external',
  'payroll_labor',
  'client_case',
  'output_export',
  'review_qa',
  'operations_admin',
  'ceo_bureau',
] as const;

/** Static lifecycle states for planned internal agents. */
export const INTERNAL_AGENT_STATUSES = ['planned', 'blocked', 'future'] as const;
// #endregion

// #region Types
/** Domain assigned to one static internal agent row. */
export type InternalAgentDomain = (typeof INTERNAL_AGENT_DOMAINS)[number];

/** Planning status assigned to one static internal agent row. */
export type InternalAgentStatus = (typeof INTERNAL_AGENT_STATUSES)[number];
// #endregion

// #region Interfaces
/** Static, non-operational row describing a proposed internal agent. */
export interface InternalAgentWorkforceAgent {
  /** Stable static identifier. */
  agentId: string;
  /** Hebrew display name. */
  hebrewName: string;
  /** Planning domain. */
  domain: InternalAgentDomain;
  /** Passive role description. */
  role: string;
  /** Static input labels only. */
  inputs: readonly string[];
  /** Static output labels only. */
  outputs: readonly string[];
  /** Actions explicitly forbidden for this row. */
  forbiddenActions: readonly string[];
  /** Gate required before any future action concept. */
  requiredGateBeforeAction: string;
  /** Static planning status. */
  status: InternalAgentStatus;
  /** Required marker: this row cannot operate. */
  operationalExecution: false;
}
// #endregion
