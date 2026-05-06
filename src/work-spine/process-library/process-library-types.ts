/* ==== FILE: src/work-spine/process-library/process-library-types.ts ==== */

// #region Constants
/** Hebrew label for the static Process Library. */
export const PROCESS_LIBRARY_LABEL = 'ספריית תהליכים מקצועיים';

/** Static domains used by the Process Library blueprint seed. */
export const PROCESS_LIBRARY_DOMAINS = [
  'reports',
  'tax',
  'vat',
  'employee',
  'payroll',
  'labor',
  'legal',
  'accounting',
  'special',
] as const;

/** Status values for static process blueprints. */
export const PROCESS_LIBRARY_STATUSES = ['static_blueprint_only', 'needs_process_audit'] as const;

/** Forbidden action markers for every static process blueprint. */
export const PROCESS_LIBRARY_FORBIDDEN_ACTIONS = [
  'execute_workflow',
  'submit_output',
  'send_message',
  'file_document',
  'create_case_file',
  'create_task_record',
  'create_document_pointer',
  'persist_state',
  'provider_connection',
  'read_source_content',
  'run_ocr',
  'agent_autonomy',
] as const;
// #endregion

// #region Types
/** Static Process Library domain. */
export type ProcessLibraryDomain = (typeof PROCESS_LIBRARY_DOMAINS)[number];

/** Static Process Library status. */
export type ProcessLibraryStatus = (typeof PROCESS_LIBRARY_STATUSES)[number];

/** Static Process Library forbidden action. */
export type ProcessLibraryForbiddenAction = (typeof PROCESS_LIBRARY_FORBIDDEN_ACTIONS)[number];
// #endregion

// #region Interfaces
/** Static blueprint record for one professional process in Eldad Brain. */
export interface ProcessLibraryBlueprint {
  /** Stable process identifier. */
  processId: string;
  /** Hebrew process name. */
  hebrewName: string;
  /** Professional domain for this process blueprint. */
  domain: ProcessLibraryDomain;
  /** Static trigger description for the process. */
  trigger: string;
  /** Inputs the process would require before any future operational use. */
  requiredInputs: readonly string[];
  /** Expected outputs as planning targets only. */
  expectedOutputs: readonly string[];
  /** Static workflow stages for planning and review. */
  workflowStages: readonly string[];
  /** Logical static agents that may review this process later. */
  relatedAgents: readonly string[];
  /** Gates required before this process can move beyond static blueprint form. */
  requiredGates: readonly string[];
  /** Actions forbidden by this static seed. */
  forbiddenActions: readonly ProcessLibraryForbiddenAction[];
  /** Current static blueprint status. */
  status: ProcessLibraryStatus;
  /** Static blueprint records cannot execute operationally. */
  operationalExecution: false;
  /** Static source trace back to the Stage 21B inventory. */
  sourceTrace: string;
}
// #endregion
