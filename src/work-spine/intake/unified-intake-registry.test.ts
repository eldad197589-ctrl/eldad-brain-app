/* ============================================
   FILE: unified-intake-registry.test.ts
   PURPOSE: Focused type and safety tests for the unified intake source registry.
   DEPENDENCIES: vitest, unified-intake-registry types
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type {
  ClientPortalSourceMetadata,
  EmailSourceMetadata,
  GoogleDriveSourceMetadata,
  IntakeSourceType,
  LeadSourceMetadata,
  ManualSourceMetadata,
  ScanSourceMetadata,
  UnifiedIntakeCandidate,
  UnifiedIntakeEvidenceKind,
  UnifiedIntakeEvidenceRef,
  UploadedFileSourceMetadata,
} from './unified-intake-registry';
// #endregion

// #region Test Data
const projectRoot = 'C:/Users/1/OneDrive/שולחן העבודה/אלדד/גרוויטי תקיות/המוח של אלדד/brain-app';
const timestamp = '2026-04-29T00:00:00.000Z';

const baseEvidence = {
  evidenceId: 'evidence-1',
  sourceCandidateId: 'candidate-1',
  title: 'ראיית מקור',
  ocrStatus: 'not_processed',
  classificationStatus: 'not_classified',
  reviewStatus: 'not_reviewed',
} as const;

const suggestedContext = [
  {
    label: 'רמז בלבד',
    source: 'folder_name',
    confidence: 'low',
    isConfirmed: false,
  },
] as const;

const createCandidateBase = {
  receivedAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp,
  candidateStatus: 'staging_candidate',
  professionalStatus: 'not_reviewed',
  matterResolutionStatus: 'unresolved',
  subjectResolutionStatus: 'unresolved',
  suggestedContext,
  warnings: [],
} as const;

const scanCandidate = {
  ...createCandidateBase,
  candidateId: 'scan-candidate-1',
  sourceType: 'scan',
  sourceId: 'scan-source-1',
  sourceLabel: 'סריקה מקומית',
  evidenceRefs: [
    {
      ...baseEvidence,
      evidenceId: 'scan-file-1',
      sourceType: 'scan',
      sourceCandidateId: 'scan-candidate-1',
      evidenceKind: 'file',
      fileName: 'scan.pdf',
      absolutePath: 'C:/scans/scan.pdf',
      relativePathFromRoot: 'scan.pdf',
    },
  ],
  sourceMetadata: {
    sourceType: 'scan',
    sourceRoot: 'C:/scans',
    folderPath: 'C:/scans/folder',
    parentFolderName: 'folder',
    relativePathFromRoot: 'folder/scan.pdf',
    modifiedAt: timestamp,
    extension: '.pdf',
  },
} satisfies UnifiedIntakeCandidate<ScanSourceMetadata>;

const emailCandidate = {
  ...createCandidateBase,
  candidateId: 'email-candidate-1',
  sourceType: 'email',
  sourceId: 'gmail-message-1',
  sourceLabel: 'הודעת דוא"ל',
  evidenceRefs: [
    {
      ...baseEvidence,
      evidenceId: 'email-message-1',
      sourceType: 'email',
      sourceCandidateId: 'email-candidate-1',
      evidenceKind: 'email_message',
      messageId: 'message-1',
    },
    {
      ...baseEvidence,
      evidenceId: 'email-attachment-1',
      sourceType: 'email',
      sourceCandidateId: 'email-candidate-1',
      evidenceKind: 'email_attachment',
      messageId: 'message-1',
      fileName: 'attachment.pdf',
      mimeType: 'application/pdf',
    },
  ],
  sourceMetadata: {
    sourceType: 'email',
    provider: 'gmail',
    accountEmail: 'office@example.test',
    mailbox: 'Primary',
    folder: 'Inbox',
    label: 'Client/Review',
    labelIds: ['INBOX', 'Label_1'],
    labelNames: ['Inbox', 'Client/Review'],
    systemFolder: 'inbox',
    threadId: 'thread-1',
    messageId: 'message-1',
    from: 'client@example.test',
    to: ['office@example.test'],
    cc: [],
    bcc: [],
    subject: 'מסמכים לבדיקה',
    receivedAt: timestamp,
    sentAt: timestamp,
    hasAttachments: true,
    attachmentRefs: [{ attachmentId: 'attachment-1', fileName: 'attachment.pdf', mimeType: 'application/pdf' }],
    isRead: false,
    isStarred: true,
    isImportant: true,
  },
} satisfies UnifiedIntakeCandidate<EmailSourceMetadata>;

const googleDriveCandidate = {
  ...createCandidateBase,
  candidateId: 'drive-candidate-1',
  sourceType: 'google_drive',
  sourceId: 'drive-file-1',
  sourceLabel: 'קובץ Drive',
  evidenceRefs: [
    {
      ...baseEvidence,
      evidenceId: 'drive-file-evidence-1',
      sourceType: 'google_drive',
      sourceCandidateId: 'drive-candidate-1',
      evidenceKind: 'drive_file',
      driveFileId: 'drive-file-1',
    },
    {
      ...baseEvidence,
      evidenceId: 'drive-folder-evidence-1',
      sourceType: 'google_drive',
      sourceCandidateId: 'drive-candidate-1',
      evidenceKind: 'drive_folder',
      driveFolderId: 'drive-folder-1',
    },
  ],
  sourceMetadata: {
    sourceType: 'google_drive',
    provider: 'google_drive',
    driveFileId: 'drive-file-1',
    driveFolderId: 'drive-folder-1',
    drivePath: '/לקוחות/מסמך.pdf',
    driveFolderName: 'לקוחות',
    fileName: 'מסמך.pdf',
    mimeType: 'application/pdf',
    fileKind: 'pdf',
    ownerEmail: 'owner@example.test',
    sharedWithMe: true,
    modifiedAt: timestamp,
    createdAt: timestamp,
    webViewLink: 'https://drive.example.test/file',
    parentFolderIds: ['drive-folder-1'],
    sourceFolderHint: 'לקוחות',
  },
} satisfies UnifiedIntakeCandidate<GoogleDriveSourceMetadata>;

const clientPortalCandidate = {
  ...createCandidateBase,
  candidateId: 'portal-candidate-1',
  sourceType: 'client_portal',
  sourceId: 'portal-upload-1',
  sourceLabel: 'העלאה מאזור אישי',
  evidenceRefs: [
    {
      ...baseEvidence,
      evidenceId: 'portal-upload-evidence-1',
      sourceType: 'client_portal',
      sourceCandidateId: 'portal-candidate-1',
      evidenceKind: 'portal_upload',
      portalUploadId: 'portal-upload-1',
    },
  ],
  sourceMetadata: {
    sourceType: 'client_portal',
    portalUploadId: 'portal-upload-1',
    clientProvidedLabel: 'מסמכים',
    uploaderIdentityClaim: 'client@example.test',
    uploadedAt: timestamp,
  },
} satisfies UnifiedIntakeCandidate<ClientPortalSourceMetadata>;

const leadCandidate = {
  ...createCandidateBase,
  candidateId: 'lead-candidate-1',
  sourceType: 'lead',
  sourceId: 'lead-1',
  sourceLabel: 'ליד חדש',
  evidenceRefs: [
    {
      ...baseEvidence,
      evidenceId: 'lead-form-evidence-1',
      sourceType: 'lead',
      sourceCandidateId: 'lead-candidate-1',
      evidenceKind: 'lead_form',
      leadId: 'lead-1',
    },
  ],
  sourceMetadata: {
    sourceType: 'lead',
    leadId: 'lead-1',
    leadSource: 'website',
    contactFields: { name: 'לקוח מתעניין', email: 'lead@example.test' },
    submittedAt: timestamp,
    declaredInterest: 'ייעוץ',
  },
} satisfies UnifiedIntakeCandidate<LeadSourceMetadata>;

const manualCandidate = {
  ...createCandidateBase,
  candidateId: 'manual-candidate-1',
  sourceType: 'manual',
  sourceId: 'manual-note-1',
  sourceLabel: 'רשומה ידנית',
  evidenceRefs: [
    {
      ...baseEvidence,
      evidenceId: 'manual-note-evidence-1',
      sourceType: 'manual',
      sourceCandidateId: 'manual-candidate-1',
      evidenceKind: 'manual_note',
    },
  ],
  sourceMetadata: {
    sourceType: 'manual',
    author: 'אלדד',
    noteText: 'הערה ידנית',
    manualCreatedAt: timestamp,
  },
} satisfies UnifiedIntakeCandidate<ManualSourceMetadata>;

const uploadedFileCandidate = {
  ...createCandidateBase,
  candidateId: 'uploaded-file-candidate-1',
  sourceType: 'uploaded_file',
  sourceId: 'upload-session-1',
  sourceLabel: 'קובץ שהועלה',
  evidenceRefs: [
    {
      ...baseEvidence,
      evidenceId: 'uploaded-file-evidence-1',
      sourceType: 'uploaded_file',
      sourceCandidateId: 'uploaded-file-candidate-1',
      evidenceKind: 'file',
      fileName: 'upload.pdf',
    },
  ],
  sourceMetadata: {
    sourceType: 'uploaded_file',
    uploadSessionId: 'upload-session-1',
    fileName: 'upload.pdf',
    uploadedBy: 'office@example.test',
    uploadedAt: timestamp,
  },
} satisfies UnifiedIntakeCandidate<UploadedFileSourceMetadata>;
// #endregion

// #region Tests
describe('unified intake registry types', () => {
  it('supports all seven source types', () => {
    const sourceTypes: readonly IntakeSourceType[] = [
      'scan',
      'email',
      'google_drive',
      'client_portal',
      'lead',
      'manual',
      'uploaded_file',
    ];

    expect(sourceTypes).toEqual(['scan', 'email', 'google_drive', 'client_portal', 'lead', 'manual', 'uploaded_file']);
  });

  it('compiles candidate fixtures for every source type', () => {
    const candidates = [
      scanCandidate,
      emailCandidate,
      googleDriveCandidate,
      clientPortalCandidate,
      leadCandidate,
      manualCandidate,
      uploadedFileCandidate,
    ];

    expect(candidates.map((candidate) => candidate.sourceType)).toEqual([
      'scan',
      'email',
      'google_drive',
      'client_portal',
      'lead',
      'manual',
      'uploaded_file',
    ]);
  });

  it('supports email folders, labels, system folder, thread, message, and attachment metadata', () => {
    expect(emailCandidate.sourceMetadata.provider).toBe('gmail');
    expect(emailCandidate.sourceMetadata.mailbox).toBe('Primary');
    expect(emailCandidate.sourceMetadata.folder).toBe('Inbox');
    expect(emailCandidate.sourceMetadata.labelIds).toContain('INBOX');
    expect(emailCandidate.sourceMetadata.labelNames).toContain('Client/Review');
    expect(emailCandidate.sourceMetadata.systemFolder).toBe('inbox');
    expect(emailCandidate.sourceMetadata.threadId).toBe('thread-1');
    expect(emailCandidate.sourceMetadata.messageId).toBe('message-1');
    expect(emailCandidate.sourceMetadata.hasAttachments).toBe(true);
    expect(emailCandidate.sourceMetadata.attachmentRefs).toHaveLength(1);
  });

  it('supports Google Drive file, folder, path, file kind, owner, and sharing metadata', () => {
    expect(googleDriveCandidate.sourceMetadata.provider).toBe('google_drive');
    expect(googleDriveCandidate.sourceMetadata.driveFileId).toBe('drive-file-1');
    expect(googleDriveCandidate.sourceMetadata.driveFolderId).toBe('drive-folder-1');
    expect(googleDriveCandidate.sourceMetadata.drivePath).toBe('/לקוחות/מסמך.pdf');
    expect(googleDriveCandidate.sourceMetadata.fileKind).toBe('pdf');
    expect(googleDriveCandidate.sourceMetadata.ownerEmail).toBe('owner@example.test');
    expect(googleDriveCandidate.sourceMetadata.sharedWithMe).toBe(true);
    expect(googleDriveCandidate.sourceMetadata.parentFolderIds).toContain('drive-folder-1');
  });

  it('supports email and Drive evidence kinds alongside existing evidence kinds', () => {
    const evidenceKinds: readonly UnifiedIntakeEvidenceKind[] = [
      'file',
      'message',
      'email_message',
      'email_attachment',
      'drive_file',
      'drive_folder',
      'portal_upload',
      'lead_form',
      'manual_note',
    ];
    const evidenceRefs: readonly UnifiedIntakeEvidenceRef[] = [
      ...emailCandidate.evidenceRefs,
      ...googleDriveCandidate.evidenceRefs,
    ];

    expect(evidenceKinds).toContain('email_message');
    expect(evidenceKinds).toContain('email_attachment');
    expect(evidenceKinds).toContain('drive_file');
    expect(evidenceKinds).toContain('drive_folder');
    expect(evidenceRefs.map((evidence) => evidence.evidenceKind)).toEqual([
      'email_message',
      'email_attachment',
      'drive_file',
      'drive_folder',
    ]);
  });

  it('keeps suggested context hint-only and professional resolution locked to unresolved defaults', () => {
    for (const candidate of [
      scanCandidate,
      emailCandidate,
      googleDriveCandidate,
      clientPortalCandidate,
      leadCandidate,
      manualCandidate,
      uploadedFileCandidate,
    ]) {
      expect(candidate.suggestedContext[0].confidence).toBe('low');
      expect(candidate.suggestedContext[0].isConfirmed).toBe(false);
      expect(candidate.professionalStatus).toBe('not_reviewed');
      expect(candidate.matterResolutionStatus).toBe('unresolved');
      expect(candidate.subjectResolutionStatus).toBe('unresolved');
    }
  });

  it('keeps registry source free of runtime connectors, stores, persistence, and creation helpers', () => {
    const source = readFileSync(`${projectRoot}/src/work-spine/intake/unified-intake-registry.ts`, 'utf8');

    expect(source).not.toMatch(/from\s+['"][^'"]*gmail/i);
    expect(source).not.toMatch(/gmail\./i);
    expect(source).not.toContain('googleapis');
    expect(source).not.toMatch(/drive\s*api/i);
    expect(source).not.toMatch(/oauth/i);
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('indexedDB');
    expect(source).not.toContain('supabase');
    expect(source).not.toContain('zustand');
    expect(source).not.toContain('createWorkItem');
    expect(source).not.toContain('createMatter');
    expect(source).not.toContain('createDocumentRef');
    expect(source).not.toContain('createIntakeEvent');
    expect(source).not.toContain('createIntakeAttachment');
  });
});
// #endregion
