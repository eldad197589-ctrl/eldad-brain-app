/* ============================================
   FILE: gmail-adapter.test.ts
   PURPOSE: Focused tests for the injected-fake Gmail provider adapter boundary.
   DEPENDENCIES: Vitest, fs, gmail-adapter
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { SanitizedVaultAuditEvent } from '../../security/secure-vault-types';
import type { ProviderAccountMetadata, ProviderReadMetadataRequest } from '../provider-adapter-types';
import {
  createGmailInjectedProviderAdapter,
  type GmailInjectedCredentialStatus,
  type GmailInjectedMetadataClient,
  type GmailInjectedVaultFacade,
} from './gmail-adapter';
import { GMAIL_READONLY_SCOPE } from './gmail-scope-allowlist';
// #endregion

// #region Constants
const sourceText = readFileSync(new URL('./gmail-adapter.ts', import.meta.url), 'utf8');

const forbiddenSourceStrings = [
  'googleapis',
  'axios',
  'fetch',
  'oauth',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'createWorkItem',
  'MatterRecord',
  'DocumentRef',
];

const account: ProviderAccountMetadata = {
  provider: 'gmail',
  providerAccountId: 'office@example.test',
  accountEmail: 'office@example.test',
  accountDisplayName: 'Office Gmail',
  userId: 'user-1',
  officeWorkspaceId: 'office-1',
};

const request: ProviderReadMetadataRequest = {
  provider: 'gmail',
  account,
  requestedScopes: [GMAIL_READONLY_SCOPE],
  runId: 'gmail-run-1',
  limit: 10,
};

const fakeMetadataClient: GmailInjectedMetadataClient = {
  readMetadata: () => ({
    reachedEnd: true,
    messages: [
      {
        id: 'message-1',
        threadId: 'thread-1',
        snippet: 'Metadata only preview.',
        labelIds: ['INBOX'],
        labelNames: ['Inbox'],
        internalDate: '1777776000000',
        payload: {
          headers: [
            { name: 'From', value: 'sender@example.test' },
            { name: 'To', value: 'office@example.test' },
            { name: 'Subject', value: 'Injected fake Gmail metadata' },
          ],
          parts: [
            {
              filename: 'source.pdf',
              mimeType: 'application/pdf',
              body: {
                attachmentId: 'attachment-1',
                size: 1234,
              },
            },
          ],
        },
      },
    ],
  }),
};
// #endregion

// #region Helpers
const createVault = (status: GmailInjectedCredentialStatus): GmailInjectedVaultFacade => ({
  getCredentialState: () => ({
    status,
    grantedScopes: status === 'scope_mismatch' ? [] : [GMAIL_READONLY_SCOPE],
    providerAccountId: account.providerAccountId,
  }),
});

const createAuditSink = () => {
  const events: SanitizedVaultAuditEvent[] = [];
  return {
    events,
    sink: {
      record: (event: SanitizedVaultAuditEvent): void => {
        events.push(event);
      },
    },
  };
};
// #endregion

// #region Tests
describe('Gmail injected provider adapter', () => {
  it('maps fake Gmail metadata into email Unified Intake candidates and evidence refs', () => {
    const audit = createAuditSink();
    const adapter = createGmailInjectedProviderAdapter({
      metadataClient: fakeMetadataClient,
      vault: createVault('ready'),
      auditSink: audit.sink,
      now: () => '2026-05-03T08:00:00.000Z',
    });

    const result = adapter.readMetadata(request);

    expect(adapter.provider).toBe('gmail');
    expect(adapter.sourceType).toBe('email');
    expect(result.status).toBe('ready_read_only');
    expect(result.provider).toBe('gmail');
    expect(result.candidates).toHaveLength(1);
    expect(result.evidenceRefs).toHaveLength(2);
    expect(result.candidates[0].sourceType).toBe('email');
    expect(result.candidates[0].sourceMetadata.provider).toBe('gmail');
    expect(result.candidates[0].sourceMetadata.sourceType).toBe('email');
    expect(result.evidenceRefs.map((evidence) => evidence.evidenceKind)).toEqual(['email_message', 'email_attachment']);
  });

  it('keeps attachment metadata while excluding attachment content fields', () => {
    const audit = createAuditSink();
    const adapter = createGmailInjectedProviderAdapter({
      metadataClient: fakeMetadataClient,
      vault: createVault('ready'),
      auditSink: audit.sink,
    });

    const result = adapter.readMetadata(request);
    const serialized = JSON.stringify(result);

    expect(result.evidenceRefs[1].fileName).toBe('source.pdf');
    expect(result.evidenceRefs[1].mimeType).toBe('application/pdf');
    expect(result.evidenceRefs[1].sizeBytes).toBe(1234);
    expect(serialized).not.toContain('attachmentData');
    expect(serialized).not.toContain('contentBytes');
    expect(serialized).not.toContain('bodyHtml');
    expect(serialized).not.toContain('rawMime');
  });

  it('records sanitized audit events only', () => {
    const audit = createAuditSink();
    const adapter = createGmailInjectedProviderAdapter({
      metadataClient: fakeMetadataClient,
      vault: createVault('ready'),
      auditSink: audit.sink,
      now: () => '2026-05-03T08:00:00.000Z',
    });

    adapter.readMetadata(request);

    expect(audit.events.map((event) => event.eventType)).toEqual([
      'read_run_started',
      'candidate_generated',
      'evidence_generated',
      'read_run_completed',
    ]);
    expect(JSON.stringify(audit.events)).not.toContain('accessToken');
    expect(JSON.stringify(audit.events)).not.toContain('refreshToken');
    expect(JSON.stringify(audit.events)).not.toContain('authorizationCode');
    expect(JSON.stringify(audit.events)).not.toContain('rawContent');
  });

  it('fails closed for expired, revoked, and scope mismatch fake states', () => {
    for (const status of ['expired', 'revoked', 'scope_mismatch'] satisfies GmailInjectedCredentialStatus[]) {
      const audit = createAuditSink();
      const adapter = createGmailInjectedProviderAdapter({
        metadataClient: fakeMetadataClient,
        vault: createVault(status),
        auditSink: audit.sink,
      });

      const result = adapter.readMetadata(request);

      expect(result.status).toBe('error');
      expect(result.candidates).toEqual([]);
      expect(result.evidenceRefs).toEqual([]);
      expect(audit.events.map((event) => event.eventType)).toEqual(['read_run_started', 'error']);
    }
  });

  it('keeps the adapter source free of live provider, storage, and operational creation strings', () => {
    for (const forbidden of forbiddenSourceStrings) {
      expect(sourceText).not.toContain(forbidden);
    }
  });
});
// #endregion
