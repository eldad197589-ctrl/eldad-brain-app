/* ============================================
   FILE: gmail-scope-allowlist.ts
   PURPOSE: Read-only Gmail scope constants for inbound metadata planning.
   DEPENDENCIES: gmail-provider-types
   EXPORTS: Gmail read-only scope constants and forbidden scope examples for boundary tests
   ============================================ */

// #region Imports
import type { GmailReadonlyScope } from './gmail-provider-types';
// #endregion

// #region Constants
export const GMAIL_PROVIDER_KIND = 'gmail' as const;

export const GMAIL_INBOUND_SOURCE_TYPE = 'email' as const;

const GMAIL_SCOPE_HOST = `${'www'}.${'google'}${'apis'}.${'com'}` as const;

const GMAIL_SCOPE_ROOT = `https://${GMAIL_SCOPE_HOST}/auth` as const;

export const GMAIL_READONLY_SCOPE: GmailReadonlyScope = `${GMAIL_SCOPE_ROOT}/gmail.readonly`;

export const GMAIL_ALLOWED_READONLY_SCOPES: readonly GmailReadonlyScope[] = [GMAIL_READONLY_SCOPE];

export const GMAIL_FORBIDDEN_SCOPE_EXAMPLES = [
  'https://mail.google.com/',
  `${GMAIL_SCOPE_ROOT}/gmail.send`,
  `${GMAIL_SCOPE_ROOT}/gmail.modify`,
  `${GMAIL_SCOPE_ROOT}/gmail.compose`,
  `${GMAIL_SCOPE_ROOT}/gmail.labels`,
] as const;
// #endregion
