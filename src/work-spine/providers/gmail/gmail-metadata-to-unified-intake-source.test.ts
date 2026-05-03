/* ============================================
   FILE: gmail-metadata-to-unified-intake-source.test.ts
   PURPOSE: Boundary tests for Gmail metadata to Unified Intake source mapping.
   DEPENDENCIES: Vitest, static Gmail mock, and Stage 5A mapper
   EXPORTS: None
   ============================================ */

// #region Imports
import { describe, expect, it } from 'vitest';
import { MOCK_GMAIL_METADATA_SOURCE_MESSAGE } from './gmail-metadata-source-mock';
import {
  GMAIL_UNIFIED_INTAKE_BOUNDARY_FLAGS,
  mapGmailMetadataToUnifiedIntakeSource,
  normalizeGmailMessageMetadataForUnifiedIntakeSource,
} from './gmail-metadata-to-unified-intake-source';
// #endregion

// #region Test Constants
const FORBIDDEN_METADATA_FIELDS = [
  'body',
  'content',
  'rawMime',
  'base64',
  'buffer',
  'downloadUrl',
  'attachmentContent',
] as const;
// #endregion

// #region Tests
describe('mapGmailMetadataToUnifiedIntakeSource', () => {
  it('maps static Gmail metadata into a Unified Intake email source', () => {
    const source = mapGmailMetadataToUnifiedIntakeSource({
      message: MOCK_GMAIL_METADATA_SOURCE_MESSAGE,
    });

    expect(source.sourceType).toBe('email');
    expect(source.sourceId).toBe('gmail:gmail-stage5a-message-001');
    expect(source.senderIdentity).toBe('client@example.com');
    expect(source.timestamp).toBe('2026-05-03T09:30:00.000Z');
    expect(source.subjectOrFilename).toBe('VAT metadata question');
    expect(source.payloadSummary).toEqual({
      fileType: 'email/metadata',
      snippet: 'Metadata-only Gmail source preview for Unified Intake.',
      attachmentCount: 1,
    });
  });

  it('locks source boundary flags to local preview only', () => {
    const source = mapGmailMetadataToUnifiedIntakeSource({
      message: MOCK_GMAIL_METADATA_SOURCE_MESSAGE,
    });

    expect(source.boundaryFlags).toEqual(GMAIL_UNIFIED_INTAKE_BOUNDARY_FLAGS);
    expect(source.boundaryFlags.allowedMode).toBe('local_preview_only');
    expect(source.boundaryFlags.canCreateWorkItem).toBe(false);
    expect(source.boundaryFlags.canCreateMatter).toBe(false);
    expect(source.boundaryFlags.canCreateDocumentRef).toBe(false);
    expect(source.boundaryFlags.requiresEldadApproval).toBe(true);
    expect(source.boundaryFlags.operationalActionBlocked).toBe(true);
  });

  it('preserves allowed Gmail metadata without modeling forbidden payload fields', () => {
    expect(MOCK_GMAIL_METADATA_SOURCE_MESSAGE.provider).toBe('gmail');
    expect(MOCK_GMAIL_METADATA_SOURCE_MESSAGE.messageId).toBe(
      'gmail-stage5a-message-001',
    );
    expect(MOCK_GMAIL_METADATA_SOURCE_MESSAGE.threadId).toBe(
      'gmail-stage5a-thread-001',
    );
    expect(MOCK_GMAIL_METADATA_SOURCE_MESSAGE.senderEmail).toBe(
      'client@example.com',
    );
    expect(MOCK_GMAIL_METADATA_SOURCE_MESSAGE.recipientEmails).toEqual([
      'office@example.com',
    ]);
    expect(MOCK_GMAIL_METADATA_SOURCE_MESSAGE.labels).toContain('Inbox');
    expect(MOCK_GMAIL_METADATA_SOURCE_MESSAGE.hasAttachments).toBe(true);
    expect(MOCK_GMAIL_METADATA_SOURCE_MESSAGE.attachmentCount).toBe(1);

    const serializedMock = JSON.stringify(MOCK_GMAIL_METADATA_SOURCE_MESSAGE);
    const serializedSource = JSON.stringify(
      mapGmailMetadataToUnifiedIntakeSource({
        message: MOCK_GMAIL_METADATA_SOURCE_MESSAGE,
      }),
    );

    for (const field of FORBIDDEN_METADATA_FIELDS) {
      expect(serializedMock).not.toContain(field);
      expect(serializedSource).not.toContain(field);
    }
  });

  it('normalizes the existing Gmail message metadata contract into the source metadata contract', () => {
    const metadata = normalizeGmailMessageMetadataForUnifiedIntakeSource({
      provider: 'gmail',
      sourceType: 'email',
      messageId: 'gmail-existing-message-001',
      threadId: 'gmail-existing-thread-001',
      from: 'sender@example.com',
      to: ['team@example.com'],
      cc: [],
      bcc: [],
      subject: 'Existing Gmail metadata',
      receivedAt: '2026-05-03T10:15:00.000Z',
      snippet: 'Existing metadata only.',
      labelIds: ['CATEGORY_UPDATES'],
      labelNames: ['Updates'],
      attachments: [
        {
          attachmentId: 'attachment-001',
          fileName: 'metadata.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1024,
        },
      ],
    });

    expect(metadata).toEqual({
      provider: 'gmail',
      messageId: 'gmail-existing-message-001',
      threadId: 'gmail-existing-thread-001',
      senderEmail: 'sender@example.com',
      recipientEmails: ['team@example.com'],
      subject: 'Existing Gmail metadata',
      timestamp: '2026-05-03T10:15:00.000Z',
      labels: ['Updates'],
      snippet: 'Existing metadata only.',
      hasAttachments: true,
      attachmentCount: 1,
    });
  });
});
// #endregion
