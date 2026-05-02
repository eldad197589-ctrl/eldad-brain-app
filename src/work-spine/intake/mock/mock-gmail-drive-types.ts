/* ============================================
   FILE: mock-gmail-drive-types.ts
   PURPOSE: Static mock Gmail and Drive connector contracts for Unified Intake preview.
   DEPENDENCIES: unified-intake-registry types
   EXPORTS: Mock Gmail/Drive input and output contracts
   ============================================ */

// #region Imports
import type {
  EmailSourceMetadata,
  GoogleDriveFileKind,
  GoogleDriveSourceMetadata,
  UnifiedIntakeCandidate,
  UnifiedIntakeEvidenceRef,
} from '../unified-intake-registry';
// #endregion

// #region Types
export type MockConnectorName = 'Gmail' | 'Drive';
export type MockConnectorMode = 'mock_only';
export type MockConnectorLiveStatus = 'live_disabled';
export type MockConnectorCredentialStatus = 'OAuth disabled';

/** Static safety status for a mock connector preview. */
export interface MockConnectorStatus {
  connectorName: MockConnectorName;
  mode: MockConnectorMode;
  liveStatus: MockConnectorLiveStatus;
  credentialStatus: MockConnectorCredentialStatus;
  safetyLabel: 'candidate_and_evidence_only';
}

/** Static mock Gmail attachment metadata. */
export interface MockGmailAttachment {
  attachmentId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

/** Static mock Gmail message metadata used for candidate-only mapping. */
export interface MockGmailMessage {
  messageId: string;
  threadId: string;
  accountEmail: string;
  mailbox: string;
  folder: string;
  labelIds: readonly string[];
  labelNames: readonly string[];
  from: string;
  to: readonly string[];
  subject: string;
  snippet: string;
  receivedAt: string;
  sentAt: string;
  attachments: readonly MockGmailAttachment[];
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
}

/** Static mock Drive file metadata used for candidate-only mapping. */
export interface MockDriveFile {
  driveFileId: string;
  driveFolderId: string;
  drivePath: string;
  driveFolderName: string;
  fileName: string;
  mimeType: string;
  fileKind: GoogleDriveFileKind;
  ownerEmail: string;
  sharedWithMe: boolean;
  modifiedAt: string;
  createdAt: string;
  parentFolderIds: readonly string[];
  sourceFolderHint: string;
}

/** Static mock Drive folder metadata used for candidate-only mapping. */
export interface MockDriveFolder {
  driveFolderId: string;
  drivePath: string;
  driveFolderName: string;
  ownerEmail: string;
  sharedWithMe: boolean;
  modifiedAt: string;
  createdAt: string;
  parentFolderIds: readonly string[];
  sourceFolderHint: string;
}

/** Unified Intake mock connector output: candidates and evidence refs only. */
export interface MockUnifiedIntakeOutput<
  TMetadata extends EmailSourceMetadata | GoogleDriveSourceMetadata = EmailSourceMetadata | GoogleDriveSourceMetadata,
> {
  candidates: UnifiedIntakeCandidate<TMetadata>[];
  evidenceRefs: UnifiedIntakeEvidenceRef[];
}
// #endregion
