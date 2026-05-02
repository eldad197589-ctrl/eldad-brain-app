/* ============================================
   FILE: mock-gmail-to-unified-intake.ts
   PURPOSE: Pure mock Gmail mapper into Unified Intake candidates and evidence refs.
   DEPENDENCIES: email-to-unified-intake, mock-gmail-data, mock-gmail-drive-types
   EXPORTS: createUnifiedIntakeFromMockGmailMessages, MOCK_GMAIL_UNIFIED_INTAKE_OUTPUT
   ============================================ */

// #region Imports
import type { EmailIntakeMessageInput } from '../email-to-unified-intake';
import { createUnifiedIntakeFromEmailMessages } from '../email-to-unified-intake';
import type { EmailSourceMetadata } from '../unified-intake-registry';
import { MOCK_GMAIL_MESSAGES } from './mock-gmail-data';
import type { MockGmailMessage, MockUnifiedIntakeOutput } from './mock-gmail-drive-types';
// #endregion

// #region Helpers
const toEmailIntakeInput = (message: MockGmailMessage): EmailIntakeMessageInput => ({
  messageId: message.messageId,
  threadId: message.threadId,
  provider: 'gmail',
  accountEmail: message.accountEmail,
  mailbox: message.mailbox,
  folder: message.folder,
  label: message.labelNames.join(', ') || 'Mock Gmail',
  labelIds: message.labelIds,
  labelNames: message.labelNames,
  systemFolder: 'inbox',
  from: message.from,
  to: message.to,
  cc: [],
  bcc: [],
  subject: message.subject,
  snippet: message.snippet,
  bodyPreview: message.snippet,
  receivedAt: message.receivedAt,
  sentAt: message.sentAt,
  hasAttachments: message.attachments.length > 0,
  attachments: message.attachments,
  isRead: message.isRead,
  isStarred: message.isStarred,
  isImportant: message.isImportant,
});
// #endregion

// #region Public API
/**
 * Maps static mock Gmail messages into Unified Intake candidates and evidence refs only.
 *
 * This mapper is in-memory and does not connect to Gmail, request credentials, persist, or create operational records.
 */
export function createUnifiedIntakeFromMockGmailMessages(
  messages: readonly MockGmailMessage[] = MOCK_GMAIL_MESSAGES,
): MockUnifiedIntakeOutput<EmailSourceMetadata> {
  const result = createUnifiedIntakeFromEmailMessages(messages.map(toEmailIntakeInput));

  return {
    candidates: result.candidates,
    evidenceRefs: result.evidenceRefs,
  };
}

export const MOCK_GMAIL_UNIFIED_INTAKE_OUTPUT = createUnifiedIntakeFromMockGmailMessages();
// #endregion
