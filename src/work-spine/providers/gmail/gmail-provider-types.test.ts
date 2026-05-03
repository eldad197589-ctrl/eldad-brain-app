/* ============================================
   FILE: gmail-provider-types.test.ts
   PURPOSE: Boundary tests for Gmail inbound metadata-only type contracts.
   DEPENDENCIES: Vitest, fs, gmail-provider-types
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type {
  GmailAccountMetadata,
  GmailAttachmentMetadata,
  GmailInboundFailureReason,
  GmailMessageMetadata,
  GmailMetadataReadResult,
  GmailProviderKind,
  GmailThreadMetadata,
} from './gmail-provider-types';
// #endregion

// #region Constants
const sourceText = readFileSync(new URL('./gmail-provider-types.ts', import.meta.url), 'utf8');

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
const provider: GmailProviderKind = 'gmail';

const account: GmailAccountMetadata = {
  provider,
  sourceType: 'email',
  providerAccountId: 'mock-gmail-account',
  accountEmail: 'mock-office@example.test',
  userId: 'user-1',
  officeWorkspaceId: 'office-1',
};

const attachment: GmailAttachmentMetadata = {
  attachmentId: 'attachment-1',
  fileName: 'source.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 100,
};

const message: GmailMessageMetadata = {
  provider,
  sourceType: 'email',
  messageId: 'message-1',
  threadId: 'thread-1',
  from: 'sender@example.test',
  to: ['mock-office@example.test'],
  cc: [],
  bcc: [],
  subject: 'Metadata only',
  receivedAt: '2026-05-02T20:00:00.000Z',
  snippet: 'Short metadata preview only.',
  labelIds: ['INBOX'],
  labelNames: ['Inbox'],
  attachments: [attachment],
};

const thread: GmailThreadMetadata = {
  provider,
  sourceType: 'email',
  threadId: 'thread-1',
  messageIds: ['message-1'],
  lastMessageReceivedAt: '2026-05-02T20:00:00.000Z',
};

const result: GmailMetadataReadResult = {
  provider,
  sourceType: 'email',
  account,
  runId: 'run-1',
  readonlyScope: 'https://www.googleapis.com/auth/gmail.readonly',
  messages: [message],
  threads: [thread],
  cursor: {
    maxResults: 50,
    pageCount: 1,
    reachedEnd: true,
  },
};
// #endregion

// #region Tests
describe('Gmail inbound provider metadata types', () => {
  it('models Gmail as provider metadata with email sourceType output', () => {
    expect(provider).toBe('gmail');
    expect(account.provider).toBe('gmail');
    expect(account.sourceType).toBe('email');
    expect(message.provider).toBe('gmail');
    expect(message.sourceType).toBe('email');
    expect(result.provider).toBe('gmail');
    expect(result.sourceType).toBe('email');
  });

  it('models message, thread, and attachment metadata without attachment data fields', () => {
    expect(message.messageId).toBe('message-1');
    expect(message.threadId).toBe('thread-1');
    expect(message.attachments).toEqual([attachment]);
    expect(thread.messageIds).toEqual(['message-1']);
    expect(Object.keys(attachment)).toEqual(['attachmentId', 'fileName', 'mimeType', 'sizeBytes']);
    expect(Object.keys(message)).not.toContain('attachmentData');
    expect(Object.keys(message)).not.toContain('payload');
  });

  it('does not model raw message body or raw MIME fields', () => {
    const messageKeys = Object.keys(message);

    expect(messageKeys).not.toContain('body');
    expect(messageKeys).not.toContain('bodyHtml');
    expect(messageKeys).not.toContain('bodyText');
    expect(messageKeys).not.toContain('raw');
    expect(messageKeys).not.toContain('rawMime');
    expect(messageKeys).not.toContain('mimePayload');
  });

  it('models pagination and failure states without runtime behavior', () => {
    const failures = [
      'expired_credential',
      'revoked_credential',
      'wrong_account',
      'scope_mismatch',
      'provider_unavailable',
      'partial_failure',
      'disabled_by_policy',
    ] satisfies GmailInboundFailureReason[];

    expect(result.cursor.maxResults).toBe(50);
    expect(result.cursor.reachedEnd).toBe(true);
    expect(failures).toContain('scope_mismatch');
  });

  it('keeps the source type file free of live provider, storage, and operational creation strings', () => {
    for (const forbidden of forbiddenSourceStrings) {
      expect(sourceText).not.toContain(forbidden);
    }
    expect(sourceText).not.toContain('body:');
    expect(sourceText).not.toContain('rawMime');
    expect(sourceText).not.toContain('mimePayload');
    expect(sourceText).not.toContain('attachmentData');
  });
});
// #endregion
