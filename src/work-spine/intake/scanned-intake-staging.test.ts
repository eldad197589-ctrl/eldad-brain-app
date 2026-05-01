/* ============================================
   FILE: scanned-intake-staging.test.ts
   PURPOSE: Focused tests for pure scanned intake staging candidate mapping.
   DEPENDENCIES: vitest, node path/fs, scanned-intake-staging
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ScannedFolderListingResult } from './scanned-folder-listing';
import { createScannedIntakeStagingCandidates } from './scanned-intake-staging';
// #endregion

// #region Helpers
const sourceRoot = path.resolve('C:/scans-root');

const createListingResult = (): ScannedFolderListingResult => ({
  success: true,
  folderPath: sourceRoot,
  files: [
    {
      fileName: 'invoice-a.pdf',
      extension: '.pdf',
      absolutePath: path.join(sourceRoot, 'vat-folder', 'invoice-a.pdf'),
      relativePathFromRoot: path.join('vat-folder', 'invoice-a.pdf'),
      parentFolderName: 'vat-folder',
      folderPath: path.join(sourceRoot, 'vat-folder'),
      sourceRoot,
      sizeBytes: 100,
      createdAt: '2026-04-29T00:00:00.000Z',
      modifiedAt: '2026-04-29T00:01:00.000Z',
      isDirectory: false,
      ocrStatus: 'not_processed',
      intakeStatus: 'staging_candidate',
    },
    {
      fileName: 'agreement.jpg',
      extension: '.jpg',
      absolutePath: path.join(sourceRoot, 'legal-folder', 'agreement.jpg'),
      relativePathFromRoot: path.join('legal-folder', 'agreement.jpg'),
      parentFolderName: 'legal-folder',
      folderPath: path.join(sourceRoot, 'legal-folder'),
      sourceRoot,
      sizeBytes: 200,
      createdAt: '2026-04-29T00:02:00.000Z',
      modifiedAt: '2026-04-29T00:03:00.000Z',
      isDirectory: false,
      ocrStatus: 'not_processed',
      intakeStatus: 'staging_candidate',
    },
  ],
  ignoredCount: 0,
  supportedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.tif', '.tiff'],
  counts: {
    supportedFiles: 2,
    ignoredFiles: 0,
    ignoredFolders: 0,
    scannedFolders: 2,
    maxDepthSkipped: 0,
    errors: 0,
  },
  errors: [],
});
// #endregion

// #region Tests
describe('createScannedIntakeStagingCandidates', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps scanned file metadata into staging candidates and preserves paths/metadata', () => {
    const result = createScannedIntakeStagingCandidates(createListingResult());

    expect(result.counts).toEqual({
      totalCandidates: 2,
      groupsCount: 2,
      warningsCount: 0,
      sourceFilesCount: 2,
    });
    expect(result.candidates[0]).toMatchObject({
      sourceChannel: 'scan',
      fileName: 'invoice-a.pdf',
      extension: '.pdf',
      absolutePath: path.join(sourceRoot, 'vat-folder', 'invoice-a.pdf'),
      relativePathFromRoot: path.join('vat-folder', 'invoice-a.pdf'),
      parentFolderName: 'vat-folder',
      folderPath: path.join(sourceRoot, 'vat-folder'),
      sourceRoot,
      sizeBytes: 100,
      createdAt: '2026-04-29T00:00:00.000Z',
      modifiedAt: '2026-04-29T00:01:00.000Z',
      ocrStatus: 'not_processed',
      intakeStatus: 'staging_candidate',
      suggestedContextFromFolderName: 'vat-folder',
      professionalStatus: 'not_reviewed',
      matterResolutionStatus: 'unresolved',
      warnings: [],
    });
  });

  it('generates deterministic candidate ids from source metadata', () => {
    const listingResult = createListingResult();

    const first = createScannedIntakeStagingCandidates(listingResult);
    const second = createScannedIntakeStagingCandidates(listingResult);
    const changedListing = createListingResult();
    if (changedListing.success) changedListing.files[0] = { ...changedListing.files[0], modifiedAt: '2026-04-29T00:09:00.000Z' };
    const changed = createScannedIntakeStagingCandidates(changedListing);

    expect(first.candidates.map((candidate) => candidate.candidateId)).toEqual(
      second.candidates.map((candidate) => candidate.candidateId)
    );
    expect(first.candidates[0]?.candidateId).toMatch(/^scan-/);
    expect(first.candidates[0]?.candidateId).not.toEqual(changed.candidates[0]?.candidateId);
  });

  it('groups candidates by folder without implying a professional relationship', () => {
    const result = createScannedIntakeStagingCandidates(createListingResult());

    expect(result.groupedCandidates).toHaveLength(2);
    expect(result.groupedCandidates[0]).toMatchObject({
      folderPath: path.join(sourceRoot, 'vat-folder'),
      parentFolderName: 'vat-folder',
      suggestedContextFromFolderName: 'vat-folder',
      count: 1,
    });
    expect(result.groupedCandidates.flatMap((group) => group.candidates)).toEqual(result.candidates);
    expect(result.candidates.every((candidate) => candidate.professionalStatus === 'not_reviewed')).toBe(true);
    expect(result.candidates.every((candidate) => candidate.matterResolutionStatus === 'unresolved')).toBe(true);
  });

  it('keeps folder context as a hint only and does not infer professional fields', () => {
    const result = createScannedIntakeStagingCandidates(createListingResult());
    const candidateRecord = result.candidates[0] as unknown as Record<string, unknown>;

    expect(candidateRecord.suggestedContextFromFolderName).toBe('vat-folder');
    expect(candidateRecord.clientId).toBeUndefined();
    expect(candidateRecord.clientName).toBeUndefined();
    expect(candidateRecord.matterId).toBeUndefined();
    expect(candidateRecord.matter_id).toBeUndefined();
    expect(candidateRecord.documentType).toBeUndefined();
    expect(candidateRecord.deductibleStatus).toBeUndefined();
    expect(candidateRecord.taxMeaning).toBeUndefined();
    expect(candidateRecord.legalMeaning).toBeUndefined();
    expect(candidateRecord.payrollMeaning).toBeUndefined();
    expect(candidateRecord.accountingMeaning).toBeUndefined();
  });

  it('reports warnings for missing timestamps, duplicate-looking ids, and ambiguous folder hints', () => {
    const listingResult: ScannedFolderListingResult = {
      success: true,
      folderPath: sourceRoot,
      files: [
        {
          fileName: 'duplicate.pdf',
          extension: '.pdf',
          absolutePath: path.join(sourceRoot, 'שונות', 'duplicate.pdf'),
          relativePathFromRoot: path.join('שונות', 'duplicate.pdf'),
          parentFolderName: 'שונות',
          folderPath: path.join(sourceRoot, 'שונות'),
          sourceRoot,
          sizeBytes: 300,
          isDirectory: false,
          ocrStatus: 'not_processed',
          intakeStatus: 'staging_candidate',
        },
        {
          fileName: 'duplicate-copy.pdf',
          extension: '.pdf',
          absolutePath: path.join(sourceRoot, 'שונות', 'duplicate-copy.pdf'),
          relativePathFromRoot: path.join('שונות', 'duplicate.pdf'),
          parentFolderName: 'שונות',
          folderPath: path.join(sourceRoot, 'שונות'),
          sourceRoot,
          sizeBytes: 300,
          isDirectory: false,
          ocrStatus: 'not_processed',
          intakeStatus: 'staging_candidate',
        },
      ],
      ignoredCount: 0,
      supportedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.tif', '.tiff'],
    };

    const result = createScannedIntakeStagingCandidates(listingResult);

    expect(result.warnings.map((warning) => warning.code)).toEqual([
      'missing_created_at',
      'missing_modified_at',
      'folder_hint_ambiguous',
      'missing_created_at',
      'missing_modified_at',
      'folder_hint_ambiguous',
      'duplicate_candidate_id',
    ]);
    expect(result.counts.warningsCount).toBe(7);
    expect(result.candidates[1]?.warnings.some((warning) => warning.code === 'duplicate_candidate_id')).toBe(true);
  });

  it('handles empty and failed listing results safely', () => {
    const emptyResult: ScannedFolderListingResult = {
      success: true,
      folderPath: sourceRoot,
      files: [],
      ignoredCount: 0,
      supportedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.tif', '.tiff'],
    };
    const failedResult: ScannedFolderListingResult = {
      success: false,
      error: {
        code: 'missing_folder',
        message: 'Scanned folder does not exist.',
        folderPath: sourceRoot,
      },
      files: [],
      ignoredCount: 0,
      supportedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.tif', '.tiff'],
    };

    const empty = createScannedIntakeStagingCandidates(emptyResult);
    const failed = createScannedIntakeStagingCandidates(failedResult);

    expect(empty).toEqual({
      candidates: [],
      groupedCandidates: [],
      counts: {
        totalCandidates: 0,
        groupsCount: 0,
        warningsCount: 0,
        sourceFilesCount: 0,
      },
      warnings: [],
    });
    expect(failed.candidates).toEqual([]);
    expect(failed.groupedCandidates).toEqual([]);
    expect(failed.warnings).toEqual([
      {
        code: 'unsupported_incomplete_listing_result',
        message: 'Scanned folder does not exist.',
        sourcePath: sourceRoot,
      },
    ]);
  });

  it('does not write to storage or create professional records', async () => {
    const setItem = vi.fn();
    const removeItem = vi.fn();
    const clear = vi.fn();
    const indexedOpen = vi.fn();
    const indexedDelete = vi.fn();
    vi.stubGlobal('localStorage', { setItem, removeItem, clear });
    vi.stubGlobal('indexedDB', { open: indexedOpen, deleteDatabase: indexedDelete });

    const result = createScannedIntakeStagingCandidates(createListingResult());
    const candidateRecord = result.candidates[0] as unknown as Record<string, unknown>;
    const source = await readFile(path.resolve('src/work-spine/intake/scanned-intake-staging.ts'), 'utf8');

    expect(setItem).not.toHaveBeenCalled();
    expect(removeItem).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
    expect(indexedOpen).not.toHaveBeenCalled();
    expect(indexedDelete).not.toHaveBeenCalled();
    expect(candidateRecord.matterId).toBeUndefined();
    expect(candidateRecord.documentRefId).toBeUndefined();
    expect(candidateRecord.intakeEventId).toBeUndefined();
    expect(candidateRecord.intakeAttachmentId).toBeUndefined();
    expect(source).not.toContain('useBrainStore');
    expect(source).not.toContain('useMatterStore');
    expect(source).not.toContain('zustand');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('indexedDB');
    expect(source).not.toContain('supabase');
    expect(source).not.toContain('writeFile');
    expect(source).not.toContain('rename(');
    expect(source).not.toContain('unlink(');
    expect(source).not.toContain('rm(');
    expect(source).not.toContain('MatterRecord');
    expect(source).not.toContain('DocumentRef');
    expect(source).not.toContain('IntakeEvent');
    expect(source).not.toContain('IntakeAttachment');
  });
});
// #endregion
