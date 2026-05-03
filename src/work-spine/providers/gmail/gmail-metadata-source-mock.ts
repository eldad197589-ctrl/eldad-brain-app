/* ============================================
   FILE: gmail-metadata-source-mock.ts
   PURPOSE: Static Gmail metadata-only mock for Stage 5A Unified Intake mapping.
   DEPENDENCIES: Gmail provider metadata contracts
   EXPORTS: Static Gmail source metadata mock
   ============================================ */

// #region Imports
import type { GmailUnifiedIntakeSourceMetadata } from './gmail-metadata-to-unified-intake-source';
// #endregion

// #region Mock Data
/** Static Gmail metadata-only message for Stage 5A source mapping validation. */
export const MOCK_GMAIL_METADATA_SOURCE_MESSAGE: GmailUnifiedIntakeSourceMetadata = {
  provider: 'gmail',
  messageId: 'gmail-stage5a-message-001',
  threadId: 'gmail-stage5a-thread-001',
  senderEmail: 'client@example.com',
  recipientEmails: ['office@example.com'],
  subject: 'VAT metadata question',
  timestamp: '2026-05-03T09:30:00.000Z',
  snippet: 'Metadata-only Gmail source preview for Unified Intake.',
  labels: ['Inbox', 'Important'],
  hasAttachments: true,
  attachmentCount: 1,
};
// #endregion
