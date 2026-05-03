/* ============================================
   FILE: gmail-metadata-normalizer.test.ts
   PURPOSE: Focused tests for pure Gmail metadata normalization into EmailIntakeMessageInput.
   DEPENDENCIES: Vitest, fs, gmail-metadata-normalizer
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { normalizeGmailMetadataToEmailInput, type GmailShapedMetadataMessage } from './gmail-metadata-normalizer';
// #endregion

// #region Constants
const sourceText = readFileSync(new URL('./gmail-metadata-normalizer.ts', import.meta.url), 'utf8');

const forbiddenSourceStrings = [
  'googleapis',
  'axios',
  'fetch',
  'oauth',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'createWorkItem',
  'MatterRecord',
  'DocumentRef',
];
// #endregion

// #region Fixtures
const baseMessage: GmailShapedMetadataMessage = {
  id: 'gmail-message-1',
  threadId: 'gmail-thread-1',
  snippet: 'Metadata preview only.',
  labelIds: ['INBOX', 'UNREAD'],
  labelNames: ['Inbox'],
  internalDate: '1777776000000',
  payload: {
    headers: [
      { name: 'From', value: 'sender@example.test' },
      { name: 'To', value: 'office@example.test, intake@example.test' },
      { name: 'Cc', value: 'reviewer@example.test' },
      { name: 'Bcc', value: '' },
      { name: 'Subject', value: 'Gmail metadata only' },
      { name: 'Date', value: 'Sun, 03 May 2026 10:00:00 +0300' },
    ],
  },
};

const attachmentMessage: GmailShapedMetadataMessage = {
  ...baseMessage,
  id: 'gmail-message-attachment',
  threadId: 'gmail-thread-attachment',
  payload: {
    headers: baseMessage.payload?.headers,
    parts: [
      {
        filename: 'source.pdf',
        mimeType: 'application/pdf',
        body: {
          attachmentId: 'attachment-1',
          size: 1200,
        },
      },
      {
        filename: '',
        mimeType: 'text/plain',
        body: {
          size: 10,
        },
      },
      {
        parts: [
          {
            filename: 'nested.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            body: {
              attachmentId: 'attachment-2',
              size: 2400,
            },
          },
        ],
      },
    ],
  },
};
// #endregion

// #region Tests
describe('normalizeGmailMetadataToEmailInput', () => {
  it('maps a normal Gmail-shaped metadata message into EmailIntakeMessageInput', () => {
    const result = normalizeGmailMetadataToEmailInput({
      accountEmail: 'office@example.test',
      mailbox: 'Primary Gmail',
      folder: 'Inbox',
      message: baseMessage,
    });

    expect(result.messageId).toBe('gmail-message-1');
    expect(result.threadId).toBe('gmail-thread-1');
    expect(result.provider).toBe('gmail');
    expect(result.accountEmail).toBe('office@example.test');
    expect(result.mailbox).toBe('Primary Gmail');
    expect(result.folder).toBe('Inbox');
    expect(result.label).toBe('Inbox');
    expect(result.labelIds).toEqual(['INBOX', 'UNREAD']);
    expect(result.labelNames).toEqual(['Inbox']);
    expect(result.systemFolder).toBe('inbox');
    expect(result.from).toBe('sender@example.test');
    expect(result.to).toEqual(['office@example.test', 'intake@example.test']);
    expect(result.cc).toEqual(['reviewer@example.test']);
    expect(result.bcc).toEqual([]);
    expect(result.subject).toBe('Gmail metadata only');
    expect(result.snippet).toBe('Metadata preview only.');
    expect(result.bodyPreview).toBe('Metadata preview only.');
    expect(result.receivedAt).toBe('2026-05-03T02:40:00.000Z');
    expect(result.sentAt).toBe(result.receivedAt);
    expect(result.hasAttachments).toBe(false);
    expect(result.attachments).toEqual([]);
    expect(result.isRead).toBe(false);
  });

  it('maps attachment metadata without modeling attachment content', () => {
    const result = normalizeGmailMetadataToEmailInput({
      accountEmail: 'office@example.test',
      message: attachmentMessage,
    });

    expect(result.hasAttachments).toBe(true);
    expect(result.attachments).toEqual([
      {
        attachmentId: 'attachment-1',
        fileName: 'source.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1200,
      },
      {
        attachmentId: 'attachment-2',
        fileName: 'nested.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        sizeBytes: 2400,
      },
    ]);
    expect(JSON.stringify(result)).not.toContain('attachmentData');
    expect(JSON.stringify(result)).not.toContain('contentBytes');
  });

  it('handles missing subject safely', () => {
    const result = normalizeGmailMetadataToEmailInput({
      accountEmail: 'office@example.test',
      message: {
        ...baseMessage,
        payload: {
          headers: baseMessage.payload?.headers?.filter((header) => header.name !== 'Subject'),
        },
      },
    });

    expect(result.subject).toBe('');
    expect(result.threadId).toBe('gmail-thread-1');
    expect(result.receivedAt).toBe('2026-05-03T02:40:00.000Z');
  });

  it('does not emit raw message body or raw MIME fields', () => {
    const result = normalizeGmailMetadataToEmailInput({
      accountEmail: 'office@example.test',
      message: attachmentMessage,
    });
    const outputKeys = JSON.stringify(result);

    expect(outputKeys).not.toContain('bodyHtml');
    expect(outputKeys).not.toContain('bodyText');
    expect(outputKeys).not.toContain('rawMime');
    expect(outputKeys).not.toContain('mimePayload');
    expect(outputKeys).not.toContain('payload');
    expect(outputKeys).not.toContain('parts');
  });

  it('keeps the source free of live provider, storage, and operational creation strings', () => {
    for (const forbidden of forbiddenSourceStrings) {
      expect(sourceText).not.toContain(forbidden);
    }
  });
});
// #endregion
