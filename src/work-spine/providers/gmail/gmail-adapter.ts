/* ============================================
   FILE: gmail-adapter.ts
   PURPOSE: Gmail provider adapter with injected fake dependencies for metadata-only Unified Intake mapping.
   DEPENDENCIES: provider-adapter-types, secure-vault-types, email mapper, Gmail metadata normalizer
   EXPORTS: createGmailInjectedProviderAdapter and injected dependency contracts
   ============================================ */

// #region Imports
import { createUnifiedIntakeFromEmailMessages } from '../../intake/email-to-unified-intake';
import type { EmailSourceMetadata } from '../../intake/unified-intake-registry';
import type { SanitizedVaultAuditEvent, SecureVaultFailureReason } from '../../security/secure-vault-types';
import type {
  EmailProviderAdapter,
  ProviderAccountMetadata,
  ProviderAdapterFailureReason,
  ProviderCapabilityDescriptor,
  ProviderReadMetadataRequest,
  ProviderReadMetadataResult,
  ProviderScopeAllowlist,
} from '../provider-adapter-types';
import { normalizeGmailMetadataToEmailInput, type GmailShapedMetadataMessage } from './gmail-metadata-normalizer';
import { GMAIL_ALLOWED_READONLY_SCOPES, GMAIL_PROVIDER_KIND } from './gmail-scope-allowlist';
// #endregion

// #region Types
export type GmailInjectedCredentialStatus = 'ready' | 'expired' | 'revoked' | 'scope_mismatch' | 'wrong_account' | 'disabled';

export interface GmailInjectedCredentialState {
  readonly status: GmailInjectedCredentialStatus;
  readonly grantedScopes: readonly string[];
  readonly providerAccountId: string;
}

export interface GmailInjectedMetadataReadRequest {
  readonly account: ProviderAccountMetadata;
  readonly runId: string;
  readonly limit?: number;
  readonly since?: string;
}

export interface GmailInjectedMetadataReadResult {
  readonly messages: readonly GmailShapedMetadataMessage[];
  readonly reachedEnd: boolean;
  readonly nextPageToken?: string;
}

export interface GmailInjectedMetadataClient {
  readMetadata(request: GmailInjectedMetadataReadRequest): GmailInjectedMetadataReadResult;
}

export interface GmailInjectedVaultFacade {
  getCredentialState(account: ProviderAccountMetadata): GmailInjectedCredentialState;
}

export interface GmailInjectedAuditSink {
  record(event: SanitizedVaultAuditEvent): void;
}

export interface GmailInjectedAdapterDependencies {
  readonly metadataClient: GmailInjectedMetadataClient;
  readonly vault: GmailInjectedVaultFacade;
  readonly auditSink: GmailInjectedAuditSink;
  readonly now?: () => string;
}

export interface GmailInjectedProviderAdapter extends EmailProviderAdapter {
  readMetadata(request: ProviderReadMetadataRequest): ProviderReadMetadataResult<EmailSourceMetadata>;
}
// #endregion

// #region Constants
const READ_ONLY_CAPABILITIES: ProviderCapabilityDescriptor = {
  canReadMetadata: true,
  canReadRawContent: false,
  canSend: false,
  canDelete: false,
  canArchive: false,
  canModifyLabels: false,
  canUpload: false,
  canMove: false,
  canRename: false,
};

const GMAIL_SCOPE_ALLOWLIST: ProviderScopeAllowlist = {
  provider: GMAIL_PROVIDER_KIND,
  readOnlyMetadataScopes: GMAIL_ALLOWED_READONLY_SCOPES,
  forbiddenActions: {
    send: false,
    delete: false,
    archive: false,
    modifyLabels: false,
    upload: false,
    move: false,
    rename: false,
    readRawContent: false,
  },
  capability: READ_ONLY_CAPABILITIES,
};

const DEFAULT_NOW = (): string => '1970-01-01T00:00:00.000Z';
// #endregion

// #region Helpers
const hasExactReadonlyScope = (scopes: readonly string[]): boolean =>
  scopes.length === GMAIL_ALLOWED_READONLY_SCOPES.length &&
  GMAIL_ALLOWED_READONLY_SCOPES.every((scope) => scopes.includes(scope));

const toFailureReason = (credentialStatus: GmailInjectedCredentialStatus): ProviderAdapterFailureReason | undefined => {
  if (credentialStatus === 'ready') return undefined;
  if (credentialStatus === 'expired' || credentialStatus === 'revoked') return 'credential_unavailable';
  if (credentialStatus === 'scope_mismatch') return 'scope_mismatch';
  if (credentialStatus === 'wrong_account') return 'wrong_account';
  if (credentialStatus === 'disabled') return 'disabled_by_policy';

  return 'read_denied';
};

const toVaultFailureReason = (credentialStatus: GmailInjectedCredentialStatus): SecureVaultFailureReason | undefined => {
  if (credentialStatus === 'expired') return 'expired_credential';
  if (credentialStatus === 'revoked') return 'revoked_credential';
  if (credentialStatus === 'wrong_account') return 'wrong_account';
  if (credentialStatus === 'scope_mismatch') return 'scope_mismatch';

  return undefined;
};

