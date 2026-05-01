/* ============================================
   FILE: client-portal-to-unified-intake.test.ts
   PURPOSE: Focused tests for the pure client portal-to-unified intake mapper.
   DEPENDENCIES: vitest, client-portal-to-unified-intake
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ClientPortalIntakeUploadInput } from './client-portal-to-unified-intake';
import { createUnifiedIntakeFromClientPortalUploads } from './client-portal-to-unified-intake';
// #endregion

// #region Test Data
const projectRoot = 'C:/Users/1/OneDrive/שולחן העבודה/אלדד/גרוויטי תקיות/המוח של אלדד/brain-app';

const createPortalUpload = (overrides: Partial<ClientPortalIntakeUploadInput> = {}): ClientPortalIntakeUploadInput => ({
  portalUploadId: 'portal-upload-1',
  clientProvidedLabel: 'חשבונית לקוח',
  uploaderIdentityClaim: 'client@example.test',
  uploadedAt: '2026-04-29T00:00:00.000Z',
  fileName: 'invoice.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 2048,
  portalFolder: 'מסמכים',
  portalPath: '/portal/client/documents/invoice.pdf',
  declaredClientName: 'לקוח לדוגמה',
  declaredClientId: 'declared-client-1',
  declaredMatterLabel: 'מע״מ 2026',
  uploadedByEmail: 'client@example.test',
  notes: 'הועלה דרך אזור אישי',
  sourcePortalName: 'client-area',
  ...overrides,
});
// #endregion

// #region Tests
describe('createUnifiedIntakeFromClientPortalUploads', () => {
  it('maps portal upload to unified candidate', () => {
    const result = createUnifiedIntakeFromClientPortalUploads([createPortalUpload()]);

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]).toMatchObject({
      sourceType: 'client_portal',
      sourceId: 'portal-upload-1',
      sourceLabel: 'חשבונית לקוח',
      candidateStatus: 'staging_candidate',
      professionalStatus: 'not_reviewed',
      matterResolutionStatus: 'unresolved',
      subjectResolutionStatus: 'unresolved',
    });
    expect(result.candidates[0]?.sourceMetadata).toEqual({
      sourceType: 'client_portal',
      portalUploadId: 'portal-upload-1',
      clientProvidedLabel: 'חשבונית לקוח',
      uploaderIdentityClaim: 'client@example.test',
      uploadedAt: '2026-04-29T00:00:00.000Z',
    });
  });

  it('maps portal file to portal_upload evidence', () => {
    const result = createUnifiedIntakeFromClientPortalUploads([createPortalUpload()]);

    expect(result.evidenceRefs).toHaveLength(1);
    expect(result.evidenceRefs[0]).toMatchObject({
      sourceType: 'client_portal',
      evidenceKind: 'portal_upload',
      title: 'invoice.pdf',
      fileName: 'invoice.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 2048,
      portalUploadId: 'portal-upload-1',
      ocrStatus: 'not_processed',
      classificationStatus: 'not_classified',
      reviewStatus: 'not_reviewed',
    });
    expect(result.evidenceRefs[0]?.sourceCandidateId).toBe(result.candidates[0]?.candidateId);
  });

  it('keeps client-provided labels and declared client or matter fields as low-confidence unconfirmed hints', () => {
    const result = createUnifiedIntakeFromClientPortalUploads([createPortalUpload()]);
    const candidate = result.candidates[0];

    expect(candidate?.suggestedContext).toEqual([
      { label: 'חשבונית לקוח', source: 'client_portal_label', confidence: 'low', isConfirmed: false },
      { label: 'client@example.test', source: 'portal_uploader_identity_claim', confidence: 'low', isConfirmed: false },
      { label: 'לקוח לדוגמה', source: 'portal_declared_client_name', confidence: 'low', isConfirmed: false },
      { label: 'declared-client-1', source: 'portal_declared_client_id', confidence: 'low', isConfirmed: false },
      { label: 'מע״מ 2026', source: 'portal_declared_matter_label', confidence: 'low', isConfirmed: false },
      { label: 'מסמכים', source: 'portal_folder', confidence: 'low', isConfirmed: false },
      { label: '/portal/client/documents/invoice.pdf', source: 'portal_path', confidence: 'low', isConfirmed: false },
      { label: 'client@example.test', source: 'portal_uploaded_by_email', confidence: 'low', isConfirmed: false },
      { label: 'הועלה דרך אזור אישי', source: 'portal_notes', confidence: 'low', isConfirmed: false },
      { label: 'client-area', source: 'portal_source_name', confidence: 'low', isConfirmed: false },
    ]);
    expect((candidate as unknown as Record<string, unknown>).clientId).toBeUndefined();
    expect((candidate as unknown as Record<string, unknown>).matterId).toBeUndefined();
    expect((candidate as unknown as Record<string, unknown>).documentType).toBeUndefined();
  });

  it('keeps statuses locked to not reviewed and unresolved', () => {
    const result = createUnifiedIntakeFromClientPortalUploads([createPortalUpload()]);
    const candidate = result.candidates[0];

    expect(candidate?.professionalStatus).toBe('not_reviewed');
    expect(candidate?.matterResolutionStatus).toBe('unresolved');
    expect(candidate?.subjectResolutionStatus).toBe('unresolved');
  });

  it('keeps evidence unprocessed, unclassified, and not reviewed', () => {
    const result = createUnifiedIntakeFromClientPortalUploads([createPortalUpload()]);

    expect(result.evidenceRefs[0]).toMatchObject({
      ocrStatus: 'not_processed',
      classificationStatus: 'not_classified',
      reviewStatus: 'not_reviewed',
    });
  });

  it('generates deterministic ids across repeated runs', () => {
    const input = [createPortalUpload()];
    const first = createUnifiedIntakeFromClientPortalUploads(input);
    const second = createUnifiedIntakeFromClientPortalUploads(input);

    expect(first.candidates.map((candidate) => candidate.candidateId)).toEqual(
      second.candidates.map((candidate) => candidate.candidateId)
    );
    expect(first.evidenceRefs.map((evidence) => evidence.evidenceId)).toEqual(
      second.evidenceRefs.map((evidence) => evidence.evidenceId)
    );
    expect(first.candidates[0]?.candidateId).toMatch(/^unified-client-portal-candidate-/);
    expect(first.evidenceRefs[0]?.evidenceId).toMatch(/^unified-client-portal-evidence-/);
  });

  it('does not mutate input', () => {
    const input = [createPortalUpload()];
    const before = JSON.stringify(input);

    createUnifiedIntakeFromClientPortalUploads(input);

    expect(JSON.stringify(input)).toBe(before);
  });

  it('skips invalid uploads and reports diagnostics', () => {
    const result = createUnifiedIntakeFromClientPortalUploads([
      createPortalUpload({
        uploadedAt: '',
        uploaderIdentityClaim: '',
        declaredClientName: '',
        declaredClientId: '',
        mimeType: '',
      }),
      createPortalUpload({
        portalUploadId: undefined,
        fileName: 'missing-id.pdf',
      }),
      createPortalUpload({
        portalUploadId: 'missing-file-name',
        fileName: '',
      }),
    ]);

    expect(result.diagnostics).toMatchObject({
      candidateCount: 1,
      evidenceCount: 1,
      uploadCount: 3,
    });
    expect(result.diagnostics.warnings.map((warning) => warning.warningCode)).toEqual([
      'missing_uploaded_at',
      'missing_uploader_identity_claim',
      'missing_declared_client_info',
      'missing_mime_type',
    ]);
    expect(result.diagnostics.skippedItems).toEqual([
      { sourceId: 'missing-id.pdf', reason: 'missing_portal_upload_id' },
      { sourceId: 'missing-file-name', reason: 'missing_file_name' },
    ]);
    expect(result.diagnostics.errors).toEqual([
      {
        sourceId: 'missing-id.pdf',
        message: 'Client portal upload metadata is missing portalUploadId.',
      },
      {
        sourceId: 'missing-file-name',
        message: 'Client portal upload metadata is missing fileName.',
      },
    ]);
  });

  it('keeps source free of external portal connectors, stores, persistence, and professional creation helpers', () => {
    const source = readFileSync(`${projectRoot}/src/work-spine/intake/client-portal-to-unified-intake.ts`, 'utf8');

    expect(source).not.toMatch(/portal\s*api/i);
    expect(source).not.toMatch(/auth/i);
    expect(source).not.toContain('fetch(');
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
    expect(source).not.toContain('download');
  });
});
// #endregion
