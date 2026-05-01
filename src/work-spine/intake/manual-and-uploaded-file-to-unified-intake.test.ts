/* ============================================
   FILE: manual-and-uploaded-file-to-unified-intake.test.ts
   PURPOSE: Focused tests for pure manual and uploaded-file unified intake mappers.
   DEPENDENCIES: vitest, manual-and-uploaded-file-to-unified-intake
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type {
  ManualIntakeInput,
  UploadedFileIntakeInput,
} from './manual-and-uploaded-file-to-unified-intake';
import {
  createUnifiedIntakeFromManualNotes,
  createUnifiedIntakeFromUploadedFiles,
} from './manual-and-uploaded-file-to-unified-intake';
// #endregion

// #region Test Data
const projectRoot = 'C:/Users/1/OneDrive/שולחן העבודה/אלדד/גרוויטי תקיות/המוח של אלדד/brain-app';

const createManualNote = (overrides: Partial<ManualIntakeInput> = {}): ManualIntakeInput => ({
  manualId: 'manual-1',
  author: 'Eldad',
  noteText: 'צריך לבדוק מסמך שהגיע בשיחה.',
  manualCreatedAt: '2026-04-29T00:00:00.000Z',
  sourceLabel: 'פתק שיחה',
  relatedFreeText: 'לקוח הזכיר מע״מ',
  declaredClientName: 'לקוח לדוגמה',
  declaredMatterLabel: 'מע״מ 2026',
  tags: ['שיחה', 'מעקב'],
  ...overrides,
});

const createUploadedFile = (overrides: Partial<UploadedFileIntakeInput> = {}): UploadedFileIntakeInput => ({
  uploadSessionId: 'upload-session-1',
  fileId: 'uploaded-file-1',
  fileName: 'uploaded.pdf',
  uploadedBy: 'operator@example.test',
  uploadedAt: '2026-04-29T00:00:00.000Z',
  mimeType: 'application/pdf',
  sizeBytes: 4096,
  uploadSource: 'internal_dropzone',
  sourceLabel: 'קובץ שהועלה',
  declaredClientName: 'לקוח לדוגמה',
  declaredMatterLabel: 'מע״מ 2026',
  notes: 'הועלה ידנית לבדיקה',
  ...overrides,
});
// #endregion

// #region Tests
describe('createUnifiedIntakeFromManualNotes', () => {
  it('maps manual note to unified candidate', () => {
    const result = createUnifiedIntakeFromManualNotes([createManualNote()]);

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]).toMatchObject({
      sourceType: 'manual',
      sourceId: 'manual-1',
      sourceLabel: 'פתק שיחה',
      candidateStatus: 'staging_candidate',
      professionalStatus: 'not_reviewed',
      matterResolutionStatus: 'unresolved',
      subjectResolutionStatus: 'unresolved',
    });
    expect(result.candidates[0]?.sourceMetadata).toEqual({
      sourceType: 'manual',
      author: 'Eldad',
      noteText: 'צריך לבדוק מסמך שהגיע בשיחה.',
      manualCreatedAt: '2026-04-29T00:00:00.000Z',
    });
  });

  it('maps manual note to manual_note evidence', () => {
    const result = createUnifiedIntakeFromManualNotes([createManualNote()]);

    expect(result.evidenceRefs).toHaveLength(1);
    expect(result.evidenceRefs[0]).toMatchObject({
      sourceType: 'manual',
      evidenceKind: 'manual_note',
      title: 'פתק שיחה',
      ocrStatus: 'not_processed',
      classificationStatus: 'not_classified',
      reviewStatus: 'not_reviewed',
    });
    expect(result.evidenceRefs[0]?.sourceCandidateId).toBe(result.candidates[0]?.candidateId);
  });

  it('keeps manual hints low-confidence and unconfirmed', () => {
    const result = createUnifiedIntakeFromManualNotes([createManualNote()]);
    const candidate = result.candidates[0];

    expect(candidate?.suggestedContext).toEqual([
      { label: 'Eldad', source: 'manual_author', confidence: 'low', isConfirmed: false },
      { label: 'צריך לבדוק מסמך שהגיע בשיחה.', source: 'manual_note_text', confidence: 'low', isConfirmed: false },
      { label: 'פתק שיחה', source: 'manual_source_label', confidence: 'low', isConfirmed: false },
      { label: 'לקוח הזכיר מע״מ', source: 'manual_related_free_text', confidence: 'low', isConfirmed: false },
      { label: 'לקוח לדוגמה', source: 'manual_declared_client_name', confidence: 'low', isConfirmed: false },
      { label: 'מע״מ 2026', source: 'manual_declared_matter_label', confidence: 'low', isConfirmed: false },
      { label: 'שיחה', source: 'manual_tag', confidence: 'low', isConfirmed: false },
      { label: 'מעקב', source: 'manual_tag', confidence: 'low', isConfirmed: false },
    ]);
    expect((candidate as unknown as Record<string, unknown>).clientId).toBeUndefined();
    expect((candidate as unknown as Record<string, unknown>).matterId).toBeUndefined();
    expect((candidate as unknown as Record<string, unknown>).taskId).toBeUndefined();
  });

  it('skips invalid manual note and reports diagnostics', () => {
    const result = createUnifiedIntakeFromManualNotes([
      createManualNote({
        author: '',
        noteText: '',
        manualCreatedAt: '',
      }),
      createManualNote({
        manualId: undefined,
        sourceLabel: 'missing manual id',
      }),
    ]);

    expect(result.diagnostics).toMatchObject({
      candidateCount: 1,
      evidenceCount: 1,
      manualCount: 2,
    });
    expect(result.diagnostics.warnings.map((warning) => warning.warningCode)).toEqual([
      'missing_note_text',
      'missing_author',
      'missing_manual_created_at',
    ]);
    expect(result.diagnostics.skippedItems).toEqual([
      { sourceId: 'missing manual id', reason: 'missing_manual_id' },
    ]);
    expect(result.diagnostics.errors).toEqual([
      {
        sourceId: 'missing manual id',
        message: 'Manual intake metadata is missing manualId.',
      },
    ]);
  });
});

describe('createUnifiedIntakeFromUploadedFiles', () => {
  it('maps uploaded file to unified candidate', () => {
    const result = createUnifiedIntakeFromUploadedFiles([createUploadedFile()]);

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]).toMatchObject({
      sourceType: 'uploaded_file',
      sourceId: 'uploaded-file-1',
      sourceLabel: 'קובץ שהועלה',
      candidateStatus: 'staging_candidate',
      professionalStatus: 'not_reviewed',
      matterResolutionStatus: 'unresolved',
      subjectResolutionStatus: 'unresolved',
    });
    expect(result.candidates[0]?.sourceMetadata).toEqual({
      sourceType: 'uploaded_file',
      uploadSessionId: 'upload-session-1',
      fileName: 'uploaded.pdf',
      uploadedBy: 'operator@example.test',
      uploadedAt: '2026-04-29T00:00:00.000Z',
    });
  });

  it('maps uploaded file to file evidence', () => {
    const result = createUnifiedIntakeFromUploadedFiles([createUploadedFile()]);

    expect(result.evidenceRefs).toHaveLength(1);
    expect(result.evidenceRefs[0]).toMatchObject({
      sourceType: 'uploaded_file',
      evidenceKind: 'file',
      title: 'קובץ שהועלה',
      fileName: 'uploaded.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 4096,
      ocrStatus: 'not_processed',
      classificationStatus: 'not_classified',
      reviewStatus: 'not_reviewed',
    });
    expect(result.evidenceRefs[0]?.sourceCandidateId).toBe(result.candidates[0]?.candidateId);
  });

  it('keeps uploaded file hints low-confidence and unconfirmed', () => {
    const result = createUnifiedIntakeFromUploadedFiles([createUploadedFile()]);
    const candidate = result.candidates[0];

    expect(candidate?.suggestedContext).toEqual([
      { label: 'uploaded.pdf', source: 'uploaded_file_name', confidence: 'low', isConfirmed: false },
      {
        label: 'operator@example.test',
        source: 'uploaded_file_uploaded_by',
        confidence: 'low',
        isConfirmed: false,
      },
      { label: 'internal_dropzone', source: 'uploaded_file_source', confidence: 'low', isConfirmed: false },
      { label: 'קובץ שהועלה', source: 'uploaded_file_source_label', confidence: 'low', isConfirmed: false },
      { label: 'לקוח לדוגמה', source: 'uploaded_file_declared_client_name', confidence: 'low', isConfirmed: false },
      { label: 'מע״מ 2026', source: 'uploaded_file_declared_matter_label', confidence: 'low', isConfirmed: false },
      { label: 'הועלה ידנית לבדיקה', source: 'uploaded_file_notes', confidence: 'low', isConfirmed: false },
    ]);
    expect((candidate as unknown as Record<string, unknown>).documentRefId).toBeUndefined();
    expect((candidate as unknown as Record<string, unknown>).matterId).toBeUndefined();
    expect((candidate as unknown as Record<string, unknown>).taskId).toBeUndefined();
  });

  it('skips invalid uploaded file and reports diagnostics', () => {
    const result = createUnifiedIntakeFromUploadedFiles([
      createUploadedFile({
        uploadedAt: '',
        uploadedBy: '',
        mimeType: '',
      }),
      createUploadedFile({
        uploadSessionId: undefined,
        fileName: 'missing-session.pdf',
      }),
      createUploadedFile({
        uploadSessionId: 'missing-file-name',
        fileName: '',
      }),
    ]);

    expect(result.diagnostics).toMatchObject({
      candidateCount: 1,
      evidenceCount: 1,
      uploadedFileCount: 3,
    });
    expect(result.diagnostics.warnings.map((warning) => warning.warningCode)).toEqual([
      'missing_uploaded_at',
      'missing_uploaded_by',
      'missing_mime_type',
    ]);
    expect(result.diagnostics.skippedItems).toEqual([
      { sourceId: 'missing-session.pdf', reason: 'missing_upload_session_id' },
      { sourceId: 'missing-file-name', reason: 'missing_file_name' },
    ]);
    expect(result.diagnostics.errors).toEqual([
      {
        sourceId: 'missing-session.pdf',
        message: 'Uploaded file metadata is missing uploadSessionId.',
      },
      {
        sourceId: 'missing-file-name',
        message: 'Uploaded file metadata is missing fileName.',
      },
    ]);
  });
});

describe('manual and uploaded file mapper shared safety', () => {
  it('keeps statuses locked and evidence unprocessed for both sources', () => {
    const manual = createUnifiedIntakeFromManualNotes([createManualNote()]);
    const uploaded = createUnifiedIntakeFromUploadedFiles([createUploadedFile()]);

    for (const candidate of [...manual.candidates, ...uploaded.candidates]) {
      expect(candidate.professionalStatus).toBe('not_reviewed');
      expect(candidate.matterResolutionStatus).toBe('unresolved');
      expect(candidate.subjectResolutionStatus).toBe('unresolved');
    }
    for (const evidence of [...manual.evidenceRefs, ...uploaded.evidenceRefs]) {
      expect(evidence.ocrStatus).toBe('not_processed');
      expect(evidence.classificationStatus).toBe('not_classified');
      expect(evidence.reviewStatus).toBe('not_reviewed');
    }
  });

  it('generates deterministic ids across repeated runs', () => {
    const manualInput = [createManualNote()];
    const uploadedInput = [createUploadedFile()];
    const firstManual = createUnifiedIntakeFromManualNotes(manualInput);
    const secondManual = createUnifiedIntakeFromManualNotes(manualInput);
    const firstUploaded = createUnifiedIntakeFromUploadedFiles(uploadedInput);
    const secondUploaded = createUnifiedIntakeFromUploadedFiles(uploadedInput);

    expect(firstManual.candidates.map((candidate) => candidate.candidateId)).toEqual(
      secondManual.candidates.map((candidate) => candidate.candidateId)
    );
    expect(firstManual.evidenceRefs.map((evidence) => evidence.evidenceId)).toEqual(
      secondManual.evidenceRefs.map((evidence) => evidence.evidenceId)
    );
    expect(firstUploaded.candidates.map((candidate) => candidate.candidateId)).toEqual(
      secondUploaded.candidates.map((candidate) => candidate.candidateId)
    );
    expect(firstUploaded.evidenceRefs.map((evidence) => evidence.evidenceId)).toEqual(
      secondUploaded.evidenceRefs.map((evidence) => evidence.evidenceId)
    );
    expect(firstManual.candidates[0]?.candidateId).toMatch(/^unified-manual-candidate-/);
    expect(firstUploaded.candidates[0]?.candidateId).toMatch(/^unified-uploaded-file-candidate-/);
  });

  it('does not mutate input', () => {
    const manualInput = [createManualNote()];
    const uploadedInput = [createUploadedFile()];
    const beforeManual = JSON.stringify(manualInput);
    const beforeUploaded = JSON.stringify(uploadedInput);

    createUnifiedIntakeFromManualNotes(manualInput);
    createUnifiedIntakeFromUploadedFiles(uploadedInput);

    expect(JSON.stringify(manualInput)).toBe(beforeManual);
    expect(JSON.stringify(uploadedInput)).toBe(beforeUploaded);
  });

  it('keeps source free of file IO, stores, persistence, and professional creation helpers', () => {
    const source = readFileSync(
      `${projectRoot}/src/work-spine/intake/manual-and-uploaded-file-to-unified-intake.ts`,
      'utf8'
    );

    expect(source).not.toContain('node:fs');
    expect(source).not.toContain('readFile');
    expect(source).not.toContain('writeFile');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('download');
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
    expect(source).not.toContain('createClient');
    expect(source).not.toContain('createSubject');
  });
});
// #endregion
