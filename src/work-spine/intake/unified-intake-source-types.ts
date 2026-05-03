/* ====
   FILE: unified-intake-source-types.ts
   PURPOSE: Static Unified Intake source contracts.
   DEPENDENCIES: None
   EXPORTS: Unified Intake source types and boundary flags
   ==== */

// #region Source Types
/** Ordered list of allowed Unified Intake source types. */
export const INTAKE_SOURCE_TYPES = ['email', 'drive', 'scan', 'manual_upload', 'manual_text', 'unknown', 'protocol'] as const;

export type IntakeSourceType = (typeof INTAKE_SOURCE_TYPES)[number];
// #endregion

// #region Boundary Types
export interface IntakeBoundaryFlags {
  allowedMode: 'local_preview_only';
  canCreateWorkItem: false;
  canCreateMatter: false;
  canCreateDocumentRef: false;
  requiresEldadApproval: true;
  operationalActionBlocked: true;
}

export interface IntakePayloadSummary {
  fileType?: string;
  sizeBytes?: number;
  snippet?: string;
  attachmentCount?: number;
}

export interface UnifiedIntakeSource {
  sourceId: string;
  sourceType: IntakeSourceType;
  senderIdentity: string;
  timestamp: string;
  subjectOrFilename: string;
  payloadSummary: IntakePayloadSummary;
  boundaryFlags: IntakeBoundaryFlags;
}
// #endregion
