/* ============================================
   FILE: scan-to-unified-intake.test.ts
   PURPOSE: Focused tests for the pure scan-to-unified intake mapper.
   DEPENDENCIES: vitest, scan-to-unified-intake
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ScannedIntakeStagingResult } from './scanned-intake-staging';
import { createUnifiedIntakeFromScannedStaging } from './scan-to-unified-intake';
// #endregion

// #region Test Data
const projectRoot = 'C:/Users/1/OneDrive/שולחן העבודה/אלדד/גרוויטי תקיות/המוח של אלדד/brain-app';

const createStagingResult = (): ScannedIntakeStagingResult => ({
  candidates: [
    {
      candidateId: 'scan-file-a',
      sourceChannel: 'scan',
      fileName: 'invoice-a.pdf',
      extension: '.pdf',
      absolutePath: 'C:/scans/vat-folder/invoice-a.pdf',
      relativePathFromRoot: 'vat-folder/invoice-a.pdf',
      parentFolderName: 'vat-folder',
      folderPath: 'C:/scans/vat-folder',
      sourceRoot: 'C:/scans',
      sizeBytes: 100,
      createdAt: '2026-04-29T00:00:00.000Z',
      modifiedAt: '2026-04-29T00:01:00.000Z',
      ocrStatus: 'not_processed',
      intakeStatus: 'staging_candidate',
      suggestedContextFromFolderName: 'vat-folder',
      professionalStatus: 'not_reviewed',
      matterResolutionStatus: 'unresolved',
      warnings: [],
    },
    {
      candidateId: 'scan-file-b',
      sourceChannel: 'scan',
      fileName: 'invoice-b.jpg',
      extension: '.jpg',
      absolutePath: 'C:/scans/vat-folder/invoice-b.jpg',
      relativePathFromRoot: 'vat-folder/invoice-b.jpg',
      parentFolderName: 'vat-folder',
      folderPath: 'C:/scans/vat-folder',
      sourceRoot: 'C:/scans',
      sizeBytes: 200,
      createdAt: '2026-04-29T00:02:00.000Z',
      modifiedAt: '2026-04-29T00:03:00.000Z',
      ocrStatus: 'not_processed',
      intakeStatus: 'staging_candidate',
      suggestedContextFromFolderName: 'vat-folder',
      professionalStatus: 'not_reviewed',
      matterResolutionStatus: 'unresolved',
      warnings: [],
    },
  ],
  groupedCandidates: [
    {
      groupKey: 'C:/scans/vat-folder',
      folderPath: 'C:/scans/vat-folder',
      parentFolderName: 'vat-folder',
      suggestedContextFromFolderName: 'vat-folder',
      count: 2,
      candidates: [],
      warnings: [],
    },
  ],
  counts: {
    totalCandidates: 2,
    groupsCount: 1,
    warningsCount: 0,
    sourceFilesCount: 2,
  },
  warnings: [],
});

const createCompleteStagingResult = (): ScannedIntakeStagingResult => {
  const result = createStagingResult();
  result.groupedCandidates[0] = {
    ...result.groupedCandidates[0],
    candidates: result.candidates,
  };
  return result;
};
// #endregion

// #region Tests
describe('createUnifiedIntakeFromScannedStaging', () => {
  it('maps one scan group to one UnifiedIntakeCandidate', () => {
    const result = createUnifiedIntakeFromScannedStaging(createCompleteStagingResult());

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]).toMatchObject({
      sourceType: 'scan',
      sourceId: 'C:/scans/vat-folder',
      sourceLabel: 'vat-folder',
      candidateStatus: 'staging_candidate',
      professionalStatus: 'not_reviewed',
      matterResolutionStatus: 'unresolved',
      subjectResolutionStatus: 'unresolved',
    });
    expect(result.candidates[0]?.sourceMetadata).toEqual({
      sourceType: 'scan',
      sourceRoot: 'C:/scans',
      folderPath: 'C:/scans/vat-folder',
      parentFolderName: 'vat-folder',
      relativePathFromRoot: 'vat-folder',
      modifiedAt: '2026-04-29T00:01:00.000Z',
      extension: '.pdf',
    });
  });

  it('maps scan file candidates to evidence refs', () => {
    const result = createUnifiedIntakeFromScannedStaging(createCompleteStagingResult());

    expect(result.evidenceRefs).toHaveLength(2);
    expect(result.candidates[0]?.evidenceRefs).toHaveLength(2);
    expect(result.evidenceRefs[0]).toMatchObject({
      sourceType: 'scan',
      evidenceKind: 'file',
      title: 'invoice-a.pdf',
      fileName: 'invoice-a.pdf',
      sizeBytes: 100,
      absolutePath: 'C:/scans/vat-folder/invoice-a.pdf',
      relativePathFromRoot: 'vat-folder/invoice-a.pdf',
      ocrStatus: 'not_processed',
      classificationStatus: 'not_classified',
      reviewStatus: 'not_reviewed',
    });
    expect(result.evidenceRefs[0]?.sourceCandidateId).toBe(result.candidates[0]?.candidateId);
  });

  it('keeps candidate statuses and suggested context locked as non-inferred hints', () => {
    const result = createUnifiedIntakeFromScannedStaging(createCompleteStagingResult());
    const candidate = result.candidates[0];

    expect(candidate?.professionalStatus).toBe('not_reviewed');
    expect(candidate?.matterResolutionStatus).toBe('unresolved');
    expect(candidate?.subjectResolutionStatus).toBe('unresolved');
    expect(candidate?.suggestedContext).toEqual([
      {
        label: 'vat-folder',
        source: 'folder_name',
        confidence: 'low',
        isConfirmed: false,
      },
    ]);
  });

  it('generates deterministic ids across repeated runs', () => {
    const input = createCompleteStagingResult();
    const first = createUnifiedIntakeFromScannedStaging(input);
    const second = createUnifiedIntakeFromScannedStaging(input);

    expect(first.candidates.map((candidate) => candidate.candidateId)).toEqual(
      second.candidates.map((candidate) => candidate.candidateId)
    );
    expect(first.evidenceRefs.map((evidence) => evidence.evidenceId)).toEqual(
      second.evidenceRefs.map((evidence) => evidence.evidenceId)
    );
    expect(first.candidates[0]?.candidateId).toMatch(/^unified-scan-candidate-/);
    expect(first.evidenceRefs[0]?.evidenceId).toMatch(/^unified-scan-evidence-/);
  });

  it('does not mutate input', () => {
    const input = createCompleteStagingResult();
    const before = JSON.stringify(input);

    createUnifiedIntakeFromScannedStaging(input);

    expect(JSON.stringify(input)).toBe(before);
  });

  it('reports diagnostics counts and skipped groups safely', () => {
    const input = createCompleteStagingResult();
    input.groupedCandidates.push({
      groupKey: 'empty-group',
      count: 0,
      candidates: [],
      warnings: [],
    });

    const result = createUnifiedIntakeFromScannedStaging(input);

    expect(result.diagnostics).toMatchObject({
      candidateCount: 1,
      evidenceCount: 2,
      sourceGroupCount: 2,
    });
    expect(result.diagnostics.skippedItems).toEqual([{ groupKey: 'empty-group', reason: 'empty_group' }]);
    expect(result.diagnostics.errors).toEqual([
      {
        groupKey: 'empty-group',
        message: 'Scanned staging group has no file candidates.',
      },
    ]);
  });

  it('keeps source free of stores, persistence, APIs, creation helpers, and professional inference symbols', () => {
    const source = readFileSync(`${projectRoot}/src/work-spine/intake/scan-to-unified-intake.ts`, 'utf8');

    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('indexedDB');
    expect(source).not.toContain('supabase');
    expect(source).not.toContain('zustand');
    expect(source).not.toContain('useBrainStore');
    expect(source).not.toContain('useMatterStore');
    expect(source).not.toMatch(/from\s+['"][^'"]*gmail/i);
    expect(source).not.toContain('googleapis');
    expect(source).not.toMatch(/drive\s*api/i);
    expect(source).not.toMatch(/oauth/i);
    expect(source).not.toContain('createWorkItem');
    expect(source).not.toContain('createMatter');
    expect(source).not.toContain('createDocumentRef');
    expect(source).not.toContain('createIntakeEvent');
    expect(source).not.toContain('createIntakeAttachment');
    expect(source).not.toContain('TaskCandidate');
    expect(source).not.toContain('clientId');
    expect(source).not.toContain('matterId');
    expect(source).not.toContain('vatPeriod');
    expect(source).not.toContain('payroll');
  });
});
// #endregion
