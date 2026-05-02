/* ============================================
   FILE: mock-email-data.ts
   PURPOSE: Static mock email messages for Unified Intake preview.
   DEPENDENCIES: mock-email-drive-types
   EXPORTS: MOCK_EMAIL_CONNECTOR_STATUS, MOCK_EMAIL_MESSAGES
   ============================================ */

// #region Imports
import type { MockConnectorStatus, MockEmailMessage } from './mock-email-drive-types';
// #endregion

// #region Static Data
export const MOCK_EMAIL_CONNECTOR_STATUS: MockConnectorStatus = {
  connectorName: 'Email',
  emailProvider: 'gmail',
  mode: 'mock_only',
  liveStatus: 'live_disabled',
  credentialStatus: 'OAuth disabled',
  safetyLabel: 'candidate_and_evidence_only',
};

export const MOCK_EMAIL_MESSAGES: readonly MockEmailMessage[] = [
  {
    messageId: 'mock-email-message-dima-1',
    threadId: 'mock-email-thread-dima-1',
    provider: 'gmail',
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
        attachmentId: 'mock-email-attachment-dima-appeal',
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
    messageId: 'mock-email-message-vat-1',
    threadId: 'mock-email-thread-vat-1',
    provider: 'gmail',
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
        attachmentId: 'mock-email-attachment-vat-bookkeeping',
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
