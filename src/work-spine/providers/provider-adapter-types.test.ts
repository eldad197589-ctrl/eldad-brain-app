/* ============================================
   FILE: provider-adapter-types.test.ts
   PURPOSE: Static boundary tests for inbound provider adapter type contracts.
   DEPENDENCIES: Vitest, fs, provider-adapter-types
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type {
  DriveProviderAdapter,
  DriveProviderKind,
  EmailProviderAdapter,
  EmailProviderKind,
  ProviderCapabilityDescriptor,
  ProviderReadMetadataResult,
  ProviderScopeAllowlist,
} from './provider-adapter-types';
import type { EmailSourceMetadata, GoogleDriveSourceMetadata } from '../intake/unified-intake-registry';
// #endregion

// #region Constants
const sourceText = readFileSync(new URL('./provider-adapter-types.ts', import.meta.url), 'utf8');

const emailProviders = ['gmail', 'outlook', 'microsoft365', 'imap', 'exchange', 'other'] satisfies EmailProviderKind[];

const driveProviders = ['google_drive', 'other_cloud_storage'] satisfies DriveProviderKind[];

const readOnlyCapabilities: ProviderCapabilityDescriptor = {
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
// #endregion

// #region Fixtures
const emailAllowlist: ProviderScopeAllowlist = {
  provider: 'gmail',
  readOnlyMetadataScopes: ['mail.metadata.readonly'],
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
  capability: readOnlyCapabilities,
};

const driveAllowlist: ProviderScopeAllowlist = {
  provider: 'google_drive',
  readOnlyMetadataScopes: ['drive.metadata.readonly'],
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
  capability: readOnlyCapabilities,
};

const emailAdapter: EmailProviderAdapter = {
  provider: 'gmail',
  sourceType: 'email',
  status: 'gated',
  scopes: emailAllowlist,
  capabilities: readOnlyCapabilities,
};

const driveAdapter: DriveProviderAdapter = {
  provider: 'google_drive',
  sourceType: 'google_drive',
  status: 'gated',
  scopes: driveAllowlist,
  capabilities: readOnlyCapabilities,
};
// #endregion

// #region Tests
describe('provider adapter type contracts', () => {
  it('models generic email providers and separate drive providers', () => {
    expect(emailProviders).toEqual(['gmail', 'outlook', 'microsoft365', 'imap', 'exchange', 'other']);
    expect(driveProviders).toEqual(['google_drive', 'other_cloud_storage']);
  });

  it('keeps email output normalized to sourceType email', () => {
    const result = {
      provider: 'gmail',
      account: {
        provider: 'gmail',
        providerAccountId: 'mock-account@example.test',
        accountEmail: 'mock-account@example.test',
        userId: 'user-1',
        officeWorkspaceId: 'office-1',
      },
      runId: 'run-1',
      candidates: [],
      evidenceRefs: [],
      status: 'gated',
    } satisfies ProviderReadMetadataResult<EmailSourceMetadata>;

    expect(emailAdapter.sourceType).toBe('email');
    expect(result.provider).toBe('gmail');
    expect(result.candidates).toEqual([]);
  });

  it('keeps drive output normalized to sourceType google_drive', () => {
    const result = {
      provider: 'google_drive',
      account: {
        provider: 'google_drive',
        providerAccountId: 'mock-drive-account',
        userId: 'user-1',
        officeWorkspaceId: 'office-1',
      },
      runId: 'run-2',
      candidates: [],
      evidenceRefs: [],
      status: 'gated',
    } satisfies ProviderReadMetadataResult<GoogleDriveSourceMetadata>;

    expect(driveAdapter.sourceType).toBe('google_drive');
    expect(result.provider).toBe('google_drive');
    expect(result.evidenceRefs).toEqual([]);
  });

  it('allows read-only metadata capabilities only', () => {
    expect(emailAdapter.capabilities).toEqual(readOnlyCapabilities);
    expect(driveAdapter.capabilities).toEqual(readOnlyCapabilities);
    expect(emailAdapter.scopes.readOnlyMetadataScopes).toEqual(['mail.metadata.readonly']);
    expect(driveAdapter.scopes.readOnlyMetadataScopes).toEqual(['drive.metadata.readonly']);
  });

  it('represents forbidden write, send, delete, upload, move, rename, and raw content actions as disallowed', () => {
    for (const allowlist of [emailAllowlist, driveAllowlist]) {
      expect(allowlist.forbiddenActions.send).toBe(false);
      expect(allowlist.forbiddenActions.delete).toBe(false);
      expect(allowlist.forbiddenActions.archive).toBe(false);
      expect(allowlist.forbiddenActions.modifyLabels).toBe(false);
      expect(allowlist.forbiddenActions.upload).toBe(false);
      expect(allowlist.forbiddenActions.move).toBe(false);
      expect(allowlist.forbiddenActions.rename).toBe(false);
      expect(allowlist.forbiddenActions.readRawContent).toBe(false);
      expect(allowlist.capability.canReadRawContent).toBe(false);
      expect(allowlist.capability.canSend).toBe(false);
      expect(allowlist.capability.canDelete).toBe(false);
      expect(allowlist.capability.canUpload).toBe(false);
      expect(allowlist.capability.canMove).toBe(false);
      expect(allowlist.capability.canRename).toBe(false);
    }
  });

  it('keeps provider adapter source free of live provider, storage, and operational creation strings', () => {
    for (const forbidden of forbiddenSourceStrings) {
      expect(sourceText).not.toContain(forbidden);
    }
  });
});
// #endregion
