export type IntakeSourceType = 'email' | 'drive' | 'scan' | 'manual_upload' | 'manual_text' | 'unknown';

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