const createAuditEvent = (
  request: ProviderReadMetadataRequest,
  eventType: SanitizedVaultAuditEvent['eventType'],
  occurredAt: string,
  details: {
    readonly candidateCount?: number;
    readonly evidenceCount?: number;
    readonly failureReason?: SecureVaultFailureReason;
    readonly sanitizedMessage?: string;
  } = {},
): SanitizedVaultAuditEvent => ({
  eventId: `${request.runId}-${eventType}`,
  eventType,
  occurredAt,
  actorUserId: request.account.userId,
  officeWorkspaceId: request.account.officeWorkspaceId,
  provider: 'email:gmail',
  providerAccountId: request.account.providerAccountId,
  scopes: request.requestedScopes,
  runId: request.runId,
  ...details,
});

const createClosedResult = (
  request: ProviderReadMetadataRequest,
  failureReason: ProviderAdapterFailureReason,
): ProviderReadMetadataResult<EmailSourceMetadata> => ({
  provider: GMAIL_PROVIDER_KIND,
  account: request.account,
  runId: request.runId,
  candidates: [],
  evidenceRefs: [],
  status: failureReason === 'disabled_by_policy' ? 'disabled' : 'error',
  failureReason,
});
// #endregion

// #region Public API
export function createGmailInjectedProviderAdapter(dependencies: GmailInjectedAdapterDependencies): GmailInjectedProviderAdapter {
  const now = dependencies.now ?? DEFAULT_NOW;

  return {
    provider: GMAIL_PROVIDER_KIND,
    sourceType: 'email',
    status: 'ready_read_only',
    scopes: GMAIL_SCOPE_ALLOWLIST,
    capabilities: READ_ONLY_CAPABILITIES,
    readMetadata(request) {
      dependencies.auditSink.record(createAuditEvent(request, 'read_run_started', now()));

      if (request.provider !== GMAIL_PROVIDER_KIND || request.account.provider !== GMAIL_PROVIDER_KIND) {
        const result = createClosedResult(request, 'wrong_account');
        dependencies.auditSink.record(
          createAuditEvent(request, 'error', now(), {
            failureReason: 'wrong_account',
            sanitizedMessage: 'Gmail metadata read blocked because provider/account binding did not match.',
          }),
        );
        return result;
      }

      const credentialState = dependencies.vault.getCredentialState(request.account);
      const scopeAllowed = hasExactReadonlyScope(request.requestedScopes) && hasExactReadonlyScope(credentialState.grantedScopes);
      const credentialFailure = toFailureReason(credentialState.status);

      if (credentialFailure || !scopeAllowed) {
        const failureReason = credentialFailure ?? 'scope_mismatch';
        const result = createClosedResult(request, failureReason);
        dependencies.auditSink.record(
          createAuditEvent(request, 'error', now(), {
            failureReason: toVaultFailureReason(credentialState.status) ?? 'scope_mismatch',
            sanitizedMessage: 'Gmail metadata read failed closed before provider metadata normalization.',
          }),
        );
        return result;
      }

      const metadataResult = dependencies.metadataClient.readMetadata({
        account: request.account,
        runId: request.runId,
        limit: request.limit,
        since: request.since,
      });
      const normalizedMessages = metadataResult.messages.map((message) =>
        normalizeGmailMetadataToEmailInput({
          accountEmail: request.account.accountEmail ?? request.account.providerAccountId,
          mailbox: request.account.accountDisplayName ?? 'Gmail',
          folder: 'Inbox',
          message,
        }),
      );
      const unifiedIntakeResult = createUnifiedIntakeFromEmailMessages(normalizedMessages);

      dependencies.auditSink.record(
        createAuditEvent(request, 'candidate_generated', now(), {
          candidateCount: unifiedIntakeResult.candidates.length,
          evidenceCount: unifiedIntakeResult.evidenceRefs.length,
        }),
      );
      dependencies.auditSink.record(
        createAuditEvent(request, 'evidence_generated', now(), {
          candidateCount: unifiedIntakeResult.candidates.length,
          evidenceCount: unifiedIntakeResult.evidenceRefs.length,
        }),
      );
      dependencies.auditSink.record(
        createAuditEvent(request, 'read_run_completed', now(), {
          candidateCount: unifiedIntakeResult.candidates.length,
          evidenceCount: unifiedIntakeResult.evidenceRefs.length,
          sanitizedMessage: metadataResult.reachedEnd ? 'Gmail metadata read completed.' : 'Gmail metadata read completed with more pages available.',
        }),
      );

      return {
        provider: GMAIL_PROVIDER_KIND,
        account: request.account,
        runId: request.runId,
        candidates: unifiedIntakeResult.candidates,
        evidenceRefs: unifiedIntakeResult.evidenceRefs,
        status: 'ready_read_only',
      };
    },
  };
}
// #endregion
