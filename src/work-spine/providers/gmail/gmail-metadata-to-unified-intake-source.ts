/* ============================================
   FILE: gmail-metadata-to-unified-intake-source.ts
   PURPOSE: Pure mapper from Gmail read-only metadata to Unified Intake source previews.
   DEPENDENCIES: Unified Intake source contracts and Gmail provider metadata contracts
   EXPORTS: Gmail metadata source mapper and locked local preview boundary flags
   ============================================ */

// #region Imports
import type {
  IntakeBoundaryFlags,
  IntakePayloadSummary,
  UnifiedIntakeSource,
} from '../../intake/unified-intake-source-types';
import type {
  GmailMessageMetadata,
  GmailProviderKind,
} from './gmail-provider-types';
// #endregion

// #region Types
/** Metadata-only Gmail source contract for Unified Intake source previews. */
export interface GmailUnifiedIntakeSourceMetadata {
  /** Provider identity metadata. */
  provider: GmailProviderKind;
  /** Gmail message id. */
  messageId: string;
  /** Gmail thread id. */
  threadId: string;
  /** Sender address or identity. */
  senderEmail: string;
  /** Recipient addresses or identities. */
  recipientEmails: readonly string[];
  /** Message subject metadata. */
  subject: string;
  /** Received timestamp metadata. */
  timestamp: string;
  /** Gmail labels as metadata only. */
  labels: readonly string[];
  /** Gmail snippet metadata. */
  snippet: string;
  /** Whether Gmail reported attachment metadata. */
  hasAttachments: boolean;
  /** Attachment metadata count only. */
  attachmentCount: number;
}

/** Input for mapping Gmail read-only metadata into a Unified Intake source preview. */
export interface GmailMetadataToUnifiedIntakeSourceInput {
  /** Gmail message metadata with no raw message payload or attachment bytes. */
  message: GmailUnifiedIntakeSourceMetadata;
}
// #endregion

// #region Constants
/** Locked local-only boundary flags for Gmail metadata source previews. */
export const GMAIL_UNIFIED_INTAKE_BOUNDARY_FLAGS: IntakeBoundaryFlags = {
  allowedMode: 'local_preview_only',
  canCreateWorkItem: false,
  canCreateMatter: false,
  canCreateDocumentRef: false,
  requiresEldadApproval: true,
  operationalActionBlocked: true,
};
// #endregion

// #region Helpers
const getSenderIdentity = (
  message: GmailUnifiedIntakeSourceMetadata,
): string => {
  const sender = message.senderEmail.trim();
  return sender.length > 0 ? sender : 'unknown_sender';
};

const getSubjectOrFallback = (
  message: GmailUnifiedIntakeSourceMetadata,
): string => {
  const subject = message.subject.trim();
  return subject.length > 0 ? subject : `gmail-message-${message.messageId}`;
};

const createPayloadSummary = (
  message: GmailUnifiedIntakeSourceMetadata,
): IntakePayloadSummary => ({
  fileType: 'email/metadata',
  snippet: message.snippet,
  attachmentCount: message.attachmentCount,
});
// #endregion

// #region Mapper
/**
 * Converts the existing Gmail message metadata contract into the compact source metadata shape.
 */
export const normalizeGmailMessageMetadataForUnifiedIntakeSource = (
  message: GmailMessageMetadata,
): GmailUnifiedIntakeSourceMetadata => ({
  provider: message.provider,
  messageId: message.messageId,
  threadId: message.threadId,
  senderEmail: message.from,
  recipientEmails: message.to,
  subject: message.subject,
  timestamp: message.receivedAt,
  labels: message.labelNames.length > 0 ? message.labelNames : message.labelIds,
  snippet: message.snippet,
  hasAttachments: message.attachments.length > 0,
  attachmentCount: message.attachments.length,
});

/**
 * Maps safe Gmail read-only metadata into the committed Unified Intake source model.
 */
export const mapGmailMetadataToUnifiedIntakeSource = ({
  message,
}: GmailMetadataToUnifiedIntakeSourceInput): UnifiedIntakeSource => ({
  sourceId: `gmail:${message.messageId}`,
  sourceType: 'email',
  senderIdentity: getSenderIdentity(message),
  timestamp: message.timestamp,
  subjectOrFilename: getSubjectOrFallback(message),
  payloadSummary: createPayloadSummary(message),
  boundaryFlags: GMAIL_UNIFIED_INTAKE_BOUNDARY_FLAGS,
});
// #endregion
