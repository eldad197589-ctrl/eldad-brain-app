/* ============================================
   FILE: unified-intake-static-fixtures.ts
   PURPOSE: Static read-only unified intake fixture snapshot for the internal inspector.
   DEPENDENCIES: Unified intake pure mappers and registry types
   EXPORTS: UNIFIED_INTAKE_STATIC_FIXTURE_SNAPSHOT and related fixture types
   ============================================ */

// #region Imports
import { createUnifiedIntakeFromClientPortalUploads } from './client-portal-to-unified-intake';
import { createUnifiedIntakeFromEmailMessages } from './email-to-unified-intake';
import { createUnifiedIntakeFromGoogleDriveItems } from './google-drive-to-unified-intake';
import { createUnifiedIntakeFromLeads } from './lead-to-unified-intake';
import {
  createUnifiedIntakeFromManualNotes,
  createUnifiedIntakeFromUploadedFiles,
} from './manual-and-uploaded-file-to-unified-intake';
import { createUnifiedIntakeFromScannedStaging } from './scan-to-unified-intake';
import type { ScannedIntakeStagingResult } from './scanned-intake-staging';
import type {
  IntakeSourceType,
  UnifiedIntakeCandidate,
  UnifiedIntakeEvidenceRef,
  UnifiedIntakeWarning,
} from './unified-intake-registry';
// #endregion

// #region Types
export interface UnifiedIntakeStaticSourceDiagnostics {
  candidateCount: number;
  evidenceCount: number;
  warningsCount: number;
  skippedItemsCount: number;
  errorsCount: number;
}

export interface UnifiedIntakeStaticSourceSection {
  sourceType: IntakeSourceType;
  sourceLabel: string;
  candidates: UnifiedIntakeCandidate[];
  evidenceRefs: UnifiedIntakeEvidenceRef[];
  diagnostics: UnifiedIntakeStaticSourceDiagnostics;
}

export interface UnifiedIntakeStaticFixtureSnapshot {
  title: 'Unified Intake Inspector — read-only / static fixtures';
  sources: UnifiedIntakeStaticSourceSection[];
  candidates: UnifiedIntakeCandidate[];
  evidenceRefs: UnifiedIntakeEvidenceRef[];
  summary: {
    sourcesCount: number;
    candidatesCount: number;
    evidenceCount: number;
    warningsCount: number;
    skippedItemsCount: number;
    errorsCount: number;
  };
  safetyStatus: 'static_fixture_read_only';
}

interface MapperResultLike {
  candidates: UnifiedIntakeCandidate[];
  evidenceRefs: UnifiedIntakeEvidenceRef[];
  diagnostics: {
    candidateCount: number;
    evidenceCount: number;
    warnings: readonly UnifiedIntakeWarning[];
    skippedItems: readonly unknown[];
    errors: readonly unknown[];
  };
}
// #endregion

// #region Fixture Inputs
const SCAN_STAGING_CANDIDATES = [
  {
    candidateId: 'scan-fixture-candidate-1',
    sourceChannel: 'scan' as const,
    fileName: 'scan-static-example.pdf',
    extension: '.pdf',
    absolutePath: 'C:\\static-fixtures\\scans\\vat-material\\scan-static-example.pdf',
    relativePathFromRoot: 'vat-material/scan-static-example.pdf',
    parentFolderName: 'vat-material',
    folderPath: 'C:\\static-fixtures\\scans\\vat-material',
    sourceRoot: 'C:\\static-fixtures\\scans',
    sizeBytes: 248000,
    createdAt: '2026-04-01T08:00:00.000Z',
    modifiedAt: '2026-04-01T08:15:00.000Z',
    ocrStatus: 'not_processed' as const,
    intakeStatus: 'staging_candidate' as const,
    suggestedContextFromFolderName: 'vat-material',
    professionalStatus: 'not_reviewed' as const,
    matterResolutionStatus: 'unresolved' as const,
    warnings: [],
  },
];

