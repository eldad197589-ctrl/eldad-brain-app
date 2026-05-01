/* ============================================
   FILE: google-drive-to-unified-intake.test.ts
   PURPOSE: Focused tests for the pure Google Drive-to-unified intake mapper.
   DEPENDENCIES: vitest, google-drive-to-unified-intake
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { GoogleDriveFileKind } from './unified-intake-registry';
import type { GoogleDriveIntakeItemInput } from './google-drive-to-unified-intake';
import { createUnifiedIntakeFromGoogleDriveItems } from './google-drive-to-unified-intake';
// #endregion

// #region Test Data
const projectRoot = 'C:/Users/1/OneDrive/שולחן העבודה/אלדד/גרוויטי תקיות/המוח של אלדד/brain-app';

const createDriveFile = (overrides: Partial<GoogleDriveIntakeItemInput> = {}): GoogleDriveIntakeItemInput => ({
  driveFileId: 'drive-file-1',
  driveFolderId: 'drive-folder-1',
  drivePath: '/לקוחות/מסמך.pdf',
  driveFolderName: 'לקוחות',
  fileName: 'מסמך.pdf',
  mimeType: 'application/pdf',
  fileKind: 'pdf',
  ownerEmail: 'owner@example.test',
  sharedWithMe: true,
  modifiedAt: '2026-04-29T00:01:00.000Z',
  createdAt: '2026-04-29T00:00:00.000Z',
  webViewLink: 'https://drive.example.test/file',
  parentFolderIds: ['drive-folder-1'],
  sourceFolderHint: 'לקוחות',
  isFolder: false,
  ...overrides,
});

const createDriveFolder = (overrides: Partial<GoogleDriveIntakeItemInput> = {}): GoogleDriveIntakeItemInput => ({
  driveFileId: undefined,
  driveFolderId: 'drive-folder-2',
  drivePath: '/לקוחות/תיקייה',
  driveFolderName: 'תיקייה',
  fileName: 'תיקייה',
  mimeType: 'application/vnd.google-apps.folder',
  fileKind: 'folder',
  ownerEmail: 'owner@example.test',
  sharedWithMe: false,
  modifiedAt: '2026-04-29T00:02:00.000Z',
  createdAt: '2026-04-29T00:00:00.000Z',
  webViewLink: 'https://drive.example.test/folder',
  parentFolderIds: ['drive-root'],
  sourceFolderHint: 'לקוחות',
  isFolder: true,
  ...overrides,
});
// #endregion

// #region Tests
describe('createUnifiedIntakeFromGoogleDriveItems', () => {
  it('maps Drive file to unified candidate', () => {
    const result = createUnifiedIntakeFromGoogleDriveItems([createDriveFile()]);

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]).toMatchObject({
      sourceType: 'google_drive',
      sourceId: 'drive-file-1',
      sourceLabel: 'מסמך.pdf',
      candidateStatus: 'staging_candidate',
      professionalStatus: 'not_reviewed',
      matterResolutionStatus: 'unresolved',
      subjectResolutionStatus: 'unresolved',
    });
    expect(result.candidates[0]?.sourceMetadata).toMatchObject({
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
    });
  });

  it('maps Drive file to drive_file evidence', () => {
    const result = createUnifiedIntakeFromGoogleDriveItems([createDriveFile()]);

    expect(result.evidenceRefs).toHaveLength(1);
    expect(result.evidenceRefs[0]).toMatchObject({
      sourceType: 'google_drive',
      evidenceKind: 'drive_file',
      title: 'מסמך.pdf',
      fileName: 'מסמך.pdf',
      mimeType: 'application/pdf',
      driveFileId: 'drive-file-1',
      driveFolderId: 'drive-folder-1',
      ocrStatus: 'not_processed',
      classificationStatus: 'not_classified',
      reviewStatus: 'not_reviewed',
    });
    expect(result.evidenceRefs[0]?.sourceCandidateId).toBe(result.candidates[0]?.candidateId);
  });

  it('maps Drive folder to drive_folder evidence', () => {
    const result = createUnifiedIntakeFromGoogleDriveItems([createDriveFolder()]);

    expect(result.candidates).toHaveLength(1);
    expect(result.evidenceRefs).toHaveLength(1);
    expect(result.evidenceRefs[0]).toMatchObject({
      sourceType: 'google_drive',
      evidenceKind: 'drive_folder',
      title: 'תיקייה',
      driveFolderId: 'drive-folder-2',
      ocrStatus: 'not_processed',
      classificationStatus: 'not_classified',
      reviewStatus: 'not_reviewed',
    });
    expect(result.diagnostics.folderCount).toBe(1);
    expect(result.diagnostics.fileCount).toBe(0);
  });

  it('supports all Google Drive file kinds', () => {
    const fileKinds: GoogleDriveFileKind[] = [
      'google_doc',
      'google_sheet',
      'google_slide',
      'pdf',
      'image',
      'office_doc',
      'folder',
      'other',
    ];
    const result = createUnifiedIntakeFromGoogleDriveItems(
      fileKinds.map((fileKind, index) =>
        createDriveFile({
          driveFileId: `drive-file-${index}`,
          drivePath: `/kind/${fileKind}`,
          fileName: `${fileKind}.fixture`,
          mimeType: fileKind === 'folder' ? 'application/vnd.google-apps.folder' : 'application/octet-stream',
          fileKind,
          isFolder: fileKind === 'folder',
        })
      )
    );

    expect(result.candidates.map((candidate) => candidate.sourceMetadata.fileKind)).toEqual(fileKinds);
    expect(result.evidenceRefs.map((evidence) => evidence.evidenceKind)).toContain('drive_folder');
    expect(result.evidenceRefs.map((evidence) => evidence.evidenceKind)).toContain('drive_file');
  });

  it('keeps owner/shared metadata as hint only and statuses locked', () => {
    const result = createUnifiedIntakeFromGoogleDriveItems([createDriveFile()]);
    const candidate = result.candidates[0];

    expect(candidate?.professionalStatus).toBe('not_reviewed');
    expect(candidate?.matterResolutionStatus).toBe('unresolved');
    expect(candidate?.subjectResolutionStatus).toBe('unresolved');
    expect(candidate?.suggestedContext).toEqual([
      { label: '/לקוחות/מסמך.pdf', source: 'drive_path', confidence: 'low', isConfirmed: false },
      { label: 'לקוחות', source: 'drive_folder_name', confidence: 'low', isConfirmed: false },
      { label: 'מסמך.pdf', source: 'drive_file_name', confidence: 'low', isConfirmed: false },
      { label: 'לקוחות', source: 'drive_source_folder_hint', confidence: 'low', isConfirmed: false },
      { label: 'owner@example.test', source: 'drive_owner_email', confidence: 'low', isConfirmed: false },
      { label: 'shared_with_me', source: 'drive_shared_metadata', confidence: 'low', isConfirmed: false },
    ]);
    expect((candidate as unknown as Record<string, unknown>).clientId).toBeUndefined();
    expect((candidate as unknown as Record<string, unknown>).matterId).toBeUndefined();
    expect((candidate as unknown as Record<string, unknown>).priority).toBeUndefined();
  });

  it('generates deterministic ids across repeated runs', () => {
    const input = [createDriveFile()];
    const first = createUnifiedIntakeFromGoogleDriveItems(input);
    const second = createUnifiedIntakeFromGoogleDriveItems(input);

    expect(first.candidates.map((candidate) => candidate.candidateId)).toEqual(
      second.candidates.map((candidate) => candidate.candidateId)
    );
    expect(first.evidenceRefs.map((evidence) => evidence.evidenceId)).toEqual(
      second.evidenceRefs.map((evidence) => evidence.evidenceId)
    );
    expect(first.candidates[0]?.candidateId).toMatch(/^unified-google-drive-candidate-/);
    expect(first.evidenceRefs[0]?.evidenceId).toMatch(/^unified-google-drive-evidence-/);
  });

  it('does not mutate input', () => {
    const input = [createDriveFile()];
    const before = JSON.stringify(input);

    createUnifiedIntakeFromGoogleDriveItems(input);

    expect(JSON.stringify(input)).toBe(before);
  });

  it('reports diagnostics, warnings, and skipped invalid items', () => {
    const result = createUnifiedIntakeFromGoogleDriveItems([
      createDriveFile({
        fileName: '',
        mimeType: '',
        parentFolderIds: [],
        drivePath: '',
        sharedWithMe: true,
        ownerEmail: '',
      }),
      createDriveFile({
        driveFileId: undefined,
        driveFolderId: undefined,
        drivePath: '/invalid',
      }),
      createDriveFolder(),
    ]);

    expect(result.diagnostics).toMatchObject({
      candidateCount: 2,
      evidenceCount: 2,
      folderCount: 1,
      fileCount: 1,
    });
    expect(result.diagnostics.warnings.map((warning) => warning.warningCode)).toEqual([
      'missing_file_name',
      'missing_mime_type',
      'missing_parent_folder_ids',
      'missing_drive_path',
      'shared_with_me_without_owner_email',
      'missing_drive_file_id',
    ]);
    expect(result.diagnostics.skippedItems).toEqual([{ sourceId: '/invalid', reason: 'missing_drive_identity' }]);
    expect(result.diagnostics.errors).toEqual([
      {
        sourceId: '/invalid',
        message: 'Google Drive metadata is missing both driveFileId and driveFolderId.',
      },
    ]);
  });

  it('keeps source free of external connectors, persistence, stores, and professional creation helpers', () => {
    const source = readFileSync(`${projectRoot}/src/work-spine/intake/google-drive-to-unified-intake.ts`, 'utf8');

    expect(source).not.toContain('googleapis');
    expect(source).not.toMatch(/drive\s*api/i);
    expect(source).not.toMatch(/oauth/i);
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('indexedDB');
    expect(source).not.toContain('supabase');
    expect(source).not.toContain('zustand');
    expect(source).not.toContain('useBrainStore');
    expect(source).not.toContain('useMatterStore');
    expect(source).not.toContain('createWorkItem');
    expect(source).not.toContain('createMatter');
    expect(source).not.toContain('createDocumentRef');
    expect(source).not.toContain('createIntakeEvent');
    expect(source).not.toContain('createIntakeAttachment');
    expect(source).not.toContain('rename');
    expect(source).not.toContain('delete');
    expect(source).not.toContain('download');
  });
});
// #endregion
