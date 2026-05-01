/* ============================================
   FILE: email-to-unified-intake.ts
   PURPOSE: Pure mapper from email metadata fixtures to unified intake candidates.
   DEPENDENCIES: unified-intake-registry types
   EXPORTS: createUnifiedIntakeFromEmailMessages and related input/result types
   ============================================ */

// #region Imports
import type {
  EmailProvider,
  EmailSourceMetadata,
  EmailSystemFolder,
  UnifiedIntakeCandidate,
  UnifiedIntakeEvidenceRef,
  UnifiedIntakeSuggestedContext,
  UnifiedIntakeWarning,
} from './unified-intake-registry';
// #endregion

// #region Input Types
export interface EmailIntakeAttachmentInput {
  attachmentId?: string;
  fileName: string;
  mimeType?: string;
  sizeBytes?: number;
}

export interface EmailIntakeMessageInput {
  messageId?: string;
  threadId: string;
  provider: EmailProvider;
  accountEmail?: string;
  mailbox: string;
  folder: string;
  label: string;
  labelIds: readonly string[];
  labelNames: readonly string[];
  systemFolder: EmailSystemFolder;
  from?: string;
  to: readonly string[];
  cc: readonly string[];
  bcc: readonly string[];
  subject?: string;
  snippet?: string;
  bodyPreview?: string;
  receivedAt: string;
  sentAt: string;
  hasAttachments: boolean;
  attachments: readonly EmailIntakeAttachmentInput[];
  isRead?: boolean;
  isStarred?: boolean;
  isImportant?: boolean;
}
// #endregion

// #region Result Types
export interface EmailToUnifiedIntakeSkippedItem {
  sourceId: string;
  reason: 'missing_message_id' | 'missing_account_email';
}

export interface EmailToUnifiedIntakeError {
  sourceId: string;
  message: string;
}

export interface EmailToUnifiedIntakeDiagnostics {
  candidateCount: number;
  evidenceCount: number;
  attachmentCount: number;
  warnings: UnifiedIntakeWarning[];
  skippedItems: EmailToUnifiedIntakeSkippedItem[];
  errors: EmailToUnifiedIntakeError[];
}

export interface EmailToUnifiedIntakeResult {
  candidates: UnifiedIntakeCandidate<EmailSourceMetadata>[];
  evidenceRefs: UnifiedIntakeEvidenceRef[];
  diagnostics: EmailToUnifiedIntakeDiagnostics;
}
// #endregion

// #region Helpers
const SUBJECT_FALLBACK = 'Email message without subject';

