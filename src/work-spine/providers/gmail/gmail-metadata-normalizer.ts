/* ============================================
   FILE: gmail-metadata-normalizer.ts
   PURPOSE: Pure mapper from Gmail-shaped metadata payloads to EmailIntakeMessageInput.
   DEPENDENCIES: email-to-unified-intake input types, gmail-provider-types
   EXPORTS: normalizeGmailMetadataToEmailInput and supporting metadata input types
   ============================================ */

// #region Imports
import type { EmailIntakeAttachmentInput, EmailIntakeMessageInput } from '../../intake/email-to-unified-intake';
import type { GmailAttachmentMetadata } from './gmail-provider-types';
// #endregion

// #region Input Types
export interface GmailMetadataHeader {
  readonly name: string;
  readonly value: string;
}

export interface GmailAttachmentBodyMetadata {
  readonly attachmentId?: string;
  readonly size?: number;
}

export interface GmailMetadataPayloadPart {
  readonly filename?: string;
  readonly mimeType?: string;
  readonly body?: GmailAttachmentBodyMetadata;
  readonly parts?: readonly GmailMetadataPayloadPart[];
}

export interface GmailMetadataPayload {
  readonly headers?: readonly GmailMetadataHeader[];
  readonly parts?: readonly GmailMetadataPayloadPart[];
}

export interface GmailShapedMetadataMessage {
  readonly id?: string;
  readonly threadId?: string;
  readonly snippet?: string;
  readonly labelIds?: readonly string[];
  readonly labelNames?: readonly string[];
  readonly internalDate?: string;
  readonly payload?: GmailMetadataPayload;
}

export interface GmailMetadataNormalizerInput {
  readonly accountEmail: string;
  readonly mailbox?: string;
  readonly folder?: string;
  readonly message: GmailShapedMetadataMessage;
}
// #endregion

// #region Constants
const DEFAULT_MAILBOX = 'Gmail';
const DEFAULT_FOLDER = 'Inbox';
const FALLBACK_DATE = '1970-01-01T00:00:00.000Z';
// #endregion

// #region Helpers
const normalizeHeaderName = (name: string): string => name.trim().toLowerCase();

const getHeaderValue = (headers: readonly GmailMetadataHeader[] | undefined, name: string): string =>
  headers?.find((header) => normalizeHeaderName(header.name) === normalizeHeaderName(name))?.value.trim() ?? '';

const splitAddressList = (value: string): string[] =>
  value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

const toIsoDate = (value?: string): string => {
  if (!value) return FALLBACK_DATE;

  const numericValue = Number(value);
  const parsedDate = Number.isFinite(numericValue) ? new Date(numericValue) : new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? FALLBACK_DATE : parsedDate.toISOString();
};

const toSystemFolder = (labelIds: readonly string[]): EmailIntakeMessageInput['systemFolder'] => {
  if (labelIds.includes('SENT')) return 'sent';
  if (labelIds.includes('DRAFT')) return 'drafts';
  if (labelIds.includes('SPAM')) return 'spam';
  if (labelIds.includes('TRASH')) return 'trash';
  if (labelIds.includes('IMPORTANT')) return 'important';
  if (labelIds.includes('STARRED')) return 'starred';
  if (labelIds.includes('INBOX')) return 'inbox';

  return 'unknown';
};

const normalizeAttachment = (part: GmailMetadataPayloadPart, index: number): GmailAttachmentMetadata | null => {
  const fileName = part.filename?.trim();
  if (!fileName) return null;

  return {
    attachmentId: part.body?.attachmentId ?? `gmail-missing-attachment-id-${index}`,
    fileName,
    mimeType: part.mimeType ?? 'application/octet-stream',
    sizeBytes: part.body?.size ?? 0,
  };
};

const collectAttachments = (parts: readonly GmailMetadataPayloadPart[] | undefined): GmailAttachmentMetadata[] => {
  const attachments: GmailAttachmentMetadata[] = [];

  const visit = (part: GmailMetadataPayloadPart): void => {
    const attachment = normalizeAttachment(part, attachments.length);
    if (attachment) attachments.push(attachment);
    part.parts?.forEach(visit);
  };

  parts?.forEach(visit);
  return attachments;
};

const toEmailAttachment = (attachment: GmailAttachmentMetadata): EmailIntakeAttachmentInput => ({
  attachmentId: attachment.attachmentId,
  fileName: attachment.fileName,
  mimeType: attachment.mimeType,
  sizeBytes: attachment.sizeBytes,
});
// #endregion

// #region Public API
export function normalizeGmailMetadataToEmailInput(input: GmailMetadataNormalizerInput): EmailIntakeMessageInput {
  const { message } = input;
  const headers = message.payload?.headers;
  const labelIds = message.labelIds ?? [];
  const labelNames = message.labelNames ?? [];
  const receivedAt = toIsoDate(message.internalDate || getHeaderValue(headers, 'date'));
  const attachments = collectAttachments(message.payload?.parts).map(toEmailAttachment);
  const folder = input.folder ?? DEFAULT_FOLDER;

  return {
    messageId: message.id,
    threadId: message.threadId ?? message.id ?? 'missing-gmail-thread-id',
    provider: 'gmail',
    accountEmail: input.accountEmail,
    mailbox: input.mailbox ?? DEFAULT_MAILBOX,
    folder,
    label: labelNames.join(', ') || labelIds.join(', ') || folder,
    labelIds,
    labelNames,
    systemFolder: toSystemFolder(labelIds),
    from: getHeaderValue(headers, 'from'),
    to: splitAddressList(getHeaderValue(headers, 'to')),
    cc: splitAddressList(getHeaderValue(headers, 'cc')),
    bcc: splitAddressList(getHeaderValue(headers, 'bcc')),
    subject: getHeaderValue(headers, 'subject'),
    snippet: message.snippet ?? '',
    bodyPreview: message.snippet ?? '',
    receivedAt,
    sentAt: receivedAt,
    hasAttachments: attachments.length > 0,
    attachments,
    isRead: !labelIds.includes('UNREAD'),
    isStarred: labelIds.includes('STARRED'),
    isImportant: labelIds.includes('IMPORTANT'),
  };
}
// #endregion