const SCAN_STAGING_FIXTURE: ScannedIntakeStagingResult = {
  candidates: SCAN_STAGING_CANDIDATES,
  groupedCandidates: [
    {
      groupKey: 'C:\\static-fixtures\\scans\\vat-material',
      folderPath: 'C:\\static-fixtures\\scans\\vat-material',
      parentFolderName: 'vat-material',
      suggestedContextFromFolderName: 'vat-material',
      count: 1,
      candidates: SCAN_STAGING_CANDIDATES,
      warnings: [],
    },
  ],
  counts: {
    totalCandidates: 1,
    groupsCount: 1,
    warningsCount: 0,
    sourceFilesCount: 1,
  },
  warnings: [],
};

const EMAIL_FIXTURES = [
  {
    messageId: 'email-message-static-1',
    threadId: 'email-thread-static-1',
    provider: 'gmail' as const,
    accountEmail: 'fixtures@example.test',
    mailbox: 'Primary',
    folder: 'Inbox',
    label: 'Static Fixture',
    labelIds: ['Label_1'],
    labelNames: ['Static Fixture'],
    systemFolder: 'inbox' as const,
    from: 'sender@example.test',
    to: ['eldad@example.test'],
    cc: [],
    bcc: [],
    subject: 'Static email intake candidate',
    snippet: 'Static fixture message snippet.',
    bodyPreview: 'Static fixture message body preview.',
    receivedAt: '2026-04-02T09:00:00.000Z',
    sentAt: '2026-04-02T08:59:00.000Z',
    hasAttachments: true,
    attachments: [
      {
        attachmentId: 'email-attachment-static-1',
        fileName: 'email-static-attachment.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 128000,
      },
    ],
    isRead: false,
    isStarred: false,
    isImportant: false,
  },
];

const GOOGLE_DRIVE_FIXTURES = [
  {
    driveFileId: 'drive-file-static-1',
    driveFolderId: 'drive-folder-static-parent',
    drivePath: '/Static Fixtures/Drive/static-drive-file.pdf',
    driveFolderName: 'Drive',
    fileName: 'static-drive-file.pdf',
    mimeType: 'application/pdf',
    fileKind: 'pdf' as const,
    ownerEmail: 'owner@example.test',
    sharedWithMe: true,
    modifiedAt: '2026-04-03T10:00:00.000Z',
    createdAt: '2026-04-03T09:30:00.000Z',
    webViewLink: 'https://drive.example.test/static-drive-file',
    parentFolderIds: ['drive-folder-static-parent'],
    sourceFolderHint: 'Static Fixtures',
    isFolder: false,
  },
  {
    driveFileId: 'drive-folder-static-1',
    driveFolderId: 'drive-folder-static-1',
    drivePath: '/Static Fixtures/Drive Folder',
    driveFolderName: 'Drive Folder',
    fileName: 'Drive Folder',
    mimeType: 'application/vnd.google-apps.folder',
    fileKind: 'folder' as const,
    ownerEmail: 'owner@example.test',
    sharedWithMe: false,
    modifiedAt: '2026-04-03T11:00:00.000Z',
    createdAt: '2026-04-03T09:45:00.000Z',
    parentFolderIds: ['drive-folder-static-parent'],
    sourceFolderHint: 'Static Fixtures',
    isFolder: true,
  },
];

const CLIENT_PORTAL_FIXTURES = [
  {
    portalUploadId: 'portal-upload-static-1',
    clientProvidedLabel: 'Static portal upload',
    uploaderIdentityClaim: 'client@example.test',
    uploadedAt: '2026-04-04T12:00:00.000Z',
    fileName: 'portal-static-upload.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 256000,
    portalFolder: 'Static Portal Folder',
    portalPath: '/portal/static/portal-static-upload.pdf',
    declaredClientName: 'Static Client Claim',
    declaredClientId: 'static-client-id-claim',
    declaredMatterLabel: 'Static matter claim',
    uploadedByEmail: 'client@example.test',
    notes: 'Static portal fixture note.',
    sourcePortalName: 'Static Portal',
  },
];

const LEAD_FIXTURES = [
  {
    leadId: 'lead-static-1',
    leadSource: 'website_form',
    contactFields: {
      name: 'Static Lead',
      email: 'lead@example.test',
    },
    submittedAt: '2026-04-05T13:00:00.000Z',
    declaredInterest: 'Static service interest',
    declaredClientName: 'Static Lead Client Claim',
    declaredCompanyName: 'Static Lead Company',
    email: 'lead@example.test',
    phone: '+972-00-000-0000',
    messageText: 'Static lead message text.',
    sourceCampaign: 'static-campaign',
    referrer: 'static-referrer',
    notes: 'Static lead fixture note.',
  },
];

