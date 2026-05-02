/* ============================================
   FILE: unified-intake-registry.ts
   PURPOSE: Canonical type registry for unified intake source candidates.
   DEPENDENCIES: None
   EXPORTS: Unified intake source, candidate, evidence, and metadata types
   ============================================ */

// #region Source Types
export type IntakeSourceType =
  | 'scan'
  | 'email'
  | 'google_drive'
  | 'client_portal'
  | 'lead'
  | 'manual'
  | 'uploaded_file';

export type UnifiedIntakeCandidateStatus = 'staging_candidate' | 'review_required' | 'ignored_candidate';
export type UnifiedIntakeProfessionalStatus = 'not_reviewed';
export type UnifiedIntakeMatterResolutionStatus = 'unresolved';
export type UnifiedIntakeSubjectResolutionStatus = 'unresolved';

export type UnifiedIntakeEvidenceKind =
  | 'file'
  | 'message'
  | 'email_message'
  | 'email_attachment'
  | 'drive_file'
  | 'drive_folder'
  | 'portal_upload'
  | 'lead_form'
  | 'manual_note';

export type UnifiedIntakeOcrStatus = 'not_processed' | 'unknown';
export type UnifiedIntakeClassificationStatus = 'not_classified';
export type UnifiedIntakeReviewStatus = 'not_reviewed';
// #endregion

// #region Shared Models
export interface UnifiedIntakeSuggestedContext {
  label: string;
  source: string;
  confidence: 'low';
  isConfirmed: false;
}

export interface UnifiedIntakeWarning {
  warningCode: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface UnifiedIntakeEvidenceRef {
  evidenceId: string;
  sourceType: IntakeSourceType;
  sourceCandidateId: string;
  evidenceKind: UnifiedIntakeEvidenceKind;
  title: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  absolutePath?: string;
  relativePathFromRoot?: string;
  messageId?: string;
  portalUploadId?: string;
  leadId?: string;
  driveFileId?: string;
  driveFolderId?: string;
  ocrStatus: UnifiedIntakeOcrStatus;
  classificationStatus: UnifiedIntakeClassificationStatus;
  reviewStatus: UnifiedIntakeReviewStatus;
}

export interface UnifiedIntakeCandidate<
  TSourceMetadata extends UnifiedIntakeSourceMetadata = UnifiedIntakeSourceMetadata,
> {
  candidateId: string;
  sourceType: TSourceMetadata['sourceType'];
  sourceId: string;
  sourceLabel: string;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
  candidateStatus: UnifiedIntakeCandidateStatus;
  professionalStatus: UnifiedIntakeProfessionalStatus;
  matterResolutionStatus: UnifiedIntakeMatterResolutionStatus;
  subjectResolutionStatus: UnifiedIntakeSubjectResolutionStatus;
  suggestedContext: readonly UnifiedIntakeSuggestedContext[];
  evidenceRefs: readonly UnifiedIntakeEvidenceRef[];
  warnings: readonly UnifiedIntakeWarning[];
  sourceMetadata: TSourceMetadata;
}
// #endregion

// #region Scan Metadata
export interface ScanSourceMetadata {
  sourceType: 'scan';
  sourceRoot: string;
  folderPath: string;
  parentFolderName: string;
  relativePathFromRoot: string;
  modifiedAt: string;
  extension: string;
}
// #endregion

// #region Email Metadata
export type EmailProvider = 'gmail' | 'outlook' | 'microsoft365' | 'imap' | 'exchange' | 'other';

export type EmailSystemFolder =
  | 'inbox'
  | 'sent'
  | 'drafts'
  | 'archive'
  | 'all_mail'
  | 'spam'
  | 'trash'
  | 'important'
  | 'starred'
  | 'unknown';

export interface EmailAttachmentRef {
  attachmentId: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
}

export interface EmailSourceMetadata {
  sourceType: 'email';
  provider: EmailProvider;
  accountEmail: string;
  mailbox: string;
  folder: string;
  label: string;
  labelIds: readonly string[];
  labelNames: readonly string[];
  systemFolder: EmailSystemFolder;
  threadId: string;
  messageId: string;
  from: string;
  to: readonly string[];
  cc: readonly string[];
  bcc: readonly string[];
  subject: string;
  receivedAt: string;
  sentAt: string;
  hasAttachments: boolean;
  attachmentRefs: readonly EmailAttachmentRef[];
  isRead?: boolean;
  isStarred?: boolean;
  isImportant?: boolean;
}
// #endregion

// #region Google Drive Metadata
export type GoogleDriveFileKind =
  | 'google_doc'
  | 'google_sheet'
  | 'google_slide'
  | 'pdf'
  | 'image'
  | 'office_doc'
  | 'folder'
  | 'other';

export interface GoogleDriveSourceMetadata {
  sourceType: 'google_drive';
  provider: 'google_drive';
  driveFileId: string;
  driveFolderId: string;
  drivePath: string;
  driveFolderName: string;
  fileName: string;
  mimeType: string;
  fileKind: GoogleDriveFileKind;
  ownerEmail?: string;
  sharedWithMe?: boolean;
  modifiedAt: string;
  createdAt: string;
  webViewLink?: string;
  parentFolderIds: readonly string[];
  sourceFolderHint?: string;
}
// #endregion

// #region Other Source Metadata
export interface ClientPortalSourceMetadata {
  sourceType: 'client_portal';
  portalUploadId: string;
  clientProvidedLabel: string;
  uploaderIdentityClaim: string;
  uploadedAt: string;
}

export interface LeadSourceMetadata {
  sourceType: 'lead';
  leadId: string;
  leadSource: string;
  contactFields: Record<string, string>;
  submittedAt: string;
  declaredInterest: string;
}

export interface ManualSourceMetadata {
  sourceType: 'manual';
  author: string;
  noteText: string;
  manualCreatedAt: string;
}

export interface UploadedFileSourceMetadata {
  sourceType: 'uploaded_file';
  uploadSessionId: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
}
// #endregion

// #region Metadata Union
export type UnifiedIntakeSourceMetadata =
  | ScanSourceMetadata
  | EmailSourceMetadata
  | GoogleDriveSourceMetadata
  | ClientPortalSourceMetadata
  | LeadSourceMetadata
  | ManualSourceMetadata
  | UploadedFileSourceMetadata;
// #endregion
