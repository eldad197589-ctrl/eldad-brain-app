/* ============================================
   FILE: mock-gmail-data.ts
   PURPOSE: Static mock Gmail messages for Unified Intake preview.
   DEPENDENCIES: mock-gmail-drive-types
   EXPORTS: MOCK_GMAIL_CONNECTOR_STATUS, MOCK_GMAIL_MESSAGES
   ============================================ */

// #region Imports
import type { MockConnectorStatus, MockGmailMessage } from './mock-gmail-drive-types';
// #endregion

// #region Static Data
export const MOCK_GMAIL_CONNECTOR_STATUS: MockConnectorStatus = {
  connectorName: 'Gmail',
  mode: 'mock_only',
  liveStatus: 'live_disabled',
  credentialStatus: 'OAuth disabled',
  safetyLabel: 'candidate_and_evidence_only',
};

export const MOCK_GMAIL_MESSAGES: readonly MockGmailMessage[] = [
  {
    messageId: 'mock-gmail-message-dima-1',
    threadId: 'mock-gmail-thread-dima-1',
    accountEmail: 'mock-office@example.test',
    mailbox: 'Mock Inbox',
    folder: 'Inbox',
    labelIds: ['mock-label-intake'],
    labelNames: ['Mock Intake'],
    from: 'mock-dima@example.test',
    to: ['mock-office@example.test'],
    subject: 'Mock Dima war-compensation material',
    snippet: 'Mock message only for Unified Intake candidate preview.',
    receivedAt: '2026-04-21T09:00:00.000Z',
    sentAt: '2026-04-21T08:55:00.000Z',
    attachments: [
      {
        attachmentId: 'mock-gmail-attachment-dima-appeal',
        fileName: 'mock-dima-appeal-source.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 245000,
      },
    ],
    isRead: false,
    isStarred: false,
    isImportant: true,
  },
  {
    messageId: 'mock-gmail-message-vat-1',
    threadId: 'mock-gmail-thread-vat-1',
    accountEmail: 'mock-office@example.test',
    mailbox: 'Mock Inbox',
    folder: 'Inbox',
    labelIds: ['mock-label-vat'],
    labelNames: ['Mock VAT'],
    from: 'mock-vat-client@example.test',
    to: ['mock-office@example.test'],
    subject: 'Mock VAT reporting documents',
    snippet: 'Mock VAT process input for candidate-only mapping.',
    receivedAt: '2026-04-22T10:30:00.000Z',
    sentAt: '2026-04-22T10:28:00.000Z',
    attachments: [
      {
        attachmentId: 'mock-gmail-attachment-vat-bookkeeping',
        fileName: 'mock-vat-bookkeeping.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        sizeBytes: 98000,
      },
    ],
    isRead: true,
    isStarred: false,
    isImportant: false,
  },
];
// #endregion
