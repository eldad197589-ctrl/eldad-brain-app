/* ============================================
   FILE: email-to-unified-intake.test.ts
   PURPOSE: Focused tests for the pure email-to-unified intake mapper.
   DEPENDENCIES: vitest, email-to-unified-intake
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { EmailIntakeMessageInput } from './email-to-unified-intake';
import { createUnifiedIntakeFromEmailMessages } from './email-to-unified-intake';
// #endregion

// #region Test Data
const projectRoot = 'C:/Users/1/OneDrive/שולחן העבודה/אלדד/גרוויטי תקיות/המוח של אלדד/brain-app';

const createMessage = (overrides: Partial<EmailIntakeMessageInput> = {}): EmailIntakeMessageInput => ({
  messageId: 'message-1',
  threadId: 'thread-1',
  provider: 'gmail',
  accountEmail: 'office@example.test',
  mailbox: 'Primary',
  folder: 'Inbox',
  label: 'Client/Review',
  labelIds: ['INBOX', 'Label_1'],
  labelNames: ['Inbox', 'Client/Review'],
  systemFolder: 'inbox',
  from: 'client@example.test',
  to: ['office@example.test'],
  cc: ['bookkeeper@example.test'],
  bcc: [],
  subject: 'מסמכים לבדיקה',
  snippet: 'מצורפים מסמכים',
  bodyPreview: 'שלום, מצורפים מסמכים לבדיקה.',
  receivedAt: '2026-04-29T00:00:00.000Z',
  sentAt: '2026-04-28T23:59:00.000Z',
  hasAttachments: true,
  attachments: [
    {
      attachmentId: 'attachment-1',
      fileName: 'invoice.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1234,
    },
    {
      fileName: 'missing-id.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 4321,
    },
  ],
  isRead: false,
  isStarred: true,
  isImportant: true,
  ...overrides,
});
// #endregion

// #region Tests
describe('createUnifiedIntakeFromEmailMessages', () => {
  it('maps one email message to one unified candidate', () => {
    const result = createUnifiedIntakeFromEmailMessages([createMessage()]);

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]).toMatchObject({
      sourceType: 'email',
      sourceId: 'message-1',
      sourceLabel: 'מסמכים לבדיקה',
      candidateStatus: 'staging_candidate',
      professionalStatus: 'not_reviewed',
      matterResolutionStatus: 'unresolved',
      subjectResolutionStatus: 'unresolved',
    });
  });

  it('maps message metadata to email_message evidence', () => {
    const result = createUnifiedIntakeFromEmailMessages([createMessage()]);
    const messageEvidence = result.evidenceRefs.find((evidence) => evidence.evidenceKind === 'email_message');

    expect(messageEvidence).toMatchObject({
      sourceType: 'email',
      evidenceKind: 'email_message',
      title: 'מסמכים לבדיקה',
      messageId: 'message-1',
      ocrStatus: 'not_processed',
      classificationStatus: 'not_classified',
      reviewStatus: 'not_reviewed',
    });
    expect(messageEvidence?.sourceCandidateId).toBe(result.candidates[0]?.candidateId);
  });

  it('maps attachments to email_attachment evidence without creating DocumentRef', () => {
    const result = createUnifiedIntakeFromEmailMessages([createMessage()]);
    const attachmentEvidence = result.evidenceRefs.filter((evidence) => evidence.evidenceKind === 'email_attachment');

    expect(attachmentEvidence).toHaveLength(2);
    expect(attachmentEvidence[0]).toMatchObject({
      sourceType: 'email',
      evidenceKind: 'email_attachment',
      title: 'invoice.pdf',
      fileName: 'invoice.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1234,
      messageId: 'message-1',
      ocrStatus: 'not_processed',
      classificationStatus: 'not_classified',
      reviewStatus: 'not_reviewed',
    });
    expect((attachmentEvidence[0] as unknown as Record<string, unknown>).documentRefId).toBeUndefined();
  });

  it('supports folders, labels, systemFolder, threadId, messageId, and read/starred/important as metadata only', () => {
    const result = createUnifiedIntakeFromEmailMessages([createMessage()]);
    const metadata = result.candidates[0]?.sourceMetadata;

    expect(metadata).toMatchObject({
      provider: 'gmail',
      accountEmail: 'office@example.test',
      mailbox: 'Primary',
      folder: 'Inbox',
      label: 'Client/Review',
      systemFolder: 'inbox',
      threadId: 'thread-1',
      messageId: 'message-1',
      isRead: false,
      isStarred: true,
      isImportant: true,
    });
    expect(metadata?.labelIds).toEqual(['INBOX', 'Label_1']);
    expect(metadata?.labelNames).toEqual(['Inbox', 'Client/Review']);
    expect((result.candidates[0] as unknown as Record<string, unknown>).priority).toBeUndefined();
    expect((result.candidates[0] as unknown as Record<string, unknown>).taskId).toBeUndefined();
    expect((result.candidates[0] as unknown as Record<string, unknown>).matterId).toBeUndefined();
  });

  it('keeps suggestedContext low confidence and unconfirmed', () => {
    const result = createUnifiedIntakeFromEmailMessages([createMessage()]);

    expect(result.candidates[0]?.suggestedContext).toEqual([
      { label: 'מסמכים לבדיקה', source: 'email_subject', confidence: 'low', isConfirmed: false },
      { label: 'client@example.test', source: 'email_from', confidence: 'low', isConfirmed: false },
      { label: 'thread-1', source: 'email_thread', confidence: 'low', isConfirmed: false },
      { label: 'Inbox', source: 'email_folder', confidence: 'low', isConfirmed: false },
      { label: 'Inbox, Client/Review', source: 'email_label', confidence: 'low', isConfirmed: false },
    ]);
  });

  it('generates deterministic ids across repeated runs', () => {
    const input = [createMessage()];
    const first = createUnifiedIntakeFromEmailMessages(input);
    const second = createUnifiedIntakeFromEmailMessages(input);

    expect(first.candidates.map((candidate) => candidate.candidateId)).toEqual(
      second.candidates.map((candidate) => candidate.candidateId)
    );
    expect(first.evidenceRefs.map((evidence) => evidence.evidenceId)).toEqual(
      second.evidenceRefs.map((evidence) => evidence.evidenceId)
    );
    expect(first.candidates[0]?.candidateId).toMatch(/^unified-email-candidate-/);
    expect(first.evidenceRefs[0]?.evidenceId).toMatch(/^unified-email-message-evidence-/);
  });

  it('does not mutate input', () => {
    const input = [createMessage()];
    const before = JSON.stringify(input);

    createUnifiedIntakeFromEmailMessages(input);

    expect(JSON.stringify(input)).toBe(before);
  });

  it('reports diagnostics, warnings, and skipped invalid messages', () => {
    const result = createUnifiedIntakeFromEmailMessages([
      createMessage({
        subject: '',
        from: '',
        hasAttachments: true,
        attachments: [],
        labelIds: ['Label_1'],
        labelNames: [],
      }),
      createMessage({ messageId: undefined }),
      createMessage({ messageId: 'message-3', accountEmail: undefined }),
    ]);

    expect(result.diagnostics).toMatchObject({
      candidateCount: 1,
      evidenceCount: 1,
      attachmentCount: 0,
    });
    expect(result.diagnostics.warnings.map((warning) => warning.warningCode)).toEqual([
      'missing_subject',
      'missing_sender',
      'attachments_declared_but_empty',
      'incomplete_label_metadata',
    ]);
    expect(result.diagnostics.skippedItems).toEqual([
      { sourceId: 'thread-1', reason: 'missing_message_id' },
      { sourceId: 'message-3', reason: 'missing_account_email' },
    ]);
    expect(result.diagnostics.errors).toEqual([
      { sourceId: 'thread-1', message: 'Email metadata is missing messageId.' },
      { sourceId: 'message-3', message: 'Email metadata is missing accountEmail.' },
    ]);
  });

  it('warns on attachment missing attachmentId but still maps with deterministic fallback metadata', () => {
    const result = createUnifiedIntakeFromEmailMessages([createMessage()]);

    expect(result.diagnostics.warnings.map((warning) => warning.warningCode)).toEqual(['missing_attachment_id']);
    expect(result.candidates[0]?.sourceMetadata.attachmentRefs).toHaveLength(2);
    expect(result.candidates[0]?.sourceMetadata.attachmentRefs[1]?.attachmentId).toMatch(/^missing-attachment-id-/);
  });

  it('keeps source free of mail connectors, persistence, stores, APIs, and professional creation helpers', () => {
    const source = readFileSync(`${projectRoot}/src/work-spine/intake/email-to-unified-intake.ts`, 'utf8');

    expect(source).not.toMatch(/from\s+['"][^'"]*gmail/i);
    expect(source).not.toMatch(/gmail\./i);
    expect(source).not.toMatch(/outlook\./i);
    expect(source).not.toContain('googleapis');
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
    expect(source).not.toContain('sendEmail');
    expect(source).not.toContain('deleteEmail');
    expect(source).not.toContain('archiveEmail');
  });
});
// #endregion