const stableHash = (value: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

const createCandidateId = (message: Required<Pick<EmailIntakeMessageInput, 'messageId' | 'accountEmail'>> & EmailIntakeMessageInput): string =>
  `unified-email-candidate-${stableHash(
    ['email', message.provider, message.accountEmail, message.threadId, message.messageId].join('|')
  )}`;

const createMessageEvidenceId = (candidateId: string, messageId: string): string =>
  `unified-email-message-evidence-${stableHash(['email_message', candidateId, messageId].join('|'))}`;

const createAttachmentEvidenceId = (
  candidateId: string,
  messageId: string,
  attachment: EmailIntakeAttachmentInput
): string =>
  `unified-email-attachment-evidence-${stableHash(
    ['email_attachment', candidateId, messageId, attachment.attachmentId ?? attachment.fileName].join('|')
  )}`;

const createAttachmentMetadataId = (
  candidateId: string,
  messageId: string,
  attachment: EmailIntakeAttachmentInput
): string => attachment.attachmentId ?? `missing-attachment-id-${stableHash([candidateId, messageId, attachment.fileName].join('|'))}`;

const createWarning = (warningCode: string, message: string): UnifiedIntakeWarning => ({
  warningCode,
  message,
  severity: 'warning',
});

const isMissing = (value?: string): boolean => !value || value.trim() === '';

const createMessageWarnings = (message: EmailIntakeMessageInput): UnifiedIntakeWarning[] => {
  const warnings: UnifiedIntakeWarning[] = [];

  if (isMissing(message.subject)) {
    warnings.push(createWarning('missing_subject', 'Email metadata is missing subject.'));
  }
  if (isMissing(message.from)) {
    warnings.push(createWarning('missing_sender', 'Email metadata is missing sender/from.'));
  }
  if (message.hasAttachments && message.attachments.length === 0) {
    warnings.push(createWarning('attachments_declared_but_empty', 'Email metadata says attachments exist but attachment list is empty.'));
  }
  if (
    (message.labelIds.length > 0 && message.labelNames.length === 0) ||
    (message.labelNames.length > 0 && message.labelIds.length === 0)
  ) {
    warnings.push(createWarning('incomplete_label_metadata', 'Email label ids and label names are incomplete.'));
  }
  for (const attachment of message.attachments) {
    if (isMissing(attachment.attachmentId)) {
      warnings.push(createWarning('missing_attachment_id', `Email attachment is missing attachmentId: ${attachment.fileName}`));
    }
  }

  return warnings;
};

const createSuggestedContext = (message: EmailIntakeMessageInput): UnifiedIntakeSuggestedContext[] => {
  const contexts: UnifiedIntakeSuggestedContext[] = [];
  const addHint = (label: string | undefined, source: string): void => {
    const trimmed = label?.trim();
    if (!trimmed) return;
    contexts.push({
      label: trimmed,
      source,
      confidence: 'low',
      isConfirmed: false,
    });
  };

  addHint(message.subject, 'email_subject');
  addHint(message.from, 'email_from');
  addHint(message.threadId, 'email_thread');
  addHint(message.folder || message.mailbox || message.systemFolder, 'email_folder');
  addHint(message.labelNames.join(', ') || message.label, 'email_label');

  return contexts;
};

const createMessageEvidence = (
  candidateId: string,
  message: Required<Pick<EmailIntakeMessageInput, 'messageId'>> & EmailIntakeMessageInput
): UnifiedIntakeEvidenceRef => ({
  evidenceId: createMessageEvidenceId(candidateId, message.messageId),
  sourceType: 'email',
  sourceCandidateId: candidateId,
  evidenceKind: 'email_message',
  title: message.subject?.trim() || SUBJECT_FALLBACK,
  messageId: message.messageId,
  ocrStatus: 'not_processed',
  classificationStatus: 'not_classified',
  reviewStatus: 'not_reviewed',
});

const createAttachmentEvidence = (
  candidateId: string,
  messageId: string,
  attachment: EmailIntakeAttachmentInput
): UnifiedIntakeEvidenceRef => ({
  evidenceId: createAttachmentEvidenceId(candidateId, messageId, attachment),
  sourceType: 'email',
  sourceCandidateId: candidateId,
  evidenceKind: 'email_attachment',
  title: attachment.fileName,
  fileName: attachment.fileName,
  mimeType: attachment.mimeType,
  sizeBytes: attachment.sizeBytes,
  messageId,
  ocrStatus: 'not_processed',
  classificationStatus: 'not_classified',
  reviewStatus: 'not_reviewed',
});

const createSourceMetadata = (
  candidateId: string,
  message: Required<Pick<EmailIntakeMessageInput, 'messageId' | 'accountEmail' | 'from' | 'subject'>> & EmailIntakeMessageInput
): EmailSourceMetadata => ({
  sourceType: 'email',
  provider: message.provider,
  accountEmail: message.accountEmail,
  mailbox: message.mailbox,
  folder: message.folder,
  label: message.label,
  labelIds: message.labelIds,
  labelNames: message.labelNames,
  systemFolder: message.systemFolder,
  threadId: message.threadId,
  messageId: message.messageId,
  from: message.from,
  to: message.to,
  cc: message.cc,
  bcc: message.bcc,
  subject: message.subject,
  receivedAt: message.receivedAt,
  sentAt: message.sentAt,
  hasAttachments: message.hasAttachments,
  attachmentRefs: message.attachments.map((attachment) => ({
    attachmentId: createAttachmentMetadataId(candidateId, message.messageId, attachment),
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
  })),
  isRead: message.isRead,
  isStarred: message.isStarred,
  isImportant: message.isImportant,
});

const createCandidate = (
  message: Required<Pick<EmailIntakeMessageInput, 'messageId' | 'accountEmail' | 'from' | 'subject'>> & EmailIntakeMessageInput,
  candidateId: string,
  evidenceRefs: UnifiedIntakeEvidenceRef[],
  warnings: UnifiedIntakeWarning[]
): UnifiedIntakeCandidate<EmailSourceMetadata> => ({
  candidateId,
  sourceType: 'email',
  sourceId: message.messageId,
  sourceLabel: message.subject || SUBJECT_FALLBACK,
  receivedAt: message.receivedAt,
  createdAt: message.receivedAt || message.sentAt,
  updatedAt: message.receivedAt || message.sentAt,
  candidateStatus: 'staging_candidate',
  professionalStatus: 'not_reviewed',
  matterResolutionStatus: 'unresolved',
  subjectResolutionStatus: 'unresolved',
  suggestedContext: createSuggestedContext(message),
  evidenceRefs,
  warnings,
  sourceMetadata: createSourceMetadata(candidateId, message),
});
// #endregion

// #region Public API
/**
 * Maps email metadata fixtures into unified intake candidates in memory only.
 * This function does not connect to mail providers, mutate email, classify, persist, or create professional records.
 */
export function createUnifiedIntakeFromEmailMessages(
  messages: readonly EmailIntakeMessageInput[]
): EmailToUnifiedIntakeResult {
  const candidates: UnifiedIntakeCandidate<EmailSourceMetadata>[] = [];
  const evidenceRefs: UnifiedIntakeEvidenceRef[] = [];
  const warnings: UnifiedIntakeWarning[] = [];
  const skippedItems: EmailToUnifiedIntakeSkippedItem[] = [];
  const errors: EmailToUnifiedIntakeError[] = [];

  for (const message of messages) {
    const sourceId = message.messageId || message.threadId || 'unknown-email-message';

    if (isMissing(message.messageId)) {
      skippedItems.push({ sourceId, reason: 'missing_message_id' });
      errors.push({ sourceId, message: 'Email metadata is missing messageId.' });
      continue;
    }
    if (isMissing(message.accountEmail)) {
      skippedItems.push({ sourceId, reason: 'missing_account_email' });
      errors.push({ sourceId, message: 'Email metadata is missing accountEmail.' });
      continue;
    }

    const normalizedMessage = {
      ...message,
      messageId: message.messageId,
      accountEmail: message.accountEmail,
      from: message.from ?? '',
      subject: message.subject ?? SUBJECT_FALLBACK,
    };
    const candidateId = createCandidateId(normalizedMessage);
    const messageWarnings = createMessageWarnings(message);
    warnings.push(...messageWarnings);

    const messageEvidence = createMessageEvidence(candidateId, normalizedMessage);
    const attachmentEvidenceRefs = message.attachments.map((attachment) =>
      createAttachmentEvidence(candidateId, normalizedMessage.messageId, attachment)
    );
    const candidateEvidenceRefs = [messageEvidence, ...attachmentEvidenceRefs];

    evidenceRefs.push(...candidateEvidenceRefs);
    candidates.push(createCandidate(normalizedMessage, candidateId, candidateEvidenceRefs, messageWarnings));
  }

  return {
    candidates,
    evidenceRefs,
    diagnostics: {
      candidateCount: candidates.length,
      evidenceCount: evidenceRefs.length,
      attachmentCount: evidenceRefs.filter((evidence) => evidence.evidenceKind === 'email_attachment').length,
      warnings,
      skippedItems,
      errors,
    },
  };
}
// #endregion
