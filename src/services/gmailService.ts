/**
 * FILE: gmailService.ts
 * PURPOSE: Gmail API integration via Google Identity Services (browser OAuth2)
 * DEPENDENCIES: Google Identity Services script (loaded in index.html)
 *
 * Per MASTER_BRAIN_INSTRUCTIONS Part 10:
 * "כל מסמך נקלט מכל ערוץ — מייל, וואטסאפ, סריקה"
 */

// #region Types

/** Parsed email summary */
export interface GmailMessage {
  /** Gmail message ID */
  id: string;
  /** Thread ID */
  threadId: string;
  /** Sender */
  from: string;
  /** Subject */
  subject: string;
  /** Date string */
  date: string;
  /** Short snippet */
  snippet: string;
  /** Has attachments */
  hasAttachments: boolean;
  /** Attachment names */
  attachments: string[];
}

/** OAuth token info */
interface TokenInfo {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

// #endregion

// #region Configuration

const STORAGE_KEY = 'brain_gmail_token';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/drive.readonly';

/** Get stored Client ID from localStorage settings */
export function getGoogleClientId(): string {
  return localStorage.getItem('brain_google_client_id') || '';
}

/** Save Client ID */
export function setGoogleClientId(clientId: string): void {
  localStorage.setItem('brain_google_client_id', clientId);
}

/** Get stored access token */
function getStoredToken(): TokenInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Store access token */
function storeToken(token: TokenInfo): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
}

/** Clear stored token */
export function clearGmailToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// #endregion

// #region OAuth2

/** Check if Gmail is connected (has valid token) */
export function isGmailConnected(): boolean {
  return !!getStoredToken();
}

/**
 * Initiate Google OAuth2 sign-in.
 * Uses Google Identity Services Token API (browser-safe).
 * @returns Promise that resolves with the access token
 */
export function signInWithGoogle(): Promise<string> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    return Promise.reject(new Error('Google Client ID לא הוגדר. עבור להגדרות.'));
  }

  return new Promise((resolve, reject) => {
    // @ts-expect-error — google.accounts loaded from external script
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response: TokenInfo & { error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        storeToken(response);
        resolve(response.access_token);
      },
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

/** Sign out — revoke token */
export function signOutGoogle(): void {
  const token = getStoredToken();
  if (token) {
    // @ts-expect-error — google.accounts loaded from external script
    google.accounts.oauth2.revoke(token.access_token);
  }
  clearGmailToken();
}

// #endregion

// #region Gmail API

/** Base URL for Gmail API */
const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me';

/** Get auth headers */
function authHeaders(): HeadersInit {
  const token = getStoredToken();
  if (!token) throw new Error('לא מחובר ל-Gmail');
  return { Authorization: `Bearer ${token.access_token}` };
}

/**
 * Fetch recent emails from Gmail inbox.
 * @param maxResults — Number of emails to fetch (default 10)
 * @returns Array of parsed email summaries
 */
export async function fetchRecentEmails(maxResults = 10): Promise<GmailMessage[]> {
  const res = await fetch(
    `${GMAIL_API}/messages?maxResults=${maxResults}&labelIds=INBOX`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error(`Gmail API error: ${res.status}`);
  const data = await res.json();

  if (!data.messages || data.messages.length === 0) return [];

  // Fetch details for each message
  const detailed = await Promise.all(
    data.messages.slice(0, maxResults).map(async (m: { id: string }) => {
      const detail = await fetch(
        `${GMAIL_API}/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: authHeaders() }
      );
      return detail.json();
    })
  );

  return detailed.map(parseGmailMessage);
}

/** Parse raw Gmail API message into our format */
function parseGmailMessage(raw: Record<string, unknown>): GmailMessage {
  const headers = ((raw.payload as Record<string, unknown>)?.headers as Array<{ name: string; value: string }>) || [];
  const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const parts = ((raw.payload as Record<string, unknown>)?.parts as Array<{ filename?: string }>) || [];
  const attachments = parts.filter(p => p.filename && p.filename.length > 0).map(p => p.filename || '');

  return {
    id: raw.id as string,
    threadId: raw.threadId as string,
    from: getHeader('From'),
    subject: getHeader('Subject'),
    date: getHeader('Date'),
    snippet: (raw.snippet as string) || '',
    hasAttachments: attachments.length > 0,
    attachments,
  };
}

// #endregion
