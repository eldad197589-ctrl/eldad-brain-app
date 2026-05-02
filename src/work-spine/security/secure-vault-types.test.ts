/* ============================================
   FILE: secure-vault-types.test.ts
   PURPOSE: Static contract tests for secure vault type-only boundaries.
   DEPENDENCIES: Vitest, fs, secure-vault-types
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type {
  SanitizedVaultAuditEvent,
  SecureProviderKind,
  SecureTokenRecord,
  SecureVaultRevocationStatus,
  SecureVaultScopeSet,
} from './secure-vault-types';
// #endregion

// #region Constants
const sourceText = readFileSync(new URL('./secure-vault-types.ts', import.meta.url), 'utf8');

const supportedProviders = [
  'email:gmail',
  'email:outlook',
  'email:microsoft365',
  'email:imap',
  'email:exchange',
  'email:other',
  'drive',
] satisfies SecureProviderKind[];

const forbiddenSourceStrings = [
  'crypto',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'fetch',
  'axios',
  'googleapis',
  'oauth',
];
// #endregion

// #region Fixtures
const scopeSet: SecureVaultScopeSet = {
  grantedScopes: ['mail.metadata.readonly'],
  readOnly: true,
  outboundAllowed: false,
  mutationAllowed: false,
  attachmentContentAllowed: false,
};

const tokenRecord: SecureTokenRecord = {
  recordId: 'secure-token-record-1',
  identity: {
    userId: 'user-1',
    officeWorkspaceId: 'office-1',
    provider: 'email:gmail',
    providerAccountId: 'mock-account@example.test',
  },
  scopes: scopeSet,
  encryptedAccessCredential: 'encrypted-access-placeholder',
  encryptedRefreshCredential: 'encrypted-refresh-placeholder',
  expiresAt: '2026-05-02T20:00:00.000Z',
  createdAt: '2026-05-02T19:00:00.000Z',
  updatedAt: '2026-05-02T19:00:00.000Z',
  lastRefreshedAt: '2026-05-02T19:30:00.000Z',
  status: 'active',
  revocationStatus: 'not_revoked',
};

const auditEvent: SanitizedVaultAuditEvent = {
  eventId: 'vault-audit-1',
  eventType: 'secret_stored',
  occurredAt: '2026-05-02T19:05:00.000Z',
  actorUserId: 'user-1',
  officeWorkspaceId: 'office-1',
  provider: 'email:gmail',
  providerAccountId: 'mock-account@example.test',
  scopes: ['mail.metadata.readonly'],
  sanitizedMessage: 'Secret material stored in approved vault boundary.',
};
// #endregion

// #region Tests
describe('secure vault type contracts', () => {
  it('supports generic email providers and Drive as secure provider kinds', () => {
    expect(supportedProviders).toEqual([
      'email:gmail',
      'email:outlook',
      'email:microsoft365',
      'email:imap',
      'email:exchange',
      'email:other',
      'drive',
    ]);
  });

  it('models encrypted credential fields without raw credential field names', () => {
    expect(Object.keys(tokenRecord)).toContain('encryptedAccessCredential');
    expect(Object.keys(tokenRecord)).toContain('encryptedRefreshCredential');
    expect(Object.keys(tokenRecord)).not.toContain('accessToken');
    expect(Object.keys(tokenRecord)).not.toContain('refreshToken');
    expect(Object.keys(tokenRecord)).not.toContain('authorizationCode');
    expect(tokenRecord.identity.userId).toBe('user-1');
    expect(tokenRecord.identity.officeWorkspaceId).toBe('office-1');
    expect(tokenRecord.identity.provider).toBe('email:gmail');
    expect(tokenRecord.identity.providerAccountId).toBe('mock-account@example.test');
    expect(tokenRecord.scopes.readOnly).toBe(true);
    expect(tokenRecord.scopes.outboundAllowed).toBe(false);
    expect(tokenRecord.scopes.mutationAllowed).toBe(false);
    expect(tokenRecord.scopes.attachmentContentAllowed).toBe(false);
    expect(tokenRecord.status).toBe('active');
  });

  it('models revocation state explicitly', () => {
    const revocationStates = [
      'not_revoked',
      'revoked_by_user',
      'revoked_by_admin',
      'revoked_by_provider',
      'forced_disconnect',
    ] satisfies SecureVaultRevocationStatus[];

    expect(revocationStates).toContain(tokenRecord.revocationStatus);
  });

  it('keeps sanitized audit events free of credential and raw content fields', () => {
    const auditKeys = Object.keys(auditEvent);

    expect(auditKeys).not.toContain('accessToken');
    expect(auditKeys).not.toContain('refreshToken');
    expect(auditKeys).not.toContain('authorizationCode');
    expect(auditKeys).not.toContain('rawContent');
    expect(auditKeys).not.toContain('messageBody');
    expect(auditKeys).not.toContain('attachmentContent');
    expect(auditEvent.provider).toBe('email:gmail');
    expect(auditEvent.scopes).toEqual(['mail.metadata.readonly']);
  });

  it('keeps the source contract free of implementation imports and forbidden storage/API strings', () => {
    for (const forbidden of forbiddenSourceStrings) {
      expect(sourceText).not.toContain(forbidden);
    }
    expect(sourceText).not.toContain('accessToken:');
    expect(sourceText).not.toContain('refreshToken:');
    expect(sourceText).not.toContain('authorizationCode:');
  });
});
// #endregion
