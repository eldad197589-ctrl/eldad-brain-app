/* ============================================
   FILE: gmail-provider-types.ts
   PURPOSE: Pure metadata contracts for Gmail inbound read-only provider planning.
   DEPENDENCIES: None
   EXPORTS: Gmail provider identity, message metadata, attachment metadata, cursor, account, and result contracts
   ============================================ */

// #region Provider Identity
export type GmailProviderKind = 'gmail';

export type GmailInboundSourceType = 'email';

export type GmailReadonlyScope = `https://${'www'}.${'google'}${'apis'}.${'com'}/auth/gmail.readonly`;
// #endregion

// #region Metadata Contracts
export interface GmailAccountMetadata {
  readonly provider: GmailProviderKind;
  readonly sourceType: GmailInboundSourceType;
  readonly providerAccountId: string;
  readonly accountEmail: string;
  readonly accountDisplayName?: string;
  readonly userId: string;
  readonly officeWorkspaceId: string;
}

export interface GmailAttachmentMetadata {
  readonly attachmentId: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
}

export interface GmailMessageMetadata {
  readonly provider: GmailProviderKind;
  readonly sourceType: GmailInboundSourceType;
  readonly messageId: string;
  readonly threadId: string;
  readonly from: string;
  readonly to: readonly string[];
  readonly cc: readonly string[];
  readonly bcc: readonly string[];
  readonly subject: string;
  readonly receivedAt: string;
  readonly snippet: string;
  readonly labelIds: readonly string[];
  readonly labelNames: readonly string[];
  readonly attachments: readonly GmailAttachmentMetadata[];
}

export interface GmailThreadMetadata {
  readonly provider: GmailProviderKind;
  readonly sourceType: GmailInboundSourceType;
  readonly threadId: string;
  readonly messageIds: readonly string[];
  readonly lastMessageReceivedAt: string;
}
// #endregion

// #region Read Result Contracts
export interface GmailReadCursor {
  readonly nextPageToken?: string;
  readonly maxResults: number;
  readonly pageCount: number;
  readonly reachedEnd: boolean;
}

export type GmailInboundFailureReason =
  | 'expired_credential'
  | 'revoked_credential'
  | 'wrong_account'
  | 'scope_mismatch'
  | 'provider_unavailable'
  | 'partial_failure'
  | 'disabled_by_policy';

export interface GmailMetadataReadResult {
  readonly provider: GmailProviderKind;
  readonly sourceType: GmailInboundSourceType;
  readonly account: GmailAccountMetadata;
  readonly runId: string;
  readonly readonlyScope: GmailReadonlyScope;
  readonly messages: readonly GmailMessageMetadata[];
  readonly threads: readonly GmailThreadMetadata[];
  readonly cursor: GmailReadCursor;
  readonly failureReason?: GmailInboundFailureReason;
}
// #endregion
