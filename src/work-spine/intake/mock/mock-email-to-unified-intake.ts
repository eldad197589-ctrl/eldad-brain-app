/* ============================================
   FILE: mock-email-to-unified-intake.ts
   PURPOSE: Pure mock email mapper into Unified Intake candidates and evidence refs.
   DEPENDENCIES: email-to-unified-intake, mock-email-data, mock-email-drive-types
   EXPORTS: createUnifiedIntakeFromMockEmailMessages, MOCK_EMAIL_UNIFIED_INTAKE_OUTPUT
   ============================================ */

// #region Imports
import type { EmailIntakeMessageInput } from '../email-to-unified-intake';
import { createUnifiedIntakeFromEmailMessages } from '../email-to-unified-intake';
import type { EmailSourceMetadata } from '../unified-intake-registry';
import { MOCK_EMAIL_MESSAGES } from './mock-email-data';
import type { MockEmailMessage, MockUnifiedIntakeOutput } from './mock-email-drive-types';
// #endregion

// #region Helpers
const toEmailIntakeInput = (message: MockEmailMessage): EmailIntakeMessageInput => ({
  messageId: message.messageId,
  threadId: message.threadId,
  provider: message.provider,
  accountEmail: message.accountEmail,
  mailbox: message.mailbox,
  folder: message.folder,
  label: message.labelNames.join(', ') || 'Mock Email',
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
 * Maps static mock email messages into Unified Intake candidates and evidence refs only.
 *
 * This mapper is in-memory and does not connect to email providers, request credentials, persist, or create operational records.
 */
export function createUnifiedIntakeFromMockEmailMessages(
  messages: readonly MockEmailMessage[] = MOCK_EMAIL_MESSAGES,
): MockUnifiedIntakeOutput<EmailSourceMetadata> {
  const result = createUnifiedIntakeFromEmailMessages(messages.map(toEmailIntakeInput));

  return {
    candidates: result.candidates,
    evidenceRefs: result.evidenceRefs,
  };
}

export const MOCK_EMAIL_UNIFIED_INTAKE_OUTPUT = createUnifiedIntakeFromMockEmailMessages();
// #endregion