const MANUAL_FIXTURES = [
  {
    manualId: 'manual-static-1',
    author: 'Eldad Static Fixture',
    noteText: 'Static manual intake note.',
    manualCreatedAt: '2026-04-06T14:00:00.000Z',
    sourceLabel: 'Static manual note',
    relatedFreeText: 'Static free text context.',
    declaredClientName: 'Static manual client claim',
    declaredMatterLabel: 'Static manual matter claim',
    tags: ['static', 'manual'],
  },
];

const UPLOADED_FILE_FIXTURES = [
  {
    uploadSessionId: 'upload-session-static-1',
    fileId: 'uploaded-file-static-1',
    fileName: 'uploaded-static-file.pdf',
    uploadedBy: 'uploader@example.test',
    uploadedAt: '2026-04-07T15:00:00.000Z',
    mimeType: 'application/pdf',
    sizeBytes: 192000,
    uploadSource: 'static_upload_fixture',
    sourceLabel: 'Static uploaded file',
    declaredClientName: 'Static uploaded client claim',
    declaredMatterLabel: 'Static uploaded matter claim',
    notes: 'Static uploaded file fixture note.',
  },
];
// #endregion

// #region Snapshot Assembly
const toSourceSection = (
  sourceType: IntakeSourceType,
  sourceLabel: string,
  result: MapperResultLike,
): UnifiedIntakeStaticSourceSection => ({
  sourceType,
  sourceLabel,
  candidates: result.candidates,
  evidenceRefs: result.evidenceRefs,
  diagnostics: {
    candidateCount: result.diagnostics.candidateCount,
    evidenceCount: result.diagnostics.evidenceCount,
    warningsCount: result.diagnostics.warnings.length,
    skippedItemsCount: result.diagnostics.skippedItems.length,
    errorsCount: result.diagnostics.errors.length,
  },
});

const scanResult = createUnifiedIntakeFromScannedStaging(SCAN_STAGING_FIXTURE);
const emailResult = createUnifiedIntakeFromEmailMessages(EMAIL_FIXTURES);
const googleDriveResult = createUnifiedIntakeFromGoogleDriveItems(GOOGLE_DRIVE_FIXTURES);
const clientPortalResult = createUnifiedIntakeFromClientPortalUploads(CLIENT_PORTAL_FIXTURES);
const leadResult = createUnifiedIntakeFromLeads(LEAD_FIXTURES);
const manualResult = createUnifiedIntakeFromManualNotes(MANUAL_FIXTURES);
const uploadedFileResult = createUnifiedIntakeFromUploadedFiles(UPLOADED_FILE_FIXTURES);

const sources: UnifiedIntakeStaticSourceSection[] = [
  toSourceSection('scan', 'Scan static fixture', scanResult),
  toSourceSection('email', 'Email static fixture', emailResult),
  toSourceSection('google_drive', 'Google Drive static fixtures', googleDriveResult),
  toSourceSection('client_portal', 'Client portal static fixture', clientPortalResult),
  toSourceSection('lead', 'Lead static fixture', leadResult),
  toSourceSection('manual', 'Manual static fixture', manualResult),
  toSourceSection('uploaded_file', 'Uploaded file static fixture', uploadedFileResult),
];

const candidates = sources.flatMap((source) => source.candidates);
const evidenceRefs = sources.flatMap((source) => source.evidenceRefs);

export const UNIFIED_INTAKE_STATIC_FIXTURE_SNAPSHOT: UnifiedIntakeStaticFixtureSnapshot = {
  title: 'Unified Intake Inspector — read-only / static fixtures',
  sources,
  candidates,
  evidenceRefs,
  summary: {
    sourcesCount: sources.length,
    candidatesCount: candidates.length,
    evidenceCount: evidenceRefs.length,
    warningsCount: sources.reduce((sum, source) => sum + source.diagnostics.warningsCount, 0),
    skippedItemsCount: sources.reduce((sum, source) => sum + source.diagnostics.skippedItemsCount, 0),
    errorsCount: sources.reduce((sum, source) => sum + source.diagnostics.errorsCount, 0),
  },
  safetyStatus: 'static_fixture_read_only',
};
// #endregion
