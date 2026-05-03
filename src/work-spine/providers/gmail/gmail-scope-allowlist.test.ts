/* ============================================
   FILE: gmail-scope-allowlist.test.ts
   PURPOSE: Boundary tests for Gmail inbound read-only scope constants.
   DEPENDENCIES: Vitest, fs, gmail-scope-allowlist
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  GMAIL_ALLOWED_READONLY_SCOPES,
  GMAIL_FORBIDDEN_SCOPE_EXAMPLES,
  GMAIL_INBOUND_SOURCE_TYPE,
  GMAIL_PROVIDER_KIND,
  GMAIL_READONLY_SCOPE,
} from './gmail-scope-allowlist';
// #endregion

// #region Constants
const sourceText = readFileSync(new URL('./gmail-scope-allowlist.ts', import.meta.url), 'utf8');

const forbiddenRuntimeStrings = [
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

// #region Tests
describe('Gmail inbound scope allowlist', () => {
  it('allows exactly the Gmail read-only scope', () => {
    expect(GMAIL_PROVIDER_KIND).toBe('gmail');
    expect(GMAIL_INBOUND_SOURCE_TYPE).toBe('email');
    expect(GMAIL_READONLY_SCOPE).toBe('https://www.googleapis.com/auth/gmail.readonly');
    expect(GMAIL_ALLOWED_READONLY_SCOPES).toEqual(['https://www.googleapis.com/auth/gmail.readonly']);
  });

  it('keeps send, delete, archive, modify, compose, and label mutation scopes out of the allowlist', () => {
    for (const forbiddenScope of GMAIL_FORBIDDEN_SCOPE_EXAMPLES) {
      expect(GMAIL_ALLOWED_READONLY_SCOPES).not.toContain(forbiddenScope);
    }
    expect(GMAIL_FORBIDDEN_SCOPE_EXAMPLES).toContain('https://mail.google.com/');
    expect(GMAIL_FORBIDDEN_SCOPE_EXAMPLES).toContain('https://www.googleapis.com/auth/gmail.send');
    expect(GMAIL_FORBIDDEN_SCOPE_EXAMPLES).toContain('https://www.googleapis.com/auth/gmail.modify');
    expect(GMAIL_FORBIDDEN_SCOPE_EXAMPLES).toContain('https://www.googleapis.com/auth/gmail.compose');
    expect(GMAIL_FORBIDDEN_SCOPE_EXAMPLES).toContain('https://www.googleapis.com/auth/gmail.labels');
  });

  it('keeps the scope file free of live provider, storage, and operational creation strings', () => {
    for (const forbidden of forbiddenRuntimeStrings) {
      expect(sourceText).not.toContain(forbidden);
    }
  });
});
// #endregion
