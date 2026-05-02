/* ============================================
   FILE: secure-vault-types.ts
   PURPOSE: Pure type contracts for inbound connector secure vault records.
   DEPENDENCIES: None
   EXPORTS: Secure vault token, identity, revocation, failure, scope, and audit contracts
   ============================================ */

// #region Provider And Status Types
export type SecureProviderKind = 'email:gmail' | 'email:outlook' | 'email:microsoft365' | 'email:imap' | 'email:exchange' | 'email:other' | 'drive';

export type SecureTokenStatus = 'active' | 'expired' | 'revoked' | 'rotation_required' | 'invalid' | 'disconnected';

export type SecureVaultRevocationStatus = 'not_revoked' | 'revoked_by_user' | 'revoked_by_admin' | 'revoked_by_provider' | 'forced_disconnect';

export type SecureVaultFailureReason =
  | 'expired_credential'
  | 'revoked_credential'
  | 'wrong_account'
  | 'wrong_workspace'
  | 'scope_mismatch'
  | 'provider_unavailable'
  | 'rotation_failed'
  | 'vault_unavailable';
// #endregion

// #region Scope And Identity Contracts
export interface SecureVaultScopeSet {
  readonly grantedScopes: readonly string[];
  readonly readOnly: true;
  readonly outboundAllowed: false;
  readonly mutationAllowed: false;
  readonly attachmentContentAllowed: false;
}

export interface SecureVaultIdentityBinding {
  readonly userId: string;
  readonly officeWorkspaceId: string;
  readonly provider: SecureProviderKind;
  readonly providerAccountId: string;
}
// #endregion

// #region Token Record Contract
export interface SecureTokenRecord {
  readonly recordId: string;
  readonly identity: SecureVaultIdentityBinding;
  readonly scopes: SecureVaultScopeSet;
  readonly encryptedAccessCredential: string;
  readonly encryptedRefreshCredential?: string;
  readonly expiresAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lastRefreshedAt?: string;
  readonly status: SecureTokenStatus;
  readonly revocationStatus: SecureVaultRevocationStatus;
  readonly revokedAt?: string;
  readonly revokedByUserId?: string;
  readonly failureReason?: SecureVaultFailureReason;
}
// #endregion

// #region Audit Contract
export interface SanitizedVaultAuditEvent {
  readonly eventId: string;
  readonly eventType:
    | 'connect_started'
    | 'connect_approved'
    | 'secret_stored'
    | 'secret_rotation'
    | 'read_run_started'
    | 'read_run_completed'
    | 'candidate_generated'
    | 'evidence_generated'
    | 'disconnect_requested'
    | 'disconnect_completed'
    | 'error';
  readonly occurredAt: string;
  readonly actorUserId: string;
  readonly officeWorkspaceId: string;
  readonly provider: SecureProviderKind;
  readonly providerAccountId: string;
  readonly scopes: readonly string[];
  readonly runId?: string;
  readonly candidateCount?: number;
  readonly evidenceCount?: number;
  readonly failureReason?: SecureVaultFailureReason;
  readonly sanitizedMessage?: string;
}
// #endregion
